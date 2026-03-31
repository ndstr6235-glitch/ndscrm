// Generates the contract proposal HTML matching the Nodi Star PDF design.
// Used server-side to generate a PDF attachment for "Návrh smlouvy" emails.

export interface ProposalData {
  amount?: number;
  amountWords?: string;
  interestRate?: number;
  duration?: string;
  payoutFrequency?: string;
}

function fmtAmount(n?: number): string {
  if (!n) return '<span style="color:#999;font-style:italic;">částka v Kč</span>';
  return `<strong>${n.toLocaleString("cs-CZ")}&nbsp;Kč</strong>`;
}

function fmtAmountWords(s?: string): string {
  if (!s) return '<span style="color:#999;font-style:italic;">částka slovy</span>';
  return `<em>${s}</em>`;
}

function fmtRate(r?: number): string {
  if (r == null) return '<span style="color:#999;font-style:italic;">___</span> %';
  return `${r}&nbsp;%`;
}

function fmtDuration(d?: string): string {
  if (!d) return '<span style="color:#999;font-style:italic;">doba trvání</span>';
  const map: Record<string, string> = {
    "6": "šesti měsíců (6)",
    "12": "jednoho roku (12 měs.)",
    "24": "dvou let (24 měs.)",
    "36": "tří let (36 měs.)",
  };
  return map[d] || `${d} měsíců`;
}

function fmtFrequency(f?: string): string {
  if (!f || f === "monthly") return "měsíčně";
  if (f === "quarterly") return "čtvrtletně";
  return f;
}

