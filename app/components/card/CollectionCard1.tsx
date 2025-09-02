"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Props {
    data: {
        id: number;
        name: string;
        symbol: string;
        imageId: string;
        description: string;
        author: {
            name: string;
        };
    };
}

export default function CollectionCard1({ data }: Props): JSX.Element {
    const imageId = data.imageId as Id<"_storage">;
    const imageUrl = useQuery(api.collections.getUrl, { imageId });

    return (
        <>
            <div className="slider-item">
                <div className="sc-card-collection style-2 home2">
                    <div className="card-bottom">
                        <div className="author">
                            <div className="sc-author-box style-2">
                                <div className="author-avatar">
                                    <Image
                                        height={100}
                                        width={100}
                                        src={imageUrl ?? ""}
                                        alt="Avatar"
                                        className="avatar"
                                    />
                                </div>
                            </div>
                            <div className="content">
                                <h4>
                                    <Link href="authors-1">
                                        {data.name}
                                    </Link>
                                </h4>
                                <div className="infor">
                                    <span>Created by</span>
                                    <span className="name">
                                        <Link href="authors-2">
                                            {data.author.name}
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
