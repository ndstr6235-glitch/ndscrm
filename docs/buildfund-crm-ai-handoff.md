# Build Fund CRM — Kompletní AI Handoff Dokument
## Zadání pro vývojářskou AI (Claude Code / Cursor / Copilot)

---

## 1. PŘEHLED PROJEKTU

**Název:** Build Fund CRM v3  
**Typ:** Single-page React aplikace (CRM systém)  
**Stack:** React 18 + hooks, žádné externí UI knihovny (čisté CSS-in-JS), Google Fonts  
**Data:** Persistentní storage přes `window.storage` API (Claude artifact storage)  
**Účel:** Správa investičních klientů pro call-center/broker tým. Sledování vkladů, výdělků operátorů, odesílání personalizovaných emailů, kalendář hovorů a plateb.

---

## 2. TECH STACK & ZÁVISLOSTI

```
Framework:      React 18 (JSX, hooks)
Styling:        CSS-in-JS (inline styles), žádný Tailwind, žádný CSS soubor
Fonty:          Google Fonts — Fraunces (serif, display) + Sora (sans-serif, UI)
Storage:        window.storage.get/set (async, key-value)
Email:          mailto: protokol (otevření v poštovním klientu)
Build:          Vite nebo CRA, nebo přímo jako Claude artifact (.jsx)
```

### Storage schéma (klíče):
```
crm-users       → User[]          — uživatelé systému
crm-clients     → Client[]        — klienti
crm-events      → CalEvent[]      — kalendářní události
crm-templates   → EmailTemplate[] — email šablony
crm-session     → string          — ID přihlášeného uživatele
```

---

## 3. DATOVÉ MODELY (TypeScript typy)

```typescript
type Role = "administrator" | "supervisor" | "broker";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;           // plain text (demo účely)
  role: Role;
  active: boolean;
  createdAt: string;          // ISO date string
  signature: string;          // Podpis pro emaily (víceřádkový text)
}

interface Payment {
  amount: number;             // Vklad klienta v Kč
  percent: number;            // % výdělku operátora
  profit: number;             // Vypočteno: (amount * percent) / 100
  date: string;               // ISO date "YYYY-MM-DD"
  note: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  callDate: string;           // Datum prvního hovoru "YYYY-MM-DD"
  nextPaymentDate: string;    // Datum příští platby "YYYY-MM-DD"
  paymentFreq: number;        // Frekvence plateb ve dnech (30 = měsíčně)
  note: string;
  assignedTo: string;         // User.id přiřazeného brokera
  payments: Payment[];
  createdAt: string;          // ISO datetime
}

type EventType = "call" | "payment" | "reminder" | "interest" | "meeting";

interface CalEvent {
  id: string;
  clientId: string;           // Client.id (může být prázdné)
  userId: string;             // User.id kdo událost vytvořil
  type: EventType;
  title: string;
  date: string;               // "YYYY-MM-DD"
  time: string;               // "HH:MM"
  note: string;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  label: string;              // Název šablony (Prezentace, Smlouva, atd.)
  subject: string;            // Předmět emailu
  body: string;               // Tělo emailu s proměnnými
}
```

### Email proměnné v šablonách:
- `[OSLOVENÍ]` → nahrazuje se oslovením zadaným operátorem
- `[PODPIS]` → nahrazuje se podpisem přihlášeného brokera
- `[VKLAD]` → nahrazuje se celkovým vkladem klienta (Kč)
- `[CASTKA]` → volitelná částka (např. měsíční úrok)

---

## 4. DESIGN SYSTEM

