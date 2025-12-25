import { Crown, UserCheck, UserCog, UserPlus2, Users } from "lucide-react";
import type { NewUser } from "@/types/types";

export const menuElements = [
  {
    id: 0, // Which SidebarMenu.ITEM to display. 0 is the first item in the enum.
    name: "Vis brukere",
    description:
      "Viser alle brukere som er registrert, sortert etter etternavn og deretter fornavn.<br />Du kan bruke søkefeltet for å finne en bestemt bruker (søker i både e-post og navn).",
    menuIcon: Users,
  },
  {
    id: 1,
    name: "Inviter bruker",
    description:
      "Inviter en bruker til å opprette en konto. Brukeren vil motta en lenke på e-post for å opprette kontoen sin.",
    menuIcon: UserCheck,
  },
  {
    id: 2,
    name: "Ny bruker",
    description:
      "Opprett en ny bruker. Du må selv informere brukeren om at kontoen er opprettet og be vedkommende om å logge inn.",
    menuIcon: UserPlus2,
  },
  {
    id: 3,
    name: "Endre bruker",
    description: "Endre en allerede eksisterende bruker (navn eller roller).",
    menuIcon: UserCog,
  },
  {
    id: 4,
    name: "Superbrukere",
    description:
      "Oversikt over brukere med utvidede rettigheter. <em>Administratorer</em> har tilgang til alle funksjoner og kan opprette brukere og endre roller. <em>Redaktører</em> kan legge til nytt innhold på sidene.",
    menuIcon: Crown,
  },
];

export const validateEmail = (value: string): boolean => {
  if (!value || typeof value !== "string") return false;
  return !!value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
};

export const validateForm = (user: NewUser): boolean => {
  if (!user) return false;
  return (
    validateEmail(user?.email) &&
    user?.firstName !== "" &&
    user?.lastName !== ""
  );
};

export const isEmailInvalid = (emailValue: string): boolean => {
  if (emailValue === "") return false;
  return !validateEmail(emailValue);
};
