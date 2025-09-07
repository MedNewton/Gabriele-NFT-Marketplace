"use client";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard9({ data }: any): JSX.Element {
    return (
        <>
            <div className="sc-card-product">
                <div className="card-media">
                    <Link href="/item-details-1" onClick={(e) => {
                        e.preventDefault();
                    }}>
                        <Image
                            height={500}
                            width={500}
                            src={data.img}
                            alt="Image"
                        />
                    </Link>
                </div>
                <div className="card-title">
                    <h5>
                        <Link href="/item-details-1" onClick={(e) => {
                            e.preventDefault();
                        }}>{data.title}</Link>
                    </h5>
                </div>
                <div className="meta-info">
                    <div className="author">
                        <div className="info">
                            <span>Description</span>
                            <p>
                                <Link href="/item-details-1" onClick={(e) => {
                                    e.preventDefault();
                                }}>{data.description.length > 50 ? data.description.substring(0, 50) + " ..." : data.description}</Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="meta-info">
                    <div className="author">
                        <div className="info">
                            <span>Collection</span>
                            <h6>
                                <Link href="/authors-2" onClick={(e) => {
                                    e.preventDefault();
                                }}>
                                    {data.collection.name}
                                </Link>
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
