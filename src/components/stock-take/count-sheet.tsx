"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStockTake } from "@/server/actions/stock-take.actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function CountSheet() {
  const [locationId, setLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function start() {
    if (!locationId) return;
    setLoading(true);
    const result = await createStockTake({ locationId });
    setLoading(false);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      router.push(`/stock-take/${result.id}`);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="Select a location to count"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        />
      </div>
      <Button onClick={start} disabled={loading || !locationId}>
        {loading ? "Starting..." : "Start Stock Take"}
      </Button>
    </div>
  );
}
