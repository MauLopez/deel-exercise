const Sequelize = require('sequelize')

class Job extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
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
          default: false,
          allowNull: false
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
  }

  static associate (models) {
    const { Contract } = models
    Job.belongsTo(Contract)
  }

  /**
   * @description Pays for a job
   * @returns {Promise<job>} Returns a promise that resolves with a job if the client successfully paid to the contractor
   *  or rejects with the appropiate error
   */
  async pay () {
    const job = this
    if (job.paid) {
      throw new Error('Job is already paid')
    }

    await job.reload({
      include: [{
        association: 'Contract',
        include: [
          { association: 'Client' },
          { association: 'Contractor' }
        ]
      }]
    })

    const {
      Contract: {
        Client: client,
        Contractor: contractor
      }
    } = job

    if (job.price > client.balance) {
      throw new Error('Insufficient funds')
    }

    const transaction = await Job.sequelize.transaction()
    try {
      // Deduce job from client balance
      client.balance -= job.price
      await client.save({transaction})

      // Topup contractor balance
      contractor.balance += job.price
      await contractor.save({transaction})

      // Set job as paid
      job.paid = true
      job.paymentDate = new Date()
      await job.save({transaction})

      await transaction.commit()
    } catch (e) {
      await transaction.rollback()
      throw new Error('Something went wrong')
    }

    return job
  }
}

module.exports = Job
