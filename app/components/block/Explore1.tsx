"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Dropdown1 from "../dropdown/Dropdown1";
import ProductCard3 from "../card/ProductCard3";

import { getContract } from "thirdweb";
import { getNFTs } from "thirdweb/extensions/erc721";
import { baseSepolia } from "thirdweb/chains";
import client from "@/app/thirdwebClient";

type CardItem = {
  id: number;
  status: string;
  hert: number;
  img: string;
  title: string;
  tag: string;
  eth?: number;
  author: {
    name: string;
    avatar: string;
  };
  tokenId?: string;
  tokenURI?: string;
  description?: string;
};

const PAGE_SIZE = 8;
const LOAD_MORE_COUNT = 4;

const FALLBACK_IMG = "/assets/images/box-item/card-item8.jpg";
const FALLBACK_AVATAR = "/assets/images/avatar/avt-1.jpg";

/** Returns a valid Next/Image src or null if unusable */
function normalizeImageCandidate(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const uri = input.trim();
  if (!uri) return null;

  // Handle common IPFS variants
  if (uri.startsWith("ipfs://")) {
    const path = uri.replace(/^ipfs:\/\//, "").replace(/^ipfs\//, "");
    return `https://ipfs.io/ipfs/${path}`;
  }

  // Allow http/https, data:, blob:, and root-relative /
  if (/^https?:\/\//i.test(uri)) return uri;
  if (/^data:image\//i.test(uri)) return uri;
  if (/^blob:/i.test(uri)) return uri;
  if (uri.startsWith("/")) return uri;

  return null;
}

/** Normalize attributes from various metadata shapes into a simple map */
function extractAttributes(md: any): Record<string, string> {
  const out: Record<string, string> = {};
  const attrs = md?.attributes;

  // Common OpenSea-style: Array<{ trait_type, value }>
  if (Array.isArray(attrs)) {
    for (const a of attrs) {
      if (a && typeof a === "object") {
        const key =
          a.trait_type ??
          a.traitType ??
          a.trait ??
          a.type ??
          undefined;
        const val =
          a.value ??
          a.val ??
          a.display_value ??
          a.displayValue ??
          undefined;
        if (typeof key === "string" && typeof val !== "undefined") {
          out[String(key)] = String(val);
        }
      } else if (typeof a === "string") {
        // Rare: array of strings like "Color: Blue"
        const [k, ...rest] = a.split(":");
        if (k && rest.length) out[k.trim()] = rest.join(":").trim();
      }
    }
  }

  // Sometimes "attributes" is an object map: { Color: "Blue", Rarity: "Epic" }
  if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
    for (const [k, v] of Object.entries(attrs)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        out[k] = String(v);
      }
    }
  }

  // Some metadata use "properties" instead of "attributes"
  const props = md?.properties;
  if (props && typeof props === "object") {
    for (const [k, v] of Object.entries(props)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        out[k] = String(v);
      } else if (v && typeof v === "object" && "value" in v && (typeof (v as any).value === "string" || typeof (v as any).value === "number")) {
        out[k] = String((v as any).value);
      }
    }
  }

  return out;
}

