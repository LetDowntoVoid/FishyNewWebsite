const container = document.getElementById('lineContainer');
const segments = [];

function createBorderLines() {
    const margin = 40;
    
    // Top horizontal line
    const topLine = document.createElement('div');
    topLine.className = 'line horizontal';
    topLine.style.top = margin + 'px';
    topLine.style.left = margin + 'px';
    topLine.style.width = `calc(100% - ${margin * 2}px)`;
    container.appendChild(topLine);
    
    // Bottom horizontal line
    const bottomLine = document.createElement('div');
    bottomLine.className = 'line horizontal';
    bottomLine.style.bottom = margin + 'px';
    bottomLine.style.left = margin + 'px';
    bottomLine.style.width = `calc(100% - ${margin * 2}px)`;
    container.appendChild(bottomLine);
    
    // Left vertical line
    const leftLine = document.createElement('div');
    leftLine.className = 'line vertical';
    leftLine.style.left = margin + 'px';
    leftLine.style.top = margin + 'px';
    leftLine.style.height = `calc(100% - ${margin * 2}px)`;
    container.appendChild(leftLine);
    
    // Right vertical line
    const rightLine = document.createElement('div');
    rightLine.className = 'line vertical';
    rightLine.style.right = margin + 'px';
    rightLine.style.top = margin + 'px';
    rightLine.style.height = `calc(100% - ${margin * 2}px)`;
    container.appendChild(rightLine);
    
    return { topLine, bottomLine, leftLine, rightLine, margin };
}

function createCornerDots(margin) {
    const positions = [
        { top: margin - 4 + 'px', left: margin - 4 + 'px' },
        { top: margin - 4 + 'px', right: margin - 4 + 'px' },
        { bottom: margin - 4 + 'px', left: margin - 4 + 'px' },
        { bottom: margin - 4 + 'px', right: margin - 4 + 'px' }
    ];
    
    positions.forEach(pos => {
        const dot = document.createElement('div');
        dot.className = 'corner-dot';
        Object.assign(dot.style, pos);
        container.appendChild(dot);
    });
}

