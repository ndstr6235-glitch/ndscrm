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
      subject: "Exkluzivní investiční příležitost – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\ndovolte, abych Vám představil/a investiční platformu Build Fund.\n\nNabízíme:\n• Roční výnos 8–14 % p.a.\n• Plná transparentnost a měsíční výpisy\n• Minimální vstup od 50 000 Kč\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t2",
      label: "Návrh smlouvy",
      subject: "Investiční smlouva – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\nzasílám Vám investiční smlouvu k prostudování a podpisu.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t3",
      label: "Smlouva finální",
      subject: "Finální investiční smlouva – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\nv příloze zasílám finální investiční smlouvu k podpisu.\n\nProsím o prostudování a zaslání podepsané verze zpět.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR",
    },
    {
      id: "t4",
      label: "Úrok – měsíční výpis",
      subject: "Měsíční výpis výnosu – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\nzasílám měsíční přehled výnosu z Vaší investice.\n\nPřipsaný výnos: [CASTKA]\nCelkový vložený kapitál: [VKLAD]\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t5",
      label: "Follow-up",
      subject: "Navazuji na náš hovor – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\nnavazuji na náš nedávný hovor. Rád/a bych domluvil/a schůzku.\n\nKdy by Vám vyhovovalo?\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { id: t.id },
      update: {},
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
