// Generates a contract proposal PDF using pdf-lib + embedded Inter font.
// Inter supports full Czech diacritics. Works on Vercel serverless (no Puppeteer).

import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import * as fontkit from "@pdf-lib/fontkit";
import { INTER_REGULAR_B64, INTER_BOLD_B64, INTER_SEMIBOLD_B64 } from "./fonts-data";

export interface ProposalPdfData {
  clientName?: string;
  clientEmail?: string;
  amount?: number;
  interestRate?: number;
  duration?: string;
  payoutFrequency?: string;
}

function fmtAmount(n?: number): string {
  if (!n) return "_______________";
  return `${n.toLocaleString("cs-CZ")} Kč`;
}

function fmtRate(r?: number): string {
  if (r == null) return "___ %";
  return `${r} %`;
}

function fmtDuration(d?: string): string {
  if (!d) return "_______________";
  const map: Record<string, string> = {
    "6": "šesti měsíců (6)",
    "12": "jednoho roku (12 měs.)",
    "24": "dvou let (24 měs.)",
    "36": "tří let (36 měs.)",
  };
  return map[d] || `${d} měsíců`;
}

function fmtFrequency(f?: string): string {
  if (!f) return "_______________";
  if (f === "monthly") return "měsíčně";
  if (f === "quarterly") return "čtvrtletně";
  return f;
}

// Decode fonts from embedded base64 — works everywhere including Vercel serverless
const interRegularBytes = Buffer.from(INTER_REGULAR_B64, "base64");
const interBoldBytes = Buffer.from(INTER_BOLD_B64, "base64");
const interSemiBoldBytes = Buffer.from(INTER_SEMIBOLD_B64, "base64");