function createMeasurements(margin) {
    const measurements = [
        { text: '88.2', top: margin - 25 + 'px', left: '50%', transform: 'translateX(-50%)' },
        { text: '88.2', bottom: margin - 25 + 'px', left: '50%', transform: 'translateX(-50%)' },
        { text: '134.22', left: margin - 35 + 'px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' },
        { text: '134.22', right: margin - 35 + 'px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }
    ];
    
    measurements.forEach(m => {
        const elem = document.createElement('div');
        elem.className = 'measurement';
        elem.textContent = m.text;
        Object.assign(elem.style, m);
        container.appendChild(elem);
    });
}

function createThickSegments(lines) {
    const { topLine, bottomLine, leftLine, rightLine, margin } = lines;
    
    // Create segments for each line
    const segmentConfigs = [
        { line: topLine, type: 'horizontal', parent: topLine },
        { line: bottomLine, type: 'horizontal', parent: bottomLine },
        { line: leftLine, type: 'vertical', parent: leftLine },
        { line: rightLine, type: 'vertical', parent: rightLine }
    ];
    
    segmentConfigs.forEach((config, index) => {
        // Create 2-3 segments per line
        const numSegments = Math.floor(Math.random() * 2) + 2;
        
        for (let i = 0; i < numSegments; i++) {
            const segment = document.createElement('div');
            segment.className = `thick-segment ${config.type}`;
            
            // Randomize shape - rectangle or square
            const isSquare = Math.random() > 0.5;
            const hasText = Math.random() > 0.6; // 40% chance to have text
            
            if (config.type === 'horizontal') {
                const width = isSquare ? 24 : Math.random() * 40 + 30; // 30-70px for rectangles, 24px for squares
                segment.style.width = width + 'px';
                segment.style.height = '24px';
                
                const maxDistance = window.innerWidth - margin * 2 - width;
                const initialPos = Math.random() * maxDistance;
                gsap.set(segment, { left: initialPos });
                
                segments.push({ 
                    element: segment, 
                    type: config.type, 
                    lineIndex: index,
                    maxDistance: maxDistance,
                    hasText: hasText,
                    width: width
                });
            } else {
                const height = isSquare ? 24 : Math.random() * 40 + 30; 
                segment.style.height = height + 'px';
                segment.style.width = '24px';
                
                const maxDistance = window.innerHeight - margin * 2 - height;
                const initialPos = Math.random() * maxDistance;
                gsap.set(segment, { top: initialPos });
                
                segments.push({ 
                    element: segment, 
                    type: config.type, 
                    lineIndex: index,
                    maxDistance: maxDistance,
                    hasText: hasText,
                    height: height
                });
            }
            
            config.parent.appendChild(segment);
        }
    });
}

function animateSegments() {
    segments.forEach((segment, index) => {
        function createAnimation() {
            const isHorizontal = segment.type === 'horizontal';
            const maxDistance = segment.maxDistance;
            
            // Random speed between slow and medium
            let baseDuration = Math.random() * 3 + 2; // 2-5 seconds
            
            
            if (Math.random() < 0.05) { // 20% chance
                baseDuration = Math.random() * 0.5 + 0.3; // 0.3-0.8 seconds
            }
            
            const direction = Math.random() > 0.5 ? 1 : -1;
            const currentPos = isHorizontal ? 
                gsap.getProperty(segment.element, "left") : 
                gsap.getProperty(segment.element, "top");
            
            let targetPos;
            if (direction > 0) {
                targetPos = Math.min(currentPos + Math.random() * 200 + 100, maxDistance);
            } else {
                targetPos = Math.max(currentPos - Math.random() * 200 - 100, 0);
            }
            
            const property = isHorizontal ? "left" : "top";
            
            gsap.to(segment.element, {
                [property]: targetPos,
                duration: baseDuration,
                ease: "power2.inOut",
                onUpdate: () => {
                    if (segment.hasText) {
                        const currentPos = gsap.getProperty(segment.element, property);
                        const percentage = Math.round((currentPos / maxDistance) * 100);
                        segment.element.textContent = percentage;
                    }
                },
                onComplete: () => {
                    // Add random delay before next animation
                    gsap.delayedCall(Math.random() * 1 + 0.5, createAnimation);
                }
            });
        }
        
        // Set initial text if needed
        if (segment.hasText) {
            const property = segment.type === 'horizontal' ? "left" : "top";
            const currentPos = gsap.getProperty(segment.element, property);
            const percentage = Math.round((currentPos / segment.maxDistance) * 100);
            segment.element.textContent = percentage + '%';
        }
        
        // Start each segment with a random initial delay
        gsap.delayedCall(Math.random() * 2, createAnimation);
    });
}

function createInnerLines() {
    const margin = 40;
    const numHorizontalLines = Math.floor(Math.random() * 3) + 2; // 2-4 lines
    const numVerticalLines = Math.floor(Math.random() * 3) + 2; // 2-4 lines
    
    // Create horizontal inner lines
    for (let i = 0; i < numHorizontalLines; i++) {
        const line = document.createElement('div');
        line.className = 'line horizontal';
        const y = margin + (window.innerHeight - margin * 2) * Math.random();
        line.style.top = y + 'px';
        line.style.left = margin + 'px';
        line.style.width = `calc(100% - ${margin * 2}px)`;
        container.appendChild(line);
        
        // Add segments to this line
        const numSegments = Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < numSegments; j++) {
            const segment = document.createElement('div');
            segment.className = 'thick-segment horizontal';
            
            // Randomize shape - rectangle or square
            const isSquare = Math.random() > 0.5;
            const hasText = Math.random() > 0.6; // 40% chance to have text
            
            const width = isSquare ? 24 : Math.random() * 40 + 30;
            segment.style.width = width + 'px';
            segment.style.height = '24px';
            
            const maxDistance = window.innerWidth - margin * 2 - width;
            const initialPos = Math.random() * maxDistance;
            gsap.set(segment, { left: initialPos });
            
            line.appendChild(segment);
            segments.push({ 
                element: segment, 
                type: 'horizontal', 
                lineIndex: segments.length,
                maxDistance: maxDistance,
                hasText: hasText,
                width: width
            });
        }
    }
    
    // Create vertical inner lines
    for (let i = 0; i < numVerticalLines; i++) {
        const line = document.createElement('div');
        line.className = 'line vertical';
        const x = margin + (window.innerWidth - margin * 2) * Math.random();
        line.style.left = x + 'px';
        line.style.top = margin + 'px';
        line.style.height = `calc(100% - ${margin * 2}px)`;
        container.appendChild(line);
        
        // Add segments to this line
        const numSegments = Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < numSegments; j++) {
            const segment = document.createElement('div');
            segment.className = 'thick-segment vertical';
            
            // Randomize shape - rectangle or square
            const isSquare = Math.random() > 0.5;
            const hasText = Math.random() > 0.6; // 40% chance to have text
            
            const height = isSquare ? 24 : Math.random() * 40 + 30;
            segment.style.height = height + 'px';
            segment.style.width = '24px';
            
            const maxDistance = window.innerHeight - margin * 2 - height;
            const initialPos = Math.random() * maxDistance;
            gsap.set(segment, { top: initialPos });
            
            line.appendChild(segment);
            segments.push({ 
                element: segment, 
                type: 'vertical', 
                lineIndex: segments.length,
                maxDistance: maxDistance,
                hasText: hasText,
                height: height
            });
        }
    }
}

// Initialize everything
function init() {
    const lines = createBorderLines();
    createCornerDots(lines.margin);
    createMeasurements(lines.margin);
    createThickSegments(lines);
    createInnerLines();
    animateSegments();
}

// Start when page loads
window.addEventListener('load', init);

// Handle window resize
window.addEventListener('resize', () => {
    container.innerHTML = '';
    segments.length = 0;
    init();
});

const margin = 10;

