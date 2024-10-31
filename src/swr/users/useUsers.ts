import useSWR from "swr";

import user from "@/models/user";

type Data = Awaited<ReturnType<typeof user.findAll>>;

type Payload = {
  approved?: boolean;
};

function useUsers({ approved }: Payload = {}) {
  const { data, error, isValidating, isLoading } = useSWR<Data>([
    "/api/users",
    { approved },
  ]);

  return {
    users: data || [],
    isLoading,
    isValidating,
    error,
  };
}

export default useUsers;
