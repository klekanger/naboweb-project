"use client";

import CustomButton from "@/components/CustomButton";
import { useAdminEditExit } from "@/components/admin/AdminEditPageShell";
import { Input, Label, Modal, TextField } from "@heroui/react";
import {
  CheckCircle,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Doc = {
  _id: string;
  _createdAt: string;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  document: {
    asset: {
      url: string | null;
      _id: string;
      originalFilename: string | null;
    } | null;
  } | null;
};

type Props = {
  initialDocuments: Doc[];
};

type FormState = {
  title: string;
  description: string;
  assetId: string;
  fileName: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  assetId: "",
  fileName: "",
};

function formFromDocument(doc: Doc): FormState {
  return {
    title: doc.title ?? "",
    description: doc.description ?? "",
    assetId: doc.document?.asset?._id ?? "",
    fileName: doc.document?.asset?.originalFilename ?? "",
  };
}

export default function DocumentsManager({ initialDocuments }: Props) {
  const { reportDirty, registerDiscard } = useAdminEditExit();
  const router = useRouter();
  const [documents, setDocuments] = useState<Doc[]>(initialDocuments);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formBaseline, setFormBaseline] = useState<FormState | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<Doc | null>(null);
  const [deleteModalError, setDeleteModalError] = useState("");
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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload-file-to-sanity", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({
        ...f,
        assetId: data.assetId,
        fileName: data.originalFilename ?? file.name,
        title: f.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
    } catch (err) {
      setError("Opplasting feilet.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.assetId) {
      setError("Tittel og fil er påkrevd.");
      return;
    }
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch("/api/sanity/documents", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { _id: editingId } : {}),
          title: form.title,
          description: form.description,
          assetId: form.assetId,
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

  const openDeleteConfirm = (doc: Doc) => {
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
      const res = await fetch("/api/sanity/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: pendingDeleteDoc._id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDocuments((prev) =>
        prev.filter((d) => d._id !== pendingDeleteDoc._id),
      );
      setShowDeleteConfirm(false);
      setPendingDeleteDoc(null);
    } catch (err: unknown) {
      setDeleteModalError(
        err instanceof Error ? err.message : "Sletting feilet.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (doc: Doc) => {
    const baseline = formFromDocument(doc);
    setEditingId(doc._id);
    setForm(baseline);
    setFormBaseline(baseline);
    setShowForm(true);
    setError("");
  };

  const cancelForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormBaseline(null);
    setError("");
  }, []);

  useEffect(() => {
    registerDiscard(cancelForm);
  }, [cancelForm, registerDiscard]);

  return (
    <div className="space-y-6">
      {/* Add new button */}
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
          Last opp nytt dokument
        </CustomButton>
      )}

      {/* Form */}
      {showForm && (
        <div className="p-5 rounded-xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">
              {editingId ? "Rediger dokument" : "Nytt dokument"}
            </p>
            <button
              type="button"
              onClick={cancelForm}
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
            <Input type="text" placeholder="F.eks. Vedtekter 2024" />
          </TextField>

          <TextField
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          >
            <Label>Beskrivelse (valgfri)</Label>
            <Input type="text" placeholder="Kort beskrivelse" />
          </TextField>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fil</label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <CustomButton
                variant="secondary"
                size="sm"
                onPress={() => fileInputRef.current?.click()}
                isPending={isUploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                {form.assetId ? "Bytt fil" : "Last opp fil"}
              </CustomButton>
              {form.assetId && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {form.fileName || "Fil lastet opp"}
                </span>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <CustomButton onPress={handleSave} isPending={isSaving}>
              {editingId ? "Lagre endringer" : "Opprett dokument"}
            </CustomButton>
            <CustomButton variant="ghost" onPress={cancelForm}>
              Avbryt
            </CustomButton>
          </div>
        </div>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="text-center py-10 text-foreground/50">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Ingen dokumenter lastet opp ennå.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center justify-between py-4 gap-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-foreground/40 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <a href={doc.document?.asset?.url ?? ""}>
                    <p className="font-medium truncate hover:text-brand-secondary/80">
                      {doc.title}
                    </p>
                  </a>
                  {doc.description && (
                    <p className="text-sm text-foreground/50 truncate">
                      {doc.description}
                    </p>
                  )}
                  {doc.document?.asset?.originalFilename && (
                    <p className="text-xs text-foreground/40 truncate">
                      {doc.document.asset.originalFilename}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 cursor-pointer">
                <button
                  type="button"
                  onClick={() => startEdit(doc)}
                  className="text-brand-secondary hover:underline text-sm flex items-center gap-1 cursor-pointer"
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
          ))}
        </div>
      )}

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
                Slett dokument
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
                  <em>{pendingDeleteDoc?.title || "dette dokumentet"}</em>?
                  Denne operasjonen kan ikke angres.
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
