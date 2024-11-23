import useSWR from "swr";

import individual from "@/models/individual";

export type Data = Awaited<ReturnType<typeof individual.findAll>>;

type Payload = {
  name?: string;
};

function useIndividuals(payload: Payload = {}) {
  const { data, error, isValidating, isLoading } = useSWR<Data>([
    `/api/individuals`,
    {
      name: payload.name,
    },
  ]);

  return {
    individuals: data || [],
    isLoading,
    isValidating,
    error,
  };
}

export default useIndividuals;
