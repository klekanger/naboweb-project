"use client";

import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/constants";
import FacebookIcon from "@/components/icons/Facebook";
import LinkedInIcon from "@/components/icons/LinkedIn";
import EmailIcon from "@/components/icons/Email";

type ShareButtonsProps = {
  title: string;
  shareText?: string;
  className?: string;
};

export default function ShareButtons({
  title,
  shareText = "Del dette",
  className,
}: ShareButtonsProps) {
  const pathname = usePathname();
  const fullUrl = `${SITE_URL}${pathname}`;

  return (
    <div className={`flex items-center gap-4 py-8 ${className}`}>
      <span className="text-gray-600 text-sm">{shareText}:</span>
      <div className="flex gap-4">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          aria-label="Del på Facebook"
          title="Del på Facebook"
        >
          <FacebookIcon className="w-5 h-5 text-brand-black hover:text-brand-secondary transition-colors" />
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(fullUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          aria-label="Del på LinkedIn"
          title="Del på LinkedIn"
        >
          <LinkedInIcon className="w-5 h-5 text-brand-black hover:text-brand-secondary transition-colors" />
        </a>

        {/* Email */}
        <a
          href={`mailto:?subject=${title ?? "Artikkel fra Gartnerihagen"}&body=${encodeURIComponent(fullUrl)}`}
          className="hover:opacity-80 transition-opacity"
          aria-label="Del via e-post"
          title="Del via e-post"
        >
          <EmailIcon className="w-5 h-5 text-brand-black hover:text-brand-secondary transition-colors" />
        </a>
      </div>
    </div>
  );
}
