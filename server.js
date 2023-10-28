const express = require("express");
const cors = require("cors");

const app = express();
app.use('/files', express.static('opt'))

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");

db.sequelize.sync();

// routes
require('./app/routes/auth/auth.routes')(app);
require('./app/routes/user/user.routes')(app);
require('./app/routes/fileupload/fileupload.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

//for testing purposes
module.exports = app