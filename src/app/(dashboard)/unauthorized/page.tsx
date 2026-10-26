import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export const metadata: Metadata = { title: "Access Denied" };

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldOff className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="max-w-md text-muted-foreground">
        You do not have permission to view this page. Contact your administrator if you believe this is a mistake.
      </p>
      <Button asChild>
        <Link href="/">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
