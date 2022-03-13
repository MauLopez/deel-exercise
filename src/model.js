const Sequelize = require('sequelize')
const _ = require('lodash')
const { PROFILE_TYPE, CONTRACT_STATUS } = require('./lib/constant')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
  logging: process.env.NODE_ENV !== 'test'
})

class Profile extends Sequelize.Model {}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2)
    },
    type: {
      type: Sequelize.ENUM(Object.values(PROFILE_TYPE)),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Profile',
    hooks: {
      afterValidate: (profile) => {
        // SQLite doesn't allow enum validations
        if (!_.includes(Object.values(PROFILE_TYPE), profile.type)) {
          throw new Error('Profile type not in enum.')
        }

        return profile
      }
    }
  }
)

class Contract extends Sequelize.Model {}
Contract.init(
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
      afterValidate: (contract) => {
        // SQLite doesn't allow enum validations
        if (!_.includes(Object.values(CONTRACT_STATUS), contract.status)) {
          throw new Error('Contract status not in enum.')
        }

        return contract
      }
    },
    scopes: {
      byProfileType: (profileType, profileId) => {
        const where = {}
        if (profileType === PROFILE_TYPE.CLIENT) {
          where.ClientId = profileId
        } else {
          where.ContractorId = profileId
        }

        return {where}
      }
    }
  }
)

class Job extends Sequelize.Model {}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false
    },
    paymentDate: {
      type: Sequelize.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job'
  }
)

Profile.hasMany(Contract, {as: 'Contractor', foreignKey: 'ContractorId'})
Contract.belongsTo(Profile, {as: 'Contractor'})
Profile.hasMany(Contract, {as: 'Client', foreignKey: 'ClientId'})
Contract.belongsTo(Profile, {as: 'Client'})
Contract.hasMany(Job)
Job.belongsTo(Contract)

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job
}
