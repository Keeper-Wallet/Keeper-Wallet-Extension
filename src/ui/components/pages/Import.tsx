import * as styles from './styles/import.styl';
import { seedUtils } from '@waves/waves-transactions';
import cn from 'classnames';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button } from '../ui';
import * as wavesKeeperLock from '../../assets/img/waves-keeper-lock.svg';

interface Props {
    setTab: (newTab: string) => void;
}

export function Import({ setTab }: Props) {
    return (
        <div className={styles.root}>
            <img className={styles.importIcon} src={wavesKeeperLock} alt="" width={220} height={200} />

            <Button
                id="createNewAccount"
                type="submit"
                onClick={() => {
                    setTab('new_account');
                }}
            >
                <Trans i18nKey="import.createNew" />
            </Button>

            <div className={cn('body1', 'disabled500', 'font300', styles.separator)}>
                <Trans i18nKey="import.importVia">Or import via</Trans>
            </div>

            <div>
                <div className={styles.importButtonsItem}>
                    <Button
                        className="fullwidth"
                        data-testid="importSeed"
                        type="transparent"
                        onClick={() => {
                            setTab('import_seed');
                        }}
                    >
                        <div className="body1">
                            <Trans i18nKey="import.viaSeed" />
                        </div>
                    </Button>
                </div>

                <div className={styles.importButtonsItem}>
                    <Button
                        className="fullwidth"
                        data-testid="importKeystore"
                        type="transparent"
                        onClick={() => {
                            setTab('import_keystore');
                        }}
                    >
                        <div className="body1">
                            <Trans i18nKey="import.viaKeystore" />
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
