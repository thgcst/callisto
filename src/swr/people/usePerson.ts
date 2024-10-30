import { Person } from "@prisma/client";
import useSWR from "swr";

type Data = Omit<Person, "password">;

function usePerson() {
  const { data, error, isValidating, isLoading } = useSWR<Data>(`/api/person`);

  return {
    person: data,
    isLoading,
    isValidating,
    error,
  };
}

export default usePerson;
