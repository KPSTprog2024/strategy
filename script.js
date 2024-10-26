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
let areas = [];
let connections = [];
let selectedArea = null;
let gameInterval;

// 攻撃ブロックを管理する配列
let attackBlocks = [];

// エリアの半径
const AREA_RADIUS = 40;

// チュートリアル用の変数
let tutorialSteps = [
  'ようこそ！このゲームでは赤いエリアがあなたの領地です。',
  '自分のエリアをクリックして選択し、隣接するエリアをクリックしてウイルスを移動できます。',
  'ウイルスは時間とともに増殖します。全エリアを赤色にすると勝利です。',
  '敵もエリアを占領しようとしますので注意してください。',
  'それではゲームを始めましょう！'
];
let currentTutorialStep = 0;

// ウイルス増殖と敵行動のタイミング管理
let virusGrowthCounter = 0;
let enemyActionCounter = 0;

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
  virusGrowthCounter = 0;
  enemyActionCounter = 0;
  gameInterval = setInterval(gameLoop, 50); // ゲームループを50msごとに実行
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

// エリアの作成（重ならないように配置）
function createAreas(areaCount, stageNumber) {
  areas = [];
  connections = [];
  selectedArea = null;

  let attempts = 0;
  while (areas.length < areaCount && attempts < 1000) {
    attempts++;
    let newArea = {
      id: areas.length + 1,
      x: Math.random() * (canvas.width - 2 * AREA_RADIUS) + AREA_RADIUS,
      y: Math.random() * (canvas.height - 2 * AREA_RADIUS) + AREA_RADIUS,
      owner: 'neutral',
      virusCount: 5,
      growthRate: Math.floor(Math.random() * 2) + 1
    };

    // 他のエリアと重ならないか確認
    if (areas.every(area => {
      const dx = area.x - newArea.x;
      const dy = area.y - newArea.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance >= AREA_RADIUS * 2 + 10; // 少し余裕を持たせる
    })) {
      areas.push(newArea);
    }
  }

  // エリアが少ない場合は位置を調整して追加
  if (areas.length < areaCount) {
    while (areas.length < areaCount) {
      let newArea = {
        id: areas.length + 1,
        x: Math.random() * (canvas.width - 2 * AREA_RADIUS) + AREA_RADIUS,
        y: Math.random() * (canvas.height - 2 * AREA_RADIUS) + AREA_RADIUS,
        owner: 'neutral',
        virusCount: 5,
        growthRate: Math.floor(Math.random() * 2) + 1
      };
      areas.push(newArea);
    }
  }

  // グラフを連結するために最小全域木を作成
  for (let i = 1; i < areas.length; i++) {
    let j = Math.floor(Math.random() * i); // 0からi-1のエリアから選ぶ
    connections.push([areas[i].id, areas[j].id]);
  }

  // 追加のランダムな接続を追加
  for (let i = 0; i < areas.length; i++) {
    for (let j = i + 1; j < areas.length; j++) {
      if (!connections.some(conn => (conn[0] === areas[i].id && conn[1] === areas[j].id) || (conn[0] === areas[j].id && conn[1] === areas[i].id))) {
        const dx = areas[i].x - areas[j].x;
        const dy = areas[i].y - areas[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200 && Math.random() < 0.3) { // 30%の確率で接続
          connections.push([areas[i].id, areas[j].id]);
        }
      }
    }
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
    areas[0].x = AREA_RADIUS + 10;
    areas[0].y = AREA_RADIUS + 10;
    areas[areas.length - 1].x = canvas.width - AREA_RADIUS - 10;
    areas[areas.length - 1].y = canvas.height - AREA_RADIUS - 10;
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
    // プレイヤーの攻撃ブロックが3つ以上ある場合は新たに出せない
    const playerAttackBlocks = attackBlocks.filter(block => block.owner === 'player');
    if (playerAttackBlocks.length >= 3) {
      return;
    }

    const movingVirus = fromArea.virusCount;
    if (movingVirus <= 0) return;

    fromArea.virusCount -= movingVirus;

    // 攻撃ブロックの作成
    attackBlocks.push({
      owner: fromArea.owner,
      virusCount: movingVirus,
      fromArea: fromArea,
      toArea: toArea,
      x: fromArea.x,
      y: fromArea.y,
      progress: 0
    });
  }
}

// 攻撃ブロックの更新
function updateAttackBlocks() {
  const speed = 0.01; // 攻撃ブロックの移動速度

  for (let i = 0; i < attackBlocks.length; i++) {
    const block = attackBlocks[i];
    block.progress += speed;

    // 座標の更新
    block.x = block.fromArea.x + (block.toArea.x - block.fromArea.x) * block.progress;
    block.y = block.fromArea.y + (block.toArea.y - block.fromArea.y) * block.progress;

    // 攻撃ブロック同士の衝突判定
    for (let j = i + 1; j < attackBlocks.length; j++) {
      const otherBlock = attackBlocks[j];

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

    if (block.progress >= 1) {
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
      const movingVirus = area.virusCount;
      if (movingVirus <= 0) return;

      area.virusCount -= movingVirus;

      // 攻撃ブロックの作成
      attackBlocks.push({
        owner: area.owner,
        virusCount: movingVirus,
        fromArea: area,
        toArea: targetArea,
        x: area.x,
        y: area.y,
        progress: 0
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
    levelCompleteOverlay.style.display = 'block';
  } else if (enemyOwned === areas.length) {
    clearInterval(gameInterval);
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

  if (enemyActionCounter >= 1000) { // 1000msごとに敵の行動
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
