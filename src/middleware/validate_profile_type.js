module.exports = (type) => {
  return async (req, res, next) => {
    if (req.profile.type !== type) {
      return res.status(401).end()
    }
    next()
  }
}
