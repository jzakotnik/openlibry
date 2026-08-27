// hooks/useBookQuote.ts
import { useEffect, useState } from "react";

//this is for loading spinners, to have more fun reading quotes

const QUOTES = [
  {
    text: "Ein Zimmer ohne Bücher ist wie ein Körper ohne Seele.",
    author: "Marcus Tullius Cicero",
  },
  {
    text: "Das Lesen ist für den Geist das, was das Turnen für den Körper ist.",
    author: "Joseph Addison",
  },
  {
    text: "Bücher sind die ruhigsten und beständigsten Freunde.",
    author: "Charles William Eliot",
  },
  {
    text: "Ein gutes Buch ist der beste Freund, den man haben kann.",
    author: "Theodore Roosevelt",
  },
  {
    text: "Wer nicht liest, hat keinen Vorteil gegenüber dem, der nicht lesen kann.",
    author: "Mark Twain",
  },
  {
    text: "Bücher sind Spiegel: Man sieht in ihnen nur, was man bereits in sich trägt.",
    author: "Carlos Ruiz Zafón",
  },
  {
    text: "Das Paradies wäre für mich eine Art Bibliothek.",
    author: "Jorge Luis Borges",
  },
  { text: "Nicht alle, die wandern, sind verloren.", author: "J.R.R. Tolkien" },
  {
    text: "Es ist niemals zu spät, das zu werden, was man hätte sein können.",
    author: "George Eliot",
  },
  {
    text: "Man kann einen Menschen nichts lehren. Man kann ihm nur helfen, es in sich selbst zu entdecken.",
    author: "Galileo Galilei",
  },
  {
    text: "Die Kunst des Lesens besteht darin, klug zu überfliegen.",
    author: "André Maurois",
  },
  {
    text: "Ein Buch ist wie ein Garten, den man in der Tasche trägt.",
    author: "Chinesisches Sprichwort",
  },
  {
    text: "Bücher sind Schiffe des Denkens, die die Wellen der Zeit durchsegeln.",
    author: "Francis Bacon",
  },
  { text: "Heute ein Leser, morgen ein Anführer.", author: "Margaret Fuller" },
  {
    text: "Die Bibliothek ist der Tempel des Lernens.",
    author: "Gottfried Wilhelm Leibniz",
  },
  {
    text: "Wenn du dir ein neues Buch kaufst, hast du einen neuen Freund gewonnen.",
    author: "Umberto Eco",
  },
  {
    text: "Lesen heißt, mit einem fremden Gehirn zu denken.",
    author: "Arthur Schopenhauer",
  },
  { text: "So viele Bücher, so wenig Zeit.", author: "Frank Zappa" },
  {
    text: "Bücher sind die Bienen, die den Honig des Geistes von Blüte zu Blüte tragen.",
    author: "James Russell Lowell",
  },
  {
    text: "In Büchern liegt die Seele aller vergangenen Zeit.",
    author: "Thomas Carlyle",
  },
];

const INTERVAL_MS = 4000;

export function useBookQuote() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length),
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400); // fade-out duration before swapping text
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return { quote: QUOTES[index], visible };
}
