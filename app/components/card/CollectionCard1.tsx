import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Props {
  data: {
    _id: Id<"collections">;
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
                  <Link href={`/collection/${data._id}`}>
                    {data.name}
                  </Link>
                </h4>
                <div className="infor">
                  <span>Created by&nbsp;</span>
                  <span className="name">{data.author.name}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="description mt-3">
            <p>
              {data.description.length > 100
                ? data.description.slice(0, 100) + "..."
                : data.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
