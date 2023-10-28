module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("memory", {
    username: {
      type: Sequelize.STRING
    },
    filename: {
      type: Sequelize.STRING
    },
    memoryUsed: {
      type: Sequelize.STRING
    },
    timeSpent: {
      type: Sequelize.STRING
    }
  });

  return User;
};
