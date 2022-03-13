const _ = require('lodash')
const randomstring = require('randomstring')
const { Contract } = require('../../src/model')
const { CONTRACT_STATUS, PROFILE_TYPE } = require('../../src/lib/constant')

module.exports = (factory) => {
  factory.define('contract', Contract, {
    terms: randomstring.generate({
      length: 8,
      charset: 'alphabetic'
    }),
    status: _.sample(Object.values(CONTRACT_STATUS)),
    ClientId: factory.assoc('profile', 'id', { type: PROFILE_TYPE.CLIENT }),
    ContractorId: factory.assoc('profile', 'id', { type: PROFILE_TYPE.CONTRACTOR })
  })
}
