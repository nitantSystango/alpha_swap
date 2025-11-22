import React, { useState, useEffect } from 'react';
import { useCowSdk } from '../hooks/useCowSdk';
import { TOKENS, type Token } from '../constants/tokens';
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

    const availableTokens = chainId ? TOKENS[chainId] || [] : [];

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
            // For 'sell' order, amount is in sellToken.
            const decimals = sellToken.decimals;

            const q = await getQuote(
                sellToken.address,
                buyToken.address,
                amount,
                'sell', // Always 'sell' for this UI structure
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

    return (
        <div className="order-form card" style={{ margin: '0 auto' }}>
            <div className="header-row">
                <h3>Swap</h3>
                <div className="settings-icon">⚙️</div>
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
                    <select
                        value={sellToken?.address || ''}
                        onChange={(e) => {
                            const token = availableTokens.find(t => t.address === e.target.value);
                            setSellToken(token || null);
                        }}
                        disabled={availableTokens.length === 0}
                        className="token-select"
                    >
                        <option value="">Select Token</option>
                        {availableTokens.map(t => (
                            <option key={t.address} value={t.address}>{t.symbol}</option>
                        ))}
                    </select>
                </div>
                <div className="balance-row">
                    <span>Balance: -</span>
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
                    <select
                        value={buyToken?.address || ''}
                        onChange={(e) => {
                            const token = availableTokens.find(t => t.address === e.target.value);
                            setBuyToken(token || null);
                        }}
                        disabled={availableTokens.length === 0}
                        className="token-select"
                    >
                        <option value="">Select Token</option>
                        {availableTokens.map(t => (
                            <option key={t.address} value={t.address}>{t.symbol}</option>
                        ))}
                    </select>
                </div>
                <div className="balance-row">
                    <span>Balance: -</span>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="actions">
                {!quote ? (
                    <button
                        onClick={handleGetQuote}
                        disabled={loading || !sdk || !sellToken || !buyToken || !amount}
                        className="btn-primary full-width large-btn"
                    >
                        {loading ? 'Fetching Quote...' : 'Get Quote'}
                    </button>
                ) : (
                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="btn-primary full-width large-btn"
                    >
                        {loading ? 'Signing...' : 'Swap'}
                    </button>
                )}
            </div>

            {orderId && (
                <div className="success-message">
                    Order Placed! <br />
                    <small>{orderId}</small>
                </div>
            )}
        </div>
    );
};
