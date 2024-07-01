import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  last: number;
}

interface Response {
  users: User[];
  last: number;
}

export const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const lastUserNumber = useRef<number>(0);
  const SERVER_HTTP_API = useMemo(
    () => `http://localhost:4000/short-polling`,
    []
  );
  const delay = useMemo(() => 3000, []);
  const startShortPolling = useCallback(
    (delay: number) => {
      console.log("startShortPolling");
      setTimeout(async () => {
        try {
          const res = await fetch(
            `${SERVER_HTTP_API}?last=${lastUserNumber.current}`
          );
          if (!res) throw new Error("SERVER_HTTP");
          const jsonUsers: Response = await res.json();
          console.log(jsonUsers.last);
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
        startShortPolling(delay);
      }, delay);
    },
    [SERVER_HTTP_API]
  );

  useEffect(() => {
    console.log("useEffect");
    startShortPolling(delay);
  }, [startShortPolling, delay]);

  return (
    <ul>
      <h2>Users:</h2>
      {users.map(({ id, firstName, lastName }) => (
        <li key={id}>{`${firstName} ${lastName} ${id}`}</li>
      ))}
    </ul>
  );
};
