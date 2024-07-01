import express from "express";
import cors from "cors";

import { faker } from "@faker-js/faker";

const HTTP_PORT = 4000;
const app = express();
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

app.listen(HTTP_PORT, () => {
  console.log("server is running on port " + HTTP_PORT);
});

(function addUser() {
  const delay = Math.floor(Math.random() * 5000);
  setTimeout(() => {
    usersDB.push(generateUser());
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
