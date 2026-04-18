"use client";

import CustomButton from "@/components/CustomButton";
import { Input, Label, TextField } from "@heroui/react";
import { CheckCircle, Loader2, Upload, XCircle } from "lucide-react";
import { useRef, useState } from "react";

type FileOption = {
  _id: string;
  title: string | null;
  url: string | null;
};

type ButtonState = {
  text: string;
  fileId: string;
  fileName: string;
};

type Props = {
  documentMenuId: string;
  initialButtons: [ButtonState, ButtonState, ButtonState, ButtonState];
  fileOptions: FileOption[];
};

export default function DocumentMenuEditor({
  documentMenuId,
  initialButtons,
  fileOptions,
}: Props) {
  const [buttons, setButtons] = useState<
    [ButtonState, ButtonState, ButtonState, ButtonState]
  >(initialButtons);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const updateButton = (index: number, field: keyof ButtonState, value: string) => {
    setButtons((prev) => {
      const next = [...prev] as typeof prev;
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFileUpload = async (index: number, file: File) => {
    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-file-to-sanity", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Create a fileOtherDocuments doc for the uploaded asset
      const createRes = await fetch("/api/sanity/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ""),
          assetId: data.assetId,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);

      setButtons((prev) => {
        const next = [...prev] as typeof prev;
        next[index] = {
          ...next[index],
          fileId: createData._id,
          fileName: file.name,
        };
        return next;
      });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Opplasting feilet. Prøv igjen.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setResult(null);

    for (const btn of buttons) {
      if (!btn.text || !btn.fileId) {
        alert("Alle knapper må ha tekst og en tilknyttet fil.");
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/sanity/document-menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentMenuId,
          buttons: buttons.map((b) => ({ text: b.text, fileId: b.fileId })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setResult("success");
    } catch (err) {
      console.error("Save failed:", err);
      setResult("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {buttons.map((btn, i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-border space-y-4"
        >
          <p className="font-semibold text-sm text-foreground/60 uppercase tracking-wide">
            Knapp {i + 1}
          </p>

          <TextField
            value={btn.text}
            onChange={(value) => updateButton(i, "text", value)}
            isRequired
          >
            <Label>Knapptekst (4–25 tegn)</Label>
            <Input
              type="text"
              minLength={4}
              maxLength={25}
              placeholder="F.eks. Vedtekter"
            />
          </TextField>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fil</label>
            <div className="flex gap-2 flex-wrap items-center">
              <select
                className="flex-1 min-w-0 border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={btn.fileId}
                onChange={(e) => {
                  const selected = fileOptions.find(
                    (f) => f._id === e.target.value,
                  );
                  updateButton(i, "fileId", e.target.value);
                  updateButton(
                    i,
                    "fileName",
                    selected?.title ?? e.target.value,
                  );
                }}
              >
                <option value="">– Velg eksisterende fil –</option>
                {fileOptions.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.title ?? f._id}
                  </option>
                ))}
              </select>

              <span className="text-sm text-foreground/50">eller</span>

              <input
                type="file"
                ref={fileInputRefs[i]}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(i, file);
                }}
              />

              <CustomButton
                variant="secondary"
                size="sm"
                onPress={() => fileInputRefs[i].current?.click()}
                isPending={uploadingIndex === i}
              >
                <Upload className="h-4 w-4 mr-1" />
                Last opp ny
              </CustomButton>
            </div>

            {btn.fileName && (
              <p className="text-xs text-foreground/50">
                Valgt: {btn.fileName}
              </p>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <CustomButton onPress={handleSave} isPending={isSaving}>
          Lagre dokumentmeny
        </CustomButton>

        {result === "success" && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Lagret!
          </span>
        )}
        {result === "error" && (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <XCircle className="h-4 w-4" />
            Noe gikk galt.
          </span>
        )}
      </div>
    </div>
  );
}
