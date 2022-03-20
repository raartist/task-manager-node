const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const isValidObjectId = require("mongoose").isValidObjectId;
const Task = require("../models/task");

router.post("/createTask", auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user._id });

    await task.save();

    res.status(201);
    res.send({ message: "Task created successfully!", task });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

//getTasks?limit=2&skip=2
//getTasks?sortBy=createdAt:desc
router.get("/getTasks", auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/getTaskById/:id", auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ message: "Id is invalid!" });
  }
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ error: "Task not found with the given Id!" });
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/deleteTask/:id", auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ message: "Id is invalid!" });
  }
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ message: "No task found with given id!" });
    }
    res.send(task);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.patch("/updateTask/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ message: "Id is invalid!" });
  }

  const updates = Object.keys(req.body);
  const allowedKeys = ["description", "completed"];
  const isValidOperation = updates.every((update) => allowedKeys.includes(update));

  if (!isValidOperation) {
    return res
      .status(400)
      .send({ message: "Key you provided is not valid to update!", allowedKeys });
  }
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).send({ error: "Task not found with the given id!" });
    }

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();

    res.send(task);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
});

module.exports = router;
