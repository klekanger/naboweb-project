"use client";

import { searchFileOtherDocuments } from "@/app/actions/searchFileOtherDocuments";
import CustomButton from "@/components/CustomButton";
import {
  DOCUMENT_MENU_MIN_SEARCH_CHARS,
  DOCUMENT_MENU_SEARCH_DEBOUNCE_MS,
} from "@/lib/document-menu-file-picker";
import {
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  TextField,
} from "@heroui/react";
import { CheckCircle, Upload, XCircle } from "lucide-react";
import type { Key } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  seedFileOptions: FileOption[];
  browseFileOptions: FileOption[];
};

type Row4<T> = [T, T, T, T];

type NullableTimeout = ReturnType<typeof setTimeout> | null;

function withRow4<T>(prev: Row4<T>, rowIndex: number, value: T): Row4<T> {
  const next = [...prev] as Row4<T>;
  next[rowIndex] = value;
  return next;
}

function comboIncludeAllFilter(_textValue: string, _inputValue: string) {
  return true;
}

function initialComboInputFromButtons(
  buttons: [ButtonState, ButtonState, ButtonState, ButtonState],
): Row4<string> {
  return [
    buttons[0].fileId ? buttons[0].fileName : "",
    buttons[1].fileId ? buttons[1].fileName : "",
    buttons[2].fileId ? buttons[2].fileName : "",
    buttons[3].fileId ? buttons[3].fileName : "",
  ];
}

function buildComboItems(
  rowIndex: number,
  buttons: [ButtonState, ButtonState, ButtonState, ButtonState],
  hits: FileOption[],
  browseList: FileOption[],
  searchInputTrimmed: string,
  seedById: Map<string, FileOption>,
): FileOption[] {
  const btn = buttons[rowIndex];
  const map = new Map<string, FileOption>();
  if (btn.fileId) {
    const seed = seedById.get(btn.fileId);
    map.set(btn.fileId, {
      _id: btn.fileId,
      title: btn.fileName || seed?.title || btn.fileId,
      url: seed?.url ?? null,
    });
  }
  const useServerSearch =
    searchInputTrimmed.length >= DOCUMENT_MENU_MIN_SEARCH_CHARS;
  const listSource = useServerSearch ? hits : browseList;
  for (const h of listSource) {
    map.set(h._id, h);
  }
  const ordered = Array.from(map.values());
  ordered.sort((a, b) =>
    (a.title ?? a._id).localeCompare(b.title ?? b._id, "nb"),
  );
  return ordered;
}

