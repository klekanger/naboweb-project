"use client";

import { formatDate } from "@/lib/format-date";
import {
  Button,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import BackButton from "../BackButton";
import { type MeetingMinutesByIdQueryResult } from "@/types/sanity.types";

type Props = {
  data: {
    _id: string;
    title: string | null;
    description: string | null;
    meetingDate: string | null;
    meetingPlace: string | null;
    tags: Array<string> | null;
    _createdAt: string;
    _updatedAt: string;
    meetingDocuments: Array<{
      asset: {
        url: string | null;
        _id: string;
        originalFilename: string | null;
        extension: string | null;
        size: number | null;
        _createdAt: string;
        _updatedAt: string;
      } | null;
    }> | null;
  };
};

export default function MeetingMinutesDetails({ data }: Props) {
  const {
    description,
    meetingDate,
    meetingDocuments,
    meetingPlace,
    tags,
    title,
  } = data ?? {};

  // Sort documents by filename using Norwegian locale
  const sortedDocuments = useMemo(() => {
    if (!meetingDocuments) return [];

    return [...meetingDocuments].sort((a, b) => {
      const collator = new Intl.Collator("nb-NO");
      const filenameA = a.asset?.originalFilename ?? "";
      const filenameB = b.asset?.originalFilename ?? "";
      return collator.compare(filenameA, filenameB);
    });
  }, [meetingDocuments]);

  if (!data) {
    return (
      <>
        <p className="pb-4">Ingen dokumenter</p>
        <Button as={Link} href="/information/1" startContent={<ArrowBigLeft />}>
          Gå tilbake
        </Button>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl md:text-left md:text-4xl prose lg:prose-xl mb-8">
        {title}
      </h1>
      <p>{description}</p>
      <Spacer y={8} />
      <p>
        <strong>Sted: </strong>
        {meetingPlace}
      </p>
      <p>
        <strong>Dato: </strong> {formatDate(meetingDate)}
      </p>
      <p>
        <strong>Tagger: </strong>
        {tags &&
          tags.map((tag) => (
            <span
              key={tag}
              className="bg-brand-secondary/50 text-brand-white px-4 rounded-md font-extralight text-xs m-1"
            >
              {tag.toUpperCase()}
            </span>
          ))}
      </p>

      <Spacer y={8} />
      <Table
        className="mb-16"
        aria-label="Tabell med oversikt over dokumenter"
        isStriped
      >
        <TableHeader>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Dokument
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base hidden sm:table-cell">
            Type
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base hidden sm:table-cell">
            Filstørrelse
          </TableColumn>

          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Lastet opp
          </TableColumn>
        </TableHeader>
        <TableBody>
          {(sortedDocuments
            ? sortedDocuments.map((item) => {
                return (
                  <TableRow key={item.asset?._id}>
                    <TableCell>
                      <a
                        href={item?.asset?.url ?? "#"}
                        target="blank"
                        rel="noopener noreferrer"
                      >
                        {item.asset?.originalFilename ?? "N/A"}
                      </a>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item?.asset?.extension
                        ? item.asset.extension.toUpperCase()
                        : "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.asset?.size
                        ? `${(item.asset.size / 1024).toFixed(0)} kB`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {item.asset?._createdAt
                        ? formatDate(item.asset._createdAt)
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            : null) ?? []}
        </TableBody>
      </Table>
      <BackButton buttonLink="/information/referater" />
    </>
  );
}
