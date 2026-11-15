import {
  Building2,
  Layers,
  IndianRupee,
  Map,
  Globe,
  TrendingUp,
  Store,
  ShoppingBag,
  MapPin,
  Tags,
  Warehouse,
  Boxes,
  Truck,
  Gauge,
  House,
  Users,
  ChartLine,
  Calculator,
  Percent,
  Landmark,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type SceneKey = "office" | "retail" | "warehousing" | "residential" | "mortgage";

export type PreviewKind = "bars" | "stack" | "line" | "heat" | "donut" | "gauge" | "forecast";
type App = { name: string; icon: LucideIcon; color: string; preview: PreviewKind };
type Callout = { k: string; l: string };

type Category = {
  key: SceneKey;
  label: string;
  workspace: string;
  apps: App[];
  callouts: Callout[];
};

export const CATEGORIES: Category[] = [
  {
    key: "office",
    label: "Office",
    workspace: "Office Pulse",
    apps: [
      { name: "Leasing Tracker", icon: Building2, color: "#2448ff", preview: "bars" },
      { name: "Supply Pipeline", icon: Layers, color: "#3c7a5a", preview: "stack" },
      { name: "Rent Monitor", icon: IndianRupee, color: "#c4892b", preview: "line" },
      { name: "Vacancy Heatmap", icon: Map, color: "#b44a3a", preview: "heat" },
      { name: "GCC Demand", icon: Globe, color: "#5b4bd6", preview: "donut" },
      { name: "Forecast Y1–Y5", icon: TrendingUp, color: "#0e0f10", preview: "forecast" },
    ],
    callouts: [
      { k: "20.6 Mn sq ft", l: "Gross leasing · Q3 2026" },
      { k: "16.3 Mn sq ft", l: "New supply · Q3 2026" },
      { k: "46%", l: "GCC share of leasing · H1 2026" },
    ],
  },
  {
    key: "retail",
    label: "Retail",
    workspace: "Retail Lens",
    apps: [
      { name: "Mall Tracker", icon: Store, color: "#d0613a", preview: "bars" },
      { name: "High-Street Rents", icon: ShoppingBag, color: "#a2468a", preview: "line" },
      { name: "Catchment Map", icon: MapPin, color: "#2a8a8a", preview: "heat" },
      { name: "Brand Mix", icon: Tags, color: "#c4892b", preview: "donut" },
      { name: "Forecast Y1–Y5", icon: TrendingUp, color: "#0e0f10", preview: "forecast" },
    ],
    callouts: [
      { k: "Malls & high streets", l: "Tracked project by project" },
      { k: "Y1 → Y5", l: "Rent & vacancy outlook" },
    ],
  },
  {
    key: "warehousing",
    label: "Warehousing",
    workspace: "Logi Grid",
    apps: [
      { name: "Hub Clusters", icon: Warehouse, color: "#4b5d73", preview: "heat" },
      { name: "Grade A Stock", icon: Boxes, color: "#8a5a2b", preview: "stack" },
      { name: "Leasing Pulse", icon: Truck, color: "#d0613a", preview: "bars" },
      { name: "Vacancy Watch", icon: Gauge, color: "#3c7a5a", preview: "gauge" },
      { name: "Forecast Y1–Y5", icon: TrendingUp, color: "#0e0f10", preview: "forecast" },
    ],
    callouts: [
      { k: "Grade A", l: "Leasing, supply, stock & vacancy · H1 2026" },
      { k: "Cluster-level", l: "Logistics hub dynamics" },
    ],
  },
  {
    key: "residential",
    label: "Residential",
    workspace: "Home Scope",
    apps: [
      { name: "Launches", icon: House, color: "#3c7a5a", preview: "bars" },
      { name: "Absorption", icon: Users, color: "#2448ff", preview: "donut" },
      { name: "Price Index", icon: ChartLine, color: "#a2468a", preview: "line" },
      { name: "Micro-markets", icon: Map, color: "#c4892b", preview: "heat" },
      { name: "Forecast Y1–Y5", icon: TrendingUp, color: "#0e0f10", preview: "forecast" },
    ],
    callouts: [
      { k: "Capital values", l: "Submarket-level tracking" },
      { k: "Y1 → Y5", l: "Price appreciation outlook" },
    ],
  },
  {
    key: "mortgage",
    label: "Mortgage",
    workspace: "Yield Desk",
    apps: [
      { name: "Yield Calculator", icon: Calculator, color: "#c4892b", preview: "gauge" },
      { name: "Rate Watch", icon: Percent, color: "#2448ff", preview: "line" },
      { name: "Capital Values", icon: Landmark, color: "#4b5d73", preview: "line" },
      { name: "Risk Lens", icon: ShieldCheck, color: "#3c7a5a", preview: "gauge" },
      { name: "Forecast Y1–Y5", icon: TrendingUp, color: "#0e0f10", preview: "forecast" },
    ],
    callouts: [
      { k: "Rental yields", l: "Modelled from historical data" },
      { k: "Flexible", l: "Financing solutions" },
    ],
  },
];

export const PROMPTS = [
  "Office vacancy forecast for Hyderabad, next 5 years",
  "Grade A warehousing supply — Pune vs Chennai",
  "Rental yield trend for BKC, Mumbai",
  "GCC leasing share across Bengaluru submarkets",
  "Residential capital values in Gurugram, Y1–Y5",
];
