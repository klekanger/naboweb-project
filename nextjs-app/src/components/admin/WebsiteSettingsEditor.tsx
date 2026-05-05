"use client";

import { searchPages } from "@/app/actions/searchPages";
import CustomButton from "@/components/CustomButton";
import { useAdminEditExit } from "@/components/admin/AdminEditPageShell";
import { comboIncludeAllFilter } from "@/lib/admin-combo-filter";
import {
  DOCUMENT_MENU_MIN_SEARCH_CHARS,
  DOCUMENT_MENU_SEARCH_DEBOUNCE_MS,
} from "@/lib/document-menu-file-picker";
import { urlForImage } from "@/sanity/lib/utils";
import type {
  PagesBrowseQueryResult,
  SettingsAdminQueryResult,
} from "@/types/sanity.types";
import {
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  TextField,
} from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Key } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Image as SanityImage } from "sanity";

type PageOption = PagesBrowseQueryResult[number];

type MenuItemForm = {
  title: string;
  pageId: string;
  pageTitle: string;
};

type FormState = {
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  companyDescription: string;
  phone: string;
  email: string;
  organisationNumber: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaOgImageAssetId: string;
  metaOgImageUrl: string;
  menuItem1: MenuItemForm;
  menuItem2: MenuItemForm;
};

type MenuKey = "menuItem1" | "menuItem2";

const MENU_SECTIONS: { key: MenuKey; label: string }[] = [
  { key: "menuItem1", label: "Menyelement 1" },
  { key: "menuItem2", label: "Menyelement 2" },
];

type Props = {
  initialSettings: Exclude<SettingsAdminQueryResult, null>;
  browsePages: PageOption[];
};

function imageFromAssetRef(assetRef: string): SanityImage {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetRef },
  };
}

function menuItemEqual(a: MenuItemForm, b: MenuItemForm): boolean {
  return (
    a.title === b.title &&
    a.pageId === b.pageId &&
    a.pageTitle === b.pageTitle
  );
}

function formStateEqual(a: FormState, b: FormState): boolean {
  return (
    a.companyName === b.companyName &&
    a.addressLine1 === b.addressLine1 &&
    a.addressLine2 === b.addressLine2 &&
    a.companyDescription === b.companyDescription &&
    a.phone === b.phone &&
    a.email === b.email &&
    a.organisationNumber === b.organisationNumber &&
    a.metaTitle === b.metaTitle &&
    a.metaDescription === b.metaDescription &&
    a.metaKeywords === b.metaKeywords &&
    a.metaOgImageAssetId === b.metaOgImageAssetId &&
    a.metaOgImageUrl === b.metaOgImageUrl &&
    menuItemEqual(a.menuItem1, b.menuItem1) &&
    menuItemEqual(a.menuItem2, b.menuItem2)
  );
}

function mergePageComboOptions(
  menu: MenuItemForm,
  hits: PageOption[],
  browsePages: PageOption[],
  browseById: Map<string, PageOption>,
): PageOption[] {
  const map = new Map<string, PageOption>();
  if (menu.pageId) {
    map.set(menu.pageId, {
      _id: menu.pageId,
      title:
        menu.pageTitle ||
        browseById.get(menu.pageId)?.title ||
        menu.pageId,
      slug: browseById.get(menu.pageId)?.slug ?? "",
    });
  }
  for (const page of hits) map.set(page._id, page);
  for (const page of browsePages) map.set(page._id, page);
  return [...map.values()];
}

function normalizeSettings(
  settings: Exclude<SettingsAdminQueryResult, null>,
): FormState {
  return {
    companyName: settings.companyName ?? "",
    addressLine1: settings.addressLine1 ?? "",
    addressLine2: settings.addressLine2 ?? "",
    companyDescription: settings.companyDescription ?? "",
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    organisationNumber: settings.organisationNumber ?? "",
    metaTitle: settings.metaTitle ?? "",
    metaDescription: settings.metaDescription ?? "",
    metaKeywords: settings.metaKeywords ?? "",
    metaOgImageAssetId: settings.metaOgImageAssetId ?? "",
    metaOgImageUrl: settings.metaOgImageUrl ?? "",
    menuItem1: {
      title: settings.menuItem1?.title ?? "",
      pageId: settings.menuItem1?.menuLink?._id ?? "",
      pageTitle: settings.menuItem1?.menuLink?.title ?? "",
    },
    menuItem2: {
      title: settings.menuItem2?.title ?? "",
      pageId: settings.menuItem2?.menuLink?._id ?? "",
      pageTitle: settings.menuItem2?.menuLink?.title ?? "",
    },
  };
}

