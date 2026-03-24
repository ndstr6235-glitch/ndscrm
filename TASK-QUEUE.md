# FRONTA ÚKOLŮ (TASK QUEUE) — Build Fund CRM

> Úkoly se zpracovávají shora dolů podle priority.
> Stav: čeká | zpracovává se | hotovo | chyba
> Nové úkoly přidávej na konec — lead je seřadí podle priority.
> DŮLEŽITÉ: Celý projekt je MOBILE-FIRST. Každá komponenta MUSÍ fungovat perfektně na mobilu (360px+), tabletu (768px+) i desktopu (1280px+).

---

## TASK-001: Základ — Design System, typy, konstanty
Priorita: 1
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Vytvoř základní infrastrukturu projektu:

1. **`src/lib/types.ts`** — TypeScript typy přesně podle specifikace v `docs/buildfund-crm-ai-handoff.md` sekce 3:
   - Role, User, Payment, Client, CalEvent, EventType, EmailTemplate
   - Exportovat všechny typy

2. **`src/lib/constants.ts`** — Konstanty:
   - `COLORS` objekt (C) — všechny barvy ze sekce 4 handoff dokumentu
   - `EVENT_TYPES` — 5 typů událostí (call, payment, reminder, interest, meeting) s label, color, pale, icon
   - `ROLE_META` — metadata pro role (administrator, supervisor, broker) — barva, label, ikona
   - `NAV_ITEMS` — navigační položky s role přístupem (Dashboard, Klienti, Kalendář, Emaily, Uživatelé, Šablony, Nastavení)
   - `DEFAULT_USERS` — 4 výchozí uživatelé ze sekce 10
   - `DEFAULT_TEMPLATES` — 4 email šablony ze sekce 10

3. **`src/lib/utils.ts`** — Utility funkce:
   - `fmtCZK(value)` — formátování měny "500 000 Kč" (cs-CZ, CZK, bez desetinných)
   - `fmtDate(date)` — formátování data "15. 2. 2026" (cs-CZ)
   - `fmtDateTime(date)` — datum + čas
   - `cn()` — merge Tailwind tříd (clsx + tailwind-merge)
   - `generateId()` — generátor UUID

4. **Tailwind konfigurace** — rozšířit `tailwind.config.ts`:
   - Custom barvy z design systemu (gold, emerald, ruby, sapphire, amber, surface, sidebar...)
   - Custom fonty (Fraunces, Sora)
   - Custom stíny (shadow-card, shadow-md, shadow-lg)
   - Custom border-radius (card: 16px, input: 10px, pill: 20px)
   - Breakpointy: sm (360px mobil), md (768px tablet), lg (1280px desktop)

5. **Google Fonts** — přidat Fraunces + Sora do `src/app/layout.tsx` přes `next/font/google`

6. **`src/app/globals.css`** — základní global styly:
   - Reset, smooth scrolling
   - Custom scrollbar (thin, subtle)
   - Animace: fadeIn, slideIn, drawerIn
   - Base barva pozadí #f0f2f7

7. **Nainstalovat závislosti**: `clsx`, `tailwind-merge`

### Kontext:
- Kompletní spec: docs/buildfund-crm-ai-handoff.md (sekce 2, 3, 4, 8, 9, 10, 11)
- Vizuální mockup: docs/buildfund-crm-mockup.html
- Breakpointy musí reflektovat mobile-first přístup — základní styly = mobil, pak @md a @lg

### Očekávaný výsledek:
- Všechny typy, konstanty a utility jsou exportovány a použitelné
- Tailwind má custom theme rozšířený o design system
- Fonty se načítají přes next/font/google
- `npm run build` projde bez chyb

---

## TASK-002: Prisma schéma + seed data
Priorita: 1
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Nastavit Prisma s SQLite (lokální file pro development, Turso pro produkci):

1. **Nainstalovat**: `prisma`, `@prisma/client`

2. **`prisma/schema.prisma`** — modely podle typů z TASK-001:
   - `User` — id (cuid), firstName, lastName, email (unique), password, role (enum Role), active (default true), signature (optional), createdAt
   - `Client` — id (cuid), firstName, lastName, phone, email, callDate, nextPaymentDate, paymentFreq (Int, default 30), note, assignedTo (relation na User), createdAt
   - `Payment` — id (cuid), amount (Float), percent (Float), profit (Float), date, note, clientId (relation na Client)
   - `CalEvent` — id (cuid), clientId (optional relation), userId (relation), type (enum EventType), title, date, time, note, createdAt
   - `EmailTemplate` — id (cuid), label, subject, body
   - Enum `Role`: ADMINISTRATOR, SUPERVISOR, BROKER
   - Enum `EventType`: CALL, PAYMENT, REMINDER, INTEREST, MEETING

3. **`prisma/seed.ts`** — seed skript:
   - Vloží 4 výchozí uživatele z DEFAULT_USERS (hesla hashovat přes bcrypt)
   - Vloží 4 email šablony z DEFAULT_TEMPLATES
   - Vloží 5-8 demo klientů s realistickými českými jmény
   - Vloží 10-15 demo plateb rozložených mezi klienty
   - Vloží 8-12 demo kalendářních událostí (mix typů)

4. **`src/lib/db.ts`** — Prisma client singleton (pro Next.js hot reload)

5. Přidat seed skript do `package.json`: `"prisma": { "seed": "ts-node prisma/seed.ts" }`

### Kontext:
- Typy z TASK-001 (src/lib/types.ts)
- Default data ze spec sekce 10
- Pro development SQLite file, pro produkci Turso (env variable DATABASE_URL)

### Očekávaný výsledek:
- `npx prisma db push` vytvoří tabulky
- `npx prisma db seed` naplní demo daty
- Prisma client funguje v Next.js server components
- `npm run build` projde

---

## TASK-003: Autentizace — Login stránka + session
Priorita: 1
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Implementovat autentizaci a login stránku:

1. **NextAuth konfigurace** (`src/lib/auth.ts`):
   - Credentials provider (email + heslo)
   - Ověření proti Prisma User tabulce
   - Session obsahuje: id, firstName, lastName, email, role
   - JWT strategy

