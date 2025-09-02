"use client";

import Link from "next/link";
import { CgProfile } from "react-icons/cg";
import { MouseEvent } from "react";

export default function ProfileNavItem(): JSX.Element {
  const stop = (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault(); // keep anchor for theme hover/arrow

  return (
    <li className="menu-item menu-item-has-children">
      {/* trigger: keep as <a> so your theme's hover CSS applies */}
      <a href="#" onClick={stop} aria-haspopup="true" aria-expanded="false">
        <CgProfile size={22} />
      </a>

      {/* dropdown: same structure/classes as your nav */}
      <ul className="sub-menu">
        <li className="menu-item">
          <Link href="/profile">My Profile</Link>
        </li>
        <li className="menu-item">
          <Link href="/edit-profile">Settings</Link>
        </li>
        <li className="menu-item">
          <Link href="/logout">Log out</Link>
        </li>
      </ul>
    </li>
  );
}
