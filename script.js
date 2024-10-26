// キャンバスとコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// オーバーレイ要素の取得
const startScreen = document.getElementById('startScreen');
const startGameButton = document.getElementById('startGameButton');
const levelCompleteOverlay = document.getElementById('levelComplete');
const nextLevelButton = document.getElementById('nextLevelButton');
const retryLevelButton = document.getElementById('retryLevelButton');
const gameOverOverlay = document.getElementById('gameOver');
const retryButton = document.getElementById('retryButton');
const restartButton = document.getElementById('restartButton');

// ゲーム状態の変数
let currentStage = 0;
let areas = [];
let connections = [];
let selectedArea = null;
let gameInterval;

// 攻撃ブロックを管理する配列
let attackBlocks = [];

// エリアの半径
const AREA_RADIUS = 40;

// ウイルス増殖と敵行動のタイミング管理
let virusGrowthCounter = 0;
let enemyActionCounter = 0;

// ステージデータの定義
const stages = [
  // ステージ0: チュートリアル
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
      { id: 1, x: 100, y: 300, owner: 'player', virusCount: 25, growthRate: 1 },
      { id: 2, x: 250, y: 100, owner: 'neutral', virusCount: 10, growthRate: 2 },
      { id: 3, x: 250, y: 500, owner: 'neutral', virusCount: 10, growthRate: 2 },
      { id: 4, x: 400, y: 300, owner: 'neutral', virusCount: 10, growthRate: 2 },
      { id: 5, x: 550, y: 100, owner: 'neutral', virusCount: 10, growthRate: 2 },
      { id: 6, x: 550, y: 500, owner: 'neutral', virusCount: 10, growthRate: 2 },
      { id: 7, x: 700, y: 300, owner: 'enemy', virusCount: 30, growthRate: 1 },
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
  // ステージ6
  {
    areas: [
      { id: 1, x: 100, y: 100, owner: 'player', virusCount: 30, growthRate: 1 },
      { id: 2, x: 100, y: 500, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 3, x: 400, y: 100, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 4, x: 400, y: 300, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 5, x: 400, y: 500, owner: 'neutral', virusCount: 15, growthRate: 2 },
      { id: 6, x: 700, y: 100, owner: 'enemy', virusCount: 35, growthRate: 1 },
      { id: 7, x: 700, y: 500, owner: 'enemy', virusCount: 35, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 5],
      [3, 4],
      [4, 5],
      [4, 6],
      [5, 7],
      [6, 7],
    ],
  },
  // ステージ7
  {
    areas: [
      { id: 1, x: 100, y: 300, owner: 'player', virusCount: 35, growthRate: 1 },
      { id: 2, x: 250, y: 150, owner: 'neutral', virusCount: 20, growthRate: 2 },
      { id: 3, x: 250, y: 450, owner: 'neutral', virusCount: 20, growthRate: 2 },
      { id: 4, x: 400, y: 300, owner: 'neutral', virusCount: 20, growthRate: 2 },
      { id: 5, x: 550, y: 150, owner: 'enemy', virusCount: 40, growthRate: 1 },
      { id: 6, x: 550, y: 450, owner: 'enemy', virusCount: 40, growthRate: 1 },
      { id: 7, x: 700, y: 300, owner: 'enemy', virusCount: 40, growthRate: 1 },
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
  // ステージ8
  {
    areas: [
      { id: 1, x: 400, y: 50, owner: 'player', virusCount: 40, growthRate: 1 },
      { id: 2, x: 250, y: 150, owner: 'neutral', virusCount: 25, growthRate: 2 },
      { id: 3, x: 550, y: 150, owner: 'neutral', virusCount: 25, growthRate: 2 },
      { id: 4, x: 100, y: 300, owner: 'enemy', virusCount: 45, growthRate: 1 },
      { id: 5, x: 700, y: 300, owner: 'enemy', virusCount: 45, growthRate: 1 },
      { id: 6, x: 250, y: 450, owner: 'neutral', virusCount: 25, growthRate: 2 },
      { id: 7, x: 550, y: 450, owner: 'neutral', virusCount: 25, growthRate: 2 },
      { id: 8, x: 400, y: 550, owner: 'enemy', virusCount: 45, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [2, 6],
      [3, 5],
      [3, 7],
      [6, 4],
      [7, 5],
      [6, 8],
      [7, 8],
    ],
  },
  // ステージ9
  {
    areas: [
      { id: 1, x: 100, y: 100, owner: 'player', virusCount: 45, growthRate: 1 },
      { id: 2, x: 100, y: 500, owner: 'player', virusCount: 45, growthRate: 1 },
      { id: 3, x: 250, y: 300, owner: 'neutral', virusCount: 30, growthRate: 2 },
      { id: 4, x: 400, y: 100, owner: 'neutral', virusCount: 30, growthRate: 2 },
      { id: 5, x: 400, y: 500, owner: 'neutral', virusCount: 30, growthRate: 2 },
      { id: 6, x: 550, y: 300, owner: 'neutral', virusCount: 30, growthRate: 2 },
      { id: 7, x: 700, y: 100, owner: 'enemy', virusCount: 50, growthRate: 1 },
      { id: 8, x: 700, y: 500, owner: 'enemy', virusCount: 50, growthRate: 1 },
    ],
    connections: [
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
      [4, 6],
      [5, 6],
      [6, 7],
      [6, 8],
    ],
  },
  // ステージ10
  {
    areas: [
      { id: 1, x: 400, y: 50, owner: 'player', virusCount: 50, growthRate: 1 },
      { id: 2, x: 250, y: 150, owner: 'neutral', virusCount: 35, growthRate: 2 },
      { id: 3, x: 550, y: 150, owner: 'neutral', virusCount: 35, growthRate: 2 },
      { id: 4, x: 250, y: 300, owner: 'enemy', virusCount: 55, growthRate: 1 },
      { id: 5, x: 550, y: 300, owner: 'enemy', virusCount: 55, growthRate: 1 },
      { id: 6, x: 250, y: 450, owner: 'neutral', virusCount: 35, growthRate: 2 },
      { id: 7, x: 550, y: 450, owner: 'neutral', virusCount: 35, growthRate: 2 },
      { id: 8, x: 400, y: 550, owner: 'enemy', virusCount: 55, growthRate: 1 },
    ],
    connections: [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 6],
      [5, 7],
      [6, 8],
      [7, 8],
      [4, 5],
      [6, 7],
    ],
  },
];

// 初期化関数
function initGame() {
  startScreen.style.display = 'block';
}

// ゲーム開始ボタンのイベント
startGameButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  startStage(0); // ステージ0から開始
});

