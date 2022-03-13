const express = require('express')
const bodyParser = require('body-parser')
const {sequelize} = require('./model')
const { getProfile, getJob, getContract } = require('./middleware')
const { CONTRACT_STATUS } = require('./lib/constant')
const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @description Get an existing contract by id for a given client or contract
 * @returns Contract by id
 */
app.get('/contracts/:contract_id', getProfile, getContract, async (req, res) => {
  res.json(req.contract)
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

app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get('models')
  const { profile } = req
  const jobs = await Job
    .findAll({
      where: {
        paid: false
      },
      include: [{
        model: Contract
          .scope(
            { method: ['byContractStatuses', [CONTRACT_STATUS.NEW, CONTRACT_STATUS.IN_PROGRESS]] },
            { method: ['byProfileType', profile.type, profile.id]}
          )
      }]
    })
  res.json({jobs})
})

app.post('/jobs/:job_id/pay', getProfile, getJob, async (req, res) => {

})

module.exports = app
