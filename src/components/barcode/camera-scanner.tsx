"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { Camera, CameraOff } from "lucide-react";

export function CameraScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<string | null>(null);
  const [product, setProduct] = useState<{ name: string; sku: string } | null>(null);
  const [active, setActive] = useState(false);
  const { startScan, stopScan } = useBarcodeScanner(videoRef, async (code) => {
    setResult(code);
    stopScan();
    setActive(false);
    const res = await fetch(`/api/barcode/${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      setProduct(data);
    }
  });

  function toggle() {
    if (active) {
      stopScan();
      setActive(false);
    } else {
      setResult(null);
      setProduct(null);
      startScan();
      setActive(true);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <video ref={videoRef} className="h-full w-full object-cover" />
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Camera inactive
          </div>
        )}
      </div>
      <Button onClick={toggle}>
        {active ? (
          <><CameraOff className="mr-2 h-4 w-4" /> Stop Scanner</>
        ) : (
          <><Camera className="mr-2 h-4 w-4" /> Start Scanner</>
        )}
      </Button>
      {result && (
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Scanned barcode</p>
          <p className="font-mono font-semibold">{result}</p>
          {product ? (
            <>
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Product not found</p>
          )}
        </div>
      )}
    </div>
  );
}
