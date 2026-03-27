import Layout from "@/components/layout/Layout";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Download,
  Eye,
  EyeOff,
  FileCode,
  Hash,
  Info,
  Mail,
  RefreshCw,
  Server,
  Settings,
  User,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useMemo, useReducer, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FieldType = "text" | "number" | "boolean" | "select" | "password" | "json";

interface SelectOption {
  value: string;
  label: string;
}

interface ConfigField {
  key: string;
  label: string;
  description: string;
  hint?: string;
  type: FieldType;
  default: string;
  options?: SelectOption[];
  required?: boolean;
  advanced?: boolean;
  unit?: string;
}

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: ConfigField[];
  advanced?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config schema
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: "technical",
    title: "Technische Konfiguration",
    description: "Datenbankverbindung, Authentifizierung und Serverpfade",
    icon: Server,
    fields: [
      {
        key: "DATABASE_URL",
        label: "Datenbankpfad",
        description:
          "Pfad zur SQLite-Datenbankdatei. Relativ zum Anwendungsverzeichnis.",
        hint: "Beispiel: file:./database/dev.db — der Ordner muss existieren und beschreibbar sein.",
        type: "text",
        default: "file:./database/dev.db",
        required: true,
      },
      {
        key: "NEXTAUTH_URL",
        label: "Anwendungs-URL",
        description:
          "Vollständige URL der Anwendung, wie sie im Browser aufgerufen wird. Wird für Login-Weiterleitungen benötigt.",
        hint: "Für lokale Installation: http://localhost:3000. Mit nginx: https://bibliothek.schule.de",
        type: "text",
        default: "http://localhost:3000",
        required: true,
      },
      {
        key: "NEXTAUTH_SECRET",
        label: "Sicherheitsschlüssel (Secret)",
        description:
          "Zufälliger geheimer Schlüssel für die Verschlüsselung von Sessions und Tokens.",
        hint: "Mindestens 32 Zeichen. Einmal gesetzt nicht mehr ändern — alle Nutzer werden sonst ausgeloggt. Tipp: pwgen 32 1",
        type: "password",
        default: "",
        required: true,
      },
      {
        key: "AUTH_ENABLED",
        label: "Authentifizierung aktiviert",
        description:
          "Legt fest, ob ein Login erforderlich ist. Nur während der Einrichtung deaktivieren.",
        hint: "⚠️ Im Schulbetrieb immer auf true setzen!",
        type: "boolean",
        default: "true",
        required: true,
      },
      {
        key: "COVERIMAGE_FILESTORAGE_PATH",
        label: "Pfad für Cover-Bilder",
        description:
          "Verzeichnis, in dem hochgeladene Buchcover gespeichert werden.",
        hint: "In Docker: /app/images (im Container). Ohne Docker: z.B. ./images",
        type: "text",
        default: "/app/images",
      },
      {
        key: "LOGIN_SESSION_TIMEOUT",
        label: "Session-Timeout",
        description:
          "Zeit in Sekunden bis zur automatischen Abmeldung bei Inaktivität.",
        type: "number",
        default: "3600",
        unit: "Sekunden",
      },
      {
        key: "MAX_MIGRATION_SIZE",
        label: "Max. Import-Dateigröße",
        description:
          "Maximale Dateigröße für JSON-Importe (z.B. OpenBiblio-Migration).",
        type: "text",
        default: "250mb",
        advanced: true,
      },
      {
        key: "SECURITY_HEADERS",
        label: "Sicherheits-Header",
        description:
          "Steuert Content-Security-Policy-Header. Im Produktionsbetrieb leer lassen.",
        hint: 'Nur "insecure" setzen wenn CSP-Header deaktiviert werden sollen (nicht empfohlen).',
        type: "select",
        default: "",
        options: [
          { value: "", label: "Aktiv (Standard, empfohlen)" },
          { value: "insecure", label: "Deaktiviert (nur Entwicklung)" },
        ],
        advanced: true,
      },
      {
        key: "DELETE_SAFETY_SECONDS",
        label: "Lösch-Verzögerung",
        description:
          "Wartezeit in Sekunden bevor ein Buch/Nutzer endgültig gelöscht wird. Gibt Zeit zum Abbrechen.",
        type: "number",
        default: "5",
        unit: "Sekunden",
        advanced: true,
      },
      {
        key: "RENTAL_SORT_BOOKS",
        label: "Sortierung Ausleihansicht",
        description:
          "Standardmäßige Sortierreihenfolge der Bücher in der Ausleih-Ansicht.",
        type: "select",
        default: "title_asc",
        options: [
          { value: "title_asc", label: "Titel A–Z" },
          { value: "title_desc", label: "Titel Z–A" },
          { value: "id_asc", label: "ID aufsteigend" },
          { value: "id_desc", label: "ID absteigend" },
        ],
      },
      {
        key: "BARCODE_MINCODELENGTH",
        label: "Minimale Barcode-Länge",
        description:
          "Kürzere Barcodes werden mit Leerzeichen aufgefüllt bis diese Länge erreicht ist.",
        type: "number",
        default: "3",
        advanced: true,
      },
      {
        key: "ADMIN_BUTTON_SWITCH",
        label: "Admin-Schaltfläche anzeigen",
        description: "Zeigt den Backup-Button in der Navigationsleiste an.",
        type: "select",
        default: "1",
        options: [
          { value: "1", label: "Anzeigen" },
          { value: "0", label: "Ausblenden" },
        ],
        advanced: true,
      },
      {
        key: "NUMBER_BOOKS_OVERVIEW",
        label: "Bücher pro Seite",
        description: "Anzahl der Bücher pro Seite in der Übersichtsliste.",
        type: "number",
        default: "20",
      },
      {
        key: "NUMBER_BOOKS_MAX",
        label: "Maximale Buchanzahl",
        description:
          "Erwartete maximale Anzahl Bücher in der Bibliothek. Beeinflusst Suche und Paginierung.",
        type: "number",
        default: "10000",
        advanced: true,
      },
    ],
  },
  {
    id: "school",
    title: "Schulkonfiguration",
    description: "Name, Logo, Ausleihfristen und Etiketten",
    icon: BookOpen,
    fields: [
      {
        key: "SCHOOL_NAME",
        label: "Schulname",
        description:
          "Vollständiger Name der Schule — wird in der Oberfläche, auf Ausweisen, Etiketten und in Berichten angezeigt.",
        hint: 'Beispiel: "Grundschule Mammolshain"',
        type: "text",
        default: "Mustermann Schule",
        required: true,
      },
      {
        key: "LOGO_LABEL",
        label: "Schul-Logo (Dateiname)",
        description:
          "Dateiname des Schullogos im public/-Verzeichnis. Wird auf Benutzerausweisen und in der UI verwendet.",
        hint: "Datei muss in /public liegen (Bare Metal) oder in database/custom/ (Docker).",
        type: "text",
        default: "schullogo.jpg",
      },
      {
        key: "RENTAL_DURATION_DAYS",
        label: "Leihfrist",
        description:
          "Standardmäßige Ausleihdauer in Tagen ab dem Ausleihzeitpunkt.",
        type: "number",
        default: "14",
        unit: "Tage",
        required: true,
      },
      {
        key: "EXTENSION_DURATION_DAYS",
        label: "Verlängerungsdauer",
        description:
          "Anzahl der Tage, um die eine Ausleihe verlängert werden kann.",
        type: "number",
        default: "21",
        unit: "Tage",
      },
      {
        key: "MAX_EXTENSIONS",
        label: "Maximale Verlängerungen",
        description: "Wie oft ein Buch maximal verlängert werden darf.",
        type: "number",
        default: "2",
      },
      {
        key: "LABEL_CONFIG_DIR",
        label: "Etiketten-Konfigurationsverzeichnis",
        description:
          "Verzeichnis für Etikettenbögen (sheets/) und Vorlagen (templates/). Etikettenbögen und Vorlagen werden als JSON-Dateien in Unterordnern gespeichert.",
        hint: "Standard: ./database/custom/labels — in Docker wird database/custom/ als Volume gemountet, sodass eigene Konfigurationen bei Updates erhalten bleiben.",
        type: "text",
        default: "./database/custom/labels",
        advanced: true,
      },
    ],
  },
  {
    id: "reminder",
    title: "Mahnwesen",
    description: "Einstellungen für automatische Mahnschreiben",
    icon: Mail,
    fields: [
      {
        key: "REMINDER_TEMPLATE_DOC",
        label: "Mahnungs-Vorlage",
        description: "Dateiname der Word-Vorlage (.docx) für Mahnschreiben.",
        hint: "Datei muss in database/custom/ (Docker) oder im Anwendungsverzeichnis liegen.",
        type: "text",
        default: "mahnung-template.docx",
      },
      {
        key: "REMINDER_RESPONSIBLE_NAME",
        label: "Verantwortliche Stelle",
        description:
          "Name der verantwortlichen Person oder Abteilung, der in Mahnschreiben erscheint.",
        type: "text",
        default: "Schulbücherei",
      },
      {
        key: "REMINDER_RESPONSIBLE_EMAIL",
        label: "Kontakt-E-Mail",
        description:
          "E-Mail-Adresse die in Mahnschreiben als Rückfrage-Kontakt angegeben wird.",
        type: "text",
        default: "info@email.de",
      },
      {
        key: "REMINDER_RENEWAL_COUNT",
        label: "Maximale Mahnungswiederholungen",
        description:
          "Wie oft eine Mahnung verlängert werden kann, bevor eine Eskalation erfolgt.",
        type: "number",
        default: "5",
      },
    ],
  },
  {
    id: "userlabels",
    title: "Benutzerausweise",
    description: "Layout und Inhalt der gedruckten Schülerausweise",
    icon: User,
    advanced: true,
    fields: [
      {
        key: "USERID_LABEL_IMAGE",
        label: "Hintergrundbild",
        description:
          "Dateiname des Hintergrundbilds für Benutzerausweise. In database/custom/ (Docker) oder public/ (Bare Metal).",
        type: "text",
        default: "userlabeltemplate.jpg",
      },
      {
        key: "USERLABEL_WIDTH",
        label: "Ausweis-Breite",
        description:
          "Breite eines Benutzerausweises in CSS-Einheiten. Beeinflusst die Darstellung im Browser.",
        hint: "Typische Werte: 42vw, 9cm, 400px",
        type: "text",
        default: "42vw",
      },
      {
        key: "USERLABEL_PER_PAGE",
        label: "Ausweise pro Seite",
        description: "Anzahl der Benutzerausweise pro Druckseite.",
        type: "number",
        default: "6",
      },
      {
        key: "USERLABEL_SEPARATE_COLORBAR",
        label: "Farbbalken",
        description:
          'Optionaler Farbbalken unter dem Bild. Format: [Breite, Höhe, "Farbe"]',
        hint: "CSS-Farbnamen oder Hex-Werte, z.B. lightgreen, #4caf50",
        type: "json",
        default: '[250,70,"lightgreen"]',
      },
      {
        key: "USERLABEL_LINE_1",
        label: "Textzeile 1",
        description:
          'Erste Textzeile auf dem Ausweis. Format: ["Inhalt","top","left","Breite","margin","Farbe",Schriftgröße]',
        hint: "Platzhalter: User.firstName, User.lastName, User.schoolGrade",
        type: "json",
        default:
          '["User.firstName User.lastName","75%","3%","35vw","2pt","black",14]',
      },
      {
        key: "USERLABEL_LINE_2",
        label: "Textzeile 2",
        description:
          "Zweite Textzeile auf dem Ausweis (gleiche Syntax wie Zeile 1).",
        type: "json",
        default: '["Mustermann Schule","83%","3%","35vw","2pt","black",10]',
      },
      {
        key: "USERLABEL_LINE_3",
        label: "Textzeile 3",
        description:
          "Dritte Textzeile auf dem Ausweis (gleiche Syntax wie Zeile 1).",
        type: "json",
        default: '["User.schoolGrade","90%","3%","35vw","2pt","black",12]',
      },
      {
        key: "USERLABEL_BARCODE",
        label: "Barcode-Position",
        description:
          'Position und Größe des Barcodes auf dem Ausweis. Format: ["top","left","Breite","Höhe","Typ"]',
        type: "json",
        default: '["80%","63%","3cm","1.6cm","code128"]',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// State helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildDefaultValues(): Record<string, string> {
  const values: Record<string, string> = {};
  for (const section of CONFIG_SECTIONS) {
    for (const field of section.fields) {
      values[field.key] = field.default;
    }
  }
  return values;
}

type Action = { type: "SET"; key: string; value: string } | { type: "RESET" };

function valuesReducer(
  state: Record<string, string>,
  action: Action,
): Record<string, string> {
  if (action.type === "SET") {
    return { ...state, [action.key]: action.value };
  }
  if (action.type === "RESET") {
    return buildDefaultValues();
  }
  return state;
}

// ─────────────────────────────────────────────────────────────────────────────
// .env generator
// ─────────────────────────────────────────────────────────────────────────────

function generateEnvContent(values: Record<string, string>): string {
  const lines: string[] = [];

  const sectionHeaders: Record<string, string> = {
    technical: "🔧 TECHNISCHE KONFIGURATION",
    school: "🏫 SCHULKONFIGURATION",
    reminder: "📧 MAHNWESEN",
    userlabels: "🆔 BENUTZERAUSWEISE",
  };

  for (const section of CONFIG_SECTIONS) {
    lines.push(
      "#############################################",
      `# ${sectionHeaders[section.id]}`,
      "#############################################",
      "",
    );
    for (const field of section.fields) {
      const val = values[field.key] ?? field.default;
      // Add a short comment for each field
      lines.push(`# ${field.label}`);
      // Quote strings that contain spaces but not booleans/numbers/json
      const needsQuotes =
        field.type === "text" &&
        val.includes(" ") &&
        !val.startsWith('"') &&
        !val.startsWith("[");
      lines.push(`${field.key}=${needsQuotes ? `"${val}"` : val}`);
      lines.push("");
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string;
  onChange: (val: string) => void;
}) {
  const base =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow font-mono placeholder:font-sans placeholder:text-muted-foreground";

  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={value === "true"}
          onClick={() => onChange(value === "true" ? "false" : "true")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            value === "true" ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              value === "true" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-mono text-foreground">
          {value === "true" ? "true" : "false"}
        </span>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      >
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "password") {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateSecret = () => {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const secret = Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      onChange(secret);
      setVisible(true);
    };

    const copyToClipboard = async () => {
      if (!value) return;
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={visible ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Zufälligen Wert eingeben oder generieren..."
              className={`${base} pr-9`}
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              title={visible ? "Verbergen" : "Anzeigen"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {visible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!value}
            title="In Zwischenablage kopieren"
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              copied
                ? "border-success/50 text-success bg-success/10"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Kopiert!
              </>
            ) : (
              <>
                <ClipboardCopy className="w-3.5 h-3.5" />
                Kopieren
              </>
            )}
          </button>
          <button
            type="button"
            onClick={generateSecret}
            title="Sicheren Zufallswert erzeugen"
            className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generieren
          </button>
        </div>
        {value && (
          <p className="text-[11px] text-success flex items-center gap-1">
            ✓ {value.length} Zeichen — stark genug
          </p>
        )}
      </div>
    );
  }

  if (field.type === "json") {
    return (
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} resize-y`}
        spellCheck={false}
      />
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type={field.type === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} flex-1`}
      />
      {field.unit && (
        <span className="text-xs text-muted-foreground whitespace-nowrap font-sans">
          {field.unit}
        </span>
      )}
    </div>
  );
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string;
  onChange: (key: string, val: string) => void;
}) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="py-4 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-3 items-start border-b border-border/60 last:border-0">
      {/* Label + description */}
      <div className="space-y-1 pr-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-foreground">
            {field.label}
            {field.required && (
              <span className="ml-1 text-destructive text-xs">*</span>
            )}
          </label>
          {field.hint && (
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Hinweis anzeigen"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {field.description}
        </p>
        {showHint && field.hint && (
          <div className="mt-2 rounded-md bg-info/10 border border-info/20 px-3 py-2">
            <p className="text-xs text-foreground/80 leading-relaxed">
              💡 {field.hint}
            </p>
          </div>
        )}
        <code className="text-[10px] font-mono text-muted-foreground/70 bg-muted/50 px-1 py-0.5 rounded">
          {field.key}
        </code>
      </div>

      {/* Input */}
      <div>
        <FieldInput
          field={field}
          value={value}
          onChange={(val) => onChange(field.key, val)}
        />
      </div>
    </div>
  );
}

function SectionCard({
  section,
  values,
  onFieldChange,
}: {
  section: ConfigSection;
  values: Record<string, string>;
  onFieldChange: (key: string, val: string) => void;
}) {
  const [open, setOpen] = useState(!section.advanced);
  const SectionIcon = section.icon;

  const visibleFields = section.fields.filter((f) => !f.advanced);
  const advancedFields = section.fields.filter((f) => f.advanced);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Section header — always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <SectionIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              {section.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {section.description}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-4 pt-2 bg-card">
          {/* Required / standard fields */}
          {visibleFields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              value={values[field.key] ?? field.default}
              onChange={onFieldChange}
            />
          ))}

          {/* Advanced toggle */}
          {advancedFields.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {showAdvanced ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                {showAdvanced
                  ? "Erweiterte Einstellungen ausblenden"
                  : `${advancedFields.length} erweiterte Einstellung${advancedFields.length > 1 ? "en" : ""} anzeigen`}
              </button>

              {showAdvanced &&
                advancedFields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={values[field.key] ?? field.default}
                    onChange={onFieldChange}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const [values, dispatch] = useReducer(
    valuesReducer,
    null,
    buildDefaultValues,
  );
  const [copied, setCopied] = useState(false);

  const handleChange = useCallback((key: string, val: string) => {
    dispatch({ type: "SET", key, value: val });
  }, []);

  const envContent = useMemo(() => generateEnvContent(values), [values]);

  const handleDownload = () => {
    const blob = new Blob([envContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <Head>
        <title>Konfiguration | OpenLibry</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            title="Zurück zur Administration"
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Konfiguration
            </h1>
            <p className="text-sm text-muted-foreground">
              Einstellungen für die .env-Datei zusammenstellen und herunterladen
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Wie diese Seite funktioniert
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hier kannst du eine{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">.env</code>
              -Datei zusammenstellen. Alle Eingaben bleiben lokal im Browser —
              es wird <strong>nichts gespeichert oder gesendet</strong>. Lade
              die fertige Datei herunter und lege sie im OpenLibry-Verzeichnis
              ab. Danach OpenLibry neu starten.
            </p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-mono">
              <span>Bare Metal: pm2 restart openlibry</span>
              <span>Docker: docker restart openlibry</span>
            </div>
          </div>
        </div>

        {/* Section cards */}
        <div className="space-y-3">
          {CONFIG_SECTIONS.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              values={values}
              onFieldChange={handleChange}
            />
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Vorschau: .env
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
              {copied ? "Kopiert!" : "In Zwischenablage"}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
            {envContent}
          </pre>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/90 backdrop-blur border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground hidden sm:block">
            <Hash className="w-3.5 h-3.5 inline mr-1" />
            {Object.keys(values).length} Variablen konfiguriert
          </p>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => dispatch({ type: "RESET" })}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors border border-border"
            >
              Zurücksetzen
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              .env herunterladen
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
