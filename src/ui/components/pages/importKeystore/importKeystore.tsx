import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { seedUtils } from '@waves/waves-transactions';
import { ImportKeystoreChooseFile } from './chooseFile';
import {
    ImportKeystoreChooseAccounts,
    ImportKeystoreChooseAccountsItem,
    ImportKeystoreChooseAccountsItemExisting,
} from './chooseAccounts';
import { connect } from 'react-redux';
import { user } from 'ui/actions/user';

function readFileAsText(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read the file'));
        reader.onload = () =>
            typeof reader.result === 'string' ? resolve(reader.result) : reject('Expected result to be a string');
        reader.readAsText(file);
    });
}

interface SaveUsers {
    encryptionRounds: number;
    saveUsers: string;
}

function parseKeystore(json: string): SaveUsers | null {
    try {
        const data = JSON.parse(atob(JSON.parse(json).data));

        if (typeof data.saveUsers !== 'string' || typeof data.encryptionRounds !== 'number') {
            return null;
        }

        return data;
    } catch (err) {
        return null;
    }
}

function decryptKeystore(data: SaveUsers, password): KeystoreEntry[] {
    try {
        return JSON.parse(seedUtils.decryptSeed(data.saveUsers, password, data.encryptionRounds));
    } catch (err) {
        return null;
    }
}

interface Account {
    address: string;
    lastActive: number;
    name: string;
    network: string;
    networkCode: string;
    publicKey: string;
    selected?: number;
    type: string;
}

interface KeystoreEntry {
    address: string;
    name: string;
    seed: string;
}

interface Props {
    accounts: Account[];
    addAccount: (newAccount: { hasBackup: boolean; name: string; seed: string; type: string }) => void;
}

const mapStateToProps = (store: any) => ({
    accounts: store.accounts,
});

const actions = {
    addAccount: user,
};

export const ImportKeystore = connect(
    mapStateToProps,
    actions
)(function ImportKeystore({ accounts, addAccount }: Props) {
    const { t } = useTranslation();
    const [error, setError] = React.useState<string | null>(null);
    const [keystoreAccounts, setKeystoreAccounts] = React.useState<KeystoreEntry[] | null>(null);

    if (keystoreAccounts == null) {
        return (
            <ImportKeystoreChooseFile
                error={error}
                onSubmit={async (keystoreFile, password) => {
                    setError(null);

                    try {
                        const text = await readFileAsText(keystoreFile);
                        const data = parseKeystore(text);

                        if (!data) {
                            setError(t('importKeystore.errorFormat'));
                            return;
                        }

                        const accounts = decryptKeystore(data, password);

                        if (!accounts) {
                            setError(t('importKeystore.errorDecrypt'));
                            return;
                        }

                        setKeystoreAccounts(accounts);
                    } catch (err) {
                        setError(t('importKeystore.errorUnexpected'));
                    }
                }}
            />
        );
    }

    const existingAccounts: ImportKeystoreChooseAccountsItemExisting[] = [];
    const newAccounts: ImportKeystoreChooseAccountsItem[] = [];

    keystoreAccounts.forEach(({ address, name, seed }, i) => {
        const existingAcc = accounts.find((acc) => acc.address === address);

        if (existingAcc) {
            existingAccounts.push({ address, name, existingName: existingAcc.name, seed });
        } else {
            newAccounts.push({ address, name, seed });
        }
    });

    return (
        <ImportKeystoreChooseAccounts
            existingAccounts={existingAccounts}
            newAccounts={newAccounts}
            onSubmit={(selectedAccounts) => {
                selectedAccounts.forEach((acc) => {
                    addAccount({ seed: acc.seed, type: 'seed', name: acc.name, hasBackup: true });
                });
            }}
        />
    );
});
