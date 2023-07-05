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

  get ledger() {
    return this._ledger;
  }

  get status() {
    return this._status;
  }

  async connectUsb(networkCode: string) {
    await this.disconnect();

    this._networkCode = networkCode;

    this._ledger = new WavesLedger({
      debug: true,
      openTimeout: 3000,
      listenTimeout: 30000,
      exchangeTimeout: 30000,
      networkCode: networkCode.charCodeAt(0),
      transport: TransportWebUSB,
    });

    while (this._ledger && this._status !== LedgerServiceStatus.Ready) {
      await this.updateStatus(networkCode);

      if (this._connectionRetryIsNeeded) {
        await delay(1000);
        continue;
      }
    }
  }

  async updateStatus(networkCode: string) {
    this._connectionRetryIsNeeded = false;

    if (!this._ledger) {
      return;
    }

    if (this._networkCode !== networkCode) {
      this.disconnect();
      return;
    }

    try {
      if (await this._ledger.probeDevice()) {
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
        this.disconnect();
      } else if (/unable to claim interface/i.test(msg)) {
        this.disconnect(LedgerServiceStatus.UsedBySomeOtherApp);
      } else if (
        /an operation that changes the device state is in progress/i.test(msg)
      ) {
        this._connectionRetryIsNeeded = true;
      } else {
        captureException(
          new Error(`ledger probeDevice failed: ${err}`, {
            cause: err instanceof Error ? err : undefined,
          }),
        );
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

      let signature: string;

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
    const ledger = this._ledger;
    this._ledger = null;
    this._networkCode = null;
    this._status = status;

    if (ledger) {
      await ledger.disconnect();
    }
  }
}

export const ledgerService = new LedgerService();
