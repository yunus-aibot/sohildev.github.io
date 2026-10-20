/* =========================================================
   Sohil Mansuri — Portfolio
   three-scene.js : scroll-driven WebGL background
   ========================================================= */
import * as THREE from 'three';

const canvas = document.getElementById('gl-bg');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- WebGL support check ---------- */
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

/* ---------- palette ---------- */
const C = {
  violet: new THREE.Color('#7c5cff'),
  cyan:   new THREE.Color('#00e5ff'),
  pink:   new THREE.Color('#ff4d9d'),
  lime:   new THREE.Color('#b8ff5c'),
  white:  new THREE.Color('#ffffff'),
};

const SKILLS = [
  'TypeScript','JavaScript','React','Angular','Next.js','Node.js','Express.js',
  'GraphQL','MongoDB','PostgreSQL','MySQL','Docker','Kubernetes','AWS','Azure','GCP',
  'Firebase','Python','.NET Core','Java','PHP','React Native','Tailwind','Socket.io',
  'RAG','LLM APIs','MCP Server','Vector DB','Microservices','REST API','PWA','Electron',
];

const PROJECTS = [
  { t: 'mts-online.com', k: 'SAAS · HOSPITALITY' },
  { t: 'Okloop.io',      k: 'SAAS · VIDEO' },
  { t: 'Enquiry Tracker',k: 'CRM · EDUCATION' },
  { t: 'Kemsys kpix.io', k: 'IOT · ASSET MINING' },
  { t: 'Audtech',        k: 'PLATFORM · AUDIT' },
  { t: 'Paidia Gaming',  k: 'E-SPORT · PORTAL' },
  { t: 'OurApps',        k: 'ANALYTICS · POS' },
  { t: 'NEC Digital Card',k:'ENTERPRISE · CARDS' },
  { t: 'Telerain',       k: 'OMNICHANNEL · CRM' },
];

/* ---------- section states ----------
   corePos  : world position of the glowing core
   dust     : background particle opacity
   skills   : skill constellation weight
   ring     : project ring weight
   helix    : experience helix weight
   spread   : particle field spread
-------------------------------------------------- */
const STATES = {
  home:       { cam:[0,0,9.2],      look:[0,0,0],      core:1.00, dust:1.00, skills:0, ring:0, helix:0, spread:1,   corePos:[3.5,0.15,0] },
  about:      { cam:[2.6,0.4,8.0],  look:[0.3,0,0],    core:0.55, dust:0.75, skills:0, ring:0, helix:0.2, spread:1.5, corePos:[0,0,-7] },
  skills:     { cam:[0,0,13.0],     look:[0,0.4,0],    core:0.18, dust:0.30, skills:1, ring:0, helix:0, spread:0.6, corePos:[0,0,-6] },
  experience: { cam:[-2.8,0.6,8.4], look:[-0.3,0,0],   core:0.45, dust:0.65, skills:0, ring:0, helix:1, spread:1.2, corePos:[0,0,-8] },
  projects:   { cam:[0,0.4,11.4],   look:[0,0,0],      core:0.28, dust:0.45, skills:0, ring:1, helix:0, spread:0.8, corePos:[0,0,-7] },
  contact:    { cam:[0,-0.2,7.2],   look:[0,0,0],      core:0.40, dust:0.9, skills:0, ring:0, helix:0, spread:1.8, corePos:[0,0,-9] },
};
const ORDER = Object.keys(STATES);

