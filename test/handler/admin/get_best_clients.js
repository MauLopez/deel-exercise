const { factory } = require('factory-girl')
const { expect } = require('chai')
const request = require('supertest')
const moment = require('moment')

const startServer = require('../../utils/start_server')
const cleanDB = require('../../utils/clean_db')
const { PROFILE_TYPE } = require('../../../src/lib/constant')

describe('Admin Handler - Get best clients', () => {
  let app
  before(async () => {
    app = await startServer()
  })

  let profile, client1, client2, client3
  beforeEach(async () => {
    await cleanDB()
    profile = await factory.create('profile')

    client1 = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
    await factory.create('job', {
      paid: true,
      price: 40,
      paymentDate: moment().subtract(5, 'days').toDate()
    }, { clientId: client1.id })
    await factory.create('job', {
      paid: true,
      price: 30,
      paymentDate: moment().subtract(2, 'days').toDate()
    }, { clientId: client1.id })
    await factory.create('job', {
      paid: false,
      price: 80,
      paymentDate: moment().subtract(3, 'days').toDate()
    }, { clientId: client1.id })

    client2 = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
    await factory.create('job', {
      paid: true,
      price: 10,
      paymentDate: moment().subtract(15, 'days').toDate()
    }, { clientId: client2.id })
    await factory.create('job', {
      paid: true,
      price: 20,
      paymentDate: moment().subtract(2, 'days').toDate()
    }, { clientId: client2.id })

    client3 = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
    await factory.create('job', {
      paid: true,
      price: 50,
      paymentDate: moment().subtract(15, 'days').toDate()
    }, { clientId: client3.id })
    await factory.create('job', {
      paid: true,
      price: 30,
      paymentDate: moment().subtract(2, 'days').toDate()
    }, { clientId: client3.id })
  })

  it('Gets top clients', async () => {
    const { body: { clients } } = await request(app)
      .get(`/admin/best-clients`)
      .set('profile_id', profile.id)
      .expect(200)

    expect(clients).to.have.a.lengthOf(3)
    expect(clients[0].id).to.equals(client3.id)
    expect(clients[0].amount).to.equals(80)
    expect(clients[0].firstName).to.equals(client3.firstName)
    expect(clients[0].lasttName).to.equals(client3.lasttName)

    expect(clients[1].id).to.equals(client1.id)
    expect(clients[1].amount).to.equals(70)
    expect(clients[1].firstName).to.equals(client1.firstName)
    expect(clients[1].lasttName).to.equals(client1.lasttName)

    expect(clients[2].id).to.equals(client2.id)
    expect(clients[2].amount).to.equals(30)
    expect(clients[2].firstName).to.equals(client2.firstName)
    expect(clients[2].lasttName).to.equals(client2.lasttName)
  })

  it('Gets top 1 client', async () => {
    const { body: { clients } } = await request(app)
      .get(`/admin/best-clients`)
      .set('profile_id', profile.id)
      .query({
        limit: 1
      })
      .expect(200)

    expect(clients).to.have.a.lengthOf(1)
    expect(clients[0].id).to.equals(client3.id)
    expect(clients[0].amount).to.equals(80)
    expect(clients[0].firstName).to.equals(client3.firstName)
    expect(clients[0].lasttName).to.equals(client3.lasttName)
  })

  it('Get clients for a date range', async () => {
    const { body: { clients } } = await request(app)
      .get(`/admin/best-clients`)
      .set('profile_id', profile.id)
      .query({
        start: moment().subtract(6, 'days').format(),
        end: moment().subtract(1, 'days').format()
      })
      .expect(200)

    expect(clients).to.have.a.lengthOf(3)
    expect(clients[0].id).to.equals(client1.id)
    expect(clients[0].amount).to.equals(70)
    expect(clients[0].firstName).to.equals(client1.firstName)
    expect(clients[0].lasttName).to.equals(client1.lasttName)

    expect(clients[1].id).to.equals(client3.id)
    expect(clients[1].amount).to.equals(30)
    expect(clients[1].firstName).to.equals(client3.firstName)
    expect(clients[1].lasttName).to.equals(client3.lasttName)

    expect(clients[2].id).to.equals(client2.id)
    expect(clients[2].amount).to.equals(20)
    expect(clients[2].firstName).to.equals(client2.firstName)
    expect(clients[2].lasttName).to.equals(client2.lasttName)
  })

  it('Gets an empty array of clients if there isn\'t for the date range', async () => {
    const { body: { clients } } = await request(app)
      .get(`/admin/best-clients`)
      .set('profile_id', profile.id)
      .query({
        start: moment().subtract(30, 'days').format(),
        end: moment().subtract(25, 'days').format()
      })
      .expect(200)

    expect(clients).to.be.empty
  })
})
