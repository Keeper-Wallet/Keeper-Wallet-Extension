import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import WavesLedger from '@waves/ledger';
import { Account } from 'accounts/types';
import Background from 'ui/services/Background';
import { LedgerSignRequest } from './types';

export enum LedgerServiceStatus {
  Disconnected = 'DISCONNECTED',
  UsedBySomeOtherApp = 'USED_BY_SOME_OTHER_APP',
  Ready = 'READY',
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class LedgerService {
  private _connectionRetryIsNeeded: boolean;
  private _ledger: WavesLedger;
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

    this._ledger = new WavesLedger({
      debug: true,
      openTimeout: 3000,
      listenTimeout: 30000,
      exchangeTimeout: 30000,
      networkCode: networkCode.charCodeAt(0),
      transport: TransportWebUSB,
    });

    while (this._status !== LedgerServiceStatus.Ready) {
      await this.updateStatus();

      if (this._connectionRetryIsNeeded) {
        await delay(1000);
        continue;
      }
    }
  }

  async updateStatus() {
    this._connectionRetryIsNeeded = false;

    if (!this._ledger) {
      return;
    }

    try {
      if (await this._ledger.probeDevice()) {
        this._status = LedgerServiceStatus.Ready;
      } else {
        this._connectionRetryIsNeeded = true;
      }
    } catch (err) {
      if (err instanceof Error) {
        if (/No device selected/i.test(err.message)) {
          this.disconnect();
        } else if (/Unable to claim interface/i.test(err.message)) {
          this.disconnect(LedgerServiceStatus.UsedBySomeOtherApp);
        } else if (
          /An operation that changes the device state is in progress/i.test(
            err.message
          )
        ) {
          this._connectionRetryIsNeeded = true;
        } else {
          console.error('NO MATCH FOR ERROR', err);
        }
      } else {
        console.error('NON-ERROR THROWN', err);
      }
    }
  }

  private async sendSignRequest(
    selectedAccount: Partial<Account>,
    request: LedgerSignRequest
  ) {
    try {
      if (selectedAccount.type !== 'ledger') {
        throw new Error('Active account is not a ledger account');
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
            }
          );
          break;
        case 'someData':
          signature = await ledgerService.ledger.signSomeData(
            selectedAccount.id,
            {
              ...request.data,
              dataBuffer: new Uint8Array(request.data.dataBuffer),
            }
          );
          break;
        case 'transaction':
          signature = await ledgerService.ledger.signTransaction(
            selectedAccount.id,
            {
              ...request.data,
              dataBuffer: new Uint8Array(request.data.dataBuffer),
            }
          );
          break;
        default:
          throw new Error(`Unknown request type: "${(request as any).type}"`);
      }

      await Background.ledgerSignResponse(request.id, null, signature);
    } catch (err) {
      await Background.ledgerSignResponse(request.id, err);
    }
  }

  async queueSignRequest(
    selectedAccount: Partial<Account>,
    request: LedgerSignRequest
  ) {
    try {
      await this._signRequestPromise;
    } finally {
      this._signRequestPromise = this.sendSignRequest(selectedAccount, request);

      return this._signRequestPromise;
    }
  }

  async disconnect(status = LedgerServiceStatus.Disconnected) {
    const ledger = this._ledger;
    this._ledger = null;
    this._status = status;

    if (ledger) {
      await ledger.disconnect();
    }
  }
}

export const ledgerService = new LedgerService();
