import { User } from "@prisma/client";
import useSWR from "swr";

type Data = Omit<User, "password">;

function useMe() {
  const { data, error, isValidating, isLoading } = useSWR<Data>(`/api/me`);

  return {
    me: data,
    isLoading,
    isValidating,
    error,
  };
}

export default useMe;
