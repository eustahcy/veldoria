// Manages day/night cycle and weather
const { logError } = require('./log');
const PORY   = ['swit', 'dzien', 'zmierzch', 'noc'];
const POGODY = ['pogodnie', 'pogodnie', 'pogodnie', 'deszcz', 'mgla', 'burza'];
// weights: 3x pogodnie, 1x deszcz, 1x mgla, 1x burza

let currentState = { pora: 'dzien', pogoda: 'pogodnie', zmiana_o: new Date() };
let ioInstance   = null;

function getState() { return { ...currentState }; }

async function loadFromDB(db) {
  try {
    const [[row]] = await db.query('SELECT * FROM serwer_pora WHERE id=1');
    if (row) currentState = { pora: row.pora, pogoda: row.pogoda, zmiana_o: row.zmiana_o };
  } catch (e) { logError('worldCycle:16')(e); }
}

async function tick(db) {
  const now = new Date();
  const minutesSinceChange = (now - new Date(currentState.zmiana_o)) / 60000;
  let changed = false;

  // Change pora every 30 minutes
  if (minutesSinceChange >= 30) {
    const idx = PORY.indexOf(currentState.pora);
    currentState.pora = PORY[(idx + 1) % PORY.length];
    currentState.zmiana_o = now;
    changed = true;
    // Change weather every 2 hours (every 4th pora change — when cycling back to 'dzien')
    if (currentState.pora === 'dzien') {
      currentState.pogoda = POGODY[Math.floor(Math.random() * POGODY.length)];
    }
  }

  if (changed) {
    try {
      await db.query(
        'UPDATE serwer_pora SET pora=?, pogoda=?, zmiana_o=NOW() WHERE id=1',
        [currentState.pora, currentState.pogoda]
      );
      if (ioInstance) {
        ioInstance.emit('world_state_change', { pora: currentState.pora, pogoda: currentState.pogoda });
      }
    } catch (e) { logError('worldCycle:45')(e); }
  }
}

function init(db, io) {
  ioInstance = io;
  loadFromDB(db).catch(logError('worldCycle:51'));
  setInterval(() => tick(db), 30_000); // check every 30 seconds
}

module.exports = { getState, init };
