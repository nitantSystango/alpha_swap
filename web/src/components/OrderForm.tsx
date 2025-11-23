import React, { useState, useEffect } from 'react';
import { useCowSdk } from '../hooks/useCowSdk';
import { type Token } from '../constants/tokens';
import { TokenSelectorModal } from './TokenSelectorModal';
import { ethers } from 'ethers';

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
        if (!sdk || !sellToken || !buyToken || !debouncedAmount || parseFloat(debouncedAmount) === 0) {
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
        if (modalType === 'sell') {
            setSellToken(token);
        } else {
            setBuyToken(token);
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
                            <span>Balance: 0</span>
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
                                value={quote ? parseFloat(ethers.formatUnits(quote.quoteResults.quoteResponse.quote.buyAmount, buyToken?.decimals)).toFixed(6).replace(/\.?0+$/, '') : ''}
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
                            <span>Balance: 0</span>
                        </div>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <div className="actions">
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || !quote || !sdk}
                            className="btn-primary"
                        >
                            {loading ? (quote ? 'Swapping...' : 'Fetching Quote...') : (quote ? 'Swap' : 'Enter Amount')}
                        </button>
                    </div>

                    {orderId && (
                        <div className="success-message">
                            Order Placed Successfully! <br />
                            <small style={{ opacity: 0.7, fontSize: '12px' }}>{orderId}</small>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
