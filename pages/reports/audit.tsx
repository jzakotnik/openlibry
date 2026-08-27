import Layout from "@/components/layout/Layout";
import { t } from "@/lib/i18n";
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
  const userNameMatch = eventContent.match(
    /User id:\s*\d+\s+(.+?),\s*Book id/i,
  );
  if (userNameMatch) details.userName = userNameMatch[1].trim();

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

  // Fallback for missing book id
  const unknownId = t("reportAuditPage.sentenceUnknownIdMissing");

  let sentence = "";

  switch (eventType.toLowerCase()) {
    case "rent book":
      if (details.bookTitle && details.userName) {
        sentence = t("reportAuditPage.sentenceRentBookFull", {
          bookTitle: details.bookTitle,
          userName: details.userName,
          userId: details.userId,
        });
      } else if (details.bookTitle && details.userId) {
        sentence = t("reportAuditPage.sentenceRentBookUserId", {
          bookTitle: details.bookTitle,
          userId: details.userId,
        });
      } else if (details.bookTitle) {
        sentence = t("reportAuditPage.sentenceRentBookTitle", {
          bookTitle: details.bookTitle,
        });
      } else {
        sentence = t("reportAuditPage.sentenceRentBookId", {
          bookId: details.bookId || unknownId,
        });
      }
      break;

    case "return book":
      if (details.bookTitle) {
        sentence = t("reportAuditPage.sentenceReturnBookTitle", {
          bookTitle: details.bookTitle,
        });
      } else {
        sentence = t("reportAuditPage.sentenceReturnBookId", {
          bookId: details.bookId || unknownId,
        });
      }
      break;

    case "extend book":
      if (details.bookTitle) {
        sentence = t("reportAuditPage.sentenceExtendBookTitle", {
          bookTitle: details.bookTitle,
        });
      } else {
        sentence = t("reportAuditPage.sentenceExtendBookId", {
          bookId: details.bookId || unknownId,
        });
      }
      break;

    case "add book":
      sentence = t("reportAuditPage.sentenceAddBook", {
        bookTitle: eventContent,
      });
      break;

    case "update book":
      if (details.bookTitle) {
        sentence = t("reportAuditPage.sentenceUpdateBookTitle", {
          bookTitle: details.bookTitle,
        });
      } else {
        sentence = t("reportAuditPage.sentenceUpdateBookId", {
          bookId: details.bookId || eventContent,
        });
      }
      break;

    case "delete book":
      sentence = t("reportAuditPage.sentenceDeleteBook", {
        bookId: eventContent,
      });
      break;

    case "add user": {
      const userNameMatch = eventContent.match(/^\d+,\s*(.+)$/);
      if (userNameMatch) {
        sentence = t("reportAuditPage.sentenceAddUserNamed", {
          userName: userNameMatch[1],
        });
      } else {
        sentence = t("reportAuditPage.sentenceAddUserAnon");
      }
      break;
    }

    case "update user": {
      const userNameMatch = eventContent.match(/^\d+,\s*(.+)$/);
      if (userNameMatch) {
        sentence = t("reportAuditPage.sentenceUpdateUserNamed", {
          userName: userNameMatch[1],
        });
      } else {
        sentence = t("reportAuditPage.sentenceUpdateUserId", {
          userId: eventContent,
        });
      }
      break;
    }

    case "delete user":
      sentence = t("reportAuditPage.sentenceDeleteUser", {
        userId: eventContent,
      });
      break;

    case "disable user":
      sentence = t("reportAuditPage.sentenceDisableUser", {
        userId: eventContent,
      });
      break;

    case "enable user":
      sentence = t("reportAuditPage.sentenceEnableUser", {
        userId: eventContent,
      });
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
              placeholder={t("reportAuditPage.searchPlaceholder")}
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
                  ? t("reportAuditPage.emptySearch")
                  : t("reportAuditPage.emptyAll")}
              </p>
            </div>
          )}
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {t("reportAuditPage.countSuffix", {
            filtered: filteredAudits.length,
            total: parsedAudits.length,
          })}
        </p>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allAudits = await getAllAudit(prisma);

  const audits = allAudits.map((a: any) => {
    const newAudit = { ...a } as any;
    newAudit.createdAt = convertDateToTimeString(a.createdAt);
    newAudit.updatedAt = convertDateToTimeString(a.updatedAt);
    return newAudit;
  });

  return { props: { audits } };
}
