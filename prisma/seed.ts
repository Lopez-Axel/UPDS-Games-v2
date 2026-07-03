import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const juegos = [
    {
      nombre: "Color contrario",
      lobulo: "frontal",
      lobuloImg: "/lobulo-frontal.png",
      descripcion: "Estilo Stroop: palabra de color escrita en tinta distinta, hay que decir el color de la tinta",
      pdfUrl: "/pdfs/juego-frontal.pdf",
    },
    {
      nombre: "Adivina la emoción de la música",
      lobulo: "temporal",
      lobuloImg: "/lobulo-temporal.png",
      descripcion: "Fragmento musical, identificar emoción (alegría/tristeza/miedo/etc.)",
      pdfUrl: "/pdfs/juego-temporal.pdf",
    },
    {
      nombre: "Relieve Express",
      lobulo: "parietal",
      lobuloImg: "/lobulo-parietal.png",
      descripcion: "Reconocimiento táctil de texturas/formas con ojos cerrados",
      pdfUrl: "/pdfs/juego-parietal.pdf",
    },
    {
      nombre: "El dilema del puente",
      lobulo: "occipital",
      lobuloImg: "/lobulo-occipital.png",
      descripcion: "Acertijo visual con solución gráfica",
      pdfUrl: "/pdfs/juego-occipital.pdf",
    },
  ];

  for (const juego of juegos) {
    const { nombre, ...data } = juego;
    await prisma.juego.upsert({
      where: { nombre },
      update: data,
      create: juego,
    });
  }

  console.log("Juegos seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
