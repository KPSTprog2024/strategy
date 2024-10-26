// キャンバスとコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// オーバーレイ要素の取得
const tutorialOverlay = document.getElementById('tutorial');
const tutorialText = document.getElementById('tutorialText');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const levelCompleteOverlay = document.getElementById('levelComplete');
const nextLevelButton = document.getElementById('nextLevelButton');
const retryLevelButton = document.getElementById('retryLevelButton');
const gameOverOverlay = document.getElementById('gameOver');
const retryButton = document.getElementById('retryButton');
const restartButton = document.getElementById('restartButton');

// ゲーム状態の変数
let currentStage = 0;
let stages = [];
let areas = [];
let connections = [];
let selectedArea = null;
let gameInterval;

// チュートリアル用の変数
let tutorialSteps = [
  'ようこそ！このゲームでは赤いエリアがあなたの領地です。',
  '自分のエリアをクリックして選択し、隣接するエリアをクリックしてウイルスを移動できます。',
  'ウイルスは時間とともに増殖します。全エリアを赤色にすると勝利です。',
  '敵もエリアを占領しようとしますので注意してください。',
  'それではゲームを始めましょう！'
];
let currentTutorialStep = 0;

// 初期化関数
function initGame() {
  currentStage = 0;
  showTutorial();
}

// チュートリアルの表示
function showTutorial() {
  tutorialOverlay.style.display = 'block';
  tutorialText.innerText = tutorialSteps[currentTutorialStep];
  prevButton.style.display = currentTutorialStep === 0 ? 'none' : 'inline-block';
  nextButton.innerText = currentTutorialStep === tutorialSteps.length - 1 ? 'ゲーム開始' : '次へ';
}

// チュートリアルのボタンイベント
prevButton.addEventListener('click', () => {
  if (currentTutorialStep > 0) {
    currentTutorialStep--;
    showTutorial();
  }
});

nextButton.addEventListener('click', () => {
  if (currentTutorialStep < tutorialSteps.length - 1) {
    currentTutorialStep++;
    showTutorial();
  } else {
    tutorialOverlay.style.display = 'none';
    startStage(1);
  }
});

// ステージの開始
function startStage(stageNumber) {
  currentStage = stageNumber;
  setupStage(stageNumber);
  drawAreas();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000);
}

// ステージの設定
function setupStage(stageNumber) {
  // エリア数と配置の設定
  if (stageNumber <= 3) {
    createAreas(5, stageNumber);
  } else if (stageNumber <= 6) {
    createAreas(7, stageNumber);
  } else {
    createAreas(10, stageNumber);
  }
}

// エリアの作成
function createAreas(areaCount, stageNumber) {
  areas = [];
  connections = [];
  selectedArea = null;

  // エリアの配置（ランダム配置）
  for (let i = 1; i <= areaCount; i++) {
    areas.push({
      id: i,
      x: Math.random() * (canvas.width - 100) + 50,
      y: Math.random() * (canvas.height - 100) + 50,
      owner: 'neutral',
      virusCount: 5,
      growthRate: Math.floor(Math.random() * 2) + 1
    });
  }

  // 隣接関係の設定（全エリアを適当に接続）
  for (let i = 1; i < areaCount; i++) {
    connections.push([i, i + 1]);
  }

  // 初期配置の設定
  const enemyAreaCount = Math.floor(areaCount * (stageNumber <= 5 ? 0.2 : 0.4));
  const enemyInitialVirus = 5 + (stageNumber - 1) * 5;
  const playerInitialVirus = 10;

  // 敵エリアの設定
  for (let i = 0; i < enemyAreaCount; i++) {
    areas[i].owner = 'enemy';
    areas[i].virusCount = enemyInitialVirus;
  }

  // プレイヤーエリアの設定
  areas[areas.length - 1].owner = 'player';
  areas[areas.length - 1].virusCount = playerInitialVirus;

  // エリアの再配置（敵とプレイヤーを対角線上に配置）
  if (stageNumber >= 7) {
    areas[0].x = 100;
    areas[0].y = 100;
    areas[areas.length - 1].x = canvas.width - 100;
    areas[areas.length - 1].y = canvas.height - 100;
  }
}

