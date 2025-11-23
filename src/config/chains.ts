import { SupportedChainId } from '@cowprotocol/cow-sdk';

export interface Chain {
    chainId: number;
    name: string;
    icon: string;
    rpcUrl?: string;
    supportedChainId: SupportedChainId;
}

export const SUPPORTED_CHAINS: Chain[] = [
    {
        chainId: 1,
        name: 'Ethereum',
        icon: '⟠',
        rpcUrl: 'https://eth.llamarpc.com',
        supportedChainId: SupportedChainId.MAINNET
    },
    {
        chainId: 100,
        name: 'Gnosis',
        icon: '🟢',
        rpcUrl: 'https://rpc.gnosischain.com',
        supportedChainId: SupportedChainId.GNOSIS_CHAIN
    },
    {
        chainId: 42161,
        name: 'Arbitrum',
        icon: '🔵',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        supportedChainId: SupportedChainId.ARBITRUM_ONE
    },
    {
        chainId: 8453,
        name: 'Base',
        icon: '🔷',
        rpcUrl: 'https://mainnet.base.org',
        supportedChainId: SupportedChainId.BASE
    },
    {
        chainId: 11155111,
        name: 'Sepolia',
        icon: '🧪',
        rpcUrl: 'https://eth-sepolia.public.blastapi.io',
        supportedChainId: SupportedChainId.SEPOLIA
    }
];

// Helper to get SupportedChainId from chainId number
export function getSupportedChainId(chainId: number): SupportedChainId | null {
    const chain = SUPPORTED_CHAINS.find(c => c.chainId === chainId);
    return chain?.supportedChainId || null;
}

// Helper to get chainId number from SupportedChainId
export function getChainIdNumber(supportedChainId: SupportedChainId): number | null {
    const chain = SUPPORTED_CHAINS.find(c => c.supportedChainId === supportedChainId);
    return chain?.chainId || null;
}

