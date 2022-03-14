const express = require("express");
require("./db/mongoose");
const app = express();

const port = process.env.PORT || 4500;

const userRouter = require("./router/user");
const taskRouter = require("./router/task");

app.use(express.json());
app.use([userRouter, taskRouter]);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

const jwt = require("jsonwebtoken");

const func = async () => {
  const token = jwt.sign({ _id: "abc123" }, "heyyoufellas!", { expiresIn: "12 days" });
  console.log(token);

  const isverify = jwt.verify(token, "heyyoufellas!");
  console.log(isverify);
};