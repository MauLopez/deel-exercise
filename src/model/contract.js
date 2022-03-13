const Sequelize = require('sequelize')
const { Op } = Sequelize
const _ = require('lodash')
const { PROFILE_TYPE, CONTRACT_STATUS } = require('../lib/constant')

class Contract extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        terms: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM(Object.values(CONTRACT_STATUS)),
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: 'Contract',
        hooks: {
          afterValidate: Contract.afterValidate
        },
        scopes: {
          byProfileType: Contract.scopeByProfileType,
          byContractStatuses: Contract.scopeByContractStatuses
        }
      }
    )
  }

  static scopeByProfileType (profileType, profileId) {
    const where = {}
    if (profileType === PROFILE_TYPE.CLIENT) {
      where.ClientId = profileId
    } else {
      where.ContractorId = profileId
    }
    return {where}
  }

  static scopeByContractStatuses (statuses) {
    return {
      where: {
        status: {
          [Op.in]: statuses
        }
      }
    }
  }

  static afterValidate (contract) {
    // SQLite doesn't allow enum validations
    if (!_.includes(Object.values(CONTRACT_STATUS), contract.status)) {
      throw new Error('Contract status not in enum.')
    }
    return contract
  }

  static associate (models) {
    const { Profile, Job } = models
    Contract.belongsTo(Profile, {as: 'Contractor'})
    Contract.belongsTo(Profile, {as: 'Client'})
    Contract.hasMany(Job)
  }
}

module.exports = Contract
