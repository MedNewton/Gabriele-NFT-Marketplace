import { Metadata } from "next";
import Breadcrumb from "../components/breadcrumb";
import MyCollections from "../components/block/MyCollections";
const item = {
    title: "My Collections",
    breadcrumb: [
       
    ],
};

export const metadata: Metadata = {
    title: "Gabriele | NFT Marketplace | My Collections",
};

export default function page(): JSX.Element {
    return (
        <>
            <Breadcrumb data={item} />
            <MyCollections />
        </>
    );
}
