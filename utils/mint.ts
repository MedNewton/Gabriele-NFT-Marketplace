// lib/nft.ts
import { createPublicClient, createWalletClient, http, parseAbi, encodeFunctionData } from "viem";
import { baseSepolia, base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// 1. Validate and format private key
if (!process.env.PRIVATE_KEY) {
    throw new Error("Missing PRIVATE_KEY in environment variables");
}

const privateKey = process.env.PRIVATE_KEY.startsWith('0x')
    ? process.env.PRIVATE_KEY
    : `0x${process.env.PRIVATE_KEY}`;

if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error("Invalid private key format - must be 64 hex characters");
}

const account = privateKeyToAccount(privateKey as `0x${string}`);
console.log("NFT Minter Account:", account.address);

const transport = http(process.env.BASE_TESTNET_RPC_URL, {
    batch: false,
});

export const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: transport,
});

export const publicClient = createPublicClient({
    chain: baseSepolia,
    transport,
});

const nftAbi = parseAbi([
    "function mintNFT(address recipient, string memory tokenURI) external returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

export type MintResult = {
    success: boolean;
    transactionHash?: `0x${string}`;
    blockNumber?: bigint;
    tokenId?: bigint;
    error?: string;
};

export async function mintNFT(
    contractAddress: `0x${string}`,
    recipientAddress: `0x${string}`,
    tokenURI: string
): Promise<MintResult> {
    try {
        console.log(`Initiating mint to ${recipientAddress} with URI: ${tokenURI}`);

        const baseGasPrice = await publicClient.getGasPrice();
        const gasPrice = (baseGasPrice * BigInt(120)) / BigInt(100);

        const encodedTransaction = encodeFunctionData({
            abi: nftAbi,
            functionName: "mintNFT",
            args: [recipientAddress, tokenURI],
        });

        const txHash = await walletClient.sendTransaction({
            from: account.address,
            to: contractAddress,
            data: encodedTransaction,
            gas: BigInt(200000),
            gasPrice,
        });

        console.log("Transaction sent:", txHash);

        const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 2,
        });

        let tokenId: bigint | undefined;
        if (receipt.logs) {
            for (const log of receipt.logs) {
                try {
                    if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' &&
                        log.topics.length === 4) {
                        const topic = log.topics[3];
                        if (typeof topic === 'string') {
                            tokenId = BigInt(topic);
                            break;
                        }
                    }
                } catch (e) {
                    console.warn("Log parsing error:", e);
                }
            }
        }

        return {
            success: true,
            transactionHash: txHash,
            blockNumber: receipt.blockNumber,
            tokenId,
        };

    } catch (error) {
        console.error("Minting Error:", error);

        let errorMessage = "Transaction failed";
        if (error instanceof Error) {
            if (error.message.includes("insufficient funds")) {
                errorMessage = "Insufficient funds for gas";
            } else if (error.message.includes("execution reverted")) {
                const revertReason = error.message.match(/reason: (.*?)\n/)?.[1] || "Contract reverted";
                errorMessage = `Smart contract error: ${revertReason}`;
            } else if (error.message.includes("403")) {
                errorMessage = "RPC access denied - check your API key";
            } else {
                errorMessage = error.message;
            }
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export function isValidAddress(address: string): address is `0x${string}` {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidTokenURI(uri: string): boolean {
    return uri.length > 0 && (
        uri.startsWith("ipfs://") ||
        uri.startsWith("http://") ||
        uri.startsWith("https://")
    );
}

export async function getAccountBalance() {
    return publicClient.getBalance({
        address: account.address
    });
}

export async function verifyContractOwner(contractAddress: `0x${string}`) {
    try {
        return await publicClient.readContract({
            address: contractAddress,
            abi: parseAbi(["function owner() view returns (address)"]),
            functionName: "owner",
        });
    } catch {
        return null;
    }
}