export default function DocumentMenuEditor({
  documentMenuId,
  initialButtons,
  seedFileOptions,
  browseFileOptions,
}: Props) {
  const [buttons, setButtons] =
    useState<[ButtonState, ButtonState, ButtonState, ButtonState]>(
      initialButtons,
    );
  const [fileInputByRow, setFileInputByRow] = useState<Row4<string>>(() =>
    initialComboInputFromButtons(initialButtons),
  );
  const [searchHitsByRow, setSearchHitsByRow] = useState<Row4<FileOption[]>>([
    [],
    [],
    [],
    [],
  ]);
  const [searchLoadingByRow, setSearchLoadingByRow] = useState<Row4<boolean>>([
    false,
    false,
    false,
    false,
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadedExtras, setUploadedExtras] = useState<FileOption[]>([]);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const comboInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const debounceTimers = useRef<Row4<NullableTimeout>>([
    null,
    null,
    null,
    null,
  ]);
  const searchGeneration = useRef([0, 0, 0, 0]);

  useEffect(
    () => () => {
      for (let i = 0; i < initialButtons.length; i += 1) {
        const t = debounceTimers.current[i];
        if (t) clearTimeout(t);
      }
    },
    [initialButtons.length],
  );

  const seedById = useMemo(() => {
    const m = new Map<string, FileOption>();
    for (const f of seedFileOptions) m.set(f._id, f);
    for (const f of uploadedExtras) m.set(f._id, f);
    for (const row of searchHitsByRow) {
      for (const f of row) m.set(f._id, f);
    }
    return m;
  }, [seedFileOptions, searchHitsByRow, uploadedExtras]);

  const updateButton = (
    index: number,
    field: keyof ButtonState,
    value: string,
  ) => {
    setButtons((prev) => {
      const next = [...prev] as typeof prev;
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const clearFileForRow = (index: number) => {
    updateButton(index, "fileId", "");
    updateButton(index, "fileName", "");
    setFileInputByRow((prev) => withRow4(prev, index, ""));
    setSearchHitsByRow((prev) => withRow4(prev, index, []));
    window.setTimeout(() => {
      comboInputRefs[index].current?.focus();
    }, 0);
  };

  const runSearch = useCallback(async (rowIndex: number, term: string) => {
    searchGeneration.current[rowIndex] += 1;
    const gen = searchGeneration.current[rowIndex];
    const trimmed = term.trim();
    if (trimmed.length < DOCUMENT_MENU_MIN_SEARCH_CHARS) {
      setSearchHitsByRow((prev) => withRow4(prev, rowIndex, []));
      setSearchLoadingByRow((prev) => withRow4(prev, rowIndex, false));
      return;
    }
    setSearchLoadingByRow((prev) => withRow4(prev, rowIndex, true));
    const res = await searchFileOtherDocuments({ searchTerm: trimmed });
    if (searchGeneration.current[rowIndex] !== gen) return;
    setSearchLoadingByRow((prev) => withRow4(prev, rowIndex, false));
    if ("error" in res) {
      setSearchHitsByRow((prev) => withRow4(prev, rowIndex, []));
      return;
    }
    setSearchHitsByRow((prev) =>
      withRow4(
        prev,
        rowIndex,
        res.success.files.map((f) => ({
          _id: f._id,
          title: f.title,
          url: f.url,
        })),
      ),
    );
  }, []);

  const scheduleSearch = useCallback(
    (rowIndex: number, term: string) => {
      const t = debounceTimers.current[rowIndex];
      if (t) clearTimeout(t);
      debounceTimers.current[rowIndex] = setTimeout(() => {
        debounceTimers.current[rowIndex] = null;
        void runSearch(rowIndex, term);
      }, DOCUMENT_MENU_SEARCH_DEBOUNCE_MS);
    },
    [runSearch],
  );

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
      setFileInputByRow((prev) => withRow4(prev, index, file.name));
      setUploadedExtras((prev) => [
        ...prev,
        {
          _id: String(createData._id),
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: null,
        },
      ]);
      setSearchHitsByRow((prev) => withRow4(prev, index, []));
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
      {buttons.map((btn, i) => {
        const comboItems = buildComboItems(
          i,
          buttons,
          searchHitsByRow[i],
          browseFileOptions,
          fileInputByRow[i].trim(),
          seedById,
        );
        const selectedKey = btn.fileId ? btn.fileId : undefined;
        const resolvedFileLabel = btn.fileId
          ? (btn.fileName ||
              seedById.get(btn.fileId)?.title ||
              btn.fileId)
          : "";

        return (
          <div key={i} className="py-5 rounded-xl border border-border space-y-4">
            <p className="font-semibold text-sm text-foreground/60 uppercase tracking-wide">
              Knapp {i + 1}
            </p>

            <TextField
              value={btn.text}
              onChange={(value) => updateButton(i, "text", value)}
              isRequired
            >
              <Label>Knappetekst (4–25 tegn)</Label>
              <Input
                type="text"
                minLength={4}
                maxLength={25}
                placeholder="F.eks. Vedtekter"
              />
            </TextField>

            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap items-end">
                <ComboBox<FileOption>
                  className="flex-1 min-w-0"
                  fullWidth
                  // @ts-expect-error RAC allowsEmptySelection; HeroUI ComboBoxRootProps omit it
                  allowsEmptySelection
                  defaultFilter={comboIncludeAllFilter}
                  inputValue={fileInputByRow[i]}
                  items={comboItems}
                  selectedKey={selectedKey}
                  onSelectionChange={(key: Key | null) => {
                    if (key === null) {
                      clearFileForRow(i);
                      return;
                    }
                    const id = String(key);
                    const selected = comboItems.find((f) => f._id === id);
                    const label = selected?.title ?? id;
                    updateButton(i, "fileId", id);
                    updateButton(i, "fileName", label);
                    setFileInputByRow((prev) => withRow4(prev, i, label));
                  }}
                  onInputChange={(value) => {
                    if (btn.fileId && value !== resolvedFileLabel) {
                      updateButton(i, "fileId", "");
                      updateButton(i, "fileName", "");
                    }
                    setFileInputByRow((prev) => withRow4(prev, i, value));
                    scheduleSearch(i, value);
                  }}
                >
                  <Label className="text-sm font-medium">Fil *</Label>
                  <ComboBox.InputGroup>
                    <Input
                      ref={comboInputRefs[i]}
                      placeholder="Velg i listen eller skriv minst 2 tegn for å søke"
                    />
                    <ComboBox.Trigger />
                  </ComboBox.InputGroup>
                  <ComboBox.Popover>
                    <ListBox<FileOption>>
                      {(item: FileOption) => (
                        <ListBox.Item
                          id={item._id}
                          textValue={item.title ?? item._id}
                        >
                          {item.title ?? item._id}
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </ComboBox.Popover>
                </ComboBox>

                {btn.fileId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 self-end h-10 px-2 text-sm text-foreground/70"
                    onPress={() => clearFileForRow(i)}
                  >
                    Fjern valg
                  </Button>
                ) : null}

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
                  variant="primary"
                  size="sm"
                  onPress={() => fileInputRefs[i].current?.click()}
                  isPending={uploadingIndex === i}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Last opp ny
                </CustomButton>
              </div>

              {searchLoadingByRow[i] && (
                <p className="text-xs text-foreground/50">Søker…</p>
              )}
              {btn.fileName && (
                <p className="text-xs text-foreground/50">
                  Valgt: {btn.fileName}
                </p>
              )}
            </div>
          </div>
        );
      })}

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
