  // Namespace everything to avoid globals
  window.bpDash = (function() {
    'use strict';
    
    // State management with versioning
    const STATE_KEY = 'bp_dash_v1';
    
    // Single tooltip instance
    const tooltip = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'heatmap-tooltip' }));
    
    function showTooltip(e, text) {
      const rect = e.target.getBoundingClientRect();
      tooltip.textContent = text;
      tooltip.style.left = `${rect.left + window.scrollX}px`;
      tooltip.style.top  = `${rect.top  + window.scrollY - 30}px`;
      tooltip.style.opacity = '1';
    }
    function hideTooltip() { tooltip.style.opacity = '0'; }
    
    // Toast helper
    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    // Clipboard helper
    async function copyText(selector){
      try{
        const el = document.querySelector(selector);
        await navigator.clipboard.writeText(el.textContent.trim());
        showToast('Copied to clipboard');
      }catch(e){ showToast('Copy failed'); }
    }

    // Quick commands copy helper
    async function copyCommand(command) {
      try {
        await navigator.clipboard.writeText(command);
        showToast(`Copied: ${command}`);
      } catch(e) { 
        showToast('Copy failed'); 
      }
    }
    
    // Theme management
    function initTheme() {
      const themeToggle = document.getElementById('themeToggle');
      const savedState = getStoredState();
      const savedTheme = savedState?.theme || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      themeToggle?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        saveToState({ theme: newTheme });
      });
    }
    
    // State persistence
    function getStoredState() {
      try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; } catch { return {}; }
    }
    function saveToState(updates) {
      try {
        const current = getStoredState();
        localStorage.setItem(STATE_KEY, JSON.stringify({ ...current, ...updates }));
      } catch (e) { console.warn('Could not save state:', e); }
    }
    
    // Progress circles using SVG
    function initProgressCircles() {
      const skills = [
        { id: 'aws-progress', percent: 82 },
        { id: 'linux-progress', percent: 88 },
        { id: 'devops-progress', percent: 78 },
        { id: 'js-progress', percent: 85 }
      ];
      skills.forEach(skill => {
        const circle = document.getElementById(skill.id);
        if (circle) {
          const radius = 15.9155;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (skill.percent / 100) * circumference;
          circle.style.strokeDasharray = `${circumference} ${circumference}`;
          circle.style.strokeDashoffset = offset;
        }
      });
    }
    
    // Breathing Orb functionality with robust pause
    function initBreathingOrb() {
      // DOM Elements
      const orb = document.getElementById('orb');
      const pulse1 = document.getElementById('pulse1');
      const pulse2 = document.getElementById('pulse2');
      const pulse3 = document.getElementById('pulse3');
      const instruction = document.getElementById('instruction');
      const phaseText = document.getElementById('phaseText');
      const countdown = document.getElementById('countdown');
      const muteBtn = document.getElementById('muteBtn');
      const pauseBtn = document.getElementById('pauseBtn');
      const volumeSlider = document.getElementById('volumeSlider');

      const settings = { prePhasePause: 500, inhaleDuration: 4000, exhaleDuration: 6000, cycleDuration: 11000 };
      let currentPhase = 'pre-inhale';
      let animationId = null; let startTime = null; let isMuted = true; let isPaused = false; let currentVolume = 0.3; let countdownInterval = null; let pausedTime = 0; let pauseStartedAt = null;

      function startCountdown(phase) {
        clearInterval(countdownInterval);
        let counter = phase === 'inhale' ? 4 : 6; countdown.textContent = counter;
        countdownInterval = setInterval(() => {
          counter--; countdown.textContent = counter > 0 ? counter : '';
          if (counter <= 0) { clearInterval(countdownInterval); }
          else { countdown.style.transform = 'scale(1.2)'; setTimeout(() => countdown.style.transform = 'scale(1)', 200); }
        }, 1000);
      }
      function ease(t){ return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2; }
      function animate(ts) {
        if (!startTime) startTime = ts; const elapsed = ts - startTime - pausedTime; const cycleTime = elapsed % settings.cycleDuration;
        if (isPaused) { animationId = requestAnimationFrame(animate); return; }
        if (cycleTime < settings.prePhasePause) { if (currentPhase !== 'pre-inhale') currentPhase = 'pre-inhale'; }
        else if (cycleTime < settings.prePhasePause + settings.inhaleDuration) { if (currentPhase !== 'inhale') { currentPhase = 'inhale'; phaseText.textContent = 'Breathe in'; instruction.style.opacity = 0; startCountdown('inhale'); setTimeout(() => instruction.style.opacity = 1, 100); orb.style.boxShadow = '0 0 25px 5px rgba(37, 99, 235, 0.3), 0 0 50px 10px rgba(124, 58, 237, 0.2), inset 0 4px 20px rgba(255, 255, 255, 0.4)'; pulse1.style.width = pulse1.style.height = '80px'; pulse2.style.width = pulse2.style.height = '80px'; pulse3.style.width = pulse3.style.height = '80px'; pulse1.style.opacity = pulse2.style.opacity = pulse3.style.opacity = '0'; }
          const p = ease((cycleTime - settings.prePhasePause) / settings.inhaleDuration); orb.style.transform = `scale(${0.8 + p * 0.4})`; orb.style.filter = `brightness(${1 + p * 0.2})`; pulse1.style.width = pulse1.style.height = `${80 + p * 120}px`; pulse1.style.opacity = `${0.8 * Math.min(1, p * 1.5)}`; pulse2.style.width = pulse2.style.height = `${80 + p * 180}px`; pulse2.style.opacity = `${0.6 * Math.max(0, p - 0.1)}`; pulse3.style.width = pulse3.style.height = `${80 + p * 240}px`; pulse3.style.opacity = `${0.4 * Math.max(0, p - 0.2)}`; instruction.style.transform = `scale(${1 + p * 0.05})`; }
        else if (cycleTime < settings.prePhasePause + settings.inhaleDuration + settings.prePhasePause) { if (currentPhase !== 'pre-exhale') currentPhase = 'pre-exhale'; }
        else { if (currentPhase !== 'exhale') { currentPhase = 'exhale'; phaseText.textContent = 'Breathe out'; instruction.style.opacity = 0; startCountdown('exhale'); setTimeout(() => instruction.style.opacity = 1, 100); orb.style.boxShadow = '0 0 20px 3px rgba(37, 99, 235, 0.2), 0 0 40px 6px rgba(124, 58, 237, 0.1), inset 0 4px 15px rgba(255, 255, 255, 0.3)'; }
          const p = ease((cycleTime - (settings.prePhasePause + settings.inhaleDuration + settings.prePhasePause)) / settings.exhaleDuration); orb.style.transform = `scale(${1.2 - p * 0.4})`; orb.style.filter = `brightness(${1.2 - p * 0.2})`; pulse1.style.opacity = `${0.8 * (1 - p * 1.2)}`; pulse2.style.opacity = `${0.6 * (1 - Math.min(1, p * 1.5))}`; pulse3.style.opacity = `${0.4 * (1 - Math.min(1, p * 2))}`; instruction.style.transform = `scale(${1.05 - p * 0.05})`; }
        animationId = requestAnimationFrame(animate);
      }
      function togglePause() {
        isPaused = !isPaused; const icon = pauseBtn.querySelector('i'); icon.className = isPaused ? 'fas fa-play' : 'fas fa-pause';
        if (isPaused) { pauseStartedAt = performance.now(); clearInterval(countdownInterval); }
        else { if (pauseStartedAt) { pausedTime += performance.now() - pauseStartedAt; pauseStartedAt = null; } }
      }
      function toggleMute() { isMuted = !isMuted; const icon = muteBtn.querySelector('i'); icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'; }
      function updateVolume(v) { currentVolume = v; }
      function startAnimation() { startTime = performance.now(); animationId = requestAnimationFrame(animate); }
      document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(animationId); clearInterval(countdownInterval); } else { if (!isPaused) { startTime = performance.now(); animationId = requestAnimationFrame(animate); } } });
      muteBtn.addEventListener('click', toggleMute); pauseBtn.addEventListener('click', togglePause); volumeSlider.addEventListener('input', (e) => updateVolume(parseFloat(e.target.value)));
      startAnimation();
    }
    
    // Notes functionality
    function initNotes() {
      const textarea = document.getElementById('notesTextarea');
      const charCount = document.getElementById('charCount');
      const savedNote = localStorage.getItem('bp_dash_note');
      if (savedNote) textarea.value = savedNote;
      function updateCharCount() {
        const count = textarea.value.length; charCount.textContent = `${count}/500`;
        if (count > 490) { charCount.style.color = 'var(--error)'; }
        else if (count > 450) { charCount.style.color = 'var(--warning)'; }
        else { charCount.style.color = 'var(--muted)'; }
      }
      textarea.addEventListener('input', updateCharCount); updateCharCount();
    }
    function saveNote() { const textarea = document.getElementById('notesTextarea'); if (textarea.value.length > 500) { showToast('Note too long! Max 500 characters.'); return; } localStorage.setItem('bp_dash_note', textarea.value); showToast('Note saved!'); }
    
    // AI Assistant
    function initAIAssistant() {
      const aiToggle = document.getElementById('aiToggle');
      const aiPanel = document.getElementById('aiPanel');
      const aiInput = document.getElementById('aiInput');
      aiToggle.addEventListener('click', () => {
        const isExpanded = aiPanel.classList.toggle('show'); aiToggle.setAttribute('aria-expanded', isExpanded.toString());
        if (isExpanded) { document.getElementById('aiUnread').style.display = 'none'; }
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aiPanel.classList.contains('show')) { aiPanel.classList.remove('show'); aiToggle.setAttribute('aria-expanded', 'false'); } });
      aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { sendAIMessage(); } });
    }
    async function sendAIMessage() {
      const input = document.getElementById('aiInput'); const messages = document.getElementById('aiMessages'); const message = input.value.trim(); if (!message) return;
      const userMessage = document.createElement('div'); userMessage.className = 'ai-message user'; userMessage.textContent = message; messages.appendChild(userMessage); input.value = ''; messages.scrollTop = messages.scrollHeight;
      const typingIndicator = document.createElement('div'); typingIndicator.className = 'ai-message bot'; typingIndicator.textContent = 'Thinking...'; typingIndicator.id = 'typing-indicator'; messages.appendChild(typingIndicator); messages.scrollTop = messages.scrollHeight;
      try { const response = await simulateAIResponse(message); document.getElementById('typing-indicator')?.remove(); const botMessage = document.createElement('div'); botMessage.className = 'ai-message bot'; botMessage.textContent = response; messages.appendChild(botMessage); }
      catch { document.getElementById('typing-indicator')?.remove(); const errorMessage = document.createElement('div'); errorMessage.className = 'ai-message bot'; errorMessage.textContent = 'Sorry, I encountered an error. Please try again.'; messages.appendChild(errorMessage); }
      messages.scrollTop = messages.scrollHeight;
    }
    async function simulateAIResponse(message) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      if (/cost|expensive/i.test(message)) {
        return 'Based on your current usage, I recommend reviewing Lambda memory settings. Moving from 128MB to 256MB could reduce execution time by ~40% and save ~$12/month.';
      } else if (/security/i.test(message)) {
        return 'Consider enabling AWS WAF on CloudFront. It protects against common web exploits and costs about $5/month plus $1 per million requests.';
      } else if (/learn|study/i.test(message)) {
        return 'Your foundation looks solid. Double down on container orchestration with ECS/EKS next to align with SRE/DevOps roles.';
      } else if (/lambda|function/i.test(message)) {
        return 'You have 52 Lambda invocations this week with 100% success rate. Try provisioned concurrency to minimize cold starts.';
      } else if (/deploy|rollout|release/i.test(message)) {
        return 'Your deployment frequency has improved by 15% this month. Consider implementing blue-green deployments for zero-downtime releases. Current lead time: 2.3 hours.';
      } else {
        return `I hear you asking about "${message}". I can help with cost optimizations, security, learning paths, and performance tuning. What area do you want to drill into?`;
      }
    }
    
    // Create charts with Chart.js - FIXED to prevent stretching
    function createCharts(data) {
      if (typeof Chart === 'undefined') return;
      
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      const chartConfig = {
        type: 'bar',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { 
              display: false,
              grid: { display: false }
            },
            y: { 
              display: false, 
              beginAtZero: true,
              grid: { display: false }
            }
          },
          animation: { duration: 1000 },
          layout: {
            padding: {
              left: 2,
              right: 2,
              top: 2,
              bottom: 2
            }
          }
        }
      };

      // Commits chart
      new Chart(document.getElementById('commits-chart'), {
        ...chartConfig,
        data: {
          labels: days,
          datasets: [{
            data: data.commitTrend,
            backgroundColor: '#2563eb',
            borderColor: '#2563eb',
            borderWidth: 0,
            borderRadius: 2,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }]
        }
      });

      // Lambda chart
      new Chart(document.getElementById('lambda-chart'), {
        ...chartConfig,
        data: {
          labels: days,
          datasets: [{
            data: data.lambdaTrend,
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 0,
            borderRadius: 2,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }]
        }
      });

      // Learning chart
      new Chart(document.getElementById('learning-chart'), {
        ...chartConfig,
        data: {
          labels: days,
          datasets: [{
            data: data.learningTrend,
            backgroundColor: '#7c3aed',
            borderColor: '#7c3aed',
            borderWidth: 0,
            borderRadius: 2,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }]
        }
      });

      // Projects chart
      new Chart(document.getElementById('projects-chart'), {
        ...chartConfig,
        data: {
          labels: days,
          datasets: [{
            data: data.projectTrend,
            backgroundColor: '#f59e0b',
            borderColor: '#f59e0b',
            borderWidth: 0,
            borderRadius: 2,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }]
        }
      });
    }
    
    // SLO Chart - FIXED to prevent stretching
    function createSLOChart() {
      if (typeof Chart === 'undefined') return;
      
      const ctx = document.getElementById('sloChart');
      if (!ctx) return;
      
      // Generate realistic SLO data
      const days = Array.from({length: 30}, (_, i) => `${i + 1}`);
      
      let baseline = 99.8;
      const availability = Array.from({length: 30}, (_, i) => {
        const variation = (Math.random() * 0.3) - 0.15;
        const trend = i > 20 ? -0.02 * (i - 20) : 0;
        return Math.max(99.0, Math.min(100, baseline + variation + trend));
      });

      availability[29] = 99.85;
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [{
            label: 'Availability %',
            data: availability,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Availability: ${context.parsed.y.toFixed(3)}%`;
                }
              }
            }
          },
          scales: {
            x: { 
              display: false,
              grid: { display: false }
            },
            y: {
              min: 99.0,
              max: 100.0,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              },
              grid: { 
                color: 'rgba(255, 255, 255, 0.1)',
                drawBorder: false
              }
            }
          },
          animation: { duration: 1000 },
          layout: {
            padding: {
              left: 5,
              right: 5,
              top: 5,
              bottom: 5
            }
          }
        }
      });
    }
    
    // Real data integration (mocked)
    async function fetchMetrics() {
      try {
        const response = await simulateAPICall();
        document.getElementById('commits-count').textContent = response.commits;
        document.getElementById('lambda-invocations').textContent = response.lambdaInvocations;
        document.getElementById('learning-hours').textContent = response.learningHours.toFixed(1);
        document.getElementById('projects-completed').textContent = response.projectsCompleted;
        document.getElementById('current-month-cost').textContent = `$${response.currentMonthCost}`;
        document.getElementById('last-month-cost').textContent = `$${response.lastMonthCost}`;
        const costChange = ((response.lastMonthCost - response.currentMonthCost) / response.lastMonthCost * 100).toFixed(1);
        const costElement = document.getElementById('cost-change');
        if (costChange > 0) { costElement.innerHTML = `<i class="fas fa-arrow-down" style="color:var(--success);"></i> ${costChange}% decrease`; }
        else { costElement.innerHTML = `<i class=\"fas fa-arrow-up\" style=\"color:var(--error);\"></i> ${Math.abs(costChange)}% increase`; }
        // Use charts instead of sparklines
        createCharts(response);
      } catch (error) { console.error('Failed to fetch metrics:', error); showToast('⚠️ Could not load live metrics'); }
    }
    async function simulateAPICall() {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { commits: 14, lambdaInvocations: 52, learningHours: 9.2, projectsCompleted: 3, currentMonthCost: 18.42, lastMonthCost: 23.17, commitTrend: [3,5,7,2,8,4,6], lambdaTrend: [12,15,8,10,5,9,13], learningTrend: [1.2,1.8,0.9,1.5,2.1,1.3,1.7], projectTrend: [0,1,0,1,0,0,1] };
    }
    
    // GitHub Heatmap (mocked pattern)
    function generateHeatmap() {
      const heatmap = document.getElementById('heatmap');
      const today = new Date(); const startDate = new Date(); startDate.setDate(today.getDate() - 364);
      const activityData = {}; let currentDate = new Date(startDate);
      while (currentDate <= today) { const dateStr = currentDate.toISOString().split('T')[0]; const dayOfWeek = currentDate.getDay(); const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; const base = isWeekend ? 0.3 : 0.7; const random = Math.random(); activityData[dateStr] = random < base ? Math.floor(Math.random() * 4) + 1 : 0; currentDate.setDate(currentDate.getDate() + 1); }
      for (let i = 0; i < 364; i++) { const day = document.createElement('div'); day.className = 'heatmap-day'; const date = new Date(startDate); date.setDate(date.getDate() + i); const dateStr = date.toISOString().split('T')[0]; const level = activityData[dateStr] || 0; if (level > 0) day.setAttribute('data-level', level); day.addEventListener('mouseover', (e) => { showTooltip(e, `${dateStr}: ${level} commits`); }); day.addEventListener('mouseout', hideTooltip); heatmap.appendChild(day); }
    }

    // Incidents (mock) + AI unread dot
    function loadIncidents() {
      const data = [
        {id:'INC-1042', sev:'high', title:'Healthcheck failed: api.prod', started:'2025-10-05 14:22', status:'open'},
        {id:'INC-1041', sev:'med',  title:'Elevated 5xx: edge-lb',      started:'2025-10-04 09:10', status:'resolved'}
      ];
      const container = document.getElementById('incidents-list'); container.innerHTML = '';
      let hasOpen = false;
      data.forEach(inc => {
        const div = document.createElement('div'); div.className = `incident ${inc.sev}`;
        div.innerHTML = `
          <div>
            <div style="font-weight:600">${inc.title}</div>
            <div class="incident-meta">${inc.id} · ${inc.started} · ${inc.status}</div>
          </div>
          <div class="incident-actions">
            <button class="runbook-btn" onclick="bpDash.openRunbook('${inc.id}')"><i class="fas fa-book"></i> Runbook</button>
            <button class="runbook-btn" onclick="bpDash.aiSummarizeIncident('${inc.id}')"><i class="fas fa-robot"></i> AI Summary</button>
          </div>`;
        container.appendChild(div);
        if (inc.status === 'open') hasOpen = true;
      });
      if (hasOpen) document.getElementById('aiUnread').style.display = 'block';
    }
    function openRunbook(id){ showToast(`Opening runbook for ${id}…`); }
    async function aiSummarizeIncident(id){ showToast(`Generating AI summary for ${id}…`); const messages = document.getElementById('aiMessages'); const bot = document.createElement('div'); bot.className='ai-message bot'; bot.textContent = `Incident ${id}: probable root cause is cold start + throttling; next step: add provisioned concurrency & circuit breaker.`; messages.appendChild(bot); messages.scrollTop = messages.scrollHeight; }

    // Feature flags (mock)
    function loadFlags(){
      const flags=[ {key:'new_pricing', env:'prod', on:true,  desc:'New pricing page rollout'}, {key:'beta_ai', env:'dev',  on:false, desc:'AI Assistant beta'} ];
      const list=document.getElementById('flags-list'); list.innerHTML='';
      flags.forEach(f=>{ const row=document.createElement('div'); row.style.display='grid'; row.style.gridTemplateColumns='1fr auto'; row.style.alignItems='center'; row.style.border='1px solid var(--line)'; row.style.borderRadius='8px'; row.style.padding='.6rem .8rem'; row.innerHTML = `
          <div>
            <div style="font-weight:600">${f.key} <span style="color:var(--muted)">· ${f.env}</span></div>
            <div style="font-size:.85rem;color:var(--muted)">${f.desc}</div>
          </div>
          <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
            <span>${f.on ? 'On' : 'Off'}</span>
            <input type="checkbox" ${f.on?'checked':''} onchange="bpDash.toggleFlag('${f.key}','${f.env}',this.checked)">
          </label>`; list.appendChild(row); });
    }
    function toggleFlag(key, env, on){ showToast(`${key} (${env}) → ${on?'On':'Off'}`); }

    // API Keys & Webhook
    function renderKeys(){ const ks = JSON.parse(localStorage.getItem('bp_keys')||'[]'); const box = document.getElementById('keys'); box.innerHTML=''; ks.forEach(k=>{ const row=document.createElement('div'); row.style.display='grid'; row.style.gridTemplateColumns='1fr auto auto'; row.style.gap='.5rem'; row.innerHTML=`<code style="overflow:hidden;text-overflow:ellipsis">${k.masked}</code><button class="btn" onclick="navigator.clipboard.writeText('${k.plain}').then(()=>bpDash.showToast('Copied!'))"><i class='fas fa-copy'></i> Copy</button><button class="btn" onclick="bpDash.revokeKey('${k.id}')"><i class='fas fa-trash'></i></button>`; box.appendChild(row); }); }
    function createKey(){ const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()); const plain = `sk_${id.replace(/-/g,'').slice(0,24)}`; const masked = plain.slice(0,6)+'••••••••••'+plain.slice(-4); const ks = JSON.parse(localStorage.getItem('bp_keys')||'[]'); ks.push({id, plain, masked}); localStorage.setItem('bp_keys', JSON.stringify(ks)); renderKeys(); showToast('API key created'); }
    function revokeKey(id){ const ks = JSON.parse(localStorage.getItem('bp_keys')||'[]').filter(k=>k.id!==id); localStorage.setItem('bp_keys', JSON.stringify(ks)); renderKeys(); showToast('Revoked'); }
    
    // Webhook functions with new features
    async function sendTestWebhook(){ 
      const url = document.getElementById('whUrl').value.trim();
      const payloadTextarea = document.getElementById('whPayload');
      const payload = payloadTextarea ? payloadTextarea.value : '{"test": true}';
      const term = document.getElementById('webhookTerminal');
      
      if (!url) return showToast('Enter a URL');
      
      term.innerHTML += `<div class="terminal-line"><span class="terminal-prompt">$</span> <span class="terminal-command">POST ${url}</span></div>`;
      term.innerHTML += `<div class="terminal-line"><span class="terminal-output">Payload: ${payload.substring(0, 100)}${payload.length > 100 ? '...' : ''}</span></div>`;
      
      await new Promise(r=>setTimeout(r,700)); 
      term.innerHTML += `<div class='terminal-line'><span class='terminal-output'>200 OK — delivered test payload</span></div>`; 
      term.scrollTop = term.scrollHeight; 
    }
    
    function clearWebhookTerminal() {
      const terminal = document.getElementById('webhookTerminal');
      if (terminal) {
        terminal.innerHTML = '';
        showToast('Terminal cleared');
      }
    }
    
    // SLOs
    function renderSLO(){ 
      const sloTarget = 99.9, periodDays = 30; 
      const achieved = 99.85; 
      const budget = (100 - sloTarget) * periodDays * 24 * 60; 
      const burned = ((100 - achieved) * periodDays * 24 * 60); 
      const remaining = Math.max(0, Math.round(budget - burned)); 
      const box = document.getElementById('sloBox'); 
      box.innerHTML = `
        <div class="stat-card"><div class="stat-number" style="color:var(--brand)">${achieved.toFixed(3)}%</div><div class="stat-label">Availability (last ${periodDays}d)</div></div>
        <div class="stat-card"><div class="stat-number" style="color:${remaining>0?'var(--success)':'var(--error)'}">${remaining}m</div><div class="stat-label">Error Budget Remaining</div></div>`;
    }

    // Recent Deployments
    function loadDeployments() {
      const deployments = [
        { id: 'DEP-782', service: 'api-gateway', env: 'prod', status: 'success', time: '2 hours ago', version: 'v1.2.3' },
        { id: 'DEP-781', service: 'user-service', env: 'staging', status: 'success', time: '5 hours ago', version: 'v2.1.0' },
        { id: 'DEP-780', service: 'auth-service', env: 'prod', status: 'success', time: '1 day ago', version: 'v1.5.2' },
        { id: 'DEP-779', service: 'payment-api', env: 'dev', status: 'rolling', time: '2 days ago', version: 'v3.0.1' }
      ];

      const container = document.getElementById('deployments-list');
      if (!container) return;

      container.innerHTML = '';
      deployments.forEach(deploy => {
        const div = document.createElement('div');
        div.style.cssText = 'display: grid; grid-template-columns: 1fr auto; align-items: center; border: 1px solid var(--line); border-radius: 8px; padding: 0.75rem;';
        
        const statusColor = deploy.status === 'success' ? 'var(--success)' : 
                          deploy.status === 'rolling' ? 'var(--warning)' : 'var(--error)';
        
        div.innerHTML = `
          <div>
            <div style="font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.7rem; background: var(--chip); color: var(--muted); padding: 0.1rem 0.4rem; border-radius: 4px;">${deploy.env}</span>
              ${deploy.service}
            </div>
            <div style="font-size: 0.85rem; color: var(--muted); margin-top: 0.2rem;">
              ${deploy.version} · ${deploy.time}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></div>
            <span style="font-size: 0.8rem; text-transform: capitalize;">${deploy.status}</span>
          </div>
        `;
        container.appendChild(div);
      });
    }

    // Infrastructure Health Metrics
    function loadInfrastructureHealth() {
      // Mock infrastructure data
      const healthData = {
        cpu: '24%',
        memory: '67%', 
        disk: '125 IOPS',
        network: '42ms'
      };

      document.getElementById('cpu-utilization').textContent = healthData.cpu;
      document.getElementById('memory-usage').textContent = healthData.memory;
      document.getElementById('disk-io').textContent = healthData.disk;
      document.getElementById('network-latency').textContent = healthData.network;
    }

    // Keyboard shortcuts help
    function initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          document.getElementById('shortcutsModal').classList.add('show');
        }
      });
    }

    // Initialize everything
    function init() {
      document.getElementById('year').textContent = new Date().getFullYear();
      initTheme(); initAIAssistant(); initBreathingOrb(); initNotes(); generateHeatmap(); fetchMetrics(); initProgressCircles();
      loadIncidents(); loadFlags(); renderKeys(); renderSLO();
      loadDeployments(); loadInfrastructureHealth(); initKeyboardShortcuts();
      initAdminProtection();
      
      // Initialize charts
      if (typeof Chart !== 'undefined') {
        createSLOChart();
      }
      
      Object.assign(window.bpDash, { 
        openRunbook, 
        aiSummarizeIncident, 
        toggleFlag, 
        createKey, 
        revokeKey, 
        sendTestWebhook, 
        clearWebhookTerminal,
        showToast, 
        sendAIMessage, 
        saveNote, 
        copyText, 
        copyCommand 
      });
    }
    
    // Admin link pseudo-protection (demo only)
    function initAdminProtection(){
      const link = document.getElementById('adminLink');
      const modal = document.getElementById('authModal');
      const passInput = document.getElementById('adminPassInput');
      const submitBtn = document.getElementById('authSubmitBtn');
      const cancelBtn = document.getElementById('authCancelBtn');
      function open(){ modal.classList.add('show'); modal.removeAttribute('aria-hidden'); passInput.value=''; passInput.focus(); }
      function close(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }
      async function submit(){
        const expected = localStorage.getItem('bp_admin_pass') || 'letmein';
        if(passInput.value === expected){
          close();
          // Navigate after small delay for UX
          setTimeout(()=>{ window.location.href = link.getAttribute('href'); }, 50);
        } else {
          showToast('Wrong passphrase');
          passInput.focus();
        }
      }
      link?.addEventListener('click', (e)=>{
        if(link.dataset.protected==='true'){
          e.preventDefault(); open();
        }
      });
      submitBtn.addEventListener('click', submit);
      cancelBtn.addEventListener('click', close);
      passInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ submit(); } if(e.key==='Escape'){ close(); } });
    }
    
    return { init, sendAIMessage, saveNote, showToast, copyText, copyCommand };
  })();
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bpDash.init);
  } else {
    bpDash.init();
  }
