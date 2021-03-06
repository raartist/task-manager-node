const express = require("express");
const auth = require("../middleware/auth");
const router = new express.Router();
const sharp = require("sharp");
const User = require("../models/user");
const multer = require("multer");

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

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a JPEG or PNG"));
    }
    cb(undefined, true);
  },
});

// upload.single("avatar")

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 300, height: 300 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
