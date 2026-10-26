"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonsProps {
  reportType: string;
  from?: string;
  to?: string;
}

export function ExportButtons({ reportType, from, to }: ExportButtonsProps) {
  function download(format: "csv" | "xlsx" | "pdf") {
    const params = new URLSearchParams({ type: reportType, format });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.location.href = `/api/reports/export?${params}`;
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => download("csv")}>
        <Download className="mr-2 h-4 w-4" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => download("xlsx")}>
        <Download className="mr-2 h-4 w-4" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={() => download("pdf")}>
        <Download className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
