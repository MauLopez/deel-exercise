const _ = require('lodash')
const { factory, SequelizeAdapter } = require('factory-girl')
factory.setAdapter(new SequelizeAdapter())

const profile = require('./profile')
const contract = require('./contract')
const job = require('./job')

module.exports = () => {
  if (!_.has(factory, 'factories.profile')) profile(factory)
  if (!_.has(factory, 'factories.contract')) contract(factory)
  if (!_.has(factory, 'factories.job')) job(factory)
}
