const app = require('../../src/app')

let srv
module.exports = async () => {
  if (srv) return srv

  srv = app.listen(3002)

  return srv
}
