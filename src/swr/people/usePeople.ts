import { Person } from "@prisma/client";
import useSWR from "swr";

type Data = (Omit<Person, "password"> & {
  activated: boolean;
  _count: {
    session: number;
  };
})[];

function usePeople() {
  const { data, error, isValidating, isLoading } = useSWR<Data>(`/api/people`);

  return {
    people: data || [],
    isLoading,
    isValidating,
    error,
  };
}

export default usePeople;
