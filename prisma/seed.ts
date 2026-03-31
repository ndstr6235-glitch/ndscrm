import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // -----------------------------------------------------------------------
  // Admin user
  // -----------------------------------------------------------------------
  const adminPassword = await bcrypt.hash("BuildFund2026!", 10);
  await prisma.user.upsert({
    where: { email: "admin@buildfund.cz" },
    update: {},
    create: {
      id: "u1",
      firstName: "Admin",
      lastName: "Build Fund",
      email: "admin@buildfund.cz",
      password: adminPassword,
      role: "ADMINISTRATOR",
      active: true,
      signature:
        "S pozdravem,\nBuild Fund | Administrace\nwww.buildfund.cz",
    },
  });
  console.log("  Admin user seeded.");

  // -----------------------------------------------------------------------
  // Petr user
  // -----------------------------------------------------------------------
  const petrPassword = await bcrypt.hash("Petr123456", 10);
  await prisma.user.upsert({
    where: { email: "petr@nodistar.cz" },
    update: {},
    create: {
      id: "u2",
      firstName: "Petr",
      lastName: "Nodistar",
      email: "petr@nodistar.cz",
      password: petrPassword,
      role: "ADMINISTRATOR",
      active: true,
      signature:
        "S pozdravem,\nPetr | Nodi Star\nwww.nodistar.cz",
    },
  });
  console.log("  Petr user seeded.");

  // -----------------------------------------------------------------------
  // Email Templates
  // -----------------------------------------------------------------------
  const templates = [
    {
      id: "t1",
      label: "Prezentace",
      subject: "Představení společnosti – Nodi Star",
      body: "Vážený/á [OSLOVENÍ],\n\nna základě našeho hovoru si Vám dovoluji zaslat prezentaci společnosti Nodi Star s.r.o.\n\nV příloze naleznete podrobné informace o naší společnosti a podmínkách spolupráce.\n\nV případě jakýchkoli dotazů mě neváhejte kontaktovat.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t2",
      label: "Návrh smlouvy",
      subject: "Návrh smlouvy o zápůjčce – Nodi Star",
      body: `Vážený/á [OSLOVENÍ],

na základě našeho hovoru si Vám dovoluji zaslat návrh smlouvy o zápůjčce k prostudování.

═══════════════════════════════════════
  SMLOUVA O ZÁPŮJČCE — NÁVRH
  dle § 2390 a násl. zákona č. 89/2012 Sb.
═══════════════════════════════════════

I. SMLUVNÍ STRANY

VĚŘITEL: (Vaše údaje budou doplněny)

DLUŽNÍK:
  Nodi Star s.r.o.
  IČO: 21300101
  Sídlo: Hradecká 2526/3, 130 00 Praha 3
  Jednající: Miroslav Fencl, jednatel
  Bankovní spojení: 4829670004/5500

II. PŘEDMĚT SMLOUVY

2.1 Předmětem smlouvy je poskytnutí peněžní zápůjčky ve výši [VKLAD].
2.2 Účelem zápůjčky je financování podnikatelské činnosti Dlužníka.
2.3 Zápůjčka bude vyplacena bezhotovostně na účet Dlužníka.

III. DOBA TRVÁNÍ

3.1 Smlouva se uzavírá na dobu určitou [DOBA].
3.2 Smluvní strany se mohou písemně dohodnout na prodloužení (prolongaci) smlouvy, a to nejpozději 30 dnů před uplynutím sjednané doby.

IV. ÚROK A VÝPLATA VÝNOSU

4.1 Zápůjčka je úročena pevnou sazbou ve výši [ÚROK] měsíčně z jistiny.
4.2 Úroky budou vypláceny [FREKVENCE], vždy k 15. dni příslušného období.
4.3 Předpokládaná výplata: [ČÁSTKA] ([FREKVENCE]).

V. PRODLENÍ A SANKCE

5.1 V případě prodlení Dlužníka delšího než 5 kalendářních dnů vzniká Věřiteli právo na smluvní úrok z prodlení ve výši 12 % ročně z dlužné částky.
5.2 Při prodlení delším než 30 dnů je Věřitel oprávněn zesplatnit celý závazek.

VI. PROHLÁŠENÍ DLUŽNÍKA

6.1 Dlužník prohlašuje, že není v úpadku, není proti němu vedeno insolvenční řízení ani exekuce a je schopen dostát svým závazkům.

VII. ZÁVĚREČNÁ USTANOVENÍ

7.1 Změny smlouvy lze provádět pouze písemnými dodatky.
7.2 Smlouva je vyhotovena ve dvou stejnopisech.
7.3 Smlouva nabývá účinnosti dnem podpisu oběma stranami.

═══════════════════════════════════════

Jedná se o nezávazný návrh. Konkrétní podmínky (výše zápůjčky, úroková sazba, doba trvání) budou upřesněny dle Vaší volby.

V případě jakýchkoli dotazů nebo připomínek se na mě neváhejte obrátit.

[PODPIS]`,
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t3",
      label: "Smlouva finální",
      subject: "Smlouva – Nodi Star",
      body: "Vážený/á [OSLOVENÍ],\n\nv příloze zasílám finální verzi smlouvy k podpisu.\n\nProsím o prostudování a zaslání podepsané verze zpět.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR",
    },
    {
      id: "t4",
      label: "Měsíční výpis",
      subject: "Měsíční výpis – Nodi Star",
      body: "Vážený/á [OSLOVENÍ],\n\nzasílám měsíční přehled k Vaší smlouvě.\n\nPřipsaná částka: [CASTKA]\nCelková výše: [VKLAD]\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t5",
      label: "Follow-up",
      subject: "Navazuji na náš hovor – Nodi Star",
      body: "Vážený/á [OSLOVENÍ],\n\nnavazuji na náš nedávný hovor. Rád/a bych domluvil/a schůzku.\n\nKdy by Vám vyhovovalo?\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { id: t.id },
      update: { label: t.label, subject: t.subject, body: t.body, allowedRoles: t.allowedRoles },
      create: t,
    });
  }
  console.log("  Email templates seeded.");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
