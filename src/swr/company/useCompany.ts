import useSWR from "swr";

import company from "@/models/company";

type Data = Awaited<ReturnType<typeof company.findOneById>>;

function useCompany(companyId?: string) {
  const { data, error, isValidating, isLoading, mutate } = useSWR<Data>(
    companyId ? `/api/companies/${companyId}` : null,
  );

  return {
    company: data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export default useCompany;
