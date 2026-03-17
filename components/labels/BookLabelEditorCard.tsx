/**
 * Card on the Reports page that navigates to /reports/labels/editor.
 */

import { useRouter } from "next/router";
import { PenLine } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BookLabelEditorCard() {
  const router = useRouter();

  return (
    <Card
      className="overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
      data-cy="book-label-editor-card"
    >
      <div className="h-1 w-full bg-gradient-to-r from-secondary to-secondary/50" />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
          <PenLine className="h-5 w-5" />
          Etiketten-Vorlage bearbeiten
        </CardTitle>
        <CardDescription>
          Felder zuordnen, Schriftgrößen anpassen, Buchrücken-Breite einstellen.
          Vorschau direkt im Browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/reports/labels/editor")}
          data-cy="open-label-editor"
        >
          Vorlage bearbeiten
        </Button>
      </CardContent>
    </Card>
  );
}
