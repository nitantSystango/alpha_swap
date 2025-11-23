import { Request, Response } from 'express';
import { SwapService } from '../services/swapService';


export const getQuote = async (req: Request, res: Response) => {
    try {
        const params = req.body;
        const chainId = params.chainId || 1; // Default to Mainnet if not provided

        // Create SwapService with the correct chainId
        const swapService = new SwapService(chainId);

        const quote = await swapService.getQuote(params);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(quote, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    } catch (error: any) {
        console.error('Error getting quote:', error);
        res.status(500).json({ error: error.message });
    }
};


export const submitOrder = async (req: Request, res: Response) => {
    try {
        const params = req.body;
        const chainId = params.chainId || 1; // Default to Mainnet if not provided

        // Create SwapService with the correct chainId
        const swapService = new SwapService(chainId);

        const orderId = await swapService.submitOrder(params);
        res.json({ orderId });
    } catch (error: any) {
        console.error('Error submitting order:', error);
        res.status(500).json({ error: error.message });
    }
};
