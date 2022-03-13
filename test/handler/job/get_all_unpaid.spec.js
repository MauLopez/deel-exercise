const { factory } = require('factory-girl')
const { expect } = require('chai')
const request = require('supertest')

const startServer = require('../../utils/start_server')
const { PROFILE_TYPE, CONTRACT_STATUS } = require('../../../src/lib/constant')

describe('Job Handler - Get unpaid jobs for current contracts', () => {
  let app
  before(async () => {
    app = await startServer()
  })

  let client, contractor
  beforeEach(async () => {
    client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
    contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR })
  })

  it('Get new unpaid jobs as a client', async () => {
    const contract = await factory.create('contract', {
      ClientId: client.id,
      ContractorId: contractor.id,
      status: CONTRACT_STATUS.NEW
    })
    const job = await factory.create('job', {
      ContractId: contract.id,
      paid: false
    })
    const { body: { jobs } } = await request(app)
      .get(`/jobs/unpaid`)
      .set('profile_id', client.id)
      .expect(200)

    expect(jobs).to.have.a.lengthOf(1)
    expect(jobs[0].id).to.equals(job.id)
    expect(jobs[0].description).to.equals(job.description)
    expect(jobs[0].price).to.equals(job.price)
    expect(jobs[0].paid).to.equals(job.paid)
    expect(jobs[0].paymentDate).to.equals(job.paymentDate.toISOString())
    expect(jobs[0].ContractId).to.equals(job.ContractId)
    expect(jobs[0].Contract).to.exist
    expect(jobs[0].Contract).to.exist
    expect(jobs[0].Contract.status).to.equals(contract.status)
    expect(jobs[0].Contract.terms).to.equals(contract.terms)
    expect(jobs[0].Contract.ClientId).to.equals(contract.ClientId)
    expect(jobs[0].Contract.ContractorId).to.equals(contract.ContractorId)
  })

  it('Get new unpaid jobs as a contractor', async () => {
    const contract = await factory.create('contract', {
      ClientId: client.id,
      ContractorId: contractor.id,
      status: CONTRACT_STATUS.NEW
    })
    const job = await factory.create('job', {
      ContractId: contract.id,
      paid: false
    })
    const { body: { jobs } } = await request(app)
      .get(`/jobs/unpaid`)
      .set('profile_id', contractor.id)
      .expect(200)

    expect(jobs).to.have.a.lengthOf(1)
    expect(jobs[0].id).to.equals(job.id)
    expect(jobs[0].description).to.equals(job.description)
    expect(jobs[0].price).to.equals(job.price)
    expect(jobs[0].paid).to.equals(job.paid)
    expect(jobs[0].paymentDate).to.equals(job.paymentDate.toISOString())
    expect(jobs[0].ContractId).to.equals(job.ContractId)
    expect(jobs[0].Contract).to.exist
    expect(jobs[0].Contract).to.exist
    expect(jobs[0].Contract.status).to.equals(contract.status)
    expect(jobs[0].Contract.terms).to.equals(contract.terms)
    expect(jobs[0].Contract.ClientId).to.equals(contract.ClientId)
    expect(jobs[0].Contract.ContractorId).to.equals(contract.ContractorId)
  })

  it('Get in progress unpaid jobs', async () => {
    const contract = await factory.create('contract', {
      ClientId: client.id,
      ContractorId: contractor.id,
      status: CONTRACT_STATUS.IN_PROGRESS
    })
    const job = await factory.create('job', {
      ContractId: contract.id,
      paid: false
    })
    const { body: { jobs } } = await request(app)
      .get(`/jobs/unpaid`)
      .set('profile_id', client.id)
      .expect(200)

    expect(jobs).to.have.a.lengthOf(1)
    expect(jobs[0].id).to.equals(job.id)
    expect(jobs[0].description).to.equals(job.description)
    expect(jobs[0].price).to.equals(job.price)
    expect(jobs[0].paid).to.equals(job.paid)
    expect(jobs[0].paymentDate).to.equals(job.paymentDate.toISOString())
    expect(jobs[0].ContractId).to.equals(job.ContractId)
    expect(jobs[0].Contract).to.exist
    expect(jobs[0].Contract).to.exist
    expect(jobs[0].Contract.status).to.equals(contract.status)
    expect(jobs[0].Contract.terms).to.equals(contract.terms)
    expect(jobs[0].Contract.ClientId).to.equals(contract.ClientId)
    expect(jobs[0].Contract.ContractorId).to.equals(contract.ContractorId)
  })

  it('Skip terminated unpaid jobs', async () => {
    const contract = await factory.create('contract', {
      ClientId: client.id,
      ContractorId: contractor.id,
      status: CONTRACT_STATUS.TERMINATED
    })
    await factory.create('job', {
      ContractId: contract.id,
      paid: false
    })
    const { body: { jobs } } = await request(app)
      .get(`/jobs/unpaid`)
      .set('profile_id', client.id)
      .expect(200)

    expect(jobs).to.be.empty
  })

  it('Skip active paid jobs', async () => {
    const contract = await factory.create('contract', {
      ClientId: client.id,
      ContractorId: contractor.id,
      status: CONTRACT_STATUS.IN_PROGRESS
    })
    await factory.create('job', {
      ContractId: contract.id,
      paid: true
    })
    const { body: { jobs } } = await request(app)
      .get(`/jobs/unpaid`)
      .set('profile_id', client.id)
      .expect(200)

    expect(jobs).to.be.empty
  })

  it('Skip jobs that does not belong to the user', async () => {
    const contract = await factory.create('contract', {
      status: CONTRACT_STATUS.IN_PROGRESS
    })
    await factory.create('job', {
      ContractId: contract.id,
      paid: false
    })
    const { body: { jobs } } = await request(app)
      .get(`/jobs/unpaid`)
      .set('profile_id', client.id)
      .expect(200)

    expect(jobs).to.be.empty
  })

  it('Fails if profile id is not provided', async () => {
    await request(app)
      .get(`/jobs/unpaid`)
      .expect(401)
  })
})
