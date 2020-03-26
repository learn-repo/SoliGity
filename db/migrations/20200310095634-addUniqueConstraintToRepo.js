"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint("Repos", ["owner", "name"], {
      type: "unique",
      name: "repoUnique"
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint("Repos", "repoUnique");
  }
};
