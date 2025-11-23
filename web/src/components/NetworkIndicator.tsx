import React, { useEffect, useState } from 'react';

interface NetworkIndicatorProps {
    chainId: number | null;
}

interface Chain {
    chainId: number;
    name: string;
    icon: string;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({ chainId }) => {
    const [chains, setChains] = useState<Chain[]>([]);

    useEffect(() => {
        const fetchChains = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/chains');
                const data = await response.json();
                setChains(data);
            } catch (error) {
                console.error('Error fetching chains:', error);
            }
        };
        fetchChains();
    }, []);

    if (!chainId) return null;

    const network = chains.find(c => c.chainId === chainId) || {
        name: 'Unknown',
        icon: '❓',
        chainId
    };

    return (
        <div className="network-indicator">
            <span className="network-icon">{network.icon}</span>
            <span className="network-name">{network.name}</span>
            <style>{`
                .network-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--surface-color);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 8px 14px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 15px;
                    color: var(--text-color);
                    transition: all 0.2s;
                }
                .network-indicator:hover {
                    background: var(--surface-hover);
                    border-color: rgba(0, 0, 0, 0.1);
                }
                .network-icon {
                    font-size: 18px;
                    line-height: 1;
                }
                .network-name {
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};
