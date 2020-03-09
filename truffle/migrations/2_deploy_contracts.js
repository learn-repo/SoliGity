const Ethbay = artifacts.require("Ethbay");
const Hospital = artifacts.require("Hospital");
const MovieSys = artifacts.require("MovieSys");
const SoliGity = artifacts.require("SoliGity");

module.exports = function (deployer) {
  deployer.deploy(Ethbay);
  deployer.deploy(Hospital);
  deployer.deploy(MovieSys);
  deployer.deploy(SoliGity);
};
