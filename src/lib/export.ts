export async function exportReport({
  type,
  format,
  from,
  to,
}: {
  type: string;
  format: "csv" | "xlsx" | "pdf";
  from?: string;
  to?: string;
}) {
  const csv = `type=${type}\nformat=${format}\nfrom=${from ?? ""}\nto=${to ?? ""}`;
  const buffer = Buffer.from(csv, "utf8");

  return {
    buffer,
    contentType: format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8",
    filename: `${type}-report.${format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : "csv"}`,
  };
}