function init() {
  /* ================= renderer ================= */
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias:true, alpha:true, powerPreference:'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 9.2);

  const clock = new THREE.Clock();

  /* ================= ambient light ================= */
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0x9d8bff, 1.4); key.position.set(4, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x00e5ff, 1.0); rim.position.set(-5, -2, -4); scene.add(rim);
  const fill = new THREE.PointLight(0xff4d9d, 24, 40); fill.position.set(0, 2, 5); scene.add(fill);

  /* =========================================================
     1. DUST PARTICLE FIELD
     ========================================================= */
  const DUST = 4200;
  const dustGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(DUST * 3);
  const dCol = new Float32Array(DUST * 3);
  const dSize = new Float32Array(DUST);
  const dPhase = new Float32Array(DUST);
  const tmpC = new THREE.Color();

  for (let i = 0; i < DUST; i++) {
    // wide spherical shell — kept far from the camera so points stay small
    const r = 9 + Math.pow(Math.random(), 0.7) * 19;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
    dPos[i*3+1] = r * Math.cos(ph) * 0.7;
    dPos[i*3+2] = r * Math.sin(ph) * Math.sin(th) * 0.9;

    const pick = Math.random();
    tmpC.copy(pick < 0.45 ? C.violet : pick < 0.78 ? C.cyan : pick < 0.93 ? C.pink : C.white);
    tmpC.multiplyScalar(0.30 + Math.random() * 0.5);
    dCol[i*3] = tmpC.r; dCol[i*3+1] = tmpC.g; dCol[i*3+2] = tmpC.b;

    dSize[i] = (Math.random() * 1.5 + 0.5) * (Math.random() < 0.06 ? 1.9 : 1);
    dPhase[i] = Math.random() * Math.PI * 2;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dustGeo.setAttribute('color',    new THREE.BufferAttribute(dCol, 3));
  dustGeo.setAttribute('aSize',    new THREE.BufferAttribute(dSize, 1));
  dustGeo.setAttribute('aPhase',   new THREE.BufferAttribute(dPhase, 1));

  const dustMat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, vertexColors:true,
    uniforms:{
      uTime:{ value:0 }, uPixelRatio:{ value:renderer.getPixelRatio() },
      uMouse:{ value:new THREE.Vector3(999,999,999) }, uStrength:{ value:1 },
      uOpacity:{ value:1 },
    },
    vertexShader:`
      attribute float aSize; attribute float aPhase;
      uniform float uTime, uPixelRatio, uStrength;
      uniform vec3 uMouse;
      varying vec3 vColor; varying float vFade;
      void main(){
        vColor = color;
        vec3 p = position;
        p.y += sin(uTime*0.42 + aPhase)*0.16;
        p.x += cos(uTime*0.31 + aPhase*1.3)*0.12;
        vec3 d = p - uMouse;
        float dist = length(d);
        float infl = smoothstep(3.4, 0.0, dist);
        p += normalize(d + vec3(0.0001)) * infl * 1.5 * uStrength;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float size = aSize * uPixelRatio * (52.0 / max(-mv.z, 0.1));
        gl_PointSize = clamp(size, 1.0, 5.5 * uPixelRatio);
        gl_Position = projectionMatrix * mv;
        vFade = smoothstep(60.0, 14.0, -mv.z) * smoothstep(1.5, 7.0, -mv.z);
      }`,
    fragmentShader:`
      uniform float uOpacity;
      varying vec3 vColor; varying float vFade;
      void main(){
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.08, d);
        gl_FragColor = vec4(vColor, a * vFade * uOpacity * 0.9);
      }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* =========================================================
     2. CORE — fresnel icosahedron + wireframe torus
     ========================================================= */
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  const coreMat = new THREE.ShaderMaterial({
    transparent:true, side:THREE.FrontSide, depthWrite:false,
    uniforms:{
      uTime:{ value:0 },
      uColorA:{ value:C.violet }, uColorB:{ value:C.cyan },
      uOpacity:{ value:1 },
    },
    vertexShader:`
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz); vP = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader:`
      uniform float uTime, uOpacity; uniform vec3 uColorA, uColorB;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){
        float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.4);
        float band = 0.5 + 0.5 * sin(vP.y*3.2 + uTime*1.3);
        vec3 col = mix(uColorA, uColorB, clamp(f*0.85 + band*0.28, 0.0, 1.0));
        float pulse = 0.86 + 0.14*sin(uTime*2.0);
        gl_FragColor = vec4(col*pulse, (0.02 + f*0.62) * uOpacity);
      }`,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.85, 4), coreMat);
  coreGroup.add(core);

  const coreWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.18, 1)),
    new THREE.LineBasicMaterial({ color:0x9d8bff, transparent:true, opacity:0 })
  );
  coreGroup.add(coreWire);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(2.25, 0.055, 180, 20),
    new THREE.MeshBasicMaterial({ color:0x00e5ff, transparent:true, opacity:0 })
  );
  coreGroup.add(knot);

  const knot2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.010, 6, 150),
    new THREE.MeshBasicMaterial({ color:0xff4d9d, transparent:true, opacity:0 })
  );
  knot2.rotation.x = Math.PI/2.6; knot2.rotation.z = 0.4;
  coreGroup.add(knot2);

  /* =========================================================
     3. SKILL CONSTELLATION
     ========================================================= */
  const skillGroup = new THREE.Group();
  skillGroup.visible = false;
  skillGroup.position.set(0, -4.0, 0);
  scene.add(skillGroup);

  const nodeGeo = new THREE.SphereGeometry(0.085, 16, 16);
  const nodeMats = [
    new THREE.MeshBasicMaterial({ color:C.violet }),
    new THREE.MeshBasicMaterial({ color:C.cyan }),
    new THREE.MeshBasicMaterial({ color:C.pink }),
  ];
  const labelCache = new Map();
  function labelTexture(text) {
    if (labelCache.has(text)) return labelCache.get(text);
    const pad = 18, fs = 46;
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.font = `600 ${fs}px 'Space Grotesk', sans-serif`;
    const w = Math.ceil(ctx.measureText(text).width) + pad*2;
    c.width = w; c.height = fs + pad*2;
    const g = c.getContext('2d');
    g.font = `600 ${fs}px 'Space Grotesk', sans-serif`;
    g.textBaseline = 'middle';
    const grd = g.createLinearGradient(0,0,w,0);
    grd.addColorStop(0,'#7c5cff'); grd.addColorStop(.5,'#00e5ff'); grd.addColorStop(1,'#ff4d9d');
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 3;
    g.strokeText(text, pad, c.height/2);
    g.fillStyle = grd; g.fillText(text, pad, c.height/2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    labelCache.set(text, tex);
    return tex;
  }
  const nodes = [];
  const R = 3.55;
  SKILLS.forEach((name, i) => {
    const fib = 2.399963;
    const y = 1 - (i / (SKILLS.length - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y*y));
    const theta = fib * i;
    const holder = new THREE.Group();
    holder.position.set(Math.cos(theta)*rad*R, y*R*0.92, Math.sin(theta)*rad*R);

    const m = new THREE.Mesh(nodeGeo, nodeMats[i % 3]);
    holder.add(m);

    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map:labelTexture(name), transparent:true, depthTest:false, depthWrite:false, opacity:0.5,
    }));
    spr.scale.set(1.35, 0.31, 1);
    spr.position.set(0, 0.33, 0);
    holder.add(spr);

    skillGroup.add(holder);
    nodes.push({ holder, mesh:m, spr, name, phase:Math.random()*Math.PI*2 });
  });

  /* =========================================================
     4. PROJECT RING (3D cards)
     ========================================================= */
  const ringGroup = new THREE.Group();
  ringGroup.visible = false;
  ringGroup.position.set(0, -3.4, 0);
  scene.add(ringGroup);

  function cardTexture(p, i) {
    const W = 640, H = 400;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0,0,W,H);
    const palettes = [
      ['#7c5cff','#00e5ff'],['#00e5ff','#b8ff5c'],['#ff4d9d','#7c5cff'],
      ['#7c5cff','#ff4d9d'],['#00e5ff','#7c5cff'],['#b8ff5c','#00e5ff'],
      ['#ff4d9d','#00e5ff'],['#a07cff','#b8ff5c'],['#00e5ff','#ff4d9d'],
    ];
    grd.addColorStop(0, palettes[i % palettes.length][0]);
    grd.addColorStop(1, palettes[i % palettes.length][1]);

    // dark glass body
    g.fillStyle = '#070a14'; g.fillRect(0,0,W,H);
    g.globalAlpha = .14; g.fillStyle = grd; g.fillRect(0,0,W,H); g.globalAlpha = 1;

    // soft corner glow
    const rg = g.createRadialGradient(W*0.5, H*0.5, 20, W*0.5, H*0.5, W*0.6);
    rg.addColorStop(0, 'rgba(255,255,255,.05)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0,0,W,H);

    // frame
    g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 2;
    g.strokeRect(18,18,W-36,H-36);

    // dim index
    g.fillStyle = 'rgba(255,255,255,.28)';
    g.font = "600 30px 'JetBrains Mono', monospace";
    g.fillText(String(i+1).padStart(2,'0'), 46, 84);

    // accent bar
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(46, H-72); g.lineTo(46+80, H-72); g.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  const cardGeo = new THREE.PlaneGeometry(2.9, 1.81);
  const cards = [];
  PROJECTS.forEach((p, i) => {
    const mat = new THREE.MeshBasicMaterial({
      map:cardTexture(p, i), transparent:true, opacity:0, side:THREE.DoubleSide,
    });
    const m = new THREE.Mesh(cardGeo, mat);
    const a = (i / PROJECTS.length) * Math.PI * 2;
    const Rr = 5.4;
    m.position.set(Math.cos(a)*Rr, 0, Math.sin(a)*Rr);
    m.lookAt(0,0,0);
    ringGroup.add(m);
    cards.push({ mesh:m, mat, angle:a });
  });

  /* =========================================================
     5. EXPERIENCE HELIX
     ========================================================= */
  const helixGroup = new THREE.Group();
  helixGroup.visible = false;
  scene.add(helixGroup);

  const helixPts = [];
  const TURNS = 3.2, HP = 190;
  for (let i = 0; i < HP; i++) {
    const t = i / (HP - 1);
    const a = t * Math.PI * 2 * TURNS;
    const r = 1.75;
    const y = (t - 0.5) * 6.2;
    helixPts.push(new THREE.Vector3(Math.cos(a)*r, y, Math.sin(a)*r));
    helixPts.push(new THREE.Vector3(Math.cos(a+Math.PI)*r, y, Math.sin(a+Math.PI)*r));
  }
  const helixGeo = new THREE.BufferGeometry().setFromPoints(helixPts);
  const helix = new THREE.Line(helixGeo, new THREE.LineBasicMaterial({
    color:0x7c5cff, transparent:true, opacity:0,
  }));
  helixGroup.add(helix);

  const rungGeo = new THREE.BufferGeometry();
  const rungPos = [];
  for (let i = 0; i < HP; i += 4) {
    const t = i / (HP - 1);
    const a = t * Math.PI * 2 * TURNS;
    const r = 1.75, y = (t - 0.5) * 6.2;
    rungPos.push(Math.cos(a)*r, y, Math.sin(a)*r, Math.cos(a+Math.PI)*r, y, Math.sin(a+Math.PI)*r);
  }
  rungGeo.setAttribute('position', new THREE.Float32BufferAttribute(rungPos, 3));
  const rungs = new THREE.LineSegments(rungGeo, new THREE.LineBasicMaterial({
    color:0x00e5ff, transparent:true, opacity:0,
  }));
  helixGroup.add(rungs);

  const helixDots = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints(
      Array.from({length:48}, (_,i) => {
        const t = i/47, a = t*Math.PI*2*TURNS, r = 1.75, y = (t-.5)*6.2;
        return new THREE.Vector3(Math.cos(a)*r, y, Math.sin(a)*r);
      })
    ),
    new THREE.PointsMaterial({ color:0xffffff, size:0.14, transparent:true, opacity:0 })
  );
  helixGroup.add(helixDots);

  /* =========================================================
     SCROLL / STATE MANAGEMENT
     ========================================================= */
  const sections = ORDER.map(id => document.getElementById(id)).filter(Boolean);
  const cur = {
    cam:new THREE.Vector3(0,0,9.2), look:new THREE.Vector3(0,0,0),
    core:1, dust:1, skills:0, ring:0, helix:0, spread:1,
    corePos:new THREE.Vector3(3.25,0.15,0),
  };
  const tgt = {
    core:1, dust:1, skills:0, ring:0, helix:0, spread:1,
    cam:new THREE.Vector3(0,0,9.2), look:new THREE.Vector3(0,0,0),
    corePos:new THREE.Vector3(3.25,0.15,0),
  };

  let active = 'home';
  function computeActive() {
    const mid = window.innerHeight * 0.42;
    let best = sections[0], bestD = Infinity;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.top + r.height/2 - mid);
      if (d < bestD) { bestD = d; best = s; }
    }
    return best ? best.id : 'home';
  }
  function setState(id) {
    const s = STATES[id]; if (!s) return;
    tgt.cam.set(s.cam[0], s.cam[1], s.cam[2]);
    tgt.look.set(s.look[0], s.look[1], s.look[2]);
    tgt.corePos.set(s.corePos[0], s.corePos[1], s.corePos[2]);
    tgt.core = s.core; tgt.dust = s.dust;
    tgt.skills = s.skills; tgt.ring = s.ring; tgt.helix = s.helix; tgt.spread = s.spread;
  }
  setState('home');

  /* mouse */
  const mouse = new THREE.Vector2(0,0);
  const mouseSmooth = new THREE.Vector2(0,0);
  window.addEventListener('pointermove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive:true });

  /* raycast helper for skill hover */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(-2,-2);
  let hovered = null;

  /* =========================================================
     ANIMATION LOOP
     ========================================================= */
  let raf = null, running = true, t = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;

    // ---- scroll state ----
    const id = computeActive();
    if (id !== active) { active = id; setState(id); }

    // ---- damping ----
    const k = 1 - Math.pow(0.0016, dt);
    cur.cam.lerp(tgt.cam, k);
    cur.look.lerp(tgt.look, k);
    cur.core += (tgt.core - cur.core) * k;
    cur.dust += (tgt.dust - cur.dust) * k;
    cur.skills += (tgt.skills - cur.skills) * k;
    cur.ring += (tgt.ring - cur.ring) * k;
    cur.helix += (tgt.helix - cur.helix) * k;
    cur.spread += (tgt.spread - cur.spread) * k;
    cur.corePos.lerp(tgt.corePos, k);

    // ---- mouse parallax ----
    mouseSmooth.lerp(mouse, 1 - Math.pow(0.004, dt));
    const px = mouseSmooth.x, py = mouseSmooth.y;

    // ---- camera ----
    camera.position.set(
      cur.cam.x + px * 0.55,
      cur.cam.y + py * 0.35,
      cur.cam.z
    );
    camera.lookAt(cur.look);

    // ---- dust ----
    dustMat.uniforms.uTime.value = t;
    dustMat.uniforms.uOpacity.value = cur.dust;
    dustMat.uniforms.uStrength.value = 0.6 + cur.core * 0.6;
    // project mouse onto z=0 plane in world space
    const mWorld = new THREE.Vector3(px * 7, py * 4.2, 0);
    dustMat.uniforms.uMouse.value.copy(mWorld);
    dust.rotation.y = t * 0.018 + px * 0.12;
    dust.rotation.x = py * 0.06;
    dust.scale.setScalar(0.85 + cur.spread * 0.25);

    // ---- core ----
    // on narrow screens the hero column is full width — pull the orb inwards
    const narrow = window.innerWidth < 900;
    const cx = narrow ? cur.corePos.x * 0.42 : cur.corePos.x;
    coreGroup.position.set(cx, cur.corePos.y, cur.corePos.z);
    core.rotation.y = t * 0.16;
    core.rotation.x = t * 0.07;
    coreMat.uniforms.uTime.value = t;
    coreMat.uniforms.uOpacity.value = cur.core * (narrow ? 0.8 : 1);
    core.scale.setScalar((0.6 + cur.core * 0.16) * (narrow ? 0.85 : 1));
    coreWire.rotation.y = -t * 0.1;
    coreWire.rotation.z = t * 0.06;
    coreWire.material.opacity = cur.core * 0.16;
    coreWire.visible = cur.core > 0.02;
    knot.rotation.x = t * 0.22; knot.rotation.y = t * 0.13;
    knot.material.opacity = cur.core * 0.45;
    knot.visible = cur.core > 0.02;
    knot2.rotation.z = t * 0.09;
    knot2.material.opacity = cur.core * 0.18;
    knot2.visible = cur.core > 0.02;
    coreGroup.visible = cur.core > 0.015;

    // ---- skill constellation ----
    skillGroup.visible = cur.skills > 0.01;
    if (skillGroup.visible) {
      skillGroup.rotation.y = t * 0.085;
      skillGroup.rotation.x = Math.sin(t * 0.25) * 0.14;
      const s = 0.55 + cur.skills * 0.45;
      skillGroup.scale.setScalar(s);
      nodes.forEach((n, i) => {
        const bob = Math.sin(t * 1.1 + n.phase) * 0.09;
        n.holder.position.y += bob * 0.02;
        const isHover = hovered && hovered.name === n.name;
        n.mesh.scale.setScalar(isHover ? 2.2 : 1 + Math.sin(t*2 + n.phase)*0.16);
        n.spr.material.opacity = cur.skills * (isHover ? 0.95 : 0.46);
        n.spr.scale.set(isHover ? 1.9 : 1.35, isHover ? 0.44 : 0.31, 1);
      });
      // hover raycast
      ndc.set(px, py);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(nodes.map(n => n.mesh), false);
      hovered = hits.length ? nodes.find(n => n.mesh === hits[0].object) : null;
    }

    // ---- project ring ----
    ringGroup.visible = cur.ring > 0.01;
    if (ringGroup.visible) {
      ringGroup.rotation.y = t * 0.1;
      cards.forEach((c, i) => {
        const a = c.angle + t * 0.1;
        const Rr = 5.4;
        c.mesh.position.set(Math.cos(a)*Rr, Math.sin(t*0.5 + i)*0.25, Math.sin(a)*Rr);
        c.mesh.lookAt(0, 0, 0);
        const front = Math.max(0, -Math.sin(a));
        c.mat.opacity = cur.ring * (0.08 + front * 0.4);
        c.mesh.scale.setScalar(0.85 + cur.ring * 0.25 + front * 0.14);
      });
    }

    // ---- helix ----
    helixGroup.visible = cur.helix > 0.01;
    if (helixGroup.visible) {
      helixGroup.rotation.y = t * 0.22;
      helixGroup.position.set(0, -1.2, -2.6);
      helix.material.opacity = cur.helix * 0.34;
      rungs.material.opacity = cur.helix * 0.16;
      helixDots.material.opacity = cur.helix * 0.6;
      helixDots.rotation.y = -t * 0.1;
    }

    renderer.render(scene, camera);
  }

  /* =========================================================
     RESIZE / VISIBILITY / EVENTS
     ========================================================= */
  let rzT = null;
  function onResize() {
    clearTimeout(rzT);
    rzT = setTimeout(() => {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      dustMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    }, 90);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { clock.getDelta(); }
  });

  /* expose a tiny API for the preloader */
  window.__threeReady = () => {
    canvas.classList.add('is-ready');
    // warm up
    renderer.compile(scene, camera);
  };

  if (reduced) {
    // static single frame
    t = 12; computeActive(); setState(active);
    cur.cam.copy(tgt.cam); cur.look.copy(tgt.look);
    cur.corePos.copy(tgt.corePos);
    cur.core = tgt.core; cur.dust = tgt.dust; cur.skills = tgt.skills;
    cur.ring = tgt.ring; cur.helix = tgt.helix; cur.spread = tgt.spread;
    renderer.render(scene, camera);
    canvas.classList.add('is-ready');
  } else {
    frame();
  }
}

/* =========================================================
     BOOTSTRAP (must run after all declarations above)
     ========================================================= */
if (!hasWebGL()) {
  canvas.style.display = 'none';
} else {
  try { init(); } catch (err) {
    console.warn('[3D] disabled:', err);
    canvas.style.display = 'none';
  }
}
