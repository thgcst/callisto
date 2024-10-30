import { User } from "@prisma/client";
import useSWR from "swr";

type Data = Omit<User, "password">;

function useUser() {
  const { data, error, isValidating, isLoading } = useSWR<Data>(`/api/user`);

  return {
    user: data,
    isLoading,
    isValidating,
    error,
  };
}

export default useUser;
