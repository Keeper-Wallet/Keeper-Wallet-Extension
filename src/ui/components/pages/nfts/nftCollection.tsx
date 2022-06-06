import { NftList } from 'nfts/nftList';
import { DisplayMode } from 'nfts';
import * as React from 'react';
import { VariableSizeList } from 'react-window';
import { PAGES } from 'ui/pageConfig';
import * as styles from './nftCollection.module.css';
import { SearchInput } from 'ui/components/ui';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { AssetDetail } from 'ui/services/Background';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { setUiState } from 'ui/actions';
import { createNft, Nft } from 'nfts/utils';
import { useUiState } from 'ui/components/pages/assets/tabs/helpers';
import { Tooltip } from 'ui/components/ui/tooltip';

const PLACEHOLDERS = [...Array(4).keys()].map<AssetDetail>(
  key =>
    ({
      id: `${key}`,
    } as AssetDetail)
);

export function NftCollection({
  setTab,
}: {
  setTab: (newTab: string) => void;
}) {
  const { t } = useTranslation();
  const listRef = React.useRef<VariableSizeList>();

  const address = useAppSelector(state => state.selectedAccount.address);
  const myNfts = useAppSelector(state => state.balances[address]?.nfts);
  const nfts = useAppSelector(state => state.nfts);

  const dispatch = useAppDispatch();

  const [, setCurrentAsset] = [
    useAppSelector(state => state.uiState?.currentAsset),
    (asset: AssetDetail | Nft) => dispatch(setUiState({ currentAsset: asset })),
  ];

  const [filters, setFilters] = useUiState('nftFilters');
  const [term, setTerm] = [
    filters?.term,
    value => setFilters({ ...filters, term: value }),
  ];
  const creator = filters?.creator;

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [myNfts]);

  const getNftDetails = React.useCallback(
    nft => createNft(nft, nfts[nft.id]),
    [nfts]
  );

  const creatorNfts = myNfts
    ? myNfts.map(getNftDetails).filter(nft => nft.creator === creator)
    : PLACEHOLDERS;

  const creatorRef = React.useRef(creatorNfts[0] as Nft);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>{creatorRef.current?.displayCreator}</div>
        <div className={styles.creator}>
          <Tooltip content={t('nftInfo.creatorUrlTooltip')}>
            {props => (
              <a
                rel="noopener noreferrer"
                className="link"
                target="_blank"
                href={creatorRef.current.creatorUrl}
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

      <div className={styles.content}>
        <div className={styles.filterContainer}>
          <SearchInput
            autoFocus
            className={styles.searchInput}
            value={term ?? ''}
            onInput={e => {
              listRef.current && listRef.current.resetAfterIndex(0);
              setTerm(e.target.value);
            }}
            onClear={() => {
              listRef.current && listRef.current.resetAfterIndex(0);
              setTerm('');
            }}
          />
        </div>

        {creatorNfts.length === 0 ? (
          <div className={cn('basic500 center margin-min-top', styles.tabInfo)}>
            {term ? (
              <>
                <div className="margin-min">{t('assets.notFoundNFTs')}</div>
                <p className="blue link" onClick={() => setTerm('')}>
                  {t('assets.resetFilters')}
                </p>
              </>
            ) : (
              t('assets.emptyNFTs')
            )}
          </div>
        ) : (
          <NftList
            mode={DisplayMode.Name}
            listRef={listRef}
            nfts={creatorNfts}
            onClick={(asset: Nft) => {
              setCurrentAsset(asset);
              setTab(PAGES.NFT_INFO);
            }}
          />
        )}
      </div>
    </div>
  );
}
