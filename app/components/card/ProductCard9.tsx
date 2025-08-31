"use client";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard9({ data }: any): JSX.Element {
    return (
        <>
            <div className="sc-card-product">
                <div className="card-media">
                    <Link href="/item-details-1">
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
                        <Link href="/item-details-1">{data.title}</Link>
                    </h5>
                    <div className="tags">{data.tag}</div>
                </div>
                <div className="meta-info">
                    <div className="author">
                        <div className="avatar">
                            <Image
                                height={100}
                                width={100}
                                src={data.author.avatar}
                                alt="Image"
                            />
                        </div>
                        <div className="info">
                            <span>Owned By</span>
                            <h6>
                                <Link href="/authors-2">
                                    {data.author.name}
                                </Link>
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
