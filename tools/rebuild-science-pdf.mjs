import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleRoot = process.env.MIRACLE_PDF_MODULE_ROOT;
if (!moduleRoot) throw new Error("MIRACLE_PDF_MODULE_ROOT is required");

const pdfjs = await import(pathToFileURL(path.join(moduleRoot, "pdfjs-dist/legacy/build/pdf.mjs")));
const {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, Packer, PageBreak,
  PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun,
  VerticalAlign, WidthType,
} = await import(pathToFileURL(path.join(moduleRoot, "docx/dist/index.mjs")));

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const source = path.join(root, "science-back-feline-purring-neuropathic-pain-benefits.pdf");
const output = path.join(root, "science-back-feline-purring-neuropathic-pain-benefits-rebuilt.docx");

const data = new Uint8Array(fs.readFileSync(source));
const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

function linesFrom(items) {
  const rows = [];
  for (const item of items) {
    if (!item.str?.trim()) continue;
    const y = item.transform[5];
    let row = rows.find(r => Math.abs(r.y - y) < 1.8);
    if (!row) rows.push(row = { y, items: [] });
    row.items.push({ x: item.transform[4], text: item.str, size: Math.abs(item.transform[0]) });
  }
  return rows.sort((a, b) => b.y - a.y).map(row => ({
    y: row.y,
    parts: row.items.sort((a, b) => a.x - b.x),
    text: row.items.sort((a, b) => a.x - b.x).map(x => x.text).join(" ").replace(/\s+/g, " ").trim(),
    x: Math.min(...row.items.map(x => x.x)),
    size: Math.max(...row.items.map(x => x.size)),
  }));
}

const pages = [];
for (let n = 1; n <= pdf.numPages; n++) {
  const page = await pdf.getPage(n);
  pages.push(linesFrom((await page.getTextContent()).items));
}

const border = { style: BorderStyle.SINGLE, size: 5, color: "7A8A99" };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
const cell = (text, { bold = false, shade, span } = {}) => new TableCell({
  columnSpan: span,
  verticalAlign: VerticalAlign.CENTER,
  shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
  margins: { top: 90, bottom: 90, left: 110, right: 110 },
  children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, bold, size: 19 })] })],
});
const table = (rows, widths) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  columnWidths: widths,
  borders,
  rows: rows.map((r, i) => new TableRow({ tableHeader: i === 0, children: r.map(v => typeof v === "string" ? cell(v) : cell(v.text, v)) })),
});
const titleRow = (title, cols) => [{ text: title, bold: true, shade: "DCEAF2", span: cols }];

const inserts = {
  multi: table([
    titleRow("Multi-Cat Household Dynamics", 2),
    [{ text: "Rotational Companion Availability", bold: true, shade: "EDF4F7" }, { text: "Passive Enrichment Without Care Fatigue", bold: true, shade: "EDF4F7" }],
    ["Overcomes solitary-animal fatigue; guarantees continuous sensory support.", "Inter-cat play provides visual stimulation when the patient is bedbound."],
  ], [5000, 5000]),
  clinical: table([
    [{ text: "Functional Area", bold: true, shade: "DCEAF2" }, { text: "Feline-Assisted Therapeutic Benefit", bold: true, shade: "DCEAF2" }, { text: "Clinical Mechanism", bold: true, shade: "DCEAF2" }],
    ["Fine Motor Control", "Precision grooming, opening specialized treat pouches, using wand toys.", "Enhances manual dexterity and hand-eye coordination to counteract potential upper-limb ataxia or weakness associated with Chiari II."],
    ["Core Stability", "Sitting unsupported on a mat or specialized stool to fill gravity feeders or scoop low-dust litter bins.", "Stimulates the recruitment of trunk musculature and paraspinal stabilizers, vital for preserving posture and balance in wheelchair or braced users."],
    ["Tactile Desensitization", "Stroking varied fur textures (e.g., sleek coats, soft underfurs) and managing minor tactile perturbations.", "Counteracts localized neuropathic hypersensitivity (allodynia) by gently retraining the brain to process non-noxious sensory input normally."],
  ], [2600, 3400, 4000]),
  cascade: table([
    titleRow("The Neuro-Feline Therapeutic Cascade", 3),
    [{ text: "Vibrational Mechanoreception (20–140 Hz)", bold: true, shade: "EDF4F7" }, { text: "Thermal Regulation (101.5°F)", bold: true, shade: "EDF4F7" }, { text: "Autonomic Vagal Regulation", bold: true, shade: "EDF4F7" }],
    ["Inhibits C-fiber pain transmission", "Vasodilates ischemic tissue and reduces spasticity", "Stabilizes CSF/ICP fluctuations"],
  ], [3333, 3333, 3334]),
  matrix: table([
    titleRow("The Hydrodynamic and Neurological Matrix", 2),
    ["Unshunted Hydrocephalus", "Baseline ICP Elevation"],
    ["Arnold-Chiari II", "Cerebellar Tonsillar Compression"],
    ["Myelomeningocele", "Spinal Cord Tethering & Central Sensitization"],
    titleRow("Resulting Pain Profile", 2),
    [{ text: "Constant retro-orbital pressure headaches\nOccipital crushing pain via foramen magnum\nBilateral lancing/burning lower-limb neuropathy", span: 2 }],
  ], [4000, 6000]),
  housing: table([
    titleRow("Housing Instability / Loss of Cats", 2),
    [{ text: "Psycho-Physiological Collapse", bold: true, shade: "EDF4F7" }, { text: "Neuro-Hydrodynamic Disruption", bold: true, shade: "EDF4F7" }],
    ["• Hypercortisolemia\n• Severe insomnia\n• Loss of external routines\n• Deep social isolation", "• Unchecked sympathetic drive\n• Dangerous ICP / CSF spikes\n• Brainstem compression\n• Exacerbated neuropathic pain"],
  ], [5000, 5000]),
  bond: table([
    titleRow("The Irreplaceable Feline Bond", 1),
    ["• Micro-Calibrated Movements: Weight and pressure match the patient's unique spinal lesion geography.\n\n• Tailored Behavioral Symbiosis: Animals anticipate and react to subtle, silent pain cues and spasms.\n\n• Neurochemical Resonance: Years of shared history lower the neurological threshold for oxytocin release."],
  ], [10000]),
  grief: table([
    titleRow("Grief & Devastation", 2),
    [{ text: "Hyperactivated Sympathetic Drive", bold: true, shade: "EDF4F7" }, { text: "Mechanical Brainstem Compression", bold: true, shade: "EDF4F7" }],
    ["• Skyrocketing blood pressure\n• Excessive CSF production\n• Severe intra-ventricular pressure waves", "• Intense crying and sobbing\n• Valsalva CSF surge\n• Acute tonsillar herniation\n• Cranial nerve dysfunction"],
  ], [5000, 5000]),
};

