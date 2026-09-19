// Zamiast pustych catch(_) {} — błąd nie znika bez śladu.
// Użycie: promise.catch(logError('cron:boss'))  albo  catch (e) { logError('trade')(e); }
function logError(context) {
  return (err) => {
    console.error(`[${new Date().toISOString()}] [${context}]`, err?.message || err);
  };
}

module.exports = { logError };

// Dla odpowiedzi HTTP: szczegóły błędu (np. treść błędu SQL) idą do logu serwera,
// klient dostaje ogólny komunikat
function serverError(err, context = 'api') {
  logError(context)(err);
  return 'Błąd serwera';
}

module.exports.serverError = serverError;