// ステージの開始
function startStage(stageNumber) {
  currentStage = stageNumber;
  setupStage(stageNumber);
  drawAreas();
  if (gameInterval) clearInterval(gameInterval);
  virusGrowthCounter = 0;
  enemyActionCounter = 0;
  gameInterval = setInterval(gameLoop, 50); // ゲームループを50msごとに実行
}

// ステージの設定
function setupStage(stageNumber) {
  if (stageNumber < stages.length) {
    // 固定デザインのステージをロード
    const stageData = stages[stageNumber];
    areas = stageData.areas.map(area => ({ ...area }));
    connections = stageData.connections.map(conn => [...conn]);
  } else {
    // ランダムステージ（ステージ11以降）
    createRandomStage(stageNumber);
  }
  selectedArea = null;
}

// ランダムステージの作成
function createRandomStage(stageNumber) {
  // ランダムにエリアと接続を生成するロジックを記述
  // ここでは簡略化のため省略します
}

// エリアの描画
function drawAreas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // エリア間の線を描画
  connections.forEach(conn => {
    const area1 = areas.find(area => area.id === conn[0]);
    const area2 = areas.find(area => area.id === conn[1]);

    // 線がエリアの外縁から始まるように調整
    const angle = Math.atan2(area2.y - area1.y, area2.x - area1.x);
    const x1 = area1.x + AREA_RADIUS * Math.cos(angle);
    const y1 = area1.y + AREA_RADIUS * Math.sin(angle);
    const x2 = area2.x - AREA_RADIUS * Math.cos(angle);
    const y2 = area2.y - AREA_RADIUS * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
  });

  // 攻撃ブロックの描画
  attackBlocks.forEach(block => {
    ctx.beginPath();
    ctx.arc(block.x, block.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = block.owner === 'player' ? 'red' : 'orange';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(block.virusCount, block.x, block.y);
  });

  // エリアを描画
  areas.forEach(area => {
    ctx.beginPath();
    ctx.arc(area.x, area.y, AREA_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle =
      area.owner === 'player' ? 'red' :
      area.owner === 'enemy' ? 'orange' : 'white';
    ctx.fill();

    // 縁取りの設定
    if (selectedArea === area) {
      ctx.lineWidth = 5; // 太くする
      ctx.strokeStyle = 'darkred'; // 濃い赤色
    } else {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
    }
    ctx.stroke();

    // ウイルス数と増殖率を表示
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(area.virusCount, area.x, area.y + 5);
    ctx.fillText(`×${area.growthRate}`, area.x, area.y + 25);
  });
}

// ウイルスの増殖
function increaseVirusCounts() {
  areas.forEach(area => {
    if (area.owner !== 'neutral') {
      area.virusCount += area.growthRate;
    }
  });
}

// エリアのクリック判定
canvas.addEventListener('click', function(event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const clickedArea = areas.find(area => {
    const dx = area.x - clickX;
    const dy = area.y - clickY;
    return Math.sqrt(dx * dx + dy * dy) < AREA_RADIUS;
  });

  if (clickedArea) {
    if (!selectedArea) {
      // 自エリアを選択
      if (clickedArea.owner === 'player' && clickedArea.virusCount > 0) {
        selectedArea = clickedArea;
        drawAreas();
      }
    } else {
      // 移動先を選択
      if (isNeighbor(selectedArea, clickedArea)) {
        moveVirus(selectedArea.id, clickedArea.id);
        selectedArea = null;
        drawAreas();
      } else {
        // 隣接していない場合は選択を解除
        selectedArea = null;
        drawAreas();
      }
    }
  } else {
    // 何もない場所をクリックした場合、選択を解除
    selectedArea = null;
    drawAreas();
  }
});

// エリア間が隣接しているか確認
function isNeighbor(fromArea, toArea) {
  return connections.some(conn =>
    (conn[0] === fromArea.id && conn[1] === toArea.id) ||
    (conn[1] === fromArea.id && conn[0] === toArea.id)
  );
}

// ウイルスの移動（攻撃ブロックの作成に変更）
function moveVirus(fromId, toId) {
  const fromArea = areas.find(area => area.id === fromId);
  const toArea = areas.find(area => area.id === toId);

  if (fromArea && toArea && fromArea.owner === 'player') {
    // 同一経路上の自分の攻撃ブロック数をカウント
    const playerBlocksOnRoute = attackBlocks.filter(block =>
      block.owner === 'player' &&
      block.fromArea.id === fromArea.id &&
      block.toArea.id === toArea.id
    );

    // 同一経路上に3つ以上の攻撃ブロックがある場合、新たに出せない
    if (playerBlocksOnRoute.length >= 3) {
      return;
    }

    const movingVirus = fromArea.virusCount;
    if (movingVirus <= 0) return;

    fromArea.virusCount -= movingVirus;

    // 攻撃ブロックの作成
    const dx = toArea.x - fromArea.x;
    const dy = toArea.y - fromArea.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / distance;
    const unitY = dy / distance;

    const startX = fromArea.x + AREA_RADIUS * unitX;
    const startY = fromArea.y + AREA_RADIUS * unitY;
    const endX = toArea.x - AREA_RADIUS * unitX;
    const endY = toArea.y - AREA_RADIUS * unitY;
    const totalDistance = Math.sqrt((endX - startX) ** 2 + (endY - startX) ** 2);

    attackBlocks.push({
      owner: fromArea.owner,
      virusCount: movingVirus,
      fromArea: fromArea,
      toArea: toArea,
      x: startX,
      y: startY,
      dx: unitX,
      dy: unitY,
      totalDistance: totalDistance,
      distanceTraveled: 0,
      speed: 2, // ピクセルごとの移動速度
    });
  }
}

// 攻撃ブロックの更新
function updateAttackBlocks() {
  for (let i = 0; i < attackBlocks.length; i++) {
    const block = attackBlocks[i];

    // 移動距離の更新
    block.distanceTraveled += block.speed;

    // 座標の更新
    block.x = block.x + block.dx * block.speed;
    block.y = block.y + block.dy * block.speed;

    // 攻撃ブロック同士の衝突判定
    for (let j = i + 1; j < attackBlocks.length; j++) {
      const otherBlock = attackBlocks[j];

      // 同一経路上にある場合のみ衝突判定
      if (
        (block.fromArea.id === otherBlock.fromArea.id && block.toArea.id === otherBlock.toArea.id) ||
        (block.fromArea.id === otherBlock.toArea.id && block.toArea.id === otherBlock.fromArea.id)
      ) {
        // 異なる所有者の場合のみ衝突判定
        if (block.owner !== otherBlock.owner) {
          const dx = block.x - otherBlock.x;
          const dy = block.y - otherBlock.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 20) { // 攻撃ブロックの半径の合計より小さい場合
            if (block.virusCount > otherBlock.virusCount) {
              block.virusCount -= otherBlock.virusCount;
              attackBlocks.splice(j, 1);
              j--; // インデックスを調整
            } else if (block.virusCount < otherBlock.virusCount) {
              otherBlock.virusCount -= block.virusCount;
              attackBlocks.splice(i, 1);
              i--; // インデックスを調整
              break; // 外側のループを抜ける
            } else {
              // 同数の場合、両方消える
              attackBlocks.splice(j, 1);
              attackBlocks.splice(i, 1);
              i--; // インデックスを調整
              break; // 外側のループを抜ける
            }
          }
        }
      }
    }

    // 攻撃ブロックがターゲットエリアの外縁に到達したか確認
    const targetDistance = Math.sqrt((block.x - block.toArea.x) ** 2 + (block.y - block.toArea.y) ** 2);
    if (targetDistance <= AREA_RADIUS || block.distanceTraveled >= block.totalDistance) {
      // 攻撃ブロックが到達した場合の処理
      const toArea = block.toArea;
      const movingVirus = block.virusCount;

      if (toArea.owner === block.owner) {
        // 自エリアに移動
        toArea.virusCount += movingVirus;
      } else if (toArea.owner === 'neutral') {
        // 未占領エリアを占領
        if (movingVirus > toArea.virusCount) {
          toArea.owner = block.owner;
          toArea.virusCount = movingVirus - toArea.virusCount;
        } else if (movingVirus === toArea.virusCount) {
          toArea.owner = 'neutral';
          toArea.virusCount = 0;
        } else {
          toArea.virusCount -= movingVirus;
        }
      } else {
        // 敵エリアへの攻撃
        if (movingVirus > toArea.virusCount) {
          toArea.owner = block.owner;
          toArea.virusCount = movingVirus - toArea.virusCount;
        } else if (movingVirus === toArea.virusCount) {
          toArea.owner = 'neutral';
          toArea.virusCount = 0;
        } else {
          toArea.virusCount -= movingVirus;
        }
      }

      // 攻撃ブロックの削除
      attackBlocks.splice(i, 1);
      i--; // インデックスを調整
    }
  }
}

