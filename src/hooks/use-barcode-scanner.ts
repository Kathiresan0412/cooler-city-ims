"use client";

import { useCallback } from "react";

export function useBarcodeScanner(
  _videoRef: React.RefObject<HTMLVideoElement>,
  _onScan: (code: string) => void | Promise<void>
) {
  const startScan = useCallback(async () => {
    return undefined;
  }, []);

  const stopScan = useCallback(() => {
    return undefined;
  }, []);

  return { startScan, stopScan };
}
