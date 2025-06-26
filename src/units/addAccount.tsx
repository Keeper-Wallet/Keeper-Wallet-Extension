import { nanoid } from 'nanoid';
import { NetworkName, type NetworkProfile } from 'networks/types';
import { usePopupDispatch } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useState } from 'react';
import { selectAccount } from 'store/actions/localState';
import Background from 'ui/services/Background';

import { NETWORKS } from '../networks/config';

export default function AddAccount() {
  const [mode, setMode] = useState<'waves' | 'multicoin'>('waves');
  const [seed, setSeed] = useState('');
  const [name, setName] = useState('');
  const [network, setNetwork] = useState<NetworkProfile>(NetworkName.Mainnet);
  const [result, setResult] = useState<string | null>(null);
  const dispatch = usePopupDispatch();

  const handleAdd = async () => {
    setResult(null);
    try {
      const normalized = seed.trim().replace(/\s+/g, ' ');
      if (normalized.length < 12) {
        setResult('Seed phrase too short');
        return;
      }
      if (name && name.length < 4) {
        setResult('Name too short');
        return;
      }
      if (mode === 'multicoin') {
        if (!name) {
          setResult('Name required for multicoin');
          return;
        }
        const input = {
          accountType: 'multichain' as const,
          type: 'seed' as const,
          seed: normalized,
          name,
          id: nanoid(),
        };
        await Background.addWallet(input);
        setResult('Success!');
        setSeed('');
        setName('');
        return;
      }
      // waves
      const networkConfig = NETWORKS.find(n => n.network === 'waves');
      const profileConfig = networkConfig?.params[network as NetworkProfile];
      const networkCode = String(profileConfig?.chainId ?? '');
      const input = {
        accountType: 'waves' as const,
        name,
        type: 'seed' as const,
        seed: normalized,
        id: nanoid(),
      };
      const account = await Background.addWallet(input, network, networkCode);
      if (name && account && 'address' in account) {
        await Background.setAddress(account.address, name);
        await Background.selectAccount(account.address, network);
        const state = await Background.getState(['selectedAccount']);
        if (state.selectedAccount) {
          dispatch(selectAccount(state.selectedAccount as PreferencesAccount));
        }
      }
      setResult('Success!');
      setSeed('');
      setName('');
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h2>Add account</h2>
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="radio"
            checked={mode === 'waves'}
            onChange={() => setMode('waves')}
          />{' '}
          Waves
        </label>
        <label style={{ marginLeft: 24 }}>
          <input
            type="radio"
            checked={mode === 'multicoin'}
            onChange={() => setMode('multicoin')}
          />{' '}
          Multicoin
        </label>
      </div>
      <textarea
        style={{ width: '100%', minHeight: 60, border: '1px solid black' }}
        placeholder="Seed phrase"
        value={seed}
        onChange={e => setSeed(e.target.value)}
      />
      <div style={{ margin: '12px 0' }}>
        <input
          style={{ width: '100%', border: '1px solid black', padding: 6 }}
          placeholder="Account name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      {mode === 'waves' && (
        <div style={{ margin: '12px 0' }}>
          <label>Network: </label>
          <select
            value={network}
            onChange={e => setNetwork(e.target.value as NetworkProfile)}
          >
            {(
              ['mainnet', 'testnet', 'stagenet', 'custom'] as NetworkProfile[]
            ).map(net => (
              <option key={net} value={net}>
                {net}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        style={{ border: '1px solid black' }}
        onClick={handleAdd}
        disabled={!seed}
      >
        {mode === 'waves' ? 'Add Waves account' : 'Add Multichain account'}
      </button>
      {result && <div style={{ marginTop: 16 }}>{result}</div>}
    </div>
  );
}