// 敵の行動（攻撃ブロックの作成を追加）
function enemyAction() {
  const enemyAreas = areas.filter(area => area.owner === 'enemy' && area.virusCount > 0);
  enemyAreas.forEach(area => {
    // 隣接するエリアを取得
    const neighboringAreas = connections
      .filter(conn => conn.includes(area.id))
      .map(conn => conn[0] === area.id ? conn[1] : conn[0])
      .map(id => areas.find(a => a.id === id));

    let targetArea;

    if (currentStage <= 5) {
      // ランダムに攻撃
      targetArea = neighboringAreas[Math.floor(Math.random() * neighboringAreas.length)];
    } else {
      // プレイヤーのウイルス数が少ないエリアを優先攻撃
      const playerAreas = neighboringAreas.filter(a => a.owner === 'player');
      if (playerAreas.length > 0) {
        targetArea = playerAreas.reduce((minArea, a) => a.virusCount < minArea.virusCount ? a : minArea, playerAreas[0]);
      } else {
        targetArea = neighboringAreas[Math.floor(Math.random() * neighboringAreas.length)];
      }
    }

    if (targetArea && area.virusCount > 0) {
      // 同一経路上の敵の攻撃ブロック数をカウント
      const enemyBlocksOnRoute = attackBlocks.filter(block =>
        block.owner === 'enemy' &&
        block.fromArea.id === area.id &&
        block.toArea.id === targetArea.id
      );

      // 同一経路上に3つ以上の攻撃ブロックがある場合、新たに出せない
      if (enemyBlocksOnRoute.length >= 3) {
        return;
      }

      const movingVirus = area.virusCount;
      if (movingVirus <= 0) return;

      area.virusCount -= movingVirus;

      // 攻撃ブロックの作成
      const dx = targetArea.x - area.x;
      const dy = targetArea.y - area.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / distance;
      const unitY = dy / distance;

      const startX = area.x + AREA_RADIUS * unitX;
      const startY = area.y + AREA_RADIUS * unitY;
      const endX = targetArea.x - AREA_RADIUS * unitX;
      const endY = targetArea.y - AREA_RADIUS * unitY;
      const totalDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

      attackBlocks.push({
        owner: area.owner,
        virusCount: movingVirus,
        fromArea: area,
        toArea: targetArea,
        x: startX,
        y: startY,
        dx: unitX,
        dy: unitY,
        totalDistance: totalDistance,
        distanceTraveled: 0,
        speed: 2, // ピクセルごとの移動速度
      });
    }
  });
}

