const express = require('express')
const bodyParser = require('body-parser')
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/get_profile')
const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models')
  const { profile, params: { id } } = req
  const contract = await Contract
    .scope({ method: ['byProfileType', profile.type, profile.id]})
    .findOne({ where: { id } })
  if (!contract) return res.status(404).end()
  res.json(contract)
})
module.exports = app
