import { useDebouncedValue } from '_core/useDebouncedValue';
import { base58Decode } from '@keeper-wallet/waves-crypto';
import { WavesDomainsClient } from '@waves-domains/client';
import clsx from 'clsx';
import { isAddressString } from 'messages/utils';
import { NetworkName } from 'networks/types';
import { usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { icontains } from 'ui/components/pages/assets/helpers';

import { Button, type InputProps, Modal, SearchInput } from '..';
import { AddressTooltip } from '../Address/Tooltip';
import { AddressInput } from './Input';
import * as styles from './SuggestInput.module.css';

const ALIAS_RE = /^alias:\w:/i;

interface WavesDomainsResolveResult {
  name: string;
  address: string;
}

interface SuggestProps {
  className?: string;
  paddingRight?: number;
  paddingLeft?: number;
  accounts: PreferencesAccount[];
  addresses: Array<[string, string]>;
  setValue: (value: string) => void;
  setAddress: (value: string) => void;
  setShowSuggest: (show: boolean) => void;
  wdResolveResult?: WavesDomainsResolveResult | null;
  onSuggest?: (value: string) => void;
}

function Suggest({
  className,
  paddingRight,
  paddingLeft,
  accounts,
  addresses,
  setValue,
  setAddress,
  setShowSuggest,
  wdResolveResult,
  onSuggest,
}: SuggestProps) {
  const { t } = useTranslation();

  return (
    <div className={`${styles.suggest} ${className}`}>
      {accounts.length !== 0 && (
        <>
          <p className={styles.title} style={{ paddingRight, paddingLeft }}>
            {t('address.wallets')}
          </p>
          {accounts.map(account => (
            <div
              className={styles.item}
              style={{ paddingRight, paddingLeft }}
              key={account.address}
              onMouseDown={() => {
                setValue(account.name);
                setAddress(account.address);
                setShowSuggest(false);

                if (onSuggest) {
                  onSuggest(account.address);
                }
              }}
            >
              <p className={styles.name}>{account.name}</p>
              <AddressTooltip address={account.address} />
            </div>
          ))}
        </>
      )}
      {addresses.length !== 0 && (
        <>
          <p className={styles.title} style={{ paddingRight, paddingLeft }}>
            {t('address.title')}
          </p>
          {addresses.map(([address, name]) => (
            <div
              className={styles.item}
              style={{ paddingRight, paddingLeft }}
              key={address}
              onMouseDown={() => {
                setValue(name);
                setAddress(address);
                setShowSuggest(false);

                if (onSuggest) {
                  onSuggest(address);
                }
              }}
            >
              <p className={styles.name}>{name}</p>
              <AddressTooltip address={address} />
            </div>
          ))}
        </>
      )}
      {wdResolveResult && (
        <>
          <p className={styles.title} style={{ paddingRight, paddingLeft }}>
            Waves domains
          </p>

          <div
            className={clsx(styles.item, styles.item_wavesDomains)}
            style={{ paddingRight, paddingLeft }}
            onMouseDown={() => {
              setAddress(wdResolveResult.address);
              setShowSuggest(false);

              if (onSuggest) {
                onSuggest(wdResolveResult.address);
              }
            }}
          >
            <p className={styles.name}>{wdResolveResult.name}</p>
            <AddressTooltip address={wdResolveResult.address} />
          </div>
        </>
      )}
    </div>
  );
}

interface ModalProps {
  accounts: PreferencesAccount[];
  addresses: Array<[string, string]>;
  setValue: (value: string) => void;
  setAddress: (value: string) => void;
  setShowSuggest: (show: boolean) => void;
  onSuggest?: (value: string) => void;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

export function SuggestModal(props: ModalProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const accounts = useMemo(
    () =>
      props.accounts.filter(
        account =>
          icontains(account.address, search) || icontains(account.name, search),
      ),
    [props.accounts, search],
  );
  const addresses = useMemo(
    () =>
      props.addresses.filter(
        ([address, name]) =>
          icontains(address, search) || icontains(name, search),
      ),
    [props.addresses, search],
  );

  return (
    <Modal animation={Modal.ANIMATION.FLASH} showModal={props.showModal}>
      <div className="modal cover">
        <div className={styles.modalContent}>
          <Button
            className="modal-close"
            type="button"
            view="transparent"
            onClick={() => {
              props.setShowModal(false);
            }}
          />
          <p className={`headline2Bold ${styles.modalTitle}`}>
            {t('address.select')}
          </p>
          <SearchInput
            className={styles.modalSearchInput}
            value={search}
            autoFocus
            onInput={e => setSearch(e.currentTarget.value)}
            onClear={() => setSearch('')}
          />
          {accounts.length > 0 ? (
            <Suggest
              className={styles.modalSuggest}
              paddingLeft={24}
              paddingRight={24}
              accounts={accounts}
              addresses={addresses}
              setValue={props.setValue}
              setAddress={props.setAddress}
              setShowSuggest={props.setShowSuggest}
              onSuggest={value => {
                props.setShowModal(false);

                if (props.onSuggest) {
                  props.onSuggest(value);
                }
              }}
            />
          ) : (
            <p className={styles.notFound}>{t('address.notFound')}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export type Props = Extract<InputProps, { multiLine?: false }> & {
  onSuggest: (value: string) => void;
};

export function AddressSuggestInput({ onSuggest, ...props }: Props) {
  const { t } = useTranslation();

  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const chainId = usePopupSelector(
    state =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state.selectedAccount?.networkCode!.charCodeAt(0),
  );
  const accounts = usePopupSelector(state => state.accounts);
  const addresses = usePopupSelector<Record<string, string>>(state =>
    Object.entries(state.addresses).reduce((acc, [address, name]) => {
      if (!isAddressString(address, chainId)) {
        return acc;
      }

      return base58Decode(address)[1] === chainId
        ? { ...acc, [address]: name }
        : acc;
    }, {}),
  );

  const [value, setValue] = useState('');
  const [address, setAddress] = useState('');

  const foundAccounts = useMemo(
    () =>
      value
        ? accounts.filter(
            account =>
              icontains(account.address, value) ||
              icontains(account.name, value),
          )
        : [],
    [accounts, value],
  );
  const foundAddresses = useMemo<Record<string, string>>(
    () =>
      value
        ? Object.entries(addresses).reduce(
            // eslint-disable-next-line @typescript-eslint/no-shadow
            (acc, [address, name]) =>
              icontains(address, value) || icontains(name, value)
                ? { ...acc, [address]: name }
                : acc,
            {},
          )
        : {},
    [addresses, value],
  );

  const [showSuggest, setShowSuggest] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const debouncedValue = useDebouncedValue(value, 500);
  const [wdResolveResult, setWdResolveResult] =
    useState<WavesDomainsResolveResult | null>(null);
  useEffect(() => {
    if (
      ![NetworkName.Mainnet, NetworkName.Testnet].includes(currentNetwork) ||
      !debouncedValue
    ) {
      setWdResolveResult(null);
      return;
    }

    const wdClient = new WavesDomainsClient({
      network: currentNetwork === NetworkName.Mainnet ? 'mainnet' : 'testnet',
    });

    wdClient.resolve(debouncedValue).then(resolvedAddress => {
      setWdResolveResult(
        resolvedAddress
          ? { name: debouncedValue, address: resolvedAddress }
          : null,
      );
    });
  }, [currentNetwork, debouncedValue]);

  const isAlias = useMemo(() => ALIAS_RE.test(value), [value]);

  const freshWdResolveResult =
    wdResolveResult?.name === value ? wdResolveResult : null;

  const overlaidTextRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div className={styles.root}>
        <div className={styles.inputWithOverlaidText}>
          <AddressInput
            {...props}
            autoComplete="off"
            autoFocus
            className={styles.addressInput}
            spellCheck={false}
            value={value}
            onBlur={() => {
              setShowSuggest(false);
            }}
            onChange={event => {
              setValue(event.currentTarget.value);
              setAddress('');

              if (props.onChange) {
                props.onChange(event);
              }
            }}
            onFocus={() => {
              setShowSuggest(true);
            }}
            onScroll={event => {
              const overlaidText = overlaidTextRef.current;

              if (!overlaidText) {
                return;
              }

              overlaidText.scrollLeft = event.currentTarget.scrollLeft;
            }}
          />

          <div
            ref={overlaidTextRef}
            className={styles.overlaidText}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: isAlias
                ? value.replace(
                    ALIAS_RE,
                    `<mark class=${styles.aliasMark}>$&</mark>`,
                  )
                : freshWdResolveResult
                ? `<mark class=${styles.wavesDomainsMark}>${freshWdResolveResult.name}</mark>`
                : value,
            }}
          />
        </div>

        <button
          className={styles.buttonIcon}
          onClick={() => {
            setShowSuggestModal(true);
          }}
          type="button"
        />

        <SuggestModal
          showModal={showSuggestModal}
          setShowModal={setShowSuggestModal}
          accounts={accounts}
          addresses={Object.entries(addresses).sort(
            ([, firstName], [, secondName]) =>
              firstName.localeCompare(secondName),
          )}
          setValue={setValue}
          setAddress={setAddress}
          setShowSuggest={setShowSuggest}
          onSuggest={onSuggest}
        />

        {address && (
          <AddressTooltip className={styles.tooltip} address={address} />
        )}

        {showSuggest && (
          <Suggest
            accounts={foundAccounts}
            addresses={Object.entries(foundAddresses).sort(
              ([, firstName], [, secondName]) =>
                firstName.localeCompare(secondName),
            )}
            setValue={setValue}
            setAddress={setAddress}
            setShowSuggest={setShowSuggest}
            wdResolveResult={freshWdResolveResult}
            onSuggest={onSuggest}
          />
        )}
      </div>

      {isAlias && (
        <p className={styles.warningAlias}>{t('address.warningAlias')}</p>
      )}
    </>
  );
}
