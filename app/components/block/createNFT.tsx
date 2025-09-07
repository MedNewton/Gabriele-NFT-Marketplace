"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { useQuery, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProductCard9 from "../card/ProductCard9";
import Dropdown2 from "../dropdown/Dropdown2";
import { product1 } from "@/data/product";
import { useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react";

interface Collection {
    name: string;
    imageId: string;
    _id: string;
    imageUrl?: string;
}

export default function CreateNFT(): JSX.Element {
    const [getImage, setImage] = useState<null | File>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
    const [creating, setCreating] = useState<boolean>(false);

    // Add state for the preview
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

    const convex = useConvex(); // Get the Convex client

    const account = useActiveAccount();
    const connectionStatus = useActiveWalletConnectionStatus();
    const walletLoading = connectionStatus === "unknown" || connectionStatus === "connecting";
    const walletConnected = connectionStatus === "connected" && !!account;

    const myCollections = useQuery(api.collections.getByCreator, { creator: account?.address ?? "" });

    useEffect(() => {
        if (myCollections) {
            setCollections(myCollections);

            // Fetch image URLs for each collection
            const fetchImageUrls = async () => {
                const urls: { [key: string]: string } = {};
                for (const collection of myCollections) {
                    try {
                        const url = await convex.query(api.collections.getUrl, {
                            imageId: collection.imageId,
                        });
                        urls[collection._id] = url || "/assets/images/box-item/card-item8.jpg";
                    } catch (error) {
                        console.error("Failed to fetch image URL:", error);
                        urls[collection._id] = "/default-image.jpg";
                    }
                }
                setImageUrls(urls);
            };

            fetchImageUrls();
        }
    }, [myCollections, convex]);

    const uploadHandler = (e: ChangeEvent<HTMLInputElement>): void => {
        const file: File | null = e.target.files?.[0] || null;
        setImage(file);
    };

    const handleCollectionChange = (selectedValue: string) => {
        const selectedCollection = collections.find(
            (collection) => collection.name === selectedValue
        );
        if (selectedCollection) {
            setSelectedCollection(selectedCollection); // Set the selected collection object
            setSelectedCollectionId(selectedCollection._id); // Set the selected collection's _id
        }
    };

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    if (!walletConnected) {
        return (
            <div className="tf-connect-wallet tf-section">
                <div className="ibthemes-container">
                    <div className="row">
                        <div className="col-12">
                            <h2 className="tf-title-heading ct style-2 mg-bt-12">Connect Your Wallet</h2>
                            <h5 className="sub-title ct style-1 pad-400">
                                To create a collection, you need to connect your wallet.
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="tf-create-item tf-section">
                <div className="ibthemes-container">
                    <div className="row">
                        <div className="col-xl-3 col-lg-6 col-md-6 col-12">
                            <h4 className="title-create-item">Preview NFT</h4>
                            <ProductCard9
                                data={{
                                    img: getImage ? URL.createObjectURL(getImage) : "/assets/images/box-item/card-item8.jpg", // Preview uploaded image
                                    title: title || "NFT Title",
                                    description: description || "NFT Description",
                                    collection: selectedCollection || { name: "Select a collection" },
                                }}
                            />
                        </div>
                        <div className="col-xl-9 col-lg-6 col-md-12 col-12">
                            <div className="form-create-item">
                                <form action="#">
                                    <h4 className="title-create-item">Upload file</h4>
                                    <label className="uploadFile">
                                        <span className="filename">
                                            {getImage !== null
                                                ? getImage?.name
                                                : `PNG, JPG, GIF, WEBP or MP4. Max 200mb.`}
                                        </span>
                                        <input
                                            type="file"
                                            className="inputfile form-control"
                                            name="file"
                                            onChange={uploadHandler}
                                        />
                                    </label>
                                </form>
                                <div className="flat-tabs tab-create-item">
                                    <div className="content-tab">
                                        <div className="content-inner">
                                            <form action="#">
                                                <h4 className="title-create-item">Collection</h4>
                                                <Dropdown2
                                                    id="#full_item_category"
                                                    defaultSelect="All categories"
                                                    style={{
                                                        width: "100% !important",
                                                    }}
                                                    className="style-3"
                                                    data={collections.map(collection => ({
                                                        ...collection,
                                                        imageUrl: imageUrls[collection._id],
                                                    }))}
                                                    onChange={handleCollectionChange}
                                                />
                                                <h4 className="title-create-item">Title</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Enter NFT name"
                                                    value={title}
                                                    onChange={handleTitleChange}
                                                />
                                                <h4 className="title-create-item">Description</h4>
                                                <textarea
                                                    placeholder="e.g. “This is very limited item”"
                                                    value={description}
                                                    rows={6}
                                                    onChange={handleDescriptionChange}
                                                />
                                                <button
                                                    type="button"
                                                    className="sc-button loadmore style fl-button pri-3 mt-4"
                                                    onClick={() => setCreating(true)}
                                                    disabled={creating}
                                                    aria-busy={creating}
                                                >
                                                    {creating ? "Creating NFT..." : "Create NFT"}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
