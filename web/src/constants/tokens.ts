export interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
}

export const TOKENS: Record<number, Token[]> = {
    1: [ // Mainnet
        {
            symbol: 'WETH',
            name: 'Wrapped Ether',
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            decimals: 18,
        },
        {
            symbol: 'USDC',
            name: 'USD Coin',
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            decimals: 6,
        },
        {
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            decimals: 18,
        },
        {
            symbol: 'COW',
            name: 'CoW Protocol Token',
            address: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497ab',
            decimals: 18,
        },
        {
            symbol: 'WBTC',
            name: 'Wrapped BTC',
            address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            decimals: 8,
        }
    ],
    11155111: [ // Sepolia
        {
            symbol: 'WETH',
            name: 'Wrapped Ether',
            address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
            decimals: 18,
        },
        {
            symbol: 'USDC',
            name: 'USD Coin',
            address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
            decimals: 6,
        },
        {
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', // Sepolia DAI
            decimals: 18,
        },
        {
            symbol: 'COW',
            name: 'CoW Protocol Token',
            address: '0x3430d04E42a723418fBFa592854d0192418e97d6', // Mock COW on Sepolia
            decimals: 18,
        }
    ]
};

export const DEFAULT_TOKENS = TOKENS[1];
