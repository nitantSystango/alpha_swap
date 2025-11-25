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
        const { sellToken, buyToken, amount, kind, userAddress } = params;

        // amount is already in atomic units (BigInt string)
        const amountBigInt = BigInt(amount);

        const quoteRequest = {
            sellToken,
            buyToken,
            from: userAddress,
            receiver: userAddress,
            validTo: Math.floor(Date.now() / 1000) + 3600, // 1 hour
            appData: '0x0000000000000000000000000000000000000000000000000000000000000000', // Zero hash - pre-registered with CoW API
            partiallyFillable: false,
            sellTokenBalance: 'erc20',
            buyTokenBalance: 'erc20',
            kind: kind === 'sell' ? OrderKind.SELL : OrderKind.BUY,
            signingScheme: 'eip712', // SigningScheme.EIP712
        };

        if (kind === 'sell') {
            (quoteRequest as any).sellAmountBeforeFee = amountBigInt.toString();
        } else {
            (quoteRequest as any).buyAmountAfterFee = amountBigInt.toString();
        }

        const quoteResponse = await this.orderBookApi.getQuote(quoteRequest as any);
        return quoteResponse;
    }

    async submitOrder(params: OrderParams): Promise<string> {
        const { quote, signature, quoteId, from } = params;

        // The quote object passed here is the orderToSign from the quote response
        // We need to combine it with the signature, quoteId, and from address
        // to match what the CoW Protocol API expects.

        const orderUid = await this.orderBookApi.sendOrder({
            ...quote, // This contains sellToken, buyToken, amounts, validTo, appData, etc.
            from,     // The user's address
            quoteId,  // The quote ID to link this order to the quote (validating appData)
            signature,
            signingScheme: 'eip712',
        });

        return orderUid;
    }
}
