/**
 * Card on the Reports page that navigates to /reports/labels/print.
 */

import { useRouter } from "next/router";
import { Printer } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BookLabelPrintCard() {
  const router = useRouter();

  return (
    <Card
      className="overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
      data-cy="book-label-print-card"
    >
      <div className="h-1 w-full bg-gradient-to-r from-info to-info/50" />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Buchetiketten drucken
        </CardTitle>
        <CardDescription>
          Etiketten als PDF erzeugen. Vorlage und Bogen wählen, Bücher filtern,
          Startposition festlegen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={() => router.push("/reports/labels/print")}
          data-cy="open-label-print"
        >
          Etiketten drucken
        </Button>
      </CardContent>
    </Card>
  );
}
