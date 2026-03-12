import { useEffect, useRef, useState, useCallback } from "react";

const COLS = 25, ROWS = 25, CELL = 22;
const W = COLS * CELL, H = ROWS * CELL;
const TICK = 110;

const DIR = { UP:[0,-1], DOWN:[0,1], LEFT:[-1,0], RIGHT:[1,0] };
const OPP = { UP:"DOWN", DOWN:"UP", LEFT:"RIGHT", RIGHT:"LEFT" };

function randFood(snake) {
  let pos;
  do {
    pos = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) };
  } while (snake.some(s => s.x===pos.x && s.y===pos.y));
  return pos;
}

function initState() {
  const snake = [
    { x:12, y:12 }, { x:11, y:12 }, { x:10, y:12 }
  ];
  return {
    snake,
    dir: "RIGHT",
    nextDir: "RIGHT",
    food: randFood(snake),
    score: 0,
    status: "idle", // idle | playing | dead
    particles: [],
    tick: 0,
  };
}

export default function Snake() {
  const canvasRef = useRef(null);
  const stateRef = useRef(initState());
  const lastTickRef = useRef(0);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState("idle");

  const start = useCallback(() => {
    stateRef.current = initState();
    stateRef.current.status = "playing";
    setScore(0);
    setStatus("playing");
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const s = stateRef.current;
      const map = {
        ArrowUp:"UP", ArrowDown:"DOWN", ArrowLeft:"LEFT", ArrowRight:"RIGHT",
        KeyW:"UP", KeyS:"DOWN", KeyA:"LEFT", KeyD:"RIGHT",
      };
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
      if (e.code === "Space" || e.code === "Enter") {
        if (s.status !== "playing") start();
        return;
      }
      const d = map[e.code];
      if (d && s.status === "playing" && d !== OPP[s.dir]) {
        s.nextDir = d;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function update(ts) {
      const s = stateRef.current;
      s.tick++;

      if (s.status === "playing" && ts - lastTickRef.current > TICK) {
        lastTickRef.current = ts;
        s.dir = s.nextDir;
        const [dx, dy] = DIR[s.dir];
        const head = s.snake[0];
        const newHead = { x: head.x + dx, y: head.y + dy };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
          s.status = "dead"; setStatus("dead");
          setBest(b => Math.max(b, s.score));
          return;
        }
        // Self collision
        if (s.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          s.status = "dead"; setStatus("dead");
          setBest(b => Math.max(b, s.score));
          return;
        }

        const ate = newHead.x === s.food.x && newHead.y === s.food.y;
        s.snake = [newHead, ...s.snake];
        if (ate) {
          s.score += 10;
          setScore(s.score);
          // Burst particles
          for (let i = 0; i < 14; i++) {
            s.particles.push({
              x: (newHead.x + 0.5) * CELL, y: (newHead.y + 0.5) * CELL,
              vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
              life: 28 + Math.random()*20, maxLife: 48,
              hue: Math.random() > 0.5 ? 140 : 50,
              size: 2 + Math.random()*3,
            });
          }
          s.food = randFood(s.snake);
        } else {
          s.snake.pop();
        }
      }

      // Update particles
      s.particles = s.particles.filter(p => p.life > 0);
      for (const p of s.particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--;
      }
    }

    function draw() {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.fillStyle = "#0a0e14";
      ctx.fillRect(0, 0, W, H);
      for (let x = 0; x <= COLS; x++) {
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, H); ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(W, y*CELL); ctx.stroke();
      }

      if (s.status === "idle") {
        drawOverlay(ctx, s, "idle");
        return;
      }

      // Food glow pulse
      const pulse = 0.7 + 0.3 * Math.sin(s.tick * 0.12);
      ctx.save();
      ctx.shadowColor = `rgba(255,210,0,${pulse})`;
      ctx.shadowBlur = 18 * pulse;
      ctx.fillStyle = "#ffd700";
      const fx = s.food.x * CELL + CELL/2, fy = s.food.y * CELL + CELL/2;
      ctx.beginPath();
      ctx.arc(fx, fy, CELL*0.36, 0, Math.PI*2);
      ctx.fill();
      // inner shine
      ctx.fillStyle = "#fffacc";
      ctx.beginPath();
      ctx.arc(fx - CELL*0.1, fy - CELL*0.1, CELL*0.13, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // Snake
      s.snake.forEach((seg, i) => {
        const t = i / s.snake.length;
        const hue = 130 - t * 40;
        const lightness = 48 - t * 12;
        const alpha = i === 0 ? 1 : 0.92 - t * 0.2;
        const px = seg.x * CELL, py = seg.y * CELL;
        const pad = i === 0 ? 1 : 2;
        const r = i === 0 ? 5 : 3;

        ctx.save();
        if (i < 4) {
          ctx.shadowColor = `hsl(${hue},80%,60%)`;
          ctx.shadowBlur = 10;
        }
        ctx.fillStyle = `hsla(${hue},75%,${lightness}%,${alpha})`;
        roundRect(ctx, px+pad, py+pad, CELL-pad*2, CELL-pad*2, r);
        ctx.fill();

        // Head details
        if (i === 0) {
          const [dx, dy] = DIR[s.dir];
          ctx.fillStyle = "rgba(0,0,0,0.7)";
          // eyes
          const ex = [-dy*4, dy*4], ey = [dx*4, -dx*4];
          for (let e = 0; e < 2; e++) {
            ctx.beginPath();
            ctx.arc(px + CELL/2 + ex[e] + dx*3, py + CELL/2 + ey[e] + dy*3, 2.5, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.beginPath();
            ctx.arc(px + CELL/2 + ex[e] + dx*3 + 0.8, py + CELL/2 + ey[e] + dy*3 - 0.8, 0.9, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "rgba(0,0,0,0.7)";
          }
        }
        ctx.restore();
      });

      // Particles
      for (const p of s.particles) {
        const a = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = `hsl(${p.hue},90%,65%)`;
        ctx.shadowColor = `hsl(${p.hue},90%,65%)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      if (s.status === "dead") drawOverlay(ctx, s, "dead");
    }

    function drawOverlay(ctx, s, type) {
      ctx.save();
      ctx.fillStyle = "rgba(5,8,16,0.82)";
      ctx.fillRect(0, 0, W, H);

      if (type === "idle") {
        // Animated snake logo
        const t = s.tick * 0.04;
        ctx.strokeStyle = "rgba(40,220,100,0.15)";
        ctx.lineWidth = CELL - 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i < 30; i++) {
          const bx = W/2 + Math.cos(t + i*0.4) * (60 + i*2);
          const by = H/2 + Math.sin(t*1.3 + i*0.4) * (40 + i*1.5);
          i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
        }
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#28dc64";
        ctx.shadowColor = "#28dc64";
        ctx.shadowBlur = 24;
        ctx.font = "bold 38px 'Courier New'";
        ctx.fillText("SNAKE", W/2, H/2 - 20);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "13px 'Courier New'";
        ctx.fillText("Arrow keys or WASD to move", W/2, H/2 + 20);
        const blink = Math.floor(s.tick / 30) % 2;
        ctx.fillStyle = blink ? "#28dc64" : "#888";
        ctx.font = "bold 14px 'Courier New'";
        ctx.fillText("▶  PRESS SPACE TO PLAY", W/2, H/2 + 52);
      }

      if (type === "dead") {
        ctx.textAlign = "center";
        ctx.fillStyle = "#ff4444";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 28;
        ctx.font = "bold 36px 'Courier New'";
        ctx.fillText("GAME OVER", W/2, H/2 - 40);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px 'Courier New'";
        ctx.fillText(`Score: ${s.score}`, W/2, H/2);
        ctx.fillStyle = "#ffd700";
        ctx.fillText(`Best: ${Math.max(s.score, best)}`, W/2, H/2 + 24);
        const blink = Math.floor(s.tick / 28) % 2;
        ctx.fillStyle = blink ? "#28dc64" : "#555";
        ctx.font = "bold 13px 'Courier New'";
        ctx.fillText("▶  PRESS SPACE TO RETRY", W/2, H/2 + 60);
      }
      ctx.restore();
    }

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      update(ts);
      draw();
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [best]);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.arcTo(x+w,y, x+w,y+r, r);
    ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w,y+h, x+w-r,y+h, r);
    ctx.lineTo(x+r, y+h); ctx.arcTo(x,y+h, x,y+h-r, r);
    ctx.lineTo(x, y+r); ctx.arcTo(x,y, x+r,y, r);
    ctx.closePath();
  }

  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", minHeight:"100vh", background:"#06090f",
      fontFamily:"'Courier New', monospace",
    }}>
      {/* Score bar */}
      <div style={{
        display:"flex", gap:48, marginBottom:14,
        padding:"8px 32px", background:"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.08)", borderRadius:4,
      }}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:10,color:"#444",letterSpacing:3}}>SCORE</div>
          <div style={{fontSize:22,color:"#28dc64",fontWeight:"bold",letterSpacing:2}}>{score}</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:10,color:"#444",letterSpacing:3}}>BEST</div>
          <div style={{fontSize:22,color:"#ffd700",fontWeight:"bold",letterSpacing:2}}>{best}</div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        border:"1px solid rgba(40,220,100,0.18)",
        boxShadow:"0 0 40px rgba(40,220,100,0.07), 0 0 80px rgba(0,0,0,0.6)",
        borderRadius:3,
      }}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{display:"block", imageRendering:"pixelated"}} />
      </div>

      <div style={{marginTop:14, fontSize:11, color:"#333", letterSpacing:3}}>
        WASD / ARROWS — SPACE TO START
      </div>
    </div>
  );
}
