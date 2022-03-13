const _ = require('lodash')
const randomstring = require('randomstring')
const { Contract } = require('../../src/model')
const { CONTRACT_STATUS } = require('../../src/lib/constant')


module.exports = (factory) => {
  factory.define('contract', Contract, {
    terms: randomstring.generate({
      length: 8,
      charset: 'alphabetic'
    }),
    status: _.sample(Object.values(CONTRACT_STATUS))
  })
}