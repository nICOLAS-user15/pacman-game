/**
 * PAC-MAN ARCADE PROTOTYPE - EDIÇÃO 5 FASES
 * Vanilla JavaScript & HTML5 Canvas com IA aprimorada,
 * teletransportes nos cantos e laterais, mudança dinâmica de labirintos e tela cheia.
 */

const TILE_SIZE = 20;
const COLS = 19;
const ROWS = 21;

const DIRS = {
  UP:    { x: 0, y: -1, angle: 1.5 * Math.PI },
  DOWN:  { x: 0, y: 1,  angle: 0.5 * Math.PI },
  LEFT:  { x: -1, y: 0, angle: Math.PI },
  RIGHT: { x: 1, y: 0,  angle: 0 }
};

// --- CONFIGURAÇÃO DAS 5 FASES ---
// Legenda dos Ladrilhos:
// 1 = Parede
// 2 = Pílula comum (10 pts)
// 3 = Pílula de poder (50 pts, assusta fantasmas)
// 0 = Corredor vazio
// 4 = Porta da Casa dos Fantasmas (passagem permitida apenas para fantasmas)
// 5 = Interior da Casa dos Fantasmas
// 6 = Portal de Teletransporte nos Cantos (Warp Portal)
// 9 = Área externa/Void (inacessível)

const PHASES = [
  // FASE 1: O Clássico (Azul Neon - Fácil e Amigável)
  {
    name: 'O Clássico',
    wallColor: '#2121ff',
    glowColor: 'rgba(33, 70, 255, 0.5)',
    bgColor: '#000000',
    innerWall: '#090d24',
    ghostSpeed: 1.35, // Velocidade reduzida para uma experiência inicial tranquila
    pacmanSpeed: 2.0, // Pac-Man é ~48% mais rápido que os fantasmas
    frightenedDuration: 9.0, // 9 segundos de vulnerabilidade nos fantasmas
    ghostReleases: [0, 2.5, 6.0, 10.0], // Saída espaçada da casa
    fruit: { icon: '🍒', name: 'Cereja', points: 100 },
    feature: { icon: '🌀', name: 'Túnel Lateral', desc: 'Atravessa de um lado ao outro da tela' },
    tunnels: [{ row: 10, leftCol: 0, rightCol: 18 }],
    portals: [],
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 3, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 3, 1], // 1
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1], // 2
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1], // 3
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 4
      [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1], // 5
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1], // 6
      [1, 1, 1, 1, 2, 1, 1, 1, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1, 1], // 7 (Abertura no topo da casa)
      [9, 9, 9, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 9, 9, 9], // 8 (Corredor de saída: Col 9 Row 8)
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 9 (Porta na col 9)
      [0, 0, 0, 0, 2, 0, 0, 1, 5, 5, 5, 1, 0, 0, 2, 0, 0, 0, 0], // 10 (Túnel lateral nas pontas)
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 11
      [9, 9, 9, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 9, 9, 9], // 12 (Spawn da Fruta em col 9)
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 13
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 14
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1], // 15
      [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1], // 16 (Pacman: col 9, row 16)
      [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1], // 17
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1], // 18
      [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1], // 19
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 20
    ]
  },

  // FASE 2: Jardins Esmeralda (Verde Neon com túneis duplos)
  {
    name: 'Jardins Esmeralda',
    wallColor: '#00ff88',
    glowColor: 'rgba(0, 255, 136, 0.5)',
    bgColor: '#02120a',
    innerWall: '#062917',
    ghostSpeed: 1.65,
    pacmanSpeed: 2.1,
    frightenedDuration: 7.5,
    ghostReleases: [0, 1.8, 4.5, 7.5],
    fruit: { icon: '🍓', name: 'Morango', points: 300 },
    feature: { icon: '🌀🌀', name: 'Túneis Duplos', desc: 'Dois túneis independentes no superior e meio' },
    tunnels: [
      { row: 10, leftCol: 0, rightCol: 18 },
      { row: 4,  leftCol: 0, rightCol: 18 }
    ],
    portals: [],
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 3, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 3, 1], // 1
      [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1], // 2
      [1, 2, 1, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 1, 2, 1], // 3
      [0, 2, 2, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 2, 2, 2, 0], // 4 (Túnel Superior)
      [1, 2, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 2, 1], // 5
      [1, 2, 2, 2, 2, 1, 2, 1, 1, 0, 1, 1, 2, 1, 2, 2, 2, 2, 1], // 6
      [1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1], // 7
      [9, 9, 9, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 9, 9, 9], // 8
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 9
      [0, 0, 0, 0, 2, 0, 0, 1, 5, 5, 5, 1, 0, 0, 2, 0, 0, 0, 0], // 10 (Túnel Meio)
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 11
      [9, 9, 9, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 9, 9, 9], // 12
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 13
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 14
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1], // 15
      [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1], // 16
      [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1], // 17
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1], // 18
      [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1], // 19
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 20
    ]
  },

  // FASE 3: Carmesim Retro (Teletransporte nos 4 Cantos do Labirinto!)
  {
    name: 'Carmesim Retro',
    wallColor: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.55)',
    bgColor: '#14010a',
    innerWall: '#290416',
    ghostSpeed: 1.95,
    pacmanSpeed: 2.2,
    frightenedDuration: 6.0,
    ghostReleases: [0, 1.2, 3.2, 5.5],
    fruit: { icon: '🍊', name: 'Laranja', points: 500 },
    feature: { icon: '🌌', name: 'Portais nos Cantos', desc: 'Vórtices cósmicos para saltos diagonais nos 4 cantos!' },
    tunnels: [{ row: 10, leftCol: 0, rightCol: 18 }],
    // Teleportes nos 4 Cantos (6): Canto A <-> Canto D, Canto B <-> Canto C
    portals: [
      { r1: 1, c1: 1, r2: 19, c2: 17, id: 'PORTAL_DIAG_1' },
      { r1: 1, c1: 17, r2: 19, c2: 1, id: 'PORTAL_DIAG_2' }
    ],
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 6, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 6, 1], // 1 (Portais nos cantos: col 1 e col 17)
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1], // 2
      [1, 2, 1, 1, 2, 1, 3, 1, 2, 1, 2, 1, 3, 1, 2, 1, 1, 2, 1], // 3 (Pílulas de poder internas)
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 4
      [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1], // 5
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1], // 6
      [1, 1, 1, 1, 2, 1, 1, 1, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1, 1], // 7
      [9, 9, 9, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 9, 9, 9], // 8
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 9
      [0, 0, 0, 0, 2, 0, 0, 1, 5, 5, 5, 1, 0, 0, 2, 0, 0, 0, 0], // 10 (Túnel lateral)
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 11
      [9, 9, 9, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 9, 9, 9], // 12
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 13
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 14
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1], // 15
      [1, 2, 2, 1, 2, 2, 3, 2, 2, 0, 2, 2, 3, 2, 2, 1, 2, 2, 1], // 16
      [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1], // 17
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1], // 18
      [1, 6, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 6, 1], // 19 (Portais nos cantos inferiores)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 20
    ]
  },

  // FASE 4: Fortaleza Cyber-Dourada (Âmbar/Ouro, Túneis em 2 níveis)
  {
    name: 'Fortaleza Dourada',
    wallColor: '#ffb703',
    glowColor: 'rgba(255, 183, 3, 0.55)',
    bgColor: '#140c01',
    innerWall: '#2b1b04',
    ghostSpeed: 2.2,
    pacmanSpeed: 2.3,
    frightenedDuration: 5.0,
    ghostReleases: [0, 0.8, 2.2, 4.0],
    fruit: { icon: '🍎', name: 'Maçã', points: 700 },
    feature: { icon: '🏰', name: 'Fortaleza Cyber', desc: 'Corredores expressos e labirinto tático em dois níveis' },
    tunnels: [
      { row: 6,  leftCol: 0, rightCol: 18 },
      { row: 14, leftCol: 0, rightCol: 18 }
    ],
    portals: [],
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 3, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 3, 1], // 1
      [1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1], // 2
      [1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1], // 3
      [1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1], // 4
      [1, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 1], // 5
      [0, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 1, 1, 2, 0], // 6 (Túnel Superior)
      [1, 2, 1, 1, 2, 1, 1, 1, 0, 0, 0, 1, 1, 1, 2, 1, 1, 2, 1], // 7
      [9, 9, 9, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 9, 9, 9], // 8
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 9
      [1, 1, 1, 1, 2, 0, 0, 1, 5, 5, 5, 1, 0, 0, 2, 1, 1, 1, 1], // 10
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 11
      [9, 9, 9, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 9, 9, 9], // 12
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 13
      [0, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 0], // 14 (Túnel Inferior)
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1], // 15
      [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1], // 16
      [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1], // 17
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1], // 18
      [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1], // 19
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 20
    ]
  },

  // FASE 5: Dimensão Quântica (Roxo Cyber com Portais e Alta Velocidade!)
  {
    name: 'Dimensão Quântica',
    wallColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    bgColor: '#0c0217',
    innerWall: '#200738',
    ghostSpeed: 2.5,
    pacmanSpeed: 2.4,
    frightenedDuration: 4.0,
    ghostReleases: [0, 0.5, 1.5, 2.5],
    fruit: { icon: '🔑', name: 'Chave Mestre', points: 1000 },
    feature: { icon: '⚡', name: 'Dimensão Quântica', desc: 'Portais nos cantos + Túneis com velocidade máxima!' },
    tunnels: [{ row: 10, leftCol: 0, rightCol: 18 }],
    portals: [
      { r1: 1, c1: 1, r2: 19, c2: 17, id: 'PORTAL_Q1' },
      { r1: 1, c1: 17, r2: 19, c2: 1, id: 'PORTAL_Q2' }
    ],
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 6, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 6, 1], // 1 (Portais nos cantos)
      [1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1], // 2
      [1, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 1], // 3
      [1, 2, 2, 2, 2, 1, 2, 1, 1, 3, 1, 1, 2, 1, 2, 2, 2, 2, 1], // 4
      [1, 2, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 2, 1], // 5
      [1, 2, 2, 2, 2, 1, 2, 1, 1, 0, 1, 1, 2, 1, 2, 2, 2, 2, 1], // 6
      [1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1], // 7
      [9, 9, 9, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 9, 9, 9], // 8
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 9
      [0, 0, 0, 0, 2, 0, 0, 1, 5, 5, 5, 1, 0, 0, 2, 0, 0, 0, 0], // 10 (Túnel lateral)
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 11
      [9, 9, 9, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 9, 9, 9], // 12
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // 13
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 14
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1], // 15
      [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1], // 16
      [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1], // 17
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1], // 18
      [1, 6, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 6, 1], // 19 (Portais nos cantos)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 20
    ]
  }
];

