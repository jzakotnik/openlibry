import Layout from "@/components/layout/Layout";
import { useMemo, useState } from "react";

import { AuditType } from "@/entities/AuditType";
import { getAllAudit } from "@/entities/audit";
import { prisma } from "@/entities/db";
import { convertDateToTimeString } from "@/lib/utils/dateutils";

import {
  BookOpen,
  CirclePlus,
  ClipboardCheck,
  History,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  UserRound,
  UserX,
} from "lucide-react";

interface AuditPropsType {
  audits: Array<AuditType>;
}

interface ParsedAudit {
  id: number;
  timestamp: string;
  eventType: string;
  sentence: string;
  icon: React.ReactNode;
  color: string;
}

function parseEventContent(
  eventType: string,
  eventContent: string,
): { sentence: string; details: Record<string, string> } {
  const details: Record<string, string> = {};

  const userIdMatch = eventContent.match(/User id:\s*(\d+)/i);
  const bookIdMatch =
    eventContent.match(/Book id:\s*(\d+)/i) ||
    eventContent.match(/book id\s*(\d+)/i);
  const bookTitleMatch =
    eventContent.match(/book title:\s*(.+?)(?:,|$)/i) ||
    eventContent.match(/,\s*(.+)$/);

  if (userIdMatch) details.userId = userIdMatch[1];
  if (bookIdMatch) details.bookId = bookIdMatch[1];
  if (bookTitleMatch) details.bookTitle = bookTitleMatch[1].trim();

  if (/^\d+$/.test(eventContent.trim())) {
    details.bookId = eventContent.trim();
  }

  const simpleBookPattern = eventContent.match(/book id\s*(\d+),?\s*(.+)?/i);
  if (simpleBookPattern) {
    details.bookId = simpleBookPattern[1];
    if (simpleBookPattern[2]) details.bookTitle = simpleBookPattern[2].trim();
  }

  let sentence = "";

  switch (eventType.toLowerCase()) {
    case "rent book":
      if (details.bookTitle && details.userId) {
        sentence = `Buch "${details.bookTitle}" wurde an Benutzer #${details.userId} ausgeliehen`;
      } else if (details.bookTitle) {
        sentence = `Buch "${details.bookTitle}" wurde ausgeliehen`;
      } else {
        sentence = `Buch #${details.bookId || "?"} wurde ausgeliehen`;
      }
      break;

    case "return book":
      if (details.bookTitle) {
        sentence = `Buch "${details.bookTitle}" wurde zurückgegeben`;
      } else {
        sentence = `Buch #${details.bookId || "?"} wurde zurückgegeben`;
      }
      break;

    case "extend book":
      if (details.bookTitle) {
        sentence = `Ausleihe von "${details.bookTitle}" wurde verlängert`;
      } else {
        sentence = `Ausleihe von Buch #${
          details.bookId || "?"
        } wurde verlängert`;
      }
      break;

    case "add book":
      sentence = `Neues Buch "${eventContent}" wurde hinzugefügt`;
      break;

    case "update book":
      if (details.bookTitle) {
        sentence = `Buch "${details.bookTitle}" wurde aktualisiert`;
      } else {
        sentence = `Buch #${details.bookId || eventContent} wurde aktualisiert`;
      }
      break;

    case "delete book":
      sentence = `Buch #${eventContent} wurde gelöscht`;
      break;

    case "add user": {
      const userNameMatch = eventContent.match(/^\d+,\s*(.+)$/);
      if (userNameMatch) {
        sentence = `Neuer Benutzer "${userNameMatch[1]}" wurde angelegt`;
      } else {
        sentence = `Neuer Benutzer wurde angelegt`;
      }
      break;
    }

    case "update user": {
      const userNameMatch = eventContent.match(/^\d+,\s*(.+)$/);
      if (userNameMatch) {
        sentence = `Benutzer "${userNameMatch[1]}" wurde aktualisiert`;
      } else {
        sentence = `Benutzer #${eventContent} wurde aktualisiert`;
      }
      break;
    }

    case "delete user":
      sentence = `Benutzer #${eventContent} wurde gelöscht`;
      break;

    case "disable user":
      sentence = `Benutzer #${eventContent} wurde deaktiviert`;
      break;

    case "enable user":
      sentence = `Benutzer #${eventContent} wurde aktiviert`;
      break;

    default:
      sentence = `${eventType}: ${eventContent}`;
  }

  return { sentence, details };
}

