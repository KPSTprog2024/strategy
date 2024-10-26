// 既存のコードは省略し、追加・変更点を中心に説明します。

// 攻撃ブロックを管理する配列
let attackBlocks = [];

// エリアの半径
const AREA_RADIUS = 40;

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
      return distance >= AREA_RADIUS * 2;
    })) {
      areas.push(newArea);
    }
  }

  // エリアが少ない場合は位置を調整
  if (areas.length < areaCount) {
    // 強制的にエリア数を満たすため、位置をずらして追加
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

  // 隣接関係の設定（デラネー三角形分割などを利用すると良いが、ここでは簡易的に）
  for (let i = 0; i < areas.length; i++) {
    for (let j = i + 1; j < areas.length; j++) {
      const dx = areas[i].x - areas[j].x;
      const dy = areas[i].y - areas[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 200) { // 一定距離以内なら接続
        connections.push([areas[i].id, areas[j].id]);
      }
    }
  }

  // 以下、初期配置の設定（以前と同じ）
  // ...
}

// エリアの描画（攻撃ブロックの描画も追加）
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
  });

  // エリアを描画
  areas.forEach(area => {
    ctx.beginPath();
    ctx.arc(area.x, area.y, AREA_RADIUS, 0, Math.PI * 2);
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

// ウイルスの移動（攻撃ブロックの作成に変更）
function moveVirus(fromId, toId) {
  const fromArea = areas.find(area => area.id === fromId);
  const toArea = areas.find(area => area.id === toId);

  if (fromArea && toArea && fromArea.owner === 'player') {
    const movingVirus = Math.floor(fromArea.virusCount / 2);
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
  const speed = 0.02; // 攻撃ブロックの移動速度

  attackBlocks.forEach((block, index) => {
    block.progress += speed;

    // 座標の更新
    block.x = block.fromArea.x + (block.toArea.x - block.fromArea.x) * block.progress;
    block.y = block.fromArea.y + (block.toArea.y - block.fromArea.y) * block.progress;

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
      attackBlocks.splice(index, 1);
    }
  });
}

// 敵の行動（攻撃ブロックの作成を追加）
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

// ゲームループの更新
function gameLoop() {
  increaseVirusCounts();
  enemyAction();
  updateAttackBlocks(); // 攻撃ブロックの更新を追加
  checkGameStatus();
  drawAreas();
}

// 既存のコード（初期化、イベントリスナーなど）は以前と同じです
