import * as cheerio from 'cheerio';
import { Parser } from 'n3';
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

type BookFormData = {
    title?: string;
    author?: string;
    subtitle?: string;
    topics?: string[];
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
        .filter(triple => triple.predicate.value.endsWith(pred))
        .map(triple => triple.object.value)
        .filter(val => typeof val === "string");
}

function getPredicateValue(pred: string, triples: any[]): string | undefined {
    return getPredicateValues(pred, triples)[0];
}

// Predicate mapping: update as needed from actual RDF files!
const P = {
    // Title fields: dcterms:title (main), gndo:preferredName (alt), dc:title, schema:name
    title: [
        "http://purl.org/dc/terms/title",
        "http://xmlns.com/foaf/0.1/name",
        "http://www.w3.org/2000/01/rdf-schema#label",
        "http://schema.org/name",
        "http://purl.org/dc/elements/1.1/title",
        "https://d-nb.info/standards/elementset/gnd#preferredName"
    ],
    // Author fields: dcterms:creator, rdau:P60327 (author literal), marcRole:aut (author), foaf:name (fallback)
    author: [
        "http://purl.org/dc/terms/creator",
        "http://rdaregistry.info/Elements/u/P60327",
        "http://id.loc.gov/vocabulary/relators/aut",
        "http://xmlns.com/foaf/0.1/name",
        "http://schema.org/author"
    ],
    // Subtitle (sometimes in rdau:P60493, or alternate name)
    subtitle: [
        "http://rdaregistry.info/Elements/u/P60493",
        "http://purl.org/dc/terms/alternative",
        "http://schema.org/alternateName"
    ],
    // Topics/Subjects: dcterms:subject, dc:subject, skos:prefLabel
    topics: [
        "http://purl.org/dc/terms/subject",
        "http://purl.org/dc/elements/1.1/subject",
        "http://www.w3.org/2004/02/skos/core#prefLabel"
    ],
    // Summary/description/table of contents: dcterms:description, dcterms:tableOfContents, schema:description, rdau:P60372
    summary: [
        "http://purl.org/dc/terms/description",
        "http://purl.org/dc/terms/tableOfContents",
        "http://schema.org/description",
        "http://rdaregistry.info/Elements/u/P60372"
    ],
    // ISBN: bibo:isbn13, bibo:isbn10, bibo:gtin14, rdau:P60059
    isbn: [
        "http://purl.org/ontology/bibo/isbn13",
        "http://purl.org/ontology/bibo/isbn10",
        "http://purl.org/ontology/bibo/gtin14",
        "http://rdaregistry.info/Elements/u/P60059",
        "http://schema.org/isbn"
    ],
    // Edition description: bibo:edition
    editionDescription: [
        "http://purl.org/ontology/bibo/edition"
    ],
    // Publisher name: dc:publisher, dcterms:publisher, schema:publisher
    publisherName: [
        "http://purl.org/dc/elements/1.1/publisher",
        "http://purl.org/dc/terms/publisher",
        "http://schema.org/publisher"
    ],
    // Publisher location: rdau:P60163, rdau:P60333
    publisherLocation: [
        "http://rdaregistry.info/Elements/u/P60163",
        "http://rdaregistry.info/Elements/u/P60333"
    ],
    // Publishing date: dcterms:issued, dcterms:date, schema:datePublished
    publisherDate: [
        "http://purl.org/dc/terms/issued",
        "http://purl.org/dc/terms/date",
        "http://schema.org/datePublished"
    ],
    // Pages/extent: isbd:P1053, rdau:P60150
    pages: [
        "http://iflastandards.info/ns/isbd/elements/P1053",
        "http://rdaregistry.info/Elements/u/P60150",
        "http://schema.org/numberOfPages"
    ],
    // Min age: schema:typicalAgeRange
    minAge: [
        "http://schema.org/typicalAgeRange"
    ],
    // Price: rdau:P60521, schema:price
    price: [
        "http://rdaregistry.info/Elements/u/P60521",
        "http://schema.org/price"
    ],
    // External links: dcterms:isReferencedBy, wdrs:describedby, owl:sameAs
    externalLinks: [
        "http://purl.org/dc/terms/isReferencedBy",
        "http://www.w3.org/2007/05/powder-s#describedby",
        "http://www.w3.org/2002/07/owl#sameAs"
    ],
    // Additional material: dcterms:isFormatOf
    additionalMaterial: [
        "http://purl.org/dc/terms/isFormatOf"
    ],
    // Physical attributes: rdau:P60539
    otherPhysicalAttributes: [
        "http://rdaregistry.info/Elements/u/P60539"
    ],
    // Physical size: rdau:P60101
    physicalSize: [
        "http://rdaregistry.info/Elements/u/P60101"
    ]
};