export default function Explore1() {
  const [items, setItems] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const collectionAddress = process.env
    .NEXT_PUBLIC_COLLECTION_SMART_CONTRACT_ADDRESS as `0x${string}` | undefined;

  const contract = useMemo(() => {
    if (!collectionAddress) return null;
    return getContract({
      client,
      chain: baseSepolia, // change if needed
      address: collectionAddress,
    });
  }, [collectionAddress]);

  const mapNftsToCards = useCallback((nfts: any[], startIndex: number): CardItem[] => {
    return nfts.map((nft, i) => {
      const md = (nft?.metadata ?? {}) as Record<string, any>;

      // Extract attributes robustly
      const attrs = extractAttributes(md);
      const collectionName =
        attrs["Collection"] ??
        attrs["collection"] ??
        md?.collection ??
        "Collection";

      const img =
        normalizeImageCandidate(md.image) ??
        normalizeImageCandidate(md.image_url) ??
        FALLBACK_IMG;

      const title =
        typeof md.name === "string" && md.name.trim()
          ? md.name
          : `Token #${String(nft?.id ?? "")}`;

      const description =
        typeof md.description === "string" ? md.description : "";

      return {
        id: startIndex + i + 1,
        status: "Minted",
        hert: 0,
        img,
        title,
        tag: "NFT",
        eth: 0, // no on-chain price in ERC-721 metadata
        author: {
          name: collectionName, // ✅ from attributes (or fallback)
          avatar: FALLBACK_AVATAR,
        },
        tokenId: typeof nft?.id === "bigint" ? nft.id.toString() : String(nft?.id ?? ""),
        tokenURI: (nft as any)?.tokenURI,
        description,
      };
    });
  }, []);

  const fetchPage = useCallback(
    async (start: number, count: number) => {
      if (!contract) throw new Error("Contract not configured");
      const nfts = await getNFTs({ contract, start, count });
      return mapNftsToCards(nfts, start);
    },
    [contract, mapNftsToCards]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        if (!collectionAddress) throw new Error("Missing NEXT_PUBLIC_COLLECTION_SMART_CONTRACT_ADDRESS");
        if (!contract) throw new Error("Failed to initialize contract");
        const firstPage = await fetchPage(0, PAGE_SIZE);
        if (!cancelled) setItems(firstPage);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load NFTs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contract, collectionAddress, fetchPage]);

  const loadMoreHandler = async () => {
    try {
      setLoadingMore(true);
      const nextStart = items.length;
      const next = await fetchPage(nextStart, LOAD_MORE_COUNT);
      setItems((prev) => [...prev, ...next]);
    } catch (e: any) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <div className="tf-section sc-explore-1">
        <div className="ibthemes-container">
          <div className="row">
            <div className="col-md-12">
              <div className="wrap-box explore-1 flex mg-bt-40">
                <div className="seclect-box style-1">
                  <Dropdown1
                    id="item_category"
                    defaultSelect="All categories"
                    data={[
                      "Art",
                      "Music",
                      "Domain Names",
                      "Virtual World",
                      "Trading Cards",
                      "Sports",
                      "Utility",
                    ]}
                  />
                  <Dropdown1 id="buy" defaultSelect="Buy Now" data={["On Auction", "Has Offers"]} />
                  <Dropdown1 id="all-items" defaultSelect="All Items" data={["Single Items", "Bundles"]} />
                </div>
                <div className="seclect-box style-2 box-right">
                  <Dropdown1
                    id="artworks"
                    defaultSelect="All Artworks"
                    data={[
                      "Abstraction",
                      "Skecthify",
                      "Patternlicious",
                      "Virtuland",
                      "Virtuland",
                      "Papercut",
                    ]}
                  />
                  <Dropdown1 id="sort-by" defaultSelect="Sort by" data={["Top rate", "Mid rate", "Low rate"]} />
                </div>
              </div>
            </div>

            {loading && (
              <div className="col-12">
                <p>Loading NFTs…</p>
              </div>
            )}
            {error && !loading && (
              <div className="col-12">
                <p style={{ color: "#dc2626" }}>Error: {error}</p>
              </div>
            )}

            {!loading &&
              !error &&
              items.map((item) => (
                <div key={`${item.id}-${item.tokenId ?? "x"}`} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <ProductCard3 data={item} />
                </div>
              ))}

            {!loading && !error && items.length > 0 && (
              <div className="col-md-12 wrap-inner load-more text-center">
                <button
                  onClick={loadMoreHandler}
                  id="loadmore"
                  className="sc-button loadmore fl-button pri-3"
                  disabled={loadingMore}
                >
                  <span>{loadingMore ? "Loading..." : "Load More"}</span>
                </button>
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="col-12">
                <p>No NFTs found for this collection yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
