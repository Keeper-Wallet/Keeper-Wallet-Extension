import { getBalanceKey } from 'balances/utils';
import clsx from 'clsx';
import { NftList } from 'nfts/nftList';
import { createNft } from 'nfts/nfts';
import { DisplayMode, type Nft } from 'nfts/types';
import { usePopupSelector } from 'popup/store/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as styles from 'ui/components/pages/styles/assets.styl';
import { SearchInput, TabPanel } from 'ui/components/ui';

import { BLOCKCHAIN_TYPES } from '../../../../../assets/constants';
import { type MultiWallet } from '../../../../../services/types';
import { sortAndFilterNfts, useUiState } from './helpers';

const PLACEHOLDERS = [...Array(4).keys()].map<Nft>(
  key =>
    ({
      id: `${key}`,
      creator: `${key}`,
    }) as Nft,
);

export function TabNfts() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const activeAccount = usePopupSelector(state => state.selectedAccount);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const currentBlockchainType = usePopupSelector(
    state => state.currentBlockchainType || BLOCKCHAIN_TYPES.WAVES,
  );
  const balances = usePopupSelector(state => state.balances);

  // Get the correct address based on blockchain type and account type
  const userAddress = useMemo(() => {
    if (!activeAccount) {
      return '';
    }

    const multiAccount = activeAccount as unknown as MultiWallet;

    // For Unit0 blockchain type, use Unit0/Ethereum address
    if (currentBlockchainType === BLOCKCHAIN_TYPES.UNIT0) {
      if (activeAccount.type === 'multichain' && multiAccount.coins?.unit0) {
        const network = currentNetwork?.toLowerCase() || 'mainnet';
        const unit0NetworkKey = network === 'stagenet' ? 'testnet' : network;
        const networks = multiAccount.coins.unit0.networks;

        if (unit0NetworkKey === 'mainnet') {
          return networks.mainnet?.address || '';
        } else if (unit0NetworkKey === 'testnet') {
          return networks.testnet?.address || '';
        }
      }
      return activeAccount.address || '';
    }

    // Waves blockchain type
    if (activeAccount.type === 'multichain' && multiAccount.coins?.waves) {
      const network = currentNetwork?.toLowerCase() || 'mainnet';
      const networks = multiAccount.coins.waves.networks;

      if (network === 'mainnet') {
        return networks.mainnet?.address || '';
      } else if (network === 'testnet') {
        return networks.testnet?.address || '';
      } else if (network === 'stagenet') {
        return networks.stagenet?.address || '';
      } else if (network === 'custom') {
        return networks.custom?.address || '';
      }
    }

    return activeAccount.address || '';
  }, [activeAccount, currentBlockchainType, currentNetwork]);

  const myNfts = useMemo(() => {
    if (!userAddress) {
      return undefined;
    }

    const key = getBalanceKey(
      currentBlockchainType,
      currentNetwork,
      userAddress,
    );

    const balanceItem = balances[key] ?? balances[userAddress];

    return balanceItem?.nfts;
  }, [balances, userAddress, currentBlockchainType, currentNetwork]);

  const nfts = usePopupSelector(state => state.nfts);

  const [filters, setFilters] = useUiState('nftFilters');
  const [term, setTerm] = [
    filters?.term,
    (value: string) => setFilters({ ...filters, term: value }),
  ];

  const nftConfig = usePopupSelector(state => state.nftConfig);

  const sortedNfts = useMemo(() => {
    const result =
      myNfts && nfts
        ? sortAndFilterNfts(
            myNfts.map(nft =>
              createNft({
                asset: nft,
                config: nftConfig,
                info: nfts?.[nft.id],
                userAddress,
              }),
            ),
            { term },
          )
        : PLACEHOLDERS;

    return result;
  }, [myNfts, nftConfig, nfts, term, userAddress]);

  const [creatorNfts, creatorCounts] = useMemo(
    () =>
      sortedNfts.reduce<[Nft[], Record<string, number>]>(
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ([creatorNfts, creatorCounts], current) => {
          const creator = current.creator;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (Object.prototype.hasOwnProperty.call(creatorCounts, creator!)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            creatorCounts[creator!] += 1;
            return [creatorNfts, creatorCounts];
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          creatorCounts[creator!] = 1;
          creatorNfts.push(current);

          return [creatorNfts, creatorCounts];
        },
        [[], {}],
      ),
    [sortedNfts],
  );

  return (
    <TabPanel className={styles.assetsPanel}>
      <div className={styles.filterContainer}>
        <SearchInput
          value={term ?? ''}
          onInput={e => setTerm(e.currentTarget.value)}
          onClear={() => setTerm('')}
        />
      </div>
      {sortedNfts.length === 0 ? (
        <div className={clsx('basic500 center margin-min-top', styles.tabInfo)}>
          {term ? (
            <>
              <div className="margin-min">{t('assets.notFoundNFTs')}</div>
              <p className="blue link" onClick={() => setFilters(null)}>
                {t('assets.resetFilters')}
              </p>
            </>
          ) : (
            t('assets.emptyNFTs')
          )}
        </div>
      ) : (
        <NftList
          mode={DisplayMode.Creator}
          nfts={creatorNfts}
          counters={creatorCounts}
          onClick={asset => {
            if (currentBlockchainType === BLOCKCHAIN_TYPES.UNIT0) {
              navigate(`/nft-collection/${asset.id}`);
            } else {
              navigate(`/nft-collection/${asset.creator}`);
            }
          }}
        />
      )}
    </TabPanel>
  );
}
