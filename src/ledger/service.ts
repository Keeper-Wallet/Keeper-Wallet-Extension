import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { captureException } from '@sentry/browser';
import WavesLedger from '@waves/ledger';

import { type PreferencesAccount } from 'preferences/types';
import invariant from 'tiny-invariant';
import Background from 'ui/services/Background';

import { type LedgerSignRequest } from './types';

export enum LedgerServiceStatus {
  Disconnected = 'DISCONNECTED',
  UsedBySomeOtherApp = 'USED_BY_SOME_OTHER_APP',
  Ready = 'READY',
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class LedgerService {
  private _connectionRetryIsNeeded: boolean | undefined;
  private _ledger: WavesLedger | null | undefined;
  private _networkCode: string | null = null;
  private _signRequestPromise = Promise.resolve();
  private _status = LedgerServiceStatus.Disconnected;
  private _connectionPromise: Promise<void> | null = null;
  private _isConnecting = false;
  private _probePromise: Promise<void> | null = null;

  get ledger() {
    return this._ledger;
  }

  get status() {
    return this._status;
  }

  async connectUsb(networkCode: string) {
    // If already connecting, wait for that connection to complete
    if (this._connectionPromise) {
      return this._connectionPromise;
    }

    // If already connected to the same network, return immediately
    if (
      this._status === LedgerServiceStatus.Ready &&
      this._networkCode === networkCode
    ) {
      return Promise.resolve();
    }

    // Create connection promise with proper locking
    this._connectionPromise = this._performConnection(networkCode);

    try {
      await this._connectionPromise;
    } finally {
      this._connectionPromise = null;
    }
  }

  private async _performConnection(networkCode: string) {
    if (this._isConnecting) {
      return;
    }

    this._isConnecting = true;

    try {
      // Only disconnect if we have an existing connection
      // Don't disconnect if status is already Disconnected
      if (this._status !== LedgerServiceStatus.Disconnected) {
        await this.disconnect();
      }

      this._networkCode = networkCode;

      // WavesLedger expects the transport class, not an instance
      // It will manage transport lifecycle internally
      this._ledger = new WavesLedger({
        debug: true,
        openTimeout: 5000,
        listenTimeout: 30000,
        exchangeTimeout: 30000,
        networkCode: networkCode.charCodeAt(0),
        transport: TransportWebUSB, // Pass the class, not an instance
      });
      await delay(500);

      let retryCount = 0;
      const MAX_RETRIES = 5;

      while (
        this._ledger &&
        this._status !== LedgerServiceStatus.Ready &&
        retryCount < MAX_RETRIES
      ) {
        await this.updateStatus(networkCode);

        if (this._connectionRetryIsNeeded) {
          retryCount++;
          // Increased delay to give USB device more time to settle
          await delay(2000);
          continue;
        }

        // If no retry needed, exit the loop
        // Status will be checked after the loop
        break;
      }
    } finally {
      this._isConnecting = false;
    }
  }

  async updateStatus(networkCode: string) {
    // If already probing, wait for that to complete
    if (this._probePromise) {
      await this._probePromise;
      return;
    }

    this._probePromise = this._performProbe(networkCode);

    try {
      await this._probePromise;
    } finally {
      this._probePromise = null;
    }
  }

  private async _performProbe(networkCode: string) {
    this._connectionRetryIsNeeded = false;

    if (!this._ledger) {
      return;
    }

    if (this._networkCode !== networkCode) {
      await this.disconnect();
      return;
    }

    try {
      const probeResult = await this._ledger.probeDevice();

      if (probeResult) {
        this._status = LedgerServiceStatus.Ready;
      } else {
        this._connectionRetryIsNeeded = true;
      }
    } catch (err) {
      const msg = String(err);
      if (
        /access denied|no device selected|device was disconnected|user gesture to show a permission request|unable to release interface/i.test(
          msg,
        )
      ) {
        await this.disconnect();
      } else if (/unable to claim interface/i.test(msg)) {
        await this.disconnect(LedgerServiceStatus.UsedBySomeOtherApp);
      } else if (
        /an operation that changes the device state is in progress/i.test(msg)
      ) {
        this._connectionRetryIsNeeded = true;
        // Add extra delay for state change errors
        await delay(1000);
      } else {
        captureException(
          new Error(`ledger probeDevice failed: ${err}`, {
            cause: err instanceof Error ? err : undefined,
          }),
        );
        // Set retry for unknown errors
        this._connectionRetryIsNeeded = true;
      }
    }
  }

  private async sendSignRequest(
    selectedAccount: PreferencesAccount,
    request: LedgerSignRequest,
  ) {
    try {
      invariant(
        selectedAccount.type === 'ledger',
        'Active account is not a ledger account',
      );

      if (!ledgerService.ledger) {
        return;
      }

      const userData = await ledgerService.ledger.getUserDataById(
        selectedAccount.id,
      );

      if (userData.address !== selectedAccount.address) {
        throw new Error(
          'Account saved in keeper does not match the one in ledger',
        );
      }

      let signature: string | undefined;

      switch (request.type) {
        case 'order':
          signature = await ledgerService.ledger.signOrder(selectedAccount.id, {
            ...request.data,
            dataBuffer: new Uint8Array(request.data.dataBuffer),
          });
          break;
        case 'request':
          signature = await ledgerService.ledger.signRequest(
            selectedAccount.id,
            {
              ...request.data,
              dataBuffer: new Uint8Array(request.data.dataBuffer),
            },
          );
          break;
        case 'someData':
          signature = await ledgerService.ledger.signSomeData(
            selectedAccount.id,
            {
              ...request.data,
              dataBuffer: new Uint8Array(request.data.dataBuffer),
            },
          );
          break;
        case 'transaction':
          signature = await ledgerService.ledger.signTransaction(
            selectedAccount.id,
            {
              ...request.data,
              dataBuffer: new Uint8Array(request.data.dataBuffer),
            },
          );
          break;
      }

      if (!signature) {
        const error = new Error('Failed to get signature from Ledger device');
        (error as any).code = 'LEDGER_SIGNATURE_FAILED';
        throw error;
      }

      await Background.ledgerSignResponse(request.id, null, signature);
    } catch (err) {
      if (err) {
        if (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err as any).name === 'TransportStatusError' &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err as any).statusCode === 37120
        ) {
          await Background.ledgerSignResponse(
            request.id,
            new Error('Request is rejected on ledger'),
          );
          return;
        }
      }

      await Background.ledgerSignResponse(request.id, err);
    }
  }

  async queueSignRequest(
    selectedAccount: PreferencesAccount,
    request: LedgerSignRequest,
  ) {
    try {
      await this._signRequestPromise;
    } finally {
      this._signRequestPromise = this.sendSignRequest(selectedAccount, request);
    }

    return this._signRequestPromise;
  }

  async disconnect(status = LedgerServiceStatus.Disconnected) {
    // Don't disconnect if we're actively connecting
    // This prevents React StrictMode or component re-renders from interrupting connection
    if (this._isConnecting) {
      return;
    }

    // Wait for any pending connection to complete before disconnecting
    if (this._connectionPromise) {
      try {
        await this._connectionPromise;
      } catch (err) {
        // Ignore connection errors during disconnect
      }
    }

    // Wait for any pending probe to complete
    if (this._probePromise) {
      try {
        await this._probePromise;
      } catch (err) {
        // Ignore probe errors during disconnect
      }
    }

    const ledger = this._ledger;
    this._ledger = null;
    this._networkCode = null;
    this._status = status;
    this._isConnecting = false;
    this._probePromise = null;
    this._connectionPromise = null;

    if (ledger) {
      await ledger.disconnect();
    }
  }
}

export const ledgerService = new LedgerService();