// --- EFEITOS SONOROS (WEB AUDIO API) ---
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lastWakaTime = 0;
    this.wakaFreq = 420;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playWaka() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastWakaTime < 0.11) return;
    this.lastWakaTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      this.wakaFreq = (this.wakaFreq === 420) ? 620 : 420;
      osc.frequency.setValueAtTime(this.wakaFreq, now);
      osc.frequency.exponentialRampToValueAtTime(this.wakaFreq * 0.7, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playPowerPellet() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(820, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playEatGhost() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [350, 520, 720, 960].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = f;
        const t = now + i * 0.05;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.07);
      });
    } catch (e) {}
  }

  playEatFruit() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        const t = now + i * 0.06;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch (e) {}
  }

  playTeleport() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playDeath() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.7);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {}
  }

  playVictory() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [261.6, 329.6, 392.0, 523.3, 659.3, 784.0, 1046.5];
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        const t = now + idx * 0.11;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch (e) {}
  }

  playBigChomp() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playBonusCoin() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.05);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playGameStart() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [493.88, 987.77, 739.99, 622.25, 987.77, 739.99, 622.25];
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        const t = now + idx * 0.08;
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.11);
      });
    } catch (e) {}
  }
}

// --- CLASSE PAC-MAN ---
class Pacman {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.x = 9 * TILE_SIZE + TILE_SIZE / 2;
    this.y = 16 * TILE_SIZE + TILE_SIZE / 2;
    this.dir = DIRS.LEFT;
    this.nextDir = DIRS.LEFT;
    this.speed = this.game.currentPhaseConfig.pacmanSpeed;
    this.radius = TILE_SIZE * 0.44;
    this.mouthAngle = 0.2;
    this.mouthSpeed = 0.025;
    this.mouthOpening = true;
    this.isDying = false;
    this.deathTimer = 0;
    this.teleportCooldown = 0;
    this.isMoving = false;
  }

  setDirection(newDir) {
    if (!newDir) return;
    // Inversão instantânea em qualquer lugar do corredor
    if (this.dir && this.dir.x === -newDir.x && this.dir.y === -newDir.y) {
      this.dir = newDir;
      this.nextDir = null;
      return;
    }
    this.nextDir = newDir;
  }

  isTileWalkable(col, row) {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true; // Túnel lateral
    const tile = this.game.map[row][col];
    return tile !== 1 && tile !== 9 && tile !== 4 && tile !== 5;
  }

  update(delta) {
    if (this.isDying) {
      this.deathTimer += 0.04;
      return;
    }

    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= delta;
    }

    // Túnel Lateral Wrap-around
    if (this.x < -TILE_SIZE / 2) {
      this.x = COLS * TILE_SIZE + TILE_SIZE / 2 - 1;
    } else if (this.x > COLS * TILE_SIZE + TILE_SIZE / 2) {
      this.x = -TILE_SIZE / 2 + 1;
    }

    // Túnel Vertical Wrap-around
    if (this.y < -TILE_SIZE / 2) {
      this.y = ROWS * TILE_SIZE + TILE_SIZE / 2 - 1;
    } else if (this.y > ROWS * TILE_SIZE + TILE_SIZE / 2) {
      this.y = -TILE_SIZE / 2 + 1;
    }

    const tileX = Math.floor(this.x / TILE_SIZE);
    const tileY = Math.floor(this.y / TILE_SIZE);
    const centerX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = tileY * TILE_SIZE + TILE_SIZE / 2;

    // Verificar se o jogador pediu para virar (nextDir)
    if (this.nextDir) {
      if (this.dir && this.nextDir.x === -this.dir.x && this.nextDir.y === -this.dir.y) {
        this.dir = this.nextDir;
        this.nextDir = null;
      } else if (this.nextDir !== this.dir) {
        const targetTileX = tileX + this.nextDir.x;
        const targetTileY = tileY + this.nextDir.y;

        if (this.isTileWalkable(targetTileX, targetTileY)) {
          // Virando para UP/DOWN: centraliza no eixo X
          if (this.nextDir.y !== 0 && Math.abs(this.x - centerX) <= 9) {
            this.x = centerX;
            this.dir = this.nextDir;
            this.nextDir = null;
          }
          // Virando para LEFT/RIGHT: centraliza no eixo Y
          else if (this.nextDir.x !== 0 && Math.abs(this.y - centerY) <= 9) {
            this.y = centerY;
            this.dir = this.nextDir;
            this.nextDir = null;
          }
        }
      }
    }

    // Movimentação com travamento na linha de centro e colisão perfeita
    const startX = this.x;
    const startY = this.y;

    if (this.dir) {
      if (this.dir.x === 1) { // DIREITA
        const canGoRight = this.isTileWalkable(tileX + 1, tileY);
        if (!canGoRight) {
          if (this.x < centerX) {
            this.x = Math.min(centerX, this.x + this.speed);
          } else {
            this.x = centerX;
          }
        } else {
          this.x += this.speed;
        }
        this.y = centerY;
      } else if (this.dir.x === -1) { // ESQUERDA
        const canGoLeft = this.isTileWalkable(tileX - 1, tileY);
        if (!canGoLeft) {
          if (this.x > centerX) {
            this.x = Math.max(centerX, this.x - this.speed);
          } else {
            this.x = centerX;
          }
        } else {
          this.x -= this.speed;
        }
        this.y = centerY;
      } else if (this.dir.y === 1) { // BAIXO
        const canGoDown = this.isTileWalkable(tileX, tileY + 1);
        if (!canGoDown) {
          if (this.y < centerY) {
            this.y = Math.min(centerY, this.y + this.speed);
          } else {
            this.y = centerY;
          }
        } else {
          this.y += this.speed;
        }
        this.x = centerX;
      } else if (this.dir.y === -1) { // CIMA
        const canGoUp = this.isTileWalkable(tileX, tileY - 1);
        if (!canGoUp) {
          if (this.y > centerY) {
            this.y = Math.max(centerY, this.y - this.speed);
          } else {
            this.y = centerY;
          }
        } else {
          this.y -= this.speed;
        }
        this.x = centerX;
      }
    }

    this.isMoving = (this.x !== startX || this.y !== startY);

    // Animação da boca apenas ao se mover
    if (this.isMoving) {
      if (this.mouthOpening) {
        this.mouthAngle += this.mouthSpeed;
        if (this.mouthAngle >= 0.28) this.mouthOpening = false;
      } else {
        this.mouthAngle -= this.mouthSpeed;
        if (this.mouthAngle <= 0.02) this.mouthOpening = true;
      }
    }

    // Teletransporte por portal e coleta de pílulas
    const currentCol = Math.floor(this.x / TILE_SIZE);
    const currentRow = Math.floor(this.y / TILE_SIZE);

    if (currentCol >= 0 && currentCol < COLS && currentRow >= 0 && currentRow < ROWS) {
      if (this.game.map[currentRow][currentCol] === 6 && this.teleportCooldown <= 0) {
        this.game.handlePortalTeleport(this);
      }

      this.eatPellets(currentCol, currentRow);
      this.checkFruitCollision();
    }
  }

  canMove(dir) {
    if (!dir) return false;
    const tileX = Math.floor(this.x / TILE_SIZE);
    const tileY = Math.floor(this.y / TILE_SIZE);
    return this.isTileWalkable(tileX + dir.x, tileY + dir.y);
  }

  canTurn(tileX, tileY, dir) {
    return this.isTileWalkable(tileX + dir.x, tileY + dir.y);
  }

  eatPellets(col, row) {
    const tile = this.game.map[row][col];
    if (tile === 2) {
      this.game.map[row][col] = 0;
      this.game.addScore(10);
      this.game.sound.playWaka();
      this.game.totalDots--;
      this.game.onDotEaten();
      this.game.checkVictory();
    } else if (tile === 3) {
      this.game.map[row][col] = 0;
      this.game.addScore(50);
      this.game.sound.playPowerPellet();
      this.game.totalDots--;
      this.game.onDotEaten();
      this.game.frightenGhosts();
      this.game.checkVictory();
    }
  }

  checkFruitCollision() {
    if (!this.game.fruitActive) return;
    const dist = Math.hypot(this.x - this.game.fruitX, this.y - this.game.fruitY);
    if (dist < TILE_SIZE * 0.8) {
      this.game.eatFruit();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isDying) {
      const angle = Math.min(Math.PI, this.deathTimer * Math.PI);
      ctx.fillStyle = '#FFE600';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, angle, Math.PI * 2 - angle);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.rotate(this.dir ? this.dir.angle : 0);

    // Corpo Amarelo
    ctx.fillStyle = '#FFE600';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, this.mouthAngle * Math.PI, (2 - this.mouthAngle) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Olho
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.radius * 0.15, -this.radius * 0.55, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// --- CLASSE FANTASMA (IA BLINDADA CONTRA TRAVAMENTOS) ---
class Ghost {
  constructor(game, name, color, startCol, startRow, targetCorner, releaseTime) {
    this.game = game;
    this.name = name;
    this.baseColor = color;
    this.startCol = startCol;
    this.startRow = startRow;
    this.targetCorner = targetCorner;
    this.releaseTime = releaseTime;
    this.reset();
  }

  reset() {
    this.x = this.startCol * TILE_SIZE + TILE_SIZE / 2;
    this.y = this.startRow * TILE_SIZE + TILE_SIZE / 2;
    this.dir = DIRS.UP;
    this.state = (this.name === 'Blinky') ? 'CHASE' : 'IN_HOUSE';
    this.speed = this.game.currentPhaseConfig.ghostSpeed;
    this.radius = TILE_SIZE * 0.44;
    this.frightenedTimer = 0;
    this.timer = 0;
    this.skirtFrame = 0;
    this.teleportCooldown = 0;
    this.lastTurnTileX = this.startCol;
    this.lastTurnTileY = this.startRow;

    // Blinky inicia diretamente no corredor de saída
    if (this.name === 'Blinky') {
      this.x = 9 * TILE_SIZE + TILE_SIZE / 2;
      this.y = 8 * TILE_SIZE + TILE_SIZE / 2;
      this.dir = DIRS.LEFT;
      this.lastTurnTileX = 9;
      this.lastTurnTileY = 8;
    }
  }

  update(delta) {
    this.timer += delta;
    this.skirtFrame += 0.16;

    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= delta;
    }

    // Saída controlada da casa dos fantasmas
    if (this.state === 'IN_HOUSE') {
      if (this.timer >= this.releaseTime) {
        this.state = 'EXITING';
      } else {
        this.y += Math.sin(this.timer * 4) * 0.35;
        return;
      }
    }

    if (this.state === 'EXITING') {
      const doorX = 9 * TILE_SIZE + TILE_SIZE / 2;
      const exitY = 8 * TILE_SIZE + TILE_SIZE / 2; // Corredor aberto (Row 8)

      if (Math.abs(this.x - doorX) > 1) {
        this.x += Math.sign(doorX - this.x) * 2.8;
      } else {
        this.x = doorX;
        this.y -= 2.8;
        if (this.y <= exitY) {
          this.y = exitY;
          this.state = 'CHASE';
          this.dir = (Math.random() < 0.5) ? DIRS.LEFT : DIRS.RIGHT;
          this.lastTurnTileX = 9;
          this.lastTurnTileY = 8;
        }
      }
      return;
    }

    // Modo Assustado
    if (this.state === 'FRIGHTENED') {
      this.frightenedTimer -= delta;
      if (this.frightenedTimer <= 0) {
        this.state = 'CHASE';
      }
    }

    // Velocidade atual baseada no estado e na fase
    let curSpeed = this.speed;
    if (this.state === 'FRIGHTENED') curSpeed = this.speed * 0.6;
    if (this.state === 'EATEN') curSpeed = this.speed * 1.8;

    // Túnel horizontal (teletransporte lateral)
    if (this.x < -TILE_SIZE / 2) {
      this.x = COLS * TILE_SIZE + TILE_SIZE / 2 - 1;
    } else if (this.x > COLS * TILE_SIZE + TILE_SIZE / 2) {
      this.x = -TILE_SIZE / 2 + 1;
    }

    // Túnel vertical (se houver)
    if (this.y < -TILE_SIZE / 2) {
      this.y = ROWS * TILE_SIZE + TILE_SIZE / 2 - 1;
    } else if (this.y > ROWS * TILE_SIZE + TILE_SIZE / 2) {
      this.y = -TILE_SIZE / 2 + 1;
    }

    const prevX = this.x;
    const prevY = this.y;

    this.x += this.dir.x * curSpeed;
    this.y += this.dir.y * curSpeed;

    const tileX = Math.floor(this.x / TILE_SIZE);
    const tileY = Math.floor(this.y / TILE_SIZE);

    if (tileX < 0 || tileX >= COLS || tileY < 0 || tileY >= ROWS) {
      return; // Atravessando o túnel
    }

    // Portal de teletransporte nos cantos
    if (this.game.map[tileY][tileX] === 6 && this.teleportCooldown <= 0) {
      this.game.handlePortalTeleport(this);
    }

    const centerX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = tileY * TILE_SIZE + TILE_SIZE / 2;

    // Detecta cruzamento pelo centro do ladrilho (somente 1 decisão por ladrilho)
    const crossedX = (prevX - centerX) * (this.x - centerX) <= 0;
    const crossedY = (prevY - centerY) * (this.y - centerY) <= 0;
    const atCenter = (this.dir.x !== 0 && crossedX) || (this.dir.y !== 0 && crossedY);

    if (atCenter && (tileX !== this.lastTurnTileX || tileY !== this.lastTurnTileY)) {
      this.x = centerX;
      this.y = centerY;
      this.lastTurnTileX = tileX;
      this.lastTurnTileY = tileY;

      // Olhos voltando para a casa ao serem devorados
      if (this.state === 'EATEN') {
        if (tileX === 9 && (tileY === 8 || tileY === 9 || tileY === 10)) {
          this.state = 'CHASE';
          this.dir = DIRS.UP;
          return;
        }
      }

      this.chooseNextDirection(tileX, tileY);
    }
  }

  chooseNextDirection(tileX, tileY) {
    const possibleDirs = [DIRS.UP, DIRS.LEFT, DIRS.DOWN, DIRS.RIGHT];
    const walkableDirs = [];

    for (const d of possibleDirs) {
      const nextCol = tileX + d.x;
      const nextRow = tileY + d.y;

      if (nextCol < 0 || nextCol >= COLS || nextRow < 0 || nextRow >= ROWS) {
        walkableDirs.push(d); // Túnel aberto
        continue;
      }

      const tile = this.game.map[nextRow][nextCol];
      if (tile === 1 || tile === 9) continue; // Paredes e void

      if (tile === 4 || tile === 5) {
        if (this.state !== 'EATEN') continue; // Porta apenas para olhos mortos
      }

      walkableDirs.push(d);
    }

    if (walkableDirs.length === 0) {
      // Beco sem saída: reverter
      this.dir = { x: -this.dir.x, y: -this.dir.y, angle: 0 };
      return;
    }

    // Regra Arcade: fantasmas não dão meia-volta se houver qualquer curva/avanço aberto
    const nonReverseDirs = walkableDirs.filter(d => !(d.x === -this.dir.x && d.y === -this.dir.y));
    const candidateDirs = (nonReverseDirs.length > 0) ? nonReverseDirs : walkableDirs;

    if (this.state === 'FRIGHTENED') {
      this.dir = candidateDirs[Math.floor(Math.random() * candidateDirs.length)];
      return;
    }

    const target = this.getTargetTile(tileX, tileY);
    let bestDir = candidateDirs[0];
    let bestDist = Infinity;

    for (const d of candidateDirs) {
      const nextX = tileX + d.x;
      const nextY = tileY + d.y;
      const dist = (nextX - target.x) ** 2 + (nextY - target.y) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = d;
      }
    }

    this.dir = bestDir;
  }

  getTargetTile(tileX, tileY) {
    if (this.state === 'EATEN') {
      return { x: 9, y: 9 };
    }

    const pac = this.game.pacman;
    const pacTileX = Math.floor(pac.x / TILE_SIZE);
    const pacTileY = Math.floor(pac.y / TILE_SIZE);

    switch (this.name) {
      case 'Blinky':
        return { x: pacTileX, y: pacTileY };

      case 'Pinky':
        return {
          x: pacTileX + pac.dir.x * 4,
          y: pacTileY + pac.dir.y * 4
        };

      case 'Inky':
        return {
          x: pacTileX + pac.dir.x * 2,
          y: pacTileY + pac.dir.y * 2
        };

      case 'Clyde':
        if (Math.hypot(tileX - pacTileX, tileY - pacTileY) > 7) {
          return { x: pacTileX, y: pacTileY };
        } else {
          return this.targetCorner;
        }

      default:
        return { x: pacTileX, y: pacTileY };
    }
  }

  frighten() {
    if (this.state === 'EATEN' || this.state === 'IN_HOUSE') return;
    this.state = 'FRIGHTENED';
    this.frightenedTimer = this.game.currentPhaseConfig.frightenedDuration;
    this.dir = { x: -this.dir.x, y: -this.dir.y, angle: 0 };
    this.lastTurnTileX = -1;
    this.lastTurnTileY = -1;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const r = this.radius;

    if (this.state === 'EATEN') {
      this.drawEyes(ctx, r);
      ctx.restore();
      return;
    }

    let bodyColor = this.baseColor;
    if (this.state === 'FRIGHTENED') {
      if (this.frightenedTimer < 2.0 && Math.floor(this.frightenedTimer * 5) % 2 === 0) {
        bodyColor = '#FFFFFF';
      } else {
        bodyColor = '#1d4ed8';
      }
    }

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r, Math.PI, 0, false);
    ctx.lineTo(r, r * 0.9);

    const wave = Math.sin(this.skirtFrame) * 2;
    ctx.lineTo(r * 0.66, r * 0.6 + wave);
    ctx.lineTo(r * 0.33, r * 0.9);
    ctx.lineTo(0, r * 0.6 - wave);
    ctx.lineTo(-r * 0.33, r * 0.9);
    ctx.lineTo(-r * 0.66, r * 0.6 + wave);
    ctx.lineTo(-r, r * 0.9);
    ctx.closePath();
    ctx.fill();

    if (this.state === 'FRIGHTENED') {
      ctx.fillStyle = (bodyColor === '#FFFFFF') ? '#d90429' : '#ffb8b8';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.2, 2, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.2, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, r * 0.3);
      ctx.lineTo(-r * 0.2, r * 0.15);
      ctx.lineTo(0, r * 0.3);
      ctx.lineTo(r * 0.2, r * 0.15);
      ctx.lineTo(r * 0.45, r * 0.3);
      ctx.stroke();
    } else {
      this.drawEyes(ctx, r);
    }

    ctx.restore();
  }

  drawEyes(ctx, r) {
    const ox = this.dir.x * 2.5;
    const oy = this.dir.y * 2.5;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35 + ox * 0.5, -r * 0.2 + oy * 0.5, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.35 + ox * 0.5, -r * 0.2 + oy * 0.5, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0022cc';
    ctx.beginPath();
    ctx.arc(-r * 0.35 + ox, -r * 0.2 + oy, 2, 0, Math.PI * 2);
    ctx.arc(r * 0.35 + ox, -r * 0.2 + oy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- CLASSE PRINCIPAL DO JOGO ---
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasContainer = document.getElementById('canvasContainer');
    this.arcadeCabinet = document.getElementById('arcadeCabinet');

    this.scoreElement = document.getElementById('score');
    this.highScoreElement = document.getElementById('high-score');
    this.levelBadge = document.getElementById('levelBadge');
    this.fruitDisplay = document.getElementById('fruitDisplay');
    this.overlay = document.getElementById('gameOverlay');
    this.overlayTitle = document.getElementById('overlayTitle');
    this.overlaySubtitle = document.getElementById('overlaySubtitle');
    this.btnAction = document.getElementById('btnAction');
    this.btnPause = document.getElementById('btnPause');
    this.btnRestart = document.getElementById('btnRestart');
    this.btnSound = document.getElementById('btnSound');
    this.btnFullscreen = document.getElementById('btnFullscreen');
    this.livesContainer = document.getElementById('livesIcons');

    // Elementos de Briefing e Modais
    this.standardModal = document.getElementById('standardModal');
    this.pauseModal = document.getElementById('pauseModal');
    this.briefingModal = document.getElementById('briefingModal');
    this.briefingLevel = document.getElementById('briefingLevel');
    this.briefingTitle = document.getElementById('briefingTitle');
    this.briefingFeatureIcon = document.getElementById('briefingFeatureIcon');
    this.briefingFeatureText = document.getElementById('briefingFeatureText');
    this.briefingFruitIcon = document.getElementById('briefingFruitIcon');
    this.briefingFruitText = document.getElementById('briefingFruitText');
    this.briefingSpeedText = document.getElementById('briefingSpeedText');
    this.briefingBonusPts = document.getElementById('briefingBonusPts');
    this.btnStartPhase = document.getElementById('btnStartPhase');

    this.sound = new SoundController();
    this.highScore = parseInt(localStorage.getItem('pacman_high_score') || '0', 10);
    this.highScoreElement.textContent = this.highScore;

    this.currentPhaseIndex = 0;
    this.floatingScores = [];
    this.warpParticles = [];
    this.stageClearTimer = 0;
    this.intermission = null;

    this.fruitActive = false;
    this.fruitTimer = 0;
    this.fruitX = 9 * TILE_SIZE + TILE_SIZE / 2;
    this.fruitY = 12 * TILE_SIZE + TILE_SIZE / 2;
    this.dotsEatenThisLevel = 0;
    this.fruitSpawnedCount = 0;

    this.initGameSession();
    this.setupEventListeners();

    this.lastFrameTime = performance.now();
    this.gameState = 'READY';
    this.ghostsEatenCombo = 0;

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  get currentPhaseConfig() {
    return PHASES[this.currentPhaseIndex];
  }

  initGameSession() {
    this.score = 0;
    this.lives = 3;
    this.currentPhaseIndex = 0;
    this.scoreElement.textContent = this.score;
    this.updateLivesDisplay();
    this.loadPhase(this.currentPhaseIndex);
  }

  loadPhase(index) {
    this.currentPhaseIndex = index;
    const config = this.currentPhaseConfig;

    // Atualizar UI
    this.levelBadge.textContent = `FASE ${index + 1}/5: ${config.name.toUpperCase()}`;
    this.levelBadge.style.borderColor = config.wallColor;
    this.levelBadge.style.color = config.wallColor;
    this.canvasContainer.style.borderColor = config.wallColor;
    this.canvasContainer.style.boxShadow = `0 0 25px ${config.glowColor}`;
    this.canvas.style.borderColor = config.wallColor;
    this.canvas.style.boxShadow = `0 0 30px ${config.glowColor}`;
    this.fruitDisplay.textContent = config.fruit.icon;
    this.fruitDisplay.title = `${config.fruit.name} (+${config.fruit.points} pts)`;

    // Carregar mapa
    this.map = config.map.map(row => [...row]);
    this.totalDots = 0;
    this.initialTotalDots = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.map[r][c] === 2 || this.map[r][c] === 3) {
          this.totalDots++;
          this.initialTotalDots++;
        }
      }
    }

    this.dotsEatenThisLevel = 0;
    this.fruitSpawnedCount = 0;
    this.fruitActive = false;

    this.pacman = new Pacman(this);
    this.initGhosts();
  }

  initGhosts() {
    const releases = this.currentPhaseConfig.ghostReleases || [0, 2.5, 6.0, 10.0];
    this.ghosts = [
      new Ghost(this, 'Blinky', '#FF0000', 9, 8, { x: 18, y: 0 }, releases[0]),
      new Ghost(this, 'Pinky',  '#FFB8FF', 9, 10, { x: 0, y: 0 }, releases[1]),
      new Ghost(this, 'Inky',   '#00FFFF', 8, 10, { x: 18, y: 20 }, releases[2]),
      new Ghost(this, 'Clyde',  '#FFB852', 10, 10, { x: 0, y: 20 }, releases[3])
    ];
  }

  resetPositions() {
    this.pacman.reset();
    this.initGhosts();
  }

  addScore(pts) {
    this.score += pts;
    this.scoreElement.textContent = this.score;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreElement.textContent = this.highScore;
      localStorage.setItem('pacman_high_score', this.highScore.toString());
    }
  }

  updateLivesDisplay() {
    this.livesContainer.innerHTML = '';
    for (let i = 0; i < this.lives; i++) {
      const icon = document.createElement('div');
      icon.className = 'life-icon';
      this.livesContainer.appendChild(icon);
    }
  }

  onDotEaten() {
    this.dotsEatenThisLevel++;
    // Gera fruta aos 30% e 70% das pílulas comidas
    const threshold1 = Math.floor(this.initialTotalDots * 0.3);
    const threshold2 = Math.floor(this.initialTotalDots * 0.7);

    if ((this.dotsEatenThisLevel === threshold1 || this.dotsEatenThisLevel === threshold2) && !this.fruitActive) {
      this.spawnFruit();
    }
  }

  spawnFruit() {
    this.fruitActive = true;
    this.fruitTimer = 11.0; // Fica na tela por 11s
    this.fruitSpawnedCount++;
  }

  eatFruit() {
    if (!this.fruitActive) return;
    this.fruitActive = false;
    const pts = this.currentPhaseConfig.fruit.points;
    this.addScore(pts);
    this.sound.playEatFruit();
    this.floatingScores.push({
      text: `+${pts}`,
      x: this.fruitX,
      y: this.fruitY,
      life: 1.2
    });
  }

  handlePortalTeleport(entity) {
    const config = this.currentPhaseConfig;
    if (!config.portals || config.portals.length === 0) return;

    const tileX = Math.floor(entity.x / TILE_SIZE);
    const tileY = Math.floor(entity.y / TILE_SIZE);

    for (const p of config.portals) {
      if (tileY === p.r1 && tileX === p.c1) {
        entity.x = p.c2 * TILE_SIZE + TILE_SIZE / 2;
        entity.y = p.r2 * TILE_SIZE + TILE_SIZE / 2;
        entity.teleportCooldown = 0.9;
        this.sound.playTeleport();
        this.spawnWarpEffect(entity.x, entity.y);
        return;
      } else if (tileY === p.r2 && tileX === p.c2) {
        entity.x = p.c1 * TILE_SIZE + TILE_SIZE / 2;
        entity.y = p.r1 * TILE_SIZE + TILE_SIZE / 2;
        entity.teleportCooldown = 0.9;
        this.sound.playTeleport();
        this.spawnWarpEffect(entity.x, entity.y);
        return;
      }
    }
  }

  spawnWarpEffect(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 / 14) * i;
      this.warpParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * (1.5 + Math.random() * 2),
        vy: Math.sin(angle) * (1.5 + Math.random() * 2),
        color: this.currentPhaseConfig.wallColor,
        life: 0.6
      });
    }
  }

  frightenGhosts() {
    this.ghostsEatenCombo = 0;
    this.ghosts.forEach(g => g.frighten());
  }

  checkVictory() {
    if (this.totalDots <= 0) {
      if (this.currentPhaseIndex < PHASES.length - 1) {
        // Vitória da Fase -> Iniciar Transição Animada e Divertida
        this.gameState = 'STAGE_CLEAR';
        this.sound.playVictory();
        this.stageClearTimer = 1.0;
      } else {
        // Vitória Absoluta (todas as 5 fases)
        this.gameState = 'VICTORY';
        this.sound.playVictory();
        this.showStandardOverlay(
          'CAMPEÃO DO ARCADE!',
          `Incrível! Você conquistou todas as 5 fases! Pontuação Final: ${this.score}`,
          'JOGAR DE NOVO'
        );
      }
    }
  }

  startIntermission() {
    this.gameState = 'INTERMISSION';
    this.hideOverlay();
    const cutscenePhase = this.currentPhaseIndex + 1;

    this.intermission = {
      phase: cutscenePhase,
      time: 0,
      duration: 4.8,
      bonusPoints: 0,
      pelletEaten: false,
      confetti: [],
      pacman: {
        x: -30,
        y: 220,
        radius: 13,
        mouth: 0.2,
        mouthSpeed: 0.05,
        isMega: false,
        dir: 1
      },
      ghosts: [
        {
          name: 'Blinky',
          baseColor: '#FF0000',
          x: -75,
          y: 220,
          dir: 1,
          isFrightened: false
        }
      ],
      particles: []
    };

    if (cutscenePhase === 2) {
      // Fase 2 -> 3: Pinky e Inky com morango
      this.intermission.ghosts = [
        { name: 'Pinky', baseColor: '#FFB8FF', x: -50, y: 220, dir: 1, isFrightened: false },
        { name: 'Inky', baseColor: '#00FFFF', x: -90, y: 220, dir: 1, isFrightened: false }
      ];
      this.intermission.strawberry = { x: -70, y: 220, eaten: false };
    } else if (cutscenePhase === 3) {
      // Fase 3 -> 4: Todos os 4 fantasmas
      this.intermission.ghosts = [
        { name: 'Blinky', baseColor: '#FF0000', x: 260, y: 220, dir: -1, isFrightened: false },
        { name: 'Pinky', baseColor: '#FFB8FF', x: 295, y: 220, dir: -1, isFrightened: false },
        { name: 'Inky', baseColor: '#00FFFF', x: 330, y: 220, dir: -1, isFrightened: false },
        { name: 'Clyde', baseColor: '#FFB852', x: 365, y: 220, dir: -1, isFrightened: false }
      ];
      this.intermission.pacman.x = -60;
    } else if (cutscenePhase === 4) {
      // Fase 4 -> 5: Modo Quântico
      this.intermission.pacman.x = 190;
      this.intermission.pacman.y = 230;
      this.intermission.quantumPower = 0;
      this.intermission.ghosts = [
        { name: 'Blinky', baseColor: '#FF0000', x: 60, y: 220, dir: 1, isFrightened: true },
        { name: 'Pinky', baseColor: '#FFB8FF', x: 100, y: 220, dir: 1, isFrightened: true },
        { name: 'Inky', baseColor: '#00FFFF', x: 280, y: 220, dir: -1, isFrightened: true },
        { name: 'Clyde', baseColor: '#FFB852', x: 320, y: 220, dir: -1, isFrightened: true }
      ];
    }
  }

  triggerIntermissionBonus(x, y) {
    if (!this.intermission) return;
    this.intermission.bonusPoints += 100;
    this.addScore(100);
    this.sound.playBonusCoin();

    this.floatingScores.push({
      text: '+100!',
      x: x || 190,
      y: (y || 210) - 10,
      life: 0.9
    });

    const colors = ['#facc15', '#38bdf8', '#f43f5e', '#a855f7', '#4ade80', '#ffffff'];
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      this.intermission.confetti.push({
        x: x || 190,
        y: y || 210,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3,
        life: 0.9
      });
    }
  }

  updateIntermission(delta) {
    if (!this.intermission) return;
    const it = this.intermission;
    it.time += delta;

    // Partículas de confete
    for (let i = it.confetti.length - 1; i >= 0; i--) {
      const p = it.confetti[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravidade
      p.life -= delta * 1.3;
      if (p.life <= 0) it.confetti.splice(i, 1);
    }

    // Animação da boca do Pac-Man
    it.pacman.mouth += it.pacman.mouthSpeed;
    if (it.pacman.mouth > 0.32 || it.pacman.mouth < 0.02) {
      it.pacman.mouthSpeed = -it.pacman.mouthSpeed;
    }

    if (it.phase === 1) { // Fase 1 -> 2: A Grande Caçada
      if (it.time < 1.7) {
        it.pacman.x += 165 * delta;
        it.ghosts[0].x = it.pacman.x - 45;
      } else if (it.time >= 1.7 && !it.pelletEaten) {
        if (it.pacman.x >= 235) {
          it.pelletEaten = true;
          this.sound.playBigChomp();
          it.pacman.isMega = true;
          it.ghosts[0].isFrightened = true;
          this.spawnWarpEffect(it.pacman.x, it.pacman.y);
        } else {
          it.pacman.x += 140 * delta;
          it.ghosts[0].x = it.pacman.x - 45;
        }
      } else {
        it.ghosts[0].dir = -1;
        it.ghosts[0].x -= 200 * delta;
        it.pacman.dir = -1;
        it.pacman.x -= 230 * delta;
        it.pacman.radius = Math.min(26, it.pacman.radius + delta * 24);
      }
    } else if (it.phase === 2) { // Fase 2 -> 3: O Roubo do Morango
      if (it.time < 1.8) {
        it.ghosts[0].x += 110 * delta;
        it.ghosts[1].x += 110 * delta;
        it.strawberry.x = (it.ghosts[0].x + it.ghosts[1].x) / 2;
      } else {
        if (!it.strawberry.eaten) {
          it.strawberry.eaten = true;
          this.sound.playBigChomp();
          this.sound.playEatFruit();
          this.spawnWarpEffect(190, 210);
        }
        it.pacman.x = 190;
        it.pacman.y = 200 + Math.sin(it.time * 6) * 10;
        it.ghosts.forEach(g => {
          g.isFrightened = true;
          g.x += Math.sin(it.time * 8) * 1.5;
        });
      }
    } else if (it.phase === 3) { // Fase 3 -> 4: Turbo Dourado
      if (it.time < 1.8) {
        it.ghosts.forEach(g => g.x -= 80 * delta);
      } else {
        it.pacman.x += 360 * delta;
        it.ghosts.forEach(g => {
          g.isFrightened = true;
          g.dir = 1;
          g.x += 160 * delta;
        });
      }
    } else if (it.phase === 4) { // Fase 4 -> 5: Modo Quântico
      it.quantumPower += delta * 2.5;
      it.pacman.y = 230 - Math.min(160, Math.pow(it.time, 2.2) * 18);
    }

    if (it.time >= it.duration) {
      this.showPhaseBriefing();
    }
  }

  renderIntermission() {
    const ctx = this.ctx;
    const it = this.intermission;
    if (!it) return;

    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Linha do palco neon
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.lineTo(this.canvas.width, 240);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 240);
      ctx.lineTo(x - 20, this.canvas.height);
      ctx.stroke();
    }

    // Banner Superior
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`★ FASE ${it.phase} COMPLETA! ★`, this.canvas.width / 2, 42);

    const blink = Math.sin(performance.now() * 0.008) > 0;
    ctx.fillStyle = blink ? '#38bdf8' : '#e0f2fe';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('CLIQUE OU ESPAÇO P/ BÔNUS! (+100)', this.canvas.width / 2, 70);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillText(`BÔNUS ACUMULADO: +${it.bonusPoints} PTS`, this.canvas.width / 2, 98);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('PULAR [P] >>', this.canvas.width - 12, 20);

    // Super Pílula se Fase 1
    if (it.phase === 1 && !it.pelletEaten) {
      const pulse = Math.sin(performance.now() * 0.015) * 2;
      ctx.fillStyle = '#ffdedb';
      ctx.beginPath();
      ctx.arc(240, 220, 9 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Morango se Fase 2
    if (it.phase === 2 && it.strawberry && !it.strawberry.eaten) {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🍓', it.strawberry.x, it.strawberry.y + 6);
    }

    // Fantasmas
    for (const g of it.ghosts) {
      this.drawCutsceneGhost(ctx, g);
    }

    // Pac-Man
    this.drawCutscenePacman(ctx, it.pacman);

    // Confetes
    for (const p of it.confetti) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Floating text
    ctx.fillStyle = '#00ffff';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (const fs of this.floatingScores) {
      ctx.globalAlpha = Math.max(0, fs.life);
      ctx.fillText(fs.text, fs.x, fs.y);
    }
    ctx.globalAlpha = 1.0;
  }

  drawCutscenePacman(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.dir === -1 ? Math.PI : 0);

    ctx.fillStyle = p.isMega ? '#fef08a' : '#FFE600';
    if (p.isMega) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 18;
    }

    ctx.beginPath();
    ctx.arc(0, 0, p.radius, p.mouth * Math.PI, (2 - p.mouth) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(p.radius * 0.15, -p.radius * 0.55, Math.max(2, p.radius * 0.12), 0, Math.PI * 2);
    ctx.fill();

    if (p.isMega) {
      ctx.font = '14px sans-serif';
      ctx.fillText('👑', -p.radius * 0.3, -p.radius * 0.9);
    }

    ctx.restore();
  }

  drawCutsceneGhost(ctx, g) {
    ctx.save();
    ctx.translate(g.x, g.y);
    const r = 12;

    const bodyColor = g.isFrightened ? '#1d4ed8' : g.baseColor;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r, Math.PI, 0, false);
    ctx.lineTo(r, r * 0.9);
    ctx.lineTo(r * 0.66, r * 0.6);
    ctx.lineTo(r * 0.33, r * 0.9);
    ctx.lineTo(0, r * 0.6);
    ctx.lineTo(-r * 0.33, r * 0.9);
    ctx.lineTo(-r * 0.66, r * 0.6);
    ctx.lineTo(-r, r * 0.9);
    ctx.closePath();
    ctx.fill();

    if (g.isFrightened) {
      ctx.fillStyle = '#ffb8b8';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.2, 2, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.2, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '10px sans-serif';
      ctx.fillText('💦', r * 0.5, -r * 0.8);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.2, 3, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0022cc';
      ctx.beginPath();
      const ox = (g.dir || 1) * 1.5;
      ctx.arc(-r * 0.35 + ox, -r * 0.2, 1.8, 0, Math.PI * 2);
      ctx.arc(r * 0.35 + ox, -r * 0.2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  showPhaseBriefing() {
    this.gameState = 'PHASE_PREVIEW';
    const nextIndex = this.currentPhaseIndex + 1;
    const nextConfig = PHASES[nextIndex];

    if (this.briefingLevel) this.briefingLevel.textContent = `★ FASE ${nextIndex + 1}/5 DESBLOQUEADA! ★`;
    if (this.briefingTitle) {
      this.briefingTitle.textContent = nextConfig.name.toUpperCase();
      this.briefingTitle.style.color = nextConfig.wallColor;
    }
    if (this.briefingModal) {
      this.briefingModal.style.borderColor = nextConfig.wallColor;
      this.briefingModal.style.boxShadow = `0 0 35px ${nextConfig.glowColor}`;
    }

    if (nextConfig.feature) {
      if (this.briefingFeatureIcon) this.briefingFeatureIcon.textContent = nextConfig.feature.icon;
      if (this.briefingFeatureText) this.briefingFeatureText.textContent = nextConfig.feature.name;
    }
    if (nextConfig.fruit) {
      if (this.briefingFruitIcon) this.briefingFruitIcon.textContent = nextConfig.fruit.icon;
      if (this.briefingFruitText) this.briefingFruitText.textContent = `${nextConfig.fruit.name} (+${nextConfig.fruit.points} pts)`;
    }

    const speedDiff = Math.round(((nextConfig.ghostSpeed - PHASES[0].ghostSpeed) / PHASES[0].ghostSpeed) * 100);
    if (this.briefingSpeedText) this.briefingSpeedText.textContent = speedDiff > 0 ? `+${speedDiff}% Mais Rápidos` : 'Normal';

    const bonus = (this.intermission ? this.intermission.bonusPoints : 0);
    if (this.briefingBonusPts) this.briefingBonusPts.textContent = `+${bonus} pts`;

    if (this.btnStartPhase) {
      this.btnStartPhase.textContent = `▶ ENTRAR NA FASE ${nextIndex + 1}`;
      this.btnStartPhase.style.background = nextConfig.wallColor;
    }

    if (this.standardModal) this.standardModal.classList.add('hidden');
    if (this.briefingModal) this.briefingModal.classList.remove('hidden');
    this.overlay.classList.remove('hidden');
  }

  handlePlayerDeath() {
    this.pacman.isDying = true;
    this.sound.playDeath();

    setTimeout(() => {
      this.lives--;
      this.updateLivesDisplay();

      if (this.lives <= 0) {
        this.gameState = 'GAMEOVER';
        this.showStandardOverlay('GAME OVER', `Fim de jogo! Pontuação final: ${this.score}`, 'TENTAR DE NOVO');
      } else {
        this.resetPositions();
      }
    }, 1000);
  }

  showStandardOverlay(title, subtitle, btnText) {
    if (this.overlayTitle) this.overlayTitle.textContent = title;
    if (this.overlaySubtitle) this.overlaySubtitle.textContent = subtitle;
    if (this.btnAction) this.btnAction.textContent = btnText;
    if (this.standardModal) this.standardModal.classList.remove('hidden');
    if (this.briefingModal) this.briefingModal.classList.add('hidden');
    if (this.pauseModal) this.pauseModal.classList.add('hidden');
    this.overlay.classList.remove('hidden');
  }

  showOverlay(title, subtitle, btnText) {
    this.showStandardOverlay(title, subtitle, btnText);
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
    if (this.pauseModal) this.pauseModal.classList.add('hidden');
  }

  toggleFullscreen() {
    const isFS = document.fullscreenElement ||
                 document.webkitFullscreenElement ||
                 this.arcadeCabinet.classList.contains('is-fullscreen');

    if (!isFS) {
      this.arcadeCabinet.classList.add('is-fullscreen');
      this.btnFullscreen.innerHTML = '<span class="btn-icon">🗗</span> SAIR (ESC)';

      const elem = this.arcadeCabinet;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      this.arcadeCabinet.classList.remove('is-fullscreen');
      this.btnFullscreen.innerHTML = '<span class="btn-icon">⛶</span> TELA CHEIA';

      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(() => {});
      }
    }
  }

  setupEventListeners() {
    // Teclado
    window.addEventListener('keydown', (e) => {
      this.sound.init();

      if (e.code === 'KeyF') {
        e.preventDefault();
        this.toggleFullscreen();
        return;
      }

      if (e.code === 'Escape' && this.arcadeCabinet.classList.contains('is-fullscreen')) {
        this.toggleFullscreen();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        // Espaço durante intermission dispara bônus (tap)
        if (this.gameState === 'INTERMISSION') {
          this.triggerIntermissionBonus(190, 210);
          return;
        }
        this.togglePause();
        return;
      }

      // Tecla P ou Enter durante intermission pula para o briefing
      if ((e.code === 'KeyP' || e.code === 'Enter') && this.gameState === 'INTERMISSION') {
        e.preventDefault();
        this.showPhaseBriefing();
        return;
      }

      if (this.gameState === 'READY') {
        this.startPlaying();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          this.pacman.setDirection(DIRS.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.pacman.setDirection(DIRS.DOWN);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.pacman.setDirection(DIRS.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.pacman.setDirection(DIRS.RIGHT);
          break;
      }
    });

    // Botões do overlay padrão (Iniciar / Game Over / Vitória)
    this.btnAction.addEventListener('click', () => {
      this.sound.init();
      if (this.gameState === 'GAMEOVER' || this.gameState === 'VICTORY') {
        this.initGameSession();
      } else if (this.gameState === 'NEXT_LEVEL') {
        this.loadPhase(this.currentPhaseIndex + 1);
      }
      this.startPlaying();
    });

    // Botão de entrar na próxima fase (após briefing)
    if (this.btnStartPhase) {
      this.btnStartPhase.addEventListener('click', () => {
        this.sound.init();
        this.loadPhase(this.currentPhaseIndex + 1);
        this.startPlaying();
      });
    }

    // Click/tap no canvas durante intermission = bônus
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.gameState === 'INTERMISSION') {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        this.triggerIntermissionBonus(cx, cy);
      }
    });

    // Botões de pausa (header)
    this.btnPause.addEventListener('click', () => this.togglePause());

    // Menu de pausa — 3 botões
    const btnContinue = document.getElementById('btnContinue');
    const btnRestartPause = document.getElementById('btnRestartPause');
    const btnExitToMenu = document.getElementById('btnExitToMenu');

    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        this.sound.init();
        this.startPlaying();
      });
    }
    if (btnRestartPause) {
      btnRestartPause.addEventListener('click', () => {
        this.sound.init();
        this.initGameSession();
        this.startPlaying();
      });
    }
    if (btnExitToMenu) {
      btnExitToMenu.addEventListener('click', () => {
        this.sound.init();
        this.initGameSession();
        this.gameState = 'READY';
        this.hidePauseModal();
        this.showStandardOverlay('PAC-MAN', 'Use as Setas ou W A S D para jogar', 'INICIAR JOGO');
      });
    }

    this.btnRestart.addEventListener('click', () => {
      this.sound.init();
      this.initGameSession();
      this.startPlaying();
    });

    this.btnSound.addEventListener('click', () => {
      this.sound.muted = !this.sound.muted;
      this.btnSound.textContent = this.sound.muted ? '🔇 MUDO' : '🔊 SOM';
    });

    this.btnFullscreen.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    const handleFSChange = () => {
      const isNativeFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (isNativeFS) {
        this.arcadeCabinet.classList.add('is-fullscreen');
        this.btnFullscreen.innerHTML = '<span class="btn-icon">🗗</span> SAIR (ESC)';
      } else if (!this.arcadeCabinet.classList.contains('is-fullscreen')) {
        this.btnFullscreen.innerHTML = '<span class="btn-icon">⛶</span> TELA CHEIA';
      }
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
  }

  startPlaying() {
    this.hideOverlay();
    this.hidePauseModal();
    this.gameState = 'PLAYING';
  }

  togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      this.showPauseModal();
    } else if (this.gameState === 'PAUSED') {
      this.startPlaying();
    }
  }

  showPauseModal() {
    if (this.pauseModal) this.pauseModal.classList.remove('hidden');
    if (this.standardModal) this.standardModal.classList.add('hidden');
    if (this.briefingModal) this.briefingModal.classList.add('hidden');
    this.overlay.classList.remove('hidden');
  }

  hidePauseModal() {
    if (this.pauseModal) this.pauseModal.classList.add('hidden');
  }

  gameLoop(timestamp) {
    const delta = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = timestamp;

    if (this.gameState === 'PLAYING') {
      this.update(delta);
    } else if (this.gameState === 'STAGE_CLEAR') {
      // Aguarda brevemente com flash antes de iniciar intermission
      this.stageClearTimer -= delta;
      if (this.stageClearTimer <= 0) {
        this.startIntermission();
      }
    } else if (this.gameState === 'INTERMISSION') {
      this.updateIntermission(delta);
    }

    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(delta) {
    this.pacman.update(delta);

    if (!this.pacman.isDying) {
      for (const ghost of this.ghosts) {
        ghost.update(delta);

        const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);
        if (dist < TILE_SIZE * 0.75) {
          if (ghost.state === 'FRIGHTENED') {
            ghost.state = 'EATEN';
            this.ghostsEatenCombo++;
            const pts = 200 * Math.pow(2, this.ghostsEatenCombo - 1);
            this.addScore(pts);
            this.sound.playEatGhost();
            this.floatingScores.push({
              text: `+${pts}`,
              x: ghost.x,
              y: ghost.y,
              life: 1.0
            });
          } else if (ghost.state === 'CHASE' || ghost.state === 'EXITING') {
            this.handlePlayerDeath();
            break;
          }
        }
      }
    }

    // Atualizar fruta ativa
    if (this.fruitActive) {
      this.fruitTimer -= delta;
      if (this.fruitTimer <= 0) {
        this.fruitActive = false;
      }
    }

    // Atualizar partículas de teletransporte
    for (let i = this.warpParticles.length - 1; i >= 0; i--) {
      const p = this.warpParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= delta * 2;
      if (p.life <= 0) this.warpParticles.splice(i, 1);
    }

    // Atualizar pontuações flutuantes
    for (let i = this.floatingScores.length - 1; i >= 0; i--) {
      const fs = this.floatingScores[i];
      fs.life -= delta * 1.5;
      fs.y -= 0.5;
      if (fs.life <= 0) this.floatingScores.splice(i, 1);
    }
  }

  render() {
    const config = this.currentPhaseConfig;

    // Renderização especial da intermission (cutscene)
    if (this.gameState === 'INTERMISSION') {
      this.renderIntermission();
      return;
    }

    // Flash de "FASE COMPLETA!" antes de entrar na intermission
    if (this.gameState === 'STAGE_CLEAR') {
      this.renderStageClearFlash();
      return;
    }

    // Fundo da fase
    this.ctx.fillStyle = config.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Labirinto
    this.drawMaze();

    // Fruta Bônus
    if (this.fruitActive) {
      this.drawFruit();
    }

    // Pacman e Fantasmas
    this.pacman.draw(this.ctx);
    for (const ghost of this.ghosts) {
      ghost.draw(this.ctx);
    }

    // Partículas de Warp
    for (const p of this.warpParticles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // Pontuações Flutuantes
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    for (const fs of this.floatingScores) {
      this.ctx.globalAlpha = Math.max(0, fs.life);
      this.ctx.fillText(fs.text, fs.x, fs.y);
    }
    this.ctx.globalAlpha = 1.0;
  }

  renderStageClearFlash() {
    const ctx = this.ctx;
    const config = this.currentPhaseConfig;

    // Desenha labirinto com flash pulsante
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMaze();

    // Overlay de flash branco pulsante
    const alpha = 0.3 + Math.abs(Math.sin(performance.now() * 0.015)) * 0.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Texto de vitória de fase
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FASE COMPLETA!', this.canvas.width / 2, this.canvas.height / 2 - 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('Preparando animação...', this.canvas.width / 2, this.canvas.height / 2 + 14);
  }

  drawMaze() {
    const ctx = this.ctx;
    const config = this.currentPhaseConfig;
    const now = performance.now();

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = this.map[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === 1) {
          // Parede Neon dinâmica por fase
          ctx.fillStyle = config.innerWall;
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          ctx.strokeStyle = config.wallColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

          // Efeito de brilho interno sutil
          ctx.strokeStyle = config.glowColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        } else if (tile === 2) {
          // Pílula comum
          ctx.fillStyle = '#ffdedb';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 3) {
          // Pílula de poder pulsante
          const pulse = Math.sin(now * 0.008) * 1.5;
          ctx.fillStyle = '#ffdedb';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 5.5 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (tile === 4) {
          // Porta da Casa dos Fantasmas
          ctx.fillStyle = '#ffb8ff';
          ctx.fillRect(x, y + TILE_SIZE / 2 - 2, TILE_SIZE, 4);
        } else if (tile === 6) {
          // Portal de Teletransporte nos Cantos (Vórtice animado)
          this.drawPortal(x + TILE_SIZE / 2, y + TILE_SIZE / 2, now);
        }
      }
    }

    // Desenhar indicadores visuais nos túneis laterais (para deixar o teletransporte evidente)
    if (config.tunnels) {
      for (const t of config.tunnels) {
        const ty = t.row * TILE_SIZE + TILE_SIZE / 2;
        const blink = Math.sin(now * 0.006) > 0 ? 0.9 : 0.4;
        ctx.fillStyle = config.wallColor;
        ctx.globalAlpha = blink;
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('◀', 6, ty + 3);
        ctx.fillText('▶', COLS * TILE_SIZE - 6, ty + 3);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  drawPortal(cx, cy, now) {
    const ctx = this.ctx;
    const spin = now * 0.005;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin);

    // Anel externo
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    // Vórtice interno
    ctx.fillStyle = '#ff00aa';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Raios do portal
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFruit() {
    const ctx = this.ctx;
    const icon = this.currentPhaseConfig.fruit.icon;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, this.fruitX, this.fruitY);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.pacmanGame = new Game();
});
