const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${appDir}/database.sqlite`,
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.memory = require("../models/memory.model.js")(sequelize, Sequelize);
db.Op = Op;


module.exports = db;
