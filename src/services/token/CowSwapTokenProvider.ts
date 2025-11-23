import { Token, TokenProvider } from './TokenProvider';

const COW_SWAP_TOKEN_LIST_URL = 'https://files.cow.fi/tokens/CowSwap.json';

// Sepolia testnet tokens - CoW Swap supports these but doesn't include them in their token list API
const SEPOLIA_TEST_TOKENS: Token[] = [
    {
        chainId: 11155111,
        address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
    },
    {
        chainId: 11155111,
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
    },
    {
        chainId: 11155111,
        address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
    },
    {
        chainId: 11155111,
        address: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
        name: 'CoW Protocol Token',
        symbol: 'COW',
        decimals: 18,
    },
    {
        chainId: 11155111,
        address: '0xd3f35Db89f5C38B1C9A4b8B8B0e8e8e8e8e8e8e8',
        name: 'Gnosis',
        symbol: 'GNO',
        decimals: 18,
    },
    {
        chainId: 11155111,
        address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        name: 'Uniswap',
        symbol: 'UNI',
        decimals: 18,
    }
];

interface TokenListResponse {
    name: string;
    timestamp: string;
    version: {
        major: number;
        minor: number;
        patch: number;
    };
    tokens: Array<{
        chainId: number;
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        logoURI?: string;
    }>;
}

export class CowSwapTokenProvider implements TokenProvider {
    async getTokens(chainId: number): Promise<Token[]> {
        // Special case for Sepolia testnet - return test tokens
        if (chainId === 11155111) {
            return SEPOLIA_TEST_TOKENS;
        }

        try {
            const response = await fetch(COW_SWAP_TOKEN_LIST_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch token list');
            }
            const data: TokenListResponse = await response.json();

            const tokens = data.tokens
                .filter(t => t.chainId === chainId)
                .map(t => ({
                    chainId: t.chainId,
                    address: t.address,
                    name: t.name,
                    symbol: t.symbol,
                    decimals: t.decimals,
                    logoURI: t.logoURI
                }));

            return tokens;
        } catch (error) {
            console.error('Error fetching tokens from CoW Swap:', error);
            return [];
        }
    }
}
