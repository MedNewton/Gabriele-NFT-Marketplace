"use client";
import Link from "next/link";
import Navigation from "./Navigation";
import Mode from "./Mode";
import useDarkModeCheck from "@/hooks/useDarkModeCheck";
import { usePathname } from "next/navigation";
import useStickyMenu from "@/hooks/useStickyMenu";
import AdminBar from "./AdminBar";
import Image from "next/image";

export default function Header(): JSX.Element {
  const path = usePathname();
  const isDark = useDarkModeCheck();
  const isSticky1 = useStickyMenu(200);
  const isSticky2 = useStickyMenu(250);

  const showWallet = ![
    "/authors-1",
    "/authors-2",
    "/create-item",
    "/edit-profile",
  ].includes(path || "");

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
                <div className="wrap-box flex">
                  <div id="site-logo" className="clearfix">
                    <div id="site-logo-inner">
                      <Link href="/" rel="home" className="main-logo">
                        <p className="text-2xl font-bold"></p>
                      </Link>
                    </div>
                  </div>

                  <div
                    data-bs-toggle="offcanvas"
                    data-bs-target="#menu"
                    aria-controls="menu"
                    className="mobile-button "
                  >
                    <span />
                  </div>

                  <Navigation />

                  {/* RIGHT END GROUP: Wallet + Mode (+ AdminBar if you like here) */}
                    
                    <Mode />
                    <AdminBar />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Removed the separate <Mode /> here */}
      </header>
    </>
  );
}
