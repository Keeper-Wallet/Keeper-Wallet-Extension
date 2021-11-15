import ObservableStore from 'obs-store';
import { BigNumber } from '@waves/bignumber';

export class BalanceController {
  constructor(options = {}) {
    const defaults = {
      balances: {},
      pollInterval: options.pollInterval || 10000,
    };

    this.getNetworkConfig = options.getNetworkConfig;
    this.getAccounts = options.getAccounts;
    this.getNetwork = options.getNetwork;
    this.getNode = options.getNode;
    this.getCode = options.getCode;
    this.getSelectedAccount = options.getSelectedAccount;
    this.isLocked = options.isLocked;
    this.store = new ObservableStore(
      Object.assign({}, defaults, options.initState)
    );
    this.poller = undefined;
    this.restartPolling();
  }

  restartPolling() {
    clearInterval(this.poller);
    const pollInterval = this.store.getState().pollInterval;
    this.poller = setInterval(this.updateBalances.bind(this), pollInterval);
  }

  getByUrl(url) {
    const API_BASE = this.getNode();
    url = new URL(url, API_BASE).toString();

    return fetch(url)
      .then(resp => resp.text())
      .then(txt =>
        JSON.parse(txt.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"'))
      );
  }

  async updateBalances() {
    const currentNetwork = this.getNetwork();
    const accounts = this.getAccounts().filter(
      ({ network }) => network === currentNetwork
    );
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || accounts.length < 1) return;

    const data = await Promise.all(
      accounts.map(async account => {
        try {
          const address = account.address;
          const isActiveAddress = address === activeAccount.address;

          const wavesBalances = await this.getByUrl(
            `addresses/balance/details/${address}`
          );

          const available = new BigNumber(wavesBalances.available);
          const regular = new BigNumber(wavesBalances.regular);
          const leasedOut = regular.sub(available);

          return [
            address,
            {
              available: available.toString(),
              leasedOut: leasedOut.toString(),
              network: currentNetwork,
              ...(isActiveAddress
                ? {
                    assets: Object.fromEntries(
                      (
                        await this.getByUrl(`assets/balance/${address}`)
                      ).balances.map(info => [
                        info.assetId,
                        {
                          minSponsoredAssetFee:
                            info.minSponsoredAssetFee &&
                            new BigNumber(info.minSponsoredAssetFee).toString(),
                          sponsorBalance:
                            info.sponsorBalance &&
                            new BigNumber(info.sponsorBalance).toString(),
                          balance:
                            info.balance &&
                            new BigNumber(info.balance).toString(),
                        },
                      ])
                    ),
                  }
                : undefined),
            },
          ];
        } catch (e) {
          return null;
        }
      })
    );

    const oldBalances = this.store.getState().balances;
    this.store.updateState({
      balances: Object.assign({}, oldBalances, Object.fromEntries(data)),
    });
  }
}
