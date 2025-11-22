import dotenv from 'dotenv';
import { Wallet, JsonRpcProvider } from 'ethers';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY) {
    console.warn('WARNING: PRIVATE_KEY is not defined in .env. Using a random wallet for testing purposes only. You will not be able to place real orders.');
}

if (!RPC_URL) {
    throw new Error('RPC_URL is not defined in .env');
}

export const provider = new JsonRpcProvider(RPC_URL);
export const wallet = PRIVATE_KEY ? new Wallet(PRIVATE_KEY, provider) : Wallet.createRandom(provider);
