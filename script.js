// エリアを描画
areas.forEach(area => {
  ctx.beginPath();
  ctx.arc(area.x, area.y, AREA_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle =
    area.owner === 'player' ? 'red' :
    area.owner === 'enemy' ? 'orange' : 'white';
  ctx.fill();

  // 縁取りの設定
  let lineWidth = 1;
  let strokeStyle = 'black';

  if (selectedArea === area) {
    // 選択したエリア
    lineWidth = 5;
    strokeStyle = 'darkred';
  } else if (selectedArea && isNeighbor(selectedArea, area) && area.owner !== 'player') {
    // 隣接する敵または中立エリア
    lineWidth = 5;
    strokeStyle = 'darkblue';
  }

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();

  // ウイルス数と増殖率を表示
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(area.virusCount, area.x, area.y + 5);
  ctx.fillText(`×${area.growthRate}`, area.x, area.y + 25);
});