### Barvy (CSS proměnné / konstanty):
```javascript
const C = {
  // Backgrounds
  bg: "#f0f2f7",          // Stránkové pozadí
  sidebar: "#0f1117",     // Sidebar (tmavý)
  surface: "#ffffff",     // Karty, modaly
  surfaceHover: "#f8f9fc",

  // Borders
  border: "#e4e8f0",
  borderDark: "#d0d6e4",

  // Brand accents
  gold: "#b8912a",        // Primární akcent — CTA buttony, active nav
  goldLight: "#f5c842",   // Gradient konec
  goldPale: "#fef9ec",    // Pale background
  goldBorder: "#f0d97a",

  // Sémantické barvy
  emerald: "#1a9e6a",     // Úspěch, Investor status, vklady
  emeraldPale: "#edfaf4",
  emeraldBorder: "#a3e6c9",

  ruby: "#d94040",        // Chyba, smazání, Administrator role
  rubyPale: "#fdf0f0",
  rubyBorder: "#f5b8b8",

  sapphire: "#2d6be4",    // Info, Broker role, kalend. hovory
  sapphirePale: "#eef3fd",
  sapphireBorder: "#b3cdf9",

  amber: "#d97a1a",       // Varování, Připomínky
  amberPale: "#fef5ec",

  // Texty
  text: "#0f1117",        // Primární text
  textMid: "#4a5578",     // Sekundární text
  textDim: "#8892aa",     // Labels, placeholders
  textFaint: "#c0c8d8",   // Deaktivovaný text
};
```

### Typografie:
```css
/* Display / Nadpisy */
font-family: 'Fraunces', serif;
font-weight: 700 | 800 | 900;

/* UI / Body */
font-family: 'Sora', sans-serif;
font-weight: 400 | 500 | 600 | 700 | 800;
```

### Stíny:
```javascript
shadow: "0 1px 3px rgba(15,17,23,0.08), 0 4px 12px rgba(15,17,23,0.04)"
shadowMd: "0 4px 16px rgba(15,17,23,0.12), 0 1px 4px rgba(15,17,23,0.06)"
shadowLg: "0 16px 48px rgba(15,17,23,0.16)"
```

### Border radius:
- Karty: `16px`
- Inputy, buttony: `10px`
- Tagy/pilulky: `20px`
- Malé elementy: `8px`
- Avatary: `50%`

---

## 5. KOMPONENTY A JEJICH SPECIFIKACE

### 5.1 Layout

```
App
├── Login (pokud !currentUser)
└── MainLayout
    ├── Sidebar (220px | 68px collapsed)
    │   ├── Logo + název
    │   ├── Nav items (filtrované dle role)
    │   ├── Toggle collapse button
    │   └── User info + logout
    └── <main> (flex:1, overflow:auto, padding:32px 36px)
        ├── Dashboard
        ├── Clients
        ├── Calendar
        ├── Emails
        ├── Users (admin + supervisor)
        ├── Templates (admin only)
        └── Settings (admin only)
```

### 5.2 Sidebar navigace
```
Položka        | Role přístupu
--------------------------
Dashboard      | all
Klienti        | all
Kalendář       | all
Emaily         | all
Uživatelé      | administrator, supervisor
Šablony emailů | administrator
Nastavení      | administrator
```

Aktivní položka: `border-left: 2px solid #b8912a`, `background: rgba(184,145,42,0.12)`, `color: #b8912a`

### 5.3 Klientský Drawer (slide-in panel)
- Otevírá se kliknutím na řádek tabulky
- `position: fixed`, `right: 0`, `width: min(640px, 95vw)`
- Animace: `translateX(100%) → translateX(0)` za `0.25s`
- Tmavé pozadí zbytku stránky s blur efektem
- Zavírá se kliknutím na overlay nebo × button

**Záložky draweru:**
1. **Přehled** — kontaktní info, příští platba, poznámka, editace
2. **Platby** — seznam plateb, součty vkladu + výdělku, přidání platby
3. **Události** — seznam CalEvents pro daného klienta, přidání události
4. **Email** — výběr šablony → otevře EmailComposer

**Drawer header (tmavý):**
- Avatar + jméno + status + broker
- KPI řádek: celkový vklad, výdělek, průměrné %

**Footer drawer:**
```
[✉️ Email] [💰 Přidat platbu] [📅 Přidat událost]
```

### 5.4 Kalendář
**Levý panel — mini kalendář:**
- Grid 7×N dnů (Pondělí = první)
- Barevné tečky pod číslem = typy událostí v daný den
- Dnešek: zlatý gradient background
- Vybraný den: zlatý gradient background + font-weight 900
- Filtr typů událostí pod kalendářem s počty

