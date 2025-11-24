import { ISwapAdapter, QuoteParams, OrderParams } from './interfaces/ISwapAdapter';
import { TradingSdk, SupportedChainId, OrderKind, OrderBookApi } from '@cowprotocol/cow-sdk';
import { ethers } from 'ethers';

import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter';
import { AdapterContext } from '@cowprotocol/sdk-common';

export class CowSwapAdapter implements ISwapAdapter {
    private sdk: TradingSdk;
    private orderBookApi: OrderBookApi;
    private chainId: SupportedChainId;

    constructor(chainId: SupportedChainId = SupportedChainId.MAINNET) {
        this.chainId = chainId;

        // Initialize Provider
        const rpcUrl = chainId === SupportedChainId.SEPOLIA
            ? 'https://rpc.ankr.com/eth_sepolia'
            : 'https://rpc.ankr.com/eth'; // Default to Mainnet public RPC

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = ethers.Wallet.createRandom(provider);

        const adapter = new EthersV6Adapter({
            provider,
            signer,
        });
        AdapterContext.getInstance().setAdapter(adapter);

        this.sdk = new TradingSdk({
            chainId,
            signer,
            appCode: 'CoW Swap',
        });
        this.orderBookApi = new OrderBookApi({ chainId });
    }

    async getQuote(params: QuoteParams): Promise<any> {
        const { sellToken, buyToken, amount, kind, sellTokenDecimals, buyTokenDecimals, userAddress } = params;

        const amountBigInt = ethers.parseUnits(amount, kind === 'sell' ? sellTokenDecimals : buyTokenDecimals);

        const quoteParams = {
            sellToken,
            buyToken,
            kind: kind === 'sell' ? OrderKind.SELL : OrderKind.BUY,
            amount: amountBigInt.toString(),
            sellTokenDecimals,
            buyTokenDecimals,
            userAddress,
        };

        const advancedSettings = {
            appData: {}, // This should generate the default hash 0xb48...
        };

        const quoteResponse = await this.sdk.getQuote(quoteParams, advancedSettings);
        // We return the raw quote response which contains the quote and the order parameters needed for signing
        return quoteResponse;
    }

    async submitOrder(params: OrderParams): Promise<string> {
        const { quote, signature } = params;

        // The quote object from getQuote (QuoteAndPost) might need to be processed to extract the order body
        // However, the FE will likely send the exact order body that was signed + the signature.
        // For simplicity, let's assume 'quote' here is the order body that was signed.

        // Actually, the sdk.getQuote returns a QuoteAndPost object.
        // We need to send the order parameters + signature.

        // Let's assume the FE sends the constructed order object and the signature.

        const orderUid = await this.orderBookApi.sendOrder({
            ...quote, // This should be the order parameters
            signature,
            signingScheme: 'eip712', // Assuming EIP-712
        });

        return orderUid;
    }
}