export function generateProposalHTML(data: ProposalData): string {
  const amount = fmtAmount(data.amount);
  const amountWords = fmtAmountWords(data.amountWords);
  const rate = fmtRate(data.interestRate);
  const duration = fmtDuration(data.duration);
  const frequency = fmtFrequency(data.payoutFrequency);

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<title>Smlouva o zápůjčce – Nodi Star</title>
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #1a1f2e; line-height: 1.65; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print { .page { box-shadow: none !important; } }
</style>
</head>
<body style="background:#fff;">

<!-- PAGE 1 -->
<div class="page" style="width:210mm; min-height:297mm; margin:0 auto; background:#fff; position:relative; padding-bottom:50px;">

  <!-- HEADER -->
  <div style="background:#1a2744; padding:22px 44px; display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:28px; color:#d4a826;">&#9733;</span>
      <span style="font-size:20px; font-weight:700; color:#ffffff; letter-spacing:0.5px;">Nodi Star</span>
    </div>
    <div style="text-align:right; color:rgba(255,255,255,0.6); font-size:11px; line-height:1.7;">
      <div>Nodi Star s.r.o.</div>
      <div>IČO: 21300101 | DS: 3tduri7</div>
      <div>Hradecká 2526/3, 130 00 Praha 3</div>
    </div>
  </div>

  <!-- GOLD LINE -->
  <div style="height:3px; background:linear-gradient(90deg,#d4a826,#f0d060,#d4a826);"></div>

  <!-- BODY -->
  <div style="padding:44px 52px 0 52px;">

    <!-- TITLE -->
    <div style="text-align:center; margin-bottom:40px;">
      <h1 style="font-size:28px; font-weight:700; color:#1a2744; margin:0 0 8px 0;">Smlouva o zápůjčce</h1>
      <p style="font-size:13px; color:#6b7280;">uzavřená dle § 2390 a násl. zákona č. 89/2012 Sb., občanský zákoník</p>
    </div>

    <!-- SECTION 1: SMLUVNÍ STRANY -->
    <div style="margin-bottom:32px;">
      <div style="margin-bottom:20px; padding-bottom:8px; border-bottom:3px solid #c0392b; display:inline-block;">
        <h2 style="font-size:18px; font-weight:700; color:#1a2744;">1. Smluvní strany</h2>
      </div>

      <!-- VĚŘITEL -->
      <div style="background:#f7f8fa; border-radius:8px; padding:22px 28px; margin-bottom:14px;">
        <div style="font-size:13px; font-weight:700; color:#d4a826; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:14px;">Věřitel</div>
        <table style="width:100%; font-size:14px; color:#1a1f2e; border-collapse:collapse;">
          <tr>
            <td style="padding:5px 0; width:180px; color:#6b7280;">Jméno a příjmení:</td>
            <td style="padding:5px 0; border-bottom:1px solid #d1d5db;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:5px 0; color:#6b7280;">RČ / datum narození:</td>
            <td style="padding:5px 0; border-bottom:1px solid #d1d5db;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:5px 0; color:#6b7280;">Bytem:</td>
            <td style="padding:5px 0; border-bottom:1px solid #d1d5db;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:5px 0; color:#6b7280;">Bankovní spojení:</td>
            <td style="padding:5px 0; border-bottom:1px solid #d1d5db;">&nbsp;</td>
          </tr>
        </table>
      </div>

      <!-- DLUŽNÍK -->
      <div style="background:#f7f8fa; border-radius:8px; padding:22px 28px;">
        <div style="font-size:13px; font-weight:700; color:#d4a826; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:14px;">Dlužník</div>
        <table style="width:100%; font-size:14px; color:#1a1f2e; border-collapse:collapse;">
          <tr>
            <td style="padding:5px 0; width:180px; color:#6b7280;">Společnost:</td>
            <td style="padding:5px 0; font-weight:600;">Nodi Star s.r.o.</td>
          </tr>
          <tr>
            <td style="padding:5px 0; color:#6b7280;">Sídlo:</td>
            <td style="padding:5px 0; font-weight:600;">Hradecká 2526/3, Vinohrady, 130 00 Praha 3</td>
          </tr>
          <tr>
            <td style="padding:5px 0; color:#6b7280;">IČO:</td>
            <td style="padding:5px 0; font-weight:600;">21300101</td>
          </tr>
          <tr>
            <td style="padding:5px 0; color:#6b7280;">Zastoupená:</td>
            <td style="padding:5px 0; font-weight:600;">Miroslav Fencl, jednatel</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- ČLÁNEK II -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px; font-weight:700; color:#d4a826; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px;">Článek II</div>
      <h3 style="font-size:20px; font-weight:700; color:#1a2744; margin-bottom:16px;">Předmět smlouvy</h3>
      <table style="width:100%; font-size:14px; border-collapse:collapse;">
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">2.1</td>
          <td style="padding:4px 0; line-height:1.7;">Předmětem této smlouvy je poskytnutí peněžní zápůjčky ve výši ${amount} (slovy: ${amountWords} korun českých).</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">2.2</td>
          <td style="padding:4px 0; line-height:1.7;">Účelem zápůjčky je financování podnikatelské činnosti Dlužníka.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">2.3</td>
          <td style="padding:4px 0; line-height:1.7;">Peněžní zápůjčku vyplatí Věřitel Dlužníkovi bezhotovostně na číslo účtu: <strong>4829670004/5500</strong>.</td>
        </tr>
      </table>
    </div>

    <!-- ČLÁNEK III -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px; font-weight:700; color:#d4a826; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px;">Článek III</div>
      <h3 style="font-size:20px; font-weight:700; color:#1a2744; margin-bottom:16px;">Doba trvání smlouvy</h3>
      <table style="width:100%; font-size:14px; border-collapse:collapse;">
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">3.1</td>
          <td style="padding:4px 0; line-height:1.7;">Tato smlouva se uzavírá na dobu určitou ${duration} ode dne poskytnutí zápůjčky.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">3.2</td>
          <td style="padding:4px 0; line-height:1.7;">Smluvní strany se mohou písemně dohodnout na prodloužení (prolongaci) smlouvy, a to nejpozději 30 dnů před uplynutím sjednané doby.</td>
        </tr>
      </table>
    </div>

    <!-- ČLÁNEK IV -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px; font-weight:700; color:#d4a826; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px;">Článek IV</div>
      <h3 style="font-size:20px; font-weight:700; color:#1a2744; margin-bottom:16px;">Úrok a výplata výnosu</h3>
      <table style="width:100%; font-size:14px; border-collapse:collapse;">
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">4.1</td>
          <td style="padding:4px 0; line-height:1.7;">Zápůjčka je úročena pevnou sazbou ve výši <strong>${rate} měsíčně</strong> z jistiny.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">4.2</td>
          <td style="padding:4px 0; line-height:1.7;">Úrok je splatný <strong>${frequency}</strong>, vždy k 15. dni příslušného kalendářního období.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">4.3</td>
          <td style="padding:4px 0; line-height:1.7;">První úroková platba bude vyplacena k nejbližšímu 15. dni následujícímu po podpisu smlouvy.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">4.4</td>
          <td style="padding:4px 0; line-height:1.7;">Jistina je splatná nejpozději poslední den sjednané doby trvání smlouvy, pokud nebude sjednána její prolongace.</td>
        </tr>
      </table>
    </div>

    <!-- ČLÁNEK V -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px; font-weight:700; color:#d4a826; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px;">Článek V</div>
      <h3 style="font-size:20px; font-weight:700; color:#1a2744; margin-bottom:16px;">Prodlení a sankce</h3>
      <table style="width:100%; font-size:14px; border-collapse:collapse;">
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">5.1</td>
          <td style="padding:4px 0; line-height:1.7;">V případě prodlení Dlužníka delšího než 5 kalendářních dnů s úhradou úroku nebo vrácením jistiny vzniká Věřiteli právo požadovat smluvní úrok z prodlení ve výši 12 % ročně z dlužné částky.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">5.2</td>
          <td style="padding:4px 0; line-height:1.7;">V případě prodlení delšího než 30 dnů je Věřitel oprávněn zesplatnit celý závazek a požadovat okamžité splacení jistiny.</td>
        </tr>
      </table>
    </div>

    <!-- ČLÁNEK VI -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px; font-weight:700; color:#d4a826; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px;">Článek VI</div>
      <h3 style="font-size:20px; font-weight:700; color:#1a2744; margin-bottom:16px;">Prohlášení Dlužníka</h3>
      <table style="width:100%; font-size:14px; border-collapse:collapse;">
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">6.1</td>
          <td style="padding:4px 0; line-height:1.7;">Dlužník prohlašuje, že není v úpadku ani mu úpadek nehrozí, není proti němu vedeno insolvenční řízení, exekuce ani výkon rozhodnutí a je schopen dostát svým závazkům.</td>
        </tr>
      </table>
    </div>

    <!-- ČLÁNEK VII -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px; font-weight:700; color:#d4a826; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px;">Článek VII</div>
      <h3 style="font-size:20px; font-weight:700; color:#1a2744; margin-bottom:16px;">Závěrečná ustanovení</h3>
      <table style="width:100%; font-size:14px; border-collapse:collapse;">
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">7.1</td>
          <td style="padding:4px 0; line-height:1.7;">Jakékoli změny této smlouvy lze provádět pouze písemnou formou číslovaných dodatků.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">7.2</td>
          <td style="padding:4px 0; line-height:1.7;">Pokud by některé ustanovení bylo neplatné, ostatní ustanovení zůstávají nedotčena.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">7.3</td>
          <td style="padding:4px 0; line-height:1.7;">Smlouva je vyhotovena ve dvou stejnopisech, z nichž každá strana obdrží jedno vyhotovení.</td>
        </tr>
        <tr>
          <td style="width:40px; vertical-align:top; padding:4px 12px 4px 0; font-weight:700; color:#d4a826;">7.4</td>
          <td style="padding:4px 0; line-height:1.7;">Smlouva nabývá účinnosti dnem podpisu oběma smluvními stranami.</td>
        </tr>
      </table>
    </div>

    <!-- SIGNATURES -->
    <div style="border-top:2px solid #d1d5db; margin-top:40px; padding-top:24px;">
      <table style="width:100%; font-size:14px;">
        <tr>
          <td style="width:50%; vertical-align:top; padding-right:30px;">
            <div style="font-weight:700; color:#1a2744; margin-bottom:60px;">VĚŘITEL</div>
            <div style="border-bottom:1px solid #1a2744; margin-bottom:10px;">&nbsp;</div>
            <div style="color:#6b7280; font-size:13px;">V Praze dne _____________</div>
          </td>
          <td style="width:50%; vertical-align:top; padding-left:30px;">
            <div style="font-weight:700; color:#1a2744; margin-bottom:60px;">DLUŽNÍK</div>
            <div style="border-bottom:1px solid #1a2744; margin-bottom:10px;">&nbsp;</div>
            <div style="font-weight:700;">Miroslav Fencl, jednatel</div>
            <div style="color:#6b7280; font-size:13px;">V Praze dne _____________</div>
          </td>
        </tr>
      </table>
    </div>

  </div>

  <!-- FOOTER -->
  <div style="position:absolute; bottom:0; left:0; right:0; border-top:1px solid #d1d5db; padding:14px 52px; display:flex; justify-content:space-between; font-size:11px; color:#9ca3af;">
    <span>Nodi Star s.r.o. | IČO: 21300101 | Hradecká 2526/3, 130 00 Praha 3</span>
    <span>Smlouva o zápůjčce</span>
  </div>

</div>

</body>
</html>`;
}
