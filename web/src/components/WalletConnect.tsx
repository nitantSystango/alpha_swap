import React from 'react';
import { useCowSdk } from '../hooks/useCowSdk';

interface WalletConnectProps {
    cowSdk: ReturnType<typeof useCowSdk>;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ cowSdk }) => {
    const { account, connect, disconnect, chainId } = cowSdk;

    return (
        <div className="wallet-connect">
            {account ? (
                <div className="connected-info">
                    <span className="network-badge">
                        {chainId === 1 ? 'Mainnet' : chainId === 11155111 ? 'Sepolia' : `Chain ID: ${chainId}`}
                    </span>
                    <span className="address" title={account}>
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <button onClick={disconnect} className="btn-secondary">Disconnect</button>
                </div>
            ) : (
                <button onClick={connect} className="btn-primary">Connect Wallet</button>
            )}
        </div>
    );
};