const terminalBox = document.createElement('div');
terminalBox.style.position = 'absolute';
terminalBox.style.top = margin + 'px';
terminalBox.style.left = margin + 'px';
terminalBox.style.width = '250px';
terminalBox.style.height = '125px';
terminalBox.style.padding = '4px';
terminalBox.style.backgroundColor = 'rgba(0,0,0,0)';
terminalBox.style.color = '#b21927';
terminalBox.style.fontFamily = 'monospace, monospace';
terminalBox.style.fontSize = '5px';
terminalBox.style.lineHeight = '5px';
terminalBox.style.overflow = 'hidden';
terminalBox.style.whiteSpace = 'pre';
terminalBox.style.borderRadius = '3px';
terminalBox.style.boxSizing = 'border-box';
terminalBox.style.userSelect = 'none';
terminalBox.style.pointerEvents = 'none';

container.appendChild(terminalBox);

const maxLines = 25;
const displayedLines = [];

function printLine(text) {
  if (displayedLines.length >= maxLines) {
    displayedLines.shift();
  }
  displayedLines.push(text);
  terminalBox.textContent = displayedLines.join('\n');
}

function replaceLastLine(text) {
  if (displayedLines.length > 0) {
    displayedLines[displayedLines.length - 1] = text;
  } else {
    displayedLines.push(text);
  }
  terminalBox.textContent = displayedLines.join('\n');
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const interjectedLines = [
  '> Allocating memory...',
  '> Spawning background threads...',
  '> Waiting for dependencies...',
  '> Performing cleanup...',
  '> Checking system load...',
  '> Flushing logs...',
  '> Compressing assets...',
  '> Verifying timestamps...',
  '> Synchronizing clocks...',
  '> Handshaking with mirror...',
  '> Updating routing table...',
  '> Overclocking core sequence...',
  '> Encrypting connection...'
];

const burstLines = [
  '[DEBUG] frame=289 temp=57.2°C voltage=3.3V',
  '[TRACE] packet received: 0x9A7F',
  '[SYS] mount: /dev/loop0 -> /mnt',
  '[INFO] task #418 queued',
  '[INFO] freed 38 MB',
  '[MEM] GC sweep started...',
  '[IO] listening on port 4218',
  '[NET] peer connected: 192.168.0.11',
  '[DISK] Write latency: 4ms',
  '[GPU] idle: false',
  '[FS] inode cache flushed',
  '[CPU] throttle: off',
  '[RT] tickrate = 1.0000001'
];

function getRandomLog() {
  return interjectedLines[Math.floor(Math.random() * interjectedLines.length)];
}

function getBurstLine() {
  return burstLines[Math.floor(Math.random() * burstLines.length)];
}

async function simulateProgress(label = 'Progress', total = 10) {
  for (let i = 0; i <= total; i++) {
    const bar = `${label} [` + '█'.repeat(i) + '░'.repeat(total - i) + ']';
    replaceLastLine(bar);

    if (i !== total && Math.random() < 0.3) {
      await wait(100);
      printLine(getRandomLog());
    }

    await wait(250 + Math.random() * 250);
  }
}

async function simulateBurst() {
  const count = 5 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    printLine(getBurstLine());
    await wait(30 + Math.random() * 70); // fast but not uniform
  }
}

async function simulateTerminal() {
  printLine('> Initializing system...');
  await wait(500);
  printLine('> Boot sequence starting...');
  await wait(500);
  printLine('> Checking dependencies...');
  await wait(600);
  printLine('');

  await simulateProgress('Compiling', 12);
  await wait(300);
  printLine('[✓] Compilation complete');

  await wait(500);
  await simulateBurst();

  await wait(600);
  printLine('> Launching services...');
  await wait(400);
  printLine('');

  await simulateProgress('Deploying', 8);
  printLine('[✓] Deployed to localhost');

  await wait(300);
  await simulateBurst();

  await wait(800);
  printLine('> Synchronizing subsystems...');
  await wait(1000);
  printLine('[✓] Synchronized');

  await wait(1000);
  printLine('> Restarting log simulation...\n');
  await wait(1500);

  simulateTerminal();
}

simulateTerminal();


gsap.registerPlugin(ScrollTrigger);

function initHorizontalScroll() {
  const wrapper = document.querySelector(".horizontal-wrapper");
  const longText = document.querySelector(".longText");

  if (window.innerWidth > 768) {
    const textRight = longText.getBoundingClientRect().right;
    const wrapperLeft = wrapper.getBoundingClientRect().left;
    const buffer = 300;
    const scrollDistance = textRight - wrapperLeft - window.innerWidth + buffer;
    ScrollTrigger.create({
      trigger: ".horizontal-section",
      start: "top top",
      end: () => scrollDistance,
      pin: true,
      scrub: 1,
      animation: gsap.to(wrapper, {
        x: () => `-${scrollDistance}px`,
        ease: "none"
      }),
      invalidateOnRefresh: true
    });
  }
}

initHorizontalScroll();

window.addEventListener("resize", () => {
  ScrollTrigger.getAll().forEach(t => t.kill());
  initHorizontalScroll();
});



