import useSWR from "swr";

type Data = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  browser: string | null;
  cpu: string | null;
  deviceModel: string | null;
  deviceType: string | null;
  deviceVendor: string | null;
  osName: string | null;
  osVersion: string | null;
}[];

function useUserSessions(userId: string) {
  const { data, error, isValidating, isLoading } = useSWR<Data>(
    `/api/user/${userId}/sessions`
  );

  return {
    sessions: data || [],
    isLoading,
    isValidating,
    error,
  };
}

export default useUserSessions;
