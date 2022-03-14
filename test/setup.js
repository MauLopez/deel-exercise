const factories = require('./factory')
const cleanDB = require('./utils/clean_db')
const {sequelize} = require('../src/model')

before(async() => {
  try {
    factories()
    await cleanDB()
  } catch (error) {
    throw error
  }
})

after(async () => {
  sequelize.close()
})
