import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

function createPng(r: number, g: number, b: number): Buffer {
  const crc32 = (buf: Buffer): number => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++)
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  const u32 = (n: number) => {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(n);
    return b;
  };

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.concat([
    u32(13),
    Buffer.from("IHDR"),
    u32(1),
    u32(1),
    Buffer.from([8, 2, 0, 0, 0]),
  ]);
  const ihdrCrc = crc32(ihdr.subarray(4, 17));

  const raw = Buffer.from([0, r, g, b]);
  const compressed = deflateSync(raw);
  const idat = Buffer.concat([u32(compressed.length), Buffer.from("IDAT"), compressed]);
  const idatCrc = crc32(idat.subarray(4));

  const iend = Buffer.concat([u32(0), Buffer.from("IEND")]);
  const iendCrc = crc32(iend.subarray(4));

  return Buffer.concat([
    sig,
    Buffer.concat([ihdr, u32(ihdrCrc)]),
    Buffer.concat([idat, u32(idatCrc)]),
    Buffer.concat([iend, u32(iendCrc)]),
  ]);
}

const images = [
  { name: "cerebro-gris.png", r: 180, g: 180, b: 180 },
  { name: "cerebro-fullcolor.png", r: 200, g: 200, b: 255 },
  { name: "lobulo-frontal.png", r: 255, g: 80, b: 80 },
  { name: "lobulo-parietal.png", r: 80, g: 180, b: 255 },
  { name: "lobulo-temporal.png", r: 80, g: 255, b: 80 },
  { name: "lobulo-occipital.png", r: 255, g: 255, b: 80 },
];

for (const img of images) {
  writeFileSync(join(publicDir, img.name), createPng(img.r, img.g, img.b));
  console.log(`Created ${img.name}`);
}

const pdfNames = ["frontal", "temporal", "parietal", "occipital"];
for (const name of pdfNames) {
  const pdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 24 Tf 100 700 Td (${name}) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \n0000000360 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n438\n%%EOF`;
  writeFileSync(join(publicDir, "pdfs", `juego-${name}.pdf`), pdf);
  console.log(`Created pdfs/juego-${name}.pdf`);
}
