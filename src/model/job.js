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
  }

  static associate (models) {
    const { Contract } = models
    Job.belongsTo(Contract)
  }

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
        Client,
        Contractor
      }
    } = job

    if (job.price > Client.balance) {
      throw new Error('Insufficient funds')
    }

    // Deduce job from client balance
    const transaction = await Job.sequelize.transaction()
    try {
      Client.balance -= job.price
      await Client.save({transaction})

      // Topup contractor balance
      Contractor.balance += job.price
      await Contractor.save({transaction})

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
