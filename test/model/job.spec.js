const { factory } = require('factory-girl')
const { expect } = require('chai')
const { CONTRACT_STATUS } = require('../../src/lib/constant')

describe('Job Model', () => {
  it('creates a job', async () => {
    const job = await factory.create('job')
    await job.reload({
      include: [{association: 'Contract'}]
    })
    expect(job).to.exist
    expect(job.description).to.be.a('string')
    expect(job.price).to.be.a('number')
    expect(job.paid).to.be.a('boolean')
    expect(job.paymentDate).to.be.a('date')
    expect(job.ContractId).to.be.a('number')
    expect(job.Contract).to.exist
    expect(Object.values(CONTRACT_STATUS)).to.includes(job.Contract.status)
    expect(job.Contract.terms).to.be.a('string')
    expect(job.Contract.ClientId).to.be.a('number')
    expect(job.Contract.ContractorId).to.be.a('number')
  })
})