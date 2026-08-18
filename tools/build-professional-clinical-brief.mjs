import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleRoot = process.env.MIRACLE_PDF_MODULE_ROOT;
if (!moduleRoot) throw new Error("MIRACLE_PDF_MODULE_ROOT is required");

const { default: JSZip } = await import(pathToFileURL(path.join(moduleRoot, "jszip", "lib", "index.js")));

const {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, Footer, Header, HeadingLevel, ImageRun,
  PageBreak, PageNumber, Packer, Paragraph, SectionType, ShadingType, Table, TableCell,
  TableOfContents, TableRow, TextRun, VerticalAlign, WidthType,
} = await import(pathToFileURL(path.join(moduleRoot, "docx/dist/index.mjs")));

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const source = path.join(root, "science-back-feline-purring-neuropathic-pain-benefits-original-unformatted.docx");
const output = path.join(root, "science-back-feline-purring-neuropathic-pain-benefits-professional.docx");
const logoPath = path.join(root, "assets", "withthecatsorg-logo.png");

const NAVY = "17243A";
const BURGUNDY = "8E2938";
const GOLD = "C6A052";
const IVORY = "FFF8EF";
const PALE = "F3EADF";
const LIGHT = "EDF1F4";
const MID = "607080";
const WHITE = "FFFFFF";

function decodeXml(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

const zip = await JSZip.loadAsync(fs.readFileSync(source));
const documentXml = await zip.file("word/document.xml").async("string");
const pBlocks = documentXml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g) || [];
const paragraphs = [];
for (let i = 0; i < pBlocks.length; i++) {
  const runs = [...pBlocks[i].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => decodeXml(m[1]));
  const text = runs.join("").replace(/\s+/g, " ").trim();
  if (text === "SOURCES:") break;
  paragraphs.push({ n: i + 1, text });
}

const citationMap = new Map([
  [7, [1]], [10, [2, 27]], [22, [3]], [26, [4]], [39, [5]], [45, [6]],
  [70, [7]], [82, [8, 24]], [100, [9]], [105, [10]], [132, [11, 27]],
  [179, [11, 27]], [181, [12]], [188, [13]], [218, [14, 15]], [296, [16]],
  [300, [17]], [305, [18]], [325, [19]], [337, [20]], [347, [9]], [349, [9]],
  [360, [21]], [363, [22]], [383, [23]],
]);

const bulletRanges = [
  [12,21],[28,37],[47,52],[55,59],[64,69],[76,81],[90,99],[107,112],[117,122],
  [125,130],[138,143],[145,153],[156,161],[167,173],[190,196],[203,208],[210,214],
  [228,235],[249,254],[263,270],[275,283],[289,294],[307,312],[315,319],[327,334],
  [342,346],[351,359],[366,369],[372,379],[390,394],[398,405],[409,413],[417,423],
  [427,435],[440,447],[455,466],[469,472],
];
const isBullet = n => bulletRanges.some(([a,b]) => n >= a && n <= b);

const h2 = new Set([1,9,222,260,304,322,387,452]);
const h3 = new Set([
  25,44,62,73,87,103,115,136,164,178,186,200,217,
  226,237,240,243,246,256,261,272,286,297,
  324,335,339,348,361,370,381,
  388,396,407,415,425,437,473,
]);
const callouts = new Set([4,41,42,60,182,219,224,257,258,285,287,299,301,302,313,320,382,406,448,449,453,468]);

