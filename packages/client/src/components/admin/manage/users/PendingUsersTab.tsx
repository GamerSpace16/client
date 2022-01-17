import { useTranslations } from "use-intl";
import { Tab } from "@headlessui/react";
import { Button } from "components/Button";
import { Table } from "components/shared/Table";
import useFetch from "lib/useFetch";
import { User } from "types/prisma";

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  search: string;
}

export function PendingUsersTab({ setUsers, search, users }: Props) {
  const t = useTranslations("Management");
  const common = useTranslations("Common");
  const { execute } = useFetch();

  async function handleAcceptOrDecline(user: Pick<User, "id">, type: "accept" | "decline") {
    const { json } = await execute(`/admin/manage/users/pending/${user.id}/${type}`, {
      method: "POST",
    });

    if (json) {
      setUsers((users) =>
        users.map((v) =>
          v.id === user.id
            ? { ...v, whitelistStatus: type === "accept" ? "ACCEPTED" : "DECLINED" }
            : v,
        ),
      );
    }
  }

  return (
    <Tab.Panel>
      <h3 className="my-4 text-xl font-semibold">{t("pendingUsers")}</h3>

      {users.length <= 0 ? (
        <p>There are no users pending access.</p>
      ) : (
        <Table
          filter={search}
          data={users.map((user) => ({
            username: user.username,

            actions: (
              <>
                <Button
                  onClick={() => handleAcceptOrDecline(user, "accept")}
                  className="mr-2"
                  variant="success"
                >
                  {common("accept")}
                </Button>
                <Button onClick={() => handleAcceptOrDecline(user, "decline")} variant="danger">
                  {common("decline")}
                </Button>
              </>
            ),
          }))}
          columns={[
            { Header: "Username", accessor: "username" },
            { Header: common("actions"), accessor: "actions" },
          ]}
        />
      )}
    </Tab.Panel>
  );
}