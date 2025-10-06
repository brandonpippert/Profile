// Critical functionality - loaded immediately
document.getElementById('year').textContent = new Date().getFullYear();

// Global toast function
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// Defer non-critical JS
window.addEventListener('DOMContentLoaded', function() {
  
  // 1) Enhanced theme switcher with safer icon updates - DEFAULT TO LIGHT THEME
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    // CHANGED: Default to light theme instead of checking system preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update toggle icon - rewritten for reliability
    function updateToggleIcon(theme) {
      const svg = document.querySelector('#themeToggle svg');
      if(!svg) return;
      svg.innerHTML = theme === 'dark'
        ? '<path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z" fill="currentColor"/>'
        : '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/>' +
          '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34" stroke="currentColor" stroke-width="2"/>';
    }
    
    updateToggleIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleIcon(newTheme);
    });
    
    // CHANGED: Remove system theme change listener since we default to light
    // Users can still manually switch to dark mode and it will be saved
  }

  // 2) Interactive terminal with typing effect
  const terminal = document.getElementById('terminalContent');
  if (terminal) {
    const lines = [
      {text: "git push origin main", delay: 3000},
      {text: "Triggering deployment pipeline...", delay: 1000},
      {text: "Running tests... ✓", delay: 1500},
      {text: "Building container image... ✓", delay: 1500},
      {text: "Deploying to ECS Fargate... ✓", delay: 2000},
      {text: "Health check passed! Deployment successful.", delay: 0}
    ];
    
    let lineIndex = 0;
    
    function addLine(text, isPrompt = true) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      
      if (isPrompt) {
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = '$';
        line.appendChild(prompt);
      }
      
      const content = document.createElement('span');
      content.textContent = text;
      line.appendChild(content);
      
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }
    
    function startTerminalAnimation() {
      if (lineIndex < lines.length) {
        const line = lines[lineIndex];
        setTimeout(() => {
          addLine(line.text);
          lineIndex++;
          startTerminalAnimation();
        }, line.delay);
      }
    }
    
    // Start animation when page loads
    setTimeout(startTerminalAnimation, 2000);
  }

  // 3) Animated metrics
  const metrics = {
    uptime: { element: document.getElementById('uptimeMetric'), target: 99.95, duration: 2000 },
    response: { element: document.getElementById('responseMetric'), target: 142, duration: 1500 },
    deploy: { element: document.getElementById('deployMetric'), target: 12, duration: 1000 }
  };
  
  function animateMetric(metric, unit = '') {
    if (!metric.element) return;
    const start = 0;
    const increment = metric.target / (metric.duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= metric.target) {
        current = metric.target;
        clearInterval(timer);
      }
      
      if (unit === '%') {
        metric.element.textContent = current.toFixed(2) + unit;
      } else {
        metric.element.textContent = Math.round(current) + unit;
      }
    }, 16);
  }
  
  // Start animation when page loads
  setTimeout(() => {
    animateMetric(metrics.uptime, '%');
    animateMetric(metrics.response, 'ms');
    animateMetric(metrics.deploy, 's');
  }, 1000);

  // 4) Copy email with toast
  const copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = 'brandonpippert@gmail.com';
      navigator.clipboard.writeText(email)
        .then(() => showToast('Email copied to clipboard!'))
        .catch(() => showToast('Failed to copy email'));
    });
  }

  // 5) Launch demo button
  const demoBtn = document.getElementById('demoBtn');
  if (demoBtn) {
    demoBtn.addEventListener('click', function() {
      const originalText = this.textContent;
      this.textContent = '🚀 Launching...';
      this.disabled = true;
      
      // Simulate API call to launch environment
      setTimeout(() => {
        showToast('Demo environment launching! Check your email for details.');
        this.textContent = originalText;
        this.disabled = false;
      }, 2000);
    });
  }

  // 6) Safe smooth scrolling for same-page anchor links only
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id.length > 1) { // ignore just "#"
        e.preventDefault();
        const target = document.querySelector(id);
        if (target) {
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block:'start' });
        }
      }
    });
  });

  // 7) Horizontal Scrolling Skills Animation
  const skillLine1 = document.getElementById('skillLine1');
  const skillLine2 = document.getElementById('skillLine2');
  const skillLine3 = document.getElementById('skillLine3');
  
  if (skillLine1 && skillLine2 && skillLine3) {
    // Define skills arrays for each line
    const skillsLine1 = [
      "AWS (S3, CloudFront, API GW, Lambda, ECS, RDS, DynamoDB)",
      "IaC: CDK, SAM, Terraform (basics)",
      "CI/CD: GitHub Actions, CodePipeline",
      "Containers: Docker, ECS Fargate",
      "Observability: CloudWatch, X‑Ray, Synthetics"
    ];
    
    const skillsLine2 = [
      "Security: IAM, KMS, WAF, Secrets Mgmt",
      "Networking: VPC, ALB, Route 53",
      "Languages/Tools: Bash, Python (basics), Git",
      "Reliability: health checks, alerts, rollbacks",
      "Serverless Architecture"
    ];
    
    const skillsLine3 = [
      "Infrastructure as Code",
      "Cloud Security",
      "Monitoring & Alerting",
      "Automation & Scripting",
      "Cost Optimization",
      "Disaster Recovery",
      "Performance Tuning",
      "Microservices"
    ];
    
    // Function to populate a skill line with duplicates for seamless scrolling
    function populateSkillLine(lineElement, skills) {
      // Create two sets of skills for seamless looping
      for (let set = 0; set < 2; set++) {
        skills.forEach(skill => {
          const skillChip = document.createElement('span');
          skillChip.className = 'skill-chip';
          skillChip.textContent = skill;
          lineElement.appendChild(skillChip);
        });
      }
    }
    
    // Populate each line
    populateSkillLine(skillLine1, skillsLine1);
    populateSkillLine(skillLine2, skillsLine2);
    populateSkillLine(skillLine3, skillsLine3);
  }

  // 8) Real Live Notes status check
  const notesStatus = document.getElementById('notesStatus');
  if (notesStatus) {
    // Real HEAD request to check liveness
    fetch('https://wetuh8kr5e.execute-api.us-west-1.amazonaws.com/notes', { 
      method: 'HEAD', 
      mode: 'cors'
    })
    .then(r => {
      notesStatus.innerHTML = r.ok
        ? '<span style="color: var(--brand)">✓ Live endpoint responsive</span>'
        : '<span style="color:#ef4444">• Endpoint not responding</span>';
    })
    .catch(() => {
      notesStatus.innerHTML = '<span style="color:#ef4444">• CORS/Network blocked</span>';
    });
  }

}); // End DOMContentLoaded
