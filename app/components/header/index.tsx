// Header.tsx
"use client";
import Link from "next/link";
import Navigation from "./Navigation";
import Mode from "./Mode";
import useDarkModeCheck from "@/hooks/useDarkModeCheck";
import { usePathname } from "next/navigation";
import useStickyMenu from "@/hooks/useStickyMenu";
import AdminBar from "./AdminBar";
import ConnectWalletButton from "./connectButton";
import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Header(): JSX.Element {
  const path = usePathname();
  const isDark = useDarkModeCheck();
  const isSticky1 = useStickyMenu(200);
  const isSticky2 = useStickyMenu(250);

  const account = useActiveAccount();
  const ensureUser = useMutation(api.users.ensureByWallet);

  // prevent duplicate calls (StrictMode)
  const ensuredFor = useRef<string | null>(null);

  useEffect(() => {
    const addr = account?.address;
    if (!addr) return;

    // skip if we already ensured for this address
    if (ensuredFor.current === addr) return;

    ensureUser({ walletAddress: addr })
      .catch((err) => {
        // optional: log or toast
        console.error("ensureUser failed:", err);
      })
      .finally(() => {
        ensuredFor.current = addr;
      });
  }, [account?.address, ensureUser]);

  return (
    <>
      <header
        id="header_main"
        className={
          path !== "/home-8"
            ? `header_1 js-header style ${
                path === "/text-type" ||
                path === "/text-scroll" ||
                path === "/home-5" ||
                path === "/home-6" ||
                path === "/home-7" ||
                path === "/home-8"
                  ? "header_2 style2"
                  : ""
              } ${isSticky1 ? "is-fixed" : ""} ${isSticky2 ? "is-small" : ""}`
            : `header_1 header_2 style2 style3 js-header position-fixed`
        }
      >
        <div className="ibthemes-container">
          <div className="row">
            <div className="col-md-12">
              <div id="site-header-inner">
                <div className="wrap-box d-flex align-items-center w-100">
                  <div id="site-logo" className="clearfix">
                    <div id="site-logo-inner">
                      <Link href="/" rel="home" className="main-logo text-decoration-none">
                        <Image
                          id="logo_header"
                          src={`/assets/images/logo/gabriele-logo.png`}
                          alt="nft-gaming"
                          width={133}
                          height={56}
                        />
                      </Link>
                    </div>
                  </div>

                  <div
                    data-bs-toggle="offcanvas"
                    data-bs-target="#menu"
                    aria-controls="menu"
                    className="mobile-button ms-3"
                    role="button"
                  >
                    <span />
                  </div>

                  <div className="ms-4">
                    <Navigation />
                  </div>

                  <div className="ms-auto d-flex align-items-center me-3">
                    <ConnectWalletButton />
                    {account && <AdminBar />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Mode />
      </header>
    </>
  );
}
