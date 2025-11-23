import React, { useState, useMemo } from 'react';
import { type Token } from '../constants/tokens';

interface TokenSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (token: Token) => void;
    tokens: Token[];
}

// Updated common tokens to match "Favorite tokens"
const FAVORITE_SYMBOLS = ['DAI', 'COW', 'USDC', 'USDT', 'WBTC', 'WETH'];

const NETWORKS = [
    { id: 1, name: 'Ethereum', icon: '🔷', active: true },
    { id: 100, name: 'Gnosis', icon: '🟩', active: false },
    { id: 42161, name: 'Arbitrum', icon: '🔵', active: false },
    { id: 8453, name: 'Base', icon: '🔵', active: false },
];

export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({ isOpen, onClose, onSelect, tokens }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTokens = useMemo(() => {
        if (!searchQuery) return tokens;
        const lowerQuery = searchQuery.toLowerCase();
        return tokens.filter(token =>
            token.symbol.toLowerCase().includes(lowerQuery) ||
            token.name.toLowerCase().includes(lowerQuery) ||
            token.address.toLowerCase().includes(lowerQuery)
        );
    }, [tokens, searchQuery]);

    const favoriteTokens = useMemo(() => {
        // Find tokens from the full list that match favorite symbols
        return FAVORITE_SYMBOLS.map(symbol => tokens.find(t => t.symbol === symbol)).filter((t): t is Token => !!t);
    }, [tokens]);

    if (!isOpen) return null;

    return (
        <div className="token-selector-container">
            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="token-search-input"
                    placeholder="Search name or paste address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
                <button className="close-button-inline" onClick={onClose}>✕</button>
            </div>

            <div className="network-selector">
                {NETWORKS.map(network => (
                    <button
                        key={network.id}
                        className={`network-icon ${network.active ? 'active' : ''}`}
                        title={network.name}
                        disabled={!network.active}
                    >
                        {network.icon}
                    </button>
                ))}
            </div>

            {favoriteTokens.length > 0 && (
                <div className="common-tokens-section">
                    <div className="section-header">
                        <span className="section-title-text">Favorite tokens</span>
                        <span className="help-icon">?</span>
                    </div>
                    <div className="common-tokens-list">
                        {favoriteTokens.map(token => (
                            <button
                                key={token.address}
                                className="common-token-chip"
                                onClick={() => onSelect(token)}
                            >
                                <span className="token-icon-small">
                                    {token.logoURI ? <img src={token.logoURI} alt={token.symbol} /> : '🪙'}
                                    <span className="chain-badge-small">🔷</span>
                                </span>
                                {token.symbol}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="token-list-section">
                <div className="token-list">
                    {filteredTokens.map(token => (
                        <div
                            key={token.address}
                            className="token-item"
                            onClick={() => onSelect(token)}
                        >
                            <div className="token-icon-large">
                                {token.logoURI ? <img src={token.logoURI} alt={token.symbol} /> : '🪙'}
                                <span className="chain-badge-large">🔷</span>
                            </div>
                            <div className="token-info">
                                <div className="token-name-row">
                                    <span className="token-symbol-main">{token.symbol}</span>
                                </div>
                                <div className="token-symbol-row">
                                    <span className="token-name-sub">{token.name}</span>
                                </div>
                            </div>
                            <div className="token-balance">
                                {/* Balance placeholder */}
                            </div>
                        </div>
                    ))}
                    {filteredTokens.length === 0 && (
                        <div className="no-results">No tokens found</div>
                    )}
                </div>
            </div>

            <div className="modal-footer">
                <button className="manage-lists-button">
                    <span className="edit-icon">📝</span>
                    Manage Token Lists
                </button>
            </div>
        </div>
    );
};
