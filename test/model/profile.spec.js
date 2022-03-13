const { factory } = require('factory-girl')
const { expect } = require('chai')

const { PROFILE_TYPE } = require('../../src/lib/constant')

describe('Profile Model', () => {
  it('creates a contractor', async () => {
    const profile = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR })
    expect(profile).to.exist
    expect(profile.type).to.equals(PROFILE_TYPE.CONTRACTOR)
    expect(profile.firstName).to.be.a('string')
    expect(profile.lastName).to.be.a('string')
    expect(profile.profession).to.be.a('string')
    expect(profile.balance).to.be.a('number')
  })

  it('creates a client', async () => {
    const profile = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
    expect(profile).to.exist
    expect(profile.type).to.equals(PROFILE_TYPE.CLIENT)
    expect(profile.firstName).to.be.a('string')
    expect(profile.lastName).to.be.a('string')
    expect(profile.profession).to.be.a('string')
    expect(profile.balance).to.be.a('number')
  })

  it('is invalid with an incorrect type', async () => {
    try {
      await factory.create('profile', { type: 'notexist' })
      throw new Error('It should fail')
    } catch (e) {
      expect(e.message).to.equals('Profile type not in enum.')
    }
  })

  it('is invalid without a type', async () => {
    try {
      await factory.create('profile', { type: null })
      throw new Error('It should fail')
    } catch (e) {
      const {
        errors: [{
          message,
          type,
          path
        }]
      } = e
      expect(message).to.equals('Profile.type cannot be null')
      expect(type).to.equals('notNull Violation')
      expect(path).to.equals('type')
    }
  })

  describe('#deposit', () => {
    it('Deposits balance from a contractor', async () => {
      const currentBalance = 80
      const contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR, balance: currentBalance })
      const targetClient = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })

      const amount = 50
      await contractor.deposit(amount, targetClient.id)
      expect(contractor.balance).to.equals(currentBalance - amount)
      const oldClientBalance = targetClient.balance
      await targetClient.reload()
      expect(targetClient.balance).to.equals(oldClientBalance + amount)
    })

    it('Deposits balance from a client without unpaid jobs', async () => {
      const currentBalance = 80
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
      const targetClient = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })

      const amount = 50
      await client.deposit(amount, targetClient.id)
      expect(client.balance).to.equals(currentBalance - amount)
      const oldClientBalance = targetClient.balance
      await targetClient.reload()
      expect(targetClient.balance).to.equals(oldClientBalance + amount)
    })

    it('Deposits balance from a client with unpaid jobs', async () => {
      const currentBalance = 80
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
      const contract1 = await factory.create('contract', { ClientId: client.id })
      await factory.create('job', { ContractId: contract1.id, paid: false, price: 10 })
      const contract2 = await factory.create('contract', { ClientId: client.id })
      await factory.create('job', { ContractId: contract2.id, paid: false, price: 5 })

      const targetClient = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })

      const amount = 50
      await client.deposit(amount, targetClient.id)
      expect(client.balance).to.equals(currentBalance - amount)
      const oldClientBalance = targetClient.balance
      await targetClient.reload()
      expect(targetClient.balance).to.equals(oldClientBalance + amount)
    })

    it('Fails if the 25% of the client unpaid jobs exceeds total amount to be transferred', async () => {
      const currentBalance = 80
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
      const contract1 = await factory.create('contract', { ClientId: client.id })
      await factory.create('job', { ContractId: contract1.id, paid: false, price: 150 })
      const contract2 = await factory.create('contract', { ClientId: client.id })
      await factory.create('job', { ContractId: contract2.id, paid: false, price: 170 })

      const targetClient = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })

      const amount = 50
      try {
        await client.deposit(amount, targetClient.id)
        throw new Error('Should faild')
      } catch (e) {
        expect(e.message).to.equals('The amount selected is above the 25% of the unpaid jobs')
        expect(client.balance).to.equals(currentBalance)
        const oldClientBalance = targetClient.balance
        await targetClient.reload()
        expect(targetClient.balance).to.equals(oldClientBalance)
      }
    })

    it('Fails if the target client does not exist', async () => {
      const currentBalance = 80
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
      const amount = 50
      try {
        await client.deposit(amount, 0)
        throw new Error('Should faild')
      } catch (e) {
        expect(e.message).to.equals('Client not found')
      }
    })

    it('Fails if the amount selected exceeds the user balance ', async () => {
      const currentBalance = 80
      const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
      const amount = 100
      try {
        await client.deposit(amount, 0)
        throw new Error('Should faild')
      } catch (e) {
        expect(e.message).to.equals('Insufficient funds')
      }
    })
  })
})
