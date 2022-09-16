const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//mongoose.set("debug", true);

let connect = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      process.env.mongoUrl,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      function () {
        try {
          console.log("Successfully connected...");
          resolve(`Mongo connected at ${process.env.mongoUrl}`);
        } catch (err) {
          return reject({
            message:
              `Connection erorr to MongoDB at ${process.env.mongoUrl}` + err,
          });
        }
      }
    );
  });
};

module.exports = {
  connect,
};