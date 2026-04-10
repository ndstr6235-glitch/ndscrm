import type { Role, EmailTemplate, EventType, ClientStage, ClientScore } from "./types";

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
export const COLORS = {
  // Backgrounds
  bg: "#f0f2f7",
  sidebar: "#0f1117",
  surface: "#ffffff",
  surfaceHover: "#f8f9fc",

  // Borders
  border: "#e4e8f0",
  borderDark: "#d0d6e4",

  // Brand accents
  gold: "#b8912a",
  goldLight: "#f5c842",
  goldPale: "#fef9ec",
  goldBorder: "#f0d97a",

  // Semantic
  emerald: "#1a9e6a",
  emeraldPale: "#edfaf4",
  emeraldBorder: "#a3e6c9",

  ruby: "#d94040",
  rubyPale: "#fdf0f0",
  rubyBorder: "#f5b8b8",

  sapphire: "#2d6be4",
  sapphirePale: "#eef3fd",
  sapphireBorder: "#b3cdf9",

  amber: "#d97a1a",
  amberPale: "#fef5ec",

  // Text
  text: "#0f1117",
  textMid: "#4a5578",
  textDim: "#8892aa",
  textFaint: "#c0c8d8",
} as const;

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------
export const EVENT_TYPES: Record<
  EventType,
  { label: string; color: string; pale: string; icon: string }
> = {
  call: { label: "Hovor", color: "#2d6be4", pale: "#eef3fd", icon: "📞" },
  payment: { label: "Platba", color: "#1a9e6a", pale: "#edfaf4", icon: "💰" },
  reminder: { label: "Připomínka", color: "#d97a1a", pale: "#fef5ec", icon: "🔔" },
  interest: { label: "Úrok", color: "#b8912a", pale: "#fef9ec", icon: "📈" },
  meeting: { label: "Schůzka", color: "#d94040", pale: "#fdf0f0", icon: "🤝" },
};

// ---------------------------------------------------------------------------
// Role metadata
// ---------------------------------------------------------------------------
export const ROLE_META: Record<
  Role,
  { label: string; color: string; icon: string }
> = {
  administrator: { label: "Administrátor", color: "#d94040", icon: "🛡️" },
  supervisor: { label: "Supervizor", color: "#b8912a", icon: "👁️" },
  broker: { label: "Broker", color: "#2d6be4", icon: "💼" },
};

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------
export interface NavItem {
  key: string;
  label: string;
  icon: string;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊", roles: ["administrator", "supervisor", "broker"] },
  { key: "clients", label: "Klienti", icon: "👥", roles: ["administrator", "supervisor", "broker"] },
  { key: "calendar", label: "Kalendář", icon: "📅", roles: ["administrator", "supervisor", "broker"] },
  { key: "emails", label: "Emaily", icon: "✉️", roles: ["administrator", "supervisor", "broker"] },
  { key: "contracts", label: "Smlouvy", icon: "📄", roles: ["administrator", "supervisor"] },
  { key: "users", label: "Uživatelé", icon: "👤", roles: ["administrator", "supervisor"] },
  { key: "templates", label: "Šablony emailů", icon: "📝", roles: ["administrator"] },
  { key: "settings", label: "Nastavení", icon: "⚙️", roles: ["administrator"] },
];

// ---------------------------------------------------------------------------
// Activity icons
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Pipeline stages
// ---------------------------------------------------------------------------
export const PIPELINE_STAGES: {
  key: ClientStage;
  label: string;
  color: string;
  pale: string;
}[] = [
  { key: "NEW", label: "Nový", color: "#8892aa", pale: "#f0f2f7" },
  { key: "CONTACTED", label: "Kontaktován", color: "#2d6be4", pale: "#eef3fd" },
  { key: "NEGOTIATION", label: "Jednání", color: "#d97a1a", pale: "#fef5ec" },
  { key: "INVESTOR", label: "Investor", color: "#1a9e6a", pale: "#edfaf4" },
  { key: "VIP", label: "VIP", color: "#b8912a", pale: "#fef9ec" },
];

export const STAGE_META: Record<
  ClientStage,
  { label: string; color: string; pale: string }
> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.key, { label: s.label, color: s.color, pale: s.pale }])
) as Record<ClientStage, { label: string; color: string; pale: string }>;

// ---------------------------------------------------------------------------
// Client scoring
// ---------------------------------------------------------------------------
export const SCORE_META: Record<
  ClientScore,
  { label: string; color: string; pale: string }
> = {
  A: { label: "A", color: "#b8912a", pale: "#fef9ec" },
  B: { label: "B", color: "#1a9e6a", pale: "#edfaf4" },
  C: { label: "C", color: "#2d6be4", pale: "#eef3fd" },
  D: { label: "D", color: "#8892aa", pale: "#f0f2f7" },
};

export const ACTIVITY_ICONS: Record<string, string> = {
  CLIENT_CREATED: "🆕",
  CLIENT_UPDATED: "✏️",
  PAYMENT_ADDED: "💰",
  EMAIL_SENT: "✉️",
  EVENT_CREATED: "📅",
  NOTE_CHANGED: "📝",
  ASSIGNED_TO_CHANGED: "🔄",
};

// ---------------------------------------------------------------------------
// Default email templates (5 templates, "Smlouva finální" admin-only)
// ---------------------------------------------------------------------------
export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "t1",
    label: "Prezentace",
    subject: "Představení společnosti – Nodi Star",
    body: "Vážený/á [OSLOVENÍ],\n\nna základě našeho hovoru si Vám dovoluji zaslat prezentaci společnosti Nodi Star s.r.o.\n\nV příloze naleznete podrobné informace o naší společnosti a podmínkách spolupráce.\n\nV případě jakýchkoli dotazů mě neváhejte kontaktovat.\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
  {
    id: "t2",
    label: "Návrh smlouvy",
    subject: "Návrh smlouvy – Nodi Star",
    body: "Vážený/á [OSLOVENÍ],\n\nzasílám Vám návrh smlouvy k prostudování.\n\nZároveň Vás prosím o zaslání následujících údajů potřebných pro vyhotovení finální smlouvy:\n\n– Jméno a příjmení\n– Datum narození\n– Trvalé bydliště\n– Číslo občanského průkazu\n– Číslo bankovního účtu\n\nV případě jakýchkoli dotazů mě neváhejte kontaktovat.\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
  {
    id: "t3",
    label: "Smlouva finální",
    subject: "Smlouva – Nodi Star",
    body: "Vážený/á [OSLOVENÍ],\n\nv příloze zasílám finální verzi smlouvy k podpisu.\n\nProsím o prostudování a zaslání podepsané verze zpět.\n\n[PODPIS]",
    allowedRoles: ["administrator"],
  },
  {
    id: "t4",
    label: "Měsíční výpis",
    subject: "Měsíční výpis – Nodi Star",
    body: "Vážený/á [OSLOVENÍ],\n\nzasílám měsíční přehled k Vaší smlouvě.\n\nPřipsaná částka: [ČÁSTKA]\nCelková výše: [VKLAD]\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
  {
    id: "t5",
    label: "Follow-up",
    subject: "Navazuji na náš hovor – Nodi Star",
    body: "Vážený/á [OSLOVENÍ],\n\nnavazuji na náš nedávný hovor. Rád/a bych domluvil/a schůzku.\n\nKdy by Vám vyhovovalo?\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
];
