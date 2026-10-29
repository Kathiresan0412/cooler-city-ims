"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  createCategory,
  createUnit,
  deleteCategory,
  deleteUnit,
  updateCategory,
  updateUnit,
} from "@/server/actions/catalog-master.actions";

type CategoryRow = { id: string; name: string; description: string | null; productCount: number; childCount: number };
type UnitRow = { id: string; name: string; abbreviation: string; productCount: number };

interface CatalogMasterManagerProps {
  type: "category" | "unit";
  rows: CategoryRow[] | UnitRow[];
}

export function CatalogMasterManager({ type, rows }: CatalogMasterManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAbbreviation, setEditAbbreviation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isCategory = type === "category";

  async function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const result = isCategory
        ? await createCategory({ name, description })
        : await createUnit({ name, abbreviation });
      if (!result.success) {
        toast({ title: "Could not save", description: result.error, variant: "destructive" });
        return;
      }
      setName("");
      setAbbreviation("");
      setDescription("");
      toast({ title: `${isCategory ? "Category" : "Unit"} added` });
      router.refresh();
    } catch {
      toast({ title: "Could not save", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function saveEdit(id: string) {
    setIsSaving(true);
    try {
      const result = isCategory
        ? await updateCategory(id, { name: editName, description: editDescription })
        : await updateUnit(id, { name: editName, abbreviation: editAbbreviation });
      if (!result.success) {
        toast({ title: "Could not update", description: result.error, variant: "destructive" });
        return;
      }
      setEditingId(null);
      toast({ title: `${isCategory ? "Category" : "Unit"} updated` });
      router.refresh();
    } catch {
      toast({ title: "Could not update", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function removeItem(id: string) {
    setIsSaving(true);
    try {
      const result = isCategory ? await deleteCategory(id) : await deleteUnit(id);
      if (!result.success) {
        toast({ title: "Could not delete", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: `${isCategory ? "Category" : "Unit"} deleted` });
      router.refresh();
    } catch {
      toast({ title: "Could not delete", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addItem} className="flex flex-wrap items-end gap-3 rounded-md border p-4">
        <div className="min-w-56 flex-1 space-y-2">
          <Label htmlFor={`${type}-name`}>{isCategory ? "Category Name" : "Unit Name"}</Label>
          <Input
            id={`${type}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={100}
            disabled={isSaving}
          />
        </div>
        {isCategory && (
          <div className="min-w-56 flex-1 space-y-2">
            <Label htmlFor={`${type}-description`}>Description</Label>
            <Input
              id={`${type}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              disabled={isSaving}
            />
          </div>
        )}
        {!isCategory && (
          <div className="w-40 space-y-2">
            <Label htmlFor="unit-abbreviation">Abbreviation</Label>
            <Input
              id="unit-abbreviation"
              value={abbreviation}
              onChange={(event) => setAbbreviation(event.target.value)}
              required
              maxLength={20}
              disabled={isSaving}
            />
          </div>
        )}
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Add {isCategory ? "Category" : "Unit"}
        </Button>
      </form>

      <div className="hidden overflow-hidden rounded-md border md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              {isCategory && <th className="px-4 py-3 text-left font-medium">Description</th>}
              {!isCategory && <th className="px-4 py-3 text-left font-medium">Abbreviation</th>}
              {/* <th className="px-4 py-3 text-left font-medium">Products</th> */}
              {/* {isCategory && <th className="px-4 py-3 text-left font-medium">Subcategories</th>} */}
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const category = isCategory ? row as CategoryRow : null;
              const unit = isCategory ? null : row as UnitRow;
              const rowName = row.name;
              const editing = editingId === row.id;
              return (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    {editing ? (
                      <Input value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={100} disabled={isSaving} />
                    ) : rowName}
                  </td>
                  {isCategory && (
                    <td className="px-4 py-3">
                      {editing ? (
                        <Input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} disabled={isSaving} />
                      ) : category?.description || "—"}
                    </td>
                  )}
                  {!isCategory && (
                    <td className="px-4 py-3">
                      {editing ? (
                        <Input value={editAbbreviation} onChange={(event) => setEditAbbreviation(event.target.value)} maxLength={20} disabled={isSaving} />
                      ) : unit?.abbreviation}
                    </td>
                  )}
                  {/* <td className="px-4 py-3">{category?.productCount ?? unit?.productCount}</td> */}
                  {/* {isCategory && <td className="px-4 py-3">{category?.childCount}</td>} */}
                  <td className="px-4 py-3 text-right">
                    {editing ? (
                      <div className="inline-flex gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => saveEdit(row.id)} disabled={isSaving || !editName.trim() || (!isCategory && !editAbbreviation.trim())} aria-label="Save changes">
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setEditingId(null)} disabled={isSaving} aria-label="Cancel editing">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="inline-flex">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isSaving}
                          aria-label={`Edit ${rowName}`}
                          onClick={() => {
                            setEditingId(row.id);
                            setEditName(row.name);
                            setEditAbbreviation(unit?.abbreviation ?? "");
                            setEditDescription(category?.description ?? "");
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title={`Delete ${rowName}?`}
                          description={`Delete this ${type}? It cannot be removed while referenced by products${isCategory ? " or child categories" : ""}.`}
                          confirmLabel="Delete"
                          onConfirm={() => removeItem(row.id)}
                          trigger={
                            <Button type="button" variant="ghost" size="icon" disabled={isSaving} aria-label={`Delete ${rowName}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={isCategory ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                  No {isCategory ? "categories" : "units"} yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const category = isCategory ? row as CategoryRow : null;
          const unit = isCategory ? null : row as UnitRow;
          const editing = editingId === row.id;
          return (
            <article key={row.id} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
              <div className="space-y-2">
                {editing ? (
                  <Input aria-label={`${isCategory ? "Category" : "Unit"} name`} value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={100} disabled={isSaving} />
                ) : <h3 className="font-semibold">{row.name}</h3>}
                {isCategory ? (
                  editing ? <Input aria-label="Description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} disabled={isSaving} />
                    : <p className="text-sm text-muted-foreground">{category?.description || "No description"}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Abbreviation: {unit?.abbreviation}</p>
                )}
                {editing && !isCategory && <Input aria-label="Abbreviation" value={editAbbreviation} onChange={(event) => setEditAbbreviation(event.target.value)} maxLength={20} disabled={isSaving} />}
              </div>
              <div className="flex justify-end gap-1 border-t pt-2">
                {editing ? (
                  <>
                    <Button type="button" variant="ghost" size="icon" onClick={() => saveEdit(row.id)} disabled={isSaving || !editName.trim() || (!isCategory && !editAbbreviation.trim())} aria-label="Save changes">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setEditingId(null)} disabled={isSaving} aria-label="Cancel editing"><X className="h-4 w-4" /></Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="ghost" size="icon" disabled={isSaving} aria-label={`Edit ${row.name}`} onClick={() => {
                      setEditingId(row.id);
                      setEditName(row.name);
                      setEditAbbreviation(unit?.abbreviation ?? "");
                      setEditDescription(category?.description ?? "");
                    }}><Pencil className="h-4 w-4" /></Button>
                    <ConfirmDialog
                      title={`Delete ${row.name}?`}
                      description={`Delete this ${type}? It cannot be removed while referenced by products${isCategory ? " or child categories" : ""}.`}
                      confirmLabel="Delete"
                      onConfirm={() => removeItem(row.id)}
                      trigger={<Button type="button" variant="ghost" size="icon" disabled={isSaving} aria-label={`Delete ${row.name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                    />
                  </>
                )}
              </div>
            </article>
          );
        })}
        {rows.length === 0 && <p className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">No {isCategory ? "categories" : "units"} yet. Add one above.</p>}
      </div>
    </div>
  );
}
