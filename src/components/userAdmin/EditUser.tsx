import { searchUser } from "@/app/actions/searchUser";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SearchUserType } from "@/types/types";
import {
  Button,
  Input,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@nextui-org/react";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const CircleAdmin = () => (
  <Tooltip content="Administrator">
    <span className="rounded-full bg-danger/30 w-[1em] h-[1em] justify-center items-center p-2.5 inline-flex text-[1em] mr-1">
      A
    </span>
  </Tooltip>
);

const CircleEditor = () => (
  <Tooltip content="Redaktør">
    <span className="rounded-full bg-warning/30 w-[1em] h-[1em] justify-center items-center p-2.5 inline-flex text-[1em]">
      R
    </span>
  </Tooltip>
);

export default function EditUser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState<SearchUserType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (searchTerm: string) => {
    setFoundUsers([]);
    setLoading(true);
    const res = await searchUser(searchTerm);

    if ("success" in res) {
      setFoundUsers(res.success.users || []);
      setLoading(false);
    } else {
      setFoundUsers([]);
      setLoading(false);
    }
  };

  return (
    <div className="lg:px-6 py-4 text-left">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(searchTerm);
        }}
        className="flex flex-row gap-4 pb-8"
      >
        <Input
          placeholder="Søk etter bruker..."
          startContent={<SearchIcon />}
          onValueChange={setSearchTerm}
          value={searchTerm}
          className="w-full sm:max-w-[44%]"
        />
        <Button
          className="h-auto"
          type="submit"
          color="default"
          onPress={() => handleSubmit(searchTerm)}
        >
          Søk
        </Button>
      </form>
      {(foundUsers.length > 0 && (
        <p>
          <strong>
            Viser inntil fem første treff &ndash; klikk brukeren du vil
            redigere:
          </strong>
        </p>
      )) || (
        <p>Begynn å skrive i søkefeltet for å finne brukeren du vil endre.</p>
      )}

      <Table
        className="mb-16"
        shadow="none"
        isCompact
        aria-label="Tabell med oversikt over brukere"
        classNames={{
          base: "-ml-4",
        }}
      >
        <TableHeader>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Navn
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            E-post
          </TableColumn>

          <TableColumn className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base">
            Roller
          </TableColumn>
        </TableHeader>

        <TableBody emptyContent={loading && <LoadingSpinner />}>
          {foundUsers.map((user) => {
            let roles;
            if (Array.isArray(user.roles)) {
              roles = user.roles
                .map((role) =>
                  role === "admin" ? (
                    <CircleAdmin key={`${user.id}-admin`} />
                  ) : role === "editor" ? (
                    <CircleEditor key={`${user.id}-editor`} />
                  ) : null,
                )
                .sort();
            }

            return (
              <TableRow key={user.id} className="text-left">
                <TableCell className="hover:bg-brand-warning cursor-pointer">{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="hidden sm:table-cell">{roles}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
