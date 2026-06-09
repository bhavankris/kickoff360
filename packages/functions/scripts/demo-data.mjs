/**
 * WC2026 demo dataset (group stage, matchday 2 in progress) shared by
 * seed-demo.mjs and simulate-live.mjs. The demo "now" is Sat June 20 2026
 * ~18:40 — mid group stage: 25 finals, two live matches, the rest upcoming.
 * Kick-offs are stored relative to DEMO_NOW so the seeder can shift the whole
 * tournament onto the real clock (live matches actually live when you open
 * the app).
 */

export const DEMO_NOW = new Date('2026-06-20T18:40:00');

// [id, group, matchday, home, away, venueId, kickoffISO, status, h, a, min]
export const MATCHES = [
  // ── Matchday 1 — finals (June 16–19) ──────────────────────────
  ['m-a1', 'A', 1, 'MEX', 'ECU', 'azteca',   '2026-06-16T20:00:00', 'final', 2, 1],
  ['m-a2', 'A', 1, 'CRO', 'CMR', 'bbva',     '2026-06-17T17:00:00', 'final', 1, 0],
  ['m-b1', 'B', 1, 'CAN', 'UZB', 'bmo',      '2026-06-16T18:00:00', 'final', 3, 1],
  ['m-b2', 'B', 1, 'BEL', 'EGY', 'mercedes', '2026-06-17T15:00:00', 'final', 2, 2],
  ['m-c1', 'C', 1, 'USA', 'JOR', 'sofi',     '2026-06-16T19:00:00', 'final', 1, 0],
  ['m-c2', 'C', 1, 'SUI', 'QAT', 'levis',    '2026-06-17T13:00:00', 'final', 3, 1],
  ['m-d1', 'D', 1, 'BRA', 'NZL', 'metlife',  '2026-06-16T21:00:00', 'final', 4, 0],
  ['m-d2', 'D', 1, 'SEN', 'SCO', 'gillette', '2026-06-17T18:00:00', 'final', 1, 1],
  ['m-e1', 'E', 1, 'ARG', 'PAN', 'hardrock', '2026-06-16T18:00:00', 'final', 3, 0],
  ['m-e2', 'E', 1, 'NOR', 'KOR', 'lincoln',  '2026-06-17T20:00:00', 'final', 2, 1],
  ['m-f1', 'F', 1, 'FRA', 'CUW', 'att',      '2026-06-16T20:00:00', 'final', 5, 0],
  ['m-f2', 'F', 1, 'JPN', 'GHA', 'nrg',      '2026-06-17T16:00:00', 'final', 2, 0],
  ['m-g1', 'G', 1, 'ESP', 'KSA', 'arrowhead','2026-06-18T17:00:00', 'final', 3, 1],
  ['m-g2', 'G', 1, 'URU', 'CIV', 'akron',    '2026-06-18T14:00:00', 'final', 1, 1],
  ['m-h1', 'H', 1, 'POR', 'HAI', 'mercedes', '2026-06-18T15:00:00', 'final', 3, 0],
  ['m-h2', 'H', 1, 'COL', 'AUS', 'lumen',    '2026-06-18T19:00:00', 'final', 2, 1],
  ['m-i1', 'I', 1, 'ENG', 'TUN', 'levis',    '2026-06-18T18:00:00', 'final', 2, 0],
  ['m-i2', 'I', 1, 'MAR', 'PAR', 'sofi',     '2026-06-18T16:00:00', 'final', 1, 1],
  ['m-j1', 'J', 1, 'GER', 'CRC', 'metlife',  '2026-06-18T21:00:00', 'final', 2, 1],
  ['m-j2', 'J', 1, 'NED', 'ALG', 'gillette', '2026-06-18T13:00:00', 'final', 1, 0],
  ['m-k1', 'K', 1, 'ITA', 'JAM', 'hardrock', '2026-06-19T15:00:00', 'final', 2, 0],
  ['m-k2', 'K', 1, 'NGA', 'IRN', 'lincoln',  '2026-06-19T18:00:00', 'final', 1, 1],
  ['m-l1', 'L', 1, 'DEN', 'POL', 'bcplace',  '2026-06-19T19:00:00', 'final', 2, 1],
  ['m-l2', 'L', 1, 'SRB', 'AUT', 'bmo',      '2026-06-19T16:00:00', 'final', 0, 0],

  // ── Matchday 2 — "today" (June 20) ────────────────────────────
  ['m-f3', 'F', 2, 'FRA', 'JPN', 'att',      '2026-06-20T14:00:00', 'final', 2, 1],
  ['m-d3', 'D', 2, 'BRA', 'SCO', 'metlife',  '2026-06-20T18:00:00', 'live',  2, 1, 68],
  ['m-h3', 'H', 2, 'POR', 'COL', 'mercedes', '2026-06-20T18:15:00', 'live',  1, 1, 34],
  ['m-e3', 'E', 2, 'ARG', 'NOR', 'hardrock', '2026-06-20T21:00:00', 'upcoming', null, null],
  ['m-c3', 'C', 2, 'USA', 'SUI', 'sofi',     '2026-06-20T19:00:00', 'upcoming', null, null],

  // ── Matchday 2 — upcoming (June 21–22) ────────────────────────
  ['m-g3', 'G', 2, 'ESP', 'URU', 'arrowhead','2026-06-21T15:00:00', 'upcoming', null, null],
  ['m-a3', 'A', 2, 'MEX', 'CRO', 'azteca',   '2026-06-21T18:00:00', 'upcoming', null, null],
  ['m-i3', 'I', 2, 'ENG', 'MAR', 'levis',    '2026-06-21T16:00:00', 'upcoming', null, null],
  ['m-b3', 'B', 2, 'CAN', 'BEL', 'bmo',      '2026-06-21T19:00:00', 'upcoming', null, null],
  ['m-j3', 'J', 2, 'GER', 'NED', 'metlife',  '2026-06-22T18:00:00', 'upcoming', null, null],
  ['m-k3', 'K', 2, 'ITA', 'NGA', 'hardrock', '2026-06-22T15:00:00', 'upcoming', null, null],
  ['m-l3', 'L', 2, 'DEN', 'SRB', 'bcplace',  '2026-06-22T19:00:00', 'upcoming', null, null],
];