// 勝敗の判定
function checkGameStatus() {
  const playerOwned = areas.filter(area => area.owner === 'player').length;
  const enemyOwned = areas.filter(area => area.owner === 'enemy').length;

  if (playerOwned === areas.length) {
    clearInterval(gameInterval);
    attackBlocks = []; // 攻撃ブロックをクリア
    levelCompleteOverlay.style.display = 'block';
  } else if (enemyOwned === areas.length) {
    clearInterval(gameInterval);
    attackBlocks = []; // 攻撃ブロックをクリア
    gameOverOverlay.style.display = 'block';
  }
}

// ゲームループ
function gameLoop() {
  virusGrowthCounter += 50; // 50msごとに実行
  enemyActionCounter += 50;

  if (virusGrowthCounter >= 1000) { // 1000msごとにウイルス増殖
    increaseVirusCounts();
    virusGrowthCounter = 0;
  }

  if (enemyActionCounter >= 1000 && currentStage !== 0) { // ステージ0では敵の行動なし
    enemyAction();
    enemyActionCounter = 0;
  }

  updateAttackBlocks(); // 攻撃ブロックの更新
  checkGameStatus();
  drawAreas();
}

// ステージクリア時のボタンイベント
nextLevelButton.addEventListener('click', () => {
  levelCompleteOverlay.style.display = 'none';
  startStage(currentStage + 1);
});

retryLevelButton.addEventListener('click', () => {
  levelCompleteOverlay.style.display = 'none';
  startStage(currentStage);
});

// ゲームオーバー時のボタンイベント
retryButton.addEventListener('click', () => {
  gameOverOverlay.style.display = 'none';
  startStage(currentStage);
});

restartButton.addEventListener('click', () => {
  gameOverOverlay.style.display = 'none';
  initGame();
});

// ゲームの開始
initGame();
