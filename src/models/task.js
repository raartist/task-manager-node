const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

taskSchema.pre("save", async function () {
  const task = this;
  console.log("task schema pre is working!!!");
});

const Task = mongoose.model("TAsks", taskSchema);
module.exports = Task;
