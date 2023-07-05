import { NftCover } from 'nfts/nftCard';
import { createNft } from 'nfts/nfts';
import { usePopupSelector } from 'popup/store/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Ellipsis, Loader } from 'ui/components/ui';
import { Tooltip } from 'ui/components/ui/tooltip';
import { getAccountLink, getAssetDetailLink } from 'ui/urls';

import * as styles from './nftInfo.module.css';

export function NftInfo() {
  const navigate = useNavigate();
  const params = useParams<{ assetId: string }>();

  const { t } = useTranslation();

  const networkCode = usePopupSelector(
    state => state.selectedAccount?.networkCode,
  );

  const userAddress = usePopupSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.selectedAccount?.address!,
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const asset = usePopupSelector(state => state.assets[params.assetId!]);

  const nftInfo = usePopupSelector(state => asset && state.nfts?.[asset.id]);
  const nftConfig = usePopupSelector(state => state.nftConfig);

  const nft =
    asset &&
    createNft({
      asset,
      config: nftConfig,
      info: nftInfo,
      userAddress,
    });

  const creatorUrl =
    nft?.creatorUrl ||
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (nft?.creator && getAccountLink(networkCode!, nft.creator));
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const nftUrl = nft ? getAssetDetailLink(networkCode!, nft.id) : undefined;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>
          {!nft ? <Loader /> : nft.displayName}
        </div>
      </div>

      <div className={styles.content}>
        <NftCover className={styles.cover} nft={nft} />

        <div className={styles.links}>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href={nftUrl}
            className="link blue clean"
          >
            {t('nftInfo.viewInExplorer')}
          </a>
          {nft?.marketplaceUrl && (
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={nft.marketplaceUrl}
              className="link blue clean"
            >
              {t('nftInfo.viewOnMarketplace')}
            </a>
          )}
        </div>

        <div className={styles.fieldName}>{t('nftInfo.creator')}</div>
        <div className={styles.fieldContent}>
          <div>
            {!nft ? (
              <Loader />
            ) : nft?.creator === nft?.displayCreator ? (
              <Ellipsis text={nft?.creator} size={16} />
            ) : (
              nft?.displayCreator
            )}
          </div>
          <div>
            <Tooltip content={t('nftInfo.creatorUrlTooltip')}>
              {props => (
                // eslint-disable-next-line react/jsx-no-target-blank
                <a
                  rel="noopener noreferrer"
                  className="link"
                  target="_blank"
                  href={creatorUrl as string | undefined}
                  {...props}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.49559 0.0405541C9.2958 0.102542 9.05721 0.324067 8.96879 0.529703C8.81693 0.882835 8.90585 1.28091 9.19459 1.54062C9.45666 1.77631 9.4409 1.77456 11.3111 1.77456H12.9545L9.22767 5.50417C5.10555 9.62938 5.3422 9.36889 5.3422 9.7811C5.3422 10.4239 6.00686 10.847 6.59222 10.5768C6.74145 10.508 7.25697 10.0048 10.4927 6.76955L14.2211 3.04157V4.6855C14.2211 6.55625 14.2194 6.54048 14.455 6.80264C14.8145 7.20262 15.4101 7.20237 15.7699 6.8021C16.0168 6.52744 16.0057 6.69026 15.9962 3.47667L15.9877 0.633006L15.9188 0.504276C15.813 0.306427 15.7112 0.20081 15.5291 0.0998838L15.3624 0.00749589L12.5015 0.00152226C10.0883 -0.0035131 9.61796 0.00258563 9.49559 0.0405541ZM2.19933 1.81041C1.36456 1.96453 0.652723 2.50041 0.265555 3.26619C0.220376 3.35548 0.144587 3.55251 0.0970621 3.70404L0.0107051 3.97949L0.00195059 8.74901C-0.0040525 12.0173 0.00370149 13.5868 0.0265883 13.7355C0.116228 14.3179 0.347472 14.7624 0.792358 15.2074C1.23724 15.6524 1.68157 15.8837 2.26383 15.9734C2.41247 15.9963 3.98147 16.0041 7.24881 15.998L12.0169 15.9893L12.2922 15.9029C13.3073 15.5845 14.0063 14.7984 14.1883 13.7708C14.209 13.6541 14.2211 12.851 14.2211 11.6062C14.2211 9.70682 14.2186 9.62037 14.1589 9.46068C14.0346 9.12835 13.6925 8.89744 13.3275 8.89954C12.9818 8.90154 12.7069 9.07233 12.5378 9.39015L12.4546 9.54653L12.439 11.5638L12.4233 13.5811L12.3504 13.7293C12.3103 13.8108 12.2145 13.9329 12.1376 14.0006C11.8672 14.2387 12.2405 14.2222 7.12384 14.2222C1.91966 14.2222 2.3354 14.2435 2.04869 13.963C1.75295 13.6738 1.77724 14.1276 1.77724 8.88975C1.77724 3.75396 1.7607 4.1293 1.99879 3.85873C2.06648 3.78183 2.18854 3.68603 2.27002 3.6459L2.41819 3.57291L4.41922 3.55727L6.42026 3.54163L6.58415 3.46751C7.0139 3.27319 7.21985 2.74486 7.03194 2.31863C6.93833 2.10633 6.73923 1.91239 6.53735 1.8368C6.37723 1.77688 6.29588 1.77469 4.36332 1.77807C3.25913 1.77997 2.28531 1.79455 2.19933 1.81041Z"
                      fill="var(--color-submit400)"
                    />
                  </svg>
                </a>
              )}
            </Tooltip>
          </div>
        </div>

        {nft?.description && (
          <>
            <div className={styles.fieldName}>{t('nftInfo.description')}</div>
            <div className={styles.fieldContent}>{nft.description}</div>
          </>
        )}
      </div>

      <div className={styles.stickyBottomPanel}>
        <Button
          onClick={() => {
            navigate(-1);
          }}
        >
          {t('nftInfo.backBtn')}
        </Button>
        <Button
          type="submit"
          view="submit"
          onClick={() => {
            navigate(`/send/${nft?.id}`);
          }}
        >
          {t('nftInfo.sendBtn')}
        </Button>
      </div>
    </div>
  );
}
