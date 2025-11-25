import { OrderQuoteResponse } from '@cowprotocol/cow-sdk';

export interface QuoteParams {
    sellToken: string;
    buyToken: string;
    amount: string; // Atomic units
    kind: 'sell' | 'buy';
    userAddress: string;
}

export interface OrderParams {
    quote: any; // The order object from quoteResults.orderToSign
    signature: string; // The signature from the user
    quoteId: string; // The ID from the quote response
    from: string; // The user's address
    chainId: number;
}

export interface ISwapAdapter {
    getQuote(params: QuoteParams): Promise<any>;
    submitOrder(params: OrderParams): Promise<string>; // Returns order ID
}
