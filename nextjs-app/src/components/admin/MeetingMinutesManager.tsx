"use client";

import CustomButton from "@/components/CustomButton";
import { useAdminEditExit } from "@/components/admin/AdminEditPageShell";
import { Input, Label, Modal, TextField } from "@heroui/react";
import {
  BookOpen,
  CheckCircle,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "@/lib/format-date";

type MinutesDoc = {
  _id: string;
  _createdAt: string;
  title: string | null;
  description: string | null;
  meetingDate: string | null;
  meetingPlace: string | null;
  tags: string[] | null;
  meetingDocuments: Array<{
    asset: {
      url: string | null;
      _id: string;
      originalFilename: string | null;
    } | null;
  }> | null;
};

type Props = {
  initialMinutes: MinutesDoc[];
  pageNumber: number;
  totalPages: number;
};

type UploadedFile = { assetId: string; fileName: string };

type FormState = {
  title: string;
  description: string;
  meetingDate: string;
  meetingPlace: string;
  uploadedFiles: UploadedFile[];
};

const emptyForm: FormState = {
  title: "",
  description: "",
  meetingDate: "",
  meetingPlace: "",
  uploadedFiles: [],
};

function formFromMinutes(doc: MinutesDoc): FormState {
  return {
    title: doc.title ?? "",
    description: doc.description ?? "",
    meetingDate: doc.meetingDate ?? "",
    meetingPlace: doc.meetingPlace ?? "",
    uploadedFiles:
      doc.meetingDocuments
        ?.map((d) => ({
          assetId: d.asset?._id ?? "",
          fileName: d.asset?.originalFilename ?? "",
        }))
        .filter((f) => f.assetId) ?? [],
  };
}

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

function adminMeetingMinutesPageHref(page: number) {
  if (page <= 1) return "/admin/meeting-minutes";
  return `/admin/meeting-minutes?page=${page}`;
}

export default function MeetingMinutesManager({
  initialMinutes,
  pageNumber,
  totalPages,
}: Props) {
  const { reportDirty, registerDiscard } = useAdminEditExit();
  const router = useRouter();
  const [minutes, setMinutes] = useState<MinutesDoc[]>(initialMinutes);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formBaseline, setFormBaseline] = useState<FormState | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<MinutesDoc | null>(
    null,
  );
  const [deleteModalError, setDeleteModalError] = useState("");
  const [showRemoveFileConfirm, setShowRemoveFileConfirm] = useState(false);
  const [pendingRemoveFile, setPendingRemoveFile] =
    useState<UploadedFile | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingEditDoc, setPendingEditDoc] = useState<MinutesDoc | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDirty = useMemo(
    () =>
      showForm &&
      formBaseline !== null &&
      JSON.stringify(form) !== JSON.stringify(formBaseline),
    [showForm, form, formBaseline],
  );

  useEffect(() => {
    reportDirty(isDirty);
  }, [isDirty, reportDirty]);

  useEffect(() => {
    setMinutes(initialMinutes);
  }, [initialMinutes]);

  useEffect(() => {
    if (isDirty) return;
    if (pageNumber >= totalPages) return;

    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection?.saveData) return;

    const nextPageHref = adminMeetingMinutesPageHref(pageNumber + 1);
    const timeoutId = window.setTimeout(() => {
      router.prefetch(nextPageHref);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [isDirty, pageNumber, router, totalPages]);

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);

    try {
      const results = await Promise.all(
        Array.from(files).map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          try {
            const res = await fetch("/api/upload-file-to-sanity", {
              method: "POST",
              body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return {
              assetId: data.assetId as string,
              fileName: (data.originalFilename ?? file.name) as string,
            };
          } catch (err) {
            console.error("Upload failed for", file.name, err);
            return null;
          }
        }),
      );

      const uploaded = results.filter((r): r is UploadedFile => r !== null);
      setForm((f) => ({
        ...f,
        uploadedFiles: [...f.uploadedFiles, ...uploaded],
      }));
    } finally {
      setIsUploading(false);
      // Clear so choosing the same file again fires `change` (browser keeps prior value otherwise).
      const input = fileInputRef.current;
      if (input) input.value = "";
    }
  };

  const removeFile = (assetId: string) => {
    setForm((f) => ({
      ...f,
      uploadedFiles: f.uploadedFiles.filter((u) => u.assetId !== assetId),
    }));
  };

  const openRemoveFileConfirm = (file: UploadedFile) => {
    setPendingRemoveFile(file);
    setShowRemoveFileConfirm(true);
  };

  const closeRemoveFileConfirm = () => {
    setShowRemoveFileConfirm(false);
    setPendingRemoveFile(null);
  };

  const confirmRemoveFile = () => {
    if (!pendingRemoveFile) return;
    removeFile(pendingRemoveFile.assetId);
    const input = fileInputRef.current;
    if (input) input.value = "";
    closeRemoveFileConfirm();
  };

  const handleSave = async () => {
    if (!form.title.trim() || form.uploadedFiles.length === 0) {
      setError("Tittel og minst én fil er påkrevd.");
      return;
    }
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch("/api/sanity/meeting-minutes", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { _id: editingId } : {}),
          title: form.title,
          description: form.description,
          meetingDate: form.meetingDate || null,
          meetingPlace: form.meetingPlace,
          assetIds: form.uploadedFiles.map((f) => f.assetId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      cancelForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteConfirm = (doc: MinutesDoc) => {
    setPendingDeleteDoc(doc);
    setDeleteModalError("");
    setShowDeleteConfirm(true);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setShowDeleteConfirm(false);
    setPendingDeleteDoc(null);
    setDeleteModalError("");
  };

  const confirmDelete = async () => {
    if (!pendingDeleteDoc) return;
    setDeletingId(pendingDeleteDoc._id);
    setDeleteModalError("");
    try {
      const res = await fetch("/api/sanity/meeting-minutes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: pendingDeleteDoc._id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const deletedId = pendingDeleteDoc._id;
      const nextMinutes = minutes.filter((m) => m._id !== deletedId);
      setMinutes(nextMinutes);
      setShowDeleteConfirm(false);
      setPendingDeleteDoc(null);
      if (editingId === deletedId) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        setFormBaseline(null);
        setError("");
      }

      if (nextMinutes.length === 0 && pageNumber > 1) {
        router.push(adminMeetingMinutesPageHref(pageNumber - 1));
        return;
      }

      router.refresh();
    } catch (err: unknown) {
      setDeleteModalError(
        err instanceof Error ? err.message : "Sletting feilet.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = useCallback((doc: MinutesDoc) => {
    const baseline = formFromMinutes(doc);
    setEditingId(doc._id);
    setForm(baseline);
    setFormBaseline(baseline);
    setShowForm(true);
    setError("");
  }, []);

  const cancelForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormBaseline(null);
    setError("");
  }, []);

  const requestFormClose = useCallback(() => {
    if (isDirty) {
      setPendingEditDoc(null);
      setShowLeaveConfirm(true);
      return;
    }
    cancelForm();
  }, [cancelForm, isDirty]);

  const confirmFormClose = useCallback(() => {
    const docToEdit = pendingEditDoc;
    setShowLeaveConfirm(false);
    setPendingEditDoc(null);
    cancelForm();
    if (docToEdit) startEdit(docToEdit);
  }, [cancelForm, pendingEditDoc, startEdit]);

  const requestStartEdit = useCallback(
    (doc: MinutesDoc) => {
      if (isDirty && editingId && editingId !== doc._id) {
        setPendingEditDoc(doc);
        setShowLeaveConfirm(true);
        return;
      }
      startEdit(doc);
    },
    [editingId, isDirty, startEdit],
  );

  useEffect(() => {
    registerDiscard(cancelForm);
  }, [cancelForm, registerDiscard]);

  const renderMeetingForm = () => (
    <div className="p-5 rounded-xl border border-border space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {editingId ? "Rediger referat" : "Nytt referat"}
        </p>
        <button
          type="button"
          onClick={requestFormClose}
          className="text-foreground/50 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <TextField
        value={form.title}
        onChange={(v) => setForm((f) => ({ ...f, title: v }))}
        isRequired
      >
        <Label>Tittel</Label>
        <Input type="text" placeholder="F.eks. Referat fra årsmøte 2024" />
      </TextField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField
          value={form.meetingDate}
          onChange={(v) => setForm((f) => ({ ...f, meetingDate: v }))}
        >
          <Label>Møtedato</Label>
          <Input type="date" />
        </TextField>

        <TextField
          value={form.meetingPlace}
          onChange={(v) => setForm((f) => ({ ...f, meetingPlace: v }))}
        >
          <Label>Møtested</Label>
          <Input type="text" placeholder="F.eks. Askimhallen" />
        </TextField>
      </div>

      <TextField
        value={form.description}
        onChange={(v) => setForm((f) => ({ ...f, description: v }))}
      >
        <Label>Beskrivelse (valgfri)</Label>
        <Input type="text" placeholder="Kort beskrivelse" />
      </TextField>

      <div className="space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFileUpload(e.target.files);
          }}
        />
        <CustomButton
          variant="secondary"
          size="sm"
          onPress={() => fileInputRef.current?.click()}
          isPending={isUploading}
        >
          <Upload className="h-4 w-4 mr-1" />
          Legg til filer
        </CustomButton>

        {form.uploadedFiles.length > 0 && (
          <ul className="space-y-1 mt-2">
            {form.uploadedFiles.map((f) => (
              <li key={f.assetId} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                <span className="flex-1 truncate">{f.fileName}</span>
                <button
                  type="button"
                  onClick={() => openRemoveFileConfirm(f)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <XCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <CustomButton
          onPress={handleSave}
          isPending={isSaving}
          isDisabled={Boolean(editingId) && !isDirty}
        >
          {editingId ? "Lagre endringer" : "Opprett referat"}
        </CustomButton>
        <CustomButton variant="ghost" onPress={cancelForm}>
          Avbryt
        </CustomButton>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!showForm && (
        <CustomButton
          onPress={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
            setFormBaseline(emptyForm);
            setError("");
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Last opp nytt referat
        </CustomButton>
      )}

      {showForm && !editingId && renderMeetingForm()}

      {/* List */}
      {minutes.length === 0 ? (
        <div className="text-center py-10 text-foreground/50">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Ingen referater lastet opp ennå.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {minutes.map((doc) =>
              editingId === doc._id ? (
                <div key={doc._id} className="py-4">
                  {renderMeetingForm()}
                </div>
              ) : (
                <div
                  key={doc._id}
                  className="flex items-start justify-between py-4 gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <BookOpen className="h-5 w-5 text-foreground/40 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.title}</p>
                      {doc.meetingDate && (
                        <p className="text-sm text-foreground/50">
                          {formatDate(doc.meetingDate)}
                          {doc.meetingPlace ? ` · ${doc.meetingPlace}` : ""}
                        </p>
                      )}
                      <p className="text-xs text-foreground/40">
                        {doc.meetingDocuments?.length ?? 0} fil(er)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => requestStartEdit(doc)}
                      className="text-brand-secondary hover:underline text-sm cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteConfirm(doc)}
                      disabled={deletingId === doc._id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
          {totalPages > 1 && (
            <>
              <nav
                aria-label="Navigasjon mellom referatsider"
                className="m-auto my-8 flex justify-center font-bold text-brand-black"
              >
                <ul className="flex justify-between">
                  {pageNumber > 1 && (
                    <li className="mr-2 rounded-xl bg-brand-primary px-8 py-2 shadow-md">
                      {isDirty ? (
                        <span
                          aria-disabled="true"
                          className="opacity-50 cursor-not-allowed pointer-events-none"
                        >
                          ← Forrige side
                        </span>
                      ) : (
                        <Link
                          href={adminMeetingMinutesPageHref(pageNumber - 1)}
                        >
                          ← Forrige side
                        </Link>
                      )}
                    </li>
                  )}
                  {pageNumber < totalPages && (
                    <li className="ml-2 rounded-xl bg-brand-primary px-8 py-2 shadow-md">
                      {isDirty ? (
                        <span
                          aria-disabled="true"
                          className="opacity-50 cursor-not-allowed pointer-events-none"
                        >
                          Neste side →
                        </span>
                      ) : (
                        <Link
                          href={adminMeetingMinutesPageHref(pageNumber + 1)}
                        >
                          Neste side →
                        </Link>
                      )}
                    </li>
                  )}
                </ul>
              </nav>
              <p className="pb-4 text-center">
                side {`${pageNumber} av ${totalPages}`}
              </p>
            </>
          )}
        </>
      )}

      <Modal.Backdrop
        isOpen={showLeaveConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowLeaveConfirm(false);
            setPendingEditDoc(null);
          }
        }}
        variant="blur"
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Ikke lagrede endringer</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>
                Du har endringer som ikke er lagret. Vil du avslutte
                redigeringen?
              </p>
            </Modal.Body>
            <Modal.Footer className="flex flex-wrap justify-end gap-2">
              <CustomButton
                variant="secondary"
                onPress={() => setShowLeaveConfirm(false)}
              >
                Avbryt
              </CustomButton>
              <CustomButton onPress={confirmFormClose}>Ja</CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop
        isOpen={showRemoveFileConfirm}
        onOpenChange={(open) => {
          if (!open) closeRemoveFileConfirm();
        }}
        variant="blur"
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-brand-danger">
                Fjern fil
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>
                Er du sikker på at du vil fjerne{" "}
                <em>{pendingRemoveFile?.fileName || "denne filen"}</em> fra
                referatet?
              </p>
            </Modal.Body>
            <Modal.Footer className="flex flex-wrap justify-end gap-2">
              <CustomButton
                variant="secondary"
                onPress={closeRemoveFileConfirm}
              >
                Avbryt
              </CustomButton>
              <CustomButton variant="danger" onPress={confirmRemoveFile}>
                Fjern
              </CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop
        isOpen={showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) closeDeleteModal();
        }}
        variant="blur"
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-brand-danger">
                Slett referat
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {deleteModalError && (
                <div
                  className="bg-brand-danger text-white p-4 rounded-xl mb-4"
                  role="alert"
                >
                  {deleteModalError}
                </div>
              )}
              {!deleteModalError && (
                <p>
                  Er du helt sikker på at du vil slette{" "}
                  <em>{pendingDeleteDoc?.title || "dette referatet"}</em>? Denne
                  operasjonen kan ikke angres.
                </p>
              )}
            </Modal.Body>
            <Modal.Footer className="flex flex-wrap justify-end gap-2">
              <CustomButton variant="secondary" onPress={closeDeleteModal}>
                Avbryt
              </CustomButton>
              {!deleteModalError && (
                <CustomButton
                  variant="danger"
                  isPending={deletingId === pendingDeleteDoc?._id}
                  onPress={() => void confirmDelete()}
                >
                  Slett
                </CustomButton>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
