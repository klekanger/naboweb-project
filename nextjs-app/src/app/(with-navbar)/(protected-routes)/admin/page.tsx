import Link from "next/link";
import {
  BookOpen,
  FileText,
  LayoutGrid,
  PenLine,
  Users,
} from "lucide-react";

const adminSections = [
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
  },
  {
    title: "Diverse dokumenter",
    description: "Last opp og administrer dokumenter som vedtekter, husfarger o.l.",
    href: "/admin/documents",
    icon: FileText,
  },
  {
    title: "Møtereferater",
    description: "Last opp og administrer referater fra møter og årsmøter.",
    href: "/admin/meeting-minutes",
    icon: BookOpen,
  },
  {
    title: "Brukere",
    description: "Administrer brukere, roller og tilganger.",
    href: "/user-admin-page",
    icon: Users,
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-semibold mb-2">Administrasjon</h1>
      <p className="text-foreground/60 mb-10">
        Her kan du administrere innhold på nettstedet.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminSections.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 p-5 rounded-xl border border-border hover:border-brand-secondary hover:bg-brand-secondary/5 transition-colors group"
          >
            <div className="mt-0.5 p-2 rounded-lg bg-brand-secondary/10 text-brand-secondary group-hover:bg-brand-secondary group-hover:text-white transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-foreground/60 mt-1">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
