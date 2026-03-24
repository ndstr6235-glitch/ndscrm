@AGENTS.md

# Build Fund CRM v3

## Projekt
CRM systém pro investiční call-centrum/broker tým. Správa klientů, vkladů, výdělků operátorů, emaily, kalendář.

## Tech Stack
- **Next.js 15** + TypeScript + App Router
- **Tailwind CSS** (custom design system)
- **Prisma ORM** + Turso (SQLite)
- **NextAuth** pro autentizaci
- **Resend** pro emaily (v budoucnu, zatím mailto:)
- Deploy: **Vercel**

## Design System
- Fonty: `Fraunces` (serif, headings) + `Sora` (sans-serif, UI)
- Primární akcent: gold `#b8912a` → `#f5c842`
- Sidebar: dark `#0f1117`, 220px / 68px collapsed
- Karty: `border-radius: 16px`, stíny viz handoff
- Kompletní spec: viz `docs/buildfund-crm-ai-handoff.md`
- Vizuální mockup: viz `docs/buildfund-crm-mockup.html`

## Role (RBAC)
- **Administrator** — plný přístup, správa uživatelů, šablon, odesílání smluv
- **Supervisor** — vidí vše, nemůže spravovat uživatele/šablony, vidí dokumenty
- **Broker** — vidí jen vlastní klienty a události, NEVIDÍ dokumenty/smlouvy

### Email šablony — práva odesílání:
- **Prezentace** → broker, supervisor, admin (všichni)
- **Návrh smlouvy** → broker, supervisor, admin (všichni)
- **Smlouva (finální)** → POUZE admin — broker ji připraví, admin odešle
- **Úrok — měsíční výpis** → broker, supervisor, admin (všichni)
- **Follow-up** → broker, supervisor, admin (všichni)

### Workflow smlouvy:
1. Broker komunikuje s klientem (prezentace, follow-up)
2. Broker připraví podklady pro smlouvu (poznámky, vklad, podmínky)
3. Admin na základě podkladů od brokera odešle finální smlouvu klientovi
4. Broker NEMÁ přístup k finálním dokumentům/smlouvám

### Dokumenty:
- Vidí a spravuje POUZE admin + supervisor
- Broker NEVIDÍ záložku Dokumenty v draweru ani stránku Dokumenty

## Datové modely
- User (id, firstName, lastName, email, password, role, active, signature)
- Client (id, firstName, lastName, phone, email, callDate, nextPaymentDate, paymentFreq, note, assignedTo, payments[])
- Payment (amount, percent, profit, date, note)
- CalEvent (id, clientId, userId, type, title, date, time, note)
- EmailTemplate (id, label, subject, body, allowedRoles[] — kdo smí šablonu odeslat)

## Struktura projektu
```
src/
  app/                    # Next.js App Router pages
    (auth)/login/         # Login stránka
    (dashboard)/          # Layout s sidebarem
      dashboard/          # Dashboard page
      clients/            # Klienti
      calendar/           # Kalendář
      emails/             # Emaily
      users/              # Správa uživatelů (admin+supervisor)
      templates/          # Šablony emailů (admin)
      settings/           # Nastavení (admin)
  components/             # Sdílené komponenty
    ui/                   # Základní UI prvky (Button, Input, Modal, Badge...)
    layout/               # Sidebar, Header
    clients/              # ClientDrawer, ClientForm, PaymentForm
    calendar/             # MiniCalendar, EventCard, EventForm
    emails/               # EmailComposer, TemplateCard
  lib/                    # Utility, konstanty, typy
    types.ts              # TypeScript typy
    constants.ts          # Barvy, EVENT_TYPES, ROLE_META
    utils.ts              # Formátování (fmtCZK, fmtDate), helpery
    auth.ts               # Auth konfigurace
  prisma/
    schema.prisma         # Databázové schéma
```

## Konvence
- Čeština pro UI texty, angličtina pro kód (proměnné, komentáře)
- Tailwind utility classes, žádné inline styly
- Server Components kde to jde, Client Components jen kde je interaktivita
- Formátování: `cs-CZ` locale pro datum a měnu
