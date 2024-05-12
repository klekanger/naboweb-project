import { searchUser } from "@/app/actions/searchUser";
import { SearchUserType } from "@/types/types";
import { Button, Input } from "@nextui-org/react";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
    <div className="px-4 lg:px-6 py-4 text-left">
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
      <p>
        <strong>Viser fem første treff:</strong>
      </p>
      <p>{loading && "Laster..."}</p>
      <ul>
        {foundUsers.map((user) => (
          <li key={user.id}>{user?.email ?? "-"}</li>
        ))}
      </ul>
    </div>
  );
}
