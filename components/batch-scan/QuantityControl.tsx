import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  onSet,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSet: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 bg-muted rounded-lg px-1 py-0.5">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDecrement}
        disabled={quantity <= 1}
      >
        <Minus className="size-3.5" />
      </Button>
      <input
        type="number"
        value={quantity}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) onSet(val);
        }}
        min={1}
        className="w-10 text-center text-sm font-medium bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button variant="ghost" size="icon-xs" onClick={onIncrement}>
        <Plus className="size-3.5" />
      </Button>
      <span className="text-xs text-muted-foreground ml-0.5">
        {quantity === 1 ? "Exemplar" : "Exemplare"}
      </span>
    </div>
  );
}
