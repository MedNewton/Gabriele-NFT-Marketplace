// app/api/mint/route.ts
import { mintNFT, isValidAddress, isValidTokenURI } from '@/utils/mint';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this route is dynamic

export async function POST(request: Request) {
    try {
        // Parse the request body
        const { recipientAddress, tokenURI } = await request.json();

        // Validate input
        if (!recipientAddress || !tokenURI) {
            return NextResponse.json(
                { success: false, error: 'Both recipientAddress and tokenURI are required' },
                { status: 400 }
            );
        }

        if (!isValidAddress(recipientAddress)) {
            return NextResponse.json(
                { success: false, error: 'Invalid recipient address format' },
                { status: 400 }
            );
        }

        if (!isValidTokenURI(tokenURI)) {
            return NextResponse.json(
                { success: false, error: 'Token URI must start with ipfs://, http://, or https://' },
                { status: 400 }
            );
        }

        // Your deployed contract address (replace with your actual address)
        const contractAddress = '0x2Fcb8200b5B20F2eC53c80D95941eC7aE8145d26';

        // Mint the NFT
        const result = await mintNFT(
            contractAddress,
            recipientAddress,
            tokenURI
        );

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || 'Minting failed' },
                { status: 500 }
            );
        }

        // Return successful response
        return NextResponse.json({
            success: true,
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber?.toString(),
            tokenId: result.tokenId?.toString(),
        });

    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optional: Add GET method to check service status
export async function GET() {
    return NextResponse.json({
        status: 'ready',
        network: 'Base Sepolia',
        contract: '0x2Fcb8200b5B20F2eC53c80D95941eC7aE8145d26',
    });
}