const VENUE_IDS = [
  'metlife', 'sofi', 'att', 'mercedes', 'nrg', 'arrowhead', 'lumen', 'levis',
  'gillette', 'hardrock', 'lincoln', 'azteca', 'akron', 'bbva', 'bcplace', 'bmo',
];

/** Group → 4 team codes, derived from the MD1 fixtures (2 per group cover all 4). */
export function groupsFromMatches() {
  const groups = {};
  for (const [, group, md, home, away] of MATCHES) {
    if (md !== 1) continue;
    const list = (groups[group] = groups[group] ?? []);
    for (const c of [home, away]) if (!list.includes(c)) list.push(c);
  }
  return groups;
}

/** Matchday 3: each team's remaining group fixture, so every nation has a "next". */
export function generateMatchday3() {
  const played = new Set();
  for (const [, , , home, away] of MATCHES) played.add([home, away].sort().join('|'));
  const groups = groupsFromMatches();
  const slots = [
    '2026-06-24T15:00:00', '2026-06-24T18:00:00', '2026-06-24T21:00:00',
    '2026-06-25T15:00:00', '2026-06-25T18:00:00', '2026-06-25T21:00:00',
  ];
  const out = [];
  let gi = 0;
  let si = 0;
  for (const g of Object.keys(groups)) {
    const codes = groups[g];
    const unplayed = [];
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        if (!played.has([codes[i], codes[j]].sort().join('|'))) unplayed.push([codes[i], codes[j]]);
      }
    }
    const used = new Set();
    const round = [];
    for (const [a, b] of unplayed) {
      if (!used.has(a) && !used.has(b)) {
        round.push([a, b]);
        used.add(a);
        used.add(b);
      }
    }
    for (const c of codes) {
      if (!used.has(c)) {
        const pr = unplayed.find(([a, b]) => a === c || b === c);
        if (pr) {
          round.push(pr);
          used.add(pr[0]);
          used.add(pr[1]);
        }
      }
    }
    round.forEach(([a, b], k) => {
      out.push([
        `m-${g.toLowerCase()}md3-${k}`, g, 3, a, b,
        VENUE_IDS[gi % VENUE_IDS.length], slots[si % slots.length], 'upcoming', null, null,
      ]);
      gi++;
      si++;
    });
  }
  return out;
}

