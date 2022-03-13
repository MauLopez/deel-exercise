module.exports = async (req, res, next) => {
  const { Job } = req.app.get('models')
  const { profile, params: { job_id: id } } = req
  req.job = await Job
    .scope({ method: ['byProfileType', profile.type, profile.id]})
    .findOne({ where: { id } })

  if (!req.job) return res.status(404).end()
  next()
}
