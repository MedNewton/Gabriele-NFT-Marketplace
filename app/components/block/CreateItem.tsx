"use client";
import { product1 } from "@/data/product";
import ProductCard9 from "../card/ProductCard9";
import { useState, ChangeEvent } from "react";

export default function CreateItem(): JSX.Element {
    const [getImage, setImage] = useState<null | File>(null);

    // upload handler
    const uploadHandler = (e: ChangeEvent<HTMLInputElement>): void => {
        const file: File | null = e.target.files?.[0] || null;
        setImage(file);
    };

    return (
        <>
            <div className="tf-create-item tf-section">
                <div className="ibthemes-container">
                    <div className="row">
                        <div className="col-xl-3 col-lg-6 col-md-6 col-12">
                            <h4 className="title-create-item">Preview NFT</h4>
                            <ProductCard9 data={product1[0]} />
                        </div>
                        <div className="col-xl-9 col-lg-6 col-md-12 col-12">
                            <div className="form-create-item">
                                <form action="#">
                                    <h4 className="title-create-item">
                                        Upload file
                                    </h4>
                                    <label className="uploadFile">
                                        <span className="filename">
                                            {getImage !== null
                                                ? getImage?.name
                                                : `PNG, JPG, GIF, WEBP or MP4. Max
                                            200mb.`}
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
                                                <h4 className="title-create-item">
                                                    Collection
                                                </h4>
                                                <input
                                                    type="text"
                                                    placeholder="Enter collection name"
                                                />
                                                <h4 className="title-create-item">
                                                    Title
                                                </h4>
                                                <input
                                                    type="text"
                                                    placeholder="Enter NFT name"
                                                />
                                                <h4 className="title-create-item">
                                                    Description
                                                </h4>
                                                <textarea
                                                    placeholder="e.g. “This is very limited item”"
                                                    defaultValue={""}
                                                />
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
