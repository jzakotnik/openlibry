/**
 * Slider to control the spine (vertical field) width
 * as a percentage of the total label width.
 */

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SpineWidthSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SpineWidthSlider({
  value,
  onChange,
}: SpineWidthSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Rückenbreite</Label>
        <span className="text-sm font-mono text-muted-foreground">
          {value}%
        </span>
      </div>
      <Slider
        min={10}
        max={50}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        data-cy="spine-width-slider"
      />
      <p className="text-xs text-muted-foreground">
        Anteil des Buchrücken-Felds an der Etikettenbreite
      </p>
    </div>
  );
}
