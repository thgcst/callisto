import { User } from "@prisma/client";
import useSWR from "swr";

type Data = (Omit<User, "password"> & {
  activated: boolean;
  _count: {
    session: number;
  };
})[];

function useUsers() {
  const { data, error, isValidating, isLoading } = useSWR<Data>(`/api/users`);

  return {
    users: data || [],
    isLoading,
    isValidating,
    error,
  };
}

export default useUsers;
