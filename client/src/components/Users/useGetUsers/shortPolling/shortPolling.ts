import { User } from "../../types";
import { request } from "../request";
import { Response } from "../types";

interface IShortPolling {
  timeoutId: React.MutableRefObject<number | null>;
  lastUserNumber: React.MutableRefObject<number>;
  controllerRef: React.MutableRefObject<AbortController | null>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  SERVER_HTTP_API: string;
  delay: number;
}

export const shortPolling = ({
  timeoutId,
  lastUserNumber,
  controllerRef,
  setUsers,
  SERVER_HTTP_API,
  delay,
}: IShortPolling) => {
  console.log("shortPolling");
  timeoutId.current = setTimeout(async () => {
    try {
      const res = await request({
        SERVER_HTTP_API,
        controllerRef,
        getType: "shortPolling",
        lastUserNumber,
      });
      if (!res || !res.ok) throw new Error("SERVER_HTTP");
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
    shortPolling({
      timeoutId,
      lastUserNumber,
      controllerRef,
      setUsers,
      SERVER_HTTP_API,
      delay,
    });
  }, delay);
};
