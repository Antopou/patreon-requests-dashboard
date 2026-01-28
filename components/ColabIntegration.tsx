"use client";

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Account {
  email: string;
  name: string;
  image?: string;
  accountId?: number;
}

export default function ColabIntegration() {
  const { data: session, status } = useSession();
  const [selectedNotebook, setSelectedNotebook] = useState('dataset-maker');
  const [savedAccounts, setSavedAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showIdTester, setShowIdTester] = useState(false);
  const [testingAccount, setTestingAccount] = useState<Account | null>(null);
  const [currentTestId, setCurrentTestId] = useState(0);
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    // Load saved accounts from localStorage on component mount
    const stored = localStorage.getItem('colab-accounts');
    if (stored) {
      try {
        const accounts = JSON.parse(stored);
        setSavedAccounts(accounts);
        if (accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(accounts[0]);
        }
      } catch (e) {
        console.error('Failed to load accounts:', e);
      }
    }
  }, []);

  // Auto-add current session account to saved accounts
  useEffect(() => {
    if (session?.user?.email && session?.user?.name) {
      const currentAccount: Account = {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image || undefined
      };
      
      setSavedAccounts((prev) => {
        const exists = prev.some(acc => acc.email === currentAccount.email);
        if (!exists) {
          // Get the highest account ID to start from next one
          const maxId = prev.reduce((max, acc) => Math.max(max, acc.accountId ?? -1), -1);
          setTestingAccount(currentAccount);
          setCurrentTestId(maxId + 1);
          setShowIdTester(true);
          return prev;
        }
        return prev;
      });
    }
  }, [session?.user?.email]);

  const isAuthenticated = (status === 'authenticated' || status === 'loading') && session?.user;

  const notebooks = {
    'dataset-maker': {
      name: 'Dataset Maker',
      url: 'https://colab.research.google.com/github/hollowstrawberry/kohya-colab/blob/main/Dataset_Maker.ipynb',
      description: 'Create training datasets from your character requests'
    },
    'lora-trainer': {
      name: 'LoRA Trainer XL',
      url: 'https://colab.research.google.com/github/hollowstrawberry/kohya-colab/blob/main/Lora_Trainer_XL.ipynb',
      description: 'Train LoRA models for your characters'
    }
  };

  const testAccountId = () => {
    if (!testingAccount) return;
    const notebook = notebooks[selectedNotebook as keyof typeof notebooks];
    const colabUrl = `${notebook.url}?authuser=${currentTestId}`;
    window.open(colabUrl, '_blank');
  };

  const saveAccountWithId = () => {
    if (!testingAccount) return;
    
    const accountWithId: Account = {
      ...testingAccount,
      accountId: currentTestId
    };
    
    const updated = [...savedAccounts, accountWithId];
    setSavedAccounts(updated);
    localStorage.setItem('colab-accounts', JSON.stringify(updated));
    setSelectedAccount(accountWithId);
    setShowIdTester(false);
    setTestingAccount(null);
    setCurrentTestId(0);
  };

  const handleAddAccount = async () => {
    await signIn('google');
  };

  const removeAccount = (email: string) => {
    const updated = savedAccounts.filter(acc => acc.email !== email);
    setSavedAccounts(updated);
    localStorage.setItem('colab-accounts', JSON.stringify(updated));
    if (selectedAccount?.email === email && updated.length > 0) {
      setSelectedAccount(updated[0]);
    } else if (updated.length === 0) {
      setSelectedAccount(null);
    }
  };

  const openColabNotebook = () => {
    if (!isAuthenticated) {
      signIn('google');
      return;
    }
    
    if (!selectedAccount) {
      alert('Please select an account');
      return;
    }

    if (selectedAccount.accountId === undefined) {
      alert('Please set account ID first');
      return;
    }
    
    const notebook = notebooks[selectedNotebook as keyof typeof notebooks];
    const colabUrl = `${notebook.url}?authuser=${selectedAccount.accountId}`;
    window.open(colabUrl, '_blank');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* ID Tester Modal */}
      {showIdTester && testingAccount && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowIdTester(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-slate-800">{testingAccount.name}</h2>
                  <p className="text-xs text-slate-600 truncate">{testingAccount.email}</p>
                </div>
                
                <div className="flex gap-2 items-center flex-shrink-0">
                  <label className="text-xs font-medium text-slate-700 whitespace-nowrap">Account ID</label>
                  <input
                    type="number"
                    min="0"
                    value={currentTestId}
                    onChange={(e) => setCurrentTestId(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center text-sm font-medium rounded-lg border border-slate-300 px-1.5 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <button
                  onClick={testAccountId}
                  className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-xs font-medium transition-colors flex-shrink-0"
                >
                  Test
                </button>

                <button
                  onClick={saveAccountWithId}
                  className="rounded-lg bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 text-xs font-medium transition-colors flex-shrink-0"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setShowIdTester(false);
                    setTestingAccount(null);
                    setCurrentTestId(0);
                  }}
                  className="rounded-lg border border-slate-200 text-slate-700 px-4 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors flex-shrink-0"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {status === 'loading' ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading authentication...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Sign in Required</h3>
          <p className="text-slate-600 mb-4">Sign in with your Google account to access AI training tools</p>
          <button
            onClick={() => signIn('google')}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">AI Training Tools</h3>
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="text-slate-500 hover:text-slate-700 transition-colors"
              title="Help"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
            </button>
          </div>

          {showHelper && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
              <p className="font-semibold">How Account IDs Work</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Google stores account IDs on your device (0, 1, 2, etc.)</li>
                <li>ID 0 = first account logged in, ID 1 = second, etc.</li>
                <li>These IDs are device/browser specific</li>
                <li>When you add a new account, we'll test to find its ID</li>
                <li>Once found, it's saved so you don't repeat</li>
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tool</label>
            <div className="space-y-2">
              {Object.entries(notebooks).map(([key, notebook]) => (
                <label key={key} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="notebook"
                    value={key}
                    checked={selectedNotebook === key}
                    onChange={(e) => setSelectedNotebook(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-slate-800">{notebook.name}</div>
                    <div className="text-sm text-slate-600">{notebook.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Account</label>
            
            {savedAccounts.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-3">No accounts added yet</p>
                <button
                  onClick={handleAddAccount}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.5-9h-3.5v-3.5h-2v3.5H7v2h3.5v3.5h2v-3.5h3.5z"/>
                  </svg>
                  Add Account
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-2 mb-3">
                  {savedAccounts.map((account) => (
                    <div
                      key={account.email}
                      onClick={() => setSelectedAccount(account)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                        selectedAccount?.email === account.email
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {account.image ? (
                        <Image
                          src={account.image}
                          alt={account.name}
                          width={40}
                          height={40}
                          className="rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800">{account.name}</div>
                        <div className="text-xs text-slate-500">{account.email}</div>
                      </div>
                      {savedAccounts.length > 1 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAccount(account.email);
                          }}
                          className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove account"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleAddAccount}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.5-9h-3.5v-3.5h-2v3.5H7v2h3.5v3.5h2v-3.5h3.5z"/>
                    </svg>
                    Add Another Account
                  </span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={openColabNotebook}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedAccount || selectedAccount.accountId === undefined}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
                <path d="M20.5 10H19V8.5c0-2.48-2.02-4.5-4.5-4.5S10 6.02 10 8.5V10H8.5c-.83 0-1.5.67-1.5 1.5v9c0 .83.67 1.5 1.5 1.5h12c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5z"/>
              </svg>
              Open in Google Colab
            </span>
          </button>

          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">Opens Google Colab in new tab with GPU access</div>
        </div>
      )}
    </div>
  );
}
