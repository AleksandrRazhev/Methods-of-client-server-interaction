import express from "express";
import { faker } from "@faker-js/faker";

const HTTP_PORT = 4000;
const app = express();
app.use(express.json());
const usersDB = [];

app.get("/", (req, res) => {
  res.send("it's working");
});

app.get("/short-polling", (req, res) => {
  res.status(200).json(usersDB);
});

app.listen(HTTP_PORT, () => {
  console.log("server is running on port " + HTTP_PORT);
});

(function addUser() {
  const delay = Math.floor(Math.random() * 5000);
  setTimeout(() => {
    usersDB.push(generateUser());
    if (usersDB.length < 100) addUser();
  }, delay);
})();

function generateUser() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
}
