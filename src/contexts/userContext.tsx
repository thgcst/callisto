import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/router";

import { User } from "@prisma/client";
import nProgress from "nprogress";
import { toast } from "react-toastify";
import { useLocalStorage } from "usehooks-ts";

type UserContextType = {
  user: Omit<User, "password"> | null;
  isLoading: boolean;
  error: any;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

const refreshInterval = 600000; // 10 minutes

export const UserContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<UserContextType["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(undefined);
  const router = useRouter();

  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<
    (Exclude<UserContextType["user"], null> & { cacheTime: number }) | undefined
  >("user", undefined, {
    serializer: JSON.stringify,
    deserializer: (val) => {
      if (!val) return undefined;
      return JSON.parse(val);
    },
  });

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/user`);
      const responseBody = await response.json();

      if (response.status === 200) {
        const fetchedUser = responseBody as Exclude<
          UserContextType["user"],
          null
        >;

        const cachedUserProperties = {
          ...fetchedUser,
          cacheTime: Date.now(),
        };

        setUser(fetchedUser);
        setStoredUser(cachedUserProperties);
      } else if ([401, 403].includes(response.status)) {
        setUser(null);
        removeStoredUser();
      }
    } catch (error) {
      setError(error);
    }
  }, [removeStoredUser, setStoredUser]);

  useEffect(() => {
    (async () => {
      if (storedUser && isLoading) {
        setUser(storedUser);
        await fetchUser();
      }
      setIsLoading(false);
    })();

    if (isLoading) return;

    function onFocus() {
      setUser((user) => (storedUser?.name ? { ...user, ...storedUser } : null));
      if (refreshInterval < Date.now() - (storedUser?.cacheTime ?? 0))
        fetchUser();
    }
    addEventListener("focus", onFocus);

    return () => removeEventListener("focus", onFocus);
  }, [fetchUser, isLoading, storedUser]);

  const logout = useCallback(async () => {
    nProgress.start();
    try {
      const response = await fetch("/api/sessions", {
        method: "DELETE",
      });

      if (response.status === 200) {
        localStorage.clear();
        setUser(null);
        router.push("/");
      }
    } catch (error) {
      toast.error("Erro ao deslogar");
      nProgress.remove();
      setError(error);
    }
  }, [router]);

  const userContextValue = {
    user,
    isLoading,
    error,
    fetchUser,
    logout,
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
