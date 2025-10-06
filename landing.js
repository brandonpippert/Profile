// Remove no-js class if JavaScript is enabled
document.documentElement.classList.remove('no-js');

// Show loading state initially
document.body.classList.add('loading');

/* ============================
 Theme Toggle - VISIBLE BUT DISABLED
 ============================ */
(function() {
const themeToggle = document.getElementById('themeToggle');

// Force dark mode permanently
document.documentElement.setAttribute('data-theme', 'dark');

// Theme toggle is disabled but shows a message when clicked
themeToggle.addEventListener('click', () => {
  // Simple console message instead of full functionality
  console.log('Theme toggle: Light mode infrastructure available but currently disabled');
  
  // Optional: Show a subtle indicator that it's disabled
  themeToggle.style.opacity = '0.4';
  setTimeout(() => {
    themeToggle.style.opacity = '0.6';
  }, 300);
});
})();

/* ============================
 Background Image Loading with Error Handling
 ============================ */
(function() {
const bgImage = new Image();
const startTime = performance.now();

bgImage.onload = function() {
  const loadTime = performance.now() - startTime;
  console.log(`Background image loaded in ${loadTime.toFixed(2)}ms`);
  document.body.classList.add('loaded');
  document.body.classList.remove('loading');
  
  // Start background zoom animation
  startBackgroundZoom();
};
bgImage.onerror = function() {
  console.warn('Background image failed to load, using fallback gradient');
  document.body.classList.remove('loading');
};
bgImage.src = 'https://i.imgur.com/s44cd43.png';
})();

/* ============================
 Background Zoom Animation
 ============================ */
function startBackgroundZoom() {
let scale = 1;
const maxScale = 1.05;
const duration = 60000;

function animateZoom(timestamp) {
  if (!startBackgroundZoom.startTime) startBackgroundZoom.startTime = timestamp;
  
  const progress = (timestamp - startBackgroundZoom.startTime) / duration;
  scale = 1 + (maxScale - 1) * Math.min(progress, 1);
  
  document.documentElement.style.setProperty('--background-scale', scale);
  
  if (progress < 1) {
    requestAnimationFrame(animateZoom);
  } else {
    // Reset and restart
    startBackgroundZoom.startTime = null;
    setTimeout(() => {
      document.documentElement.style.setProperty('--background-scale', 1);
      setTimeout(() => requestAnimationFrame(animateZoom), 1000);
    }, 1000);
  }
}

requestAnimationFrame(animateZoom);
}

/* ============================
 Scroll Progress Indicator
 ============================ */
function initScrollProgress() {
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollPercent = (scrollTop / documentHeight) * 100;
  
  scrollProgress.style.width = scrollPercent + '%';
});
}

/* ============================
 Throttle Utility Function
 ============================ */
function throttle(func, limit) {
let inThrottle;
return function() {
  const args = arguments;
  const context = this;
  if (!inThrottle) {
    func.apply(context, args);
    inThrottle = true;
    setTimeout(() => inThrottle = false, limit);
  }
}
}

/* ============================
 Debounce Utility Function
 ============================ */
function debounce(func, wait) {
let timeout;
return function executedFunction(...args) {
  const later = () => {
    clearTimeout(timeout);
    func(...args);
  };
  clearTimeout(timeout);
  timeout = setTimeout(later, wait);
};
}

/* ============================
 Dynamic Metrics Simulation
 ============================ */
function fetchMetrics() {
return new Promise(resolve => {
  setTimeout(() => {
    const commits = Math.floor(Math.random() * 10) + 8;
    const cost = (Math.random() * 10 + 15).toFixed(2);
    const deployments = Math.floor(Math.random() * 3) + 2;
    
    resolve({
      commits,
      cost,
      deployments
    });
  }, 500);
});
}

/* ============================
 Terminal Canvas — continuous scrolling with throttled metrics
 ============================ */
