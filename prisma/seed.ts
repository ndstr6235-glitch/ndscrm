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
        "S pozdravem,\nPetr | Nodis Star\nwww.nodistar.cz",
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
      subject: "Představení společnosti – Nodis Star",
      body: "Vážený/á [OSLOVENÍ],\n\nna základě našeho hovoru si Vám dovoluji zaslat prezentaci společnosti Nodis Star s.r.o.\n\nV příloze naleznete podrobné informace o naší společnosti a podmínkách spolupráce.\n\nV případě jakýchkoli dotazů mě neváhejte kontaktovat.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t2",
      label: "Návrh smlouvy",
      subject: "Návrh smlouvy – Nodis Star",
      body: `Vážený/á [OSLOVENÍ],

zasílám Vám návrh smlouvy k prostudování.

Zároveň Vás prosím o zaslání následujících údajů potřebných pro vyhotovení finální smlouvy:

– Jméno a příjmení
– Datum narození
– Trvalé bydliště
– Číslo občanského průkazu
– Číslo bankovního účtu

V případě jakýchkoli dotazů mě neváhejte kontaktovat.

[PODPIS]`,
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t3",
      label: "Smlouva finální",
      subject: "Smlouva – Nodis Star",
      body: "Vážený/á [OSLOVENÍ],\n\nv příloze zasílám finální verzi smlouvy k podpisu.\n\nProsím o prostudování a zaslání podepsané verze zpět.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR",
    },
    {
      id: "t4",
      label: "Měsíční výpis",
      subject: "Měsíční výpis – Nodis Star",
      body: "Vážený/á [OSLOVENÍ],\n\nzasílám měsíční přehled k Vaší smlouvě.\n\nPřipsaná částka: [CASTKA]\nCelková výše: [VKLAD]\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t5",
      label: "Follow-up",
      subject: "Navazuji na náš hovor – Nodis Star",
      body: "Vážený/á [OSLOVENÍ],\n\nnavazuji na náš nedávný hovor. Rád/a bych domluvil/a schůzku.\n\nKdy by Vám vyhovovalo?\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t6",
      label: "Vyžádání údajů",
      subject: "Vyžádání údajů k podpisu smlouvy – Nodis Star",
      body: `Vážený/á [OSLOVENÍ],

děkujeme za Váš zájem o spolupráci s Nodis Star s.r.o. Abychom mohli připravit smlouvu o zápůjčce, potřebujeme od Vás následující údaje:

1. Celé jméno a příjmení
2. Rodné číslo nebo datum narození
3. Adresa trvalého bydliště
4. Bankovní spojení (číslo účtu a kód banky)
5. Výše vkladu (částka, kterou chcete investovat)

Údaje nám prosím zašlete odpovědí na tento email nebo je sdělte telefonicky.

Vaše osobní údaje budou použity výhradně pro účely smluvního vztahu a budou zpracovány v souladu s GDPR.

Děkujeme a těšíme se na spolupráci.

[PODPIS]`,
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
