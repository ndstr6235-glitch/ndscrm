// Generates a contract proposal PDF using pdf-lib (pure JS, no browser needed).
// Works reliably on Vercel serverless — no Puppeteer/Chromium dependency.

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface ProposalPdfData {
  clientName?: string;
  clientEmail?: string;
  amount?: number;
  interestRate?: number;
  duration?: string;
  payoutFrequency?: string;
}

function fmtAmount(n?: number): string {
  if (!n) return "___________";
  return `${n.toLocaleString("cs-CZ")} Kc`;
}

function fmtRate(r?: number): string {
  if (r == null) return "___ %";
  return `${r} %`;
}

function fmtDuration(d?: string): string {
  if (!d) return "___________";
  const map: Record<string, string> = {
    "6": "sesti mesicu (6)",
    "12": "jednoho roku (12 mes.)",
    "24": "dvou let (24 mes.)",
    "36": "tri let (36 mes.)",
  };
  return map[d] || `${d} mesicu`;
}

function fmtFrequency(f?: string): string {
  if (!f || f === "monthly") return "mesicne";
  if (f === "quarterly") return "ctvrtletne";
  return f;
}

export async function generateProposalPdf(data: ProposalPdfData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;

  const navy = rgb(0.1, 0.15, 0.27);
  const gold = rgb(0.83, 0.66, 0.15);
  const grey = rgb(0.42, 0.42, 0.42);
  const black = rgb(0.1, 0.12, 0.18);
  const white = rgb(1, 1, 1);
  const lightGrey = rgb(0.94, 0.95, 0.97);

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  // ── HEADER BAR ──
  const headerH = 60;
  page.drawRectangle({ x: 0, y: pageHeight - headerH, width: pageWidth, height: headerH, color: navy });

  page.drawText("*", { x: margin, y: pageHeight - 38, size: 22, font: helveticaBold, color: gold });
  page.drawText("Nodi Star", { x: margin + 22, y: pageHeight - 36, size: 18, font: helveticaBold, color: white });

  const rightLines = ["Nodi Star s.r.o.", "ICO: 21300101 | DS: 3tduri7", "Hradecka 2526/3, 130 00 Praha 3"];
  rightLines.forEach((line, i) => {
    const w = helvetica.widthOfTextAtSize(line, 9);
    page.drawText(line, { x: pageWidth - margin - w, y: pageHeight - 25 - i * 12, size: 9, font: helvetica, color: rgb(0.7, 0.7, 0.75) });
  });

  // ── GOLD LINE ──
  page.drawRectangle({ x: 0, y: pageHeight - headerH - 3, width: pageWidth, height: 3, color: gold });
  y = pageHeight - headerH - 3 - 40;

  // ── TITLE ──
  const title = "Smlouva o zapujcce";
  const titleW = helveticaBold.widthOfTextAtSize(title, 24);
  page.drawText(title, { x: (pageWidth - titleW) / 2, y, size: 24, font: helveticaBold, color: navy });
  y -= 18;

  const subtitle = "uzavrena dle § 2390 a nasl. zakona c. 89/2012 Sb., obcansky zakonik";
  const subtitleW = helvetica.widthOfTextAtSize(subtitle, 10);
  page.drawText(subtitle, { x: (pageWidth - subtitleW) / 2, y, size: 10, font: helvetica, color: grey });
  y -= 35;

  // ── Helper functions ──
  function drawSectionHeader(num: string, title: string) {
    const label = `CLANEK ${num}`;
    page.drawText(label, { x: margin, y, size: 9, font: helveticaBold, color: gold });
    y -= 18;
    page.drawText(title, { x: margin, y, size: 16, font: helveticaBold, color: navy });
    y -= 22;
  }

  function drawNumberedItem(num: string, text: string) {
    page.drawText(num, { x: margin, y, size: 10, font: helveticaBold, color: gold });
    const lines = wrapText(text, contentWidth - 35, helvetica, 10);
    lines.forEach((line, i) => {
      page.drawText(line, { x: margin + 35, y: y - i * 14, size: 10, font: helvetica, color: black });
    });
    y -= lines.length * 14 + 6;
  }

  function wrapText(text: string, maxWidth: number, font: typeof helvetica, fontSize: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawPartyBox(label: string, fields: [string, string][], filled: boolean) {
    const boxH = 20 + fields.length * 20;
    page.drawRectangle({ x: margin, y: y - boxH + 10, width: contentWidth, height: boxH, color: lightGrey, borderWidth: 0 });
    page.drawText(label, { x: margin + 15, y: y, size: 10, font: helveticaBold, color: gold });
    y -= 20;
    for (const [key, val] of fields) {
      page.drawText(key, { x: margin + 15, y, size: 10, font: helvetica, color: grey });
      page.drawText(val, { x: margin + 170, y, size: 10, font: filled ? helveticaBold : helvetica, color: filled ? black : grey });
      y -= 18;
    }
    y -= 12;
  }

  function ensureSpace(needed: number) {
    if (y - needed < 60) {
      drawFooter();
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 40;
    }
  }

  function drawFooter() {
    const footerY = 30;
    page.drawLine({ start: { x: margin, y: footerY + 12 }, end: { x: pageWidth - margin, y: footerY + 12 }, thickness: 0.5, color: rgb(0.82, 0.82, 0.82) });
    page.drawText("Nodi Star s.r.o. | ICO: 21300101 | Hradecka 2526/3, 130 00 Praha 3", { x: margin, y: footerY, size: 8, font: helvetica, color: grey });
    const footRight = "Smlouva o zapujcce";
    const frW = helvetica.widthOfTextAtSize(footRight, 8);
    page.drawText(footRight, { x: pageWidth - margin - frW, y: footerY, size: 8, font: helvetica, color: grey });
  }

  // ── SECTION 1: SMLUVNÍ STRANY ──
  page.drawText("1. Smluvni strany", { x: margin, y, size: 15, font: helveticaBold, color: navy });
  y -= 5;
  page.drawRectangle({ x: margin, y, width: 140, height: 2.5, color: rgb(0.75, 0.22, 0.17) });
  y -= 22;

  drawPartyBox("VERITEL", [
    ["Jmeno a prijmeni:", data.clientName || "______________________________"],
    ["RC / datum narozeni:", "______________________________"],
    ["Bytem:", "______________________________"],
    ["Bankovni spojeni:", "______________________________"],
  ], !!data.clientName);

  drawPartyBox("DLUZNIK", [
    ["Spolecnost:", "Nodi Star s.r.o."],
    ["Sidlo:", "Hradecka 2526/3, Vinohrady, 130 00 Praha 3"],
    ["ICO:", "21300101"],
    ["Zastoupena:", "Miroslav Fencl, jednatel"],
  ], true);

  // ── ČLÁNEK II ──
  ensureSpace(100);
  drawSectionHeader("II", "Predmet smlouvy");
  drawNumberedItem("2.1", `Predmetem teto smlouvy je poskytnuti penezni zapujcky ve vysi ${fmtAmount(data.amount)}.`);
  drawNumberedItem("2.2", "Ucelem zapujcky je financovani podnikatelske cinnosti Dluznika.");
  drawNumberedItem("2.3", "Penezni zapujcku vyplati Veritel Dluznikovi bezhotovostne na cislo uctu: 4829670004/5500.");

  // ── ČLÁNEK III ──
  ensureSpace(80);
  drawSectionHeader("III", "Doba trvani smlouvy");
  drawNumberedItem("3.1", `Tato smlouva se uzavira na dobu urcitou ${fmtDuration(data.duration)} ode dne poskytnuti zapujcky.`);
  drawNumberedItem("3.2", "Smluvni strany se mohou pisemne dohodnout na prodlouzeni (prolongaci) smlouvy, a to nejpozdeji 30 dnu pred uplynutim sjednane doby.");

  // ── ČLÁNEK IV ──
  ensureSpace(120);
  drawSectionHeader("IV", "Urok a vyplata vynosu");
  drawNumberedItem("4.1", `Zapujcka je urocena pevnou sazbou ve vysi ${fmtRate(data.interestRate)} mesicne z jistiny.`);
  drawNumberedItem("4.2", `Urok je splatny ${fmtFrequency(data.payoutFrequency)}, vzdy k 15. dni prislusneho kalendarniho obdobi.`);
  drawNumberedItem("4.3", "Prvni urokova platba bude vyplacena k nejblizsimu 15. dni nasledujicimu po podpisu smlouvy.");
  drawNumberedItem("4.4", "Jistina je splatna nejpozdeji posledni den sjednane doby trvani smlouvy, pokud nebude sjednana jeji prolongace.");

  // ── ČLÁNEK V ──
  ensureSpace(80);
  drawSectionHeader("V", "Prodleni a sankce");
  drawNumberedItem("5.1", "V pripade prodleni Dluznika delsiho nez 5 kalendarnich dnu s uhradou uroku nebo vracenim jistiny vznika Veriteli pravo pozadovat smluvni urok z prodleni ve vysi 12 % rocne z dluzne castky.");
  drawNumberedItem("5.2", "V pripade prodleni delsiho nez 30 dnu je Veritel opravnen zesplatnit cely zavazek a pozadovat okamzite splaceni jistiny.");

  // ── ČLÁNEK VI ──
  ensureSpace(60);
  drawSectionHeader("VI", "Prohlaseni Dluznika");
  drawNumberedItem("6.1", "Dluznik prohlasuje, ze neni v upadku ani mu upadek nehrozi, neni proti nemu vedeno insolvencni rizeni, exekuce ani vykon rozhodnuti a je schopen dostat svym zavazkum.");

  // ── ČLÁNEK VII ──
  ensureSpace(100);
  drawSectionHeader("VII", "Zaverecna ustanoveni");
  drawNumberedItem("7.1", "Jakekoli zmeny teto smlouvy lze provadet pouze pisemnou formou cislovanych dodatku.");
  drawNumberedItem("7.2", "Pokud by nektere ustanoveni bylo neplatne, ostatni ustanoveni zustavaji nedotcena.");
  drawNumberedItem("7.3", "Smlouva je vyhotovena ve dvou stejnopisech, z nichz kazda strana obdrzi jedno vyhotoveni.");
  drawNumberedItem("7.4", "Smlouva nabyva ucinnosti dnem podpisu obema smluvnimi stranami.");

  // ── SIGNATURES ──
  ensureSpace(160);
  y -= 20;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.82, 0.82, 0.82) });
  y -= 30;

  // Column positions
  const leftCol = margin + 15;
  const rightCol = pageWidth / 2 + 15;
  const leftLineEnd = pageWidth / 2 - 35;
  const rightLineEnd = pageWidth - margin - 15;

  // Headers
  page.drawText("VERITEL", { x: leftCol, y, size: 11, font: helveticaBold, color: navy });
  page.drawText("DLUZNIK", { x: rightCol, y, size: 11, font: helveticaBold, color: navy });

  // Signature space
  y -= 70;

  // Signature lines
  page.drawLine({ start: { x: leftCol, y }, end: { x: leftLineEnd, y }, thickness: 0.7, color: navy });
  page.drawLine({ start: { x: rightCol, y }, end: { x: rightLineEnd, y }, thickness: 0.7, color: navy });

  // Left side — blank for client
  y -= 16;
  page.drawText("V Praze dne _____________", { x: leftCol, y, size: 10, font: helvetica, color: grey });

  // Right side — Miroslav Fencl
  page.drawText("Miroslav Fencl, jednatel", { x: rightCol, y: y + 2, size: 10, font: helveticaBold, color: black });
  y -= 14;
  page.drawText("V Praze dne _____________", { x: rightCol, y, size: 10, font: helvetica, color: grey });

  // ── FOOTER ──
  drawFooter();

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