const boxChar = /[┌┐└┘─│├┤┬┴┼▼►]/;
const headingExact = new Set([
  "Neurobiological Mechanisms of Feline Purring on Neuropathic Pain",
  "Neurological Dynamics: Unshunted Hydrocephalus & Chiari II Management",
  "The Power of the Multi-Cat Ecosystem (The Multi-Cat Advantage)",
  "Physical Rehabilitation and Ergonomic Adaptations",
  "Psychosocial and Executive Function Scaffolding",
  "Summary: A Prescription for Survival",
]);
const sectionStart = /^(Section \d+:|\d+\. )/;
const children = [];
let put = new Set();

function addTable(key) {
  if (!put.has(key)) {
    children.push(inserts[key], new Paragraph({ spacing: { after: 100 } }));
    put.add(key);
  }
}

for (let p = 0; p < pages.length; p++) {
  const rows = pages[p];
  for (let i = 0; i < rows.length; i++) {
    let text = rows[i].text;
    if (!text) continue;

    if (p === 1 && text.includes("Multi-Cat Household Dynamics")) addTable("multi");
    if ((p === 1 || p === 2) && (boxChar.test(text) || text === "Multi-Cat Household Dynamics" || text.includes("Rotational Companion") || text.includes("Passive Enrichment") || text.includes("Overcomes solitary") || text.includes("fatigue; guarantees") || text.includes("sensory support") || text.includes("Inter-cat play") || text.includes("visual stimulation") || text.includes("patient is bedbound"))) continue;

    if (p === 2 && text.startsWith("Functional Area")) { addTable("clinical"); continue; }
    if ((p === 2 || p === 3) && !put.has("clinical") && rows[i].x >= 70) continue;
    if (p === 2 && put.has("clinical") && (text.startsWith("Fine Motor") || text.startsWith("Core Stability") || text.startsWith("Tactile Desensitization") || rows[i].x >= 220)) continue;
    if (p === 3 && (text.startsWith("Functional Area") || text === "Benefit" || text === "normally.")) continue;

    if (p === 3 && boxChar.test(text)) { addTable("cascade"); continue; }
    if (p === 4 && boxChar.test(text)) { addTable("cascade"); continue; }
    if (p === 5 && boxChar.test(text)) { addTable("matrix"); continue; }
    if (p === 6 && boxChar.test(text)) { addTable("housing"); continue; }
    if (p === 8 && boxChar.test(text)) { addTable("bond"); continue; }
    if (p === 9 && boxChar.test(text)) { addTable("grief"); continue; }

    if (text === "Functional Area" || text === "Feline-Assisted Therapeutic Benefit" || text === "Clinical Mechanism") continue;
    if (boxChar.test(text)) continue;

    const bullet = text.startsWith("● ");
    if (bullet) text = text.slice(2).trim();
    const isHeading = headingExact.has(text) || sectionStart.test(text);
    const likelySubhead = /^[A-Z][^.!?]{2,75}:$/.test(text);
    children.push(new Paragraph({
      heading: isHeading ? (text.startsWith("Section ") ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2) : undefined,
      bullet: bullet ? { level: 0 } : undefined,
      keepNext: isHeading || likelySubhead,
      spacing: { after: isHeading ? 100 : 50, line: 250 },
      children: [new TextRun({ text, bold: likelySubhead, size: isHeading ? 24 : 20 })],
    }));
  }
  if (p < pages.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }));
}

const doc = new Document({
  creator: "Miracle Fund",
  title: "The Science Behind Feline Purring and Neuropathic Pain Benefits",
  description: "Reconstructed editable edition with native Word tables.",
  styles: {
    default: { document: { run: { font: "Aptos", size: 20 }, paragraph: { spacing: { after: 60, line: 250 } } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { bold: true, color: "173A52", size: 28 }, paragraph: { spacing: { before: 180, after: 100 }, keepNext: true } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { bold: true, color: "235B75", size: 24 }, paragraph: { spacing: { before: 140, after: 80 }, keepNext: true } },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Page "), new TextRun({ children: [PageNumber.CURRENT] })] })] }) },
    children,
  }],
});

fs.writeFileSync(output, await Packer.toBuffer(doc));
console.log(JSON.stringify({ sourcePages: pdf.numPages, output, nativeTables: put.size, tableKeys: [...put] }, null, 2));
