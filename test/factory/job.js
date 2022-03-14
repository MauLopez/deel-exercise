const _ = require('lodash')
const randomstring = require('randomstring')
const moment = require('moment')
const { Job, Contract } = require('../../src/model')

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
  }, {
    afterCreate: async (model, attrs, buildOptions) => {
      // Overwrite client or contractor generated
      if (buildOptions.contractorId || buildOptions.clientId) {
        const contract = await Contract.findOne({ where: { id: model.ContractId } })
        contract.ContractorId = buildOptions.contractorId || contract.ContractorId
        contract.ClientId = buildOptions.clientId || contract.ClientId
        await contract.save()
      }

      return model
    }
  })
}
