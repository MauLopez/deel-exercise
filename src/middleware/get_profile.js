module.exports = async (req, res, next) => {
  const { Profile } = req.app.get('models')
  req.profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}})
  if (!req.profile) return res.status(401).end()
  next()
}
