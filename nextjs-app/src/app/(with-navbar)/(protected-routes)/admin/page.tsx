import {
  getSanityStudioFileDocumentsUrl,
  SANITY_STUDIO_BASE_URL,
} from "@/lib/sanityStudioUrls";
import { currentUser } from "@clerk/nextjs/server";
import {
  BookOpen,
  FileText,
  LayoutGrid,
  PenLine,
  Users,
  Upload,
  PanelsTopLeft,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type MenuIcon = ComponentType<SVGProps<SVGSVGElement>>;

type AdminSection = {
  title: string;
  description: string;
  href: string;
  icon: MenuIcon;
  external?: boolean;
  requiresAdmin?: boolean;
  advanced?: boolean;
};

const adminSections: AdminSection[] = [
  {
    title: "Blogginnlegg",
    description: "Opprett, rediger og slett blogginnlegg og nyhetsartikler.",
    href: "/admin/blog",
    icon: PenLine,
  },
  {
    title: "Dokumentmeny",
    description: "Rediger de fire snarveiknappene på Informasjon-siden.",
    href: "/admin/document-menu",
    icon: LayoutGrid,
    requiresAdmin: true,
  },
  {
    title: "Diverse dokumenter",
    description:
      "Last opp og administrer dokumenter som vedtekter, husfarger o.l.",
    href: "/admin/documents",
    icon: FileText,
    requiresAdmin: true,
  },
  {
    title: "Møtereferater",
    description: "Last opp og administrer referater fra møter og årsmøter.",
    href: "/admin/meeting-minutes",
    icon: BookOpen,
    requiresAdmin: true,
  },
  {
    title: "Brukere",
    description: "Administrer brukere, roller og tilganger.",
    href: "/user-admin-page",
    icon: Users,
    requiresAdmin: true,
  },
  {
    title: "Rediger innhold",
    description:
      "Åpne Sanity Studio for å redigere alt innhold på nettstedet. Krever egen innlogging.",
    href: SANITY_STUDIO_BASE_URL,
    icon: PanelsTopLeft,
    requiresAdmin: true,
    external: true,
    advanced: true,
  },
  {
    title: "Last opp filer",
    description:
      "Gå direkte til opplasting av øvrige dokumenter i Sanity Studio. Krever egen innlogging.",
    href: getSanityStudioFileDocumentsUrl(),
    icon: Upload,
    requiresAdmin: true,
    external: true,
    advanced: true,
  },
];

export default async function AdminPage() {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];
  const isAdmin = roles.includes("admin");

  const visibleSections = adminSections.filter(
    (section) => !section.requiresAdmin || isAdmin,
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-semibold mb-2">Administrasjon</h1>
      <p className="text-foreground/60 mb-10">
        Her kan du administrere innhold på nettstedet.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleSections.map(
          ({ title, description, href, icon: Icon, external, advanced }) => {
            const className = advanced
              ? "flex items-start gap-4 p-5 rounded-xl border border-red-500/35 bg-red-500/5 hover:border-red-500 hover:bg-red-500/10 transition-colors group"
              : "flex items-start gap-4 p-5 rounded-xl border border-border hover:border-brand-secondary hover:bg-brand-secondary/5 transition-colors group";

            const iconClassName = advanced
              ? "mt-0.5 p-2 rounded-lg bg-red-500/40 text-white group-hover:bg-red-600 transition-colors"
              : "mt-0.5 p-2 rounded-lg bg-brand-secondary/10 text-brand-secondary group-hover:bg-brand-secondary group-hover:text-white transition-colors";

            const inner = (
              <>
                <div className={iconClassName}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    {title}

                    {advanced ? (
                      <span className="text-xs text-red-700 dark:text-red-300 font-thin mt-2">
                        {" "}
                        AVANSERT
                      </span>
                    ) : (
                      ""
                    )}
                  </p>
                  <p className="text-sm text-foreground/60 mt-1">
                    {description}
                  </p>
                  {advanced ? (
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                      Ekstern lenke: krever separat innlogging i Sanity Studio.
                    </p>
                  ) : null}
                </div>
              </>
            );

            const key = `${href}-${title}`;

            if (external) {
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link key={key} href={href} className={className}>
                {inner}
              </Link>
            );
          },
        )}
      </div>
    </div>
  );
}
