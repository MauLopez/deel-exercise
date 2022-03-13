const { factory } = require('factory-girl')
const { expect } = require('chai')

const { CONTRACT_STATUS, PROFILE_TYPE } = require('../../src/lib/constant')

describe('Contract Model', () => {
  it('creates a new contract', async () => {
    const contract = await factory.create('contract', { status: CONTRACT_STATUS.NEW })
    await contract.reload({
      include: [{association: 'Client'}, {association: 'Contractor'}]
    })
    expect(contract).to.exist
    expect(contract.status).to.equals(CONTRACT_STATUS.NEW)
    expect(contract.terms).to.be.a('string')
    expect(contract.ClientId).to.be.a('number')
    expect(contract.ContractorId).to.be.a('number')
    expect(contract.Client).to.exist
    expect(contract.Client.type).to.equals(PROFILE_TYPE.CLIENT)
    expect(contract.Client.firstName).to.be.a('string')
    expect(contract.Client.lastName).to.be.a('string')
    expect(contract.Client.profession).to.be.a('string')
    expect(contract.Client.balance).to.be.a('number')
    expect(contract.Contractor).to.exist
    expect(contract.Contractor.type).to.equals(PROFILE_TYPE.CONTRACTOR)
    expect(contract.Contractor.firstName).to.be.a('string')
    expect(contract.Contractor.lastName).to.be.a('string')
    expect(contract.Contractor.profession).to.be.a('string')
    expect(contract.Contractor.balance).to.be.a('number')
  })

  it('creates an in progress contract', async () => {
    const contract = await factory.create('contract', { status: CONTRACT_STATUS.IN_PROGRESS })
    await contract.reload({
      include: [{association: 'Client'}, {association: 'Contractor'}]
    })
    expect(contract).to.exist
    expect(contract.status).to.equals(CONTRACT_STATUS.IN_PROGRESS)
    expect(contract.terms).to.be.a('string')
    expect(contract.ClientId).to.be.a('number')
    expect(contract.ContractorId).to.be.a('number')
    expect(contract.Client).to.exist
    expect(contract.Client.type).to.equals(PROFILE_TYPE.CLIENT)
    expect(contract.Client.firstName).to.be.a('string')
    expect(contract.Client.lastName).to.be.a('string')
    expect(contract.Client.profession).to.be.a('string')
    expect(contract.Client.balance).to.be.a('number')
    expect(contract.Contractor).to.exist
    expect(contract.Contractor.type).to.equals(PROFILE_TYPE.CONTRACTOR)
    expect(contract.Contractor.firstName).to.be.a('string')
    expect(contract.Contractor.lastName).to.be.a('string')
    expect(contract.Contractor.profession).to.be.a('string')
    expect(contract.Contractor.balance).to.be.a('number')
  })

  it('creates a terminated contract', async () => {
    const contract = await factory.create('contract', { status: CONTRACT_STATUS.TERMINATED })
    await contract.reload({
      include: [{association: 'Client'}, {association: 'Contractor'}]
    })
    expect(contract).to.exist
    expect(contract.status).to.equals(CONTRACT_STATUS.TERMINATED)
    expect(contract.terms).to.be.a('string')
    expect(contract.ClientId).to.be.a('number')
    expect(contract.ContractorId).to.be.a('number')
    expect(contract.Client).to.exist
    expect(contract.Client.type).to.equals(PROFILE_TYPE.CLIENT)
    expect(contract.Client.firstName).to.be.a('string')
    expect(contract.Client.lastName).to.be.a('string')
    expect(contract.Client.profession).to.be.a('string')
    expect(contract.Client.balance).to.be.a('number')
    expect(contract.Contractor).to.exist
    expect(contract.Contractor.type).to.equals(PROFILE_TYPE.CONTRACTOR)
    expect(contract.Contractor.firstName).to.be.a('string')
    expect(contract.Contractor.lastName).to.be.a('string')
    expect(contract.Contractor.profession).to.be.a('string')
    expect(contract.Contractor.balance).to.be.a('number')
  })

  it('is invalid with an incorrect status', async () => {
    try {
      await factory.create('contract', { status: 'notexist' })
      throw new Error('It should fail')
    } catch (e) {
      expect(e.message).to.equals('Contract status not in enum.')
    }
  })

  it('is invalid without a status', async () => {
    try {
      await factory.create('contract', { status: null })
      throw new Error('It should fail')
    } catch (e) {
      const {
        errors: [{
          message,
          type,
          path
        }]
      } = e
      expect(message).to.equals('Contract.status cannot be null')
      expect(type).to.equals('notNull Violation')
      expect(path).to.equals('status')
    }
  })

  it('is invalid without terms', async () => {
    try {
      await factory.create('contract', { terms: null })
      throw new Error('It should fail')
    } catch (e) {
      const {
        errors: [{
          message,
          type,
          path
        }]
      } = e
      expect(message).to.equals('Contract.terms cannot be null')
      expect(type).to.equals('notNull Violation')
      expect(path).to.equals('terms')
    }
  })
})
