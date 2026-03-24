# Agent Team Workflow — Build Fund CRM

## Přehled systému

Tento systém zpracovává úkoly z fronty (`TASK-QUEUE.md`) pomocí agent teamu.
Každý úkol projde kompletním cyklem: plánování -> implementace -> zjednodušení -> debug -> QA -> reverzní kontrola.

---

## Role agentů

### LEAD (orchestrátor)
- Bere úkoly z `TASK-QUEUE.md` v pořadí priority
- Řídí celý cyklus zpracování
- Pokud se jakýkoli agent zasekne nebo selže, řeší to
- Po dokončení úkolu zapíše výsledek do `TASK-LOG.md`
- Přejde na další úkol ve frontě
- Pokud narazí na rate limit: zapiš do logu, počkej 5 minut, zkus znovu

### PLÁNOVAČ (teammate 1)
- Dostane zadání úkolu od leada
- Zapne plan mode — vytvoří detailní plán implementace
- Plán MUSÍ obsahovat:
  - Konkrétní soubory k úpravě/vytvoření
  - Pořadí kroků
  - Závislosti mezi kroky
  - Očekávaný výsledek
- Plán předá leadovi ke schválení
- Po schválení předá plán implementátorovi

### IMPLEMENTÁTOR (teammate 2)
- Dostane schválený plán od plánovače
- Provede všechny kroky podle plánu
- Po dokončení každého kroku zapíše stav
- Když narazí na problém, informuje leada

### KONTROLOR (teammate 3)
- Provádí 3 typy kontrol v tomto pořadí:

**1. Simplify kontrola:**
- Projde implementovaný kód
- Zjednoduší zbytečně složité části
- Odstraní duplicity
- Vyčistí nepotřebný kód

**2. Debug kontrola:**
- Spustí `npm run build` a `npm run lint`
- Hledá chyby, errory, warningy
- Ověří že stránka renderuje správně
- Zapíše nalezené bugy

**3. Reverzní kontrola (nejdůležitější):**
- Vezme PŮVODNÍ zadání úkolu (celé, bez zkrácení)
- Bod po bodu porovná se skutečným výsledkem
- Zapíše:
  - Co je hotové a odpovídá zadání
  - Co chybí nebo neodpovídá
  - Co je hotové ale potřebuje opravu

---

## Cyklus zpracování jednoho úkolu

```
1. LEAD: vezme úkol z TASK-QUEUE.md
   |
2. PLÁNOVAČ: vytvoří plán (plan mode)
   |
3. LEAD: schválí plán
   |
4. IMPLEMENTÁTOR: provede implementaci
   |
5. KONTROLOR: simplify -> debug -> reverzní kontrola
   |
   +-- Všechno OK? -> LEAD zapíše do TASK-LOG.md, další úkol
   |
   +-- Něco chybí/nefunguje?
       |
       +-- Zpět na krok 2 (PLÁNOVAČ dostane seznam problémů)
           Opakuj dokud není vše OK
```

---

## Pravidla pro zadání úkolů

### KRITICKÉ — zachování detailu zadání
- Zadání úkolu se NIKDY nesmí zkrátit, parafrázovat ani zjednodušit
- Každý agent MUSÍ pracovat s KOMPLETNÍM původním zadáním
- Pokud je zadání na 30 řádků, předá se celých 30 řádků
- Žádné "shrnutí" ani "hlavní body" — vždy celý originál
- Při reverzní kontrole se kontroluje proti ORIGINÁLNÍMU zadání

---

## Projektový kontext (předat všem teammates)

- Projekt: ~/buildfund-crm
- Stack: Next.js 15 + TypeScript + Tailwind CSS + Prisma
- Spec: docs/buildfund-crm-ai-handoff.md
- Mockup: docs/buildfund-crm-mockup.html
- CLAUDE.md obsahuje design system, datové modely, strukturu projektu

---

## Soubory systému

| Soubor | Účel |
|--------|------|
| `TASK-QUEUE.md` | Fronta úkolů — seřazené podle priority |
| `TASK-LOG.md` | Log dokončených úkolů s výsledky |
| `CLAUDE.md` | Projektový kontext |
| `docs/buildfund-crm-ai-handoff.md` | Kompletní specifikace |
| `docs/buildfund-crm-mockup.html` | Vizuální mockup |

---

## Spuštění

Lead spustí tým tímto promptem:

```
Jsi orchestrátor agent teamu. Přečti AGENT-TEAM-WORKFLOW.md a řiď se jím.

Vytvoř agent team se 3 teammates:
- "planovac": plánuje implementaci úkolů (plan mode)
- "implementator": provádí implementaci podle plánu
- "kontrolor": simplify + debug + reverzní kontrola

Vezmi první úkol ze stavu "čeká" v TASK-QUEUE.md a spusť cyklus zpracování.
Po dokončení pokračuj dalším úkolem ve frontě.
Pokud fronta dojde, oznam to a čekej.
```

---

## Chování při problémech

- **Agent se zasekl**: Lead pošle zprávu, timeout 5 min, pak restart tasku
- **Rate limit**: Zapiš do logu čas, počkej, automaticky pokračuj
- **Opakovaná chyba (3x stejný problém)**: Lead oznámí uživateli, přejde na další task
- **Kritická chyba (build padá)**: Stop, oznámit uživateli