function getEventIcon(eventType: string): {
  icon: React.ReactNode;
  color: string;
} {
  const size = 20;
  switch (eventType.toLowerCase()) {
    case "rent book":
      return { icon: <BookOpen size={size} />, color: "text-blue-600" };
    case "return book":
      return { icon: <ClipboardCheck size={size} />, color: "text-green-700" };
    case "extend book":
      return { icon: <RefreshCw size={size} />, color: "text-orange-500" };
    case "add book":
      return { icon: <CirclePlus size={size} />, color: "text-purple-600" };
    case "update book":
      return { icon: <Pencil size={size} />, color: "text-sky-600" };
    case "delete book":
      return { icon: <Trash2 size={size} />, color: "text-red-600" };
    case "add user":
      return { icon: <UserPlus size={size} />, color: "text-purple-600" };
    case "update user":
      return { icon: <UserRound size={size} />, color: "text-sky-600" };
    case "delete user":
      return { icon: <UserMinus size={size} />, color: "text-red-600" };
    case "disable user":
      return { icon: <UserX size={size} />, color: "text-orange-600" };
    case "enable user":
      return { icon: <UserCheck size={size} />, color: "text-green-600" };
    default:
      return { icon: <History size={size} />, color: "text-gray-500" };
  }
}

export default function Audit({ audits }: AuditPropsType) {
  const [searchQuery, setSearchQuery] = useState("");

  const parsedAudits = useMemo((): ParsedAudit[] => {
    return audits.map((audit) => {
      const { sentence } = parseEventContent(
        audit.eventType,
        audit.eventContent,
      );
      const { icon, color } = getEventIcon(audit.eventType);

      return {
        id: audit.id!,
        timestamp: audit.createdAt || "",
        eventType: audit.eventType,
        sentence,
        icon,
        color,
      };
    });
  }, [audits]);

  const filteredAudits = useMemo(() => {
    if (!searchQuery.trim()) return parsedAudits;

    const query = searchQuery.toLowerCase();
    return parsedAudits.filter(
      (audit) =>
        audit.sentence.toLowerCase().includes(query) ||
        audit.eventType.toLowerCase().includes(query) ||
        audit.timestamp.toLowerCase().includes(query),
    );
  }, [parsedAudits, searchQuery]);

  return (
    <Layout>
      <div className="w-full mt-3 px-2">
        {/* Search bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Suche nach Büchern, Aktionen oder Datum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2.5
                rounded-lg border border-gray-200
                text-sm placeholder:text-muted-foreground/60
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-colors
              "
            />
          </div>
        </div>

        {/* Audit list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-h-[70vh] overflow-auto">
          {filteredAudits.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {filteredAudits.map((audit) => (
                <li
                  key={audit.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors"
                >
                  <span className={`shrink-0 ${audit.color}`}>
                    {audit.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900">{audit.sentence}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {audit.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Keine Ergebnisse gefunden"
                  : "Keine Aktivitäten verfügbar"}
              </p>
            </div>
          )}
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {filteredAudits.length} von {parsedAudits.length} Einträgen
        </p>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allAudits = await getAllAudit(prisma);

  const audits = allAudits.map((a: AuditType) => {
    const newAudit = { ...a } as any;
    newAudit.createdAt = convertDateToTimeString(a.createdAt);
    newAudit.updatedAt = convertDateToTimeString(a.updatedAt);
    return newAudit;
  });

  return { props: { audits } };
}
