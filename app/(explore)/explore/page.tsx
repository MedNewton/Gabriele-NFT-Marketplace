import Explore1 from "@/app/components/block/Explore1";
import Breadcrumb from "@/app/components/breadcrumb";
import LiveAuctionModal from "@/app/components/modal/LiveAuctionModal";
import { Metadata } from "next";

const item = {
    title: "Explore",
    breadcrumb: [],
};

export const metadata: Metadata = {
    title: "Gabriele | NFT Marketplace | Explore",
};

export default function page(): JSX.Element {
    return (
        <>
            <Breadcrumb data={item} />
            <Explore1 />

            {/* live auction product modal */}
            <LiveAuctionModal />
        </>
    );
}
