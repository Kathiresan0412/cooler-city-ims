"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface InvoicePrintProps {
  saleId: string;
}

export function InvoicePrint({ saleId }: InvoicePrintProps) {
  function print() {
    window.open(`/api/reports/export?type=invoice&format=pdf&id=${saleId}`, "_blank");
  }

  return (
    <Button variant="outline" onClick={print}>
      <Printer className="mr-2 h-4 w-4" />
      Print Invoice
    </Button>
  );
}
