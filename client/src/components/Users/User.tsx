import { FC, useMemo } from "react";
import { useStartShortPolling } from "./useStartShortPolling";

export const Users: FC = () => {
  const SERVER_HTTP_API = useMemo(() => `http://localhost:4000`, []);
  const delay = useMemo(() => 3000, []);

  const shortPollingUsers = useStartShortPolling({
    delay,
    SERVER_HTTP_API,
  });

  return (
    <ul>
      <h2>Short Polling Users:</h2>
      {shortPollingUsers.map(({ id, firstName, lastName }) => (
        <li key={id}>{`${firstName} ${lastName} ${id}`}</li>
      ))}
    </ul>
  );
};
