import { isNotNull } from '_core/isNotNull';
import { BigNumber } from '@waves/bignumber';
import { type AssetBalance, type BalancesItem } from 'balances/types';
import { collectBalances } from 'balances/utils';
import { type NftAssetDetail, NftVendorId } from 'nfts/types';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { MAX_NFT_ITEMS } from '../constants';
import { type ExtensionStorage } from '../storage/storage';
import { type AssetInfoController } from './assetInfo';
import { type NetworkController } from './network';
import { type NftInfoController } from './NftInfoController';
import { type PreferencesController } from './preferences';
import { type VaultController } from './VaultController';
import { BalanceService } from './services/balanceService';
import { TransactionContext } from './strategies/contexts/TransactionContext';

const PERIOD_IN_SECONDS = 10;

export class CurrentAccountController {
  private store;
  private assetInfoController;
  private nftInfoController;
  private getLegacyFormatAccounts;
  private getNetwork;
  private getNode;
  private getSelectedAccount;
  private isLocked;
  private balanceService;
  private getBlockchainType;
  private transactionContext: TransactionContext;

  constructor({
    extensionStorage,
    assetInfoController,
    nftInfoController,
    getAccounts,
    getLegacyFormatAccounts,
    getNetwork,
    getNode,
    getSelectedAccount,
    isLocked,
    getBlockchainType,
  }: {
    extensionStorage: ExtensionStorage;
    assetInfoController: AssetInfoController;
    nftInfoController: NftInfoController;
    getAccounts: PreferencesController['getAccounts'];
    getLegacyFormatAccounts: PreferencesController['getLegacyFormatAccounts'];
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    isLocked: VaultController['isLocked'];
    getBlockchainType: NetworkController['getCurrentBlockchainType'];
  }) {
    const defaults: Partial<Record<string, BalancesItem>> = Object.fromEntries(
      getLegacyFormatAccounts().map(acc => [
        `balance_${acc.address}`,
        undefined,
      ]),
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
    this.getLegacyFormatAccounts = getLegacyFormatAccounts;
    this.getNetwork = getNetwork;
    this.getNode = getNode;
    this.getSelectedAccount = getSelectedAccount;
    this.isLocked = isLocked;
    this.balanceService = new BalanceService(assetInfoController);
    this.getBlockchainType = getBlockchainType;
    
    // Initialize transaction context with current blockchain type
    this.transactionContext = new TransactionContext(
      this.getBlockchainType(),
      this.getNode
    );

    Browser.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'updateCurrentAccountBalance') {
        this.updateCurrentAccountBalance();
      }
    });

    this.restartPolling();
  }

  restartPolling() {
    Browser.alarms.create('updateCurrentAccountBalance', {
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

    if (!response.ok) {
      throw response;
    }

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

    if (!response.ok) {
      throw response;
    }

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
      this.getNode(),
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw response;
    }

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

    if (!response.ok) {
      throw response;
    }

    const json = (await response.json()) as string[];

    return json;
  }


  getAccountBalance() {
    const selectedAccount = this.getSelectedAccount();
    const state = this.store.getState();
    const balances = collectBalances(state);

    return selectedAccount && balances[selectedAccount.address];
  }

  async updateCurrentAccountBalance() {
    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getBlockchainType();
    const accounts = this.getLegacyFormatAccounts().filter(
      ({ network }) => network === currentNetwork,
    );
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || accounts.length < 1 || !activeAccount) {
      return;
    }

    const { address } = activeAccount;

    // Always try to fetch Waves balance for Waves networks
    if (!this.balanceService.isUnit0Network(currentBlockchainType)) {
      try {
        // Update transaction strategy for current blockchain type
        this.transactionContext.setStrategy(currentBlockchainType, this.getNode);
        
        const [wavesBalance, myAssets, myNfts, aliases, txHistoryResult] =
          await Promise.all([
            this.#fetchWavesBalance(address),
            this.#fetchAssetsBalance(address),
            this.#fetchNfts(address),
            this.#fetchAliases(address),
            this.transactionContext.fetchTransactions(address, currentNetwork),
          ]);
        
        const txHistory = txHistoryResult.transactions;

        const assets = this.assetInfoController.getAssets();

        const assetExists = (assetId: string) => !!assets[assetId];

        const isMaxAgeExceeded = (assetId: string) =>
          this.assetInfoController.isMaxAgeExceeded(
            assets[assetId]?.lastUpdated,
          );

        const isSponsorshipUpdated = (balanceAsset: {
          assetId: string;
          minSponsoredAssetFee: string | null;
        }) =>
          balanceAsset.minSponsoredAssetFee !==
          assets[balanceAsset.assetId]?.minSponsoredFee;

        const fetchAssetIds = (
          myAssets.balances.filter(
            info =>
              !assetExists(info.assetId) ||
              isSponsorshipUpdated(info) ||
              isMaxAgeExceeded(info.assetId),
          ) as Array<{ assetId: string }>
        )
          .concat(
            myNfts.filter(
              info =>
                !assetExists(info.assetId) || isMaxAgeExceeded(info.assetId),
            ),
          )
          .map(info => info.assetId)
          .concat(
            txHistory
              .flatMap(tx => [
                ...('assetId' in tx ? [tx.assetId] : []),
                ...('order1' in tx
                  ? [
                      tx.order1.assetPair.amountAsset,
                      tx.order1.assetPair.priceAsset,
                    ]
                  : []),
                ...('payment' in tx
                  ? tx.payment?.map(x => x.assetId) ?? []
                  : []),
                ...('stateChanges' in tx
                  ? tx.stateChanges.transfers.map(x => x.asset)
                  : []),
              ])
              .filter(isNotNull)
              .filter(
                assetId => !assetExists(assetId) && isMaxAgeExceeded(assetId),
              ),
          );

        await Promise.all([
          this.assetInfoController.updateAssets(fetchAssetIds, {
            ignoreCache: true,
          }),
          this.nftInfoController.updateNfts(myNfts),
        ]);

        const wavesAssetBalance: AssetBalance = {
          minSponsoredAssetFee: '100000',
          sponsorBalance: wavesBalance.available,
          balance: wavesBalance.available,
        };

        const balance: BalancesItem = {
          aliases: aliases || [],
          available: wavesBalance.available,
          regular: wavesBalance.regular,
          leasedOut: new BigNumber(wavesBalance.regular)
            .sub(wavesBalance.available)
            .toString(),
          network: currentNetwork,
          txHistory,

          assets: Object.fromEntries([
            ['WAVES', wavesAssetBalance],
            ...myAssets.balances.map(info => {
              const assetBalance: AssetBalance = {
                minSponsoredAssetFee: info.minSponsoredAssetFee,
                sponsorBalance: info.sponsorBalance,
                balance: info.balance,
              };

              return [info.assetId, assetBalance];
            }),
          ]),
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
      } catch (error) {
        console.error('Error fetching Waves balance:', error);
        return;
      }
    } else {
      try {
        // Update transaction strategy for Unit0
        this.transactionContext.setStrategy(currentBlockchainType, this.getNode);
        
        // For Unit0 networks, fetch Unit0 balances and transactions
        const txHistoryResult = await this.transactionContext.fetchTransactions(address, currentNetwork);
        const balance = await this.balanceService.fetchUnit0Balance(address, currentNetwork, txHistoryResult.transactions);
        
        // Add transaction history to balance
        balance.txHistory = txHistoryResult.transactions;

        // Process Unit0 NFTs through the NFT vendor system
        if (balance.nfts && balance.nfts.length > 0) {
          // Convert Unit0 NFTs to NftAssetDetail format for vendor processing
          const unit0NftsForProcessing = balance.nfts.map(nft => ({
            assetId: nft.id,
            decimals: 0 as const,
            description: nft.description,
            issueHeight: nft.height,
            vendor: NftVendorId.Unit0,
            creator: nft.creator,
            tokenId: nft.tokenId,
            issueTimestamp:
              nft.timestamp instanceof Date
                ? nft.timestamp.getTime()
                : new Date(nft.timestamp).getTime(),
            issuer: nft.issuer,
            issuerPublicKey: '', // Unit0 doesn't have this concept
            minSponsoredAssetFee: null,
            name: nft.name,
            originTransactionId: nft.originTransactionId || '',
            quantity: '1' as const,
            reissuable: false as const,
            scripted: nft.hasScript || false,
          }));

          // Process Unit0 NFTs through vendor system
          await this.nftInfoController.updateNfts(unit0NftsForProcessing, true);
        }

        this.store.updateState({
          [`balance_${address}`]: balance,
        });
      } catch (error) {
        console.error('Error fetching Unit0 balance:', error);
      }
    }
  }

  async updateOtherAccountsBalances() {
    const url = new URL('addresses/balance', this.getNode());
    const addresses = this.getLegacyFormatAccounts().map(
      account => account.address,
    );

    while (addresses.length > 0) {
      const splicedAddresses = addresses.splice(0, 1000);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json; large-significand-format=string',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: splicedAddresses,
        }),
      });

      const regularBalances = (await response.json()) as Array<{
        id: string;
        balance: string;
      }>;

      const storeState = this.store.getState();

      const balances = Object.fromEntries(
        regularBalances.map(regularBalance => {
          const balanceKey = `balance_${regularBalance.id}`;
          const existingBalance = storeState[balanceKey];

          const balance = {
            ...existingBalance,
            regular: regularBalance.balance,
          };

          return [balanceKey, balance];
        }),
      );

      this.store.updateState(balances);
    }
  }
}
