import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [products, transfers, grns] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { barcode: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, sku: true },
    }),
    prisma.transfer.findMany({
      where: { transferNumber: { contains: q, mode: "insensitive" } },
      take: 3,
      select: { id: true, transferNumber: true, status: true },
    }),
    prisma.gRN.findMany({
      where: { grnNumber: { contains: q, mode: "insensitive" } },
      take: 3,
      select: { id: true, grnNumber: true, status: true },
    }),
  ]);

  return NextResponse.json({
    results: [
      ...products.map((p) => ({ type: "product", id: p.id, label: p.name, sub: p.sku, href: `/products/${p.id}` })),
      ...transfers.map((t) => ({ type: "transfer", id: t.id, label: t.transferNumber, sub: t.status, href: `/transfers/${t.id}` })),
      ...grns.map((g) => ({ type: "grn", id: g.id, label: g.grnNumber, sub: g.status, href: `/grn/${g.id}` })),
    ],
  });
}
