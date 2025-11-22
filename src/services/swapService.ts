import { ISwapAdapter, QuoteParams, OrderParams } from '../adapters/interfaces/ISwapAdapter';
import { CowSwapAdapter } from '../adapters/cowSwapAdapter';
import { SupportedChainId } from '@cowprotocol/cow-sdk';

export class SwapService {
    private adapter: ISwapAdapter;

    constructor(chainId: number = 1) {
        // Factory logic could go here, for now defaulting to CowSwap
        // Mapping number to SupportedChainId
        const supportedChainId = chainId === 11155111 ? SupportedChainId.SEPOLIA : SupportedChainId.MAINNET;
        this.adapter = new CowSwapAdapter(supportedChainId);
    }

    async getQuote(params: QuoteParams) {
        return this.adapter.getQuote(params);
    }

    async submitOrder(params: OrderParams) {
        return this.adapter.submitOrder(params);
    }
}
