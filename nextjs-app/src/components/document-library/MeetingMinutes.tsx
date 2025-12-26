"use client";

import {
  DocumentIcon,
  ExcelIcon,
  PdfIcon,
  PowerPointIcon,
  WordIcon,
} from "@/components/icons";
import Pagination from "@/components/common/Pagination";
import { formatDate } from "@/lib/format-date";
import { MeetingMinutesQueryResult } from "@/types/sanity.types";
import { Button, Input, Tooltip } from "@heroui/react";
import { ArrowBigLeft, FolderOpen, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import BackButton from "../BackButton";

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
        <Button as={Link} href="/information/1" startContent={<ArrowBigLeft />}>
          Gå tilbake
        </Button>
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
        <div className="relative w-full sm:max-w-[44%]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <SearchIcon className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            className="w-full pl-10"
            placeholder="Søk i dokumentnavn eller beskrivelse"
            value={filterValue}
            onChange={(e) => onSearchChange(e.target.value || "")}
          />
        </div>
        <div className="pl-2 pt-4">
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
              <tr>
                <th className="bg-brand-primary/20 text-sm font-bold md:text-base p-4 text-left w-[20%]">
                  Møte
                </th>
                <th className="bg-brand-primary/20 text-sm font-bold md:text-base p-4 text-left">
                  Beskrivelse
                </th>
                <th className="bg-brand-primary/20 text-sm font-bold md:text-lg p-4 text-left w-[20%]">
                  Oppdatert
                </th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender && itemsToRender.length > 0 ? (
                itemsToRender.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`text-left ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""}`}
                  >
                    <td className="p-4">
                      <Tooltip
                        content={
                          <div className="flex flex-row items-center gap-2 py-2 text-xs md:text-sm md:max-w-md">
                            Klikk for å vise alle dokumenter for dette møtet.
                          </div>
                        }
                        placement="top-start"
                        delay={1000}
                        color="secondary"
                        size="lg"
                      >
                        <Link
                          href={`/information/referater/${item._id}`}
                          className="hover:text-brand-secondary/80 hover:dark:text-brand-white/80 "
                        >
                          <span className="flex ">
                            <FolderOpen className="mr-2 h-auto" size="1em" />

                            {item.title}
                          </span>
                        </Link>
                      </Tooltip>
                    </td>

                    <td className="p-4">
                      <Tooltip
                        content={
                          <span className="flex flex-row items-center gap-2 py-2 text-xs md:text-sm md:max-w-md">
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
                          </span>
                        }
                        placement="top-start"
                        delay={1000}
                        color="secondary"
                        size="lg"
                      >
                        {item?.description && item.description.length > 75
                          ? item.description.substring(0, 75) + "..."
                          : item.description}
                      </Tooltip>
                    </td>
                    <td className="p-4">{formatDate(item._createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
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