function withMenuItem(
  prev: FormState,
  key: MenuKey,
  next: MenuItemForm,
): FormState {
  return { ...prev, [key]: next };
}

export default function WebsiteSettingsEditor({
  initialSettings,
  browsePages,
}: Props) {
  const router = useRouter();
  const { reportDirty, registerDiscard } = useAdminEditExit();
  const initialForm = useMemo(
    () => normalizeSettings(initialSettings),
    [initialSettings],
  );
  const [form, setForm] = useState<FormState>(initialForm);
  const [baseline, setBaseline] = useState<FormState>(initialForm);
  const [pageInputByMenu, setPageInputByMenu] = useState<
    Record<MenuKey, string>
  >(() => ({
    menuItem1: initialForm.menuItem1.pageTitle,
    menuItem2: initialForm.menuItem2.pageTitle,
  }));
  const [pageHitsByMenu, setPageHitsByMenu] = useState<
    Record<MenuKey, PageOption[]>
  >({ menuItem1: [], menuItem2: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimers = useRef<
    Record<MenuKey, ReturnType<typeof setTimeout> | null>
  >({ menuItem1: null, menuItem2: null });
  const searchGeneration = useRef<Record<MenuKey, number>>({
    menuItem1: 0,
    menuItem2: 0,
  });

  const browseById = useMemo(
    () => new Map(browsePages.map((page) => [page._id, page])),
    [browsePages],
  );

  const menuOptionsByMenu = useMemo(
    () => ({
      menuItem1: mergePageComboOptions(
        form.menuItem1,
        pageHitsByMenu.menuItem1,
        browsePages,
        browseById,
      ),
      menuItem2: mergePageComboOptions(
        form.menuItem2,
        pageHitsByMenu.menuItem2,
        browsePages,
        browseById,
      ),
    }),
    [
      browseById,
      browsePages,
      form.menuItem1,
      form.menuItem2,
      pageHitsByMenu.menuItem1,
      pageHitsByMenu.menuItem2,
    ],
  );

  const isDirty = useMemo(
    () => !formStateEqual(form, baseline),
    [baseline, form],
  );

  useEffect(() => reportDirty(isDirty), [isDirty, reportDirty]);

  useEffect(
    () => () => {
      for (const { key } of MENU_SECTIONS) {
        const t = debounceTimers.current[key];
        if (t) clearTimeout(t);
      }
    },
    [],
  );

  const discardUnsavedChanges = useCallback(() => {
    setForm(baseline);
    setPageInputByMenu({
      menuItem1: baseline.menuItem1.pageTitle,
      menuItem2: baseline.menuItem2.pageTitle,
    });
    setPageHitsByMenu({ menuItem1: [], menuItem2: [] });
    setError("");
    setStatusMessage("");
  }, [baseline]);

  useEffect(() => registerDiscard(discardUnsavedChanges), [
    discardUnsavedChanges,
    registerDiscard,
  ]);

  const runSearch = useCallback(async (menuKey: MenuKey, term: string) => {
    searchGeneration.current[menuKey] += 1;
    const gen = searchGeneration.current[menuKey];
    const trimmed = term.trim();
    if (trimmed.length < DOCUMENT_MENU_MIN_SEARCH_CHARS) {
      if (searchGeneration.current[menuKey] !== gen) return;
      setPageHitsByMenu((prev) => ({ ...prev, [menuKey]: [] }));
      return;
    }
    const response = await searchPages({ searchTerm: trimmed, limit: 40 });
    if (searchGeneration.current[menuKey] !== gen) return;
    if ("error" in response) {
      setError(response.error.message);
      setPageHitsByMenu((prev) => ({ ...prev, [menuKey]: [] }));
      return;
    }
    setPageHitsByMenu((prev) => ({
      ...prev,
      [menuKey]: response.success.pages,
    }));
  }, []);

  const scheduleSearch = useCallback(
    (menuKey: MenuKey, term: string) => {
      const t = debounceTimers.current[menuKey];
      if (t) clearTimeout(t);
      debounceTimers.current[menuKey] = setTimeout(() => {
        debounceTimers.current[menuKey] = null;
        void runSearch(menuKey, term);
      }, DOCUMENT_MENU_SEARCH_DEBOUNCE_MS);
    },
    [runSearch],
  );

  const updateMenuItem = useCallback(
    (key: MenuKey, next: Partial<MenuItemForm>) => {
      setForm((prev) =>
        withMenuItem(prev, key, {
          ...prev[key],
          ...next,
        }),
      );
    },
    [],
  );

  const uploadOgImage = async (file: File) => {
    setIsUploading(true);
    setError("");
    const body = new FormData();
    body.append("messageImage", file);
    body.append("title", "Open Graph bilde");

    try {
      const response = await fetch("/api/upload-image-to-sanity", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Upload feilet");

      const imageId = data?.success?.imageId as string | undefined;
      if (!imageId) throw new Error("Mangler imageId fra opplasting");

      const built = urlForImage(imageFromAssetRef(imageId));
      setForm((prev) => ({
        ...prev,
        metaOgImageAssetId: imageId,
        metaOgImageUrl: built?.width(1200).url() ?? "",
      }));
    } catch (uploadError) {
      console.error(uploadError);
      setError("Kunne ikke laste opp Open Graph-bilde.");
    } finally {
      setIsUploading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setError("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/sanity/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          companyDescription: form.companyDescription,
          phone: form.phone,
          email: form.email,
          organisationNumber: form.organisationNumber,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          metaKeywords: form.metaKeywords,
          metaOgImageAssetId: form.metaOgImageAssetId || null,
          menuItem1: {
            title: form.menuItem1.title,
            pageId: form.menuItem1.pageId || null,
          },
          menuItem2: {
            title: form.menuItem2.title,
            pageId: form.menuItem2.pageId || null,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message =
          typeof data.error === "string" ? data.error : "Lagring feilet";
        throw new Error(message);
      }

      setBaseline(form);
      setStatusMessage("Nettstedinnstillinger ble lagret.");
      router.refresh();
    } catch (saveError) {
      console.error(saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Kunne ikke lagre nettstedinnstillinger.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Informasjon om sameiet/borettslaget</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField value={form.companyName} onChange={(companyName) => setForm((prev) => ({ ...prev, companyName }))}>
            <Label>Navn</Label>
            <Input />
          </TextField>
          <TextField value={form.organisationNumber} onChange={(organisationNumber) => setForm((prev) => ({ ...prev, organisationNumber }))}>
            <Label>Organisasjonsnummer</Label>
            <Input />
          </TextField>
          <TextField value={form.addressLine1} onChange={(addressLine1) => setForm((prev) => ({ ...prev, addressLine1 }))}>
            <Label>Adresselinje 1</Label>
            <Input />
          </TextField>
          <TextField value={form.addressLine2} onChange={(addressLine2) => setForm((prev) => ({ ...prev, addressLine2 }))}>
            <Label>Adresselinje 2</Label>
            <Input />
          </TextField>
          <TextField value={form.phone} onChange={(phone) => setForm((prev) => ({ ...prev, phone }))}>
            <Label>Telefon</Label>
            <Input />
          </TextField>
          <TextField value={form.email} onChange={(email) => setForm((prev) => ({ ...prev, email }))}>
            <Label>E-post</Label>
            <Input type="email" />
          </TextField>
        </div>
        <TextField value={form.companyDescription} onChange={(companyDescription) => setForm((prev) => ({ ...prev, companyDescription }))}>
          <Label>Kort beskrivelse</Label>
          <Input />
        </TextField>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Metadata for SEO</h2>
        <TextField value={form.metaTitle} onChange={(metaTitle) => setForm((prev) => ({ ...prev, metaTitle }))}>
          <Label>Meta title</Label>
          <Input />
        </TextField>
        <TextField value={form.metaDescription} onChange={(metaDescription) => setForm((prev) => ({ ...prev, metaDescription }))}>
          <Label>Meta description</Label>
          <Input />
        </TextField>
        <TextField value={form.metaKeywords} onChange={(metaKeywords) => setForm((prev) => ({ ...prev, metaKeywords }))}>
          <Label>Meta keywords</Label>
          <Input />
        </TextField>

        <div className="space-y-2">
          <label className="text-sm font-medium">Open Graph-bilde</label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadOgImage(file);
              }}
            />
            <CustomButton
              variant="secondary"
              size="sm"
              onPress={() => fileInputRef.current?.click()}
              isPending={isUploading}
            >
              {form.metaOgImageAssetId ? "Bytt bilde" : "Last opp bilde"}
            </CustomButton>
            {form.metaOgImageAssetId ? (
              <Button
                variant="ghost"
                size="sm"
                onPress={() =>
                  setForm((prev) => ({
                    ...prev,
                    metaOgImageAssetId: "",
                    metaOgImageUrl: "",
                  }))
                }
              >
                Fjern bilde
              </Button>
            ) : null}
          </div>
          {form.metaOgImageAssetId ? (
            <Image
              src={
                form.metaOgImageUrl ||
                urlForImage(imageFromAssetRef(form.metaOgImageAssetId))
                  ?.width(1200)
                  .url() ||
                ""
              }
              alt="Open Graph forhåndsvisning"
              width={1200}
              height={630}
              className="rounded-lg border border-border w-full h-auto max-w-xl"
            />
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Toppmeny</h2>

        {MENU_SECTIONS.map(({ key, label }) => {
          const menu = form[key];
          const options = menuOptionsByMenu[key];
          const pageInput = pageInputByMenu[key];

          return (
            <div
              key={key}
              className="p-4 rounded-xl border border-border space-y-3"
            >
              <p className="font-medium">{label}</p>
              <TextField
                value={menu.title}
                onChange={(title) => updateMenuItem(key, { title })}
              >
                <Label>Tittel</Label>
                <Input />
              </TextField>
              <ComboBox<PageOption>
                fullWidth
                allowsEmptyCollection
                defaultFilter={comboIncludeAllFilter}
                inputValue={pageInput}
                items={options}
                value={menu.pageId ? menu.pageId : null}
                onChange={(selected: Key | null) => {
                  if (selected === null) {
                    updateMenuItem(key, { pageId: "", pageTitle: "" });
                    setPageInputByMenu((prev) => ({ ...prev, [key]: "" }));
                    return;
                  }
                  const id = String(selected);
                  const picked = options.find((item) => item._id === id);
                  updateMenuItem(key, {
                    pageId: id,
                    pageTitle: picked?.title ?? id,
                  });
                  setPageInputByMenu((prev) => ({
                    ...prev,
                    [key]: picked?.title ?? id,
                  }));
                }}
                onInputChange={(value) => {
                  if (menu.pageId && value !== menu.pageTitle) {
                    updateMenuItem(key, { pageId: "", pageTitle: "" });
                  }
                  setPageInputByMenu((prev) => ({ ...prev, [key]: value }));
                  scheduleSearch(key, value);
                }}
              >
                <Label>Lenket side</Label>
                <ComboBox.InputGroup>
                  <Input placeholder="Velg side eller skriv minst 2 tegn for å søke" />
                  <ComboBox.Trigger />
                </ComboBox.InputGroup>
                <ComboBox.Popover>
                  <ListBox<PageOption>>
                    {(item: PageOption) => (
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
            </div>
          );
        })}
      </section>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {statusMessage ? <p className="text-sm text-green-700">{statusMessage}</p> : null}

      <div className="pt-2">
        <CustomButton onPress={saveSettings} isPending={isSaving} isDisabled={!isDirty}>
          Lagre innstillinger
        </CustomButton>
      </div>
    </div>
  );
}
