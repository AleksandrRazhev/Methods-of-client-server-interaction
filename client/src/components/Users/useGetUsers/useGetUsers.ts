import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "../types";
import { shortPolling } from "./shortPolling";
import { longPolling } from "./longPolling";

type UseGetUsers = ({
  SERVER_HTTP_API,
  getType,
  delay,
}: {
  SERVER_HTTP_API: string;
  getType: GetType;
  delay: number;
}) => User[];

type GetType = "shortPolling" | "longPolling";

export const useGetUsers: UseGetUsers = ({
  SERVER_HTTP_API,
  getType,
  delay,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const lastUserNumber = useRef<number>(0);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const shortPollingMemo = useCallback(() => {
    shortPolling({
      controllerRef,
      timeoutId,
      lastUserNumber,
      setUsers,
      SERVER_HTTP_API,
      delay,
    });
  }, [delay, SERVER_HTTP_API]);

  const longPollingMemo = useCallback(() => {
    longPolling({
      controllerRef,
      timeoutId,
      lastUserNumber,
      setUsers,
      SERVER_HTTP_API,
      delay,
    });
  }, [delay, SERVER_HTTP_API]);

  useEffect(() => {
    console.log("useEffect");
    if (getType === "longPolling") longPollingMemo();
    if (getType === "shortPolling") shortPollingMemo();
    const timeout = timeoutId.current;
    const controller = controllerRef.current;
    return () => {
      if (timeout) clearTimeout(timeout);
      if (controller) controller.abort();
    };
  }, [longPollingMemo, getType, shortPollingMemo]);

  return users;
};
