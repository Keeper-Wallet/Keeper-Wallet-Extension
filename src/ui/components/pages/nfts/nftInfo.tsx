import * as React from 'react';
import * as styles from './nftInfo.module.css';
import { NftHeader } from 'ui/components/pages/nfts/nftHeader';
import { NftCover } from 'nfts/nftCard';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { useAppSelector } from 'ui/store';
import { createNft } from 'nfts/utils';

export function NftInfo({ setTab }: { setTab: (newTab: string) => void }) {
  const { t } = useTranslation();

  const nfts = useAppSelector(state => state.nfts);

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

  const nft = createNft(asset as any, nfts[asset.id]);

  console.log(nft);

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

        <div className={cn(styles.title, 'basic500', 'margin1')}>Creator</div>
        <div className="body1 margin1">
          <a rel="noopener noreferrer" href="#" className="link clean">
            {nft.displayCreator}
          </a>
        </div>

        {nft?.description && (
          <>
            <div className={cn(styles.title, 'basic500', 'margin1')}>
              {t('transactions.description')}
            </div>
            <div className="body1 margin1">{nft.description}</div>
          </>
        )}
      </div>
    </div>
  );
}
