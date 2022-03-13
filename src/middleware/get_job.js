module.exports = async (req, res, next) => {
  const { Job, Contract } = req.app.get('models')
  const { profile, params: { job_id: id } } = req
  req.job = await Job
    .findOne({
      where: { id },
      include: [{
        model: Contract
          .scope(
            { method: ['byProfileType', profile.type, profile.id]}
          )
      }]
    })

  if (!req.job) return res.status(404).end()
  next()
}
