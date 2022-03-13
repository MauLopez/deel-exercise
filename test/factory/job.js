const _ = require('lodash')
const randomstring = require('randomstring')
const moment = require('moment')
const { Job } = require('../../src/model')

module.exports = (factory) => {
  factory.define('job', Job, {
    description: randomstring.generate({
      length: 8,
      charset: 'alphabetic'
    }),
    price: _.random(100, 1000),
    paid: true,
    paymentDate: moment.utc().subtract(1, 'week').toDate(),
    ContractId: factory.assoc('contract', 'id')
  })
}
