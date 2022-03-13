const { factory } = require('factory-girl')
const { expect } = require('chai')

describe('Job Model', () => {
  it('creates a job', async () => {
    const job = await factory.create('job')
    expect(job).to.exist
    expect(job.description).to.be.a('string')
    expect(job.price).to.be.a('number')
    expect(job.paid).to.be.a('boolean')
    expect(job.paymentDate).to.be.a('date')
  })
})