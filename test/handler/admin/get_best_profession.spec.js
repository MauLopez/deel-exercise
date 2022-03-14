const { factory } = require('factory-girl')
const { expect } = require('chai')
const request = require('supertest')
const moment = require('moment')

const startServer = require('../../utils/start_server')
const cleanDB = require('../../utils/clean_db')
const { PROFILE_TYPE } = require('../../../src/lib/constant')

describe('Admin Handler - Get best profession', () => {
  let app
  before(async () => {
    app = await startServer()
  })

  let profile
  beforeEach(async () => {
    await cleanDB()
    profile = await factory.create('profile')
    const [
      plumberContractor1, plumberContractor2, plumberContractor3
    ] = await factory.createMany('profile', 3, { type: PROFILE_TYPE.CONTRACTOR, profession: 'plumber' })
    const [
      programmerContractor1, programmerContractor2
    ] = await factory.createMany('profile', 2, { type: PROFILE_TYPE.CONTRACTOR, profession: 'programmer' })
    await factory.create('job', { paid: true, price: 40, paymentDate: moment().subtract(5, 'days').toDate() }, {contractorId: plumberContractor1.id })
    await factory.create('job', { paid: true, price: 30, paymentDate: moment().subtract(3, 'days').toDate() }, {contractorId: plumberContractor2.id })
    await factory.create('job', { paid: true, price: 50, paymentDate: moment().subtract(15, 'days').toDate() }, {contractorId: plumberContractor3.id })
    await factory.create('job', { paid: true, price: 100, paymentDate: moment().subtract(5, 'days').toDate() }, {contractorId: programmerContractor1.id })
    await factory.create('job', { paid: true, price: 10, paymentDate: moment().subtract(2, 'days').toDate() }, {contractorId: programmerContractor2.id })
  })

  it('Gets top profession without date range', async () => {
    const { body: { job } } = await request(app)
      .get(`/admin/best-profession`)
      .set('profile_id', profile.id)
      .expect(200)

    expect(job.profession).to.equals('plumber')
    expect(job.amount).to.equals(120)
  })

  it('Gets top profession in the last 7 days', async () => {
    const { body: { job } } = await request(app)
      .get(`/admin/best-profession`)
      .set('profile_id', profile.id)
      .query({
        start: moment().subtract(7, 'days').format()
      })
      .expect(200)

    expect(job.profession).to.equals('programmer')
    expect(job.amount).to.equals(110)
  })

  it('Gets top profession for a specific date range', async () => {
    const { body: { job } } = await request(app)
      .get(`/admin/best-profession`)
      .set('profile_id', profile.id)
      .query({
        start: moment().subtract(4, 'days').format(),
        end: moment().subtract(1, 'days').format()
      })
      .expect(200)

    expect(job.profession).to.equals('plumber')
    expect(job.amount).to.equals(30)
  })

  it('Returns null if no job is available for the specific date range', async () => {
    const { body: { job } } = await request(app)
      .get(`/admin/best-profession`)
      .set('profile_id', profile.id)
      .query({
        start: moment().subtract(30, 'days').format(),
        end: moment().subtract(25, 'days').format()
      })
      .expect(200)

    expect(job).to.not.exist
  })
})
