import React, { useState, useEffect } from 'react';
import { useCowSdk } from '../hooks/useCowSdk';
import { type Token } from '../constants/tokens';
import { TokenSelectorModal } from './TokenSelectorModal';
import { ethers } from 'ethers';
import { ApprovalButton } from './ApprovalButton';
import { useTokenApproval } from '../hooks/useTokenApproval';

interface OrderFormProps {
    cowSdk: ReturnType<typeof useCowSdk>;
}

export const OrderForm: React.FC<OrderFormProps> = ({ cowSdk }) => {
    const { getQuote, placeOrder, sdk, chainId } = cowSdk;
    const [sellToken, setSellToken] = useState<Token | null>(() => {
        // Restore from localStorage on mount
        const saved = localStorage.getItem('alphaswap_sellToken');
        return saved ? JSON.parse(saved) : null;
    });
    const [buyToken, setBuyToken] = useState<Token | null>(() => {
        // Restore from localStorage on mount
        const saved = localStorage.getItem('alphaswap_buyToken');
        return saved ? JSON.parse(saved) : null;
    });
    const [amount, setAmount] = useState('');
    const [debouncedAmount, setDebouncedAmount] = useState(amount);
    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'sell' | 'buy'>('sell');

    const [isApproved, setIsApproved] = useState(false);
    const [sellBalance, setSellBalance] = useState<string>('0');
    const [buyBalance, setBuyBalance] = useState<string>('0');

    const { getBalance } = useTokenApproval(cowSdk.provider, cowSdk.signer, cowSdk.account);

    // Reset approval state when token changes
    useEffect(() => {
        setIsApproved(false);
    }, [sellToken?.address]);

    const handleApprovalComplete = () => {
        setIsApproved(true);
    };

    // Fetch balances
    useEffect(() => {
        const fetchBalances = async () => {
            if (sellToken && cowSdk.account) {
                try {
                    const balance = await getBalance(sellToken.address);
                    setSellBalance(balance.formatted);
                } catch (e) {
                    console.error('Error fetching sell token balance:', e);
                }
            } else {
                setSellBalance('0');
            }

            if (buyToken && cowSdk.account) {
                try {
                    const balance = await getBalance(buyToken.address);
                    setBuyBalance(balance.formatted);
                } catch (e) {
                    console.error('Error fetching buy token balance:', e);
                }
            } else {
                setBuyBalance('0');
            }
        };

        fetchBalances();
        // Refresh balances periodically
        const interval = setInterval(fetchBalances, 10000);
        return () => clearInterval(interval);
    }, [sellToken, buyToken, cowSdk.account, getBalance]);

    // Persist tokens to localStorage whenever they change
    useEffect(() => {
        if (sellToken) {
            localStorage.setItem('alphaswap_sellToken', JSON.stringify(sellToken));
        } else {
            localStorage.removeItem('alphaswap_sellToken');
        }
    }, [sellToken]);

    useEffect(() => {
        if (buyToken) {
            localStorage.setItem('alphaswap_buyToken', JSON.stringify(buyToken));
        } else {
            localStorage.removeItem('alphaswap_buyToken');
        }
    }, [buyToken]);

    // Debounce amount
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedAmount(amount);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [amount]);

    const fetchQuote = async (isRefresh = false) => {
        // We can fetch quote even if sdk is not initialized (wallet not connected)
        if (!sellToken || !buyToken || !debouncedAmount || parseFloat(debouncedAmount) === 0) {
            setQuote(null);
            return;
        }

        if (!isRefresh) {
            setLoading(true);
            setOrderId(null);
        } else {
            setRefreshing(true);
        }

        setError(null);

        try {
            const decimals = sellToken.decimals;
            const q = await getQuote(
                sellToken.address,
                buyToken.address,
                debouncedAmount,
                'sell',
                decimals
            );
            setQuote(q);
        } catch (err: any) {
            console.error(err);
            // Only show error if it's not a refresh (to avoid annoying popups) or if it's a critical error
            if (!isRefresh) {
                setError(err.message || 'Failed to fetch quote');
                setQuote(null);
            }
        } finally {
            if (!isRefresh) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    // Auto-fetch quote when dependencies change
    useEffect(() => {
        fetchQuote();
    }, [sdk, sellToken, buyToken, debouncedAmount]);

    // Auto-refresh quote every 20 seconds
    useEffect(() => {
        if (!quote) return;

        const interval = setInterval(() => {
            fetchQuote(true);
        }, 20000);

        return () => clearInterval(interval);
    }, [quote, sdk, sellToken, buyToken, debouncedAmount]);




    const handlePlaceOrder = async () => {
        if (!quote) return;
        setLoading(true);
        setError(null);
        try {
            const id = await placeOrder(quote);
            setOrderId(id);
        } catch (err: any) {
            console.error(err);
            if (err.code === 4001 || (err.message && err.message.includes('user rejected'))) {
                setError('Transaction rejected by user');
            } else {
                setError(err.message || 'Failed to place order');
            }
        } finally {
            setLoading(false);
        }
    };
    const openModal = (type: 'sell' | 'buy') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleTokenSelect = (token: Token) => {
        // If the selected token is on a different chain than the current one,
        // we should clear the other token to avoid cross-chain confusion
        // Note: The chain switch itself is handled in the modal, so by the time
        // we get here or shortly after, chainId might update.

        // However, if we are just selecting a token and the chain is already correct:
        if (modalType === 'sell') {
            setSellToken(token);
            // If we're switching chains (implied if token.chainId != buyToken.chainId), clear buyToken
            if (buyToken && token.chainId !== buyToken.chainId) {
                setBuyToken(null);
            }
        } else {
            setBuyToken(token);
            // If we're switching chains (implied if token.chainId != sellToken.chainId), clear sellToken
            if (sellToken && token.chainId !== sellToken.chainId) {
                setSellToken(null);
            }
        }
        // Quote will be cleared by the useEffect dependency change
        setIsModalOpen(false);
    };

    return (
        <div className="glass-card">
            {isModalOpen ? (
                <TokenSelectorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleTokenSelect}
                    connectedChainId={chainId}
                    selectedTokenChainId={modalType === 'sell' ? sellToken?.chainId : buyToken?.chainId}
                />
            ) : (
                <>
                    <div className="order-form-header">
                        <h3 style={{ margin: 0, fontWeight: 500 }}>Swap</h3>
                        <div className="settings-icon" style={{ cursor: 'pointer', opacity: 0.7 }}>⚙️</div>
                    </div>

                    <div className="input-container">
                        <div className="input-row">
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="amount-input"
                            />
                            <button
                                className="token-select"
                                onClick={() => openModal('sell')}
                            >
                                {sellToken ? (
                                    <>
                                        <span className="token-icon-small">
                                            {sellToken.logoURI ? <img src={sellToken.logoURI} alt={sellToken.symbol} /> : '🪙'}
                                        </span>
                                        {sellToken.symbol}
                                    </>
                                ) : (
                                    'Select Token'
                                )}
                                <span className="dropdown-arrow">▼</span>
                            </button>
                        </div>
                        <div className="balance-row">
                            <span>Balance: {parseFloat(sellBalance).toFixed(4)}</span>
                        </div>
                    </div>

                    <div className="arrow-container">
                        {refreshing ? (
                            <div className="refresh-spinner">
                                <img src="/alphaswap_logo_v2.svg" alt="Refreshing..." />
                            </div>
                        ) : (
                            <div className="arrow-icon">↓</div>
                        )}
                    </div>

                    <div className="input-container">
                        <div className="input-row">
                            <input
                                type="text"
                                value={quote ? parseFloat(ethers.formatUnits(quote.quote.buyAmount, buyToken?.decimals)).toFixed(6).replace(/\.?0+$/, '') : ''}
                                readOnly
                                placeholder="0.0"
                                className="amount-input"
                            />
                            <button
                                className="token-select"
                                onClick={() => openModal('buy')}
                            >
                                {buyToken ? (
                                    <>
                                        <span className="token-icon-small">
                                            {buyToken.logoURI ? <img src={buyToken.logoURI} alt={buyToken.symbol} /> : '🪙'}
                                        </span>
                                        {buyToken.symbol}
                                    </>
                                ) : (
                                    'Select Token'
                                )}
                                <span className="dropdown-arrow">▼</span>
                            </button>
                        </div>
                        <div className="balance-row">
                            <span>Balance: {parseFloat(buyBalance).toFixed(4)}</span>
                        </div>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <div className="actions">
                        {quote && sellToken && !isApproved && (
                            <ApprovalButton
                                provider={cowSdk.provider}
                                signer={cowSdk.signer}
                                userAddress={cowSdk.account}
                                tokenAddress={sellToken.address}
                                amount={ethers.parseUnits(debouncedAmount, sellToken.decimals).toString()}
                                onApprovalComplete={handleApprovalComplete}
                                tokenSymbol={sellToken.symbol}
                            />
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || !quote || !sdk || !isApproved}
                            className="btn-primary"
                            title={!isApproved ? "Please approve token first" : ""}
                        >
                            {loading ? (quote ? 'Swapping...' : 'Fetching Quote...') : (quote ? 'Swap' : 'Enter Amount')}
                        </button>
                    </div>

                    {orderId && (
                        <div className="success-message">
                            Order Placed Successfully! <br />
                            <a
                                href={`${import.meta.env.VITE_COW_EXPLORER_URL || 'https://explorer.cow.fi/sepolia/orders/'}${orderId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', fontSize: '12px', textDecoration: 'underline' }}
                            >
                                View on CoW Explorer
                            </a>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
