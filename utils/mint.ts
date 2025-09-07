import {
    createPublicClient,
    createWalletClient,
    http,
    parseAbi,
    encodeFunctionData,
    parseEventLogs,
    type PublicClient,
    type WalletClient,
    type Transport,
  } from "viem";
  import { baseSepolia } from "viem/chains";
  import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
  
  const nftAbi = parseAbi([
    "function mintNFT(address recipient, string tokenURI) returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "function owner() view returns (address)",
  ]);
  
  type Clients = {
    account: PrivateKeyAccount;
    publicClient: PublicClient<Transport, typeof baseSepolia>;
    walletClient: WalletClient<Transport, typeof baseSepolia, PrivateKeyAccount>;
  };
  
  let clients: Clients | null = null;
  
  /** Lazy-initialize clients; no top-level env access/throws */
  function getClients(): Clients {
    if (clients) return clients;
  
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error("Missing PRIVATE_KEY in environment variables");
  
    const privateKey = (pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`;
    if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      throw new Error("Invalid PRIVATE_KEY format - must be 64 hex characters");
    }
  
    const rpc = process.env.BASE_TESTNET_RPC_URL;
    if (!rpc) throw new Error("Missing BASE_TESTNET_RPC_URL");
  
    const account = privateKeyToAccount(privateKey);
  
    const transport = http(rpc, { batch: false }) as Transport;
  
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport,
    }) as PublicClient<Transport, typeof baseSepolia>;
  
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport,
    }) as WalletClient<Transport, typeof baseSepolia, PrivateKeyAccount>;
  
    clients = { account, publicClient, walletClient };
    return clients;
  }
  
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
      const { account, walletClient, publicClient } = getClients();
  
      const data = encodeFunctionData({
        abi: nftAbi,
        functionName: "mintNFT",
        args: [recipientAddress, tokenURI],
      });
  
      const gas = await publicClient.estimateGas({
        account: account.address,
        to: contractAddress,
        data,
      });

      const hash = await walletClient.sendTransaction({
        to: contractAddress,
        data,
        gas,
      });
  
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });
  
      const transfers = parseEventLogs({
        abi: nftAbi,
        logs: receipt.logs,
        eventName: "Transfer",
      });
      const tokenId = transfers.at(-1)?.args?.tokenId as bigint | undefined;
  
      return {
        success: true,
        transactionHash: hash,
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
          const reason = error.message.match(/reason: (.*?)\n/)?.[1] || "Contract reverted";
          errorMessage = `Smart contract error: ${reason}`;
        } else if (error.message.includes("403")) {
          errorMessage = "RPC access denied - check your API key";
        } else {
          errorMessage = error.message;
        }
      }
  
      return { success: false, error: errorMessage };
    }
  }
  
  export function isValidAddress(address: string): address is `0x${string}` {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  export function isValidTokenURI(uri: string): boolean {
    return (
      uri.length > 0 &&
      (uri.startsWith("ipfs://") || uri.startsWith("http://") || uri.startsWith("https://"))
    );
  }
  
  export async function getAccountBalance() {
    const { account, publicClient } = getClients();
    return publicClient.getBalance({ address: account.address });
  }
  
  export async function verifyContractOwner(contractAddress: `0x${string}`) {
    try {
      const { publicClient } = getClients();
      return await publicClient.readContract({
        address: contractAddress,
        abi: nftAbi,
        functionName: "owner",
      });
    } catch {
      return null;
    }
  }
  