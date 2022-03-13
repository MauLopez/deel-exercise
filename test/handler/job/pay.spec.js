const { factory } = require('factory-girl')
const { expect } = require('chai')
const request = require('supertest')
const moment = require('moment')

const startServer = require('../../utils/start_server')
const { PROFILE_TYPE } = require('../../../src/lib/constant')

describe('Job Handler - Pays a job', () => {
  let app
  before(async () => {
    app = await startServer()
  })

  let client, contractor, contract, job
  beforeEach(async () => {
    client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: 70 })
    contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR, balance: 0 })
    contract = await factory.create('contract', {
      ClientId: client.id,
      ContractorId: contractor.id
    })
    job = await factory.create('job', { price: 50, paid: false, paymentDate: null, ContractId: contract.id })
  })

  it('Pays a job', async () => {
    const { body: { job: _job } } = await request(app)
      .post(`/jobs/${job.id}/pay`)
      .set('profile_id', client.id)
      .expect(200)

    // Validates job price was deduced from client balance
    const oldClientBalance = client.balance
    await client.reload()
    expect(client.balance).to.equals(oldClientBalance - job.price)

    // Validates job price was added to the contractor balance
    const oldContractorBalance = contractor.balance
    await contractor.reload()
    expect(contractor.balance).to.equals(oldContractorBalance + job.price)

    // Validates job is set as paid
    expect(_job.paid).to.equals(true)
    expect(moment(_job.paymentDate).isValid()).to.equals(true)
  })

  it('Fails if the job is already paid', async () => {
    job.paid = true
    await job.save()
    const { body } = await request(app)
      .post(`/jobs/${job.id}/pay`)
      .set('profile_id', client.id)
      .expect(400)

    expect(body.message).to.equals('Job is already paid')
  })

  it('Fails if the client has insufficient funds', async () => {
    client.balance = 0
    await client.save()
    const { body } = await request(app)
      .post(`/jobs/${job.id}/pay`)
      .set('profile_id', client.id)
      .expect(400)

    expect(body.message).to.equals('Insufficient funds')
  })

  it('Fails if job does not exist', async () => {
    await request(app)
      .post(`/jobs/0/pay`)
      .set('profile_id', client.id)
      .expect(404)
  })

  it('Fails if profile id is not provided', async () => {
    await request(app)
      .post(`/jobs/${job.id}/pay`)
      .expect(401)
  })

  it('Fails if paying as a contractor', async () => {
    await request(app)
      .post(`/jobs/${job.id}/pay`)
      .set('profile_id', contractor.id)
      .expect(401)
  })

  it('Fails if paying as a different client', async () => {
    const _client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
    await request(app)
      .post(`/jobs/${job.id}/pay`)
      .set('profile_id', _client.id)
      .expect(404)
  })
})
