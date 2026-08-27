/**
 * seed-performance-test.ts
 *
 * Creates 20 000 books, 5 000 users and random rentals for load / perf testing.
 *
 * Usage (from project root):
 *   npx ts-node --skip-project lib/utils/seed-performance-test.ts
 *
 * DATABASE_URL is read from .env / .env.local automatically.
 * Override on the command line if needed:
 *   DATABASE_URL=file:./database/my-other.db npx ts-node --skip-project lib/utils/seed-performance-test.ts
 */

// Load .env / .env.local before anything else
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

// ── tunables ──────────────────────────────────────────────────────────────────
const BOOK_COUNT = 20_000;
const USER_COUNT = 5_000;
/** Fraction of books that will be rented out (0–1). */
const RENTAL_FRACTION = 0.35;
/** Rows per transaction chunk — lower on Raspberry Pi (e.g. 200). */
const BATCH_SIZE = 500;
// ─────────────────────────────────────────────────────────────────────────────

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error(
    "ERROR: DATABASE_URL is not set. Add it to .env or .env.local, e.g.:\n  DATABASE_URL=file:./database/library.db",
  );
  process.exit(1);
}

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

// ── fake-data helpers ─────────────────────────────────────────────────────────
const FIRST_NAMES = [
  "Emma",
  "Lena",
  "Mia",
  "Hannah",
  "Sofia",
  "Lea",
  "Anna",
  "Laura",
  "Felix",
  "Leon",
  "Lukas",
  "Jonas",
  "Tim",
  "Max",
  "Ben",
  "Paul",
  "Elias",
  "Noah",
  "Luis",
  "Finn",
  "Julia",
  "Lisa",
  "Sara",
  "Marie",
  "Nina",
  "Clara",
  "Maja",
  "Lara",
  "Tom",
  "Jan",
];
const LAST_NAMES = [
  "Müller",
  "Schmidt",
  "Schneider",
  "Fischer",
  "Weber",
  "Meyer",
  "Wagner",
  "Becker",
  "Schulz",
  "Hoffmann",
  "Schäfer",
  "Koch",
  "Bauer",
  "Richter",
  "Klein",
  "Wolf",
  "Schröder",
  "Neumann",
  "Schwarz",
  "Zimmermann",
  "Braun",
  "Krüger",
  "Hartmann",
  "Lange",
  "Schmitt",
  "Werner",
  "Krause",
  "Lehmann",
  "König",
  "Walter",
];
const SCHOOL_GRADES = ["1a", "1b", "2a", "2b", "3a", "3b", "4a", "4b"];
const TEACHER_NAMES = [
  "Frau Meier",
  "Herr Schulze",
  "Frau Wagner",
  "Herr Fischer",
  "Frau Hoffmann",
  "Herr Braun",
  "Frau Richter",
  "Herr Schmidt",
];
const BOOK_TITLE_PREFIXES = [
  "Das Geheimnis",
  "Die Abenteuer",
  "Der Schatz",
  "Im Land",
  "Auf der Suche",
  "Die Reise",
  "Das Rätsel",
  "Die Geschichte",
  "Der Weg",
  "Im Herzen",
  "Das Wunder",
  "Die Macht",
];
const BOOK_TITLE_NOUNS = [
  "des Waldes",
  "der Sterne",
  "der Zeit",
  "des Drachen",
  "der Wölfe",
  "des Meeres",
  "der Berge",
  "des Feuers",
  "der Nacht",
  "des Lichts",
  "der Magie",
  "der Freundschaft",
  "des Winters",
  "des Sommers",
  "der Wahrheit",
  "der Freiheit",
];
const AUTHORS = [
  "Erich Kästner",
  "Astrid Lindgren",
  "Michael Ende",
  "Cornelia Funke",
  "Paul Maar",
  "Otfried Preußler",
  "Christine Nöstlinger",
  "James Krüss",
  "Gudrun Pausewang",
  "Peter Härtling",
  "Andreas Steinhöfel",
  "Kirsten Boie",
  "Angela Sommer-Bodenburg",
  "Franz Sales Sklenitzka",
  "Rolf Fänger",
  "Thomas Brezina",
  "Nele Neuhaus",
  "Sebastian Fitzek",
];
const TOPICS = [
  "Abenteuer",
  "Freundschaft",
  "Familie",
  "Schule",
  "Tiere",
  "Natur",
  "Fantasie",
  "Geschichte",
  "Detektiv",
  "Sport",
  "Musik",
  "Reise",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomIsbn(): string {
  return "978" + Array.from({ length: 10 }, () => randInt(0, 9)).join("");
}
function randomBookTitle(i: number): string {
  return `${pick(BOOK_TITLE_PREFIXES)} ${pick(BOOK_TITLE_NOUNS)} (${i + 1})`;
}
function randomPastDate(maxDaysAgo: number): Date {
  return dayjs().subtract(randInt(1, maxDaysAgo), "day").toDate();
}
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.time("total");
  console.log(`DATABASE_URL → ${dbUrl}\n`);

  // 1. users
  console.log(`Creating ${USER_COUNT.toLocaleString()} users …`);
  console.time("users");
  const userRows = Array.from({ length: USER_COUNT }, (_, i) => ({
    firstName: pick(FIRST_NAMES),
    lastName: `${pick(LAST_NAMES)} ${i + 1}`,
    schoolGrade: pick(SCHOOL_GRADES),
    schoolTeacherName: pick(TEACHER_NAMES),
    eMail: `nutzer${i + 1}@schule-beispiel.de`,
    active: Math.random() > 0.05,
  }));
  for (const batch of chunk(userRows, BATCH_SIZE)) {
    await prisma.user.createMany({ data: batch });
  }
  console.timeEnd("users");

  const userIds = (
    await prisma.user.findMany({ select: { id: true }, orderBy: { id: "asc" } })
  ).map((u) => u.id);
  console.log(`  → ${userIds.length.toLocaleString()} users in DB`);

  // 2. books
  console.log(`\nCreating ${BOOK_COUNT.toLocaleString()} books …`);
  console.time("books");
  const bookRows = Array.from({ length: BOOK_COUNT }, (_, i) => ({
    title: randomBookTitle(i),
    subtitle: Math.random() > 0.6 ? `Band ${randInt(1, 12)}` : null,
    author: pick(AUTHORS),
    topics: pickN(TOPICS, randInt(1, 3)).join(";"),
    isbn: randomIsbn(),
    publisherName: pick([
      "Ravensburger",
      "Dtv Junior",
      "Fischer Sauerländer",
      "Thienemann",
      "Arena",
      "Oetinger",
      "Loewe",
    ]),
    publisherDate: String(randInt(1990, 2024)),
    pages: randInt(48, 400),
    price: `${(randInt(500, 2500) / 100).toFixed(2)} €`,
    minAge: String(randInt(5, 10)),
    maxAge: String(randInt(10, 16)),
    rentalStatus: "available",
    renewalCount: 0,
  }));
  for (const batch of chunk(bookRows, BATCH_SIZE)) {
    await prisma.book.createMany({ data: batch });
  }
  console.timeEnd("books");

  const bookIds = (
    await prisma.book.findMany({ select: { id: true }, orderBy: { id: "asc" } })
  ).map((b) => b.id);
  console.log(`  → ${bookIds.length.toLocaleString()} books in DB`);

  // 3. rentals
  const rentalCount = Math.floor(BOOK_COUNT * RENTAL_FRACTION);
  console.log(`\nCreating ~${rentalCount.toLocaleString()} rentals …`);
  console.time("rentals");
  const booksToRent = [...bookIds]
    .sort(() => 0.5 - Math.random())
    .slice(0, rentalCount);

  for (const batch of chunk(booksToRent, BATCH_SIZE)) {
    await prisma.$transaction(
      batch.map((bookId) => {
        const userId = pick(userIds);
        const rentedDate = randomPastDate(90);
        const dueDate = dayjs(rentedDate).add(21, "day").toDate();
        return prisma.book.update({
          where: { id: bookId },
          data: {
            rentalStatus: "rented",
            rentedDate,
            dueDate,
            renewalCount: randInt(0, dueDate < new Date() ? 2 : 0),
            userId,
          },
        });
      }),
    );
  }
  console.timeEnd("rentals");

  // 4. summary
  const [totalBooks, totalUsers, rentedBooks] = await Promise.all([
    prisma.book.count(),
    prisma.user.count(),
    prisma.book.count({ where: { rentalStatus: "rented" } }),
  ]);

  console.log("\n── Summary ──────────────────────────────────");
  console.log(`  Books   : ${totalBooks.toLocaleString()}`);
  console.log(`  Users   : ${totalUsers.toLocaleString()}`);
  console.log(
    `  Rented  : ${rentedBooks.toLocaleString()} (${((rentedBooks / totalBooks) * 100).toFixed(1)} %)`,
  );
  console.log("─────────────────────────────────────────────");
  console.timeEnd("total");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
