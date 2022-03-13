const { factory } = require('factory-girl')
const { expect } = require('chai')
const request = require('supertest')

const startServer = require('../../utils/start_server')
const { PROFILE_TYPE, CONTRACT_STATUS } = require('../../../src/lib/constant')

describe('Contract Handler - Get current contracts', () => {
  let app
  before(async () => {
    app = await startServer()
  })

  let client, contractor, newContracts, inProgressContracts
  beforeEach(async () => {
    client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
    contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR })
    const build = {
      ClientId: client.id,
      ContractorId: contractor.id
    }
    newContracts = await factory.createMany('contract', 5, { ...build, status: CONTRACT_STATUS.NEW })
    inProgressContracts = await factory.createMany('contract', 5, { ...build, status: CONTRACT_STATUS.IN_PROGRESS })

    // Contracts that are terminated and shouldn't be displayed
    await factory.createMany('contract', 5, { ...build, status: CONTRACT_STATUS.TERMINATED })

    // Contracts that belong to a differnet user and shouldn't be displayed
    await factory.createMany('contract', 5, { status: CONTRACT_STATUS.NEW })
  })

  it('Get contracts as a client', async () => {
    const { body: { contracts } } = await request(app)
      .get(`/contracts`)
      .set('profile_id', client.id)
      .expect(200)

    expect(contracts).to.have.a.lengthOf(newContracts.length + inProgressContracts.length)
    expect(contracts.map(c => c.id)).to.include.members(newContracts.map(c => c.id))
    expect(contracts.map(c => c.id)).to.include.members(inProgressContracts.map(c => c.id))
  })

  it('Get contracts as a contractor', async () => {
    const { body: { contracts } } = await request(app)
      .get(`/contracts`)
      .set('profile_id', contractor.id)
      .expect(200)

    expect(contracts).to.have.a.lengthOf(newContracts.length + inProgressContracts.length)
    expect(contracts.map(c => c.id)).to.include.members(newContracts.map(c => c.id))
    expect(contracts.map(c => c.id)).to.include.members(inProgressContracts.map(c => c.id))
  })

  it('Fails if profile id is not provided', async () => {
    await request(app)
      .get(`/contracts`)
      .expect(401)
  })
})
