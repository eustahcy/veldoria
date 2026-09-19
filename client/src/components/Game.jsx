import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { api } from '../api';
import { T } from '../theme';
import { useSocket } from '../hooks/useSocket';
import { usePathfinding, buildBlockSet } from '../hooks/usePathfinding';
import GameMap              from './GameMap';
import IsoGameMap           from './IsoGameMap';
import { applyTilePatch }   from '../ui/iso';
import { TopBar, HeroPanel, QuestTracker, BottomBar, LocationBox, QuickAccess } from './hud/GameHud';

// Widok świata: izometryczny dla map z iso=1, inaczej klasyczny z góry.
// Gdy mapa ma włączoną izometrię, ale nie została jeszcze pomalowana, pokazujemy
// klasyczny widok — inaczej gracze zobaczyliby pustą przestrzeń.
// Mapa uchodzi za gotową, gdy pomalowano co najmniej 25% jej powierzchni
function MapRenderer({ iso, tiles, ...props }) {
  const { maks_x = 0, maks_y = 0 } = props.state?.mapa || {};
  const pol = (maks_x + 1) * (maks_y + 1);
  const gotowa = iso && Object.keys(tiles || {}).length >= Math.max(50, pol * 0.25);
  return gotowa ? <IsoGameMap {...props} tiles={tiles} /> : <GameMap {...props} />;
}
import Chat                from './Chat';
import CombatLog           from './CombatLog';
import Inventory           from './Inventory';
import MobileControls      from './MobileControls';
import NpcDialog           from './NpcDialog';
import BattleModal         from './BattleModal2';
import AdminPanel          from './AdminPanel';
import Toast               from './Toast';
import CharPanel           from './CharPanel';
import TargetFrame         from './TargetFrame';
import PvpChallengeModal   from './PvpChallengeModal';
import QuestPanel          from './QuestPanel';
import SocialPanel         from './SocialPanel';
import GuildPanel          from './GuildPanel';
import PlayerProfile       from './PlayerProfile';
import Minimap             from './Minimap';
import RightPanel          from './RightPanel';
import OutfitSelector      from './OutfitSelector';
import TradeModal          from './TradeModal';

const AuctionHouse   = lazy(() => import('./AuctionHouse'));
const CraftingPanel  = lazy(() => import('./CraftingPanel'));
const FishingMinigame = lazy(() => import('./FishingMinigame'));
const TalentTree      = lazy(() => import('./TalentTree'));
const DungeonFinder   = lazy(() => import('./DungeonFinder2'));
import DungeonHUD from './DungeonHUD';
import WorldBossUI from './WorldBossUI';
import { OfflineRewardModal } from './OfflineProgress';
import { LandscapeHUD } from './LandscapeControls';
import { MobileHud, MenuScreen, InventoryScreen, CharacterScreen, SkillsScreen, QuestsScreen, MapScreen } from './mobile/MobileUI';

const DIR_ROW    = { dol:0, lewo:1, prawo:2, gora:3 };
const MOVE_MS    = 215;
const BUBBLE_TTL = 6000;

function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth < 860 || 'ontouchstart' in window);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 860 || 'ontouchstart' in window);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return m;
}

function useIsLandscape() {
  const [ls, setLs] = useState(() => window.innerWidth > window.innerHeight);
  useEffect(() => {
    const fn = () => setLs(window.innerWidth > window.innerHeight);
    const onOrient = () => setTimeout(fn, 150);
    window.addEventListener('resize', fn);
    window.addEventListener('orientationchange', onOrient);
    return () => {
      window.removeEventListener('resize', fn);
      window.removeEventListener('orientationchange', onOrient);
    };
  }, []);
  return ls;
}

// ── Top bar — dark fantasy style ─────────────────────────────────────────────
function MapTopBar({ mapa, players, postac }) {
  const onMap = (players?.length||0) + 1;
  const SERIF = '"Cinzel","Palatino Linotype",serif';
  return (
    <div style={{
      height:30, flexShrink:0,
      display:'flex', alignItems:'center',
      background:'linear-gradient(90deg,rgba(2,4,10,0.98),rgba(4,8,16,0.97),rgba(2,4,10,0.98))',
      borderBottom:'1px solid rgba(200,150,40,0.18)',
      padding:'0 14px', gap:12,
      boxShadow:'0 2px 16px rgba(0,0,0,0.6)',
    }}>
      {/* Map name */}
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ color:'rgba(200,150,40,0.5)', fontSize:10 }}>✦</span>
        <span style={{ color:'#E8C040', fontSize:10, fontWeight:700, letterSpacing:'1px', fontFamily:SERIF }}>
          {mapa?.nazwa || '…'}
        </span>
      </div>

      <div style={{ width:1, height:14, background:'rgba(200,150,40,0.18)' }} />

      {/* Coords */}
      <span style={{ fontSize:9, color:'rgba(200,150,40,0.35)', fontFamily:'monospace' }}>
        <span style={{ color:'rgba(200,150,40,0.25)' }}>X:</span> <span style={{ color:'rgba(200,150,40,0.6)' }}>{postac?.x}</span>
        {'  '}
        <span style={{ color:'rgba(200,150,40,0.25)' }}>Y:</span> <span style={{ color:'rgba(200,150,40,0.6)' }}>{postac?.y}</span>
      </span>

      <div style={{ width:1, height:14, background:'rgba(200,150,40,0.12)' }} />

      {/* Players online */}
      <span style={{ fontSize:9, color:'rgba(200,150,40,0.35)' }}>
        <span style={{ color:'rgba(61,187,106,0.8)', fontWeight:700 }}>{onMap}</span>
        <span style={{ color:'rgba(200,150,40,0.25)' }}> online</span>
      </span>

      {mapa && (
        <>
          <div style={{ width:1, height:14, background:'rgba(200,150,40,0.1)' }} />
          <span style={{ fontSize:9, color:'rgba(200,150,40,0.25)' }}>
            {mapa.maks_x+1}×{mapa.maks_y+1}
          </span>
        </>
      )}

      <span style={{ marginLeft:'auto', fontSize:8, color:'rgba(200,150,40,0.2)', letterSpacing:'0.3px' }}>
        WASD · LPM = ruch · Klik mob = walka
      </span>
    </div>
  );
}

// ── Online players sidebar strip ─────────────────────────────────────────────
function PlayersOnMap({ players }) {
  if (!players || players.length === 0) return null;
  return (
    <div style={{
      position:'absolute', top:8, right:8, zIndex:52,
      background:'linear-gradient(160deg, rgba(20,14,5,0.96), rgba(12,8,3,0.96))',
      border:'1px solid rgba(200,146,42,0.3)',
      borderRadius:4,
      minWidth:120, maxWidth:155,
      boxShadow:'0 4px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200,146,42,0.06)',
      overflow:'hidden',
    }}>
      <div style={{
        padding:'3px 8px', fontSize:7, letterSpacing:'2px', fontWeight:'bold',
        color:'#5A4020', background:'rgba(200,146,42,0.05)',
        borderBottom:'1px solid rgba(200,146,42,0.12)',
        textTransform:'uppercase',
      }}>
        ✦ Podróżnicy
      </div>
      {players.slice(0,8).map(p => (
        <div key={p.id} style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px', borderBottom:'1px solid rgba(200,146,42,0.04)' }}>
          <div style={{ width:3, height:3, borderRadius:'50%', background:'#27AE60', flexShrink:0 }} />
          <span style={{ color:'#8A7050', fontSize:9, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nazwa}</span>
          <span style={{ color:'#4A3828', fontSize:8, marginLeft:'auto' }}>{p.poziom}</span>
        </div>
      ))}
      {players.length > 8 && (
        <div style={{ padding:'2px 8px', fontSize:8, color:'#3A2818' }}>+{players.length-8} więcej</div>
      )}
    </div>
  );
}

// ── Desktop Hotbar (dark fantasy style) ──────────────────────────────────────
const HOTBAR_SERIF = '"Cinzel","Palatino Linotype",serif';

function HotSlot({ icon, label, shortcut, onClick, active, highlight }) {
  const [hov, setHov] = useState(false);
  const col = highlight ? '#E84040' : active ? '#3DBB6A' : hov ? '#E8C040' : 'rgba(200,150,40,0.55)';
  const bg  = highlight
    ? hov ? 'rgba(50,4,4,0.95)' : 'rgba(30,4,4,0.9)'
    : active ? hov ? 'rgba(6,36,14,0.95)' : 'rgba(4,24,10,0.9)'
    : hov ? 'rgba(6,12,24,0.95)' : 'rgba(4,8,18,0.85)';
  const bd  = highlight ? 'rgba(220,50,50,0.7)' : active ? 'rgba(40,180,80,0.5)' : hov ? 'rgba(200,150,40,0.45)' : 'rgba(200,150,40,0.14)';
  const glow = highlight ? '0 0 10px rgba(220,50,50,0.35)' : active ? `0 0 10px rgba(40,180,80,0.3)` : 'none';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`${label}${shortcut ? ` [${shortcut}]` : ''}`}
      style={{
        width:52, height:56, flexShrink:0,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
        background:bg, border:`1px solid ${bd}`,
        borderRadius:6, cursor:'pointer', position:'relative',
        boxShadow:`${glow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        transform: hov ? 'translateY(-2px)' : 'none',
        transition:'all .12s', backdropFilter:'blur(16px)',
      }}
    >
      {/* Top accent line on hover/active */}
      {(hov||active||highlight) && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${col},transparent)`, borderRadius:'6px 6px 0 0' }} />
      )}
      <span style={{ fontSize:19, lineHeight:1 }}>{icon}</span>
      <span style={{ fontSize:7.5, color:col, letterSpacing:'.4px', fontWeight:700, lineHeight:1, fontFamily:HOTBAR_SERIF }}>{label}</span>
      {shortcut && <span style={{ position:'absolute', top:3, right:4, fontSize:6.5, color:'rgba(200,150,40,0.25)', fontWeight:700 }}>{shortcut}</span>}
      {highlight && <span style={{ position:'absolute', top:3, left:4, width:6, height:6, borderRadius:'50%', background:'#E84040', boxShadow:'0 0 5px #E84040' }} />}
    </button>
  );
}