// Utility: get first or all objects for a set of predicates
function getFirstMatching(triples: any[], predicates: string[]): string | undefined {
    // Check full predicate URIs
    for (const pred of predicates) {
        const found = triples.find(triple => triple.predicate.value === pred);
        if (found) return found.object.value;
    }
    // Fallback: check for endsWith last part (localName)
    for (const pred of predicates) {
        const localName = pred.split(/[\/#]/).pop();
        const found = triples.find(triple =>
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
                .filter(triple => triple.predicate.value === pred)
                .map(triple => triple.object.value)
        );
        const localName = pred.split(/[\/#]/).pop();
        values.push(
            ...triples
                .filter(triple =>
                    triple.predicate.value.endsWith("/" + localName) ||
                    triple.predicate.value.endsWith("#" + localName)
                )
                .map(triple => triple.object.value)
        );
    }
    // Remove duplicates
    return Array.from(new Set(values));
}

function getAllMatchingLiterals(triples: any[], predicates: string[]): string[] {
    const values = [];
    for (const pred of predicates) {
        values.push(
            ...triples
                .filter(triple =>
                    triple.predicate.value === pred &&
                    typeof triple.object.value === "string" &&
                    !/^https?:\/\//.test(triple.object.value)
                )
                .map(triple => triple.object.value)
        );
        const localName = pred.split(/[\/#]/).pop();
        values.push(
            ...triples
                .filter(triple =>
                    (triple.predicate.value.endsWith("/" + localName) ||
                        triple.predicate.value.endsWith("#" + localName)) &&
                    typeof triple.object.value === "string" &&
                    !/^https?:\/\//.test(triple.object.value)
                )
                .map(triple => triple.object.value)
        );
    }
    return Array.from(new Set(values));
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { isbn } = req.query;
    if (!isbn || typeof isbn !== 'string') {
        res.status(400).json({ error: 'Missing ISBN' });
        return;
    }

    try {
        // 1. Search in DNB
        const dnbSearchUrl = `https://portal.dnb.de/opac/simpleSearch?query=${isbn}`;
        const searchResp = await fetch(dnbSearchUrl);
        const searchHtml = await searchResp.text();

        // 2. Parse HTML for Turtle link
        const $ = cheerio.load(searchHtml);
        let turtleLink = '';
        $('a').each((i, el) => {
            if ($(el).text().includes("RDF (Turtle)-Repräsentation dieses Datensatzes")) {
                turtleLink = $(el).attr('href') ?? '';
            }
        });
        if (!turtleLink) {
            res.status(404).json({ error: "RDF-Turtle-Link not found in DNB result." });
            return;
        }
        if (turtleLink.startsWith('/')) {
            turtleLink = "https://portal.dnb.de" + turtleLink;
        }

        // 3. Download Turtle file
        const turtleResp = await fetch(turtleLink);
        const turtleText = await turtleResp.text();

        // 4. Parse Turtle file with N3
        const parser = new Parser();
        const triples = parser.parse(turtleText);


        // Optional: log predicates for debugging
        // triples.forEach(triple => console.log(triple.predicate.value, triple.object.value));


        // 5. Map predicates to form fields using robust extraction
        const bookData: BookFormData = {
            title: getFirstMatching(triples, P.title),
            author: getAllMatchingLiterals(triples, P.author).join(", "),
            subtitle: getFirstMatching(triples, P.subtitle),
            //topics, //TODO
            //topics: getAllMatching(triples, P.topics),
            summary: getFirstMatching(triples, P.summary),
            isbn: getFirstMatching(triples, P.isbn) || isbn,
            editionDescription: undefined, // add mapping if needed
            publisherName: getFirstMatching(triples, P.publisherName),
            publisherLocation: getFirstMatching(triples, P.publisherLocation),
            publisherDate: getFirstMatching(triples, P.publisherDate),
            pages: getFirstMatching(triples, P.pages),
            minAge: getFirstMatching(triples, P.minAge),
            maxAge: undefined,
            price: getFirstMatching(triples, P.price),
            externalLinks: getAllMatching(triples, P.externalLinks).join(', '),
            additionalMaterial: undefined,
            minPlayers: undefined,
            otherPhysicalAttributes: getFirstMatching(triples, P.otherPhysicalAttributes),
            supplierComment: undefined,
            physicalSize: getFirstMatching(triples, P.physicalSize)
        };


        res.status(200).json(bookData);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Error fetching/parsing DNB data.' });
    }
}