import type { LucideIcon } from "lucide-react";
import { BarChart3, Box, Building2, ClipboardList, FileText, FolderOpen, Home, Package, PackageCheck, PackagePlus, Settings, ShieldCheck, Truck, Users, Warehouse, ArrowLeftRight, BellRing, ScanLine } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: {
    resource: string;
    action: string;
  };
};

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/sales", label: "Sales", icon: BarChart3 },
  { href: "/purchase-orders", label: "Purchase Orders", icon: FileText },
  { href: "/grn", label: "GRN", icon: PackageCheck },
  { href: "/returns", label: "Returns", icon: PackagePlus },
  { href: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { href: "/stock", label: "Stock", icon: Warehouse },
  { href: "/stock-take", label: "Stock Take", icon: ClipboardList },
  { href: "/locations", label: "Locations", icon: Building2 },
  { href: "/brands", label: "Brands", icon: FolderOpen },
  { href: "/categories", label: "Categories", icon: Box },
  { href: "/units", label: "Units", icon: Settings },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { href: "/notifications", label: "Notifications", icon: BellRing },
  { href: "/barcode", label: "Barcode", icon: ScanLine },
  { href: "/admin/users", label: "Users", icon: Users, permission: { resource: "users", action: "read" } },
  { href: "/admin/roles", label: "Roles", icon: Truck, permission: { resource: "roles", action: "read" } },
];