function Hotbar({ postac, onInventory, onHeal, onPvpToggle, onQuests, onSocial, onGuild, onAuction, onCraft, onFishing, onTalents, onDungeon, hasBoss }) {
  const Sep = () => (
    <div style={{ display:'flex', alignItems:'center', padding:'0 4px', flexShrink:0 }}>
      <div style={{ width:1, height:36, background:'linear-gradient(180deg,transparent,rgba(200,150,40,0.2),transparent)' }} />
    </div>
  );
  return (
    <div style={{
      height:68, flexShrink:0,
      display:'flex', alignItems:'center',
      background:'linear-gradient(180deg,rgba(4,8,18,0.99),rgba(2,5,12,0.99))',
      borderTop:'1px solid rgba(200,150,40,0.22)',
      padding:'0 10px', gap:3,
      boxShadow:'0 -4px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200,150,40,0.05)',
      position:'relative', overflowX:'auto',
    }}>
      {/* Top golden accent line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(200,150,40,0.3),transparent)', pointerEvents:'none' }} />
      {/* Fade edges */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:32, background:'linear-gradient(90deg,rgba(2,5,12,0.9),transparent)', pointerEvents:'none', zIndex:2 }} />
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:32, background:'linear-gradient(270deg,rgba(2,5,12,0.9),transparent)', pointerEvents:'none', zIndex:2 }} />

      <HotSlot icon="🧪" label="Eliksir" shortcut="H" onClick={onHeal} highlight={postac.zycie < postac.zycie_max * 0.4} />
      <HotSlot icon="🎒" label="Plecak"  shortcut="I" onClick={onInventory} />
      <Sep />
      <HotSlot icon="📜" label="Questy"  shortcut="Q" onClick={onQuests} />
      <HotSlot icon="👥" label="Znajomi" shortcut="U" onClick={onSocial} />
      <HotSlot icon="⚜" label="Gildia"  shortcut="G" onClick={onGuild} />
      <HotSlot icon="🏪" label="Aukcje"  shortcut="B" onClick={onAuction} />
      <Sep />
      <HotSlot icon="⚒" label="Craft"   shortcut="C" onClick={onCraft} />
      <HotSlot icon="🎣" label="Wędka"   shortcut=""  onClick={onFishing} />
      <HotSlot icon="⭐" label="Talenty" shortcut="T" onClick={onTalents} highlight={postac.punkty_talentow > 0} />
      <HotSlot icon="⚔" label="Dungeon" shortcut=""  onClick={onDungeon} />
      {hasBoss && <HotSlot icon="💀" label="Boss" shortcut="" onClick={() => {}} highlight />}
      <Sep />
      <HotSlot icon="🗡" label="PvP"    shortcut="P" onClick={onPvpToggle} active={postac.pvp} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Game({ onLogout, onDisconnect }) {
  const [state,       setState]      = useState(null);
  const [tiles,       setTiles]      = useState({});   // kafle izometryczne bieżącej mapy
  const [potions,     setPotions]    = useState([]);   // mikstury na pasek szybkich akcji
  const [unread,      setUnread]     = useState(0);
  const [direction,   setDirection]  = useState(0);
  const [animStep,    setAnimStep]   = useState(0);
  const [combatLog,   setCombatLog]  = useState([]);
  const [battle,      setBattle]     = useState(null);
  const [showInv,     setShowInv]    = useState(false);
  const [showAdmin,   setShowAdmin]  = useState(false);
  const [npcDialog,   setNpcDialog]  = useState(null);
  const [walkTarget,  setWalkTarget] = useState(null);
  const [toasts,       setToasts]      = useState([]);
  const [chatBubbles,  setChatBubbles] = useState({});
  const [target,       setTarget]      = useState(null);
  const [pvpChallenge,  setPvpChallenge] = useState(null);
  const [showQuests,    setShowQuests]   = useState(false);
  const [showSocial,    setShowSocial]   = useState(false);
  const [showGuild,     setShowGuild]    = useState(false);
  const [viewProfile,   setViewProfile]  = useState(null);
  const [showOutfit,    setShowOutfit]   = useState(false);
  const [worldState,    setWorldState]   = useState({ pora: 'dzien', pogoda: 'pogodnie' });
  const [activeEvent,   setActiveEvent]  = useState(null);
  const [showAuction,   setShowAuction]  = useState(false);
  const [showTrade,     setShowTrade]    = useState(false);
  const [tradeRequest,  setTradeRequest] = useState(null); // { sessionId, from }
  const [showCraft,     setShowCraft]    = useState(false);
  const [showFishing,   setShowFishing]  = useState(false);
  const [showTalents,   setShowTalents]  = useState(false);
  const [showDungeon,   setShowDungeon]  = useState(false);
  const [worldBoss,     setWorldBoss]    = useState(null);
  const [offlineDone,   setOfflineDone]  = useState(null); // session data when done
  // Telefon (pionowo): otwarty ekran, cel „pokaż na mapie”, auto-polowanie, czat
  const [mScreen,       setMScreen]      = useState(null);
  const [mapFocus,      setMapFocus]     = useState(null);
  const [autoHunt,      setAutoHunt]     = useState(false);
  const [mChat,         setMChat]        = useState(false);
  // Ruch innych graczy na żywo (socket) — { [id]: { x, y, kier, step, t } | { gone, t } }
  const [liveMoves,     setLiveMoves]    = useState({});
  const [skillBar,      setSkillBar]     = useState([]);   // umiejętności klasy na pasek 1–4
  const hotkeys = useRef({});                             // akcje dla klawiszy 1–4 / F1–F3
  const isMobile    = useIsMobile();
  const isLandscape = useIsLandscape();

  const [uiScale, setUiScale] = useState(() => Math.min(1, window.innerWidth / 1000, window.innerHeight / 600));
  useEffect(() => {
    const fn = () => setUiScale(Math.min(1, window.innerWidth / 1000, window.innerHeight / 600));
    const onOrient = () => setTimeout(fn, 150);
    window.addEventListener('resize', fn);
    window.addEventListener('orientationchange', onOrient);
    return () => { window.removeEventListener('resize', fn); window.removeEventListener('orientationchange', onOrient); };
  }, []);

  // Landscape-specific chat state
  const [lsChatOpen,  setLsChatOpen]  = useState(false);
  const [lsMessages,  setLsMessages]  = useState([]);
  const [lsChatInput, setLsChatInput] = useState('');
  const lsBottomRef = useRef(null);

  const posRef           = useRef({ x:null, y:null, mapa:null });
  const stateRef         = useRef(null);
  const lastMove         = useRef(0);
  const serverBlockCache = useRef(new Set());
  const bubbleTimers     = useRef({});
  const loadErrorCount   = useRef(0);

  const addToast = useCallback((msg, type='info') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  const showBubble = useCallback((kto, tresc) => {
    setChatBubbles(prev => ({ ...prev, [kto]: tresc }));
    clearTimeout(bubbleTimers.current[kto]);
    bubbleTimers.current[kto] = setTimeout(() => {
      setChatBubbles(prev => { const n={...prev}; delete n[kto]; return n; });
    }, BUBBLE_TTL);
  }, []);

  // ── Heartbeat (bez auto-wylogowania — tylko rozłączenie socketu) ─────────────
  useEffect(() => {
    const heartbeat = setInterval(() => {
      fetch('/api/auth/heartbeat', { method:'POST', credentials:'include' }).catch(()=>{});
    }, 20000);
    // Przy zamknięciu strony — tylko oznacz jako offline (nie niszczy sesji)
    const onHide = () => {
      navigator.sendBeacon?.('/api/auth/heartbeat-offline');
    };
    window.addEventListener('pagehide', onHide);
    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('pagehide', onHide);
    };
  }, []);

  // ── State management ─────────────────────────────────────────────────────────
  const mergeState = useCallback((data) => {
    if (!data || data.error) return;
    setState(prev => {
      const pos = posRef.current;
      const mapChanged = pos.mapa !== null && pos.mapa !== data.postac.mapa;
      if (mapChanged || pos.x === null) {
        posRef.current = { x:data.postac.x, y:data.postac.y, mapa:data.postac.mapa };
        stateRef.current = data;
        return data;
      }
      const merged = { ...data, postac:{ ...data.postac, x:pos.x, y:pos.y, mapa:pos.mapa } };
      stateRef.current = merged;
      return merged;
    });
  }, []);

  const loadState = useCallback(async () => {
    try {
      const data = await api.game.state();
      if (data.error) {
        loadErrorCount.current++;
        // Only logout after 5 consecutive failures (~12.5s) to handle brief reconnects
        if (loadErrorCount.current >= 5) onLogout();
        return;
      }
      loadErrorCount.current = 0;
      mergeState(data);
      if (data.worldState) setWorldState(data.worldState);
    } catch (_) {
      // Network error — swallow, polling will retry
    }
  }, [onLogout, mergeState]);

  useEffect(() => { loadState(); }, [loadState]);
  useEffect(() => {
    const id = setInterval(loadState, 2500);
    return () => clearInterval(id);
  }, [loadState]);

  const socket = useSocket(state?.mapa?.id);

  // Każdy krok innego gracza przychodzi osobno, więc postać płynnie przechodzi kafel po kaflu
  useEffect(() => {
    if (!socket) return;
    const idle = {};
    const onMoved = (m) => {
      if (m.id === stateRef.current?.postac?.id) return;
      setLiveMoves(prev => {
        const p = prev[m.id];
        return { ...prev, [m.id]: { x: m.x, y: m.y, kier: DIR_ROW[m.kierunek] ?? 0, step: ((p?.step || 0) + 1) % 4, t: Date.now() } };
      });
      clearTimeout(idle[m.id]);
      idle[m.id] = setTimeout(() => setLiveMoves(prev => (prev[m.id] && !prev[m.id].gone ? { ...prev, [m.id]: { ...prev[m.id], step: 0 } } : prev)), 330);
    };
    const onLeft = (m) => setLiveMoves(prev => ({ ...prev, [m.id]: { gone: true, t: Date.now() } }));
    socket.on('player_moved', onMoved);
    socket.on('player_left', onLeft);
    return () => {
      socket.off('player_moved', onMoved);
      socket.off('player_left', onLeft);
      Object.values(idle).forEach(clearTimeout);
    };
  }, [socket]);

  useEffect(() => {
    if (!state?.postac?.profesja) return;
    api.combat.skills().then(r => Array.isArray(r) && setSkillBar(r)).catch(() => {});
  }, [state?.postac?.profesja, state?.postac?.poziom]);

  // Po zmianie mapy stare pozycje są bez znaczenia
  useEffect(() => { setLiveMoves({}); }, [state?.mapa?.id]);

  // Przejście z paska zakładek ekwipunku do innych okien
  const openPanel = useCallback((id) => {
    setShowInv(false);
    const open = {
      postac:  () => setShowOutfit(true),
      talenty: () => setShowTalents(true),
      zadania: () => setShowQuests(true),
      gildia:  () => setShowGuild(true),
      aukcja:  () => setShowAuction(true),
    }[id];
    open?.();
  }, []);

  // ── Mikstury na pasek + licznik poczty ────────────────────────────────────
  const loadPotions = useCallback(async () => {
    try {
      const inv = await api.items.inventory();
      if (Array.isArray(inv)) setPotions(inv.filter(i => i.typ === 'Konsupcyjne' && i.zalozony !== 1));
    } catch { /* pasek zostaje z poprzednim stanem */ }
  }, []);

  useEffect(() => {
    loadPotions();
    const id = setInterval(loadPotions, 15000);
    return () => clearInterval(id);
  }, [loadPotions]);

  useEffect(() => {
    const load = () => api.social.unreadCount().then(r => setUnread(r?.count || 0)).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  // ── Kafle izometryczne: pobierz przy wejściu na mapę, aktualizuj na żywo ──
  const mapaId = state?.mapa?.id;
  const mapaIso = state?.mapa?.iso;
  useEffect(() => {
    if (!mapaId || !mapaIso) { setTiles({}); return; }
    let alive = true;
    api.game.tiles(mapaId).then(r => { if (alive && r && !r.error) setTiles(r.kafle || {}); });
    return () => { alive = false; };
  }, [mapaId, mapaIso]);

  useEffect(() => {
    if (!socket) return;
    const onTiles = ({ mapa_id, patch }) => {
      if (Number(mapa_id) !== Number(stateRef.current?.mapa?.id)) return;
      setTiles(prev => applyTilePatch({ ...prev }, patch));
    };
    socket.on('map_tiles', onTiles);
    return () => socket.off('map_tiles', onTiles);
  }, [socket]);

  // ── PvP challenge socket listeners ────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onChallenge   = (data) => setPvpChallenge(data);
    const onAccepted    = () => addToast(`Wyzwanie zaakceptowane! Walczysz z graczem`, 'info');
    const onDeclined    = (data) => addToast(`${data.defenderName || 'Gracz'} odrzucił wyzwanie`, 'info');
    const onWorldChange = (ws) => setWorldState(ws);

    const onTradeRequest   = (data) => setTradeRequest(data);
    const onTradeStarted   = ()     => { setShowTrade(true); setTradeRequest(null); };
    const onTradeCompleted = ()     => { setShowTrade(false); addToast('Handel zakończony sukcesem!', 'info'); loadState(); };
    const onTradeCancelled = (d)    => { setShowTrade(false); setTradeRequest(null); addToast(`Handel anulowany: ${d.reason || ''}`, 'info'); };
    const onBossSpawned = (data) => {
      api.worldboss.active().then(b => setWorldBoss(b || null)).catch(() => {});
      addToast(`⚔ Boss ${data.nazwa} pojawił się na mapie!`, 'warning');
    };
    const onBossDied = (data) => {
      setWorldBoss(null);
      addToast(`Boss ${data.nazwa} pokonany!`, 'success');
    };

    socket.on('pvp_challenge_received', onChallenge);
    socket.on('pvp_accepted', onAccepted);
    socket.on('pvp_declined', onDeclined);
    socket.on('world_state_change', onWorldChange);
    socket.on('trade_request_received', onTradeRequest);
    socket.on('trade_started',          onTradeStarted);
    socket.on('trade_completed',        onTradeCompleted);
    socket.on('trade_cancelled',        onTradeCancelled);
    socket.on('world_boss_spawned',     onBossSpawned);
    socket.on('world_boss_died',        onBossDied);
    return () => {
      socket.off('pvp_challenge_received', onChallenge);
      socket.off('pvp_accepted', onAccepted);
      socket.off('pvp_declined', onDeclined);
      socket.off('world_state_change', onWorldChange);
      socket.off('trade_request_received', onTradeRequest);
      socket.off('trade_started',          onTradeStarted);
      socket.off('trade_completed',        onTradeCompleted);
      socket.off('trade_cancelled',        onTradeCancelled);
      socket.off('world_boss_spawned',     onBossSpawned);
      socket.off('world_boss_died',        onBossDied);
    };
  }, [socket, addToast]);

  // ── Load active event ─────────────────────────────────────────────────────
  useEffect(() => {
    api.events.active().then(r => {
      if (r && r.active && r.event) setActiveEvent(r.event);
    }).catch(() => {});
  }, []);

  // ── Landscape chat: load messages + socket listener ───────────────────────
  useEffect(() => {
    if (!isLandscape) return;
    api.chat.get().then(m => setLsMessages(m)).catch(() => {});
  }, [isLandscape]);

  useEffect(() => {
    if (!socket || !isLandscape) return;
    const handler = (msg) => {
      setLsMessages(p => [...p.slice(-49), msg]);
    };
    socket.on('chat_message', handler);
    return () => socket.off('chat_message', handler);
  }, [socket, isLandscape]);

  useEffect(() => {
    if (lsChatOpen) lsBottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [lsMessages, lsChatOpen]);

  // ── World Boss polling ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBoss = () => {
      api.worldboss.active().then(b => setWorldBoss(b || null)).catch(() => {});
    };
    fetchBoss();
    const id = setInterval(fetchBoss, 10000);
    return () => clearInterval(id);
  }, []);

  // ── Offline progress check on mount ──────────────────────────────────────
  useEffect(() => {
    api.offline.status().then(s => {
      if (s && s.done) setOfflineDone(s);
    }).catch(() => {});
  }, []);

  // ── Movement ─────────────────────────────────────────────────────────────────
  const move = useCallback(async (dir) => {
    const now = Date.now();
    if (now - lastMove.current < MOVE_MS - 20) return false;
    lastMove.current = now;
    const cur = stateRef.current;
    const pos = posRef.current;
    if (!cur || pos.x === null) return false;

    const dx = { lewo:-1, prawo:1, gora:0, dol:0 }[dir];
    const dy = { lewo:0,  prawo:0, gora:-1, dol:1 }[dir];
    const nx = pos.x + dx, ny = pos.y + dy;
    if (nx<0||ny<0||nx>cur.mapa.maks_x||ny>cur.mapa.maks_y) return false;
    const blocked = buildBlockSet(cur);
    serverBlockCache.current.forEach(k => blocked.add(k));
    if (blocked.has(`${nx},${ny}`)) return false;

    setDirection(DIR_ROW[dir]);
    setAnimStep(p => (p+1)%4);
    posRef.current = { ...pos, x:nx, y:ny };
    setState(prev => prev ? { ...prev, postac:{ ...prev.postac, x:nx, y:ny } } : prev);

    const res = await api.game.move(dir);
    if (!res.ok) {
      serverBlockCache.current.add(`${nx},${ny}`);
      posRef.current = { ...posRef.current, x:pos.x, y:pos.y };
      setState(prev => prev ? { ...prev, postac:{ ...prev.postac, x:pos.x, y:pos.y } } : prev);
      return false;
    }
    if (res.teleported) {
      setWalkTarget(null);
      posRef.current = { x:null, y:null, mapa:null };
      await loadState();
    }
    return true;
  }, [loadState]);

  const { walkTo, walkAdjacentTo, stopWalking } = usePathfinding(move);

  const idleTimer = useRef(null);
  const triggerIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setAnimStep(0), 400);
  }, []);

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const KEY = {
      ArrowLeft:'lewo', ArrowRight:'prawo', ArrowUp:'gora', ArrowDown:'dol',
      a:'lewo',d:'prawo',w:'gora',s:'dol',
      A:'lewo',D:'prawo',W:'gora',S:'dol',
    };
    const onKey = e => {
      if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return;
      // W trakcie walki klawisze należą do okna walki (A/S/B/F/I, 1–9)
      if (hotkeys.current.inBattle) return;
      if (/^[1-4]$/.test(e.key)) { e.preventDefault(); hotkeys.current.attack?.(); return; }
      const fk = { F1:0, F2:1, F3:2 }[e.key];
      if (fk !== undefined) { e.preventDefault(); const p = hotkeys.current.potions?.[fk]; if (p) hotkeys.current.usePotion?.(p); return; }
      if (e.key.toLowerCase()==='r') { e.preventDefault(); hotkeys.current.auto?.(); return; }
      const dir = KEY[e.key];
      if (dir) {
        e.preventDefault();
        stopWalking(); setWalkTarget(null);
        move(dir).then(ok => { if(ok) triggerIdle(); });
        return;
      }
      // Shortcuts
      if (e.key.toLowerCase()==='i') { e.preventDefault(); setShowInv(v=>!v); }
      if (e.key.toLowerCase()==='q') { e.preventDefault(); setShowQuests(v=>!v); }
      if (e.key.toLowerCase()==='u') { e.preventDefault(); setShowSocial(v=>!v); }
      if (e.key.toLowerCase()==='g') { e.preventDefault(); setShowGuild(v=>!v); }
      if (e.key.toLowerCase()==='h') { e.preventDefault(); api.character.heal().then(loadState); }
      if (e.key.toLowerCase()==='p') { e.preventDefault(); api.character.pvpToggle().then(loadState); }
      if (e.key.toLowerCase()==='b') { e.preventDefault(); setShowAuction(v=>!v); }
      if (e.key.toLowerCase()==='c') { e.preventDefault(); setShowCraft(v=>!v); }
      if (e.key.toLowerCase()==='f') { e.preventDefault(); setShowFishing(v=>!v); }
      if (e.key.toLowerCase()==='t') { e.preventDefault(); setShowTalents(v=>!v); }
      if (e.key.toLowerCase()==='d' && !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) { e.preventDefault(); setShowDungeon(v=>!v); }
      if (e.key==='Escape') { setTarget(null); setShowInv(false); setShowQuests(false); setShowSocial(false); setShowGuild(false); setViewProfile(null); setShowOutfit(false); setShowAuction(false); setShowCraft(false); setShowFishing(false); setShowTalents(false); setShowDungeon(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, move, stopWalking, triggerIdle, loadState]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleMapClick = useCallback((tileX, tileY) => {
    const cur = stateRef.current;
    if (!cur) return;
    setTarget(null);
    setWalkTarget({ x:tileX, y:tileY });
    walkTo(tileX, tileY, cur);
  }, [walkTo]);

  const openBattle = useCallback(async (mob) => {
    const freshMob = await api.combat.mobInfo(mob.id);
    if (!freshMob || freshMob.error || freshMob.zycie <= 0) {
      addToast('Mob czeka na respawn', 'info');
      await loadState();
      return;
    }
    setBattle({ mob: freshMob, postac: stateRef.current.postac });
  }, [loadState, addToast]);

  const handleMobClick = useCallback((mob) => {
    const cur = stateRef.current;
    const pos = posRef.current;
    if (!cur) return;
    setTarget(mob);
    if (Math.abs(mob.x-pos.x)<=1 && Math.abs(mob.y-pos.y)<=1) {
      openBattle(mob);
    } else {
      walkAdjacentTo(mob.x, mob.y, cur, () => openBattle(mob));
    }
  }, [walkAdjacentTo, openBattle]);

  const handleNpcClick = useCallback((npc) => {
    const cur = stateRef.current;
    const pos = posRef.current;
    if (!cur) return;
    if (Math.abs(npc.x-pos.x)<=1 && Math.abs(npc.y-pos.y)<=1) {
      setNpcDialog(npc);
    } else {
      walkAdjacentTo(npc.x, npc.y, cur, () => setNpcDialog(npc));
    }
  }, [walkAdjacentTo]);

  const handlePlayerClick = useCallback((player) => {
    setViewProfile(player.id);
  }, []);

  const handleChatMessage = useCallback((msg) => { showBubble(msg.kto, msg.tresc); }, [showBubble]);

  // ── Szybkie akcje (pasek na telefonie) ────────────────────────────────────────
  const nearest = (list) => {
    const pos = posRef.current;
    let best = null, bd = Infinity;
    for (const o of list) {
      const d = Math.abs(o.x - pos.x) + Math.abs(o.y - pos.y);
      if (d < bd) { best = o; bd = d; }
    }
    return best ? { obj: best, dist: bd } : null;
  };

  const engageNearest = useCallback(() => {
    const cur = stateRef.current;
    const n = cur && nearest((cur.mobs || []).filter(m => m.zycie > 0));
    if (!n) { addToast('Brak potworów w pobliżu', 'info'); return false; }
    handleMobClick(n.obj);
    return true;
  }, [handleMobClick, addToast]);

  const talkNearest = useCallback(() => {
    const cur = stateRef.current;
    const n = cur && nearest(cur.npcs || []);
    if (!n || n.dist > 12) { addToast('Nikogo nie ma w pobliżu', 'info'); return; }
    handleNpcClick(n.obj);
  }, [handleNpcClick, addToast]);

  const usePotion = useCallback(async (p) => {
    const r = await api.items.use(p.id);
    addToast(r?.ok ? `${p.nazwa}: +${r.wyleczono} HP` : (r?.error || 'Nie udało się użyć'), r?.ok ? 'success' : 'info');
    loadState(); loadPotions();
  }, [addToast, loadState, loadPotions]);

  // Atak: zaznaczony cel, a bez celu — najbliższy potwór
  const attackOrEngage = useCallback(() => {
    if (!target) { engageNearest(); return; }
    const pos = posRef.current, cur = stateRef.current;
    if (Math.abs(target.x - pos.x) <= 1 && Math.abs(target.y - pos.y) <= 1) openBattle(target);
    else walkAdjacentTo(target.x, target.y, cur, () => openBattle(target));
  }, [target, engageNearest, openBattle, walkAdjacentTo]);

  const toggleAuto = useCallback(() => {
    setAutoHunt(v => { addToast(v ? 'Auto-polowanie wyłączone' : 'Auto-polowanie włączone', 'info'); return !v; });
  }, [addToast]);

  hotkeys.current = { inBattle: !!battle, attack: attackOrEngage, potions, usePotion, auto: toggleAuto };

  // Auto: po każdej walce sam wybiera najbliższego potwora; wyłącza się przy niskim HP
  useEffect(() => {
    if (!autoHunt || battle || npcDialog) return;
    const p = stateRef.current?.postac;
    if (!p) return;
    if (p.zycie < p.zycie_max * 0.35) { setAutoHunt(false); addToast('Auto wyłączone — mało życia', 'info'); return; }
    const t = setTimeout(() => { if (!engageNearest()) setAutoHunt(false); }, 1200);
    return () => clearTimeout(t);
  }, [autoHunt, battle, npcDialog, engageNearest, addToast]);

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (!state) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#2A1A08', flexDirection:'column', gap:16, fontFamily:'"Palatino Linotype",Palatino,serif' }}>
      <div style={{ color:'rgba(200,146,42,0.8)', fontSize:18, letterSpacing:'4px', fontWeight:'bold', textShadow:'0 0 20px rgba(200,146,42,0.4)' }}>VELDORIA</div>
      <div style={{ width:200, height:3, background:'rgba(200,146,42,0.1)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:'60%', background:'linear-gradient(90deg, #7A5C1E, #E8B84B)', borderRadius:2, animation:'shimmer 1.4s ease infinite' }} />
      </div>
      <div style={{ color:'rgba(200,146,42,0.5)', fontSize:11, letterSpacing:'2px' }}>Wchodzę do świata...</div>
      <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }`}</style>
    </div>
  );

  const isAdmin    = state.postac.ranga === 'GameAdmin';
  // Pozycje z socketu mają pierwszeństwo przed odpytywaniem (co 2,5 s) przez 4 s od ostatniego kroku
  const nowMs = Date.now();
  const livePlayers = (state.players || [])
    .filter(p => !(liveMoves[p.id]?.gone && nowMs - liveMoves[p.id].t < 4000))
    .map(p => {
      const l = liveMoves[p.id];
      return l && !l.gone && nowMs - l.t < 4000 ? { ...p, x: l.x, y: l.y, _kier: l.kier, _step: l.step } : p;
    });
  const stateForMap = { ...state, players: livePlayers, ...(walkTarget ? { _walkTarget: walkTarget } : {}) };
  const liveMob    = target ? state.mobs?.find(m => m.id === target.id) : null;

  // ── MOBILE LAYOUT (portrait only — landscape uses desktop layout) ────────────
  if (isMobile && !isLandscape) {
    const lastLog = combatLog.length > 0 ? combatLog[combatLog.length-1] : null;
    const pillTxt = lastLog?.type==='mob_dead'
      ? `+${lastLog.exp} EXP`
      : lastLog?.type==='hit'
      ? `-${lastLog.dmg} HP`
      : null;

    // Helper for landscape chat send
    const lsSendChat = async (e) => {
      e.preventDefault();
      const text = lsChatInput.trim();
      if (!text) return;
      setLsChatInput('');
      handleChatMessage({ kto: state.postac.nazwa, tresc: text });
      if (socket?.connected) socket.emit('chat_message', { tresc: text });
      else { await api.chat.send(text); api.chat.get().then(m => setLsMessages(m)); }
    };

    // ── LANDSCAPE LAYOUT ─────────────────────────────────────────────────────
    if (isLandscape) {
      const modals = (
        <>
          {showInv    && <Inventory onClose={()=>setShowInv(false)} onRefresh={()=>{ loadState(); loadPotions(); }} postac={state.postac} onNavigate={openPanel} />}
          {npcDialog  && <NpcDialog npc={npcDialog} postac={state.postac} onClose={()=>setNpcDialog(null)} onBought={loadState} onQuestReward={msg=>{ addToast(msg,'info'); loadState(); }} />}
          {showQuests && <QuestPanel onClose={()=>setShowQuests(false)} onReward={msg=>{ addToast(msg,'info'); loadState(); setShowQuests(false); }} />}
          {showSocial && <SocialPanel onClose={()=>setShowSocial(false)} onViewProfile={id=>{ setViewProfile(id); setShowSocial(false); }} />}
          {showGuild  && <GuildPanel  onClose={()=>setShowGuild(false)} socket={socket} postacId={state.postac.id} />}
          {showAdmin  && <AdminPanel postac={state.postac} onClose={()=>setShowAdmin(false)} />}
          {showOutfit && <OutfitSelector postac={state.postac} onClose={()=>setShowOutfit(false)} onChanged={()=>{ loadState(); setShowOutfit(false); }} />}
          {battle     && (
            <BattleModal mob={battle.mob} postac={battle.postac} mapa={state.mapa}
              onClose={() => { setBattle(null); setTarget(null); loadState(); }}
              onEnd={() => { loadState(); setTimeout(()=>setBattle(null),600); }}
              onLog={entries => setCombatLog(p => [...p.slice(-40), ...entries])}
            />
          )}
          {pvpChallenge && (
            <PvpChallengeModal challenge={pvpChallenge}
              onAccept={() => {
                socket?.emit('pvp_accept', { challengerId: pvpChallenge.challengerId });
                api.combat.pvp(pvpChallenge.challengerId).then(res => {
                  if (res.ok) { setCombatLog(p => [...p.slice(-30), ...res.log]); loadState(); }
                });
                setPvpChallenge(null);
              }}
              onDecline={() => { socket?.emit('pvp_decline', {}); setPvpChallenge(null); }}
            />
          )}
          {viewProfile && <PlayerProfile postacId={viewProfile} myId={state.postac.id} onClose={()=>setViewProfile(null)} socket={socket}
            onSendMessage={() => { setViewProfile(null); setShowSocial(true); }}
            onChallengePvp={id => { socket?.emit('pvp_challenge',{targetId:id}); addToast('Wyzwanie PvP wysłane','info'); }}
            onTradeRequest={id => socket?.emit('trade_request', { targetId: id })}
          />}
          {showTrade && (
            <TradeModal socket={socket} postacId={state.postac.id} myInventory={state.items || []} onClose={() => { setShowTrade(false); socket?.emit('trade_cancel', {}); }} />
          )}
          {tradeRequest && (
            <div style={{ position:'fixed', inset:0, background:'rgba(20,10,3,0.80)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:450, fontFamily:'Verdana,sans-serif' }}>
              <div style={{ padding:'16px 20px', background:'rgba(10,16,7,0.99)', border:'1px solid rgba(200,150,32,0.3)', borderRadius:8, textAlign:'center', maxWidth:'90vw' }}>
                <div style={{ color:'#E8B84B', fontWeight:'bold', marginBottom:8 }}>🤝 {tradeRequest.from?.nazwa} proponuje handel</div>
                <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                  <button onClick={() => { socket?.emit('trade_accept', { sessionId: tradeRequest.sessionId }); setShowTrade(true); setTradeRequest(null); }} style={{ padding:'6px 16px', background:'rgba(74,122,42,0.3)', color:'#4ADE80', border:'1px solid rgba(74,122,42,0.5)', borderRadius:4, cursor:'pointer', fontFamily:'Verdana,sans-serif' }}>Tak</button>
                  <button onClick={() => { socket?.emit('trade_decline', { sessionId: tradeRequest.sessionId }); setTradeRequest(null); }} style={{ padding:'6px 16px', background:'rgba(120,30,30,0.3)', color:'#F87171', border:'1px solid rgba(180,30,30,0.5)', borderRadius:4, cursor:'pointer', fontFamily:'Verdana,sans-serif' }}>Nie</button>
                </div>
              </div>
            </div>
          )}
          {showAuction && (
            <Suspense fallback={null}>
              <AuctionHouse onClose={() => setShowAuction(false)} postac={state.postac} socket={socket} />
            </Suspense>
          )}
          {showCraft && (
            <Suspense fallback={null}>
              <CraftingPanel onClose={() => setShowCraft(false)} postac={state.postac} />
            </Suspense>
          )}
          {showFishing && (
            <Suspense fallback={null}>
              <FishingMinigame onClose={() => setShowFishing(false)} postac={state.postac} />
            </Suspense>
          )}
          {showTalents && (
            <Suspense fallback={null}>
              <TalentTree onClose={() => setShowTalents(false)} postac={state.postac} />
            </Suspense>
          )}
          {showDungeon && (
            <Suspense fallback={null}>
              <DungeonFinder onClose={() => setShowDungeon(false)} addToast={addToast} postac={state.postac} onTeleport={() => { setShowDungeon(false); loadState(); }} />
            </Suspense>
          )}
          {worldBoss && (
            <WorldBossUI boss={worldBoss} postac={state.postac} socket={socket} addToast={addToast}
              onBossUpdate={() => api.worldboss.active().then(b => setWorldBoss(b || null)).catch(() => {})}
              onBossDied={() => setWorldBoss(null)}
            />
          )}
          {offlineDone && (
            <OfflineRewardModal
              session={offlineDone}
              onCollect={(res) => {
                setOfflineDone(null);
                addToast(`Odebrano: +${res.exp} EXP, +${res.gold}g, ${res.kills} zabójstw`, 'success');
                loadState();
              }}
            />
          )}
          <Toast toasts={toasts} />
          <style>{globalCSS}</style>
        </>
      );

      return (
        <div style={{ position:'relative', width:'100vw', height:'100vh', overflow:'hidden', background:'#2A1A08' }}>
          {/* Full-screen map */}
          <MapRenderer iso={!!state.mapa?.iso} tiles={tiles}
            state={stateForMap} direction={direction} animStep={animStep}
            chatBubbles={chatBubbles}
            onMobClick={handleMobClick} onPlayerClick={handlePlayerClick}
            onNpcClick={handleNpcClick} onMapClick={handleMapClick}
            isMobile worldState={worldState}
          />
          {/* Floating landscape HUD */}
          <LandscapeHUD
            postac={state.postac} mapa={state.mapa}
            worldState={worldState} pillTxt={pillTxt} activeEvent={activeEvent}
            onMove={dir=>{ stopWalking(); setWalkTarget(null); move(dir).then(ok=>{if(ok)triggerIdle();}); }}
            onLogout={onLogout} onDisconnect={onDisconnect}
            socket={socket} isAdmin={isAdmin}
            onInventory={()=>setShowInv(true)}
            onPvpToggle={()=>api.character.pvpToggle().then(loadState)}
            onAdmin={()=>setShowAdmin(true)}
            onQuests={()=>setShowQuests(v=>!v)}
            onSocial={()=>setShowSocial(v=>!v)}
            onGuild={()=>setShowGuild(v=>!v)}
            onAuction={()=>setShowAuction(v=>!v)}
            onCraft={()=>setShowCraft(v=>!v)}
            onFishing={()=>setShowFishing(v=>!v)}
            onTalents={()=>setShowTalents(v=>!v)}
            onDungeon={()=>setShowDungeon(v=>!v)}
            onOutfit={()=>setShowOutfit(v=>!v)}
            onChatMessage={handleChatMessage}
            lsChatOpen={lsChatOpen} setLsChatOpen={setLsChatOpen}
            lsMessages={lsMessages} lsChatInput={lsChatInput}
            setLsChatInput={setLsChatInput} lsSendChat={lsSendChat}
            lsBottomRef={lsBottomRef}
          />
          {/* Other overlays */}
          {target && (
            <TargetFrame mob={target} liveMob={liveMob}
              onAttack={()=>{ const pos=posRef.current; const cur=stateRef.current; if(!cur)return; if(Math.abs(target.x-pos.x)<=1&&Math.abs(target.y-pos.y)<=1)openBattle(target); else walkAdjacentTo(target.x,target.y,cur,()=>openBattle(target)); }}
              onClose={()=>setTarget(null)}
            />
          )}
          {combatLog.length > 0 && <CombatLog entries={combatLog} />}
          <Minimap state={state} />
          <DungeonHUD addToast={addToast} onLeave={() => { loadState(); }} />
          {modals}
        </div>
      );
    }

    // ── PORTRAIT LAYOUT — full-screen map, floating HUD ──────────────────────
    return (
      <div style={{ position:'relative', width:'100vw', height:'100vh', overflow:'hidden', background:'#2A1A08' }}>
        {/* Full-screen map */}
        <MapRenderer iso={!!state.mapa?.iso} tiles={tiles}
          state={stateForMap} direction={direction} animStep={animStep}
          chatBubbles={chatBubbles}
          onMobClick={handleMobClick} onPlayerClick={handlePlayerClick}
          onNpcClick={handleNpcClick} onMapClick={handleMapClick}
          isMobile worldState={worldState}
        />
        {/* Overlays */}
        {target && (
          <TargetFrame mob={target} liveMob={liveMob}
            onAttack={()=>{ const pos=posRef.current; const cur=stateRef.current; if(!cur)return; if(Math.abs(target.x-pos.x)<=1&&Math.abs(target.y-pos.y)<=1)openBattle(target); else walkAdjacentTo(target.x,target.y,cur,()=>openBattle(target)); }}
            onClose={()=>setTarget(null)}
          />
        )}
        {combatLog.length > 0 && <CombatLog entries={combatLog} />}
        {/* HUD chowa się, gdy otwarte jest dowolne okno — inaczej przykrywałby je */}
        {!(mScreen || battle || npcDialog || showQuests || showSocial || showGuild || showAdmin || showOutfit || showAuction
          || showCraft || showFishing || showTalents || showDungeon || viewProfile || showTrade || showInv) && (
          <>
            <MobileHud
              state={state} potions={potions} unread={unread} pillTxt={pillTxt}
              autoHunt={autoHunt} chatOpen={mChat}
              onMove={dir=>{ stopWalking(); setWalkTarget(null); move(dir).then(triggerIdle); }}
              onScreen={setMScreen}
              onChat={()=>setMChat(v=>!v)}
              onAttack={attackOrEngage}
              onTalk={talkNearest}
              onPotion={usePotion}
              onAuto={toggleAuto}
            />
            {mChat && (
              <div style={{ position:'fixed', left:0, right:0, bottom:'calc(env(safe-area-inset-bottom, 0px) + 78px)', zIndex:495 }}>
                <Chat socket={socket} isMobile={false} onMessage={handleChatMessage} mode="overlay" playerName={state.postac.nazwa} />
              </div>
            )}
          </>
        )}

        {mScreen === 'menu' && (
          <MenuScreen postac={state.postac} isAdmin={isAdmin} unread={unread} onClose={()=>setMScreen(null)}
            onPick={(id) => {
              if (['postac','ekwipunek','umiejetnosci','zadania','mapa'].includes(id)) { setMScreen(id); return; }
              setMScreen(null);
              ({
                gildia: () => setShowGuild(true), ranking: () => setShowGuild(true), aukcja: () => setShowAuction(true),
                poczta: () => setShowSocial(true), rzemioslo: () => setShowCraft(true), lowienie: () => setShowFishing(true),
                lochy: () => setShowDungeon(true), wyglad: () => setShowOutfit(true), admin: () => setShowAdmin(true),
                pvp: () => api.character.pvpToggle().then(loadState),
                wyloguj: () => (onDisconnect || onLogout)(),
              })[id]?.();
            }} />
        )}
        {mScreen === 'ekwipunek' && <InventoryScreen postac={state.postac} onClose={()=>setMScreen(null)} onRefresh={()=>{ loadState(); loadPotions(); }} />}
        {mScreen === 'postac' && <CharacterScreen postac={state.postac} onClose={()=>setMScreen(null)} onRefresh={()=>{ loadState(); loadPotions(); }} onOutfit={()=>{ setMScreen(null); setShowOutfit(true); }} />}
        {mScreen === 'umiejetnosci' && <SkillsScreen postac={state.postac} onClose={()=>setMScreen(null)} onRefresh={loadState} />}
        {mScreen === 'zadania' && <QuestsScreen onClose={()=>setMScreen(null)} onShowOnMap={(f)=>{ setMapFocus(f); setMScreen('mapa'); }} />}
        {mScreen === 'mapa' && (
          <MapScreen state={state} focus={mapFocus} onClose={()=>setMScreen(null)}
            onWalk={(x,y)=>handleMapClick(x,y)} onNpc={handleNpcClick} />
        )}
        {showInv && <InventoryScreen postac={state.postac} onClose={()=>setShowInv(false)} onRefresh={()=>{ loadState(); loadPotions(); }} />}
        {npcDialog && <NpcDialog npc={npcDialog} postac={state.postac} onClose={()=>setNpcDialog(null)} onBought={loadState} onQuestReward={msg=>{ addToast(msg,'info'); loadState(); }} />}
        {showQuests && <QuestPanel onClose={()=>setShowQuests(false)} onReward={msg=>{ addToast(msg,'info'); loadState(); setShowQuests(false); }} />}
        {showAdmin && <AdminPanel postac={state.postac} onClose={()=>setShowAdmin(false)} />}
        {battle    && (
          <BattleModal mob={battle.mob} postac={battle.postac} mapa={state.mapa}
            onClose={() => { setBattle(null); setTarget(null); loadState(); }}
            onEnd={() => { loadState(); setTimeout(()=>setBattle(null),600); }}
            onLog={entries => setCombatLog(p => [...p.slice(-40), ...entries])}
          />
        )}
        {pvpChallenge && (
          <PvpChallengeModal
            challenge={pvpChallenge}
            onAccept={() => {
              socket?.emit('pvp_accept', { challengerId: pvpChallenge.challengerId });
              api.combat.pvp(pvpChallenge.challengerId).then(res => {
                if (res.ok) { setCombatLog(p => [...p.slice(-30), ...res.log]); loadState(); }
              });
              setPvpChallenge(null);
            }}
            onDecline={() => { socket?.emit('pvp_decline', {}); setPvpChallenge(null); }}
          />
        )}
        {showSocial  && <SocialPanel onClose={()=>setShowSocial(false)} onViewProfile={id=>{ setViewProfile(id); setShowSocial(false); }} />}
        {showGuild   && <GuildPanel  onClose={()=>setShowGuild(false)} socket={socket} postacId={state.postac.id} />}
        {showQuests  && <QuestPanel  onClose={()=>setShowQuests(false)} onReward={msg=>{ addToast(msg,'info'); loadState(); setShowQuests(false); }} />}
        {viewProfile && <PlayerProfile postacId={viewProfile} myId={state.postac.id} onClose={()=>setViewProfile(null)} socket={socket}
            onSendMessage={d=>{ setViewProfile(null); setShowSocial(true); }}
            onChallengePvp={id=>{ socket?.emit('pvp_challenge',{targetId:id}); addToast('Wyzwanie PvP wysłane','info'); }}
            onTradeRequest={id=>{ socket?.emit('trade_request',{targetId:id}); addToast('Propozycja handlu wysłana','info'); }} />}
        {showTrade && (
          <TradeModal socket={socket} postacId={state.postac.id} myInventory={state.items || []} onClose={() => { setShowTrade(false); socket?.emit('trade_cancel', {}); }} />
        )}
        {tradeRequest && (
          <div style={{ position:'fixed', inset:0, background:'rgba(20,10,3,0.80)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:450, fontFamily:'Verdana,sans-serif' }}>
            <div style={{ padding:'16px 20px', background:'rgba(10,16,7,0.99)', border:'1px solid rgba(200,150,32,0.3)', borderRadius:8, textAlign:'center', maxWidth:'90vw' }}>
              <div style={{ color:'#E8B84B', fontWeight:'bold', marginBottom:8 }}>🤝 {tradeRequest.from?.nazwa} proponuje handel</div>
              <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                <button onClick={() => { socket?.emit('trade_accept', { sessionId: tradeRequest.sessionId }); setShowTrade(true); setTradeRequest(null); }} style={{ padding:'6px 16px', background:'rgba(74,122,42,0.3)', color:'#4ADE80', border:'1px solid rgba(74,122,42,0.5)', borderRadius:4, cursor:'pointer', fontFamily:'Verdana,sans-serif' }}>Tak</button>
                <button onClick={() => { socket?.emit('trade_decline', { sessionId: tradeRequest.sessionId }); setTradeRequest(null); }} style={{ padding:'6px 16px', background:'rgba(120,30,30,0.3)', color:'#F87171', border:'1px solid rgba(180,30,30,0.5)', borderRadius:4, cursor:'pointer', fontFamily:'Verdana,sans-serif' }}>Nie</button>
              </div>
            </div>
          </div>
        )}
        {showAuction && (
          <Suspense fallback={null}>
            <AuctionHouse onClose={() => setShowAuction(false)} postac={state.postac} socket={socket} />
          </Suspense>
        )}
        {showCraft && (
          <Suspense fallback={null}>
            <CraftingPanel onClose={() => setShowCraft(false)} postac={state.postac} />
          </Suspense>
        )}
        {showFishing && (
          <Suspense fallback={null}>
            <FishingMinigame onClose={() => setShowFishing(false)} postac={state.postac} />
          </Suspense>
        )}
        {showTalents && (
          <Suspense fallback={null}>
            <TalentTree onClose={() => setShowTalents(false)} postac={state.postac} />
          </Suspense>
        )}
        {showDungeon && (
          <Suspense fallback={null}>
            <DungeonFinder
              onClose={() => setShowDungeon(false)}
              addToast={addToast}
              onTeleport={() => { setShowDungeon(false); loadState(); }}
            />
          </Suspense>
        )}
        {worldBoss && (
          <WorldBossUI
            boss={worldBoss}
            addToast={addToast}
            onBossUpdate={() => api.worldboss.active().then(b => setWorldBoss(b || null)).catch(() => {})}
            onBossDied={() => setWorldBoss(null)}
          />
        )}
        {offlineDone && (
          <OfflineRewardModal
            session={offlineDone}
            onCollect={(res) => {
              setOfflineDone(null);
              addToast(`Odebrano: +${res.exp} EXP, +${res.gold}g, ${res.kills} zabójstw`, 'success');
              loadState();
            }}
          />
        )}
        <Toast toasts={toasts} />
        <style>{globalCSS}</style>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ────────────────────────────────────────────────────────────
  // zoom skaluje layout proporcjonalnie — zawartość wypełnia ekran bez przesunięcia
  const _zoom = uiScale < 1 ? uiScale : undefined;
  const _innerW = uiScale < 1 ? `${(100 / uiScale).toFixed(2)}vw` : '100vw';
  const _innerH = uiScale < 1 ? `${(100 / uiScale).toFixed(2)}vh` : '100vh';
  return (
    <div style={{ width:'100vw', height:'100vh', overflow:'hidden', position:'relative', background:'#2A1A08' }}>
    <div style={{ display:'flex', width:_innerW, height:_innerH, overflow:'hidden', zoom:_zoom }}>

      {/* LEFT: panel bohatera */}
      <HeroPanel
        postac={state.postac}
        actions={[
          { icon:'🧍', label:'Postać',       onClick:()=>setShowOutfit(true) },
          { icon:'🎒', label:'Ekwipunek',    skrot:'I', onClick:()=>setShowInv(v=>!v) },
          { icon:'⭐', label:'Talenty',      skrot:'T', onClick:()=>setShowTalents(v=>!v), uwaga: state.postac.punkty_talentow > 0 },
          { icon:'📜', label:'Zadania',      skrot:'Q', onClick:()=>setShowQuests(v=>!v) },
          { icon:'⚜', label:'Gildia',       skrot:'G', onClick:()=>setShowGuild(v=>!v) },
          { icon:'👥', label:'Przyjaciele',  skrot:'U', onClick:()=>setShowSocial(v=>!v) },
          { icon:'⚒', label:'Rzemiosło',    skrot:'C', onClick:()=>setShowCraft(v=>!v) },
          { icon:'🐟', label:'Wędka',        skrot:'F', onClick:()=>setShowFishing(v=>!v) },
          { icon:'🏰', label:'Lochy',        skrot:'D', onClick:()=>setShowDungeon(v=>!v) },
          ...(isAdmin ? [{ icon:'★', label:'Admin', onClick:()=>setShowAdmin(true) }] : []),
        ]}
      />

      {/* CENTER: Map + panels column */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minWidth:0 }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Górny pasek */}
        <TopBar
          postac={state.postac} mapa={state.mapa} worldState={worldState}
          tokens={state.postac.event_tokeny}
          unread={unread}
          onAuction={()=>setShowAuction(v=>!v)}
          onRanking={()=>setShowGuild(v=>!v)}
          onMail={()=>setShowSocial(v=>!v)}
          onSettings={()=>setShowOutfit(true)}
        />

        {/* Map area (fills remaining vertical space) */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <MapRenderer iso={!!state.mapa?.iso} tiles={tiles}
            state={stateForMap} direction={direction} animStep={animStep}
            chatBubbles={chatBubbles}
            onMobClick={handleMobClick} onPlayerClick={handlePlayerClick}
            onNpcClick={handleNpcClick} onMapClick={handleMapClick}
            isMobile={false} worldState={worldState}
          />

          {/* Active event banner (desktop) */}
          {activeEvent && (
            <div style={{
              position:'absolute', top:0, left:0, right:0, zIndex:61,
              background:`${activeEvent.kolor || '#C8940A'}22`,
              borderBottom:`1px solid ${activeEvent.kolor || '#C8940A'}66`,
              padding:'3px 12px',
              display:'flex', alignItems:'center', justifyContent:'center',
              color: activeEvent.kolor || '#C8940A',
              fontSize: 10, fontWeight:'bold', pointerEvents:'none',
              backdropFilter:'blur(2px)',
            }}>
              ✦ [{activeEvent.nazwa}] {activeEvent.opis} ✦
            </div>
          )}

          {/* Target frame (center-top of map) */}
          {target && (
            <TargetFrame
              mob={target}
              liveMob={liveMob}
              onAttack={() => {
                const pos = posRef.current;
                const cur = stateRef.current;
                if (!cur) return;
                if (Math.abs(target.x-pos.x)<=1 && Math.abs(target.y-pos.y)<=1) {
                  openBattle(target);
                } else {
                  walkAdjacentTo(target.x, target.y, cur, () => openBattle(target));
                }
              }}
              onClose={() => setTarget(null)}
            />
          )}

          {/* Players on map (top-right corner) */}
          {state.players?.length > 0 && (
            <PlayersOnMap players={state.players} />
          )}

          {/* Combat log (left side of map, top) */}
          {combatLog.length > 0 && (
            <CombatLog entries={combatLog} />
          )}

          {/* Minimap (bottom-right of map area) */}
          <Minimap state={state} size={168} />
          <DungeonHUD addToast={addToast} onLeave={() => { loadState(); }} />

          {/* Lokalizacja + śledzenie zadań pod minimapą */}
          <div style={{ position:'absolute', top:186, right:10, width:268, zIndex:55, display:'flex', flexDirection:'column', gap:10 }}>
            <LocationBox mapa={state.mapa} postac={state.postac} />
            <QuestTracker onOpen={()=>setShowQuests(true)} />
          </div>

          {/* Dół mapy: czat (lewy róg) + pasek z kulami HP/EN */}
          <div style={{ position:'absolute', left:10, right:10, bottom:8, zIndex:60, display:'flex', alignItems:'flex-end', gap:14, pointerEvents:'none' }}>
            <div style={{ width:340, flexShrink:0, pointerEvents:'auto' }}>
              <Chat socket={socket} isMobile={false} onMessage={handleChatMessage} mode="overlay" playerName={state.postac.nazwa} />
            </div>
            <div style={{ flex:1, minWidth:0, display:'flex', justifyContent:'center' }}>
              <div style={{ pointerEvents:'auto' }}>
                <BottomBar
                  postac={state.postac}
                  potions={potions}
                  onUsePotion={usePotion}
                  skills={skillBar}
                  onSkill={attackOrEngage}
                  extras={[
                    { k:'R', icon:'Ⓜ', label:'Auto-polowanie: po walce sam atakuje najbliższego potwora', onClick:toggleAuto, active:autoHunt },
                    { k:'I', icon:'🎒', label:'Ekwipunek (I)', onClick:()=>setShowInv(v=>!v) },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Collapsible social panel */}
      <RightPanel
        socket={socket}
        postacId={state.postac.id}
        onViewProfile={id => setViewProfile(id)}
        onTurnInReward={msg => { addToast(msg, 'info'); loadState(); }}
        onGuild={() => setShowGuild(v=>!v)}
      />
      </div>
    </div>{/* end scaled layout */}

      {/* Modals — poza skalowanym kontenerem, zawsze pełny viewport */}
      {showInv    && <Inventory onClose={()=>setShowInv(false)} onRefresh={()=>{ loadState(); loadPotions(); }} postac={state.postac} onNavigate={openPanel} />}
      {npcDialog  && <NpcDialog npc={npcDialog} postac={state.postac} onClose={()=>setNpcDialog(null)} onBought={loadState} />}
      {showAdmin  && <AdminPanel postac={state.postac} onClose={()=>setShowAdmin(false)} />}
      {battle     && (
        <BattleModal mob={battle.mob} postac={battle.postac} mapa={state.mapa}
          onClose={() => { setBattle(null); setTarget(null); loadState(); }}
          onEnd={() => { loadState(); setTimeout(()=>setBattle(null),600); }}
          onLog={entries => setCombatLog(p => [...p.slice(-40), ...entries])}
        />
      )}

      {pvpChallenge && (
        <PvpChallengeModal
          challenge={pvpChallenge}
          onAccept={() => {
            socket?.emit('pvp_accept', { challengerId: pvpChallenge.challengerId });
            api.combat.pvp(pvpChallenge.challengerId).then(res => {
              if (res.ok) { setCombatLog(p => [...p.slice(-30), ...res.log]); loadState(); }
            });
            setPvpChallenge(null);
          }}
          onDecline={() => { socket?.emit('pvp_decline', {}); setPvpChallenge(null); }}
        />
      )}
      {showSocial  && <SocialPanel onClose={()=>setShowSocial(false)} onViewProfile={id=>{ setViewProfile(id); setShowSocial(false); }} />}
      {showGuild   && <GuildPanel  onClose={()=>setShowGuild(false)} socket={socket} postacId={state.postac.id} />}
      {showQuests  && <QuestPanel  onClose={()=>setShowQuests(false)} onReward={msg=>{ addToast(msg,'info'); loadState(); setShowQuests(false); }} />}
      {viewProfile && <PlayerProfile postacId={viewProfile} myId={state.postac.id} onClose={()=>setViewProfile(null)} socket={socket}
          onSendMessage={()=>{ setViewProfile(null); setShowSocial(true); }}
          onChallengePvp={id=>{ socket?.emit('pvp_challenge',{targetId:id}); addToast('Wyzwanie PvP wysłane','info'); }} />}
      {showOutfit && <OutfitSelector postac={state.postac} onClose={()=>setShowOutfit(false)} onChanged={()=>{ loadState(); setShowOutfit(false); }} />}
      {showTrade && (
        <TradeModal
          socket={socket}
          postacId={state.postac.id}
          myInventory={state.items || []}
          onClose={() => { setShowTrade(false); socket?.emit('trade_cancel', {}); }}
        />
      )}
      {tradeRequest && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(20,10,3,0.75)', backdropFilter:'blur(3px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:450,
          fontFamily:'Verdana,sans-serif',
        }}>
          <div style={{
            padding:'20px 24px', background:'linear-gradient(160deg,rgba(10,16,7,0.99),rgba(6,10,4,0.99))',
            border:'1px solid rgba(200,150,32,0.3)', borderRadius:8, textAlign:'center',
            boxShadow:'0 8px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ color:'#E8B84B', fontSize:13, fontWeight:'bold', marginBottom:8 }}>🤝 Propozycja handlu</div>
            <div style={{ color:'#CDD4AA', fontSize:11, marginBottom:16 }}>
              <span style={{ color:'#C8940A', fontWeight:'bold' }}>{tradeRequest.from?.nazwa || 'Gracz'}</span> proponuje handel
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={() => {
                socket?.emit('trade_accept', { sessionId: tradeRequest.sessionId });
                setShowTrade(true);
                setTradeRequest(null);
              }} style={{
                padding:'7px 18px', background:'rgba(74,122,42,0.3)', color:'#4ADE80',
                border:'1px solid rgba(74,122,42,0.5)', borderRadius:4, cursor:'pointer', fontSize:11, fontWeight:'bold',
              }}>Tak</button>
              <button onClick={() => {
                socket?.emit('trade_decline', { sessionId: tradeRequest.sessionId });
                setTradeRequest(null);
              }} style={{
                padding:'7px 18px', background:'rgba(120,30,30,0.3)', color:'#F87171',
                border:'1px solid rgba(180,30,30,0.5)', borderRadius:4, cursor:'pointer', fontSize:11, fontWeight:'bold',
              }}>Nie</button>
            </div>
          </div>
        </div>
      )}
      {showAuction && (
        <Suspense fallback={null}>
          <AuctionHouse onClose={() => setShowAuction(false)} postac={state.postac} socket={socket} />
        </Suspense>
      )}
      {showCraft && (
        <Suspense fallback={null}>
          <CraftingPanel onClose={() => setShowCraft(false)} postac={state.postac} />
        </Suspense>
      )}
      {showFishing && (
        <Suspense fallback={null}>
          <FishingMinigame onClose={() => setShowFishing(false)} postac={state.postac} />
        </Suspense>
      )}
      {showTalents && (
        <Suspense fallback={null}>
          <TalentTree onClose={() => setShowTalents(false)} postac={state.postac} />
        </Suspense>
      )}
      {showDungeon && (
        <Suspense fallback={null}>
          <DungeonFinder
            onClose={() => setShowDungeon(false)}
            addToast={addToast}
            onTeleport={() => { setShowDungeon(false); loadState(); }}
          />
        </Suspense>
      )}
      {worldBoss && (
        <WorldBossUI
          boss={worldBoss}
          postac={state.postac}
          socket={socket}
          addToast={addToast}
          onBossUpdate={() => api.worldboss.active().then(b => setWorldBoss(b || null)).catch(() => {})}
          onBossDied={() => setWorldBoss(null)}
        />
      )}
      {offlineDone && (
        <OfflineRewardModal
          session={offlineDone}
          onCollect={(res) => {
            setOfflineDone(null);
            addToast(`Odebrano: +${res.exp} EXP, +${res.gold}g, ${res.kills} zabójstw`, 'success');
            loadState();
          }}
        />
      )}
      <Toast toasts={toasts} />
      <style>{globalCSS}</style>
    </div>
  );
}

const globalCSS = `
  @keyframes slideDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
  @keyframes shimmer    { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
  @keyframes bubblePop  { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
  ::-webkit-scrollbar       { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:rgba(40,24,8,0.5); }
  ::-webkit-scrollbar-thumb { background:rgba(74,122,42,0.35); border-radius:3px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(108,184,58,0.5); }
  input::placeholder { color:#2A3820; font-style:italic; }
  * { box-sizing: border-box; }
  body { background:#2A1A08; }
`;
