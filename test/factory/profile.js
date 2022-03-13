const _ = require('lodash')
const randomstring = require('randomstring')
const { Profile } = require('../../src/model')
const { PROFILE_TYPE } = require('../../src/lib/constant')

module.exports = (factory) => {
  factory.define('profile', Profile, {
    firstName: randomstring.generate({
      length: 8,
      charset: 'alphabetic'
    }),
    lastName: randomstring.generate({
      length: 8,
      charset: 'alphabetic'
    }),
    profession: randomstring.generate({
      length: 8,
      charset: 'alphabetic'
    }),
    balance: _.random(100, 1000),
    type: _.sample(Object.values(PROFILE_TYPE))
  })
}
