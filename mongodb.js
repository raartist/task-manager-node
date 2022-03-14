const { MongoClient, ObjectId } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    return console.log("Can not connect to the mongodb database!");
  }
  const db = client.db(databaseName);
  //   db.collection("users").insertOne(
  //     {
  //       name: "Sharma",
  //       age: 23,
  //     },
  //     (error, result) => {
  //       if (error) {
  //         return console.log("Unable to insert the document!");
  //       }
  //       console.log(result);
  //     }
  //   );

  //   db.collection("tasks").insertMany(
  //     [
  //       {
  //         description: "take the dog out",
  //         completed: false,
  //       },
  //       {
  //         description: "take a bath",
  //         completed: true,
  //       },
  //       {
  //         description: "read a book",
  //         completed: false,
  //       },
  //     ],
  //     (error, result) => {
  //       if (error) {
  //         return console.log("can not add doc to db!");
  //       }
  //       console.log(result);
  //     }
  //   );

  //   db.collection("users")
  //     .find({ age: 23 })
  //     .toArray((err, result) => console.log(result));

  //   db.collection("users")
  //     .updateOne(
  //       { _id: new ObjectId("6226d9b76a4d8a43bda1f47e") },
  //       {
  //         $set: {
  //           name: "Ram mohan",
  //           age: 34,
  //         },
  //       }
  //     )
  //     .then((result) => console.log(result))
  //     .catch((err) => console.log(err));

  db.collection("tasks")
    .updateMany(
      { completed: true },
      {
        $set: {
          completed: false,
        },
      }
    )
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
});
