// In-memory rate limiter — no external dependencies
const buckets = new Map();

// Clean stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets.entries()) {
    if (now > entry.resetAt) buckets.delete(key);
  }
}, 300_000).unref();

/**
 * createLimiter(maxRequests, windowMs, opts)
 * Keyed by postacId + route so different players don't share buckets.
 * Bez sesji postaci (logowanie, rejestracja) kluczem jest IP — wcześniej
 * takie żądania omijały limiter całkowicie.
 * opts.byIp = true wymusza klucz po IP (np. /login, żeby zmiana konta nie resetowała licznika).
 */
function createLimiter(maxRequests, windowMs, opts = {}) {
  return (req, res, next) => {
    const who = (!opts.byIp && req.session?.postacId)
      ? `p${req.session.postacId}`
      : `ip${req.ip}`;
    const key  = `${who}:${req.baseUrl}${req.path}`;
    const now  = Date.now();
    let entry  = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(key, entry);
    }

    entry.count++;
    if (entry.count > maxRequests) {
      const retrySec = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retrySec));
      return res.status(429).json({ ok: false, error: 'Za szybko! Poczekaj chwilę.' });
    }
    next();
  };
}

module.exports = { createLimiter, _buckets: buckets };