const refs = [
  "Scoresby KJ, Strand EB, Ng Z, et al. Pet Ownership and Quality of Life: A Systematic Review of the Literature. Veterinary Sciences. 2021;8(12):332. doi:10.3390/vetsci8120332. PMID: 34941859; PMCID: PMC8705563.",
  "Alriksson-Schmidt AI, et al. Pain and health status in adults with myelomeningocele living in Sweden. Journal of Rehabilitation Medicine. 2018. PMCID: PMC6311378.",
  "Gatchel RJ, Peng YB, Peters ML, Fuchs PN, Turk DC. The biopsychosocial approach to chronic pain: scientific advances and future directions. Psychological Bulletin. 2007;133(4):581–624. doi:10.1037/0033-2909.133.4.581. PMID: 17592957.",
  "Eccleston C, Crombez G. Pain demands attention: a cognitive-affective model of the interruptive function of pain. Psychological Bulletin. 1999. PMID: 10349356.",
  "Bascour-Sandoval C, et al. Pain and Distraction According to Sensory Modalities: Current Findings and Future Directions. Pain Practice. 2019;19(7):686–702. doi:10.1111/papr.12799. PMID: 31104345.",
  "Fusaro M, Bufacchi RJ, Nicolardi V, Provenzano L. The analgesic power of pleasant touch in individuals with chronic pain: Recent findings and new insights. Frontiers in Integrative Neuroscience. 2022;16:956510. doi:10.3389/fnint.2022.956510. PMID: 36176327; PMCID: PMC9513358.",
  "Che X, Cash R, Ng SK, Fitzgerald P, Fitzgibbon BM. A Systematic Review of the Processes Underlying the Main and the Buffering Effect of Social Support on the Experience of Pain. Clinical Journal of Pain. 2018;34(11):1061–1076. doi:10.1097/AJP.0000000000000624. PMID: 29697476.",
  "Brown EL, et al. The role of pets in supporting cognitive-behavioral chronic pain self-management: Perspectives of older adults. Journal of Applied Gerontology. 2020. PMID: 31215816; PMCID: PMC6920602.",
  "Centers for Disease Control and Prevention. Cats: Healthy Pets, Healthy People. Updated April 15, 2024. https://www.cdc.gov/healthy-pets/about/cats.html",
  "Kretzler B, König HH, Hajek A. Pet ownership, loneliness, and social isolation: a systematic review. Social Psychiatry and Psychiatric Epidemiology. 2022;57:1935–1957. doi:10.1007/s00127-022-02332-9. PMID: 35816194; PMCID: PMC9272860.",
  "Spina Bifida Association. Mental Health Guidelines. https://www.spinabifidaassociation.org/blog/mental-health/",
  "Pet ownership and risk of depression: a systematic review and meta-analysis. 2025. PMID: 41194144; PMCID: PMC12590595.",
  "Nagasawa T, et al. Effects of Interactions with Cats in Domestic Environment on the Psychological and Physiological State of Their Owners. Animals. 2023. PMID: 37443915; PMCID: PMC10340037.",
  "Qureshi AI, et al. Cat ownership and the risk of fatal cardiovascular diseases: results from the Second National Health and Nutrition Examination Study mortality follow-up study. Journal of Vascular and Interventional Neurology. 2009. PMID: 22518240; PMCID: PMC3317329.",
  "Yeh TL, et al. A modest protective association between pet ownership and cardiovascular diseases: a systematic review and meta-analysis. PLOS ONE. 2019;14(5):e0216231. PMCID: PMC6499429.",
  "National Institute of Neurological Disorders and Stroke. Hydrocephalus. https://www.ninds.nih.gov/health-information/disorders/hydrocephalus",
  "National Institute of Neurological Disorders and Stroke. Chiari Malformation. https://www.ninds.nih.gov/health-information/disorders/chiari-malformation",
  "Herbst CT, et al. Domestic cat larynges can produce purring frequencies without neural input. Current Biology. 2023. PMID: 37794583.",
  "Stevens JA, Teh SL, Haileyesus T. Dogs and cats as environmental fall hazards. Journal of Safety Research. 2010;41(1):69–73. PMID: 20226954.",
  "Centers for Disease Control and Prevention. Bartonella and cat-scratch disease guidance. https://www.cdc.gov/bartonella/",
  "Centers for Disease Control and Prevention. About Giardia and Pets. https://www.cdc.gov/giardia/about/about-giardia-and-pets.html",
  "Co-sleeping with pets, stress, and sleep in a nationally representative sample of United States adults. PMCID: PMC10918166.",
  "Ellis SLH, Rodan I, Carney HC, et al. AAFP and ISFM feline environmental needs guidelines. Journal of Feline Medicine and Surgery. 2013;15(3):219–230. doi:10.1177/1098612X13477537. PMID: 23422366; PMCID: PMC11383066.",
  "Stensland ML, McGeary DD. Use of animal-assisted interventions in relieving pain in healthcare settings: A systematic review. Complementary Therapies in Clinical Practice. 2022;46:101519. doi:10.1016/j.ctcp.2021.101519. PMID: 34894530.",
  "Wagner C, Grob C, Hediger K. Specific and Non-specific Factors of Animal-Assisted Interventions Considered in Research: A Systematic Review. Frontiers in Psychology. 2022;13:931347. PMID: 35837630; PMCID: PMC9274084.",
  "Bert F, Gualano MR, Camussi E, et al. Animal assisted intervention: A systematic review of benefits and risks. European Journal of Integrative Medicine. 2016;8(5):695–706. PMID: 32362955; PMCID: PMC7185850.",
  "Spina Bifida Association. Guidelines for the Care of People with Spina Bifida. https://www.spinabifidaassociation.org/resource/guidelines/",
];
const refUrls = [
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC8705563/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC6311378/",
  "https://pubmed.ncbi.nlm.nih.gov/17592957/",
  "https://pubmed.ncbi.nlm.nih.gov/10349356/",
  "https://pubmed.ncbi.nlm.nih.gov/31104345/",
  "https://pubmed.ncbi.nlm.nih.gov/36176327/",
  "https://pubmed.ncbi.nlm.nih.gov/29697476/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC6920602/",
  "https://www.cdc.gov/healthy-pets/about/cats.html",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC9272860/",
  "https://www.spinabifidaassociation.org/blog/mental-health/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC12590595/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC10340037/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC3317329/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC6499429/",
  "https://www.ninds.nih.gov/health-information/disorders/hydrocephalus",
  "https://www.ninds.nih.gov/health-information/disorders/chiari-malformation",
  "https://pubmed.ncbi.nlm.nih.gov/37794583/",
  "https://pubmed.ncbi.nlm.nih.gov/20226954/",
  "https://www.cdc.gov/bartonella/",
  "https://www.cdc.gov/giardia/about/about-giardia-and-pets.html",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC10918166/",
  "https://pubmed.ncbi.nlm.nih.gov/23422366/",
  "https://pubmed.ncbi.nlm.nih.gov/34894530/",
  "https://pubmed.ncbi.nlm.nih.gov/35837630/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC7185850/",
  "https://www.spinabifidaassociation.org/resource/guidelines/",
];

