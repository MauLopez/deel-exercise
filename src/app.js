const express = require('express')
const bodyParser = require('body-parser')
const Joi = require('joi')
const Sequelize = require('sequelize')
const { Op } = Sequelize
const {sequelize} = require('./model')
const { getProfile, getJob, getContract, validateProfileType } = require('./middleware')
const { CONTRACT_STATUS, PROFILE_TYPE } = require('./lib/constant')

const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @description Gets an existing contract by id for a given client or contract
 */
app.get('/contracts/:contract_id', getProfile, getContract, async (req, res) => {
  res.json(req.contract)
})

/**
 * @description Gets a list of new and in progress contracts for a given client or contractor
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

/**
 * @description Gets a list of unpaid jobs for active contracts
 */
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

/**
 * @description Pays a job
 */
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

/**
 * @description Deposit balance to a given client
 * @param {Object} body
 * @param {number} body.amount - Amount to be transferred
 */
app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
  const { profile, body: { amount }, params: { userId } } = req

  // TODO: Move to a middleware
  const { error } = Joi
    .object({
      amount: Joi.number().positive().required()
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

/**
 * @description Gets the best profession for a given time range
 * @param {Object} query
 * @param {Date} [query.start] - Start date
 * @param {Date} [query.end] - End date
 */
app.get('/admin/best-profession', getProfile, async (req, res) => {
  const { query } = req
  const { Job } = req.app.get('models')

  // TODO: Move to a middleware
  const { error, value } = Joi
    .object({
      start: Joi.date().optional(),
      end: Joi.date().optional()
    })
    .validate(query)

  if (error) {
    return res.status(400).json({
      message: error.message
    })
  }

  const { start, end } = value

  const dates = []
  if (start) dates.push({paymentDate: { [Op.gte]: start }})
  if (end) dates.push({paymentDate: { [Op.lte]: end }})
  const where = {
    paid: true,
    [Op.and]: dates
  }

  const job = await Job.findOne({
    where,
    include: [{
      association: 'Contract',
      include: [{
        association: 'Contractor'
      }],
      attributes: []
    }],
    group: 'Contract.Contractor.profession',
    attributes: [
      [sequelize.fn('sum', sequelize.col('price')), 'amount'],
      [sequelize.col('Contract.Contractor.profession'), 'profession']
    ],
    order: [[sequelize.col('amount'), 'DESC']]
  })

  res.json({job})
})

/**
 * @description List the best clients for a given time range
 * @param {Object} query
 * @param {Date} [query.start] - Start date
 * @param {Date} [query.end] - End date
 * @param {Date} [query.limit = 25] - Limit of clients to be displayed
 */
app.get('/admin/best-clients', getProfile, async (req, res) => {
  const {
    query
  } = req
  const { Job } = req.app.get('models')

  // TODO: Move to a middleware
  const { error, value } = Joi
    .object({
      start: Joi.date().optional(),
      end: Joi.date().optional(),
      limit: Joi.number().optional().default(25)
    })
    .validate(query)

  if (error) {
    return res.status(400).json({
      message: error.message
    })
  }

  const { start, end, limit } = value

  const dates = []
  if (start) dates.push({paymentDate: { [Op.gte]: start }})
  if (end) dates.push({paymentDate: { [Op.lte]: end }})
  const where = {
    paid: true,
    [Op.and]: dates
  }

  const clients = await Job.findAll({
    where,
    limit,
    include: [{
      association: 'Contract',
      include: [{
        association: 'Client'
      }],
      attributes: []
    }],
    group: 'Contract.Client.id',
    attributes: [
      [sequelize.fn('sum', sequelize.col('price')), 'amount'],
      [sequelize.col('Contract.Client.id'), 'id'],
      [sequelize.col('Contract.Client.lastName'), 'lastName'],
      [sequelize.col('Contract.Client.firstName'), 'firstName']
    ],
    order: [[sequelize.col('amount'), 'DESC']]
  })

  res.json({clients})
})

module.exports = app