2. **Login stránka** (`src/app/(auth)/login/page.tsx`):
   - MOBILE-FIRST layout — na mobilu full-screen, na desktopu centrovaný card
   - Tmavé pozadí s gradientem (linear-gradient 135deg, #0f1117 → #1a1f2e)
   - Logo: zlatý gradient čtverec (border-radius 11px) s "₿" uprostřed
   - Název "Build Fund CRM" v Fraunces fontu, bílá
   - Podtitulek "Přihlášení do systému" malý, uppercase, průhledná bílá
   - Formulářový card s backdrop blur efektem:
     - Email input (label nahoře, tmavé pozadí inputu)
     - Heslo input (label nahoře, tmavé pozadí inputu, toggle zobrazení hesla)
     - "Přihlásit se →" button — zlatý gradient, full-width, bold
   - Demo přístupy sekce pod formulářem:
     - 3 pill buttony: "Administrator" (červený), "Supervisor" (zlatý), "Broker" (modrý)
     - Klik na pill vyplní email+heslo daného demo uživatele
   - Error state: červený text pod formulářem při špatném heslu
   - Loading state: spinner v buttonu při přihlašování
   - RESPONZIVITA:
     - Mobil (360px+): formulář zabírá celou šířku, padding 16px, logo menší
     - Tablet (768px+): formulář max-width 420px, centrovaný
     - Desktop (1280px+): formulář max-width 420px, vertikálně centrovaný

3. **Middleware** (`src/middleware.ts`):
   - Chránit všechny routes kromě /login
   - Redirect na /login pokud není session
   - Redirect na /dashboard pokud je session a jde na /login

4. **Viz mockup**: Login screen v docs/buildfund-crm-mockup.html (první screen v gridu)

### Kontext:
- Mockup: docs/buildfund-crm-mockup.html — login screen
- Spec sekce 5.1 a 10 (default users)
- Prisma User model z TASK-002

### Očekávaný výsledek:
- Login stránka vypadá přesně jako mockup
- Demo přístupy fungují — klik vyplní credentials
- Po přihlášení redirect na /dashboard
- Session persistuje přes refresh
- Na mobilu je login full-screen a pohodlně použitelný palcem
- `npm run build` projde

---

## TASK-004: Layout — Sidebar + Main area
Priorita: 1
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Implementovat hlavní layout aplikace se sidebarem:

1. **Dashboard layout** (`src/app/(dashboard)/layout.tsx`):
   - Server component, načte session
   - Předá user data do Sidebaru

2. **Sidebar** (`src/components/layout/Sidebar.tsx`):
   - Client component (toggle collapsed, aktivní stav)
   - MOBILE vs DESKTOP CHOVÁNÍ:

   **Desktop (lg: 1280px+):**
   - Levý sidebar, fixed position
   - Expanded: width 220px
   - Collapsed: width 68px (jen ikony)
   - Toggle button dole (chevron)
   - Tmavé pozadí #0f1117

   **Tablet (md: 768px-1279px):**
   - Sidebar vždy collapsed (68px), jen ikony
   - Tooltip na hover s názvem položky

   **Mobil (pod 768px):**
   - Sidebar SKRYTÝ, hamburger menu v top baru
   - Klik na hamburger → sidebar vyjede jako OVERLAY zleva (fullscreen drawer)
   - Backdrop za sidebarem (klik zavře)
   - Po kliknutí na nav item se sidebar automaticky zavře
   - Swipe doleva zavře sidebar (nice to have)

   **Obsah sidebaru (společný):**
   - Nahoře: Logo (₿ zlatý gradient) + "Build Fund CRM" (jen v expanded)
   - Nav items filtrované dle role uživatele (viz NAV_ITEMS v constants.ts)
   - Aktivní item: border-left 2px solid gold, background rgba(gold, 0.12), text gold
   - Dole: User info (avatar s iniciálami + jméno + role) + logout button
   - Animace: width transition 0.25s cubic-bezier(0.4, 0, 0.2, 1)

3. **Top bar na mobilu** (`src/components/layout/MobileHeader.tsx`):
   - Pouze na mobilu (hidden na md+)
   - Hamburger vlevo, "Build Fund CRM" uprostřed, user avatar vpravo
   - Sticky top, white background, border-bottom, shadow
   - Height: 56px

4. **Main content area**:
   - flex: 1, overflow auto
   - Desktop padding: 32px 36px
   - Tablet padding: 24px
   - Mobil padding: 16px

### Kontext:
- Mockup: sidebar je vidět na každém screenu v mockupu (collapsed, 52px wide)
- Spec sekce 5.1 a 5.2
- NAV_ITEMS z constants.ts (TASK-001)

### Očekávaný výsledek:
- Na desktopu: klasický sidebar s toggle
- Na tabletu: collapsed sidebar
- Na mobilu: hamburger → overlay drawer, smooth animace
- Navigace funguje, aktivní stav se mění
- Sidebar filtruje položky dle role (broker nevidí Uživatele, Šablony, Nastavení)
- Plynulé přechody mezi breakpointy
- `npm run build` projde

---

## TASK-005: Dashboard stránka
Priorita: 1
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Implementovat Dashboard stránku:

1. **Dashboard page** (`src/app/(dashboard)/dashboard/page.tsx`):
   - Server component, načte data z Prisma
   - Broker: vidí jen vlastní data, Admin/Supervisor: firemní agregát
   - Header: "Dashboard" + "Vítejte zpět, [jméno]" s mávající rukou

2. **Stat Cards** — 4 karty v řadě:
   - "Klientů" (modrý border-left) — počet + "X investorů"
   - "Celkové vklady" (zelený border-left) — fmtCZK(sum)
   - "Výdělek" (zlatý border-left) — fmtCZK(sum)
   - "Nadcházející události" (oranžový border-left) — počet + "příštích 7 dní"
   - RESPONZIVITA:
     - Mobil: 2 sloupce (2×2 grid), menší padding, menší font
     - Tablet: 4 sloupce, standardní
     - Desktop: 4 sloupce, komfortní padding

3. **3 listy pod stat cards**:
   - "Poslední klienti" — posledních 5 přidaných (avatar + jméno + vklad/status)
   - "Nadcházející události" — events v příštích 7 dnech (ikona + název + čas)
   - "Top brokeři" — jen pro admin/supervisor (pořadí + jméno + výdělek) s medailemi (1. zlatá, 2. stříbrná, 3. bronzová)
   - RESPONZIVITA:
     - Mobil: 1 sloupec — listy pod sebou, full-width
     - Tablet: 2 sloupce (poslední klienti + události vedle sebe, top brokeři pod)
     - Desktop: 3 sloupce vedle sebe

4. **Viz mockup**: Dashboard screen — 4 stat cards nahoře, 3 listy dole

### Kontext:
- Mockup: docs/buildfund-crm-mockup.html — Dashboard screen
- Spec sekce 13 (Dashboard)
- RBAC: broker vidí jen vlastní, admin/supervisor vidí vše (sekce 6)
- Výpočty: sekce 7

### Očekávaný výsledek:
- Dashboard zobrazuje reálná data z databáze
- RBAC funguje — broker vidí jen své, admin vše
- Na mobilu 2×2 stat cards + listy pod sebou = pohodlně scrollovatelné
- `npm run build` projde

---

## TASK-006: Klienti — tabulka s filtry
Priorita: 1
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Implementovat stránku klientů s tabulkou:

1. **Clients page** (`src/app/(dashboard)/clients/page.tsx`):
   - Header: "Klienti" + počet + "Přidat klienta" button (zlatý gradient)
   - RBAC: broker vidí jen `assignedTo === user.id`

2. **Filtry nad tabulkou**:
   - Search input (hledat podle jména, emailu, telefonu)
   - Status dropdown: Vše / Investor (má platby) / Prospect (nemá platby)
   - Broker dropdown (jen admin/supervisor): filtr podle přiřazeného brokera
   - RESPONZIVITA:
     - Mobil: filtry pod sebou, full-width, search nahoře
     - Desktop: filtry v řadě

3. **Tabulka klientů** (desktop):
   - Sloupce: Avatar (iniciály) | Jméno | Kontakt (email+tel) | Datum hovoru | Status badge | Vklad (fmtCZK) | Výdělek (fmtCZK) | Broker (admin/sup) | Šipka
   - Hover: background surfaceHover
   - Klik na řádek → otevře ClientDrawer (TASK-007)

4. **Card list klientů** (mobil):
   - Na mobilu NETABULKOVAT — místo toho card layout
   - Každý klient = karta:
     - Avatar (iniciály) + jméno + status badge
     - Pod tím: telefon, email
     - Pod tím: vklad + výdělek
     - Klik → otevře drawer
   - Karty pod sebou, gap 12px
   - DŮLEŽITÉ: na mobilu přepnout z tabulky na karty, ne horizontální scroll tabulky

5. **Prázdný stav**: ilustrace/ikona + "Zatím nemáte žádné klienty" + CTA button

6. **Viz mockup**: Klienti tabulka screen

### Kontext:
- Mockup: docs/buildfund-crm-mockup.html — Klienti screen
- Spec sekce 13 (Klienti) + sekce 6 (RBAC)
- Status: "Investor" = client.payments.length > 0, "Prospect" = 0 plateb

### Očekávaný výsledek:
- Desktop: přehledná tabulka se všemi sloupci
- Mobil: card layout, žádný horizontální scroll, pohodlné proklikávání palcem
- Filtry fungují (search, status, broker)
- RBAC: broker vidí jen své klienty
- `npm run build` projde

---

## TASK-007: Klientský Drawer — slide-in detail
Priorita: 1
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Implementovat slide-in drawer pro detail klienta:

1. **ClientDrawer** (`src/components/clients/ClientDrawer.tsx`):
   - Client component
   - Position fixed, right 0, top 0, bottom 0
   - RESPONZIVITA:
     - Desktop: width min(640px, 95vw)
     - Tablet: width min(540px, 95vw)
     - Mobil: width 100vw (FULLSCREEN) — důležité pro mobilní UX
   - Animace: translateX(100%) → translateX(0) za 0.25s ease-out
   - Backdrop: tmavý overlay s blur, klik zavře drawer
   - Na mobilu: swipe doprava zavře drawer (touch events)

2. **Drawer header** (tmavý, gradient):
   - Avatar (velký, 40px) + jméno (Fraunces, bold) + status badge + broker jméno
   - KPI řádek (3 sloupce): Celkový vklad (zelená) | Výdělek (zlatá) | Průměr % (modrá)
   - × button pro zavření (vpravo nahoře)
   - Na mobilu: KPI řádek scrollovatelný horizontálně pokud se nevejde

3. **4 záložky** (tab bar pod headerem):
   - Přehled | Platby (počet) | Události (počet) | Email
   - Aktivní: gold border-bottom 2px + bold
   - Na mobilu: pokud se nevejdou, horizontální scroll tab baru

4. **Záložka Přehled**:
   - Grid 2×2: Telefon, Email, Datum hovoru, Příští platba
   - Poznámka box (zlatý border, editovatelná)
   - Edit button pro úpravu klienta (otevře ClientForm modal)

5. **Záložka Platby**:
   - Seznam plateb (datum, částka, %, výdělek, poznámka)
   - Součty: celkový vklad + celkový výdělek
   - "Přidat platbu" button → PaymentForm
   - Na mobilu: každá platba jako mini-karta, ne tabulka

6. **Záložka Události**:
   - Seznam CalEvents pro daného klienta
   - Seřazeno dle data desc
   - "Přidat událost" button → EventForm

7. **Záložka Email**:
   - Výběr šablony → otevře EmailComposer

8. **Footer drawer** (sticky bottom):
   - 3 CTA buttony: Email (zlatý) | Platba (zelený) | Událost (neutrální)
   - Na mobilu: buttony full-width, pod sebou nebo flex-wrap

9. **Viz mockup**: Client Drawer screen — tmavý header, tabs, content

### Kontext:
- Mockup: docs/buildfund-crm-mockup.html — Client Drawer screen
- Spec sekce 5.3 + sekce 7 (výpočty)
- Na mobilu drawer musí být fullscreen a pohodlně ovladatelný jednou rukou

### Očekávaný výsledek:
- Drawer se animuje zprava
- Na mobilu fullscreen, na desktopu 640px panel
- Všechny 4 záložky fungují s reálnými daty
- Footer CTA buttony fungují
- Touch-friendly: dostatečně velké touch targety (min 44px), žádné drobné elementy
- `npm run build` projde

---

## TASK-008: CRUD formuláře — ClientForm + PaymentForm
Priorita: 1
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

1. **ClientForm** (`src/components/clients/ClientForm.tsx`):
   - Modal dialog pro přidání/editaci klienta
   - Pole: Jméno, Příjmení, Telefon, Email, Datum prvního hovoru, Datum příští platby, Frekvence plateb (dny), Přiřazený broker (dropdown — admin/supervisor), Poznámka (textarea)
   - Validace: jméno + příjmení povinné, email formát, telefon formát
   - RESPONZIVITA:
     - Desktop: modal centrovaný, max-width 520px
     - Mobil: modal fullscreen (bottom sheet styl) — vysune se zdola
   - Na mobilu: inputy dostatečně velké (min-height 44px), spacing pro palec

2. **PaymentForm** (`src/components/clients/PaymentForm.tsx`):
   - Modal pro přidání platby
   - Pole: Částka (Kč), Procento výdělku (%), Datum platby, Poznámka
   - LIVE PREVIEW výpočtu: při zadání částky a % se okamžitě zobrazí výdělek
   - Formát: "Váš výdělek: 50 000 Kč" (fmtCZK)
   - Validace: částka > 0, procento 0-100
   - RESPONZIVITA: stejná logika jako ClientForm

3. **Server Actions** pro CRUD:
   - `createClient`, `updateClient`, `deleteClient`
   - `createPayment`
   - Revalidace cest po mutaci
   - Delete klienta: confirmation modal před smazáním

### Kontext:
- Spec sekce 7 (výpočty) — profit = (amount * percent) / 100
- Spec sekce 12 (UX pravidla) — smazání = confirmation modal
- Na mobilu musí být formuláře vyplnitelné pohodlně jedním palcem

### Očekávaný výsledek:
- Přidání/editace/smazání klienta funguje
- Přidání platby s live výpočtem funguje
- Na mobilu bottom-sheet modaly, velké inputy
- `npm run build` projde

---

## TASK-009: Kalendář — mini-cal + events
Priorita: 2
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Implementovat kalendářovou stránku:

1. **Calendar page** (`src/app/(dashboard)/calendar/page.tsx`):
   - Header: "Kalendář" + "Přidat událost" button

2. **DESKTOP LAYOUT (lg+):** 2 sloupce
   - Levý panel (280px): mini kalendář + filtr typů
   - Pravý panel (flex 1): events pro vybraný den

3. **MOBIL LAYOUT (pod lg):**
   - Mini kalendář nahoře (full-width)
   - Pod ním filtr typů (horizontální scroll pills)
   - Pod tím events pro vybraný den
   - Všechno v jednom sloupci, scrollovatelné

4. **Mini kalendář** (`src/components/calendar/MiniCalendar.tsx`):
   - Grid 7 sloupců (Po=první den, české zkratky)
   - Navigace: < měsíc >
   - Dnešek: zlatý gradient background + bold
   - Vybraný den: zlatý ring/outline
   - Barevné tečky pod číslem dne = typy událostí v daný den
   - Na mobilu: čísla dost velká na kliknutí palcem (min 36px touch target)

5. **Filtr typů pod kalendářem**:
   - Řádek per typ: ikona + label + počet
   - Kliknutelný = toggle (filtruje events)
   - Na mobilu: horizontální pill bar místo vertikálního listu

6. **Events list** pro vybraný den:
   - Seřazeno dle time ASC
   - Event karta: ikona (typ) | název | čas | klient | poznámka
   - Barevný border dle typu
   - Proběhlé události: opacity 0.55 + badge "Proběhlo"
   - Smazání: × button na kartě (confirmation)
   - Na mobilu: karty full-width, touch-friendly

7. **EventForm** (`src/components/calendar/EventForm.tsx`):
   - Modal pro přidání události
   - Pole: Typ (select z EVENT_TYPES), Název, Datum, Čas, Klient (optional autocomplete), Poznámka
   - Na mobilu: bottom-sheet modal

8. **RBAC**: Broker vidí jen vlastní události, admin/supervisor vidí vše

### Kontext:
- Mockup: docs/buildfund-crm-mockup.html — Kalendář screen
- Spec sekce 5.4 + 9 (EVENT_TYPES)
- Kalendář: pondělí = první den týdne (český standard)

### Očekávaný výsledek:
- Mini kalendář s tečkami funguje
- Klik na den zobrazí events
- Filtr typů funguje
- Na mobilu: vertikální layout, velké touch targety, plynulé scrollování
- `npm run build` projde

---

## TASK-010: Emaily — grid + EmailComposer
Priorita: 2
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

1. **Emails page** (`src/app/(dashboard)/emails/page.tsx`):
   - Grid karet klientů
   - Každá karta: Avatar, jméno, email, status badge
   - Pod tím: řada tlačítek — jedno per šablona (pill buttony)
   - Klik na šablonu → otevře EmailComposer s vybraným klientem + šablonou
   - RBAC: broker vidí jen vlastní klienty
   - RESPONZIVITA:
     - Desktop: 3 sloupce grid
     - Tablet: 2 sloupce
     - Mobil: 1 sloupec, karty full-width

2. **RBAC na email šablony — KRITICKÉ**:
   - Každá šablona má pole `allowedRoles[]` — kdo ji smí odeslat
   - **Prezentace** → všichni (broker, supervisor, admin)
   - **Návrh smlouvy** → všichni (broker, supervisor, admin)
   - **Smlouva (finální)** → POUZE administrator
   - **Úrok — měsíční výpis** → všichni
   - **Follow-up** → všichni
   - Broker NEVIDÍ pill button "Smlouva" na kartě klienta
   - Pokud broker nemá přístup k šabloně, button se nezobrazí
   - Admin v EmailComposeru vidí VŠECHNY šablony

3. **Workflow smlouvy**:
   - Broker připraví podklady: komunikuje s klientem (prezentace, follow-up), zadá poznámky, vklady, podmínky do klientského profilu
   - Admin vidí vše co broker připravil (poznámky, historie, platby)
   - Admin na základě těchto podkladů odešle finální smlouvu klientovi
   - V EmailComposeru pro šablonu "Smlouva": zobrazit sekci "Podklady od brokera" — poznámky klienta, poslední aktivity, vklady

4. **EmailComposer** (`src/components/emails/EmailComposer.tsx`):
   - Modal dialog (na mobilu fullscreen)
   - Pořadí prvků shora dolů:
     a. Výběr šablony — pill buttony v řadě (na mobilu horizontální scroll)
        - Zobrazit JEN šablony kde `allowedRoles.includes(currentUser.role)`
     b. Komu + Předmět — read-only box (šedý bg)
     c. Oslovení — ZLATÝ RÁMEK, zvýrazněný input, primární interakce
        - Placeholder: 'Např: "pane Nováku", "Petro"'
        - Na mobilu: velký input, auto-focus
     d. Tělo emailu — textarea, editovatelné, auto-resize
     e. Podpis — MODRÝ RÁMEK, výchozí = broker's signature
        - "Upravit" link → toggle editace podpisu
        - Uložení podpisu aktualizuje user.signature v DB

   - Logika substituce proměnných:
     ```
     body = template.body
       .replace(/\[OSLOVENÍ\]/g, salutation)
       .replace(/\[PODPIS\]/g, signature)
       .replace(/\[VKLAD\]/g, fmtCZK(totalDeposit))
       .replace(/\[CASTKA\]/g, "–")
     ```

   - "Otevřít v poštovním klientovi" button:
     ```
     window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
     ```

   - Varování pokud klient nemá email

5. **Nová šablona "Smlouva (finální)"** — přidat do DEFAULT_TEMPLATES:
   ```
   { id: "t5", label: "Smlouva (finální)",
     subject: "Investiční smlouva – Build Fund",
     body: "Vážený/á [OSLOVENÍ],\n\nna základě naší komunikace Vám zasílám finální investiční smlouvu k podpisu.\n\nCelkový dohodnutý vklad: [VKLAD]\n\nSmlouvu prosím prostudujte a v případě souhlasu podepište a zašlete zpět.\n\n[PODPIS]",
     allowedRoles: ["administrator"]
   }
   ```

6. **Viz mockup**: Email Composer screen

### Kontext:
- Mockup: docs/buildfund-crm-mockup.html — Email Composer screen
- Spec sekce 5.5 + sekce 10 (šablony)
- Na mobilu EmailComposer musí být fullscreen a snadno vyplnitelný
- DŮLEŽITÉ: Broker připravuje podklady → Admin odesílá smlouvu

### Očekávaný výsledek:
- Grid klientů s šablona-buttony (filtrované dle role)
- Broker vidí: Prezentace, Návrh smlouvy, Úrok, Follow-up
- Admin vidí: vše včetně "Smlouva (finální)"
- EmailComposer s proměnnou substitucí
- Podpis editovatelný a persistentní
- Na mobilu fullscreen modal, velké inputy
- `npm run build` projde

---

## TASK-011: Správa uživatelů + Šablony + Nastavení
Priorita: 2
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

1. **Users page** (`src/app/(dashboard)/users/page.tsx`):
   - Přístup: admin + supervisor
   - Tabulka: Avatar | Jméno | Email | Role (badge s barvou) | Podpis (ikona) | Status (active/inactive) | Akce
   - Admin: může přidat/editovat/smazat/aktivovat-deaktivovat
   - Supervisor: jen zobrazení (read-only)
   - Nelze smazat sám sebe
   - UserForm modal pro přidání/editaci
   - RESPONZIVITA:
     - Mobil: card layout místo tabulky (stejně jako klienti)

2. **Templates page** (`src/app/(dashboard)/templates/page.tsx`):
   - Přístup: admin only
   - Grid karet šablon
   - Každá karta: název (label), předmět, preview těla (truncated), seznam proměnných
   - CRUD: přidat/editovat/smazat šablonu
   - TemplateForm modal
   - RESPONZIVITA:
     - Desktop: 2 sloupce
     - Mobil: 1 sloupec

3. **Settings page** (`src/app/(dashboard)/settings/page.tsx`):
   - Přístup: admin only
   - Placeholder stránka: "Nastavení systému" s basic info
   - Pro budoucí rozšíření

### Kontext:
- Spec sekce 13 (Uživatelé, Šablony) + sekce 6 (RBAC)
- Mockup: permissions matrix tabulka

### Očekávaný výsledek:
- Admin může spravovat uživatele a šablony
- Supervisor vidí uživatele read-only
- Broker tyto stránky vůbec nevidí (redirect)
- Na mobilu card layout
- `npm run build` projde

---

## TASK-012: Polish — Animace, empty states, confirmation modaly, loading
Priorita: 2
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Finální leštění UX:

1. **Animace**:
   - Modal: fadeIn + scaleUp (opacity 0 + translateY(10px) + scale(0.98) → normal)
   - Drawer: slideIn zprava (translateX(100%) → 0)
   - Sidebar collapse: width transition 0.25s
   - Hover stavy: translateY(-1px) + shadow zvýraznění
   - Staggered animations pro list items (postupné zobrazení)
   - Na mobilu: respektovat `prefers-reduced-motion`

2. **Empty states** pro všechny stránky:
   - Klienti: "Zatím nemáte žádné klienty" + ilustrace + CTA
   - Kalendář: "Na tento den nemáte žádné události"
   - Platby v draweru: "Tento klient zatím nemá žádné platby"
   - Události v draweru: "Žádné události"

3. **Confirmation modaly**:
   - Smazání klienta: "Opravdu chcete smazat [jméno]? Tato akce je nevratná."
   - Smazání uživatele: "Opravdu chcete smazat uživatele [jméno]?"
   - Smazání šablony, události
   - Na mobilu: modaly jako bottom-sheet

4. **Loading states**:
   - Skeleton loading pro tabulky a karty
   - Spinner v buttonech při akcích
   - Loading bar/indicator při navigaci mezi stránkami
   - Initial loading: "Build Fund CRM" logo s pulse animací

5. **Toast notifikace**:
   - Úspěch (zelená): "Klient vytvořen", "Platba přidána"
   - Chyba (červená): "Nepodařilo se uložit"
   - Pozice: mobil = bottom-center, desktop = top-right
   - Auto-dismiss po 3s

6. **Accessibility na mobilu**:
   - Všechny touch targety min 44×44px
   - Focus visible styly
   - Proper aria labels
   - Keyboard navigation
   - Safe area insets (notch na iPhone)

### Kontext:
- Spec sekce 11 (animace) + sekce 12 (UX pravidla)
- Každý element musí být touch-friendly na mobilu

### Očekávaný výsledek:
- Plynulé animace bez jankování
- Prázdné stavy mají smysluplné zprávy
- Confirmation modaly chrání před nechtěným smazáním
- Loading states zamezí netrpělivým klikům
- Na mobilu vše pohodlně ovladatelné
- `npm run build` projde

---

## TASK-013: Kompletní mobilní audit + PWA
Priorita: 2
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Finální audit mobilní verze a příprava PWA:

1. **Mobilní audit** — projít KAŽDOU stránku na 360px šířce:
   - Login: je full-screen? Demo přístupy se vejdou?
   - Dashboard: stat cards 2×2? Listy pod sebou?
   - Klienti: card layout místo tabulky? Filtry fungují?
   - Client Drawer: fullscreen? Tabs scrollovatelné? Footer buttony?
   - Kalendář: vertikální layout? Mini-cal touch targety?
   - Emaily: 1 sloupec grid? Composer fullscreen?
   - Uživatelé: card layout?
   - Šablony: 1 sloupec?

2. **Touch optimalizace**:
   - Žádný element menší než 44×44px
   - Dostatečný spacing mezi klikatelnými elementy (min 8px gap)
   - Pull-to-refresh na hlavních stránkách (nice to have)
   - Swipe gesta: drawer zavření, navigace (nice to have)

3. **PWA setup**:
   - `next-pwa` nebo manual service worker
   - `manifest.json`: název "Build Fund CRM", ikony, theme_color #b8912a, background_color #0f1117
   - Offline fallback stránka
   - "Přidat na plochu" support
   - Standalone display mode (bez browser chrome)
   - Status bar: dark-content

4. **Viewport a meta tagy**:
   - viewport: width=device-width, initial-scale=1, viewport-fit=cover
   - apple-mobile-web-app-capable: yes
   - apple-mobile-web-app-status-bar-style: black-translucent
   - Safe area padding pro iPhone s notchem

5. **Performance na mobilu**:
   - Lazy loading komponent (dynamic imports)
   - Optimalizované obrázky (pokud jsou)
   - Minimální JS bundle
   - Skeleton loading místo spinnerů

### Kontext:
- Všechny předchozí tasky musí být hotové
- Testovat na: iPhone SE (375px), iPhone 14 (390px), Android (360px), iPad (768px)

### Očekávaný výsledek:
- Aplikace funguje perfektně na mobilu jako PWA
- Lze nainstalovat na plochu telefonu
- Offline fallback funguje
- Lighthouse mobile score 90+
- `npm run build` projde

---

## TASK-014: Cmd+K Globální vyhledávání
Priorita: 2
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Implementovat globální vyhledávací modal (Command Palette):

1. **Trigger**:
   - Desktop: klávesová zkratka Cmd+K (Mac) / Ctrl+K (Win)
   - Mobil: ikona lupy v MobileHeader (vedle hamburgeru)
   - Vždy dostupný z jakékoliv stránky

2. **Search modal** (`src/components/ui/CommandPalette.tsx`):
   - Overlay modal s velkým search inputem nahoře
   - Auto-focus na input při otevření
   - Desktop: max-width 560px, centrovaný, rounded
   - Mobil: fullscreen, input nahoře s padding pro safe area
   - Escape / klik na overlay = zavření

3. **Co se prohledává**:
   - Klienti (jméno, příjmení, email, telefon)
   - Události (název, klient)
   - Uživatelé (jméno — jen admin/supervisor)
   - Navigační položky (Dashboard, Klienti, Kalendář...)
   - RBAC: broker vidí jen své klienty a události

4. **Výsledky**:
   - Seskupené dle typu: "Klienti", "Události", "Navigace"
   - Každý výsledek: ikona + název + podtitulek (email/typ/cesta)
   - Klávesová navigace: šipky nahoru/dolů + Enter
   - Max 5 výsledků per kategorie
   - Debounce 200ms na input

5. **Akce po výběru**:
   - Klient → otevře ClientDrawer
   - Událost → naviguje na Kalendář s vybraným dnem
   - Navigace → přesměruje na stránku

6. **Hint**: v sidebaru malý badge "⌘K" vedle search ikony

### Kontext:
- Inspirace: Vercel dashboard, Linear, Raycast
- Na mobilu nahrazuje klasický search — je to primární způsob hledání

### Očekávaný výsledek:
- Cmd+K otevře modal, začneš psát, výsledky se filtrují live
- Na mobilu ikona lupy → fullscreen search
- Navigace klávesnicí funguje
- `npm run build` projde

---

## TASK-015: Activity Timeline na klientovi
Priorita: 2
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Přidat historii aktivit ke každému klientovi:

1. **Nový model** — `Activity` v Prisma:
   ```
   id, clientId, userId, type, description, metadata (JSON), createdAt
   ```
   - Typy: CLIENT_CREATED, CLIENT_UPDATED, PAYMENT_ADDED, EMAIL_SENT, EVENT_CREATED, NOTE_CHANGED, ASSIGNED_TO_CHANGED

2. **Automatické logování** — při každé akci na klientovi se vytvoří Activity záznam:
   - Přidání klienta: "Klient vytvořen operátorem Tomáš Novák"
   - Platba: "Přidána platba 500 000 Kč (10% = 50 000 Kč)"
   - Email: "Odeslán email — šablona Prezentace"
   - Událost: "Vytvořena událost — Hovor 25.3.2026 10:00"
   - Změna poznámky: "Poznámka aktualizována"
   - Přiřazení: "Klient přiřazen brokerovi Petra Horáková"

3. **5. záložka v ClientDrawer** — "Historie":
   - Vertikální timeline (čára vlevo, body = události)
   - Každý záznam: ikona typu + popis + kdo + kdy (relative time: "před 2 hodinami")
   - Seřazeno od nejnovějšího
   - Lazy loading — načíst prvních 20, pak "Zobrazit starší"
   - RESPONZIVITA: na mobilu kompaktní timeline, menší fonty

4. **RBAC**: broker vidí historii jen svých klientů

### Kontext:
- Rozšíření ClientDrawer z TASK-007
- Bez tohle se v CRM nikdo nevyzná co se s klientem dělo

### Očekávaný výsledek:
- Každá akce na klientovi se automaticky loguje
- V draweru záložka Historie s vizuální timeline
- Na mobilu čitelná a přehledná
- `npm run build` projde

---

## TASK-016: Grafy na Dashboardu
Priorita: 3
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Přidat vizuální grafy na Dashboard (pod stat cards, nad listy):

1. **Nainstalovat**: `recharts`

2. **Bar chart — Vklady za posledních 6 měsíců**:
   - Osa X: měsíce (české názvy: Leden, Únor...)
   - Osa Y: částka v Kč
   - Barva: emerald gradient
   - Tooltip: "Březen 2026: 1 250 000 Kč"
   - Broker: jen vlastní vklady, admin/supervisor: firemní

3. **Line chart — Trend výdělků za posledních 6 měsíců**:
   - Osa X: měsíce
   - Osa Y: výdělek v Kč
   - Barva: gold linka s gold fill pod ní (area chart)
   - Broker: jen vlastní, admin/supervisor: celkové

4. **Layout grafů**:
   - Desktop: 2 grafy vedle sebe (50/50)
   - Tablet: 2 grafy vedle sebe (menší)
   - Mobil: 1 sloupec, grafy pod sebou, full-width
   - Grafy v kartách s bílým pozadím, border-radius 16px

5. **Prázdný stav**: pokud nejsou data → "Zatím žádná data pro zobrazení grafu"

### Kontext:
- Rozšíření Dashboard z TASK-005
- Data z Payment modelu, seskupit podle měsíce

### Očekávaný výsledek:
- 2 grafy na dashboardu s reálnými daty
- Responzivní — na mobilu pod sebou
- `npm run build` projde

---

## TASK-017: Dark Mode
Priorita: 3
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Implementovat dark mode pro celou aplikaci:

1. **Toggle**:
   - Sidebar: ikona měsíce/slunce dole (vedle user info)
   - Respektovat `prefers-color-scheme` systému jako výchozí
   - Uložit preferenci do localStorage
   - Na mobilu: toggle v MobileHeader nebo v user menu

2. **Tailwind dark mode** — class strategy:
   - Přidat `darkMode: 'class'` do tailwind config
   - `<html class="dark">` toggle

3. **Dark barvy**:
   - Background: #0f1117 (hlavní), #1a1f2e (surface/karty)
   - Text: #e4e8f0 (primární), #8892aa (sekundární)
   - Border: #2a3040
   - Input background: #1a1f2e
   - Sidebar: zůstává stejný (už je tmavý)
   - Gold akcent: zůstává #b8912a/#f5c842
   - Sémantické barvy (emerald, ruby, sapphire): mírně ztlumit

4. **Komponenty k aktualizaci**:
   - Všechny karty, tabulky, modaly, drawery, formuláře
   - Stat cards, grafy (Recharts má dark theme support)
   - Login stránka: už je tmavá, neměnit
   - Empty states, toasty, badge

5. **Transition**: background a barvy s transition 0.2s pro plynulý přechod

### Kontext:
- Sidebar je už tmavý — dark mode rozšíří tmavé téma na zbytek
- Operátoři v call centru pracují celý den — dark mode šetří oči

### Očekávaný výsledek:
- Toggle mezi light/dark funguje
- Všechny stránky vypadají dobře v obou módech
- Preference se pamatuje přes reload
- `npm run build` projde

---

## TASK-018: Denní plán brokera — "Můj den"
Priorita: 3
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Nová stránka/widget "Můj den" — denní přehled pro brokera:

1. **Kde se zobrazí**:
   - Jako úvodní widget na Dashboardu (nad stat cards) — jen pro brokery
   - Nebo jako samostatná stránka v nav (pro všechny role)
   - Admin/supervisor: vidí "Dnes ve firmě" — agregát přes všechny brokery

2. **Obsah "Můj den"**:
   - **Dnešní hovory** — seznam klientů k zavolání dnes (z CalEvent type=call, date=today)
     - Checkbox na odškrtnutí (marking as done)
     - Click-to-call: klik na telefon → `tel:` protokol (na mobilu vytočí)
     - Quick note po hovoru: po odškrtnutí popup "Jak to dopadlo?" + textarea
   - **Dnešní platby** — klienti s platbou dnes (z CalEvent type=payment)
   - **Připomínky** — dnešní reminders
   - **Follow-upy** — klienti kde je nextPaymentDate = dnes nebo včera/předevčírem (zpoždění)

3. **Progress bar**: "4 z 7 úkolů splněno" s vizuálním barem (gold gradient)

4. **RESPONZIVITA**:
   - Mobil: checklist formát, velké checkboxy (44px), swipe pro quick actions
   - Desktop: přehledná tabulka/karty

5. **Click-to-call**:
   - Na mobilu: `<a href="tel:+420777123456">` → otevře dialer
   - Na desktopu: kopírování čísla do clipboardu + tooltip "Zkopírováno"

### Kontext:
- Broker ráno otevře CRM a vidí co ho dnes čeká
- Bez tohle musí proklikávat kalendář a klienty zvlášť

### Očekávaný výsledek:
- Broker vidí přehled dne na jednom místě
- Odškrtávání úkolů funguje
- Click-to-call na mobilu vytáčí číslo
- `npm run build` projde

---

## TASK-019: Klient Scoring + Pipeline
Priorita: 3
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

1. **Klient scoring** — automatický rating klienta:
   - **A** (zlatá hvězda): vklad 1M+, aktivní 6+ měsíců, pravidelné platby
   - **B** (zelená): vklad 300k-1M, aktivní 3+ měsíců
   - **C** (modrá): vklad pod 300k nebo nový investor
   - **D** (šedá): prospect bez vkladu
   - Score se počítá automaticky z dat (ne manuálně)
   - Zobrazit jako badge vedle jména klienta (v tabulce, draweru, search)

2. **Pipeline stages** — rozšířit klient status:
   - Nový → Kontaktován → Jednání → Investor → VIP
   - Nové pole `stage` na Client modelu
   - Dropdown v ClientForm pro změnu stage
   - Barevné badge pro každý stage

3. **Pipeline view** (volitelný — nová stránka nebo tab na Klienti):
   - Kanban board — 5 sloupců (stages)
   - Klient karta v sloupci: avatar + jméno + vklad + score
   - Desktop: drag & drop mezi sloupci
   - Mobil: horizontální scroll sloupců, tap na kartu → drawer
   - Počet klientů per stage v headeru sloupce

4. **Pipeline na dashboardu**: malý funnel/bar chart — kolik klientů v každé fázi

### Kontext:
- Scoring pomáhá brokerům prioritizovat komu volat
- Pipeline dává supervisorovi přehled o stavu obchodu

### Očekávaný výsledek:
- Každý klient má automatický score (A/B/C/D)
- Pipeline view s drag & drop na desktopu
- Na mobilu horizontální scroll pipeline
- `npm run build` projde

---

## TASK-020: Dokumenty a smlouvy (admin + supervisor only)
Priorita: 3
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Systém pro nahrávání dokumentů ke klientům:

1. **RBAC — KRITICKÉ**:
   - Dokumenty vidí a spravuje POUZE administrator a supervisor
   - Broker NEMÁ přístup k dokumentům — nevidí záložku, nevidí soubory, nemůže nahrávat
   - V ClientDrawer: záložka "Dokumenty" se zobrazí JEN pro admin/supervisor

2. **Nový model** — `Document` v Prisma:
   ```
   id, clientId, name, fileName, fileUrl, fileSize, mimeType, uploadedBy (userId), createdAt
   ```

3. **Storage**: Cloudflare R2 nebo Vercel Blob Storage
   - Upload přes Server Action
   - Max velikost: 10MB per soubor
   - Povolené typy: PDF, DOC, DOCX, JPG, PNG
   - Generovat unikátní filename (UUID + extension)

4. **Záložka "Dokumenty" v ClientDrawer** (jen admin/supervisor):
   - Seznam nahraných dokumentů: ikona typu + název + velikost + datum + kdo nahrál
   - Upload button: drag & drop zóna nebo klik → file picker
   - Na mobilu: jen file picker (drag & drop nefunguje na mobilu)
   - Preview: PDF otevřít v novém tabu, obrázky zobrazit v modalu
   - Smazání: × button s confirmation
   - Download button

5. **Stránka Dokumenty** (volitelná, v nav — jen admin/supervisor):
   - Seznam všech dokumentů přes všechny klienty
   - Filtr: klient, typ souboru, datum
   - Search v názvech

### Kontext:
- Smlouvy, přílohy, dokumentace ke klientům
- DŮLEŽITÉ: Broker NESMÍ vidět dokumenty — je to citlivý obsah

### Očekávaný výsledek:
- Admin/supervisor může nahrát a spravovat dokumenty
- Broker nevidí nic o dokumentech (ani záložku v draweru)
- Upload/download/preview funguje
- Na mobilu file picker funguje
- `npm run build` projde

---

## TASK-021: Notifikace (zvoneček + badge)
Priorita: 3
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

In-app notifikační systém:

1. **Nový model** — `Notification` v Prisma:
   ```
   id, userId, type, title, message, read (boolean), link (optional), createdAt
   ```

2. **Kdy se generují notifikace**:
   - Platba zítra/dnes splatná (auto-generovat cronem nebo při načtení)
   - Hovor naplánovaný na dnes
   - Nový klient přiřazen brokerovi (admin přiřadil)
   - Připomínka z kalendáře

3. **Zvoneček v UI**:
   - V sidebaru (desktop) nebo v MobileHeader (mobil)
   - Červený badge s počtem nepřečtených
   - Klik → dropdown/panel s notifikacemi
   - Desktop: dropdown panel (max-width 360px)
   - Mobil: fullscreen panel (slide-in zprava)

4. **Notifikace panel**:
   - Seznam notifikací (ikona + text + čas + přečteno/nepřečteno)
   - Klik na notifikaci → navigovat na link (klient/kalendář) + mark as read
   - "Označit vše jako přečtené" button
   - Prázdný stav: "Žádné nové notifikace"

5. **RBAC**: každý vidí jen svoje notifikace

### Kontext:
- Broker nesmí zapomenout zavolat nebo že je splatná platba
- Jednoduchý systém — ne real-time WebSocket, stačí polling při načtení stránky

### Očekávaný výsledek:
- Zvoneček s badge v UI
- Notifikace se generují automaticky
- Na mobilu fullscreen panel
- `npm run build` projde

---

## TASK-022: Bulk operace
Priorita: 3
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Hromadné operace nad klienty (admin + supervisor):

1. **Multi-select v tabulce klientů**:
   - Checkbox na každém řádku/kartě
   - "Vybrat vše" checkbox v headeru
   - Sticky action bar dole (když je něco vybráno): "Vybráno X klientů" + akce

2. **Bulk akce**:
   - **Hromadný email**: vybrané klienty → otevřít EmailComposer s možností odeslat všem
   - **Přiřadit brokerovi**: vybrané klienty → dropdown brokerů → přiřadit
   - **Změnit stage**: vybrané → dropdown stages → změnit
   - **Export CSV**: vybrané klienty exportovat do CSV souboru
   - **Smazat**: vybrané → confirmation modal → smazat (jen admin)

3. **RESPONZIVITA**:
   - Desktop: checkboxy v tabulce, action bar dole
   - Mobil: long-press na kartě = select mode, action bar dole (fixed)

4. **RBAC**: bulk operace jen admin + supervisor, broker nevidí checkboxy

### Kontext:
- Pro onboarding: importuješ 50 klientů, potřebuješ je rozdělit mezi brokery
- Pro emailing: vyber 20 investorů → pošli měsíční report

### Očekávaný výsledek:
- Multi-select funguje na desktopu i mobilu
- Všechny bulk akce fungují
- CSV export stáhne soubor
- `npm run build` projde

---

## TASK-023: Audit Log (admin only)
Priorita: 3
Stav: čeká
Projekt: ~/buildfund-crm

### Kompletní zadání:

Stránka s logem všech akcí v systému (admin only):

1. **Rozšířit Activity model** nebo nový `AuditLog` model:
   ```
   id, userId, action, entity (client/user/template/event), entityId, details (JSON), ip, createdAt
   ```

2. **Co se loguje**:
   - CRUD na klientech, platbách, událostech, uživatelích, šablonách
   - Přihlášení/odhlášení
   - Změna role uživatele
   - Upload/smazání dokumentu

3. **Stránka Audit Log** (`src/app/(dashboard)/settings/audit/page.tsx`):
   - Přístup: admin only
   - Tabulka: Čas | Uživatel | Akce | Detail | Entity
   - Filtry: uživatel, typ akce, datum od-do, entity
   - Stránkování (20 per page)
   - RESPONZIVITA: na mobilu kompaktní card layout

4. **Link ze Settings**: Settings → Audit Log

### Kontext:
- GDPR: potřeba vědět kdo co kdy měnil
- Admin musí mít přehled o aktivitě v systému

### Očekávaný výsledek:
- Každá akce v systému se loguje
- Admin vidí kompletní audit trail
- Filtrovatelné a stránkované
- `npm run build` projde

---

<!-- Další úkoly přidávej pod tuto čáru ve stejném formátu -->
