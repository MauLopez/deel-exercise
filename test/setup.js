const chai = require('chai')
const factories = require('./factory')
const {sequelize} = require('../src/model')

before(async() => {
  try {
    factories()
    for (const model in sequelize.models) {
      await sequelize.models[model].truncate({cascade: true})
    }

  } catch (error) {
    throw error
  }
})

after(async () => {
  sequelize.close()
})