// エリアの描画
function drawAreas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // エリア間の線を描画
  connections.forEach(conn => {
    const area1 = areas.find(area => area.id === conn[0]);
    const area2 = areas.find(area => area.id === conn[1]);
    ctx.beginPath();
    ctx.moveTo(area1.x, area1.y);
    ctx.lineTo(area2.x, area2.y);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
  });

  // エリアを描画
  areas.forEach(area => {
    ctx.beginPath();
    ctx.arc(area.x, area.y, 40, 0, Math.PI * 2);
    ctx.fillStyle =
      area.owner === 'player' ? 'red' :
      area.owner === 'enemy' ? 'orange' : 'white';
    ctx.fill();
    ctx.strokeStyle = selectedArea === area ? 'blue' : 'black';
    ctx.stroke();

    // ウイルス数と増殖率を表示
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(area.virusCount, area.x - 10, area.y + 5);
    ctx.fillText(`×${area.growthRate}`, area.x - 15, area.y + 25);
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
    return Math.sqrt(dx * dx + dy * dy) < 40;
  });

  if (clickedArea) {
    if (!selectedArea) {
      // 自エリアを選択
      if (clickedArea.owner === 'player' && clickedArea.virusCount > 1) {
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

// ウイルスの移動
function moveVirus(fromId, toId) {
  const fromArea = areas.find(area => area.id === fromId);
  const toArea = areas.find(area => area.id === toId);

  if (fromArea && toArea && fromArea.owner === 'player') {
    const movingVirus = Math.floor(fromArea.virusCount / 2);
    fromArea.virusCount -= movingVirus;

    if (toArea.owner === 'player') {
      // 自エリアに移動
      toArea.virusCount += movingVirus;
    } else if (toArea.owner === 'neutral') {
      // 未占領エリアを占領
      if (movingVirus > toArea.virusCount) {
        toArea.owner = 'player';
        toArea.virusCount = movingVirus - toArea.virusCount;
      } else if (movingVirus === toArea.virusCount) {
        toArea.owner = 'neutral';
        toArea.virusCount = 0;
      } else {
        toArea.virusCount -= movingVirus;
      }
    } else if (toArea.owner === 'enemy') {
      // 敵エリアへの攻撃
      if (movingVirus > toArea.virusCount) {
        toArea.owner = 'player';
        toArea.virusCount = movingVirus - toArea.virusCount;
      } else if (movingVirus === toArea.virusCount) {
        toArea.owner = 'neutral';
        toArea.virusCount = 0;
      } else {
        toArea.virusCount -= movingVirus;
      }
    }
  }
}

// 敵の行動
function enemyAction() {
  const enemyAreas = areas.filter(area => area.owner === 'enemy' && area.virusCount > 1);
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

    if (targetArea && area.virusCount > 1) {
      const movingVirus = Math.floor(area.virusCount / 2);
      area.virusCount -= movingVirus;

      if (targetArea.owner === 'enemy') {
        targetArea.virusCount += movingVirus;
      } else if (targetArea.owner === 'neutral') {
        if (movingVirus > targetArea.virusCount) {
          targetArea.owner = 'enemy';
          targetArea.virusCount = movingVirus - targetArea.virusCount;
        } else if (movingVirus === targetArea.virusCount) {
          targetArea.owner = 'neutral';
          targetArea.virusCount = 0;
        } else {
          targetArea.virusCount -= movingVirus;
        }
      } else if (targetArea.owner === 'player') {
        if (movingVirus > targetArea.virusCount) {
          targetArea.owner = 'enemy';
          targetArea.virusCount = movingVirus - targetArea.virusCount;
        } else if (movingVirus === targetArea.virusCount) {
          targetArea.owner = 'neutral';
          targetArea.virusCount = 0;
        } else {
          targetArea.virusCount -= movingVirus;
        }
      }
    }
  });
}

// 勝敗の判定
function checkGameStatus() {
  const playerOwned = areas.filter(area => area.owner === 'player').length;
  const enemyOwned = areas.filter(area => area.owner === 'enemy').length;

  if (playerOwned === areas.length) {
    clearInterval(gameInterval);
    levelCompleteOverlay.style.display = 'block';
  } else if (enemyOwned === areas.length) {
    clearInterval(gameInterval);
    gameOverOverlay.style.display = 'block';
  }
}

// ゲームループ
function gameLoop() {
  increaseVirusCounts();
  enemyAction();
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
