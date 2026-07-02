"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isNavItemActive } from "@/lib/nav";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-mesmer-border bg-mesmer-surface md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium whitespace-nowrap",
              active ? "text-mesmer-primary" : "text-mesmer-text-muted",
            )}
          >
            <Icon className="size-5" />
            {item.mobileLabel ?? item.label}
          </Link>
        );
      })}
    </nav>
  );
}
