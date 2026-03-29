"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BabelLogo from "./BabelLogo";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Translate", href: "/translate" },
  { label: "Train", href: "/train" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-celadon shrink-0">
      <Link href="/">
        <BabelLogo />
      </Link>
      <ul className="flex items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`
                  px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-black text-white"
                      : "text-black hover:bg-black hover:text-white"
                  }
                `}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
