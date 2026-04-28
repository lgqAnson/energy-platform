const fs = require('fs');
const content = fs.readFileSync('src/views/energy-storage/dashboard/Dashboard.vue', 'utf8');
const lines = content.split('\n');

const scriptStart = lines.findIndex(l => l.trim() === '<script setup lang="ts">');
const scriptEnd = lines.findIndex(l => l.trim() === '</script>');
const styleStart = lines.findIndex(l => l.trim() === '<style scoped>');

console.log('Total lines:', lines.length);
console.log('Template: 1-' + scriptStart);
console.log('Script: ' + (scriptStart+1) + '-' + (scriptEnd+1));
console.log('Style: ' + (styleStart+1) + '-' + lines.length);

// Print first few lines of each panel in template
const keywords = [
  { name: 'station-panel', kw: 'class="panel station-panel"' },
  { name: 'scene-panel', kw: 'class="panel revenue-panel"' },
  { name: 'charge-panel', kw: 'class="panel charge-panel"' },
  { name: 'runtime-panel', kw: 'class="panel runtime-panel"' },
  { name: 'alarm-panel', kw: 'class="panel alarm-panel"' }
];

for (const {name, kw} of keywords) {
  const idx = lines.findIndex(l => l.includes(kw));
  if (idx >= 0) console.log(name + ' starts at line ' + (idx+1));
}
