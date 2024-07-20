import { User } from "../../types";
import { Response } from "../types";

interface IWebSocket {
  WEBSOCKET_API: string;
  lastUserNumber: React.MutableRefObject<number>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const webSocket = ({
  WEBSOCKET_API,
  lastUserNumber,
  setUsers,
}: IWebSocket) => {
  console.log("webSocket");
  const ws = new WebSocket(`${WEBSOCKET_API}/ws`);
  ws.onopen = () => {
    console.log("web socket connected");
    ws.send(JSON.stringify({ last: lastUserNumber.current }));
  };
  ws.onmessage = (event) => {
    const data: Response = JSON.parse(event.data);
    const { users, last } = data;
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
  ws.onclose = () => console.log("web socket connection closed");
  ws.onerror = () => console.log("web socket error");
};
