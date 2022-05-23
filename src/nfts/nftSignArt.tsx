import { AssetDetail } from 'ui/services/Background';
import * as React from 'react';
import { NftCard } from 'nfts/nftCard';
import cn from 'classnames';
import * as styles from 'nfts/nftDuck.module.css';
import { Loader } from 'ui/components/ui';

const soldMask = /art_sold_(\d+)_of_(\d+)_(\w+)_(\w+)/i;

const cache = {};

export function NftSignArt({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const [isLoading, setLoading] = React.useState(true);
  const [artwork, setArtwork] = React.useState<{
    name: string;
    description: string;
    url: string;
    type: string;
    cid: string;
  }>();

  React.useEffect(() => {
    const signArtUrl =
      'https://nodes-keeper.wavesnodes.com/addresses/data/3PDBLdsUrcsiPxNbt8g2gQVoefKgzt3kJzV';

    if (!Object.hasOwnProperty.call(cache, nft.id)) {
      cache[nft.id] = fetch(
        signArtUrl +
          '?' +
          new URLSearchParams({
            matches: `nft_${nft.id}`,
          }).toString()
      )
        .then(response =>
          response.ok
            ? response.json()
            : response.text().then(text => Promise.reject(new Error(text)))
        )
        .then(entries => {
          const value = entries && entries[0].value;
          const [, num, total, artworkId, creator] = value.match(soldMask);

          return {
            num,
            total,
            artworkId,
            creator,
          };
        })
        .then(info =>
          fetch(signArtUrl, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              keys: [
                `art_name_${info.artworkId}_${info.creator}`,
                `art_desc_${info.artworkId}_${info.creator}`,
                `art_display_cid_${info.artworkId}_${info.creator}`,
                `art_type_${info.artworkId}_${info.creator}`,
              ],
            }),
          }).then(response =>
            response.ok
              ? response.json()
              : response.text().then(text => Promise.reject(new Error(text)))
          )
        );
    }

    cache[nft.id].then(details => {
      setArtwork({
        name: details[0].value,
        description: details[1].value,
        url: `https://ipfs.io/ipfs/${details[2]?.value}`,
        type: details[3].value,
        cid: details[2].value,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVideo = artwork?.type.match(/ video\/\w+ /i);

  return (
    <NftCard>
      {isVideo ? (
        <video
          autoPlay
          loop
          className={cn(styles.cover, isLoading && 'skeleton-glow')}
        >
          <source src={artwork.url} type="video/mp4" />
        </video>
      ) : (
        <img
          src={artwork && `https://ipfs.io/ipfs/${artwork?.cid}`}
          className={cn(styles.cover, isLoading && 'skeleton-glow')}
          onLoad={() => setLoading(false)}
          onClick={() => onInfoClick(nft.id)}
        />
      )}

      <div className={styles.footer}>{artwork?.name || <Loader />}</div>
    </NftCard>
  );
}
