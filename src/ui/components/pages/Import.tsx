import * as styles from './styles/import.styl';
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
                type="submit"
                onClick={() => {
                    setTab('new_account');
                }}
            >
                <Trans i18nKey="import.createNew">Create a new account</Trans>
            </Button>

            <div className={styles.importButtons}>
                <div className={styles.importButtonsItem}>
                    <Button
                        className="fullwidth"
                        type="transparent"
                        onClick={() => {
                            setTab('import_seed');
                        }}
                    >
                        <div className="body1">
                            <Trans i18nKey="import.importAccount">Import Account</Trans>
                        </div>

                        <div className="body3 disabled500 font300">
                            <Trans i18nKey="import.viaSeed">Via SEED</Trans>
                        </div>
                    </Button>
                </div>

                {/* 
                <div className={styles.importButtonsItem}>
                    <Button
                        type="transparent"
                        onClick={() => {
                            setTab('import_device');
                        }}
                    >
                        <div className="body1">
                            <Trans i18nKey="import.useHardware">Use secure hardware</Trans>
                        </div>

                        <div className="body3 disabled500 font300">
                            <Trans i18nKey="import.viaDevices">Via Ledger</Trans>
                        </div>
                    </Button>
                </div>
                */}
            </div>
        </div>
    );
}
