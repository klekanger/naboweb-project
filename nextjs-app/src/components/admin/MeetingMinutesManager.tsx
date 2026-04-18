"use client";

import CustomButton from "@/components/CustomButton";
import { Input, Label, TextField } from "@heroui/react";
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
import { useRef, useState } from "react";
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

export default function MeetingMinutesManager({ initialMinutes }: Props) {
  const [minutes, setMinutes] = useState<MinutesDoc[]>(initialMinutes);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    const uploaded: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch("/api/upload-file-to-sanity", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        uploaded.push({
          assetId: data.assetId,
          fileName: data.originalFilename ?? file.name,
        });
      } catch (err) {
        console.error("Upload failed for", file.name, err);
      }
    }

    setForm((f) => ({ ...f, uploadedFiles: [...f.uploadedFiles, ...uploaded] }));
    setIsUploading(false);
  };

  const removeFile = (assetId: string) => {
    setForm((f) => ({
      ...f,
      uploadedFiles: f.uploadedFiles.filter((u) => u.assetId !== assetId),
    }));
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
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch("/api/sanity/meeting-minutes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMinutes((prev) => prev.filter((m) => m._id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sletting feilet.");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (doc: MinutesDoc) => {
    setEditingId(doc._id);
    setForm({
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
    });
    setShowForm(true);
    setError("");
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <CustomButton
          onPress={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
            setError("");
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Last opp nytt referat
        </CustomButton>
      )}

      {/* Form */}
      {showForm && (
        <div className="p-5 rounded-xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">
              {editingId ? "Rediger referat" : "Nytt referat"}
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
              <Input type="text" placeholder="F.eks. Beboerhuset" />
            </TextField>
          </div>

          <TextField
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          >
            <Label>Beskrivelse (valgfri)</Label>
            <Input type="text" placeholder="Kort beskrivelse" />
          </TextField>

          {/* File uploads */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Filer</label>
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
                  <li
                    key={f.assetId}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                    <span className="flex-1 truncate">{f.fileName}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(f.assetId)}
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
            <CustomButton onPress={handleSave} isPending={isSaving}>
              {editingId ? "Lagre endringer" : "Opprett referat"}
            </CustomButton>
            <CustomButton variant="ghost" onPress={cancelForm}>
              Avbryt
            </CustomButton>
          </div>
        </div>
      )}

      {/* List */}
      {minutes.length === 0 ? (
        <div className="text-center py-10 text-foreground/50">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Ingen referater lastet opp ennå.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {minutes.map((doc) => (
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
                  onClick={() => startEdit(doc)}
                  className="text-brand-secondary hover:underline text-sm"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc._id)}
                  disabled={deletingId === doc._id}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
