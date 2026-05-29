// Rebuild the retreat flyer as a clean vector PDF using the WEBSITE color theme
// (dark teal gradient, cream text, gold + orange accents). All text is editable.
// Run: node build-flyer.cjs   (writes src/assets/retreat-flyer.pdf, or -vN if locked)
const fs = require('fs');
const { PNG } = require('pngjs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// ---- EDITABLE CONTENT ------------------------------------------------------
const C = {
  title: "NorCal Men's Retreat 2026",
  subtitle: 'Standing in the Gap',
  date: 'June 11-13, 2026',
  location: 'Alliance Redwoods Conference Grounds · Occidental, California',
  scripture: [
    '“I looked for someone among them who would build up the wall',
    'and stand before me in the gap for the land…”',
  ],
  scriptureRef: '— Ezekiel 22:30',
  calling: [
    'God is still calling men to stand in the gap—',
    'for their families, for their churches,',
    'for their communities, and for the next generation.',
  ],
  whoTitle: 'WHO SHOULD ATTEND',
  who: ['Young men under 18 must be accompanied by an adult', 'Men seeking renewal, accountability, and purpose'],
  expectTitle: 'WHAT TO EXPECT',
  expect: ['Christ-centered worship & prayer', 'Bible-based teaching', 'Brotherhood & fellowship', "Reflection on God's creation", 'Encouragement to live boldly for Christ'],
  speakersTitle: 'RETREAT SPEAKERS',
  speakers: [['JK Hamilton', ' – Community CoC'], ['James Walker', ' – San Pablo Ave CoC'], ['Stanley Winters', ' – Parkway CoC'], ['Stanley Winters Jr', ' – Parkway CoC'], ['Mark Hancock', ' – Central Church of Christ']],
  scan: 'Scan to Register',
  url: 'norcalmensretreat.com/registration',
  price1: 'Full retreat $248    •    Single day $85',
  price2: 'Linen & towel package $25 (or $5/item)    •    Single-day meals $50 (2) / $65 (3)',
};

(async () => {
  const PW = 612, PH = 792;
  // theme colors
  const teal1 = [26, 58, 74], teal2 = [30, 77, 94];        // #1a3a4a -> #1e4d5e
  const cream = rgb(240 / 255, 230 / 255, 208 / 255);
  const creamDim = rgb(0.80, 0.76, 0.66);
  const gold = rgb(232 / 255, 168 / 255, 50 / 255);
  const orange = rgb(212 / 255, 120 / 255, 47 / 255);
  const white = rgb(1, 1, 1);

  // ---- teal gradient background PNG (diagonal 135deg) ----
  const GW = 1224, GH = 1584;
  const g = new PNG({ width: GW, height: GH });
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const t = (x / GW + y / GH) / 2;
    const i = (y * GW + x) << 2;
    g.data[i] = teal1[0] + (teal2[0] - teal1[0]) * t;
    g.data[i + 1] = teal1[1] + (teal2[1] - teal1[1]) * t;
    g.data[i + 2] = teal1[2] + (teal2[2] - teal1[2]) * t;
    g.data[i + 3] = 255;
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([PW, PH]);
  const bgImg = await doc.embedPng(PNG.sync.write(g));
  page.drawImage(bgImg, { x: 0, y: 0, width: PW, height: PH });

  const fIt = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const fR = await doc.embedFont(StandardFonts.TimesRoman);
  const h = await doc.embedFont(StandardFonts.Helvetica);
  const hO = await doc.embedFont(StandardFonts.HelveticaOblique);
  const hB = await doc.embedFont(StandardFonts.HelveticaBold);

  const CX = 306, PL = 64, PR = 548, PWID = PR - PL;
  const center = (t, y, s, f, c, ls) => {
    if (ls) { // letter-spaced (for section headers)
      let tot = 0; for (const ch of t) tot += f.widthOfTextAtSize(ch, s) + ls; tot -= ls;
      let x = CX - tot / 2; for (const ch of t) { page.drawText(ch, { x, y, size: s, font: f, color: c }); x += f.widthOfTextAtSize(ch, s) + ls; }
      return;
    }
    const w = f.widthOfTextAtSize(t, s); page.drawText(t, { x: CX - w / 2, y, size: s, font: f, color: c });
  };
  const rule = (y, inset, col, op) => page.drawRectangle({ x: PL + inset, y, width: PWID - 2 * inset, height: 1, color: col || gold, opacity: op == null ? 0.85 : op });
  function checkmark(x, y, s, c) { page.drawLine({ start: { x, y: y + s * 0.4 }, end: { x: x + s * 0.4, y }, thickness: 1.5, color: c }); page.drawLine({ start: { x: x + s * 0.4, y }, end: { x: x + s, y: y + s }, thickness: 1.5, color: c }); }
  function wrap(t, f, s, maxW) { const ws = t.split(' '); const out = []; let cur = ''; for (const w of ws) { const tl = cur ? cur + ' ' + w : w; if (f.widthOfTextAtSize(tl, s) > maxW && cur) { out.push(cur); cur = w; } else cur = tl; } if (cur) out.push(cur); return out; }

  let y = PH - 74;
  // title
  center(C.title, y, 33, hB, cream); y -= 31;
  center(C.subtitle, y, 18, hO, cream); y -= 27;
  rule(y, 150, gold, 0.9); y -= 30;
  // date + location
  center(C.date, y, 14, hB, gold); y -= 21;
  center(C.location, y, 11, h, cream); y -= 32;
  // scripture
  for (const ln of C.scripture) { center(ln, y, 12.5, fIt, cream); y -= 20; }
  center(C.scriptureRef, y, 11, fIt, gold); y -= 28;
  // calling
  for (const ln of C.calling) { center(ln, y, 13.5, fIt, cream); y -= 20; }
  y -= 12;
  rule(y, 120, gold, 0.7); y -= 28;

  // ---- two columns ----
  const colTop = y;
  const Lx = PL + 18, Rx = CX + 22;
  const LcolW = (CX - 14) - (Lx + 17), RcolW = (PR - 8) - (Rx + 17);
  const Lcx = (Lx + (CX - 14)) / 2, Rcx = (Rx + (PR - 8)) / 2;
  center2(C.whoTitle, Lcx, colTop, 11.5, hB, cream, 1.2);
  center2(C.expectTitle, Rcx, colTop, 11.5, hB, cream, 1.2);
  function center2(t, cx, yy, s, f, c, ls) { let tot = 0; for (const ch of t) tot += f.widthOfTextAtSize(ch, s) + ls; tot -= ls; let x = cx - tot / 2; for (const ch of t) { page.drawText(ch, { x, y: yy, size: s, font: f, color: c }); x += f.widthOfTextAtSize(ch, s) + ls; } }
  // underline accents
  page.drawRectangle({ x: Lcx - 26, y: colTop - 8, width: 52, height: 1.4, color: gold });
  page.drawRectangle({ x: Rcx - 26, y: colTop - 8, width: 52, height: 1.4, color: gold });

  const itemSize = 10.5, lh = 21;
  let ly = colTop - 26, ry = colTop - 26;
  for (const it of C.who) {
    const lines = wrap(it, h, itemSize, LcolW);
    checkmark(Lx, ly - 8.5, 9, gold);
    lines.forEach((l, i) => page.drawText(l, { x: Lx + 17, y: ly - i * 13.5, size: itemSize, font: h, color: cream }));
    ly -= lh + (lines.length - 1) * 13.5;
  }
  for (const it of C.expect) {
    const lines = wrap(it, h, itemSize, RcolW);
    page.drawCircle({ x: Rx + 3.5, y: ry - 3.5, size: 2.3, color: gold });
    lines.forEach((l, i) => page.drawText(l, { x: Rx + 17, y: ry - i * 13.5, size: itemSize, font: h, color: cream }));
    ry -= lh + (lines.length - 1) * 13.5;
  }

  // ---- speakers ----
  y = Math.min(ly, ry) - 8;
  center(C.speakersTitle, y, 11.5, hB, cream, 1.2);
  page.drawRectangle({ x: CX - 26, y: y - 8, width: 52, height: 1.4, color: gold });
  y -= 25;
  const spkSize = 10.5, spkLh = 18, spkCols = [CX - 112, CX + 112];
  const drawSpeaker = (cx, name, rest, yy) => {
    const wN = hB.widthOfTextAtSize(name, spkSize), wR = h.widthOfTextAtSize(rest, spkSize);
    const sx = cx - (wN + wR) / 2;
    page.drawText(name, { x: sx, y: yy, size: spkSize, font: hB, color: cream });
    page.drawText(rest, { x: sx + wN, y: yy, size: spkSize, font: h, color: creamDim });
  };
  for (let i = 0; i < C.speakers.length; i += 2) {
    const row = C.speakers.slice(i, i + 2);
    if (row.length === 1) {
      drawSpeaker(CX, row[0][0], row[0][1], y);
    } else {
      drawSpeaker(spkCols[0], row[0][0], row[0][1], y);
      drawSpeaker(spkCols[1], row[1][0], row[1][1], y);
    }
    y -= spkLh;
  }

  // ---- QR footer: two codes side by side (Register + Donate) ----
  const qrSize = 56, cardP = 7, card = qrSize + 2 * cardP;
  const cardTop = 176, cardY = cardTop - card;
  const leftCX = CX - 88, rightCX = CX + 88;
  const qrReg = await doc.embedPng(fs.readFileSync('src/assets/registration-qr.png'));
  const qrDon = await doc.embedPng(fs.readFileSync('src/assets/donation-qr.png'));
  const qrBlock = (centerX, img, label, url) => {
    const x0 = centerX - card / 2;
    page.drawRectangle({ x: x0, y: cardY, width: card, height: card, color: white, borderColor: gold, borderWidth: 1.5 });
    page.drawImage(img, { x: x0 + cardP, y: cardY + cardP, width: qrSize, height: qrSize });
    const lw = hB.widthOfTextAtSize(label, 12); page.drawText(label, { x: centerX - lw / 2, y: cardY - 16, size: 12, font: hB, color: cream });
    const uw = h.widthOfTextAtSize(url, 8.5); page.drawText(url, { x: centerX - uw / 2, y: cardY - 28, size: 8.5, font: h, color: gold });
  };
  qrBlock(leftCX, qrReg, 'Scan to Register', 'norcalmensretreat.com/registration');
  qrBlock(rightCX, qrDon, 'Scan to Donate', 'norcalmensretreat.com/donations');
  const lowRule = cardY - 38;
  rule(lowRule, 30, gold, 0.6);
  center(C.price1, lowRule - 16, 12.5, hB, cream);
  let ps2 = 10; const maxW = PWID - 24; while (h.widthOfTextAtSize(C.price2, ps2) > maxW && ps2 > 8) ps2 -= 0.5;
  center(C.price2, lowRule - 31, ps2, h, creamDim);

  const bytes = await doc.save();
  let wrote = null;
  for (const n of ['retreat-flyer.pdf', 'retreat-flyer-v10.pdf']) { try { fs.writeFileSync('src/assets/' + n, bytes); wrote = n; break; } catch (e) { if (e.code !== 'EBUSY') throw e; } }
  console.log('teal vector rebuild -> ' + wrote + '  (cardTop=' + cardTop.toFixed(0) + ' speakersEnd=' + y.toFixed(0) + ')');
})().catch(e => { console.error(e); process.exit(1); });