**Pravý panel — events pro vybraný den:**
- Seřazeno dle time ASC
- Karta události: ikona, název, čas, klient, poznámka
- Proběhlé události: opacity 0.55
- Smazání: × button na kartě

### 5.5 Email Composer
Pořadí prvků v modalu (shora dolů):
1. **Výběr šablony** — pill buttony
2. **Komu + Předmět** — read-only box (šedý bg)
3. **Oslovení** ⭐ — zlatý rámik, zvýrazněný, primární interakce
4. **Tělo emailu** — textarea, editovatelné
5. **Podpis** 🔵 — modrý rámik, výchozí = broker's signature, tlačítko "Upravit"

Logika:
```javascript
// Při změně šablony nebo oslovení:
body = template.body
  .replace(/\[OSLOVENÍ\]/g, salutation)
  .replace(/\[PODPIS\]/g, signature)
  .replace(/\[VKLAD\]/g, formatCZK(totalDeposit))
  .replace(/\[CASTKA\]/g, "–")

// Po kliknutí "Otevřít v poštovním klientovi":
window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)

// Uložení podpisu:
// Aktualizovat user.signature v crm-users storage
```

---

## 6. RBAC — ROLE-BASED ACCESS CONTROL

### Implementace v kódu:
```javascript
// Filtrace klientů dle role
const visibleClients = user.role === "broker"
  ? clients.filter(c => c.assignedTo === user.id)
  : clients; // supervisor + admin vidí vše

// Filtrace événement dle role  
const visibleEvents = user.role === "broker"
  ? events.filter(e => e.userId === user.id)
  : events;

// Práva editace klienta
const canEdit = user.role !== "broker" || client.assignedTo === user.id;

// Právo mazání
const canDelete = user.role === "administrator" || user.role === "supervisor";

// Právo spravovat uživatele
const canManageUsers = user.role === "administrator";

// Právo editovat šablony
const canEditTemplates = user.role === "administrator";
```

### Skrývání nav položek:
```javascript
// Sidebar — filtruj NAV_ITEMS:
const allowed = NAV_ITEMS.filter(item => item.roles.includes(user.role));
```

---

## 7. VÝPOČTY

### Výdělek operátora z platby:
```javascript
const profit = (amount * percent) / 100;
// Zobrazit: fmtCZK(profit) — formátuj jako CZK Kč
```

### Celkový vklad klienta:
```javascript
const totalDeposit = client.payments.reduce((sum, p) => sum + p.amount, 0);
```

### Celkový výdělek brokera:
```javascript
// Pro jednoho brokera — jeho klienti:
const myClients = clients.filter(c => c.assignedTo === user.id);
const myProfit = myClients.reduce((s, c) =>
  (c.payments || []).reduce((ss, p) => ss + p.profit, s), 0);
```

### Průměrné %:
```javascript
const avgPct = payments.length
  ? payments.reduce((s, p) => s + p.percent, 0) / payments.length
  : 0;
```

---

## 8. FORMÁTOVÁNÍ

```javascript
// Měna (CZK)
const fmtCZK = v => new Intl.NumberFormat("cs-CZ", {
  style: "currency", currency: "CZK", maximumFractionDigits: 0
}).format(v);
// Výstup: "500 000 Kč"

// Datum (cs-CZ)
const fmtDate = d => new Date(d).toLocaleDateString("cs-CZ");
// Výstup: "15. 2. 2026"

// Datum + čas
const fmtDateTime = d => new Date(d).toLocaleString("cs-CZ", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit"
});
// Výstup: "15. 02. 2026 10:30"
```

---

## 9. TYPY KALENDÁŘNÍCH UDÁLOSTÍ

```javascript
const EVENT_TYPES = {
  call:     { label: "Hovor",      color: "#2d6be4", pale: "#eef3fd", icon: "📞" },
  payment:  { label: "Platba",     color: "#1a9e6a", pale: "#edfaf4", icon: "💰" },
  reminder: { label: "Připomínka", color: "#d97a1a", pale: "#fef5ec", icon: "🔔" },
  interest: { label: "Úrok",       color: "#b8912a", pale: "#fef9ec", icon: "📈" },
  meeting:  { label: "Schůzka",    color: "#d94040", pale: "#fdf0f0", icon: "🤝" },
};
```