const border = { style: BorderStyle.SINGLE, size: 5, color: "B8C1C8" };
const allBorders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
const para = (text, options = {}) => new Paragraph({
  spacing: { after: options.after ?? 110, line: options.line ?? 285 },
  alignment: options.alignment,
  keepNext: options.keepNext,
  keepLines: true,
  bullet: options.bullet ? { level: 0 } : undefined,
  children: [new TextRun({ text, bold: options.bold, italics: options.italics, color: options.color, size: options.size ?? 21 })],
});
const tableCell = (text, options = {}) => new TableCell({
  columnSpan: options.span,
  verticalAlign: VerticalAlign.CENTER,
  shading: options.fill ? { fill: options.fill, type: ShadingType.CLEAR } : undefined,
  margins: { top: 120, bottom: 120, left: 140, right: 140 },
  children: [new Paragraph({ spacing: { after: 0, line: 260 }, children: [new TextRun({ text, bold: options.bold, color: options.color, size: 19 })] })],
});
const nativeTable = (rows, widths) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: widths, borders: allBorders,
  rows: rows.map((r, i) => new TableRow({ tableHeader: i === 0, children: r.map(c => typeof c === "string" ? tableCell(c) : tableCell(c.text, c)) })),
});

function cleanText(text) {
  return text.replace(/\s*\((?:PubMed|PubMed Central \(PMC\)|CDC|Spina Bifida Association|NIH Neurological Institute)\)\s*$/, "");
}

function citedParagraph(item, options = {}) {
  const text = cleanText(item.text);
  const runs = [new TextRun({ text, size: options.size ?? 21, bold: options.bold, italics: options.italics, color: options.color })];
  const citations = citationMap.get(item.n);
  if (citations) runs.push(new TextRun({ text: ` [${citations.join(", ")}]`, superscript: true, color: BURGUNDY, size: 17 }));
  return new Paragraph({
    spacing: { after: options.after ?? 110, line: options.line ?? 285 },
    keepLines: true,
    keepNext: options.keepNext,
    bullet: options.bullet ? { level: 0 } : undefined,
    children: runs,
  });
}

function sectionBanner(kicker, title, summary, newPage = false) {
  return [
    new Paragraph({ pageBreakBefore: newPage, spacing: { before: 120, after: 35 }, children: [new TextRun({ text: kicker.toUpperCase(), bold: true, color: BURGUNDY, size: 17, characterSpacing: 70 })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(title)] }),
    para(summary, { color: MID, size: 22, after: 220 }),
  ];
}

const cover = [];
const content = [];

