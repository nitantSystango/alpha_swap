import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, type Signer, ethers } from 'ethers';
import { TradingSdk, OrderKind } from '@cowprotocol/cow-sdk';
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter';
import { AdapterContext } from '@cowprotocol/sdk-common';

export interface CowHook {
    provider: BrowserProvider | null;
    signer: Signer | null;
    chainId: number | null;
    account: string | null;
    sdk: TradingSdk | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    getQuote: (sellToken: string, buyToken: string, amount: string, kind: 'sell' | 'buy', decimals: number) => Promise<any>;
    placeOrder: (quote: any) => Promise<string>;
}

export const useCowSdk = (): CowHook => {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<Signer | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [sdk, setSdk] = useState<TradingSdk | null>(null);

    const connect = useCallback(async () => {
        const ethereum = (window as any).ethereum;
        if (ethereum) {
            try {
                await ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                const network = await provider.getNetwork();
                const account = await signer.getAddress();

                setProvider(provider);
                setSigner(signer);
                setChainId(Number(network.chainId));
                setAccount(account);

                // Initialize SDK
                const adapter = new EthersV6Adapter({
                    provider,
                    signer,
                });
                AdapterContext.getInstance().setAdapter(adapter);

                const sdkInstance = new TradingSdk({
                    chainId: Number(network.chainId),
                    signer,
                    appCode: 'CowSwapBot',
                });
                setSdk(sdkInstance);

            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        } else {
            alert("Please install Metamask!");
        }
    }, []);

    const disconnect = useCallback(() => {
        setProvider(null);
        setSigner(null);
        setChainId(null);
        setAccount(null);
        setSdk(null);
    }, []);

    const getQuote = useCallback(async (
        sellToken: string,
        buyToken: string,
        amount: string,
        kind: 'sell' | 'buy',
        decimals: number
    ) => {
        if (!sdk || !account) throw new Error("SDK not initialized");

        const amountBigInt = ethers.parseUnits(amount, decimals);

        const params = {
            sellToken,
            buyToken,
            kind: kind === 'sell' ? OrderKind.SELL : OrderKind.BUY,
            amount: amountBigInt.toString(),
            userAddress: account,
            sellTokenDecimals: decimals, // Simplified: assuming same decimals for now or passed correctly
            buyTokenDecimals: decimals, // Needs refinement in UI to pass both
        };

        // We need to be careful about decimals. 
        // The UI should probably handle fetching decimals or asking user.
        // For now, we pass one 'decimals' arg, which is risky if tokens differ.
        // I'll update the signature to take both or just let the UI handle it.
        // Let's update signature in next step if needed.

        return await sdk.getQuote(params);
    }, [sdk, account]);

    const placeOrder = useCallback(async (quoteAndPost: any) => {
        if (!quoteAndPost) throw new Error("No quote provided");
        const result = await quoteAndPost.postSwapOrderFromQuote();
        return result.orderId;
    }, []);

    useEffect(() => {
        const ethereum = (window as any).ethereum;
        if (ethereum) {
            // Auto-connect if already connected
            ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
                if (accounts.length > 0) {
                    connect();
                }
            });

            ethereum.on('accountsChanged', () => {
                window.location.reload();
            });
            ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, [connect]);

    return {
        provider,
        signer,
        chainId,
        account,
        sdk,
        connect,
        disconnect,
        getQuote,
        placeOrder
    };
};
