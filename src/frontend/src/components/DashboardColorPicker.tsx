import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { DEFAULT_GRADIENT, PRESETS } from "../utils/dashboardColorStorage";

type Props = {
  dashboardRole: "student" | "teacher" | "parent" | "admin";
  current: string | null;
  onApply: (gradient: string | null) => void;
  open: boolean;
  onClose: () => void;
};

const DIRECTIONS = [
  { label: "→ Right", value: "to right" },
  { label: "↘ Bottom Right", value: "to bottom right" },
  { label: "↓ Bottom", value: "to bottom" },
  { label: "↗ Top Right", value: "to top right" },
];

export function DashboardColorPicker({
  dashboardRole,
  current,
  onApply,
  open,
  onClose,
}: Props) {
  const presets = PRESETS[dashboardRole] ?? [];
  const defaultGradient = DEFAULT_GRADIENT[dashboardRole];

  // Custom color state
  const [colorA, setColorA] = useState("#1B2B50");
  const [colorB, setColorB] = useState("#2563eb");
  const [direction, setDirection] = useState("to bottom right");

  const customGradient = `linear-gradient(${direction}, ${colorA} 0%, ${colorB} 100%)`;

  const effectiveCurrent = current ?? defaultGradient;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg w-full"
        data-ocid="color_picker.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Customise Dashboard Colour
          </DialogTitle>
        </DialogHeader>

        {/* Preset swatches */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Presets
          </p>
          <div className="grid grid-cols-4 gap-3">
            {presets.map((preset) => {
              const isActive = effectiveCurrent === preset.gradient;
              return (
                <button
                  key={preset.label}
                  type="button"
                  title={preset.label}
                  data-ocid="color_picker.button"
                  onClick={() => onApply(preset.gradient)}
                  className={`flex flex-col items-center gap-1.5 group ${
                    isActive ? "" : ""
                  }`}
                >
                  <div
                    className={`w-full h-10 rounded-lg transition-all ${
                      isActive
                        ? "ring-2 ring-offset-2 ring-primary scale-105"
                        : "hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-primary/50"
                    }`}
                    style={{ background: preset.gradient }}
                  />
                  <span
                    className={`text-[10px] text-center leading-tight ${
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom colour builder */}
        <div className="mt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Custom
          </p>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Colour A</Label>
              <input
                type="color"
                value={colorA}
                onChange={(e) => setColorA(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border"
                data-ocid="color_picker.input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Colour B</Label>
              <input
                type="color"
                value={colorB}
                onChange={(e) => setColorB(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border"
                data-ocid="color_picker.input"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <Label className="text-xs">Direction</Label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="text-xs border border-border rounded px-2 py-2 bg-background text-foreground"
                data-ocid="color_picker.select"
              >
                {DIRECTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live preview */}
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div
              className="mt-1.5 w-full h-10 rounded-lg border border-border"
              style={{ background: customGradient }}
            />
          </div>

          <Button
            size="sm"
            className="mt-3"
            onClick={() => onApply(customGradient)}
            data-ocid="color_picker.primary_button"
          >
            Apply Custom Colour
          </Button>
        </div>

        {/* Reset */}
        <div className="mt-1 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => onApply(null)}
            data-ocid="color_picker.secondary_button"
          >
            Reset to Default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