export async function generateProposalPdf(data: ProposalPdfData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontRegular = await doc.embedFont(interRegularBytes, { subset: true });
  const fontBold = await doc.embedFont(interBoldBytes, { subset: true });
  const fontSemi = await doc.embedFont(interSemiBoldBytes, { subset: true });

  // ── Layout constants ──
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 56;
  const contentWidth = pageWidth - 2 * margin;

  // ── Color palette (matches Nodis Star brand) ──
  const navy = rgb(0.102, 0.153, 0.267); // #1a2744
  const navyLight = rgb(0.18, 0.24, 0.36);
  const gold = rgb(0.831, 0.659, 0.149); // #d4a826
  const goldLight = rgb(0.961, 0.851, 0.376);
  const grey = rgb(0.42, 0.46, 0.52); // #6b7280
  const greyLight = rgb(0.82, 0.84, 0.87);
  const greyBg = rgb(0.969, 0.973, 0.98); // #f7f8fa
  const black = rgb(0.102, 0.122, 0.18); // #1a1f2e
  const white = rgb(1, 1, 1);

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  // ── HEADER BAR ──
  const headerH = 72;
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerH,
    width: pageWidth,
    height: headerH,
    color: navy,
  });

  // Star icon
  page.drawText("★", {
    x: margin,
    y: pageHeight - 44,
    size: 24,
    font: fontBold,
    color: gold,
  });
  // Brand
  page.drawText("Nodis Star", {
    x: margin + 30,
    y: pageHeight - 42,
    size: 19,
    font: fontBold,
    color: white,
  });

  // Right side company info
  const headerRight = [
    { text: "Nodis Star s.r.o.", size: 9.5, font: fontSemi, color: rgb(1, 1, 1) },
    { text: "IČO: 21300101  |  DS: 3tduri7", size: 8.5, font: fontRegular, color: rgb(0.78, 0.81, 0.86) },
    { text: "Hradecká 2526/3, 130 00 Praha 3", size: 8.5, font: fontRegular, color: rgb(0.78, 0.81, 0.86) },
  ];
  headerRight.forEach((line, i) => {
    const w = line.font.widthOfTextAtSize(line.text, line.size);
    page.drawText(line.text, {
      x: pageWidth - margin - w,
      y: pageHeight - 28 - i * 13,
      size: line.size,
      font: line.font,
      color: line.color,
    });
  });

  // Gold accent line under header
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerH - 3,
    width: pageWidth,
    height: 3,
    color: gold,
  });

  y = pageHeight - headerH - 3 - 75;

  // ── TITLE ──
  const title = "Smlouva o zápůjčce";
  const titleSize = 28;
  const titleW = fontBold.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (pageWidth - titleW) / 2,
    y,
    size: titleSize,
    font: fontBold,
    color: navy,
  });
  y -= 30;

  const subtitle = "uzavřená dle § 2390 a násl. zákona č. 89/2012 Sb., občanský zákoník";
  const subtitleSize = 10.5;
  const subtitleW = fontRegular.widthOfTextAtSize(subtitle, subtitleSize);
  page.drawText(subtitle, {
    x: (pageWidth - subtitleW) / 2,
    y,
    size: subtitleSize,
    font: fontRegular,
    color: grey,
  });
  y -= 58;

  // ── Helper: text wrapping ──
  function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
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

  // ── Helper: section heading ──
  function drawSectionHeader(num: string, titleText: string) {
    const eyebrow = `ČLÁNEK ${num}`;
    page.drawText(eyebrow, {
      x: margin,
      y,
      size: 9,
      font: fontBold,
      color: gold,
    });
    y -= 20;
    page.drawText(titleText, {
      x: margin,
      y,
      size: 17,
      font: fontBold,
      color: navy,
    });
    y -= 28;
  }

  // ── Helper: numbered clause ──
  function drawNumberedItem(num: string, text: string) {
    const lineHeight = 16;
    const fontSize = 10.5;
    page.drawText(num, {
      x: margin,
      y,
      size: fontSize,
      font: fontBold,
      color: gold,
    });
    const lines = wrapText(text, contentWidth - 42, fontRegular, fontSize);
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: margin + 42,
        y: y - i * lineHeight,
        size: fontSize,
        font: fontRegular,
        color: black,
      });
    });
    y -= lines.length * lineHeight + 12;
  }

  // ── Helper: party box ──
  function drawPartyBox(label: string, fields: [string, string][], filled: boolean) {
    const padTop = 20;
    const padBottom = 22;
    const padLeft = 24;
    const rowHeight = 22;
    const labelGap = 22;
    const boxH = padTop + labelGap + fields.length * rowHeight + padBottom - rowHeight;

    const boxTop = y + 10;
    const boxBottom = boxTop - boxH;

    // Background
    page.drawRectangle({
      x: margin,
      y: boxBottom,
      width: contentWidth,
      height: boxH,
      color: greyBg,
    });
    // Left gold accent bar
    page.drawRectangle({
      x: margin,
      y: boxBottom,
      width: 3,
      height: boxH,
      color: gold,
    });

    // Label
    let cursorY = boxTop - padTop;
    page.drawText(label, {
      x: margin + padLeft,
      y: cursorY,
      size: 10,
      font: fontBold,
      color: gold,
    });
    cursorY -= labelGap;

    // Fields
    for (const [key, val] of fields) {
      page.drawText(key, {
        x: margin + padLeft,
        y: cursorY,
        size: 10,
        font: fontRegular,
        color: grey,
      });
      page.drawText(val, {
        x: margin + 190,
        y: cursorY,
        size: 10,
        font: filled ? fontSemi : fontRegular,
        color: filled ? black : grey,
      });
      cursorY -= rowHeight;
    }
    y = boxBottom - 22;
  }

  // ── Helper: page break ──
  function ensureSpace(needed: number) {
    if (y - needed < 80) {
      drawFooter(page);
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 50;
    }
  }

  // ── Helper: footer ──
  function drawFooter(p: PDFPage) {
    const footerY = 32;
    p.drawLine({
      start: { x: margin, y: footerY + 14 },
      end: { x: pageWidth - margin, y: footerY + 14 },
      thickness: 0.5,
      color: greyLight,
    });
    p.drawText("Nodis Star s.r.o.  |  IČO: 21300101  |  Hradecká 2526/3, 130 00 Praha 3", {
      x: margin,
      y: footerY,
      size: 8,
      font: fontRegular,
      color: grey,
    });
    const footRight = "Smlouva o zápůjčce";
    const frW = fontRegular.widthOfTextAtSize(footRight, 8);
    p.drawText(footRight, {
      x: pageWidth - margin - frW,
      y: footerY,
      size: 8,
      font: fontRegular,
      color: grey,
    });
  }

  // ── SECTION 1: SMLUVNÍ STRANY ──
  page.drawText("ČLÁNEK I", {
    x: margin,
    y,
    size: 9,
    font: fontBold,
    color: gold,
  });
  y -= 20;
  page.drawText("Smluvní strany", {
    x: margin,
    y,
    size: 17,
    font: fontBold,
    color: navy,
  });
  y -= 32;

  drawPartyBox(
    "VĚŘITEL",
    [
      ["Jméno a příjmení:", data.clientName || "_______________________________"],
      ["RČ / datum narození:", "_______________________________"],
      ["Bytem:", "_______________________________"],
      ["Bankovní spojení:", "_______________________________"],
    ],
    !!data.clientName,
  );

  drawPartyBox(
    "DLUŽNÍK",
    [
      ["Společnost:", "Nodis Star s.r.o."],
      ["Sídlo:", "Hradecká 2526/3, Vinohrady, 130 00 Praha 3"],
      ["IČO:", "21300101"],
      ["Zastoupená:", "Miroslav Fencl, jednatel"],
    ],
    true,
  );

  // ── ČLÁNEK II ──
  ensureSpace(120);
  drawSectionHeader("II", "Předmět smlouvy");
  drawNumberedItem("2.1", `Předmětem této smlouvy je poskytnutí peněžní zápůjčky ve výši ${fmtAmount(data.amount)}.`);
  drawNumberedItem("2.2", "Účelem zápůjčky je financování podnikatelské činnosti Dlužníka.");
  drawNumberedItem("2.3", "Peněžní zápůjčku vyplatí Věřitel Dlužníkovi bezhotovostně na číslo účtu: 4829670004/5500.");

  // ── ČLÁNEK III ──
  ensureSpace(100);
  drawSectionHeader("III", "Doba trvání smlouvy");
  drawNumberedItem("3.1", `Tato smlouva se uzavírá na dobu určitou ${fmtDuration(data.duration)} ode dne poskytnutí zápůjčky.`);
  drawNumberedItem("3.2", "Smluvní strany se mohou písemně dohodnout na prodloužení (prolongaci) smlouvy, a to nejpozději 30 dnů před uplynutím sjednané doby.");

  // ── ČLÁNEK IV ──
  ensureSpace(140);
  drawSectionHeader("IV", "Úrok a výplata výnosu");
  drawNumberedItem("4.1", `Zápůjčka je úročena pevnou sazbou ve výši ${fmtRate(data.interestRate)} p.a. (ročně) z jistiny.`);
  drawNumberedItem("4.2", `Úrok je vyplácen ${fmtFrequency(data.payoutFrequency)}, vždy k 15. dni příslušného kalendářního období, v poměrné výši odpovídající délce výplatního období.`);
  drawNumberedItem("4.3", "První úroková platba bude vyplacena k nejbližšímu 15. dni následujícímu po podpisu smlouvy.");
  drawNumberedItem("4.4", "Jistina je splatná nejpozději poslední den sjednané doby trvání smlouvy, pokud nebude sjednána její prolongace.");

  // ── ČLÁNEK V ──
  ensureSpace(100);
  drawSectionHeader("V", "Prodlení a sankce");
  drawNumberedItem("5.1", "V případě prodlení Dlužníka delšího než 5 kalendářních dnů s úhradou úroku nebo vrácením jistiny vzniká Věřiteli právo požadovat smluvní úrok z prodlení ve výši 12 % ročně z dlužné částky.");
  drawNumberedItem("5.2", "V případě prodlení delšího než 30 dnů je Věřitel oprávněn zesplatnit celý závazek a požadovat okamžité splacení jistiny.");

  // ── ČLÁNEK VI ──
  ensureSpace(70);
  drawSectionHeader("VI", "Prohlášení Dlužníka");
  drawNumberedItem("6.1", "Dlužník prohlašuje, že není v úpadku ani mu úpadek nehrozí, není proti němu vedeno insolvenční řízení, exekuce ani výkon rozhodnutí a je schopen dostát svým závazkům.");

  // ── ČLÁNEK VII ──
  ensureSpace(120);
  drawSectionHeader("VII", "Závěrečná ustanovení");
  drawNumberedItem("7.1", "Jakékoli změny této smlouvy lze provádět pouze písemnou formou číslovaných dodatků.");
  drawNumberedItem("7.2", "Pokud by některé ustanovení bylo neplatné, ostatní ustanovení zůstávají nedotčena.");
  drawNumberedItem("7.3", "Smlouva je vyhotovena ve dvou stejnopisech, z nichž každá strana obdrží jedno vyhotovení.");
  drawNumberedItem("7.4", "Smlouva nabývá účinnosti dnem podpisu oběma smluvními stranami.");

  // ── SIGNATURES ──
  ensureSpace(180);
  y -= 24;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: greyLight,
  });
  y -= 32;

  // Column positions
  const leftCol = margin + 20;
  const rightCol = pageWidth / 2 + 20;
  const leftLineEnd = pageWidth / 2 - 30;
  const rightLineEnd = pageWidth - margin - 20;

  // Headers
  page.drawText("VĚŘITEL", {
    x: leftCol,
    y,
    size: 11,
    font: fontBold,
    color: gold,
  });
  page.drawText("DLUŽNÍK", {
    x: rightCol,
    y,
    size: 11,
    font: fontBold,
    color: gold,
  });

  // Signature space
  y -= 75;

  // Signature lines
  page.drawLine({
    start: { x: leftCol, y },
    end: { x: leftLineEnd, y },
    thickness: 0.7,
    color: navy,
  });
  page.drawLine({
    start: { x: rightCol, y },
    end: { x: rightLineEnd, y },
    thickness: 0.7,
    color: navy,
  });

  // Right side — Miroslav Fencl name
  page.drawText("Miroslav Fencl, jednatel", {
    x: rightCol,
    y: y - 14,
    size: 10,
    font: fontSemi,
    color: black,
  });

  // Date lines
  y -= 30;
  page.drawText("V Praze dne _______________", {
    x: leftCol,
    y,
    size: 9.5,
    font: fontRegular,
    color: grey,
  });
  page.drawText("V Praze dne _______________", {
    x: rightCol,
    y,
    size: 9.5,
    font: fontRegular,
    color: grey,
  });

  // ── FOOTER ──
  drawFooter(page);

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
