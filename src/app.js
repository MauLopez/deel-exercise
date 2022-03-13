const express = require('express')
const bodyParser = require('body-parser')
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/get_profile')
const { CONTRACT_STATUS } = require('./lib/constant')
const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @description Get an existing contract by id for a given client or contract
 * @returns Contract by id
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

/**
 * @description Get a list of new and in progress contracts for a given client or contractor
 * @returns List of contracts
 */
app.get('/contracts', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models')
  const { profile } = req
  const contracts = await Contract
    .scope(
      { method: ['byContractStatuses', [CONTRACT_STATUS.NEW, CONTRACT_STATUS.IN_PROGRESS]] },
      { method: ['byProfileType', profile.type, profile.id]}
    )
    .findAll()
  res.json({contracts})
})

module.exports = app
