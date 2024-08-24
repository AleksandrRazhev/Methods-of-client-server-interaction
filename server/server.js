import express from "express";
import cors from "cors";
import { EventEmitter } from "events";
import { WebSocketServer } from "ws";

import { faker } from "@faker-js/faker";

const HTTP_PORT = 4000;
const WS_PORT = 2000;
const app = express();
const eventEmitter = new EventEmitter();
const wws = new WebSocketServer({ port: WS_PORT }, () =>
  console.log(`web socket server is running on port ${WS_PORT}`)
);
wws.on("connection", (ws) => {
  let last = 0;
  ws.on("error", console.error);
  ws.on("message", (message) => {
    last = JSON.parse(message).last;
  });
  eventEmitter.on("add-user", () => {
    if (last === 0 || usersDB.length < 2) {
      last = usersDB.length;
      ws.send(JSON.stringify({ users: usersDB, last }));
    } else {
      const newUsers = usersDB.slice(last, usersDB.length);
      last = usersDB.length;
      ws.send(JSON.stringify({ users: newUsers, last }));
    }
  });
});
app.use(express.json());
app.use(cors());
let usersDB = [];

app.get("/", (req, res) => {
  res.send("it's working");
});

app.get("/short-polling", (req, res) => {
  const { last } = req.query;
  const users =
    last < usersDB.length ? usersDB.slice(last, usersDB.length) : usersDB;
  res.status(200).json({ users, last: usersDB.length });
});

app.get("/long-polling", (req, res) => {
  const { last } = req.query;
  eventEmitter.once("add-user", () => {
    const users =
      last < usersDB.length ? usersDB.slice(last, usersDB.length) : usersDB;
    res.status(200).json({ users, last: usersDB.length });
  });
});

app.get("/server-sent-event", (req, res) => {
  let last = Number(req.query.last) ?? 0;
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });
  eventEmitter.on("add-user", () => {
    const data = { users: usersDB, last: usersDB.length };
    if (last === 0 || usersDB.length < 2) {
      last = usersDB.length;
      res.write(`data: ${JSON.stringify(data)} \n\n`);
    } else {
      last = usersDB.length;
      data.users = usersDB.slice(last - 1, usersDB.length);
      res.write(`data: ${JSON.stringify(data)} \n\n`);
    }
  });
});

app.listen(HTTP_PORT, () => {
  console.log("http server is running on port " + HTTP_PORT);
});

(function addUser() {
  const delay = Math.floor(Math.random() * 10000);
  setTimeout(() => {
    usersDB.push(generateUser());
    eventEmitter.emit("add-user");
    if (usersDB.length > 10) usersDB = [];
    addUser();
  }, delay);
})();

function generateUser() {
  return {
    id: usersDB.length + 1,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
}
