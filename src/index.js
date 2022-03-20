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
const Task = require("./models/task");
const User = require("./models/user");

const func = async () => {
  const token = jwt.sign({ _id: "abc123" }, "heyyoufellas!", { expiresIn: "12 days" });
  console.log(token);

  const isverify = jwt.verify(token, "heyyoufellas!");
  console.log(isverify);
};

const main = async () => {
  // const task = await Task.findById("622ec0327f83958e11ae34e6");
  // await task.populate("owner");
  // console.log(task.owner);
  const id = "622ec01e7f83958e11ae34e1";

  const user = await User.findById(id);
  await user.populate("tasks");
  console.log(user.tasks);
};

// main();