(() => {
const canvas = document.getElementById('termCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
let W=0, H=0, DPR=1;
let animationId;

let metricsUpdateCount = 0;
const MAX_METRICS_UPDATES = 5;

function size() {
  DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = innerWidth; H = innerHeight;
  canvas.width = W*DPR; canvas.height = H*DPR;
  canvas.style.width = W+'px'; canvas.style.height = H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
size(); 
addEventListener('resize', throttle(size, 100));

const STATIC_LINES = [
  // Infrastructure as Code
  "$ terraform plan -out=tfplan              # 12 to add, 3 to change, 1 to destroy",
  "$ terraform apply tfplan                  # Apply complete! Resources: 12 added",
  "$ terraform workspace new production      # Created and switched to workspace 'production'",
  "$ terraform state list                    # aws_ecs_service.main, aws_lb.listener...",
  "$ terraform import aws_s3_bucket.logs logs-bucket  # Import successful",
  
  // AWS CLI Operations
  "$ aws sts get-caller-identity             # arn:aws:iam::123456789:user/devops-admin",
  "$ aws ec2 describe-instances --filters 'Name=tag:Env,Values=prod'",
  "$ aws s3 sync ./dist s3://app-bucket/ --delete     # Uploaded 42 files",
  "$ aws cloudfront create-invalidation --distribution-id ABCD --paths '/*'",
  "$ aws ecs update-service --cluster main --service api --force-new-deployment",
  
  // Kubernetes & Container Operations
  "$ kubectl get pods -A                      # 18/18 pods ready, 3 nodes",
  "$ kubectl rollout status deployment/api    # deployment 'api' successfully rolled out",
  "$ kubectl logs -f deployment/api --tail=50 # [GIN] GET /health - 200",
  "$ helm upgrade --install api ./charts/api --namespace production",
  "$ docker build -t api:1.2.3 .             # Successfully built a1b2c3d4e5f6",
  "$ docker push registry.company.com/api:1.2.3 # Pushed 1.2.3 digest: sha256...",
  
  // CI/CD & Pipeline Operations
  "$ jenkins-job build platform/deploy-prod -p COMMIT=abc123",
  "$ gitlab-ci-tool trigger pipeline --project-id 42 --ref main",
  "$ github-actions dispatch workflow deploy-prod --inputs version=1.2.3",
  "$ argocd app sync production/api           # Sync operation completed",
  "$ flux reconcile source git platform       # Applied revision: main/abc123",
  
  // Monitoring & Observability
  "$ promtool check rules alert.rules.yml     # SUCCESS: 5 rules found",
  "$ grafana-cli admin reset-admin-password   # Admin password reset successfully",
  "$ kubectl top nodes                        # cpu: 45%, memory: 62%",
  "$ aws cloudwatch get-metric-statistics --namespace AWS/ECS...",
  
  // Security & Compliance
  "$ trivy image registry.company.com/api:1.2.3 # 0 CRITICAL, 2 HIGH vulnerabilities",
  "$ checkov -d . --quiet                     # Passed checks: 78, Failed checks: 2",
  "$ aws iam list-attached-user-policies --user-name ci-user",
  "$ vault read database/creds/app-role       # Successfully fetched credentials",
  
  // Database & Storage Operations
  "$ psql -h db.company.com -U app -d production -c 'SELECT version();'",
  "$ redis-cli -h cache.company.com INFO memory # used_memory_human: 128.45M",
  "$ aws rds describe-db-instances --filters 'Name=engine,Values=postgres'",
  
  // Network & DNS
  "$ dig api.company.com +short               # 10.0.1.45, 10.0.2.67",
  "$ nslookup loadbalancer.company.com        # Non-authoritative answer:",
  "$ aws route53 list-resource-record-sets --hosted-zone-id Z123456789",
  
  // Performance & Debugging
  "$ kubectl describe pod api-7c6d8f9b4-abc123 # Events: Pulled, Created, Started",
  "$ strace -p 18429 -c                       # % time seconds calls syscall",
  "$ tcpdump -i eth0 -c 100 port 80           # Capturing 100 packets",
  
  // Selective Quotes
  "# \"Talk is cheap. Show me the code.\" — Linus Torvalds",
  "# \"Any sufficiently advanced technology is indistinguishable from magic.\" — Arthur C. Clarke",
  "# \"First, solve the problem. Then, write the code.\" — John Johnson"
];

let LINES = [...STATIC_LINES];
let metricsLine = "# metrics today: 14 commits, $18.42 cloud cost, 5 deployments";

// Initialize with metrics
LINES.push(metricsLine);

// Update metrics with throttling
const updateMetrics = async () => {
  if (metricsUpdateCount >= MAX_METRICS_UPDATES) {
    return;
  }
  
  try {
    const metrics = await fetchMetrics();
    metricsLine = `# metrics today: ${metrics.commits} commits, $${metrics.cost} cloud cost, ${metrics.deployments} deployments`;
    
    const metricsIndex = LINES.findIndex(line => line.startsWith('# metrics today:'));
    if (metricsIndex !== -1) {
      LINES[metricsIndex] = metricsLine;
    }
    
    metricsUpdateCount++;
    
    if (metricsUpdateCount < MAX_METRICS_UPDATES) {
      setTimeout(updateMetrics, 10000);
    }
  } catch (error) {
    console.warn('Failed to fetch metrics:', error);
  }
};

// Start metrics updates
setTimeout(updateMetrics, 10000);

function nextLine() {
  return LINES[Math.floor(Math.random()*LINES.length)];
}

const history = [];
let typing = { text: nextLine(), shown:"", i:0 };
let scrollY = 0;
let scrollTarget = 0;

function startTyping(){
  typing = { text: nextLine(), shown:"", i:0 };
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = "#f9fafb"; // Always dark mode text
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textBaseline = "top";

  const typingY = H - 22;
  let y = typingY - 20 - history.length*20 - scrollY;
  for(let i=0;i<history.length;i++){
    const row=history[i];
    ctx.globalAlpha = row.startsWith("#") ? 0.6 : 0.5;
    ctx.fillText(row, 16, y + i*20);
  }
  ctx.globalAlpha = typing.text.startsWith("#") ? 0.7 : 0.6;
  const cursor = (Math.floor(performance.now()/400)%2) ? "▌" : "";
  ctx.fillText(typing.shown + cursor, 16, typingY);
  ctx.globalAlpha = 1;
}

let last = performance.now();
function loop(now){
  const dt = now - last; last = now;
  typing.i += dt/30;
  if (typing.i >= typing.text.length) {
    history.push(typing.text);
    if (history.length > 50) history.shift();
    scrollTarget += 20;
    startTyping();
  }
  typing.shown = typing.text.slice(0, typing.i);
  scrollY += (scrollTarget - scrollY) * 0.15;
  draw();
  animationId = requestAnimationFrame(loop);
}
loop(last);

return () => {
  if (animationId) cancelAnimationFrame(animationId);
};
})();

/* ============================
 Particle Text — white with glow
 ============================ */
(() => {
const canvas = document.getElementById('nameParticles');
const ctx = canvas.getContext('2d', { alpha: true });
let W=0,H=0,DPR=1;
let animationId;

function size(){ 
  DPR=Math.max(1,Math.min(2,devicePixelRatio||1));
  W=innerWidth;H=innerHeight;
  canvas.width=W*DPR;canvas.height=H*DPR;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
size(); 
addEventListener('resize', throttle(() => { size(); rebuild(); }, 100));

const title=document.getElementById('titleText');
const off=document.createElement('canvas');
const offCtx=off.getContext('2d');

function rasterize(){
  const cs=getComputedStyle(title);
  const font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  off.width=title.offsetWidth+50;
  off.height=title.offsetHeight+50;
  offCtx.clearRect(0,0,off.width,off.height);
  offCtx.font=font;
  offCtx.fillStyle='#fff';
  offCtx.textBaseline='top';
  offCtx.fillText(title.textContent,25,0);
}

class Particle{
  constructor(x,y){
    this.baseX=x;
    this.baseY=y;
    this.x=x;
    this.y=y;
    this.vx=0;
    this.vy=0;
    if (window.innerWidth < 520) {
      this.size = 1;
    } else if (window.innerWidth < 768) {
      this.size = 1.2;
    } else {
      this.size = 1.5;
    }
  }
  draw(c){
    c.fillStyle = "rgba(255,255,255,0.85)"; // Always white for dark mode
    c.shadowColor = "rgba(255,255,255,0.75)";
    c.shadowBlur=6;
    c.beginPath();
    c.arc(this.x,this.y,this.size,0,Math.PI*2);
    c.fill();
    c.shadowBlur=0;
  }
  update(dt,mx,my){
    const dx=mx-this.x,dy=my-this.y;
    const dist=Math.hypot(dx,dy)||1;
    const R=180;
    if(dist<R){
      const f=(R-dist)/R;
      this.vx+=(-dx/dist)*f*0.24;
      this.vy+=(-dy/dist)*f*0.24;
    }
    this.vx+=(this.baseX-this.x)*0.03;
    this.vy+=(this.baseY-this.y)*0.03;
    this.vx*=0.92;this.vy*=0.92;
    this.x+=this.vx*(dt*0.06);
    this.y+=this.vy*(dt*0.06);
  }
}

let particles=[];
function rebuild(){
  rasterize();
  const img=offCtx.getImageData(0,0,off.width,off.height).data;
  particles=[];
  
  let STEP;
  if (window.innerWidth < 520) {
    STEP = 8;
  } else if (window.innerWidth < 768) {
    STEP = 6;
  } else {
    STEP = 4;
  }
  
  for(let y=0;y<off.height;y+=STEP){
    for(let x=0;x<off.width;x+=STEP){
      const a=img[(y*off.width+x)*4+3];
      if(a>128) particles.push(new Particle(title.offsetLeft+x-25,title.offsetTop+y));
    }
  }
}

document.fonts.ready.then(rebuild);
rebuild();

const mouse={x:-9999,y:-9999};
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});

let last=performance.now();
function frame(now){
  const dt=now-last;last=now;
  ctx.clearRect(0,0,W,H);
  for(const p of particles){p.update(dt,mouse.x,mouse.y);p.draw(ctx);}
  animationId = requestAnimationFrame(frame);
}
frame(last);

return () => {
  if (animationId) cancelAnimationFrame(animationId);
};
})();

/* ============================
 Analytics and Performance Monitoring
 ============================ */
window.addEventListener('load', function() {
const loadTime = performance.now();
console.log(`Page loaded in ${loadTime}ms`);

// Initialize scroll progress
initScrollProgress();

document.addEventListener('click', function(e) {
  if (e.target.closest('.btn')) {
    const btn = e.target.closest('.btn');
    console.log(`Button clicked: ${btn.textContent.trim()}`);
  }
});
});