// ── Rich detail for featured matches ──────────────────────────────
export const DETAILS = {
  'm-d3': {
    stats: { possession: [61, 39], shots: [14, 6], onTarget: [6, 3], xg: [2.4, 0.9],
             corners: [7, 2], fouls: [8, 12], offsides: [2, 1], passAcc: [89, 78], saves: [2, 4] },
    events: [
      { minute: 8,  type: 'goal',   team: 'BRA', player: 'Raphinha',        detail: 'Right-foot finish, assist Vinícius Jr' },
      { minute: 26, type: 'goal',   team: 'SCO', player: 'S. McTominay',    detail: 'Header from corner' },
      { minute: 35, type: 'yellow', team: 'SCO', player: 'B. Gilmour',      detail: 'Tactical foul' },
      { minute: 54, type: 'goal',   team: 'BRA', player: 'Vinícius Jr',     detail: 'Cut inside, low drive' },
      { minute: 61, type: 'yellow', team: 'BRA', player: 'Bruno Guimarães', detail: 'Late challenge' },
      { minute: 63, type: 'sub',    team: 'SCO', player: 'L. Shankland',    detail: 'On for Dykes' },
    ],
    lineups: {
      home: { formation: '4-2-3-1', xi: [
        ['1','Alisson','GK'], ['2','Vanderson','RB'], ['3','Marquinhos','CB'], ['4','Gabriel M.','CB'], ['6','Wendell','LB'],
        ['5','Bruno G.','DM'], ['8','João Gomes','CM'], ['7','Raphinha','RW'], ['10','Rodrygo','AM'], ['11','Vinícius Jr','LW'], ['9','Endrick','ST'] ],
        bench: ['Ederson (GK)', 'Casemiro', 'A. Pereira', 'Martinelli', 'Estêvão', 'Paquetá'] },
      away: { formation: '3-5-2', xi: [
        ['1','A. Gunn','GK'], ['5','J. Hendry','CB'], ['6','K. Tierney','CB'], ['3','A. Robertson','CB'], ['2','A. Ralston','RWB'],
        ['4','S. McTominay','CM'], ['8','B. Gilmour','CM'], ['7','J. McGinn','CM'], ['16','G. Taylor','LWB'], ['9','C. Adams','ST'], ['20','L. Dykes','ST'] ],
        bench: ['Z. Clark (GK)', 'L. Shankland', 'B. Doak', 'R. Christie', 'S. McLean', 'L. Morgan'] },
    },
    injuries: [
      { team: 'BRA', player: 'Neymar Jr',  pos: 'FW', status: 'Out — calf', note: 'Targeting Round of 16' },
      { team: 'SCO', player: 'S. McKenna', pos: 'DF', status: 'Doubt — hamstring', note: 'Late fitness test' },
    ],
    referee: 'Szymon Marciniak (POL)', attendance: '81,204', weather: 'Clear · 24°C', preview: null,
  },
  'm-h3': {
    stats: { possession: [47, 53], shots: [7, 8], onTarget: [3, 4], xg: [1.1, 1.3],
             corners: [3, 4], fouls: [10, 9], offsides: [1, 2], passAcc: [83, 85], saves: [3, 2] },
    events: [
      { minute: 12, type: 'goal',   team: 'POR', player: 'G. Ramos',    detail: 'Tap-in, assist Leão' },
      { minute: 21, type: 'yellow', team: 'POR', player: 'J. Palhinha', detail: 'Reckless challenge' },
      { minute: 29, type: 'goal',   team: 'COL', player: 'J. Córdoba',  detail: 'Header, assist James' },
    ],
    lineups: {
      home: { formation: '4-3-3', xi: [
        ['22','Diogo Costa','GK'], ['20','J. Cancelo','RB'], ['3','Rúben Dias','CB'], ['14','G. Inácio','CB'], ['5','N. Mendes','LB'],
        ['8','B. Fernandes','CM'], ['6','Vitinha','CM'], ['26','J. Palhinha','DM'], ['10','B. Silva','RW'], ['9','G. Ramos','ST'], ['15','R. Leão','LW'] ],
        bench: ['R. Patrício (GK)', 'Rúben Neves', 'J. Félix', 'F. Conceição', 'P. Neto', 'Trincão'] },
      away: { formation: '4-2-3-1', xi: [
        ['12','C. Vargas','GK'], ['4','D. Muñoz','RB'], ['23','D. Sánchez','CB'], ['3','J. Lucumí','CB'], ['17','J. Mojica','LB'],
        ['16','J. Lerma','DM'], ['20','R. Ríos','CM'], ['11','J. Arias','RW'], ['10','James Rodríguez','AM'], ['7','L. Díaz','LW'], ['9','J. Córdoba','ST'] ],
        bench: ['Montero (GK)', 'M. Uribe', 'L. Sinisterra', 'J. Quintero', 'R. Falcao', 'Y. Mina'] },
    },
    injuries: [
      { team: 'COL', player: 'D. Zapata', pos: 'FW', status: 'Out — ACL', note: 'Ruled out of tournament' },
    ],
    referee: 'Facundo Tello (ARG)', attendance: '70,118', weather: 'Humid · 27°C', preview: null,
  },
  'm-e3': {
    stats: null,
    events: [],
    lineups: null,
    injuries: [
      { team: 'ARG', player: 'Á. Di María', pos: 'FW', status: 'Doubt — rest', note: 'Managed minutes' },
      { team: 'NOR', player: 'M. Ødegaard', pos: 'MF', status: 'Fit', note: 'Returns from knock' },
    ],
    preview:
      'Group E top spot on the line. Haaland vs Argentina’s back line is the headline duel under the Miami lights.',
    referee: 'C. Ramos (USA)', attendance: null, weather: 'Clear · 29°C',
  },
};

