import { Token, TokenProvider } from './TokenProvider';

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

export class CowSwapTokenProvider implements TokenProvider {
    async getTokens(chainId: number): Promise<Token[]> {
        try {
            const response = await fetch(COW_SWAP_TOKEN_LIST_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch token list');
            }
            const data: TokenListResponse = await response.json();

            return data.tokens
                .filter(t => t.chainId === chainId)
                .map(t => ({
                    chainId: t.chainId,
                    address: t.address,
                    name: t.name,
                    symbol: t.symbol,
                    decimals: t.decimals,
                    logoURI: t.logoURI
                }));
        } catch (error) {
            console.error('Error fetching tokens from CoW Swap:', error);
            return [];
        }
    }
}
