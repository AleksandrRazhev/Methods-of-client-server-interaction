import { GetType } from "../types";

interface IRequest {
  controllerRef: React.MutableRefObject<AbortController | null>;
  getType: GetType;
  SERVER_HTTP_API: string;
  lastUserNumber: React.MutableRefObject<number>;
}

export const request = ({
  controllerRef,
  getType,
  SERVER_HTTP_API,
  lastUserNumber,
}: IRequest) => {
  if (controllerRef.current) {
    controllerRef.current.abort();
  }
  controllerRef.current = new AbortController();
  const fetchString = (() => {
    if (getType === "shortPolling")
      return `${SERVER_HTTP_API}/short-polling?last=${lastUserNumber.current}`;
    if (getType === "longPolling")
      return `${SERVER_HTTP_API}/long-polling?last=${lastUserNumber.current}`;
  })();
  if (fetchString)
    return fetch(fetchString, { signal: controllerRef.current.signal });
};
