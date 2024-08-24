import { FC, useMemo } from "react";
import { useGetUsers } from "./useGetUsers";

export const Users: FC = () => {
  const SERVER_HTTP_API = useMemo(() => `http://localhost:4000`, []);
  const WEBSOCKET_API = useMemo(() => `http://localhost:2000`, []);

  const shortPollingUsers = useGetUsers({
    SERVER_HTTP_API,
    WEBSOCKET_API,
    delay: 3000,
    getType: "shortPolling",
  });

  const longPollingUsers = useGetUsers({
    SERVER_HTTP_API,
    WEBSOCKET_API,
    delay: 0,
    getType: "longPolling",
  });

  const webSocketUsers = useGetUsers({
    SERVER_HTTP_API,
    WEBSOCKET_API,
    delay: 0,
    getType: "webSocket",
  });

  const serverSentEventUsers = useGetUsers({
    SERVER_HTTP_API,
    WEBSOCKET_API,
    delay: 0,
    getType: "serverSentEvent",
  });

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
      <ul>
        <h2>Web Socket Users:</h2>
        {webSocketUsers.map(({ id, firstName, lastName }) => (
          <li key={id}>{`${firstName} ${lastName} ${id}`}</li>
        ))}
      </ul>
      <ul>
        <h2>Server Sent Event Users:</h2>
        {serverSentEventUsers.map(({ id, firstName, lastName }) => (
          <li key={id}>{`${firstName} ${lastName} ${id}`}</li>
        ))}
      </ul>
    </>
  );
};
