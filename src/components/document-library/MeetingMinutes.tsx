"use client";

import {
  DocumentIcon,
  ExcelIcon,
  PdfIcon,
  PowerPointIcon,
  WordIcon,
} from "@/components/icons";
import { formatDate } from "@/lib/format-date";
import {
  MEETING_MINUTES_QUERYResult,
  OTHER_DOCUMENTS_QUERYResult,
} from "@/types/sanity.types";
import {
  Button,
  Input,
  Pagination,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@nextui-org/react";
import { ArrowBigLeft, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import BackButton from "../BackButton";

type Props = {
  documents: Array<
    Pick<
      MEETING_MINUTES_QUERYResult[0],
      | "_id"
      | "title"
      | "description"
      | "meetingDate"
      | "meetingPlace"
      | "tags"
      | "meetingDocuments"
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

export default function DocumentMeetingMinutes({
  documents,
  rowsPerPage = 10,
  startPage = 1,
}: Props) {
  const [page, setPage] = useState(startPage);
  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);

  console.log("DocumentMeetingMinutes", documents);

  if (!documents) {
    return (
      <>
        <p className="pb-4">Ingen dokumenter</p>
        <Button as={Link} href="/informasjon/1" startContent={<ArrowBigLeft />}>
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
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Søk i dokumentnavn eller beskrivelse"
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
        <div className="pl-2 pt-4">
          <span className="font-semibold">Antall dokumenter: </span>
          {filteredItems.length.toString()}
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, filteredItems.length]);

  // helper function to get the file extension from item.filename
  const returnIconFromFileType = (fileName: string) => {
    const fileExtension = fileName.split(".").pop();
    const fileType = fileTypes[`.${fileExtension}`];

    if (fileType === undefined) {
      return DocumentIcon;
    } else {
      return fileType;
    }
  };

  return (
    <>
      <Table
        className="mb-16"
        aria-label="Tabell med oversikt over dokumenter"
        isStriped
        topContent={topContent}
        bottomContent={
          pages > 1 && (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                isDisabled={hasSearchFilter}
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          )
        }
      >
        <TableHeader>
          <TableColumn
            className="bg-brand-primary/20 text-sm font-bold md:text-base"
            width={"20%"}
          >
            Møte
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Beskrivelse
          </TableColumn>

          <TableColumn
            className="bg-brand-primary/20 text-sm font-bold md:text-lg"
            width={"20%"}
          >
            Oppdatert
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={"Ingen elementer å vise"}>
          {(itemsToRender
            ? itemsToRender.map((item) => {
                return (
                  <TableRow key={item._id} className="text-left">
                    <TableCell>
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
                                {item?.meetingDocuments?.length ?? 0}
                              </div>

                              <Spacer y={4} />
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
                        <Link
                          href={"#"}
                          className="hover:text-brand-secondary/80 hover:dark:text-brand-white/80 "
                        >
                          {item.title}
                        </Link>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Tooltip
                        content={
                          <span className="flex flex-row items-center gap-2 py-2 text-xs md:text-sm md:max-w-md">
                            <div>
                              <h2 className="text-lg font-semibold pb-4">
                                {item.title}
                              </h2>
                              {item.description && (
                                <div>{item.description}</div>
                              )}
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
                    </TableCell>
                    <TableCell>{formatDate(item._createdAt)}</TableCell>
                  </TableRow>
                );
              })
            : null) ?? []}
        </TableBody>
      </Table>
      <BackButton buttonLink="/informasjon" />
    </>
  );
}