---

## 10. DEFAULT DATA (seed data pro první spuštění)

### Uživatelé:
```javascript
[
  { id: "u1", firstName: "Martin",  lastName: "Kovář",      email: "admin@buildfund.cz",      password: "admin123",  role: "administrator", active: true, createdAt: "2024-01-01", signature: "S úctou,\nMartin Kovář\nBuild Fund | CEO\n+420 777 123 456\nwww.buildfund.cz" },
  { id: "u2", firstName: "Jana",    lastName: "Procházková", email: "supervisor@buildfund.cz", password: "super123",  role: "supervisor",    active: true, createdAt: "2024-01-15", signature: "S úctou,\nJana Procházková\nBuild Fund | Vedoucí týmu\n+420 777 234 567" },
  { id: "u3", firstName: "Tomáš",   lastName: "Novák",       email: "broker1@buildfund.cz",   password: "broker123", role: "broker",        active: true, createdAt: "2024-02-01", signature: "S pozdravem,\nTomáš Novák\nBuild Fund | Investiční poradce\n+420 777 345 678" },
  { id: "u4", firstName: "Petra",   lastName: "Horáková",    email: "broker2@buildfund.cz",   password: "broker456", role: "broker",        active: true, createdAt: "2024-02-10", signature: "S pozdravem,\nPetra Horáková\nBuild Fund | Investiční poradce\n+420 777 456 789" },
]
```

### Email šablony (4):
```javascript
[
  { id: "t1", label: "Prezentace", subject: "Exkluzivní investiční příležitost – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\ndovolte, abych Vám představil/a investiční platformu Build Fund.\n\nNabízíme:\n• Roční výnos 8–14 % p.a.\n• Plná transparentnost a měsíční výpisy\n• Minimální vstup od 50 000 Kč\n\n[PODPIS]" },

  { id: "t2", label: "Smlouva", subject: "Investiční smlouva – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\nzasílám Vám investiční smlouvu k prostudování a podpisu.\n\n[PODPIS]" },

  { id: "t3", label: "Úrok – měsíční výpis", subject: "Měsíční výpis výnosu – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\nzasílám měsíční přehled výnosu z Vaší investice.\n\nPřipsaný výnos: [CASTKA]\nCelkový vložený kapitál: [VKLAD]\n\n[PODPIS]" },

  { id: "t4", label: "Follow-up", subject: "Navazuji na náš hovor – Build Fund",
    body: "Vážený/á [OSLOVENÍ],\n\nnavazuji na náš nedávný hovor. Rád/a bych domluvil/a schůzku.\n\nKdy by Vám vyhovovalo?\n\n[PODPIS]" },
]
```

---

## 11. ANIMACE & PŘECHODY

```css
/* Modal */
@keyframes mIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}

/* Drawer */
@keyframes drawerIn {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

/* Sidebar collapse */
transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover stavy karet, buttonů */
transition: all 0.15s;
transform: translateY(-1px) on hover;
```

---

## 12. UX PRAVIDLA & EDGE CASES

1. **Broker bez emailu** → emailový composer zobrazí varování, tlačítko odeslat disabled
2. **Broker nevidí cizí klienty** → v tabulce jsou viditelné pouze `assignedTo === user.id`
3. **Smazání klienta** → confirmation modal před akcí
4. **Smazání uživatele** → nelze smazat sám sebe (`user.id !== currentUser.id`)
5. **Podpis v emailu** → po kliknutí "Upravit" a odeslání se podpis uloží do `crm-users`
6. **Proběhlé události** → `event.date < today()` → opacity 0.55 + badge "Proběhlo"
7. **Výpočet výdělku** → live preview při zadávání vkladu a % v PaymentForm
8. **Session** → při načtení app: načíst `crm-session`, najít uživatele v `crm-users`, přihlásit bez hesla
9. **Default data** → pokud `crm-users` neexistuje → uložit DEFAULT_USERS a DEFAULT_TEMPLATES
10. **Sidebar collapsed** → šířka 68px, jen ikony, tooltip na hover

---

## 13. SEKCE STRÁNEK — CO KAŽDÁ ZOBRAZUJE

