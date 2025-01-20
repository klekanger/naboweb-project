"use client";

import {
  DocumentIcon,
  ExcelIcon,
  PdfIcon,
  PowerPointIcon,
  WordIcon,
} from "@/components/icons";
import { formatDate } from "@/lib/format-date";
import { OTHER_DOCUMENTS_QUERYResult } from "@/types/sanity.types";
import {
  Button,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { ArrowBigLeft, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import BackButton from "../BackButton";

type Props = {
  documents: Array<
    Pick<
      OTHER_DOCUMENTS_QUERYResult[0],
      | "title"
      | "description"
      | "tags"
      | "document"
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

export default function DocumentTable({
  documents,
  rowsPerPage = 10,
  startPage = 1,
}: Props) {
  const [page, setPage] = useState(startPage);
  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);

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
          <span className="font-semibold">Antall dokumenter:</span>{" "}
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
        topContent={topContent}
        isStriped
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
            width={"60%"}
          >
            Dokumentnavn
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
                const FileIcon = returnIconFromFileType(
                  item?.document?.asset?.url ?? "",
                );

                return (
                  <TableRow
                    key={item.document?.asset?._id}
                    className="text-left"
                  >
                    <TableCell>
                      <Tooltip
                        content={
                          <span className="flex flex-row items-center gap-2 py-2 text-xs md:text-sm md:max-w-md">
                            <div>
                              <FileIcon
                                fill="#fff"
                                height={2}
                                width={2}
                                className="md:mx-4"
                              />
                            </div>
                            <div>
                              {item.description && (
                                <>
                                  <span className="">{item.description}</span>
                                  <hr className="my-2" />
                                </>
                              )}
                              <span className="font-semibold">
                                <strong>Filnavn:</strong>{" "}
                                {item?.document?.asset?.originalFilename}
                              </span>
                            </div>
                          </span>
                        }
                        placement="top-start"
                        delay={1000}
                        color="secondary"
                        size="lg"
                      >
                        <a
                          href={item.document?.asset?.url ?? "#"}
                          className="hover:text-brand-secondary/80 hover:dark:text-brand-white/80 "
                          target="blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex ">
                            <FileIcon className="mr-2 h-auto" />
                            {item.title}
                          </span>
                        </a>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{formatDate(item._createdAt)}</TableCell>
                  </TableRow>
                );
              })
            : null) ?? []}
        </TableBody>
      </Table>
      <BackButton buttonLink="/information" />
    </>
  );
}
