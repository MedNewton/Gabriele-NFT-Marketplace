"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { product2 } from "@/data/product";
import Link from "next/link";
import CollectionCard1 from "../card/CollectionCard1";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react";

export default function MyCollections(): JSX.Element {
    const account = useActiveAccount();
    const connectionStatus = useActiveWalletConnectionStatus();
    const walletLoading = connectionStatus === "unknown" || connectionStatus === "connecting";
    const walletConnected = connectionStatus === "connected" && !!account;
    const myCollections = useQuery(api.collections.getByCreator, {
        creator: account?.address ?? ""
    });

    const creator = useQuery(api.users.getByWalletAddress, {
        walletAddress: account?.address ?? ""
    });

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
            <section className="tf-section live-auctions style4 no-pt-mb mobie-style">
                <div className="ibthemes-container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="heading-live-auctions">
                                <h2 className="tf-title pb-17 text-left text-white hidden-title">
                                    &nbsp;
                                </h2>
                                <Link href="/create-collection" className="exp style2">
                                    Create a new collection
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="collection">
                                <div className="swiper-container show-shadow carousel4 pad-t-20 button-arow-style">
                                    <Swiper
                                        slidesPerView={3}
                                        spaceBetween={30}
                                        modules={[Navigation]}
                                        className="mySwiper swiper-container show-shadow carousel pad-t-17 auctions"
                                        breakpoints={{
                                            0: {
                                                slidesPerView: 1,
                                            },
                                            769: {
                                                slidesPerView: 2,
                                            },
                                            1024: {
                                                slidesPerView: 3,
                                            },
                                        }}
                                    >
                                        {myCollections?.map((item) => (
                                            <SwiperSlide key={item._id}>
                                                <CollectionCard1 data={{
                                                    _id: item._id,
                                                    name: item.name,
                                                    symbol: item.symbol,
                                                    imageId: item.imageId,
                                                    description: item.description,
                                                    author: {
                                                        name: creator?.name ?? ""
                                                    }
                                                }} />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                    <div className="swiper-wrapper">
                                        <div className="swiper-slide"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
