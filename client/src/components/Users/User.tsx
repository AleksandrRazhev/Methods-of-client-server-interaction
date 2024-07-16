import { FC, useMemo } from "react";
import { useShortPolling } from "./useShortPolling";
import { useLongPolling } from "./useLongPolling";

export const Users: FC = () => {
  const SERVER_HTTP_API = useMemo(() => `http://localhost:4000`, []);
  const delay = useMemo(() => 3000, []);

  const shortPollingUsers = useShortPolling({
    delay,
    SERVER_HTTP_API,
  });

  const longPollingUsers = useLongPolling({ SERVER_HTTP_API });

  return (
    <>
      <ul>
        <h2>Short Polling Users:</h2>
        {shortPollingUsers.map(({ id, firstName, lastName }) => (
          <li key={id}>{`${firstName} ${lastName} ${id}`}</li>
        ))}
      </ul>
      <ul>
        <h2>Long Polling Users:</h2>
        {longPollingUsers.map(({ id, firstName, lastName }) => (
          <li key={id}>{`${firstName} ${lastName} ${id}`}</li>
        ))}
      </ul>
    </>
  );
};
