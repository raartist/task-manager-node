const express = require("express");
const router = new express.Router();
const isValidObjectId = require("mongoose").isValidObjectId;
const Task = require("../models/task");

router.post("/createTask", (req, res) => {
  const task = new Task(req.body);

  task
    .save()
    .then(() => {
      res.status(201);
      res.send({ message: "Task created successfully!", data: req.body });
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});

router.get("/getTasks", (req, res) => {
  Task.find({})
    .then((tasks) => {
      if (!tasks) {
        return res.status(204).send();
      }
      res.status(200).send(tasks);
    })
    .catch((e) => res.status(500).send(e.message));
});

router.get("/getTaskById/:id", (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ message: "Id is invalid!" });
  }
  Task.findOne({ _id: req.params.id })
    .then((task) => {
      if (!task) {
        return res.status(404).send({ error: "Task not found with the given Id!" });
      }
      res.send(task);
    })
    .catch((e) => res.status(500).send(e.message));
});

router.delete("/deleteTask/:id", (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ message: "Id is invalid!" });
  }
  Task.findByIdAndDelete(req.params.id)
    .then((task) => {
      if (!task) {
        return res.status(404).send({ message: "No task found with given id!" });
      }
      res.status(200).send(task);
    })
    .catch((e) => res.status(500).send({ message: e.message }));
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
