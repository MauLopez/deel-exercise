const { factory } = require('factory-girl')
const { expect } = require('chai')
const request = require('supertest')

const startServer = require('../../utils/start_server')
const { PROFILE_TYPE } = require('../../../src/lib/constant')

describe('Balance Handler - Deposit', () => {
  let app
  before(async () => {
    app = await startServer()
  })

  let targetClient
  beforeEach(async () => {
    targetClient = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
  })

  it('Deposits balance from a contractor', async () => {
    const currentBalance = 80
    const amount = 50
    const contractor = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR, balance: currentBalance })
    const { body: { profile } } = await request(app)
      .post(`/balances/deposit/${targetClient.id}`)
      .set('profile_id', contractor.id)
      .send({ amount })
      .expect(200)

    expect(profile.balance).to.equals(contractor.balance - amount)
    const oldClientBalance = targetClient.balance
    await targetClient.reload()
    expect(targetClient.balance).to.equals(oldClientBalance + amount)
  })

  it('Deposits balance from a client without unpaid jobs', async () => {
    const currentBalance = 80
    const amount = 50
    const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
    const contract1 = await factory.create('contract', { ClientId: client.id })
    await factory.create('job', { ContractId: contract1.id, paid: true, price: 10 })
    const { body: { profile } } = await request(app)
      .post(`/balances/deposit/${targetClient.id}`)
      .set('profile_id', client.id)
      .send({ amount })
      .expect(200)

    expect(profile.balance).to.equals(client.balance - amount)
    const oldClientBalance = targetClient.balance
    await targetClient.reload()
    expect(targetClient.balance).to.equals(oldClientBalance + amount)
  })

  it('Deposits balance from a client with unpaid jobs', async () => {
    const currentBalance = 80
    const amount = 50
    const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
    const contract1 = await factory.create('contract', { ClientId: client.id })
    await factory.create('job', { ContractId: contract1.id, paid: false, price: 10 })
    const contract2 = await factory.create('contract', { ClientId: client.id })
    await factory.create('job', { ContractId: contract2.id, paid: false, price: 5 })
    const { body: { profile } } = await request(app)
      .post(`/balances/deposit/${targetClient.id}`)
      .set('profile_id', client.id)
      .send({ amount })
      .expect(200)

    expect(profile.balance).to.equals(client.balance - amount)
    const oldClientBalance = targetClient.balance
    await targetClient.reload()
    expect(targetClient.balance).to.equals(oldClientBalance + amount)
  })

  it('Fails if the 25% of the client unpaid jobs exceeds the total amount to be transferred', async () => {
    const currentBalance = 80
    const amount = 50
    const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
    const contract1 = await factory.create('contract', { ClientId: client.id })
    await factory.create('job', { ContractId: contract1.id, paid: false, price: 100 })
    const contract2 = await factory.create('contract', { ClientId: client.id })
    await factory.create('job', { ContractId: contract2.id, paid: false, price: 180 })
    const { body } = await request(app)
      .post(`/balances/deposit/${targetClient.id}`)
      .set('profile_id', client.id)
      .send({ amount })
      .expect(400)

    expect(body.message).to.equals('The amount selected is above the 25% of the unpaid jobs')
    expect(client.balance).to.equals(currentBalance)
    const oldClientBalance = targetClient.balance
    await targetClient.reload()
    expect(targetClient.balance).to.equals(oldClientBalance)
  })

  it('Fails if the client does not exist', async () => {
    const currentBalance = 80
    const amount = 50
    const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
    const { body } = await request(app)
      .post(`/balances/deposit/0`)
      .set('profile_id', client.id)
      .send({ amount })
      .expect(400)

    expect(body.message).to.equals('Client not found')
  })

  it('Fails if the amount selected exceeds the user balance', async () => {
    const currentBalance = 80
    const amount = 100
    const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
    const { body } = await request(app)
      .post(`/balances/deposit/${targetClient.id}`)
      .set('profile_id', client.id)
      .send({ amount })
      .expect(400)

    expect(body.message).to.equals('Insufficient funds')
  })

  it('Fails if the amount is not a number', async () => {
    const currentBalance = 80
    const amount = 'a'
    const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
    const { body } = await request(app)
      .post(`/balances/deposit/${targetClient.id}`)
      .set('profile_id', client.id)
      .send({ amount })
      .expect(400)

    expect(body.message).to.equals('"amount" must be a number')
  })

  it('Fails if the amount is negative', async () => {
    const currentBalance = 80
    const amount = -1
    const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
    const { body } = await request(app)
      .post(`/balances/deposit/${targetClient.id}`)
      .set('profile_id', client.id)
      .send({ amount })
      .expect(400)

    expect(body.message).to.equals('"amount" must be a positive number')
  })

  it('Fails if the amount is not provided', async () => {
    const currentBalance = 80
    const client = await factory.create('profile', { type: PROFILE_TYPE.CLIENT, balance: currentBalance })
    const { body } = await request(app)
      .post(`/balances/deposit/${targetClient.id}`)
      .set('profile_id', client.id)
      .send({})
      .expect(400)

    expect(body.message).to.equals('"amount" is required')
  })
})
