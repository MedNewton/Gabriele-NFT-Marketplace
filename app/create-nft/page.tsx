import { Metadata } from "next";
import Breadcrumb from "../components/breadcrumb";
import CreateNFT from "../components/block/createNFT";

const item = {
    title: "Create NFT",
    breadcrumb: [
       
    ],
};

export const metadata: Metadata = {
    title: "Gabriele | NFT Marketplace | Create Item",
};

export default function page(): JSX.Element {
    return (
        <>
            <Breadcrumb data={item} />
            <CreateNFT />
        </>
    );
}
