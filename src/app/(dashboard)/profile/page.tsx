import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/admin/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      createdAt: true,
      role: { select: { name: true } },
    },
  });
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your account settings" />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfileForm initialName={user.name ?? ""} initialEmail={user.email} />
          <div className="border-t pt-4 text-sm text-muted-foreground">
            <p>Role: {user.role?.name ?? "No role assigned"}</p>
            <p className="mt-1">Account created {formatDate(user.createdAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
