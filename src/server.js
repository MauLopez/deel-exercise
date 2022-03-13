const app = require('./app')

init()

async function init() {
  try {
    let port = process.env.SERVER_PORT || 3001
    app.listen(port, () => {
      console.log(`Express App Listening on Port ${port}`)
    })
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`)
    process.exit(1)
  }
}
