import Layout from "@/components/layout/Layout";
import { t } from "@/lib/i18n";
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
// Translation helpers
//
// Built once at module load — locale is fixed per deployment, so this is safe
// and avoids re-evaluating t() on every render. Same pattern as
// renewalCountOptions in BookSelect.tsx and errorMessages in error.tsx.
// ─────────────────────────────────────────────────────────────────────────────

const tf = (sectionId: string, fieldKey: string, leaf: string): string =>
  t(`admin.sections.${sectionId}.fields.${fieldKey}.${leaf}`);

// ─────────────────────────────────────────────────────────────────────────────
// Config schema
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: "technical",
    title: t("admin.sections.technical.title"),
    description: t("admin.sections.technical.description"),
    icon: Server,
    fields: [
      {
        key: "DATABASE_URL",
        label: tf("technical", "DATABASE_URL", "label"),
        description: tf("technical", "DATABASE_URL", "description"),
        hint: tf("technical", "DATABASE_URL", "hint"),
        type: "text",
        default: "file:./database/dev.db",
        required: true,
      },
      {
        key: "NEXTAUTH_URL",
        label: tf("technical", "NEXTAUTH_URL", "label"),
        description: tf("technical", "NEXTAUTH_URL", "description"),
        hint: tf("technical", "NEXTAUTH_URL", "hint"),
        type: "text",
        default: "http://localhost:3000",
        required: true,
      },
      {
        key: "NEXTAUTH_SECRET",
        label: tf("technical", "NEXTAUTH_SECRET", "label"),
        description: tf("technical", "NEXTAUTH_SECRET", "description"),
        hint: tf("technical", "NEXTAUTH_SECRET", "hint"),
        type: "password",
        default: "",
        required: true,
      },
      {
        key: "AUTH_ENABLED",
        label: tf("technical", "AUTH_ENABLED", "label"),
        description: tf("technical", "AUTH_ENABLED", "description"),
        hint: tf("technical", "AUTH_ENABLED", "hint"),
        type: "boolean",
        default: "true",
        required: true,
      },
      {
        key: "COVERIMAGE_FILESTORAGE_PATH",
        label: tf("technical", "COVERIMAGE_FILESTORAGE_PATH", "label"),
        description: tf("technical", "COVERIMAGE_FILESTORAGE_PATH", "description"),
        hint: tf("technical", "COVERIMAGE_FILESTORAGE_PATH", "hint"),
        type: "text",
        default: "/app/images",
      },
      {
        key: "LOGIN_SESSION_TIMEOUT",
        label: tf("technical", "LOGIN_SESSION_TIMEOUT", "label"),
        description: tf("technical", "LOGIN_SESSION_TIMEOUT", "description"),
        type: "number",
        default: "3600",
        unit: t("admin.units.seconds"),
      },
      {
        key: "MAX_MIGRATION_SIZE",
        label: tf("technical", "MAX_MIGRATION_SIZE", "label"),
        description: tf("technical", "MAX_MIGRATION_SIZE", "description"),
        type: "text",
        default: "250mb",
        advanced: true,
      },
      {
        key: "SECURITY_HEADERS",
        label: tf("technical", "SECURITY_HEADERS", "label"),
        description: tf("technical", "SECURITY_HEADERS", "description"),
        hint: tf("technical", "SECURITY_HEADERS", "hint"),
        type: "select",
        default: "",
        options: [
          {
            value: "",
            label: t(
              "admin.sections.technical.fields.SECURITY_HEADERS.options.active",
            ),
          },
          {
            value: "insecure",
            label: t(
              "admin.sections.technical.fields.SECURITY_HEADERS.options.insecure",
            ),
          },
        ],
        advanced: true,
      },
      {
        key: "DELETE_SAFETY_SECONDS",
        label: tf("technical", "DELETE_SAFETY_SECONDS", "label"),
        description: tf("technical", "DELETE_SAFETY_SECONDS", "description"),
        type: "number",
        default: "5",
        unit: t("admin.units.seconds"),
        advanced: true,
      },
      {
        key: "RENTAL_SORT_BOOKS",
        label: tf("technical", "RENTAL_SORT_BOOKS", "label"),
        description: tf("technical", "RENTAL_SORT_BOOKS", "description"),
        type: "select",
        default: "title_asc",
        options: [
          {
            value: "title_asc",
            label: t(
              "admin.sections.technical.fields.RENTAL_SORT_BOOKS.options.title_asc",
            ),
          },
          {
            value: "title_desc",
            label: t(
              "admin.sections.technical.fields.RENTAL_SORT_BOOKS.options.title_desc",
            ),
          },
          {
            value: "id_asc",
            label: t(
              "admin.sections.technical.fields.RENTAL_SORT_BOOKS.options.id_asc",
            ),
          },
          {
            value: "id_desc",
            label: t(
              "admin.sections.technical.fields.RENTAL_SORT_BOOKS.options.id_desc",
            ),
          },
        ],
      },
      {
        key: "BARCODE_MINCODELENGTH",
        label: tf("technical", "BARCODE_MINCODELENGTH", "label"),
        description: tf("technical", "BARCODE_MINCODELENGTH", "description"),
        type: "number",
        default: "3",
        advanced: true,
      },
      {
        key: "ADMIN_BUTTON_SWITCH",
        label: tf("technical", "ADMIN_BUTTON_SWITCH", "label"),
        description: tf("technical", "ADMIN_BUTTON_SWITCH", "description"),
        type: "select",
        default: "1",
        options: [
          {
            value: "1",
            label: t(
              "admin.sections.technical.fields.ADMIN_BUTTON_SWITCH.options.show",
            ),
          },
          {
            value: "0",
            label: t(
              "admin.sections.technical.fields.ADMIN_BUTTON_SWITCH.options.hide",
            ),
          },
        ],
        advanced: true,
      },
      {
        key: "NUMBER_BOOKS_OVERVIEW",
        label: tf("technical", "NUMBER_BOOKS_OVERVIEW", "label"),
        description: tf("technical", "NUMBER_BOOKS_OVERVIEW", "description"),
        type: "number",
        default: "20",
      },
      {
        key: "NUMBER_BOOKS_MAX",
        label: tf("technical", "NUMBER_BOOKS_MAX", "label"),
        description: tf("technical", "NUMBER_BOOKS_MAX", "description"),
        type: "number",
        default: "10000",
        advanced: true,
      },
    ],
  },
  {
    id: "school",
    title: t("admin.sections.school.title"),
    description: t("admin.sections.school.description"),
    icon: BookOpen,
    fields: [
      {
        key: "SCHOOL_NAME",
        label: tf("school", "SCHOOL_NAME", "label"),
        description: tf("school", "SCHOOL_NAME", "description"),
        hint: tf("school", "SCHOOL_NAME", "hint"),
        type: "text",
        default: t("admin.placeholders.schoolName"),
        required: true,
      },
      {
        key: "LOGO_LABEL",
        label: tf("school", "LOGO_LABEL", "label"),
        description: tf("school", "LOGO_LABEL", "description"),
        hint: tf("school", "LOGO_LABEL", "hint"),
        type: "text",
        default: "schullogo.jpg",
      },
      {
        key: "RENTAL_DURATION_DAYS",
        label: tf("school", "RENTAL_DURATION_DAYS", "label"),
        description: tf("school", "RENTAL_DURATION_DAYS", "description"),
        type: "number",
        default: "14",
        unit: t("admin.units.days"),
        required: true,
      },
      {
        key: "EXTENSION_DURATION_DAYS",
        label: tf("school", "EXTENSION_DURATION_DAYS", "label"),
        description: tf("school", "EXTENSION_DURATION_DAYS", "description"),
        type: "number",
        default: "21",
        unit: t("admin.units.days"),
      },
      {
        key: "MAX_EXTENSIONS",
        label: tf("school", "MAX_EXTENSIONS", "label"),
        description: tf("school", "MAX_EXTENSIONS", "description"),
        type: "number",
        default: "2",
      },
      {
        key: "LABEL_CONFIG_DIR",
        label: tf("school", "LABEL_CONFIG_DIR", "label"),
        description: tf("school", "LABEL_CONFIG_DIR", "description"),
        hint: tf("school", "LABEL_CONFIG_DIR", "hint"),
        type: "text",
        default: "./database/custom/labels",
        advanced: true,
      },
    ],
  },
  {
    id: "reminder",
    title: t("admin.sections.reminder.title"),
    description: t("admin.sections.reminder.description"),
    icon: Mail,
    fields: [
      {
        key: "REMINDER_TEMPLATE_DOC",
        label: tf("reminder", "REMINDER_TEMPLATE_DOC", "label"),
        description: tf("reminder", "REMINDER_TEMPLATE_DOC", "description"),
        hint: tf("reminder", "REMINDER_TEMPLATE_DOC", "hint"),
        type: "text",
        default: "mahnung-template.docx",
      },
      {
        key: "REMINDER_RESPONSIBLE_NAME",
        label: tf("reminder", "REMINDER_RESPONSIBLE_NAME", "label"),
        description: tf("reminder", "REMINDER_RESPONSIBLE_NAME", "description"),
        type: "text",
        default: t("admin.placeholders.reminderName"),
      },
      {
        key: "REMINDER_RESPONSIBLE_EMAIL",
        label: tf("reminder", "REMINDER_RESPONSIBLE_EMAIL", "label"),
        description: tf("reminder", "REMINDER_RESPONSIBLE_EMAIL", "description"),
        type: "text",
        default: "info@email.de",
      },
      {
        key: "REMINDER_RENEWAL_COUNT",
        label: tf("reminder", "REMINDER_RENEWAL_COUNT", "label"),
        description: tf("reminder", "REMINDER_RENEWAL_COUNT", "description"),
        type: "number",
        default: "5",
      },
    ],
  },
  {
    id: "userlabels",
    title: t("admin.sections.userlabels.title"),
    description: t("admin.sections.userlabels.description"),
    icon: User,
    advanced: true,
    fields: [
      {
        key: "USERID_LABEL_IMAGE",
        label: tf("userlabels", "USERID_LABEL_IMAGE", "label"),
        description: tf("userlabels", "USERID_LABEL_IMAGE", "description"),
        type: "text",
        default: "userlabeltemplate.jpg",
      },
      {
        key: "USERLABEL_WIDTH",
        label: tf("userlabels", "USERLABEL_WIDTH", "label"),
        description: tf("userlabels", "USERLABEL_WIDTH", "description"),
        hint: tf("userlabels", "USERLABEL_WIDTH", "hint"),
        type: "text",
        default: "42vw",
      },
      {
        key: "USERLABEL_PER_PAGE",
        label: tf("userlabels", "USERLABEL_PER_PAGE", "label"),
        description: tf("userlabels", "USERLABEL_PER_PAGE", "description"),
        type: "number",
        default: "6",
      },
      {
        key: "USERLABEL_SEPARATE_COLORBAR",
        label: tf("userlabels", "USERLABEL_SEPARATE_COLORBAR", "label"),
        description: tf("userlabels", "USERLABEL_SEPARATE_COLORBAR", "description"),
        hint: tf("userlabels", "USERLABEL_SEPARATE_COLORBAR", "hint"),
        type: "json",
        default: '[250,70,"lightgreen"]',
      },
      {
        key: "USERLABEL_LINE_1",
        label: tf("userlabels", "USERLABEL_LINE_1", "label"),
        description: tf("userlabels", "USERLABEL_LINE_1", "description"),
        hint: tf("userlabels", "USERLABEL_LINE_1", "hint"),
        type: "json",
        default:
          '["User.firstName User.lastName","75%","3%","35vw","2pt","black",14]',
      },
      {
        key: "USERLABEL_LINE_2",
        label: tf("userlabels", "USERLABEL_LINE_2", "label"),
        description: tf("userlabels", "USERLABEL_LINE_2", "description"),
        type: "json",
        default: '["Mustermann Schule","83%","3%","35vw","2pt","black",10]',
      },
      {
        key: "USERLABEL_LINE_3",
        label: tf("userlabels", "USERLABEL_LINE_3", "label"),
        description: tf("userlabels", "USERLABEL_LINE_3", "description"),
        type: "json",
        default: '["User.schoolGrade","90%","3%","35vw","2pt","black",12]',
      },
      {
        key: "USERLABEL_BARCODE",
        label: tf("userlabels", "USERLABEL_BARCODE", "label"),
        description: tf("userlabels", "USERLABEL_BARCODE", "description"),
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
    technical: t("admin.envHeaders.technical"),
    school: t("admin.envHeaders.school"),
    reminder: t("admin.envHeaders.reminder"),
    userlabels: t("admin.envHeaders.userlabels"),
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
              placeholder={t("admin.passwordField.placeholder")}
              className={`${base} pr-9`}
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              title={
                visible
                  ? t("admin.passwordField.hide")
                  : t("admin.passwordField.show")
              }
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
            title={t("admin.passwordField.copyTitle")}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              copied
                ? "border-success/50 text-success bg-success/10"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                {t("admin.passwordField.copied")}
              </>
            ) : (
              <>
                <ClipboardCopy className="w-3.5 h-3.5" />
                {t("admin.passwordField.copy")}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={generateSecret}
            title={t("admin.passwordField.generateTitle")}
            className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t("admin.passwordField.generate")}
          </button>
        </div>
        {value && (
          <p className="text-[11px] text-success flex items-center gap-1">
            {t("admin.passwordField.strength", { chars: value.length })}
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
              title={t("admin.sectionCard.hintTooltip")}
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
                  ? t("admin.sectionCard.hideAdvanced")
                  : advancedFields.length === 1
                    ? t("admin.sectionCard.showAdvancedSingular", {
                        n: advancedFields.length,
                      })
                    : t("admin.sectionCard.showAdvancedPlural", {
                        n: advancedFields.length,
                      })}
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
        <title>{t("admin.pageTitle")}</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            title={t("admin.backToAdmin")}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              {t("admin.heading")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.subheading")}
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {t("admin.infoBanner.title")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("admin.infoBanner.bodyP1")}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                {t("admin.infoBanner.bodyCode")}
              </code>
              {t("admin.infoBanner.bodyP2")}
              <strong>{t("admin.infoBanner.bodyStrong")}</strong>
              {t("admin.infoBanner.bodyP3")}
            </p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-mono">
              <span>{t("admin.infoBanner.bareMetalCmd")}</span>
              <span>{t("admin.infoBanner.dockerCmd")}</span>
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
                {t("admin.preview.title")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
              {copied
                ? t("admin.preview.copyDone")
                : t("admin.preview.copyAction")}
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
            {t("admin.stickyBar.varCount", {
              count: Object.keys(values).length,
            })}
          </p>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => dispatch({ type: "RESET" })}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors border border-border"
            >
              {t("admin.stickyBar.reset")}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              {t("admin.stickyBar.download")}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