// Cover
if (fs.existsSync(logoPath)) {
  cover.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 }, children: [new ImageRun({ data: fs.readFileSync(logoPath), transformation: { width: 190, height: 76 }, type: "png" })] }));
}
cover.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "CLINICAL EVIDENCE BRIEF", bold: true, color: BURGUNDY, size: 20, characterSpacing: 110 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 230 }, children: [new TextRun({ text: "Companion Cats, Chronic Neuropathic Pain, and Complex Neurological Disability", bold: true, color: NAVY, size: 43 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 520 }, children: [new TextRun({ text: "A medically cautious review focused on myelomeningocele, Chiari II malformation, unshunted hydrocephalus, and the supportive role of a harmonious multi-cat household", color: MID, size: 24 })] }),
  nativeTable([
    [{ text: "Prepared for", bold: true, fill: NAVY, color: WHITE }, { text: "Evidence standard", bold: true, fill: NAVY, color: WHITE }],
    ["The Miracle Fund · With the Cats", "Peer-reviewed research and authoritative clinical guidance"],
    ["August 2026", "Supportive-care analysis; not diagnosis or treatment advice"],
  ], [5000,5000]),
  new Paragraph({ spacing: { before: 720, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prepared with respect for both human health and feline welfare", italics: true, color: BURGUNDY, size: 20 })] }),
);

// Document notice and executive summary
content.push(...sectionBanner("Purpose and limits", "Executive summary", "What the evidence supports, what remains inference, and what it does not establish."));
content.push(
  para("For a person living with myelomeningocele, Chiari II malformation, unshunted hydrocephalus, and severe neuropathic pain, a harmonious multi-cat household may provide meaningful supportive benefits through companionship, pain coping, emotional regulation, daily structure, social connection, and quality of life. The strongest conclusions concern bonded companion animals generally; cat-specific and multi-cat evidence remains limited.", { size: 23 }),
  nativeTable([
    [{ text: "Evidence supports", bold: true, fill: NAVY, color: WHITE }, { text: "Evidence does not establish", bold: true, fill: BURGUNDY, color: WHITE }],
    ["Companionship, meaningful routine, attentional redirection, pleasant sensory engagement, social support, and chronic-pain self-management", "That cats cure neuropathic pain, regenerate nerves, heal human bone, or replace medical treatment"],
    ["A possible reduction in pain interference or distress for some individuals", "That purring alters intracranial pressure, CSF accumulation, ventricular size, or Chiari anatomy"],
    ["A plausible continuity-of-companionship benefit in a stable multi-cat home", "A biological dose-response in which more cats automatically produce greater health benefit"],
    ["The need to balance benefits with falls, infection, sleep, care burden, cost, and feline-welfare risks", "That feeling calmer around a cat makes new neurological symptoms medically benign"],
  ], [5000,5000]),
  para("Clinical safety principle", { bold: true, color: BURGUNDY, size: 22, after: 45 }),
  para("Use cats for comfort, not for neurological triage. New or significantly worsening neurological symptoms require professional medical assessment.", { bold: true, color: NAVY, size: 23, after: 220 }),
  para("This report is an evidence review, not a medical diagnosis, prescription, legal opinion, or substitute for individualized care from qualified clinicians. Personal observations are meaningful but must be identified as lived experience rather than clinical proof.", { italics: true, color: MID, size: 19 }),
  new Paragraph({ children: [new PageBreak()] }),
);

content.push(...sectionBanner("Navigation", "Contents", "The document is structured for clinicians, advocates, housing professionals, family supporters, and careful public readers."));
content.push(new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-3" }), new Paragraph({ children: [new PageBreak()] }));
content.push(...sectionBanner("01 · Clinical foundation", "Clinical context and medically honest framing", "Why chronic pain, disability, attention, emotion, social support, and daily structure must be considered together."));

const sectionStarts = new Map([
  [1, ["01 · Clinical foundation", "Clinical context and medically honest framing", "Why chronic pain, disability, attention, emotion, social support, and daily structure must be considered together."]],
  [25, ["02 · Supportive mechanisms", "Thirteen ways cats may support coping and quality of life", "Mechanisms supported directly by research, cautiously extended from adjacent evidence, or explicitly labeled as inference."]],
  [222, ["03 · The multi-cat question", "What may be distinctive about several bonded cats", "Relational diversity and continuity of companionship without claiming that more animals create a stronger biological treatment."]],
  [260, ["04 · Condition-specific analysis", "Applying the evidence to this neurological profile", "A careful separation between supportive comfort and treatment of structural neurological disease."]],
  [322, ["05 · Benefits and burdens", "Risks, safeguards, and feline welfare", "A therapeutic home must also be safe, hygienic, financially sustainable, and healthy for every cat."]],
  [387, ["06 · Practical framework", "Designing a safer supportive home", "Concrete environmental and self-observation practices that preserve comfort without overmedicalizing the animals."]],
  [452, ["07 · Conclusion", "Overall expert assessment", "A balanced synthesis of credible benefits, known limitations, and the role of lived experience."]],
]);

for (const item of paragraphs) {
  if (!item.text || item.n === 1) continue;
  if (sectionStarts.has(item.n)) {
    content.push(...sectionBanner(...sectionStarts.get(item.n), true));
  }
  if (item.n === 452 || item.n === 322 || item.n === 387 || item.n === 260 || item.n === 222 || item.n === 25) continue;
  if (item.n === 9) continue;

  if (h2.has(item.n)) {
    content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(cleanText(item.text))] }));
  } else if (h3.has(item.n)) {
    content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(cleanText(item.text))] }));
  } else if (callouts.has(item.n)) {
    content.push(nativeTable([[{ text: cleanText(item.text), bold: true, fill: item.n === 302 ? BURGUNDY : PALE, color: item.n === 302 ? WHITE : NAVY }]], [10000]), new Paragraph({ spacing: { after: 80 } }));
  } else {
    content.push(citedParagraph(item, { bullet: isBullet(item.n) }));
  }
}

