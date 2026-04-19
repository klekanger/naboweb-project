"use client";

import Pagination from "@/components/common/Pagination";
import {
  ExcelIcon,
  PdfIcon,
  PowerPointIcon,
  WordIcon,
} from "@/components/icons";
import { formatDate } from "@/lib/format-date";
import { MeetingMinutesQueryResult } from "@/types/sanity.types";
import { Tooltip } from "@heroui/react";
import { ArrowBigLeft, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import BackButton from "../BackButton";
import CustomButton from "../CustomButton";
import CustomSearchInput from "../CustomSearchInput";

type Props = {
  documents: Array<
    Pick<
      MeetingMinutesQueryResult[0],
      | "_id"
      | "title"
      | "description"
      | "meetingDate"
      | "meetingPlace"
      | "tags"
      | "documentCount"
      | "_createdAt"
      | "_updatedAt"
    >
  >;
  rowsPerPage?: number;
  startPage?: number;
};

type FileTypes = {
  [key: string]:
    | typeof WordIcon
    | typeof ExcelIcon
    | typeof PdfIcon
    | typeof PowerPointIcon;
};

const fileTypes: FileTypes = {
  ".pdf": PdfIcon,
  ".doc": WordIcon,
  ".docx": WordIcon,
  ".xls": ExcelIcon,
  ".xlsx": ExcelIcon,
  ".ppt": PowerPointIcon,
  ".pptx": PowerPointIcon,
};

export default function MeetingMinutes({
  documents,
  rowsPerPage = 10,
  startPage = 1,
}: Props) {
  const [page, setPage] = useState(startPage);
  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);
  const [detailView, setDetailView] = useState(false);

  if (!documents) {
    return (
      <>
        <p className="pb-4">Ingen dokumenter</p>
        <CustomButton href="/information/1">
          <ArrowBigLeft className="h-5 w-5 mt-1.5" />
          Gå tilbake
        </CustomButton>
      </>
    );
  }

  const pages = Math.ceil(documents.length / rowsPerPage);

  const filteredItems = useMemo(() => {
    let filteredItems = [...documents];

    if (hasSearchFilter) {
      filteredItems = filteredItems.filter(
        (item) =>
          (item.title &&
            item.title.toLowerCase().includes(filterValue.toLowerCase())) ||
          (item.description &&
            item.description.toLowerCase().includes(filterValue.toLowerCase())),
      );
    }

    return filteredItems;
  }, [documents, filterValue, hasSearchFilter]);

  const itemsToRender = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div>
        <div className="flex gap-2 max-w-md py-2">
          <CustomSearchInput
            value={filterValue}
            onChange={(value) => onSearchChange(value || "")}
            placeholder="Søk i dokumentnavn eller beskrivelse"
          />
        </div>
        <div className="pl-2 py-4">
          <span className="font-semibold">Antall dokumenter: </span>
          {filteredItems.length.toString()}
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, filteredItems.length]);

  return (
    <>
      <div className="mb-16">
        {topContent}
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[640px] border-collapse"
            aria-label="Tabell med oversikt over dokumenter"
          >
            <thead>
              <tr className="[&>th]:first:rounded-l-lg [&>th]:last:rounded-r-lg text-gray-500">
                <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left w-[20%]">
                  Møte
                </th>
                <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left">
                  Beskrivelse
                </th>
                <th className="bg-brand-primary/20 text-sm font-bold md:text-lg px-3 py-2 text-left w-[20%]">
                  Oppdatert
                </th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender && itemsToRender.length > 0 ? (
                itemsToRender.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`text-left [&>td]:first:rounded-l-lg [&>td]:last:rounded-r-lg ${index % 2 === 1 ? "bg-gray-200" : ""}`}
                  >
                    <td className="px-3 py-1">
                      <Tooltip delay={1000}>
                        <Tooltip.Trigger>
                          <Link
                            href={`/information/referater/${item._id}`}
                            className="hover:text-brand-secondary/80"
                          >
                            <span className="flex ">
                              <FolderOpen className="mr-2 h-auto" size="1em" />
                              {item.title}
                            </span>
                          </Link>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          placement="top start"
                          className="bg-secondary text-brand-white"
                        >
                          <div className="flex flex-row items-center gap-2 py-2 text-xs md:text-sm md:max-w-md">
                            Klikk for å vise alle dokumenter for dette møtet.
                          </div>
                        </Tooltip.Content>
                      </Tooltip>
                    </td>

                    <td className="px-3 py-1">
                      <Tooltip delay={1000}>
                        <Tooltip.Trigger>
                          <Link
                            href={`/information/referater/${item._id}`}
                            className="hover:text-brand-secondary/80"
                          >
                            <span>
                              {item?.description && item.description.length > 75
                                ? item.description.substring(0, 75) + "..."
                                : item.description}
                            </span>
                          </Link>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          placement="top start"
                          className="bg-secondary text-brand-white"
                        >
                          <div className="flex flex-row items-center gap-2 py-2 text-xs md:text-sm md:max-w-md">
                            <div>
                              <h2 className="text-lg font-semibold pb-4">
                                {item.title}
                              </h2>
                              {item.description && (
                                <div>
                                  {item.description}
                                  <hr className="my-4" />
                                </div>
                              )}

                              <hr className="my-4 border-brand-white" />

                              <div>
                                <strong>Sted: </strong>
                                {item?.meetingPlace ?? "Ikke oppgitt"}
                              </div>
                              <div>
                                <strong>Tid: </strong>
                                {formatDate(item?.meetingDate) ??
                                  "Ikke oppgitt"}
                              </div>

                              <div>
                                <strong>Antall filer: </strong>
                                {item?.documentCount ?? 0}
                              </div>

                              <div className="h-4" />
                              <div>
                                <strong>Tagger: </strong>

                                {item?.tags &&
                                  item?.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="bg-brand-secondary/50 text-brand-white px-4 rounded-md font-extralight text-xs m-1"
                                    >
                                      {tag.toUpperCase()}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </Tooltip.Content>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-1">{formatDate(item._createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-1 text-center text-gray-500"
                  >
                    Ingen elementer å vise
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex w-full justify-center mt-4">
            <Pagination
              isCompact
              isDisabled={hasSearchFilter}
              showControls
              color="secondary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        )}
      </div>
      <BackButton buttonLink="/information" />
    </>
  );
}
