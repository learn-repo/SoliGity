const Ethbay = artifacts.require("Ethbay");
const Hospital = artifacts.require("Hospital");
const MovieSys = artifacts.require("MovieSys");

module.exports = function (deployer) {
  deployer.deploy(Ethbay);
  deployer.deploy(Hospital);
  deployer.deploy(MovieSys);
};
