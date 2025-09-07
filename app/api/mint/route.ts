// app/api/mint/route.ts
import { mintNFT, isValidAddress, isValidTokenURI } from "@/utils/mint";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_COLLECTION_SMART_CONTRACT_ADDRESS as `0x${string}`;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const { recipientAddress, tokenURI } = await request.json();

    if (!recipientAddress || !tokenURI) {
      return NextResponse.json(
        { success: false, error: "Both recipientAddress and tokenURI are required" },
        { status: 400 }
      );
    }

    if (!isValidAddress(recipientAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient address format" },
        { status: 400 }
      );
    }

    if (!isValidTokenURI(tokenURI)) {
      return NextResponse.json(
        { success: false, error: "Token URI must start with ipfs://, http://, or https://" },
        { status: 400 }
      );
    }

    if (!CONTRACT_ADDRESS) {
      return NextResponse.json(
        { success: false, error: "Server misconfigured: missing NFT_CONTRACT_ADDRESS" },
        { status: 500 }
      );
    }

    const result = await mintNFT(CONTRACT_ADDRESS, recipientAddress, tokenURI);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Minting failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber?.toString(),
      tokenId: result.tokenId?.toString(),
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ready", contract: CONTRACT_ADDRESS ?? null });
}
