import { Request, Response } from 'express';
import { SwapService } from '../services/swapService';

const swapService = new SwapService(); // Default to Mainnet for now, or extract from req

export const getQuote = async (req: Request, res: Response) => {
    try {
        const params = req.body;
        // Basic validation could go here
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
        const orderId = await swapService.submitOrder(params);
        res.json({ orderId });
    } catch (error: any) {
        console.error('Error submitting order:', error);
        res.status(500).json({ error: error.message });
    }
};
