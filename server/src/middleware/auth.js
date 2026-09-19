function requireSession(req, res, next) {
  if (!req.session.postacId) {
    return res.status(401).json({ error: 'Nie zalogowany' });
  }
  next();
}

module.exports = { requireSession };
