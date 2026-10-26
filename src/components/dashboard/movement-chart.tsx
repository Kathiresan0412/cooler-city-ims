import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Chart will use recharts (client component) once added.
// Keeping as server shell for now.
export async function MovementChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Stock Movements (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Chart will render here
      </CardContent>
    </Card>
  );
}
