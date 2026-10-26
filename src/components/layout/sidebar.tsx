"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/nav";
import { usePermission } from "@/hooks/use-permission";
import { siteConfig } from "@/config/site";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  const pathname = usePathname();
  const { can } = usePermission();

  const visibleItems = navItems.filter(
    (item) => !item.permission || can(item.permission.resource, item.permission.action)
  );

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-card lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-6">
        <span className="text-lg font-bold text-primary">{siteConfig.name}</span>
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-3">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
