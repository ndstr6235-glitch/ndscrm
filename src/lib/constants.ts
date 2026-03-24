import type { Role, User, EmailTemplate, EventType, ClientStage, ClientScore } from "./types";

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
  { key: "NEW", label: "Novy", color: "#8892aa", pale: "#f0f2f7" },
  { key: "CONTACTED", label: "Kontaktovan", color: "#2d6be4", pale: "#eef3fd" },
  { key: "NEGOTIATION", label: "Jednani", color: "#d97a1a", pale: "#fef5ec" },
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
// Default users (seed data)
// ---------------------------------------------------------------------------
export const DEFAULT_USERS: User[] = [
  {
    id: "u1",
    firstName: "Martin",
    lastName: "Kovář",
    email: "admin@buildfund.cz",
    password: "admin123",
    role: "administrator",
    active: true,
    createdAt: "2024-01-01",
    signature: "S úctou,\nMartin Kovář\nBuild Fund | CEO\n+420 777 123 456\nwww.buildfund.cz",
  },
  {
    id: "u2",
    firstName: "Jana",
    lastName: "Procházková",
    email: "supervisor@buildfund.cz",
    password: "super123",
    role: "supervisor",
    active: true,
    createdAt: "2024-01-15",
    signature: "S úctou,\nJana Procházková\nBuild Fund | Vedoucí týmu\n+420 777 234 567",
  },
  {
    id: "u3",
    firstName: "Tomáš",
    lastName: "Novák",
    email: "broker1@buildfund.cz",
    password: "broker123",
    role: "broker",
    active: true,
    createdAt: "2024-02-01",
    signature: "S pozdravem,\nTomáš Novák\nBuild Fund | Investiční poradce\n+420 777 345 678",
  },
  {
    id: "u4",
    firstName: "Petra",
    lastName: "Horáková",
    email: "broker2@buildfund.cz",
    password: "broker456",
    role: "broker",
    active: true,
    createdAt: "2024-02-10",
    signature: "S pozdravem,\nPetra Horáková\nBuild Fund | Investiční poradce\n+420 777 456 789",
  },
];

// ---------------------------------------------------------------------------
// Default email templates (5 templates, "Smlouva finální" admin-only)
// ---------------------------------------------------------------------------
export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "t1",
    label: "Prezentace",
    subject: "Exkluzivní investiční příležitost – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\ndovolte, abych Vám představil/a investiční platformu Build Fund.\n\nNabízíme:\n• Roční výnos 8–14 % p.a.\n• Plná transparentnost a měsíční výpisy\n• Minimální vstup od 50 000 Kč\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
  {
    id: "t2",
    label: "Návrh smlouvy",
    subject: "Investiční smlouva – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\nzasílám Vám investiční smlouvu k prostudování a podpisu.\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
  {
    id: "t3",
    label: "Smlouva finální",
    subject: "Finální investiční smlouva – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\nv příloze zasílám finální investiční smlouvu k podpisu.\n\nProsím o prostudování a zaslání podepsané verze zpět.\n\n[PODPIS]",
    allowedRoles: ["administrator"],
  },
  {
    id: "t4",
    label: "Úrok – měsíční výpis",
    subject: "Měsíční výpis výnosu – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\nzasílám měsíční přehled výnosu z Vaší investice.\n\nPřipsaný výnos: [CASTKA]\nCelkový vložený kapitál: [VKLAD]\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
  {
    id: "t5",
    label: "Follow-up",
    subject: "Navazuji na náš hovor – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\nnavazuji na náš nedávný hovor. Rád/a bych domluvil/a schůzku.\n\nKdy by Vám vyhovovalo?\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
];
