const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = isValidId;

const passwordHashing = async (password, type, hashed) => {
  if (type === "enc") {
    await bcryptjs
      .hash(password, 8)
      .then((res) => res)
      .catch((e) => console.log(e));
  } else if (type === "dec") {
    await bcryptjs.compare(password, hashed).then((res) => res);
  }
};

module.exports = passwordHashing;
