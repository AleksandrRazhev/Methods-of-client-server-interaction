import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "../types";

type UseStartShortPolling = ({
  delay,
  SERVER_HTTP_API,
}: {
  delay: number;
  SERVER_HTTP_API: string;
}) => User[];

interface Response {
  users: User[];
  last: number;
}

export const useStartShortPolling: UseStartShortPolling = ({
  delay,
  SERVER_HTTP_API,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const lastUserNumber = useRef<number>(0);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startShortPolling = useCallback(() => {
    console.log("startShortPolling");
    setTimeout(async () => {
      try {
        const res = await fetch(
          `${SERVER_HTTP_API}/short-polling?last=${lastUserNumber.current}`
        );
        if (!res) throw new Error("SERVER_HTTP");
        const jsonUsers: Response = await res.json();
        if (jsonUsers) {
          if (jsonUsers.last < lastUserNumber.current) {
            lastUserNumber.current = jsonUsers.last;
            setUsers(jsonUsers.users);
          } else if (jsonUsers.last !== lastUserNumber.current) {
            lastUserNumber.current = jsonUsers.last;
            setUsers((state) => [...state, ...jsonUsers.users]);
          }
        }
      } catch (error) {
        console.log(error);
      }
      startShortPolling();
    }, delay);
  }, [delay, SERVER_HTTP_API, setUsers]);

  useEffect(() => {
    console.log("useEffect");
    startShortPolling();
    const timeout = timeoutId.current;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [startShortPolling]);

  return users;
};
