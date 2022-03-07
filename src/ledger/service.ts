import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import WavesLedger from '@waves/ledger';

export enum LedgerServiceStatus {
  Disconnected = 'DISCONNECTED',
  UsedBySomeOtherApp = 'USED_BY_SOME_OTHER_APP',
  Ready = 'READY',
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class LedgerService {
  private _ledger: WavesLedger;
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
      if (!this._ledger) {
        return;
      }

      try {
        if (await this._ledger.probeDevice()) {
          this._status = LedgerServiceStatus.Ready;
        } else {
          await delay(1000);
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
            await delay(1000);
          } else {
            console.error('NO MATCH FOR ERROR', err);
          }
        } else {
          console.error('NON-ERROR THROWN', err);
        }
      }
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
