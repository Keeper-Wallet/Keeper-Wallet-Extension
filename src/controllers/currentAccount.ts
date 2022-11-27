import { BigNumber } from '@waves/bignumber';
import { TransactionFromNode } from '@waves/ts-types';
import { AssetBalance, BalancesItem } from 'balances/types';
import { collectBalances } from 'balances/utils';
import { NftAssetDetail } from 'nfts/types';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { MAX_NFT_ITEMS, MAX_TX_HISTORY_ITEMS } from '../constants';
import { ExtensionStorage } from '../storage/storage';
import { AssetInfoController } from './assetInfo';
import { NetworkController } from './network';
import { NftInfoController } from './NftInfoController';
import { PreferencesController } from './preferences';
import { VaultController } from './VaultController';

const PERIOD_IN_SECONDS = 10;

export class CurrentAccountController {
  private store;
  private assetInfoController;
  private nftInfoController;
  private getAccounts;
  private getNetwork;
  private getNode;
  private getSelectedAccount;
  private isLocked;

  constructor({
    extensionStorage,
    assetInfoController,
    nftInfoController,
    getAccounts,
    getNetwork,
    getNode,
    getSelectedAccount,
    isLocked,
  }: {
    extensionStorage: ExtensionStorage;
    assetInfoController: AssetInfoController;
    nftInfoController: NftInfoController;
    getAccounts: PreferencesController['getAccounts'];
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    isLocked: VaultController['isLocked'];
  }) {
    const defaults: Partial<Record<string, BalancesItem>> = Object.fromEntries(
      getAccounts().map(acc => [`balance_${acc.address}`, undefined])
    );

    const initState = extensionStorage.getInitState(defaults);

    const emptyKeys = Object.entries(initState)
      .filter(([, value]) => value == null)
      .map(([key]) => key);

    extensionStorage.removeState(emptyKeys);

    emptyKeys.forEach(key => {
      delete initState[key];
    });

    this.store = new ObservableStore(initState);

    extensionStorage.subscribe(this.store);

    this.assetInfoController = assetInfoController;
    this.nftInfoController = nftInfoController;
    this.getAccounts = getAccounts;
    this.getNetwork = getNetwork;
    this.getNode = getNode;
    this.getSelectedAccount = getSelectedAccount;
    this.isLocked = isLocked;

    Browser.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'updateBalances') {
        this.updateBalances();
      }
    });

    this.restartPolling();
  }

  restartPolling() {
    Browser.alarms.create('updateBalances', {
      periodInMinutes: PERIOD_IN_SECONDS / 60,
    });
  }

  async #fetchWavesBalance(address: string) {
    const url = new URL(`addresses/balance/details/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    const json = (await response.json()) as {
      available: string;
      regular: string;
    };

    return json;
  }

  async #fetchAssetsBalance(address: string) {
    const url = new URL(`assets/balance/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    const json = (await response.json()) as {
      address: string;
      balances: Array<{
        assetId: string;
        balance: string;
        minSponsoredAssetFee: string | null;
        sponsorBalance: string;
      }>;
    };

    return json;
  }

  async #fetchNfts(address: string) {
    const url = new URL(
      `assets/nft/${address}/limit/${MAX_NFT_ITEMS}`,
      this.getNode()
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    const json: NftAssetDetail[] = await response.json();

    return json;
  }

  async #fetchAliases(address: string) {
    const url = new URL(`alias/by-address/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });

    const json = (await response.json()) as string[];

    return json;
  }

  async #fetchTxHistory(address: string) {
    const url = new URL(
      `transactions/address/${address}/limit/${MAX_TX_HISTORY_ITEMS}`,
      this.getNode()
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    const json = (await response.json()) as [TransactionFromNode[]];

    return json;
  }

  getAccountBalance() {
    const activeAccount = this.getSelectedAccount();
    const state = this.store.getState();
    const balances = collectBalances(state);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return balances[activeAccount!.address];
  }

  async updateBalances() {
    const currentNetwork = this.getNetwork();
    const accounts = this.getAccounts().filter(
      ({ network }) => network === currentNetwork
    );
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || accounts.length < 1 || !activeAccount) return;

    const { address } = activeAccount;

    const [wavesBalance, myAssets, myNfts, aliases, txHistory] =
      await Promise.all([
        this.#fetchWavesBalance(address),
        this.#fetchAssetsBalance(address),
        this.#fetchNfts(address),
        this.#fetchAliases(address),
        this.#fetchTxHistory(address),
      ]);

    const assets = this.assetInfoController.getAssets();

    const assetExists = (assetId: string) => !!assets[assetId];

    const isMaxAgeExceeded = (assetId: string) =>
      this.assetInfoController.isMaxAgeExceeded(assets[assetId]?.lastUpdated);

    const isSponsorshipUpdated = (balanceAsset: {
      assetId: string;
      minSponsoredAssetFee: string | null;
    }) =>
      balanceAsset.minSponsoredAssetFee !==
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      assets[balanceAsset.assetId]!.minSponsoredFee;

    const fetchAssetIds = (
      myAssets.balances.filter(
        info =>
          !assetExists(info.assetId) ||
          isSponsorshipUpdated(info) ||
          isMaxAgeExceeded(info.assetId)
      ) as Array<{ assetId: string }>
    )
      .concat(
        myNfts.filter(
          info => !assetExists(info.assetId) || isMaxAgeExceeded(info.assetId)
        )
      )
      .map(info => info.assetId)
      .concat(
        txHistory[0]
          .reduce<string[]>(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ids, tx: any) => [
              ...ids,
              tx.assetId,
              ...(tx.order1
                ? [
                    tx.order1.assetPair.amountAsset,
                    tx.order1.assetPair.priceAsset,
                  ]
                : []),
              ...(tx.payment
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  tx.payment.map((x: any) => x.assetId)
                : []),
              ...(tx.stateChanges
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  tx.stateChanges.transfers.map((x: any) => x.asset)
                : []),
            ],
            []
          )
          .filter(
            assetId =>
              !!assetId && !assetExists(assetId) && isMaxAgeExceeded(assetId)
          )
      );

    await Promise.all([
      this.assetInfoController.updateAssets(fetchAssetIds),
      this.nftInfoController.updateNfts(myNfts),
    ]);

    const available = new BigNumber(wavesBalance.available);
    const regular = new BigNumber(wavesBalance.regular);
    const leasedOut = regular.sub(available);

    const balance: BalancesItem = {
      aliases,
      available: available.toString(),
      leasedOut: leasedOut.toString(),
      network: currentNetwork,
      txHistory: txHistory[0],

      assets: myAssets.balances.reduce<Record<string, AssetBalance>>(
        // eslint-disable-next-line @typescript-eslint/no-shadow
        (assets, info) => {
          assets[info.assetId] = {
            minSponsoredAssetFee: info.minSponsoredAssetFee,
            sponsorBalance: info.sponsorBalance,
            balance: info.balance,
          };
          return assets;
        },
        {
          WAVES: {
            minSponsoredAssetFee: '100000',
            sponsorBalance: wavesBalance.available,
            balance: wavesBalance.available,
          },
        }
      ),

      nfts: myNfts.map(nft => ({
        id: nft.assetId,
        name: nft.name,
        precision: nft.decimals,
        description: nft.description,
        height: nft.issueHeight,
        timestamp: new Date(nft.issueTimestamp).toJSON() as unknown as Date,
        sender: nft.issuer,
        quantity: nft.quantity,
        reissuable: nft.reissuable,
        hasScript: nft.scripted,
        displayName: nft.name,
        minSponsoredFee: nft.minSponsoredAssetFee ?? undefined,
        originTransactionId: nft.originTransactionId,
        issuer: nft.issuer,
      })),
    };

    this.store.updateState({
      [`balance_${address}`]: balance,
    });
  }
}
