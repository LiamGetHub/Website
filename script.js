// ---- mobile nav toggle ----
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }
})();

// ---- active nav link ----
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if(a.getAttribute('href') === path) a.classList.add('active');
  });
})();

// ---- circuit board hero canvas ----
// Signature element: a live "breadboard" — nodes wired like traces on a
// PCB, referencing Liam's 8-bit computer build. Pointer proximity lights
// traces the way current would flow through a real circuit.
(function(){
  const canvas = document.getElementById('circuit-canvas');
  if(!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  let nodes = [];
  let pointer = { x: -9999, y: -9999 };
  const LINK_DIST = 165;
  const NODE_COUNT_DIVISOR = 15000; // lower = more nodes

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedNodes();
  }

  function seedNodes(){
    const count = Math.max(18, Math.floor((W * H) / NODE_COUNT_DIVISOR));
    nodes = [];
    for(let i = 0; i < count; i++){
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() < 0.14 ? 2.6 : 1.5,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function step(){
    ctx.clearRect(0, 0, W, H);

    // move nodes
    for(const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if(n.x < 0 || n.x > W) n.vx *= -1;
      if(n.y < 0 || n.y > H) n.vy *= -1;
      n.pulse += 0.02;
    }

    // draw links
    for(let i = 0; i < nodes.length; i++){
      for(let j = i + 1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < LINK_DIST){
          const dPointer = Math.min(
            Math.hypot(a.x - pointer.x, a.y - pointer.y),
            Math.hypot(b.x - pointer.x, b.y - pointer.y)
          );
          const proximity = Math.max(0, 1 - dPointer / 260);
          const baseAlpha = (1 - dist / LINK_DIST) * 0.14;
          const alpha = baseAlpha + proximity * 0.55;
          const hot = proximity > 0.08;
          ctx.strokeStyle = hot
            ? `rgba(255,176,32,${Math.min(alpha, 0.85)})`
            : `rgba(79,216,196,${Math.min(alpha, 0.3)})`;
          ctx.lineWidth = hot ? 1.2 : 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw nodes
    for(const n of nodes){
      const dPointer = Math.hypot(n.x - pointer.x, n.y - pointer.y);
      const proximity = Math.max(0, 1 - dPointer / 220);
      const glow = 0.5 + Math.sin(n.pulse) * 0.15 + proximity * 0.8;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + proximity * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = proximity > 0.1
        ? `rgba(255,176,32,${Math.min(glow, 1)})`
        : `rgba(79,216,196,${0.35 + Math.sin(n.pulse) * 0.15})`;
      ctx.fill();
    }

    if(!reduceMotion) requestAnimationFrame(step);
  }

  canvas.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  canvas.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });

  window.addEventListener('resize', resize);
  resize();
  step();
  if(reduceMotion){
    // draw one static frame instead of animating
    step();
  }
})();

// ---- hero typewriter ----
(function(){
  const el = document.querySelector('[data-typewriter]');
  if(!el) return;
  const full = el.getAttribute('data-typewriter');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion){ el.textContent = full; return; }
  let i = 0;
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.textContent = '\u00A0';
  function type(){
    if(i <= full.length){
      el.textContent = full.slice(0, i);
      el.appendChild(cursor);
      i++;
      setTimeout(type, 34);
    }
  }
  type();
})();

// ---- beacon canvas (contact page) ----
// Concentric pings radiating outward, like a signal being sent out to be found.
(function(){
  const canvas = document.getElementById('beacon-canvas');
  if(!canvas) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let W, H, DPR, cx, cy;
  let rings = [];
  const SPAWN_INTERVAL = 90; // frames
  let frame = 0;

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2;
  }

  function spawnRing(){
    rings.push({ r: 0, alpha: 0.6, color: rings.length % 2 === 0 ? '255,176,32' : '79,216,196' });
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    const maxR = Math.max(W, H) * 0.55;
    for(let i = rings.length - 1; i >= 0; i--){
      const ring = rings[i];
      ring.r += 1.1;
      ring.alpha = Math.max(0, 0.55 * (1 - ring.r / maxR));
      if(ring.alpha <= 0){ rings.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ring.color},${ring.alpha})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    // center beacon dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,176,32,0.85)';
    ctx.shadowColor = 'rgba(255,176,32,0.9)';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    frame++;
    if(frame % SPAWN_INTERVAL === 0) spawnRing();
    if(!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  spawnRing();
  if(reduceMotion){
    spawnRing(); spawnRing();
    draw();
  } else {
    draw();
  }
})();

// ---- ambient dust canvas (about page) ----
// Slow-drifting teal specks, no interaction — quiet atmosphere behind the bio.
(function(){
  const canvas = document.getElementById('about-ambient');
  if(!canvas) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  let dots = [];

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.max(20, Math.floor((W * H) / 26000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: 0.06 + Math.random() * 0.10,
      r: 0.8 + Math.random() * 1.4,
      pulse: Math.random() * Math.PI * 2
    }));
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    for(const d of dots){
      d.y -= d.vy;
      if(d.y < -10){ d.y = H + 10; d.x = Math.random() * W; }
      d.pulse += 0.015;
      const a = 0.18 + Math.sin(d.pulse) * 0.12;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79,216,196,${Math.max(0, a)})`;
      ctx.fill();
    }
    if(!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
