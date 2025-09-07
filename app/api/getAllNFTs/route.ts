// app/api/nfts/route.ts
import { NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  parseAbi,
  parseEventLogs,
  type Hex,
} from "viem";
import { baseSepolia } from "viem/chains";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_COLLECTION_SMART_CONTRACT_ADDRESS as `0x${string}`;

const RPC_URL = process.env.BASE_TESTNET_RPC_URL!;
const START_BLOCK = process.env.NFT_START_BLOCK
  ? BigInt(process.env.NFT_START_BLOCK)
  : BigInt(0); // optional: start scanning from a known block

// Minimal ABI: Transfer event + tokenURI
const nftAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
]);

// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// 32-byte zero (topic encoding of address(0))
const ZERO_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL, { batch: true }),
});

// Resolve ipfs://... to an HTTPS gateway (change the gateway if you prefer)
function resolveIpfs(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    const path = uri.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${path}`;
  }
  return uri;
}

// Clean fetch with timeout
async function fetchJson(url: string, timeoutMs = 12_000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  try {
    if (!RPC_URL) {
      return NextResponse.json(
        { success: false, error: "Missing BASE_TESTNET_RPC_URL" },
        { status: 500 }
      );
    }
    if (!CONTRACT_ADDRESS) {
      return NextResponse.json(
        { success: false, error: "Missing NEXT_PUBLIC_COLLECTION_SMART_CONTRACT_ADDRESS" },
        { status: 500 }
      );
    }

    // Optional: read collection name/symbol (best-effort)
    let collectionName = "Collection";
    let collectionSymbol = "";
    try {
      collectionName = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: nftAbi,
        functionName: "name",
      });
      collectionSymbol = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: nftAbi,
        functionName: "symbol",
      });
    } catch {
      // ignore
    }

    // Get all mint logs: Transfer(from=0x0, to=*, tokenId)
    const rawLogs = await publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      fromBlock: START_BLOCK,
      toBlock: "latest",
      // Filter for mints using `from = address(0)` in topic[1]
    });

    // Parse logs to extract tokenIds
    const transfers = parseEventLogs({
      abi: nftAbi,
      logs: rawLogs,
      eventName: "Transfer",
    });

    // Unique tokenIds as strings
    const tokenIdSet = new Set<string>();
    for (const ev of transfers) {
      const from = (ev.args?.from ?? "").toLowerCase();
      if (from === "0x0000000000000000000000000000000000000000") {
        const tid = (ev.args?.tokenId as bigint | undefined)?.toString();
        if (tid) tokenIdSet.add(tid);
      }
    }

    const tokenIds = Array.from(tokenIdSet).sort((a, b) => BigInt(a) < BigInt(b) ? -1 : 1);

    // For each tokenId, read tokenURI + fetch metadata
    const items = await Promise.all(
      tokenIds.map(async (tokenIdStr, idx) => {
        let tokenUri = "";
        let meta: any = null;
        try {
          tokenUri = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: nftAbi,
            functionName: "tokenURI",
            args: [BigInt(tokenIdStr)],
          });
        } catch {
          // ignore
        }

        const resolved = resolveIpfs(tokenUri);

        try {
          if (resolved) {
            meta = await fetchJson(resolved);
          }
        } catch {
          // ignore metadata fetch errors; fallback to empty
        }

        const image = resolveIpfs(meta?.image || meta?.image_url || "");
        const title =
          meta?.name ||
          `${collectionName} #${tokenIdStr}`;
        const description =
          meta?.description || "";

        // Map to your ProductCard3 shape
        return {
          id: idx + 1,                // a simple sequential id for React keys
          status: "Minted",           // or "Not for sale" etc.
          hert: 0,                    // likes placeholder
          img: image || "/assets/images/box-item/card-item8.jpg",
          title,
          tag: collectionSymbol || "NFT",
          eth: undefined,             // unknown price (will render as —)
          author: {
            name: collectionName,
            avatar: "/assets/images/avatar/avt-1.jpg", // change to your collection image if you have one
          },
          tokenId: tokenIdStr,
          tokenURI: tokenUri,
        };
      })
    );

    return NextResponse.json({ success: true, items });
  } catch (e: any) {
    console.error("NFT list error:", e);
    return NextResponse.json(
      { success: false, error: e?.message || "Failed to load NFTs" },
      { status: 500 }
    );
  }
}
