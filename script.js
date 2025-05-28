const margin = 10;
const lncCont = document.getElementById('lnc');

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

lncCont.appendChild(terminalBox);

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




