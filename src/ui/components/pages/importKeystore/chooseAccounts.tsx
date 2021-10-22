import * as styles from './chooseAccounts.styl';
import cn from 'classnames';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import { Button } from 'ui/components/ui';

export interface ImportKeystoreChooseAccountsItem {
    address: string;
    name: string;
    seed: string;
}

export interface ImportKeystoreChooseAccountsItemExisting {
    address: string;
    existingName: string;
    name: string;
    seed: string;
}

interface Props {
    existingAccounts: ImportKeystoreChooseAccountsItemExisting[];
    newAccounts: ImportKeystoreChooseAccountsItem[];
    onSubmit: (selectedAccounts: ImportKeystoreChooseAccountsItem[]) => void;
}

export function ImportKeystoreChooseAccounts({ existingAccounts, newAccounts, onSubmit }: Props) {
    const [selected, setSelected] = React.useState<boolean[]>(() => newAccounts.map(() => true));

    return (
        <div className={styles.root}>
            <form
                className={styles.form}
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit(newAccounts.filter((_, i) => selected[i]));
                }}
            >
                <h2 className={cn(styles.centered, 'margin3', 'title1')}>
                    <Trans i18nKey="importKeystore.chooseAccountsTitle" />
                </h2>

                {newAccounts.length === 0 ? (
                    <p className={cn(styles.accountBox, 'margin2', 'body1', 'disabled500')}>
                        <Trans i18nKey="importKeystore.chooseAccountsNoNewAccounts" />
                    </p>
                ) : (
                    <>
                        <p className={cn(styles.centered, 'margin2', 'body1', 'disabled500')}>
                            <Trans i18nKey="importKeystore.chooseAccountsDesc" />
                        </p>

                        <ul className={cn(styles.accountBox, styles.accountList, 'margin2')}>
                            {newAccounts.map(({ address, name }, index) => (
                                <li key={index} className={styles.accountListItem}>
                                    <div className={styles.accountInfo} title={address}>
                                        <Avatar size={40} address={address} />

                                        <div className={styles.accountInfoText}>
                                            <div className={styles.accountName}>{name}</div>
                                        </div>
                                    </div>

                                    <input
                                        checked={selected[index]}
                                        name="selected"
                                        type="checkbox"
                                        value={index}
                                        onChange={(event) => {
                                            const newChecked = event.currentTarget.checked;

                                            setSelected((prevSelected) =>
                                                prevSelected.map((v, i) => (i === index ? newChecked : v))
                                            );
                                        }}
                                    />
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {existingAccounts.length !== 0 && (
                    <>
                        <p className={cn(styles.centered, 'margin2', 'body1', 'disabled500')}>
                            <Trans i18nKey="importKeystore.chooseAccountsExistingDesc" />
                        </p>

                        <ul className={cn(styles.accountBox, styles.accountList, 'margin2')}>
                            {existingAccounts.map(({ address, existingName, name }, index) => (
                                <li key={index} className={styles.accountListItem}>
                                    <div className={styles.accountInfo} title={address}>
                                        <Avatar size={40} address={address} />

                                        <div className={styles.accountInfoText}>
                                            <div className={styles.accountName}>{name}</div>

                                            {existingName !== name && (
                                                <div className={cn(styles.accountName, 'body3', 'disabled500')}>
                                                    <Trans
                                                        i18nKey="importKeystore.chooseAccountsExistingAccountNote"
                                                        values={{ existingName }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <div className={styles.centered}>
                    <Button type="submit">
                        <Trans i18nKey="importKeystore.chooseAccountsSubmitBtn" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
