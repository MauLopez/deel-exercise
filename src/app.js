const express = require('express')
const bodyParser = require('body-parser')
const Joi = require('joi')

const {sequelize} = require('./model')
const { getProfile, getJob, getContract, validateProfileType } = require('./middleware')
const { CONTRACT_STATUS, PROFILE_TYPE } = require('./lib/constant')

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

app.post('/jobs/:job_id/pay', getProfile, validateProfileType(PROFILE_TYPE.CLIENT), getJob, async (req, res) => {
  const { job } = req
  try {
    await job.pay()
    res.json({job})
  } catch (e) {
    return res.status(400).json({
      message: e.message
    })
  }
})

app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
  const { profile, body: { amount }, params: { userId } } = req

  // TODO: Move to a middleware
  const { error } = Joi
    .object({
      amount: Joi.number().positive()
    })
    .validate({
      amount
    })

  if (error) {
    return res.status(400).json({
      message: error.message
    })
  }

  try {
    await profile.deposit(amount, userId)
    res.json({profile})
  } catch (e) {
    return res.status(400).json({
      message: e.message
    })
  }
})

module.exports = app
