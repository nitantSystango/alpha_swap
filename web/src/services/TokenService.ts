import { type Token } from '../constants/tokens';

const COW_SWAP_TOKEN_LIST_URL = 'https://files.cow.fi/tokens/CowSwap.json';

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

export const TokenService = {
    async fetchTokens(chainId: number = 1): Promise<Token[]> {
        try {
            const response = await fetch(COW_SWAP_TOKEN_LIST_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch token list');
            }
            const data: TokenListResponse = await response.json();

            // Filter tokens by chainId and map to our Token interface
            return data.tokens
                .filter(t => t.chainId === chainId)
                .map(t => ({
                    symbol: t.symbol,
                    name: t.name,
                    address: t.address,
                    decimals: t.decimals,
                    logoURI: t.logoURI
                }));
        } catch (error) {
            console.error('Error fetching tokens:', error);
            return [];
        }
    }
};
