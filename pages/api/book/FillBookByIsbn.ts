import * as cheerio from "cheerio";
import { Parser } from "n3";
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

// this is the config file for all the sources of the ISBN autofill
import predicateConfig from "./predicates.config.json";

type BookFormData = {
  title?: string;
  author?: string;
  subtitle?: string;
  topics?: string;
  summary?: string;
  isbn?: string;
  editionDescription?: string;
  publisherName?: string;
  publisherLocation?: string;
  publisherDate?: string;
  pages?: string;
  minAge?: string;
  maxAge?: string;
  price?: string;
  externalLinks?: string;
  additionalMaterial?: string;
  minPlayers?: string;
  otherPhysicalAttributes?: string;
  supplierComment?: string;
  physicalSize?: string;
};

// Helper: get values for a predicate
function getPredicateValues(pred: string, triples: any[]): string[] {
  return triples
    .filter((triple) => triple.predicate.value.endsWith(pred))
    .map((triple) => triple.object.value)
    .filter((val) => typeof val === "string");
}

function getPredicateValue(pred: string, triples: any[]): string | undefined {
  return getPredicateValues(pred, triples)[0];
}

// Predicate mapping loaded from JSON
const P = predicateConfig as Record<string, string[]>;

// Utility: get first or all objects for a set of predicates
function getFirstMatching(
  triples: any[],
  predicates: string[]
): string | undefined {
  // Check full predicate URIs
  for (const pred of predicates) {
    const found = triples.find((triple) => triple.predicate.value === pred);
    if (found) return found.object.value;
  }
  // Fallback: check for endsWith last part (localName)
  for (const pred of predicates) {
    const localName = pred.split(/[\/#]/).pop();
    const found = triples.find(
      (triple) =>
        triple.predicate.value.endsWith("/" + localName) ||
        triple.predicate.value.endsWith("#" + localName)
    );
    if (found) return found.object.value;
  }
  return undefined;
}

function getAllMatching(triples: any[], predicates: string[]): string[] {
  // All values for all predicates (full URIs and localName fallback)
  const values = [];
  for (const pred of predicates) {
    values.push(
      ...triples
        .filter((triple) => triple.predicate.value === pred)
        .map((triple) => triple.object.value)
    );
    const localName = pred.split(/[\/#]/).pop();
    values.push(
      ...triples
        .filter(
          (triple) =>
            triple.predicate.value.endsWith("/" + localName) ||
            triple.predicate.value.endsWith("#" + localName)
        )
        .map((triple) => triple.object.value)
    );
  }
  // Remove duplicates
  return Array.from(new Set(values));
}

function getAllMatchingLiterals(
  triples: any[],
  predicates: string[]
): string[] {
  const values = [];
  for (const pred of predicates) {
    values.push(
      ...triples
        .filter(
          (triple) =>
            triple.predicate.value === pred &&
            typeof triple.object.value === "string" &&
            !/^https?:\/\//.test(triple.object.value)
        )
        .map((triple) => triple.object.value)
    );
    const localName = pred.split(/[\/#]/).pop();
    values.push(
      ...triples
        .filter(
          (triple) =>
            (triple.predicate.value.endsWith("/" + localName) ||
              triple.predicate.value.endsWith("#" + localName)) &&
            typeof triple.object.value === "string" &&
            !/^https?:\/\//.test(triple.object.value)
        )
        .map((triple) => triple.object.value)
    );
  }
  return Array.from(new Set(values));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { isbn, bookId } = req.query;
  if (!isbn || typeof isbn !== "string") {
    res.status(400).json({ error: "Missing ISBN" });
    return;
  }

  try {
    // 1. Search in DNB
    const dnbSearchUrl = `https://portal.dnb.de/opac/simpleSearch?query=${isbn}`;
    const searchResp = await fetch(dnbSearchUrl);
    const searchHtml = await searchResp.text();

    // 2. Parse HTML for Turtle link
    const $ = cheerio.load(searchHtml);
    let turtleLink = "";
    $("a").each((i, el) => {
      if (
        $(el).text().includes("RDF (Turtle)-Repräsentation dieses Datensatzes")
      ) {
        turtleLink = $(el).attr("href") ?? "";
      }
    });
    if (!turtleLink) {
      res.status(404).json({
        error: "RDF-Turtle-Link not found in DNB result.",
      });
      return;
    }
    if (turtleLink.startsWith("/")) {
      turtleLink = "https://portal.dnb.de" + turtleLink;
    }

    // 3. Download Turtle file
    const turtleResp = await fetch(turtleLink);
    const turtleText = await turtleResp.text();

    // 4. Parse Turtle file with N3
    const parser = new Parser();
    const triples = parser.parse(turtleText);

    // 5. Map predicates to form fields using robust extraction
    const bookData: BookFormData = {
      title: getFirstMatching(triples, P.title),
      author: getAllMatchingLiterals(triples, P.author).join(", "),
      subtitle: getFirstMatching(triples, P.subtitle),
      summary: getFirstMatching(triples, P.summary),
      isbn: getFirstMatching(triples, P.isbn) || isbn,
      editionDescription: undefined,
      publisherName: getFirstMatching(triples, P.publisherName),
      publisherLocation: getFirstMatching(triples, P.publisherLocation),
      publisherDate: getFirstMatching(triples, P.publisherDate),
      minAge: getFirstMatching(triples, P.minAge),
      maxAge: undefined,
      price: getFirstMatching(triples, P.price),
      externalLinks: getAllMatching(triples, P.externalLinks).join(", "),
      additionalMaterial: undefined,
      minPlayers: undefined,
      otherPhysicalAttributes: getFirstMatching(
        triples,
        P.otherPhysicalAttributes
      ),
      supplierComment: undefined,
      physicalSize: getFirstMatching(triples, P.physicalSize),
    };

    res.status(200).json(bookData);
  } catch (err: any) {
    res.status(500).json({
      error: err.message || "Error fetching/parsing DNB data.",
    });
  }
}
