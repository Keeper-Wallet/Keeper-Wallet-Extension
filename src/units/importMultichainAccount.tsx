import { nanoid } from 'nanoid';
import { usePopupDispatch } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useState } from 'react';
import { selectAccount } from 'store/actions/localState';
import Background from 'ui/services/Background';

export default function ImportMultichainAccount() {
  const [importActive, setImportActive] = useState(false);
  const [seed, setSeed] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const dispatch = usePopupDispatch();

  const handleImport = async () => {
    setResult(null);
    try {
      const normalized = seed.trim().replace(/\s+/g, ' ');
      if (normalized.length < 12) {
        setResult('Seed phrase too short');
        return;
      }
      if (!name || name.length < 4) {
        setResult('Name too short');
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
      const state = await Background.getState(['selectedAccount', 'accounts']);
      if (state.accounts && Array.isArray(state.accounts)) {
        const newAccount = state.accounts.find(
          (acc: PreferencesAccount) =>
            acc.accountType === 'multichain' && acc.name === name,
        );
        if (newAccount) {
          dispatch(selectAccount(newAccount));
        }
      }
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  if (!importActive) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button
          style={{ fontSize: 18, padding: '12px 32px', marginBottom: 16 }}
          onClick={() => setImportActive(true)}
        >
          Import Multichain Account
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h2>Import Multichain Account</h2>
      <textarea
        style={{ width: '100%', minHeight: 80, fontSize: 16 }}
        placeholder="Type seed phrase"
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
      <button
        style={{ marginTop: 16, fontSize: 18, padding: '10px 32px' }}
        onClick={handleImport}
        disabled={!seed || !name}
      >
        Import
      </button>
      {result && <div style={{ marginTop: 16 }}>{result}</div>}
    </div>
  );
}
