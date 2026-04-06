import { useState } from "react";

export const DEFAULT_GRADIENT: Record<string, string> = {
  student:
    "linear-gradient(135deg, oklch(0.22 0.09 258) 0%, oklch(0.42 0.22 264) 50%, oklch(0.36 0.18 280) 100%)",
  teacher:
    "linear-gradient(135deg, oklch(0.22 0.09 200) 0%, oklch(0.4 0.14 185) 50%, oklch(0.32 0.1 190) 100%)",
  parent:
    "linear-gradient(135deg, oklch(0.22 0.07 15) 0%, oklch(0.42 0.16 12) 50%, oklch(0.35 0.12 350) 100%)",
  admin: "linear-gradient(135deg, #1B2B50 0%, #2a3f6e 100%)",
};

export const PRESETS: Record<
  string,
  Array<{ label: string; gradient: string }>
> = {
  student: [
    {
      label: "Sapphire (default)",
      gradient:
        "linear-gradient(135deg, oklch(0.22 0.09 258) 0%, oklch(0.42 0.22 264) 50%, oklch(0.36 0.18 280) 100%)",
    },
    {
      label: "Ocean Blue",
      gradient: "linear-gradient(135deg, #0f2f5c 0%, #1565c0 100%)",
    },
    {
      label: "Emerald",
      gradient:
        "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)",
    },
    {
      label: "Violet",
      gradient: "linear-gradient(135deg, #3b0764 0%, #7c3aed 100%)",
    },
    {
      label: "Coral",
      gradient: "linear-gradient(135deg, #7c1d2e 0%, #e8614a 100%)",
    },
    {
      label: "Amber",
      gradient: "linear-gradient(135deg, #713f12 0%, #d97706 100%)",
    },
    {
      label: "Rose Gold",
      gradient: "linear-gradient(135deg, #831843 0%, #db2777 100%)",
    },
    {
      label: "Slate",
      gradient: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
    },
  ],
  teacher: [
    {
      label: "Teal (default)",
      gradient:
        "linear-gradient(135deg, oklch(0.22 0.09 200) 0%, oklch(0.4 0.14 185) 50%, oklch(0.32 0.1 190) 100%)",
    },
    {
      label: "Deep Navy",
      gradient: "linear-gradient(135deg, #1B2B50 0%, #2563eb 100%)",
    },
    {
      label: "Forest Green",
      gradient: "linear-gradient(135deg, #14532d 0%, #2BA870 100%)",
    },
    {
      label: "Indigo",
      gradient: "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)",
    },
    {
      label: "Crimson",
      gradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
    },
    {
      label: "Amber",
      gradient: "linear-gradient(135deg, #713f12 0%, #D4A520 100%)",
    },
    {
      label: "Plum",
      gradient: "linear-gradient(135deg, #4a044e 0%, #a21caf 100%)",
    },
    {
      label: "Charcoal",
      gradient: "linear-gradient(135deg, #111827 0%, #374151 100%)",
    },
  ],
  parent: [
    {
      label: "Burgundy (default)",
      gradient:
        "linear-gradient(135deg, oklch(0.22 0.07 15) 0%, oklch(0.42 0.16 12) 50%, oklch(0.35 0.12 350) 100%)",
    },
    {
      label: "Warm Amber",
      gradient: "linear-gradient(135deg, #78350f 0%, #D4A520 100%)",
    },
    {
      label: "Forest",
      gradient: "linear-gradient(135deg, #14532d 0%, #166534 100%)",
    },
    {
      label: "Deep Blue",
      gradient: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
    },
    {
      label: "Violet",
      gradient: "linear-gradient(135deg, #3b0764 0%, #9333ea 100%)",
    },
    {
      label: "Rose",
      gradient: "linear-gradient(135deg, #881337 0%, #f43f5e 100%)",
    },
    {
      label: "Teal",
      gradient: "linear-gradient(135deg, #134e4a 0%, #0d9488 100%)",
    },
    {
      label: "Graphite",
      gradient: "linear-gradient(135deg, #1c1917 0%, #44403c 100%)",
    },
  ],
  admin: [
    {
      label: "Navy (default)",
      gradient: "linear-gradient(135deg, #1B2B50 0%, #2a3f6e 100%)",
    },
    {
      label: "Dark Teal",
      gradient: "linear-gradient(135deg, #0f3460 0%, #16213e 100%)",
    },
    {
      label: "Crimson",
      gradient: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
    },
    {
      label: "Forest",
      gradient: "linear-gradient(135deg, #052e16 0%, #14532d 100%)",
    },
    {
      label: "Indigo",
      gradient: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
    },
    {
      label: "Charcoal",
      gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    },
    {
      label: "Plum",
      gradient: "linear-gradient(135deg, #2e1065 0%, #6b21a8 100%)",
    },
    {
      label: "Slate",
      gradient: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
    },
  ],
};

export function useDashboardColor(
  role: "student" | "teacher" | "parent" | "admin",
): [string | null, (g: string | null) => void] {
  const key = `dashboard-color-${role}`;
  const [gradient, setGradientState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  });

  const setGradient = (g: string | null) => {
    try {
      if (g === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, g);
      }
    } catch {
      // ignore storage errors
    }
    setGradientState(g);
  };

  return [gradient, setGradient];
}
