import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "../types";

type UseShortPolling = ({
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

export const useShortPolling: UseShortPolling = ({
  delay,
  SERVER_HTTP_API,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const lastUserNumber = useRef<number>(0);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shortPolling = useCallback(() => {
    console.log("shortPolling");
    timeoutId.current = setTimeout(async () => {
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
      shortPolling();
    }, delay);
  }, [delay, SERVER_HTTP_API, setUsers]);

  useEffect(() => {
    console.log("useEffect");
    shortPolling();
    const timeout = timeoutId.current;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [shortPolling]);

  return users;
};