content.push(...sectionBanner("Evidence apparatus", "References", "Peer-reviewed literature and authoritative institutional guidance cited in the brief.", true));
refs.forEach((r, i) => content.push(new Paragraph({
  spacing: { after: 105, line: 250 },
  indent: { left: 420, hanging: 420 },
  children: [
    new TextRun({ text: `${i + 1}. `, bold: true, color: BURGUNDY, size: 18 }),
    new TextRun({ text: `${r} `, size: 18 }),
    new ExternalHyperlink({ link: refUrls[i], children: [new TextRun({ text: "Open source", style: "Hyperlink", size: 18 })] }),
  ],
})));

content.push(
  ...sectionBanner("Methodological note", "How to interpret this brief", "A concise guide to evidence strength and responsible use.", true),
  nativeTable([
    [{ text: "Category", bold: true, fill: NAVY, color: WHITE }, { text: "Meaning", bold: true, fill: NAVY, color: WHITE }],
    ["Direct evidence", "The cited research or guidance directly addresses the proposition stated."],
    ["Qualified evidence", "The core proposition is supported, but study design, population, species, or setting limits generalization."],
    ["Inference", "The proposition reasonably applies adjacent evidence to this household or condition, but has not itself been established in controlled research."],
    ["Lived experience", "A personal observation that may be true and important for the individual but is not presented as general clinical proof."],
    ["Not established", "The proposition lacks adequate controlled human evidence and should not be represented as a medical effect."],
  ], [2800,7200]),
  para("The most persuasive version of this document is not the one that makes the largest number of claims. It is the one that distinguishes evidence, inference, and lived experience with unusual clarity.", { bold: true, color: NAVY, size: 23, after: 240 }),
  para("Editorial control: No social-media post, Wikipedia entry, dictionary definition, promotional webpage, or search-result snippet is treated as medical evidence in this brief.", { italics: true, color: MID, size: 19 }),
);

const doc = new Document({
  creator: "Miracle Fund · With the Cats",
  title: "Companion Cats, Chronic Neuropathic Pain, and Complex Neurological Disability",
  subject: "Clinical evidence brief",
  description: "A medically cautious evidence review with native tables and formal references.",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: "Aptos", size: 21, color: "292522" }, paragraph: { spacing: { after: 110, line: 285 } } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Aptos Display", bold: true, color: NAVY, size: 43 }, paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 240 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Aptos Display", bold: true, color: NAVY, size: 34 }, paragraph: { spacing: { before: 180, after: 160 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Aptos Display", bold: true, color: BURGUNDY, size: 26 }, paragraph: { spacing: { before: 220, after: 100 }, keepNext: true, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Aptos", bold: true, color: NAVY, size: 22 }, paragraph: { spacing: { before: 170, after: 70 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      type: SectionType.NEXT_PAGE,
      page: { margin: { top: 900, right: 850, bottom: 850, left: 850 } },
    },
    children: cover,
  }, {
    properties: {
      page: { margin: { top: 790, right: 850, bottom: 790, left: 850 } },
    },
    headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } }, children: [new TextRun({ text: "WITH THE CATS  ·  CLINICAL EVIDENCE BRIEF", bold: true, color: NAVY, size: 15, characterSpacing: 60 })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MIRACLE FUND  ·  AUGUST 2026   |   ", color: MID, size: 15 }), new TextRun({ children: [PageNumber.CURRENT], color: BURGUNDY, bold: true, size: 15 })] })] }) },
    children: content,
  }],
});

fs.writeFileSync(output, await Packer.toBuffer(doc));
console.log(JSON.stringify({ sourceParagraphs: paragraphs.length, output, references: refs.length, bodyElements: content.length }, null, 2));
