"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeLabelProps {
  value: string;
  productName?: string;
  price?: string;
  width?: number;
  height?: number;
}

export function BarcodeLabel({ value, productName, price, width = 2, height = 60 }: BarcodeLabelProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width,
        height,
        displayValue: true,
        fontSize: 12,
        margin: 8,
      });
    }
  }, [value, width, height]);

  return (
    <div className="inline-flex flex-col items-center gap-1 rounded border p-2">
      {productName && <p className="text-xs font-medium text-center truncate max-w-[160px]">{productName}</p>}
      <svg ref={svgRef} />
      {price && <p className="text-xs font-bold">{price}</p>}
    </div>
  );
}
