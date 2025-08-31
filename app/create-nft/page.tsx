import { Metadata } from "next";
import Breadcrumb from "../components/breadcrumb";
import CreateItem from "../components/block/CreateItem";

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
            <CreateItem />
        </>
    );
}
