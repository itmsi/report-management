const PowerBiHandler = require('./handler');

module.exports = {
  createPowerBi: PowerBiHandler.createPowerBi.bind(PowerBiHandler),
  getPowerBi: PowerBiHandler.getPowerBi.bind(PowerBiHandler),
  listPowerBi: PowerBiHandler.listPowerBi.bind(PowerBiHandler),
  updatePowerBi: PowerBiHandler.updatePowerBi.bind(PowerBiHandler),
  deletePowerBi: PowerBiHandler.deletePowerBi.bind(PowerBiHandler),
  restorePowerBi: PowerBiHandler.restorePowerBi.bind(PowerBiHandler),
  getPowerBiByCategory: PowerBiHandler.getPowerBiByCategory.bind(PowerBiHandler),
  getPowerBiStats: PowerBiHandler.getPowerBiStats.bind(PowerBiHandler),
  getPowerBiPost: PowerBiHandler.getPowerBiPost.bind(PowerBiHandler),
  createPowerBiPost: PowerBiHandler.createPowerBiPost.bind(PowerBiHandler),
};
