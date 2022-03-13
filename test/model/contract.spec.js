const { factory } = require('factory-girl')
const { expect } = require('chai')

const { CONTRACT_STATUS } = require('../../src/lib/constant')

describe('Contract Model', () => {
  it('creates a new contract', async () => {
    const contract = await factory.create('contract', { status: CONTRACT_STATUS.NEW })
    expect(contract).to.exist
    expect(contract.status).to.equals(CONTRACT_STATUS.NEW)
    expect(contract.terms).to.be.a('string')
  })

  it('creates an in progress contract', async () => {
    const contract = await factory.create('contract', { status: CONTRACT_STATUS.IN_PROGRESS })
    expect(contract).to.exist
    expect(contract.status).to.equals(CONTRACT_STATUS.IN_PROGRESS)
    expect(contract.terms).to.be.a('string')
  })

  it('creates a terminated contract', async () => {
    const contract = await factory.create('contract', { status: CONTRACT_STATUS.TERMINATED })
    expect(contract).to.exist
    expect(contract.status).to.equals(CONTRACT_STATUS.TERMINATED)
    expect(contract.terms).to.be.a('string')
  })

  it('is invalid with an incorrect status', async () => {
    try {
      const result = await factory.create('contract', { status: 'notexist' })
      throw new Error('It should fail')
    } catch (e) {
      expect(e.message).to.equals('Contract status not in enum.')
    }
  })

  it('is invalid without a status', async () => {
    try {
      const result = await factory.create('contract', { status: null })
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
      const result = await factory.create('contract', { terms: null })
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