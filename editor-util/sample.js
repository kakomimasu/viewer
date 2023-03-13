oninit((game, match) => {
  console.log("init", game, match);
});

onturn((game) => {
  console.log("turn", game);
  // 配置されていないエージェントはランダムに置く
  // 配置されているエージェントは8方向からランダムに選択し動く
  const agents = getAgents();
  const actions = [];
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    if (agent.x === -1) {
      // 配置されていないとき

      // ランダムなマスを選択
      const idx = Math.floor(Math.random() * game.tiled.length);
      const { x, y } = idx2xy(idx);

      actions.push({
        agentId: i,
        type: "PUT",
        x,
        y,
      });
    } else {
      // 配置されている場合

      // 周囲8方向からランダムに選択
      const [dx, dy] = DIR[Math.floor(Math.random() * 8)];

      actions.push({
        agentId: i,
        type: "MOVE",
        x: agent.x + dx,
        y: agent.y + dy,
      });
    }
  }
  console.log("actions", actions);
  return actions;
});