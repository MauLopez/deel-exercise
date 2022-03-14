const {sequelize} = require('../../src/model')

module.exports = async () => {
  for (const model in sequelize.models) {
    await sequelize.models[model].truncate({cascade: true})
  }
}
