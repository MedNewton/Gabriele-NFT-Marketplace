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
import { useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react";
import ProfileNavItem from "./ProfileNavItem";
import ProfileDropdownIcon from "./ProfileDropdownIcon";
import ProfileNavigation from "./ProfileNaviagtion";
export default function Header(): JSX.Element {
  const path = usePathname();
  const isDark = useDarkModeCheck();
  const isSticky1 = useStickyMenu(200);
  const isSticky2 = useStickyMenu(250);

  // thirdweb connection
  const account = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  const walletConnected = connectionStatus === "connected" && !!account;

  // pages where wallet button is hidden (keep your logic)


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
                  {/* Left: logo */}
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

                  {/* Mobile menu button */}
                  <div
                    data-bs-toggle="offcanvas"
                    data-bs-target="#menu"
                    aria-controls="menu"
                    className="mobile-button ms-3"
                    role="button"
                  >
                    <span />
                  </div>

                  {/* Navigation */}
                  <div className="ms-4">
                    <Navigation />
                  </div>

                  {/* Right group */}
                  <div className="ms-auto d-flex align-items-center me-3">
                    {/* If you want to hide the button when connected, change to: showWallet && !walletConnected */}
                    {<ConnectWalletButton />}
                    {walletConnected && <AdminBar />}
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
