"use client";

import Link from "next/link";
import { useState } from "react";
import { CgProfile } from "react-icons/cg";

export default function ProfileDropdownIcon(): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`profile-menu menu-item menu-item-has-children ${open ? "open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger (icon) */}
      <a
        className="icon-link"
        onClick={() => setOpen((s) => !s)} // tap/click support (mobile)
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <CgProfile size={24} />
      </a>

      {/* Dropdown */}
      <ul className="sub-menu">
        <li className="menu-item">
          <Link href="/profile">My Profile</Link>
        </li>

        <li className="divider" aria-hidden="true" />

        <li className="menu-item">
          <Link href="/edit-profile">Settings</Link>
        </li>

        <li className="divider" aria-hidden="true" />

        <li className="menu-item">
          <Link href="/logout">Log out</Link>
        </li>
      </ul>

      {/* minimal scoped styles to ensure hover works even outside <nav> */}
      <style jsx>{`
        .profile-menu {
          position: relative;
          display: inline-block;
        }
        .icon-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          user-select: none;
        }
        /* dropdown panel */
        .profile-menu .sub-menu {
          position: absolute;
          right: 0;
          top: 100%;
          min-width: 220px;
          margin: 0;
          padding: 8px 0;
          list-style: none;
          display: none; /* hidden by default */
          z-index: 1000;
        }
        /* show on hover OR when .open (click on mobile) */
        .profile-menu:hover > .sub-menu,
        .profile-menu.open > .sub-menu {
          display: block;
        }

        /* divider between items */
        .profile-menu .sub-menu .divider {
          height: 1px;
          margin: 6px 12px;
          background: rgba(255, 255, 255, 0.15);
        }

        /* Optional: tighten link spacing inside */
        .profile-menu .sub-menu .menu-item > :global(a) {
          display: block;
          padding: 8px 16px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
