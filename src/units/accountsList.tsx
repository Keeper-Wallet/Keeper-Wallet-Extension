import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import React from 'react';
import { selectAccount } from 'store/actions/localState';

export const AccountsList: React.FC = () => {
  const dispatch = usePopupDispatch();
  const accounts = usePopupSelector(state => state.allNetworksAccounts);
  const activeAccount = usePopupSelector(state => state.selectedAccount);

  const handleSelectAccount = (account: PreferencesAccount) => {
    dispatch(selectAccount(account));
  };

  if (!accounts.length) {
    return <div style={{ padding: 16 }}>No accounts</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>Accounts list:</h3>
      <div>
        {accounts.map(account => {
          const isActive = activeAccount && activeAccount.id === account.id;
          return (
            <p
              key={account.id}
              style={{
                border: isActive ? '2px solid orange' : '1px solid gray',
                marginBottom: 12,
                padding: 12,
              }}
              onClick={() => handleSelectAccount(account)}
            >
              <div>
                <b>{account.name}</b>
                {account.accountType === 'multichain'
                  ? ' (multichain)'
                  : ` (${account.type})`}
                {isActive && (
                  <span style={{ color: 'orange', marginLeft: 8 }}>
                    (active)
                  </span>
                )}
              </div>
              {account.accountType === 'multichain' ? (
                <>
                  <div style={{ fontSize: 12, color: 'gray' }}>
                    ID: {account.id}
                  </div>
                  <div style={{ fontSize: 12, color: 'gray' }}>
                    Chains:
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {Object.entries(account.accounts).map(([chain, data]) => (
                        <li key={chain}>
                          <b>{chain}</b>: {data.address}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: 'gray' }}>
                    {account.address}
                  </div>
                  <div style={{ fontSize: 12, color: 'gray' }}>
                    Network: {account.network}
                  </div>
                  <div style={{ fontSize: 12, color: 'gray' }}>
                    Type: {account.type}
                  </div>
                </>
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
};
