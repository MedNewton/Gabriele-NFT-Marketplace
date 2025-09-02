import { Metadata } from "next";
import Breadcrumb from "../components/breadcrumb";
import CreateCollection from "../components/block/createCollection";

const item = {
    title: "Create Collection",
    breadcrumb: [
       
    ],
};

export const metadata: Metadata = {
    title: "Gabriele | NFT Marketplace | Create Collection",
};

export default function page(): JSX.Element {
    return (
        <>
            <Breadcrumb data={item} />
            <CreateCollection />
        </>
    );
}
