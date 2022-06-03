import * as React from 'react';
import * as styles from './nftInfo.module.css';
import { NftHeader } from 'ui/components/pages/nfts/nftHeader';
import { NftCover } from 'nfts/nftCard';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { Nft } from 'nfts/utils';
import { Button } from 'ui/components/ui';
import { PAGES } from 'ui/pageConfig';
import { AssetDetail } from 'ui/services/Background';
import { setUiState } from 'ui/actions';

export function NftInfo({
  setTab,
  onBack,
}: {
  setTab: (newTab: string) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  const nfts = useAppSelector(state => state.nfts);
  const dispatch = useAppDispatch();

  // todo remove mocks
  const asset = {
    id: 'DkZ387c4MtKySzQha3z9hpjuQbKwTPRXG24WhypW86uo',
    issueHeight: 2821226,
    issueTimestamp: 1634830900884,
    issuer: '3PEktVux2RhchSN63DsDo4b4mz4QqzKSeDv',
    issuerPublicKey: 'EBHsV7TQYm4qS2V7iZXEXwcbUdEYQyCSLEdY2AMvLPns',
    name: 'DUCK-WWWWLUCK-JU',
    description: '{"genotype": "DUCK-WWWWLUCK-JU", "crossbreeding": true}',
    decimals: 0,
    reissuable: false,
    quantity: 1,
    scripted: false,
    minSponsoredAssetFee: null,
    originTransactionId: 'DAsaD6cafmyPHMbbWhbvxb2kBrPSxd4myGYYiKwUL4Xm',
  };

  const nft = useAppSelector(state => state.uiState?.currentAsset) as Nft;

  const setCurrentAsset = React.useCallback(
    (assetId: AssetDetail) => dispatch(setUiState({ currentAsset: assetId })),
    [dispatch]
  );

  return (
    <div className={styles.root}>
      <NftHeader className={styles.header} title={nft?.displayName} />

      <div className={styles.content}>
        <NftCover className={styles.cover} nft={nft} onClick={() => void 0} />

        <div className={styles.links}>
          <a rel="noopener noreferrer" href="#" className="link clean">
            View details in Explorer
          </a>
          <a rel="noopener noreferrer" href="#" className="link clean">
            View on marketplace
          </a>
        </div>

        <div className={cn(styles.title, 'basic500', 'margin1')}>
          {t('nftInfo.creator')}
        </div>
        <div className="body1 margin2">
          <a rel="noopener noreferrer" href="#" className="link clean">
            {nft.displayCreator}
          </a>
        </div>

        {nft?.description && (
          <>
            <div className={cn(styles.title, 'basic500', 'margin1')}>
              {t('nftInfo.description')}
            </div>
            <div className="body1 margin2">{nft.description}</div>
          </>
        )}
      </div>

      <div className={styles.stickyBottomPanel}>
        <Button
          onClick={() => {
            setCurrentAsset(null);
            onBack();
          }}
        >
          {t('nftInfo.backBtn')}
        </Button>
        <Button
          type="submit"
          view="submit"
          onClick={() => {
            setCurrentAsset(nft);
            setTab(PAGES.SEND);
          }}
        >
          {t('nftInfo.sendBtn')}
        </Button>
      </div>
    </div>
  );
}
