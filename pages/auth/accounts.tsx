import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Shield,
  Trash2,
  UserCog,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

import { t } from "@/lib/i18n";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminAccount {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Built once at module load — locale is fixed per deployment.
const strings = {
  pageTitle: t("accounts.pageTitle"),
  heading: t("accounts.heading"),
  subtitle: t("accounts.subtitle"),
  existingAccounts: t("accounts.existingAccounts"),
  newAccountSection: t("accounts.newAccountSection"),
  backToAdmin: t("accounts.backToAdmin"),
  loading: t("accounts.loading"),
  loadError: t("accounts.loadError"),
  lastAccountWarning: t("accounts.lastAccountWarning"),
  selfBadge: t("accounts.selfBadge"),
  deleteTitle: t("accounts.deleteTitle"),
  editTitle: t("accounts.editTitle"),
  confirmDeleteQuestion: t("accounts.confirmDeleteQuestion"),
  confirmDeleteYes: t("accounts.confirmDeleteYes"),
  confirmDeleteNo: t("accounts.confirmDeleteNo"),
  toastDeleteError: t("accounts.toastDeleteError"),
  edit: {
    labelUsername: t("accounts.editForm.labelUsername"),
    labelEmail: t("accounts.editForm.labelEmail"),
    labelPassword: t("accounts.editForm.labelPassword"),
    labelPasswordOptional: t("accounts.editForm.labelPasswordOptional"),
    labelPasswordConfirm: t("accounts.editForm.labelPasswordConfirm"),
    placeholderPassword: t("accounts.editForm.placeholderPassword"),
    passwordTooShort: t("accounts.editForm.passwordTooShort"),
    passwordMismatch: t("accounts.editForm.passwordMismatch"),
    cancel: t("accounts.editForm.cancel"),
    save: t("accounts.editForm.save"),
  },
  create: {
    toggleButton: t("accounts.createForm.toggleButton"),
    heading: t("accounts.createForm.heading"),
    labelUsername: t("accounts.createForm.labelUsername"),
    labelEmail: t("accounts.createForm.labelEmail"),
    labelPassword: t("accounts.createForm.labelPassword"),
    labelPasswordConfirm: t("accounts.createForm.labelPasswordConfirm"),
    passwordTooShort: t("accounts.createForm.passwordTooShort"),
    passwordMismatch: t("accounts.createForm.passwordMismatch"),
    cancel: t("accounts.createForm.cancel"),
    submit: t("accounts.createForm.submit"),
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${
        type === "success"
          ? "bg-green-50 border border-green-200 text-green-800"
          : "bg-red-50 border border-red-200 text-red-800"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
    </div>
  );
}

function EditForm({
  account,
  onSuccess,
  onCancel,
}: {
  account: AdminAccount;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState(account.username);
  const [email, setEmail] = useState(account.email);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;
  const passwordTooShort = password.length > 0 && password.length < 3;

  const canSubmit =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    !passwordMismatch &&
    !passwordTooShort;

  async function handleSubmit() {
    setError("");
    setIsLoading(true);

    const body: Record<string, string> = { username, email };
    if (password.length > 0) body.password = password;

    try {
      const res = await fetch(`/api/login/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? `HTTP ${res.status}`);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {strings.edit.labelUsername}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            data-cy="edit_username"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#12556F] focus:ring-2 focus:ring-[#12556F]/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {strings.edit.labelEmail}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-cy="edit_email"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#12556F] focus:ring-2 focus:ring-[#12556F]/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {strings.edit.labelPassword}{" "}
            <span className="text-gray-400 font-normal">
              {strings.edit.labelPasswordOptional}
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-cy="edit_password"
            placeholder={strings.edit.placeholderPassword}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none focus:ring-2 ${
              passwordTooShort
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-[#12556F] focus:ring-[#12556F]/20"
            }`}
          />
          {passwordTooShort && (
            <p className="mt-1 text-xs text-red-600">
              {strings.edit.passwordTooShort}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {strings.edit.labelPasswordConfirm}
          </label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            data-cy="edit_password_confirm"
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none focus:ring-2 ${
              passwordMismatch
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-[#12556F] focus:ring-[#12556F]/20"
            }`}
          />
          {passwordMismatch && (
            <p className="mt-1 text-xs text-red-600">
              {strings.edit.passwordMismatch}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onCancel}
          data-cy="edit_cancel"
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {strings.edit.cancel}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          data-cy="edit_save"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#12556F" }}
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {strings.edit.save}
        </button>
      </div>
    </div>
  );
}

function AccountRow({
  account,
  currentUsername,
  isOnly,
  onMutate,
  onToast,
}: {
  account: AdminAccount;
  currentUsername: string | null | undefined;
  isOnly: boolean;
  onMutate: () => void;
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelf = account.username === currentUsername;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/login/${account.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? `HTTP ${res.status}`);
      }
      onToast(
        t("accounts.toastDeleted", { username: account.username }),
        "success",
      );
      onMutate();
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : strings.toastDeleteError,
        "error",
      );
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      className="border border-gray-200 rounded-xl overflow-hidden"
      data-cy="account_row"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: "#12556F" }}
        >
          {account.username.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-medium text-gray-900 truncate"
              data-cy="account_username"
            >
              {account.username}
            </span>
            {isSelf && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#12556F]/10 text-[#12556F]">
                <Shield className="w-2.5 h-2.5" />
                {strings.selfBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{account.email}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Delete */}
          {!isSelf &&
            !isOnly &&
            (confirmDelete ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-600">
                  {strings.confirmDeleteQuestion}
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  data-cy="confirm_delete"
                  className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    strings.confirmDeleteYes
                  )}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  data-cy="cancel_delete"
                  className="px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  {strings.confirmDeleteNo}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                data-cy="delete_account"
                title={strings.deleteTitle}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ))}

          {/* Expand/Collapse edit */}
          <button
            onClick={() => {
              setExpanded((v) => !v);
              setConfirmDelete(false);
            }}
            data-cy="edit_account"
            title={strings.editTitle}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-[#12556F] hover:bg-[#12556F]/5 rounded-lg transition-colors"
          >
            <UserCog className="w-4 h-4" />
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {expanded && (
        <div className="px-4 pb-4">
          <EditForm
            account={account}
            onSuccess={() => {
              onToast(
                t("accounts.toastUpdated", { username: account.username }),
                "success",
              );
              setExpanded(false);
              onMutate();
            }}
            onCancel={() => setExpanded(false)}
          />
        </div>
      )}
    </div>
  );
}

function CreateForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;
  const passwordTooShort = password.length > 0 && password.length < 3;

  const canSubmit = useMemo(
    () =>
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 3 &&
      password === passwordConfirm,
    [username, email, password, passwordConfirm],
  );

  function reset() {
    setUsername("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setError("");
  }

  async function handleCreate() {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/login/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: username,
          email,
          password,
          role: "admin",
          active: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? `HTTP ${res.status}`);
      }

      reset();
      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        data-cy="create_account_toggle"
        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#12556F] border-2 border-dashed border-[#12556F]/30 rounded-xl hover:border-[#12556F]/60 hover:bg-[#12556F]/5 transition-all"
      >
        <Plus className="w-4 h-4" />
        {strings.create.toggleButton}
      </button>
    );
  }

  return (
    <div className="border-2 border-dashed border-[#12556F]/40 rounded-xl p-4 space-y-3 bg-[#12556F]/5">
      <p className="text-sm font-medium text-[#12556F]">
        {strings.create.heading}
      </p>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {strings.create.labelUsername}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            data-cy="create_username"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#12556F] focus:ring-2 focus:ring-[#12556F]/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {strings.create.labelEmail}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-cy="create_email"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#12556F] focus:ring-2 focus:ring-[#12556F]/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {strings.create.labelPassword}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-cy="create_password"
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none focus:ring-2 ${
              passwordTooShort
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-[#12556F] focus:ring-[#12556F]/20"
            }`}
          />
          {passwordTooShort && (
            <p className="mt-1 text-xs text-red-600">
              {strings.create.passwordTooShort}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {strings.create.labelPasswordConfirm}
          </label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            data-cy="create_password_confirm"
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none focus:ring-2 ${
              passwordMismatch
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-[#12556F] focus:ring-[#12556F]/20"
            }`}
          />
          {passwordMismatch && (
            <p className="mt-1 text-xs text-red-600">
              {strings.create.passwordMismatch}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            setOpen(false);
            reset();
          }}
          data-cy="create_cancel"
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {strings.create.cancel}
        </button>
        <button
          onClick={handleCreate}
          disabled={!canSubmit || isLoading}
          data-cy="create_submit"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#12556F" }}
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {strings.create.submit}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const { data: session } = useSession();
  const currentUsername = session?.user?.name;

  const {
    data: accounts,
    error,
    isLoading,
    mutate,
  } = useSWR<AdminAccount[]>("/api/login", fetcher);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
    },
    [],
  );

  const isOnly = (accounts?.length ?? 0) <= 1;

  return (
    <>
      <Head>
        <title>{strings.pageTitle}</title>
      </Head>

      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#12556F" }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {strings.heading}
              </h1>
            </div>
            <p className="text-sm text-gray-500 ml-13">{strings.subtitle}</p>
          </div>

          {/* Account list */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {strings.existingAccounts}
            </h2>

            {isLoading && (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">{strings.loading}</span>
              </div>
            )}

            {error && !isLoading && (
              <p className="text-sm text-red-600 py-4 text-center">
                {strings.loadError}
              </p>
            )}

            {!isLoading && !error && accounts && (
              <div className="space-y-2" data-cy="accounts_list">
                {accounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    currentUsername={currentUsername}
                    isOnly={isOnly}
                    onMutate={() => mutate()}
                    onToast={showToast}
                  />
                ))}
              </div>
            )}

            {isOnly && !isLoading && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {strings.lastAccountWarning}
              </p>
            )}
          </div>

          {/* Create new */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {strings.newAccountSection}
            </h2>
            <CreateForm
              onSuccess={() => {
                showToast(t("accounts.toastCreated"), "success");
                mutate();
              }}
            />
          </div>

          {/* Back link */}
          <div className="mt-4 text-center">
            <a
              href="/admin"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {strings.backToAdmin}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