// ── Golden Boot pool ───────────────────────────────────────────────
export const SCORERS = [
  { player: 'Kylian Mbappé',    team: 'FRA', goals: 4, assists: 1, mins: 180, shots: 11, pos: 'FW' },
  { player: 'Vinícius Jr',      team: 'BRA', goals: 3, assists: 2, mins: 158, shots: 9,  pos: 'FW' },
  { player: 'Erling Haaland',   team: 'NOR', goals: 3, assists: 0, mins: 174, shots: 10, pos: 'FW' },
  { player: 'Lautaro Martínez', team: 'ARG', goals: 3, assists: 1, mins: 165, shots: 8,  pos: 'FW' },
  { player: 'Gonçalo Ramos',    team: 'POR', goals: 2, assists: 1, mins: 124, shots: 6,  pos: 'FW' },
  { player: 'Raphinha',         team: 'BRA', goals: 2, assists: 3, mins: 158, shots: 7,  pos: 'FW' },
  { player: 'Harry Kane',       team: 'ENG', goals: 2, assists: 1, mins: 90,  shots: 5,  pos: 'FW' },
  { player: 'Lamine Yamal',     team: 'ESP', goals: 2, assists: 2, mins: 152, shots: 6,  pos: 'FW' },
  { player: 'Takefusa Kubo',    team: 'JPN', goals: 2, assists: 0, mins: 175, shots: 5,  pos: 'MF' },
  { player: 'Jhon Córdoba',     team: 'COL', goals: 1, assists: 0, mins: 108, shots: 4,  pos: 'FW' },
  { player: 'Scott McTominay',  team: 'SCO', goals: 1, assists: 1, mins: 158, shots: 3,  pos: 'MF' },
  { player: 'Cole Palmer',      team: 'ENG', goals: 1, assists: 2, mins: 88,  shots: 4,  pos: 'MF' },
];

// ── Scripted live drama for the simulator ──────────────────────────
export const SIM_SCRIPT = {
  'm-d3': [ // BRA 2-1 SCO, resumes at 68'
    { minute: 71, type: 'yellow', team: 'SCO', player: 'J. McGinn',    detail: 'Shirt pull on the break' },
    { minute: 74, type: 'goal',   team: 'SCO', player: 'C. Adams',     detail: 'Counter-attack, low finish' },
    { minute: 79, type: 'sub',    team: 'BRA', player: 'Martinelli',   detail: 'On for Rodrygo' },
    { minute: 83, type: 'goal',   team: 'BRA', player: 'Endrick',      detail: 'Volley from Raphinha cross' },
    { minute: 88, type: 'yellow', team: 'SCO', player: 'A. Robertson', detail: 'Cynical block' },
  ],
  'm-h3': [ // POR 1-1 COL, resumes at 34'
    { minute: 41, type: 'yellow', team: 'COL', player: 'J. Lerma',     detail: 'Late tackle' },
    { minute: 52, type: 'goal',   team: 'COL', player: 'L. Díaz',      detail: 'Curled into the far corner' },
    { minute: 60, type: 'sub',    team: 'POR', player: 'J. Félix',     detail: 'On for G. Ramos' },
    { minute: 67, type: 'goal',   team: 'POR', player: 'B. Fernandes', detail: 'Penalty, bottom left' },
    { minute: 81, type: 'goal',   team: 'POR', player: 'R. Leão',      detail: 'Solo run, near post' },
  ],
};

export const FT_MINUTE = { 'm-d3': 92, 'm-h3': 94 };

/** Stable Firestore doc id for a scorer. */
export const scorerId = (s) =>
  `${s.team}-${s.player}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
