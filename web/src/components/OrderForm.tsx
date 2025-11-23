import React, { useState, useEffect } from 'react';
import { useCowSdk } from '../hooks/useCowSdk';
import { TOKENS, type Token } from '../constants/tokens';
import { TokenService } from '../services/TokenService';
import { TokenSelectorModal } from './TokenSelectorModal';
import { ethers } from 'ethers';

interface OrderFormProps {
    cowSdk: ReturnType<typeof useCowSdk>;
}

export const OrderForm: React.FC<OrderFormProps> = ({ cowSdk }) => {
    const { getQuote, placeOrder, sdk, chainId } = cowSdk;
    const [sellToken, setSellToken] = useState<Token | null>(null);
    const [buyToken, setBuyToken] = useState<Token | null>(null);
    const [amount, setAmount] = useState('');
    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'sell' | 'buy'>('sell');

    const [tokenList, setTokenList] = useState<Token[]>([]);

    useEffect(() => {
        const fetchTokens = async () => {
            if (chainId) {
                // Start with default tokens
                const defaultTokens = TOKENS[chainId] || [];
                setTokenList(defaultTokens);

                // Fetch dynamic list
                const dynamicTokens = await TokenService.fetchTokens(chainId);

                // Merge lists (prefer dynamic, but keep defaults if fetch fails or for speed)
                // For now, let's just use dynamic if available, or default if not
                if (dynamicTokens.length > 0) {
                    setTokenList(dynamicTokens);
                }
            }
        };
        fetchTokens();
    }, [chainId]);

    const availableTokens = tokenList;

    useEffect(() => {
        setSellToken(null);
        setBuyToken(null);
    }, [chainId]);

    const handleGetQuote = async () => {
        if (!sdk || !sellToken || !buyToken) return;
        setLoading(true);
        setError(null);
        setQuote(null);
        setOrderId(null);
        try {
            const decimals = sellToken.decimals;
            const q = await getQuote(
                sellToken.address,
                buyToken.address,
                amount,
                'sell',
                decimals
            );
            setQuote(q);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch quote');
        } finally {
            setLoading(false);
        }
    };

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
        setQuote(null);
        setIsModalOpen(false);
    };

    return (
        <div className="glass-card">
            {isModalOpen ? (
                <TokenSelectorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleTokenSelect}
                    tokens={availableTokens}
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
                                disabled={availableTokens.length === 0}
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
                        <div className="arrow-icon">↓</div>
                    </div>

                    <div className="input-container">
                        <div className="input-row">
                            <input
                                type="text"
                                value={quote ? ethers.formatUnits(quote.quoteResults.quoteResponse.quote.buyAmount, buyToken?.decimals) : ''}
                                readOnly
                                placeholder="0"
                                className="amount-input"
                            />
                            <button
                                className="token-select"
                                onClick={() => openModal('buy')}
                                disabled={availableTokens.length === 0}
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
                        {!quote ? (
                            <button
                                onClick={handleGetQuote}
                                disabled={loading || !sdk || !sellToken || !buyToken || !amount}
                                className="btn-primary"
                            >
                                {loading ? 'Fetching Quote...' : 'Get Quote'}
                            </button>
                        ) : (
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Confirm Swap' : 'Swap'}
                            </button>
                        )}
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
