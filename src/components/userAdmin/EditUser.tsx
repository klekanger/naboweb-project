import { Button, Input } from "@nextui-org/react";
import { SearchIcon } from "lucide-react";
import { searchUser } from "@/app/actions/searchUser";
import { useEffect, useState } from "react";
import { SearchUserType } from "@/types/types";

export default function EditUser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState<SearchUserType[]>([]);

  const handleSubmit = async (searchTerm: string) => {
    const res = await searchUser(searchTerm);

    if ("success" in res) {
      setFoundUsers(res.success.users || []);
    } else {
      setFoundUsers([]);
    }
  };

  return (
    <div className="px-4 lg:px-6 py-4 text-left">
      <div className="flex flex-row gap-4 pb-8">
        <Input
          placeholder="Søk etter bruker..."
          startContent={<SearchIcon />}
          onValueChange={setSearchTerm}
          value={searchTerm}
          className="w-full sm:max-w-[44%]"
          onSubmit={() => handleSubmit(searchTerm)}
        />
        <Button
          className="h-auto"
          type="submit"
          color="default"
          onPress={() => handleSubmit(searchTerm)}
        >
          Søk
        </Button>
      </div>
      <p>
        <strong>Viser fem første treff:</strong>
      </p>
      <ul>
        {foundUsers.map((user) => (
          <li key={user.id}>{user?.email ?? "-"}</li>
        ))}
      </ul>
    </div>
  );
}
