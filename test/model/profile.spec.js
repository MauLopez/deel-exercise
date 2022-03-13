const { factory } = require('factory-girl')
const { expect } = require('chai')

const { PROFILE_TYPE } = require('../../src/lib/constant')

describe('Profile Model', () => {
  it('creates a contractor', async () => {
    const profile = await factory.create('profile', { type: PROFILE_TYPE.CONTRACTOR })
    expect(profile).to.exist
    expect(profile.type).to.equals(PROFILE_TYPE.CONTRACTOR)
    expect(profile.firstName).to.be.a('string')
    expect(profile.lastName).to.be.a('string')
    expect(profile.profession).to.be.a('string')
    expect(profile.balance).to.be.a('number')
  })

  it('creates a client', async () => {
    const profile = await factory.create('profile', { type: PROFILE_TYPE.CLIENT })
    expect(profile).to.exist
    expect(profile.type).to.equals(PROFILE_TYPE.CLIENT)
    expect(profile.firstName).to.be.a('string')
    expect(profile.lastName).to.be.a('string')
    expect(profile.profession).to.be.a('string')
    expect(profile.balance).to.be.a('number')
  })

  it('is invalid with an incorrect type', async () => {
    try {
      const result = await factory.create('profile', { type: 'notexist' })
      throw new Error('It should fail')
    } catch (e) {
      expect(e.message).to.equals('Profile type not in enum.')
    }
  })

  it('is invalid without a type', async () => {
    try {
      const result = await factory.create('profile', { type: null })
      throw new Error('It should fail')
    } catch (e) {
      const {
        errors: [{
          message,
          type,
          path
        }]
      } = e
      expect(message).to.equals('Profile.type cannot be null')
      expect(type).to.equals('notNull Violation')
      expect(path).to.equals('type')
    }
  })
})