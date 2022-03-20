const express = require("express");
const auth = require("../middleware/auth");
const router = new express.Router();
const isValidObjectId = require("mongoose").isValidObjectId;
const User = require("../models/user");

router.post("/createUser", async (req, res) => {
  const body = req.body;
  if (!body.password || !body.name || !body.email) {
    return res.status(400).send({ error: "Required key(s) is/are missing!" });
  }

  const result = await User.find({ email: body.email });

  if (result.length > 0) {
    return res.status(409).send({ error: "User already exists with given email!" });
  }

  try {
    const user = await User.create(body);

    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();

    res.send({ success: "Authenticated!", user, token });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    req.user.remove();
    res.send();
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.patch("/users/me", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedKeys = ["name", "email", "age", "password"];
    const isValidOperation = updates.every((update) => allowedKeys.includes(update));
    if (!isValidOperation) {
      return res
        .status(400)
        .send({ error: "Key you provided is not valid to update!", allowedKeys });
    }

    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
