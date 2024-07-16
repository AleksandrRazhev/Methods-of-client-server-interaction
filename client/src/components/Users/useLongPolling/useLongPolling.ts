import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "../types";

type UseLongPolling = ({
  SERVER_HTTP_API,
}: {
  SERVER_HTTP_API: string;
}) => User[];

interface Response {
  users: User[];
  last: number;
}

export const useLongPolling: UseLongPolling = ({ SERVER_HTTP_API }) => {
  const [users, setUsers] = useState<User[]>([]);
  const lastUserNumber = useRef<number>(0);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const longPullingRequest = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    return fetch(
      `${SERVER_HTTP_API}/long-polling?last=${lastUserNumber.current}`,
      { signal: controllerRef.current.signal }
    );
  }, [SERVER_HTTP_API]);

  const longPolling = useCallback(() => {
    console.log("longPolling");
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    timeoutId.current = setTimeout(async () => {
      try {
        const res = await longPullingRequest();
        if (!res.ok) throw new Error("SERVER_HTTP");
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
      longPolling();
    }, 0);
  }, [longPullingRequest]);

  useEffect(() => {
    console.log("useEffect");
    longPolling();
    const timeout = timeoutId.current;
    const controller = controllerRef.current;
    return () => {
      if (timeout) clearTimeout(timeout);
      if (controller) controller.abort();
    };
  }, [longPolling]);

  return users;
};
