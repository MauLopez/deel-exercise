const { factory } = require('factory-girl')
const { expect } = require('chai')
const request = require('supertest')

const startServer = require('../../utils/start_server')

describe('Contract Handler - Get by id', () => {
  let contract, app
  before(async () => {
    app = await startServer()
  })
  beforeEach(async () => {
    contract = await factory.create('contract')
  })

  it('Gets contract as a client', async () => {
    const { body } = await request(app)
      .get(`/contracts/${contract.id}`)
      .set('profile_id', contract.ClientId)
      .expect(200)

    expect(body.id).to.equals(contract.id)
    expect(body.terms).to.equals(contract.terms)
    expect(body.status).to.equals(contract.status)
    expect(body.createdAt).to.equals(contract.createdAt.toISOString())
    expect(body.updatedAt).to.equals(contract.updatedAt.toISOString())
    expect(body.ClientId).to.equals(contract.ClientId)
    expect(body.ContractorId).to.equals(contract.ContractorId)
  })

  it('Gets contract as a contractor', async () => {
    const { body } = await request(app)
      .get(`/contracts/${contract.id}`)
      .set('profile_id', contract.ContractorId)
      .expect(200)

    expect(body.id).to.equals(contract.id)
    expect(body.terms).to.equals(contract.terms)
    expect(body.status).to.equals(contract.status)
    expect(body.createdAt).to.equals(contract.createdAt.toISOString())
    expect(body.updatedAt).to.equals(contract.updatedAt.toISOString())
    expect(body.ClientId).to.equals(contract.ClientId)
    expect(body.ContractorId).to.equals(contract.ContractorId)
  })

  it('Fails if contract belongs to a different user', async () => {
    const profile = await factory.create('profile')
    await request(app)
      .get(`/contracts/${contract.id}`)
      .set('profile_id', profile.id)
      .expect(404)
  })

  it('Fails if contract does not exist', async () => {
    await request(app)
      .get(`/contracts/0`)
      .set('profile_id', contract.ContractorId)
      .expect(404)
  })

  it('Fails if profile id is not provided', async () => {
    await request(app)
      .get(`/contracts/${contract.id}`)
      .expect(401)
  })
})
