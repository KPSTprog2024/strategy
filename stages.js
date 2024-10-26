// ステージデータの定義
const stages = [
  // ステージ0: チュートリアル（既存のまま）
  {
    areas: [
      { id: 1, x: 200, y: 300, owner: 'player', virusCount: 10, growthRate: 1 },
      { id: 2, x: 400, y: 200, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 3, x: 400, y: 400, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 4, x: 600, y: 300, owner: 'neutral', virusCount: 5, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [2, 4],
      [1, 3],
      [3, 4],
    ],
  },
  // ステージ1〜4（既存のまま）
  // ...（ステージ1〜4の定義はそのまま）
  // ステージ1
  {
    areas: [
      { id: 1, x: 100, y: 300, owner: 'player', virusCount: 10, growthRate: 1 },
      { id: 2, x: 250, y: 150, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 3, x: 250, y: 450, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 4, x: 400, y: 300, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 5, x: 550, y: 150, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 6, x: 550, y: 450, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 7, x: 700, y: 300, owner: 'enemy', virusCount: 10, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [4, 5],
      [4, 6],
      [5, 7],
      [6, 7],
    ],
  },
  // ステージ2
  {
    areas: [
      { id: 1, x: 100, y: 100, owner: 'player', virusCount: 15, growthRate: 1 },
      { id: 2, x: 100, y: 500, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 3, x: 400, y: 100, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 4, x: 400, y: 300, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 5, x: 400, y: 500, owner: 'neutral', virusCount: 5, growthRate: 1 },
      { id: 6, x: 700, y: 100, owner: 'enemy', virusCount: 15, growthRate: 1 },
      { id: 7, x: 700, y: 500, owner: 'neutral', virusCount: 5, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 5],
      [3, 4],
      [4, 5],
      [4, 7],
      [5, 7],
      [3, 6],
      [6, 7],
    ],
  },
  // ステージ3
  {
    areas: [
      { id: 1, x: 400, y: 50, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 2, x: 250, y: 150, owner: 'player', virusCount: 20, growthRate: 1 },
      { id: 3, x: 550, y: 150, owner: 'enemy', virusCount: 20, growthRate: 1 },
      { id: 4, x: 400, y: 250, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 5, x: 250, y: 350, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 6, x: 550, y: 350, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 7, x: 400, y: 450, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 8, x: 400, y: 550, owner: 'neutral', virusCount: 5, growthRate: 2 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [4, 5],
      [4, 6],
      [5, 7],
      [6, 7],
      [7, 8],
    ],
  },
  // ステージ4
  {
    areas: [
      { id: 1, x: 150, y: 300, owner: 'player', virusCount: 20, growthRate: 1 },
      { id: 2, x: 300, y: 150, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 3, x: 300, y: 450, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 4, x: 450, y: 300, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 5, x: 600, y: 150, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 6, x: 600, y: 450, owner: 'neutral', virusCount: 5, growthRate: 2 },
      { id: 7, x: 750, y: 300, owner: 'enemy', virusCount: 25, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [4, 5],
      [4, 6],
      [5, 7],
      [6, 7],
    ],
  },
  // ステージ5
  {
    areas: [
      { id: 1, x: 100, y: 100, owner: 'player', virusCount: 25, growthRate: 1 },
      { id: 2, x: 100, y: 500, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 3, x: 400, y: 100, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 4, x: 250, y: 300, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 5, x: 550, y: 300, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 6, x: 400, y: 500, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 7, x: 700, y: 100, owner: 'enemy', virusCount: 30, growthRate: 1 },
      { id: 8, x: 700, y: 500, owner: 'enemy', virusCount: 30, growthRate: 1 },
    ],
    connections: [
      [1, 3],
      [1, 4],
      [2, 4],
      [2, 6],
      [3, 5],
      [4, 5],
      [5, 7],
      [6, 5],
      [6, 8],
      [7, 5],
      [8, 6],
    ],
  },
  // ステージ6
  {
    areas: [
      { id: 1, x: 400, y: 50, owner: 'player', virusCount: 15, growthRate: 1 },
      { id: 2, x: 200, y: 200, owner: 'enemy', virusCount: 10, growthRate: 2 },
      { id: 3, x: 600, y: 200, owner: 'neutral', virusCount: 20, growthRate: 2 },
      { id: 4, x: 400, y: 350, owner: 'neutral', virusCount: 20, growthRate: 2 },
      { id: 5, x: 200, y: 500, owner: 'enemy', virusCount: 25, growthRate: 1 },
      { id: 6, x: 600, y: 500, owner: 'player', virusCount: 10, growthRate: 2 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [4, 5],
      [4, 6],
    ],
  },
  // ステージ7
  {
    areas: [
      { id: 1, x: 100, y: 100, owner: 'player', virusCount: 35, growthRate: 2 },
      { id: 2, x: 700, y: 100, owner: 'enemy', virusCount: 40, growthRate: 1 },
      { id: 3, x: 400, y: 200, owner: 'neutral', virusCount: 25, growthRate: 2 },
      { id: 4, x: 250, y: 350, owner: 'neutral', virusCount: 25, growthRate: 1 },
      { id: 5, x: 550, y: 350, owner: 'neutral', virusCount: 25, growthRate: 2 },
      { id: 6, x: 100, y: 500, owner: 'neutral', virusCount: 25, growthRate: 2 },
      { id: 7, x: 700, y: 500, owner: 'enemy', virusCount: 40, growthRate: 1 },
    ],
    connections: [
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
      [4, 6],
      [5, 7],
    ],
  },
  // ステージ8
  {
    areas: [
      { id: 1, x: 400, y: 50, owner: 'player', virusCount: 40, growthRate: 1 },
      { id: 2, x: 250, y: 150, owner: 'neutral', virusCount: 30, growthRate: 2 },
      { id: 3, x: 550, y: 150, owner: 'neutral', virusCount: 30, growthRate: 2 },
      { id: 4, x: 250, y: 350, owner: 'neutral', virusCount: 30, growthRate: 2 },
      { id: 5, x: 550, y: 350, owner: 'neutral', virusCount: 30, growthRate: 2 },
      { id: 6, x: 250, y: 550, owner: 'enemy', virusCount: 25, growthRate: 1 },
      { id: 7, x: 550, y: 550, owner: 'enemy', virusCount: 25, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 6],
      [5, 7],
      [4, 5],
    ],
  },
  // ステージ9
  {
    areas: [
      { id: 1, x: 100, y: 300, owner: 'player', virusCount: 45, growthRate: 1 },
      { id: 2, x: 250, y: 150, owner: 'neutral', virusCount: 20, growthRate: 2 },
      { id: 3, x: 250, y: 450, owner: 'neutral', virusCount: 35, growthRate: 2 },
      { id: 4, x: 400, y: 300, owner: 'neutral', virusCount: 55, growthRate: 2 },
      { id: 5, x: 550, y: 150, owner: 'neutral', virusCount: 35, growthRate: 2 },
      { id: 6, x: 550, y: 450, owner: 'neutral', virusCount: 20, growthRate: 2 },
      { id: 7, x: 700, y: 300, owner: 'enemy', virusCount: 50, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [4, 5],
      [4, 6],
      [5, 7],
      [6, 7],
      [2, 5],
      [3, 6],
    ],
  },
  // ステージ10
  {
    areas: [
      { id: 1, x: 400, y: 50, owner: 'player', virusCount: 50, growthRate: 1 },
      { id: 2, x: 200, y: 200, owner: 'neutral', virusCount: 40, growthRate: 2 },
      { id: 3, x: 600, y: 200, owner: 'neutral', virusCount: 40, growthRate: 2 },
      { id: 4, x: 400, y: 350, owner: 'neutral', virusCount: 40, growthRate: 2 },
      { id: 5, x: 200, y: 500, owner: 'enemy', virusCount: 55, growthRate: 1 },
      { id: 6, x: 600, y: 500, owner: 'enemy', virusCount: 55, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [4, 5],
      [4, 6],
      [2, 5],
      [3, 6],
    ],
  },
];