### Dashboard (všichni)
- 4 stat cards: Klientů / Celkové vklady / Výdělek / Nadcházející události
- Broker: vidí jen vlastní data
- Admin/Supervisor: vidí firemní agregát
- 3 listy: Poslední klienti | Nadcházející události (7 dní) | Top brokeři (pouze admin/supervisor)

### Klienti (všichni, broker jen vlastní)
- Filtr: search | status (Vše/Investor/Prospect) | broker (admin/supervisor)
- Tabulka: Avatar | Jméno | Kontakt | Datum hovoru | Status | Vklad | Výdělek | Broker (admin/sup) | Šipka
- Klik → otevře ClientDrawer

### Kalendář (všichni, broker jen vlastní události)
- Levý panel: mini měsíční kalendář + filtr typů
- Pravý panel: events pro vybraný den

### Emaily (všichni, broker jen vlastní klienti)
- Grid karet klientů
- Každá karta: Avatar, jméno, email, status + řada tlačítek (jedna per šablona)
- Klik na šablonu → otevře EmailComposer modal

### Uživatelé (admin + supervisor)
- Tabulka: Avatar | Jméno | Email | Role | Podpis (✒️ nastaven / –) | Status | Akce
- Admin: může přidat/editovat/smazat/aktivovat-deaktivovat
- Supervisor: jen zobrazení

### Šablony emailů (admin only)
- Grid karet šablon
- Každá: název, předmět, preview těla, proměnné
- Přidat/Editovat/Smazat

---

## 14. CHECKLIST IMPLEMENTACE

### Fáze 1 — Základ
- [ ] Datové typy a konstanly (COLORS, EVENT_TYPES, ROLE_META)
- [ ] Storage helper (get/set/async)
- [ ] Login screen (dark, demo přístupy)
- [ ] App root s booting state a session management
- [ ] Sidebar (collapsed/expanded, role-filtered nav)

### Fáze 2 — Klienti
- [ ] Clients page (tabulka s filtry)
- [ ] ClientDrawer (slide-in, 4 záložky)
- [ ] ClientForm (add/edit)
- [ ] PaymentForm (vklad + %, live výpočet)
- [ ] RBAC filtrace

### Fáze 3 — Kalendář
- [ ] CalendarPage (2-sloupec layout)
- [ ] Mini kalendář (7-sloupec grid, tečky, today highlight)
- [ ] Events list pro vybraný den
- [ ] EventForm (typ, datum, čas, klient)
- [ ] Integrace s ClientDrawer (záložka Události)

### Fáze 4 — Emaily
- [ ] EmailComposer (šablony, oslovení, podpis)
- [ ] Proměnné substituice
- [ ] Uložení podpisu do user profilu
- [ ] Emails page (grid klientů)

### Fáze 5 — Správa
- [ ] Dashboard (stat cards, lists)
- [ ] Users page (tabulka, CRUD)
- [ ] Templates page (grid, CRUD)
- [ ] Settings page

### Fáze 6 — Polish
- [ ] Animace (modal, drawer, sidebar)
- [ ] Hover stavy všech interaktivních prvků
- [ ] Prázdné stavy (empty states)
- [ ] Confirmation modaly
- [ ] Loading state při startu

---

## 15. POZNÁMKY K VÝKONU

- Nevyužívat `useEffect` zbytečně — minimalizovat re-rendery
- Clients tabulka: pokud >100 klientů zvážit virtualizaci (react-virtual)
- Storage volání: debounce při editaci formulářů
- Kalendář: memoizovat výpočet bodů (dots) pro měsíc

---

## 16. ROZŠÍŘENÍ DO BUDOUCNA (mimo scope v3)

- Export klientů do XLSX
- Notifikační systém (push/browser)
- Statistiky s grafy (Recharts)
- Import klientů z CSV
- Audit log (kdo co změnil)
- Multi-tenant (více organizací)
- REST API backend (Next.js API routes + Turso/SQLite)
- Přihlášení přes JWT místo plain password

---

*Dokument vygenerován: Build Fund CRM v3 spec — Marzo 2026*
*Stack: React 18 · Sora + Fraunces · window.storage · mailto: API*
