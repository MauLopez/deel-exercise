const Sequelize = require('sequelize')
const _ = require('lodash')
const { PROFILE_TYPE } = require('../lib/constant')

class Profile extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
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
  }

  static associate (models) {
    const { Contract } = models
    Profile.hasMany(Contract, {as: 'Contractor', foreignKey: 'ContractorId'})
    Profile.hasMany(Contract, {as: 'Client', foreignKey: 'ClientId'})
  }
}

module.exports = Profile
