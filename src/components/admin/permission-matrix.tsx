"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateRolePermissions } from "@/server/actions/role.actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Permission {
  id: string;
  resource: string;
  action: string;
  label: string;
}

interface PermissionMatrixProps {
  roleId: string;
  permissions?: Permission[];
  assignedIds?: string[];
}

export function PermissionMatrix({ roleId, permissions = [], assignedIds = [] }: PermissionMatrixProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedIds));
  const { toast } = useToast();
  const router = useRouter();

  // Group by resource
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = [];
    acc[p.resource].push(p);
    return acc;
  }, {});

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function save() {
    const result = await updateRolePermissions(roleId, Array.from(selected));
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Permissions saved" });
      router.refresh();
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {permissions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No permissions are available. Run the database seed to create the permission catalog.
        </p>
      )}
      {Object.entries(grouped).map(([resource, perms]) => (
        <div key={resource} className="space-y-2">
          <h3 className="text-sm font-semibold capitalize">{resource.replace(/_/g, " ")}</h3>
          <div className="flex flex-wrap gap-4">
            {perms.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Checkbox
                  id={p.id}
                  checked={selected.has(p.id)}
                  onCheckedChange={() => toggle(p.id)}
                />
                <Label htmlFor={p.id} className="text-sm font-normal cursor-pointer">{p.label}</Label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={save}>Save Permissions</Button>
    </div>
  );
}
