import { auth } from "@/lib/auth";
import { MobileNav } from "./mobile-nav";
import { GlobalSearch } from "./global-search";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { Breadcrumbs } from "./breadcrumbs";

export async function Topbar() {
  const session = await auth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <MobileNav />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch />
        <ThemeToggle />
        <NotificationBell />
        <UserMenu user={session?.user} />
      </div>
    </header>
  );
}
