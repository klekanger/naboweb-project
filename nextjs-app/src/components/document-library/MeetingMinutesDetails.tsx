"use client";

import { formatDate } from "@/lib/format-date";
import { ArrowBigLeft } from "lucide-react";
import { useMemo } from "react";
import BackButton from "../BackButton";
import CustomButton from "../CustomButton";
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
        <CustomButton href="/information/1">
          <ArrowBigLeft className="mr-2" />
          Gå tilbake
        </CustomButton>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl md:text-left md:text-4xl prose  mb-8">{title}</h1>
      <p>{description}</p>
      <div className="h-8" />
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

      <div className="h-8" />
      <div className="mb-16 overflow-x-auto">
        <table
          className="w-full min-w-[640px] border-collapse"
          aria-label="Tabell med oversikt over dokumenter"
        >
          <thead>
            <tr className="[&>th]:first:rounded-l-lg [&>th]:last:rounded-r-lg text-gray-500">
              <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left">
                Dokument
              </th>
              <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left hidden sm:table-cell">
                Type
              </th>
              <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left hidden sm:table-cell">
                Filstørrelse
              </th>
              <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left">
                Lastet opp
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDocuments && sortedDocuments.length > 0 ? (
              sortedDocuments.map((item, index) => (
                <tr
                  key={item.asset?._id}
                  className={`text-left [&>td]:first:rounded-l-lg [&>td]:last:rounded-r-lg ${index % 2 === 1 ? "bg-gray-200" : ""}`}
                >
                  <td className="px-3 py-1">
                    <a
                      href={item?.asset?.url ?? "#"}
                      target="blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-secondary/80"
                    >
                      {item.asset?.originalFilename ?? "N/A"}
                    </a>
                  </td>
                  <td className="hidden sm:table-cell px-3 py-1">
                    {item?.asset?.extension
                      ? item.asset.extension.toUpperCase()
                      : "-"}
                  </td>
                  <td className="hidden sm:table-cell px-3 py-1">
                    {item.asset?.size
                      ? `${(item.asset.size / 1024).toFixed(0)} kB`
                      : "-"}
                  </td>
                  <td className="px-3 py-1">
                    {item.asset?._createdAt
                      ? formatDate(item.asset._createdAt)
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-3 py-1 text-center text-gray-500">
                  Ingen dokumenter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BackButton buttonLink="/information/referater" />
    </>
  );
}
