import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "../types";
import { shortPolling } from "./shortPolling";
import { longPolling } from "./longPolling";
import { webSocket } from "./webSocket";
import { Response } from "./types";

type UseGetUsers = ({
  SERVER_HTTP_API,
  getType,
  delay,
}: {
  SERVER_HTTP_API: string;
  WEBSOCKET_API: string;
  getType: GetType;
  delay: number;
}) => User[];

type GetType = "shortPolling" | "longPolling" | "webSocket" | "serverSentEvent";

export const useGetUsers: UseGetUsers = ({
  SERVER_HTTP_API,
  WEBSOCKET_API,
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

  const webSocketMemo = useCallback(() => {
    webSocket({ WEBSOCKET_API, lastUserNumber, setUsers });
  }, [WEBSOCKET_API]);

  const serverSentEventMemo = useCallback(() => {
    const eventSource = new EventSource(
      `${SERVER_HTTP_API}/server-sent-event?last=${lastUserNumber.current}`
    );
    eventSource.onmessage = (event) => {
      const { users, last }: Response = JSON.parse(event.data);
      if (last === lastUserNumber.current) {
        return;
      }
      if (last < lastUserNumber.current) {
        lastUserNumber.current = last;
        setUsers(users);
      } else {
        lastUserNumber.current = last;
        setUsers((state) => [...state, ...users]);
      }
    };
  }, [SERVER_HTTP_API]);

  useEffect(() => {
    console.log("useEffect");
    if (getType === "longPolling") longPollingMemo();
    if (getType === "shortPolling") shortPollingMemo();
    if (getType === "webSocket") webSocketMemo();
    if (getType === "serverSentEvent") serverSentEventMemo();
    const timeout = timeoutId.current;
    const controller = controllerRef.current;
    return () => {
      if (timeout) clearTimeout(timeout);
      if (controller) controller.abort();
    };
  }, [
    longPollingMemo,
    shortPollingMemo,
    webSocketMemo,
    serverSentEventMemo,
    getType,
  ]);

  return users;
};
