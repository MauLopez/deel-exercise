module.exports = async (req, res, next) => {
  const { Contract } = req.app.get('models')
  const { profile, params: { contract_id: id } } = req
  req.contract = await Contract
    .scope({ method: ['byProfileType', profile.type, profile.id]})
    .findOne({ where: { id } })

  if (!req.contract) return res.status(404).end()
  next()
}
