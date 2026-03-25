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
      subject: "Návrh smlouvy – Nodi Star",
      body: "Vážený/á [OSLOVENÍ],\n\nzasílám Vám návrh smlouvy k prostudování.\n\nV případě připomínek se na mě neváhejte obrátit.\n\n[PODPIS]",
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
