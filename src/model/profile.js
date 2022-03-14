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
          afterValidate: Profile.afterValidate
        }
      }
    )
  }

  static afterValidate (profile) {
    // SQLite doesn't allow enum validations
    if (!_.includes(Object.values(PROFILE_TYPE), profile.type)) {
      throw new Error('Profile type not in enum.')
    }
    return profile
  }

  static associate (models) {
    const { Contract } = models
    Profile.hasMany(Contract, {as: 'Contractor', foreignKey: 'ContractorId'})
    Profile.hasMany(Contract, {as: 'Client', foreignKey: 'ClientId'})
  }

  /**
   * @description Gets the total amount of unpaid jobs
   * @returns {Promise<profile>} Returns the amount of unpaid jobs
   */
  async getUnpaidJobBalance () {
    const profile = this
    const { Job } = Profile.sequelize.models
    const unpaidContracts = await Job
      .findAll({
        where: {
          paid: false
        },
        include: [{
          association: 'Contract',
          where: {
            ClientId: profile.id
          }
        }]
      })

    return unpaidContracts.reduce((acum, c) => {
      return acum + c.price
    }, 0)
  }

  /**
   * @description Deposit from a user to a client
   * @param {number} amount Amount to be transferred
   * @param {number} userId Target client which will receive the specified amount
   * @returns {Promise<profile>} Returns a promise that resolves with the profile with the deducted balance
   *  or rejects with the appropiate error
   */
  async deposit (amount, userId) {
    const profile = this

    if (amount > profile.balance) {
      throw new Error('Insufficient funds')
    }

    const profileTarget = await Profile.findOne({
      where: {
        id: userId,
        type: PROFILE_TYPE.CLIENT
      }
    })

    if (!profileTarget) {
      throw new Error('Client not found')
    }

    // On the readme doesn't say if the contractor can send money or not, I am assuming it can and the 25% validation is only used for clients
    if (profile.type === PROFILE_TYPE.CLIENT) {
      const totalUnpaidAmount = await profile.getUnpaidJobBalance()

      if (
        totalUnpaidAmount && // Validates the user has unpaid jobs before validatiing the 25% exceeds rule
        (totalUnpaidAmount * 0.25) > amount // 25% of the unpaid jobs are higher than the desired amount to be transferred
      ) {
        throw new Error('The amount selected is above the 25% of the unpaid jobs')
      }
    }

    const transaction = await Profile.sequelize.transaction()
    try {
      // Deduce balance from source
      profile.balance -= amount
      await profile.save({transaction})

      // Topup balance on target
      profileTarget.balance += amount
      await profileTarget.save({transaction})

      await transaction.commit()
    } catch (e) {
      await transaction.rollback()
      throw new Error('Something went wrong')
    }
  }
}

module.exports = Profile
