const { factory } = require('factory-girl')
const { expect } = require('chai')
const moment = require('moment')
const sinon = require('sinon')

const { CONTRACT_STATUS, PROFILE_TYPE } = require('../../src/lib/constant')

describe('Job Model', () => {
  it('creates a job', async () => {
    const job = await factory.create('job')
    await job.reload({
      include: [{association: 'Contract'}]
    })
    expect(job).to.exist
    expect(job.description).to.be.a('string')
    expect(job.price).to.be.a('number')
    expect(job.paid).to.be.a('boolean')
    expect(job.paymentDate).to.be.a('date')
    expect(job.ContractId).to.be.a('number')
    expect(job.Contract).to.exist
    expect(Object.values(CONTRACT_STATUS)).to.includes(job.Contract.status)
    expect(job.Contract.terms).to.be.a('string')
    expect(job.Contract.ClientId).to.be.a('number')
    expect(job.Contract.ContractorId).to.be.a('number')
  })

  describe('#pay', () => {
    it('Pay for a job', async () => {
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: 70 })
      const contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR, balance: 0 })
      const contract = await factory.create('contract', {
        ClientId: client.id,
        ContractorId: contractor.id
      })
      const job = await factory.create('job', { price: 50, paid: false, paymentDate: null, ContractId: contract.id })
      await job.pay()
      expect(job.paid).to.equals(true)

      // Validates job price was deduced from client balance
      const oldClientBalance = client.balance
      await client.reload()
      expect(client.balance).to.equals(oldClientBalance - job.price)

      // Validates job price was added to the contractor balance
      const oldContractorBalance = contractor.balance
      await contractor.reload()
      expect(contractor.balance).to.equals(oldContractorBalance + job.price)

      // Validates job is set as paid
      expect(job.paid).to.equals(true)
      expect(moment(job.paymentDate).isValid()).to.equals(true)
    })

    it('Fails if the job is already paid', async () => {
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: 70 })
      const contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR, balance: 0 })
      const contract = await factory.create('contract', {
        ClientId: client.id,
        ContractorId: contractor.id
      })
      const job = await factory.create('job', { price: 50, paid: true, paymentDate: null, ContractId: contract.id })
      try {
        await job.pay()
        throw new Error('Should faild')
      } catch (e) {
        expect(e.message).to.equals('Job is already paid')
      }
    })

    it('Fails if client insufficient funds', async () => {
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: 70 })
      const contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR, balance: 0 })
      const contract = await factory.create('contract', {
        ClientId: client.id,
        ContractorId: contractor.id
      })
      const job = await factory.create('job', { price: 100, paid: false, paymentDate: null, ContractId: contract.id })
      try {
        await job.pay()
        throw new Error('Should faild')
      } catch (e) {
        expect(e.message).to.equals('Insufficient funds')
      }
    })

    it('Rollback if payment fails', async () => {
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: 70 })
      const contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR, balance: 0 })
      const contract = await factory.create('contract', {
        ClientId: client.id,
        ContractorId: contractor.id
      })
      const job = await factory.create('job', { price: 50, paid: false, paymentDate: null, ContractId: contract.id })
      const stub = sinon.stub(job, 'save').rejects('Something went wrong')
      try {
        await job.pay()
        throw new Error('Should faild')
      } catch (e) {
        stub.restore()
        expect(stub.called).to.equals(true)
        expect(e.message).to.equals('Something went wrong')

        // Validates client balance wasn't deduced
        const oldClientBalance = client.balance
        await client.reload()
        expect(client.balance).to.equals(oldClientBalance)

        // Validates contractor balance wasn't increased
        const oldContractorBalance = contractor.balance
        await contractor.reload()
        expect(contractor.balance).to.equals(oldContractorBalance)
      }
    })
  })
})
