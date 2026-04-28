const fs = require('fs');
const content = fs.readFileSync('src/views/energy-storage/strategy/components/StrategyFormDialog.vue', 'utf8');
const lines = content.split('\n');
const scriptStart = lines.findIndex(l => l.trim() === '<script setup lang="ts">');
const scriptEnd = lines.findIndex(l => l.trim() === '</script>');
console.log('Script range:', scriptStart+1, '-', scriptEnd+1);
const scriptLines = lines.slice(scriptStart, scriptEnd+1);
const keywords = ['dateTags', 'calendarYear', 'calendarMonth', 'calendarDays', 'todayStr', 'toggleDate', 'prevMonth', 'nextMonth', 'selectCurrentMonth', 'weekdays', 'generateCalendar', 'getDaysInMonth'];
for (const kw of keywords) {
  const idx = scriptLines.findIndex(l => l.includes(kw));
  if (idx >= 0) console.log(kw + ': script line ' + (idx+1) + ' (file line ' + (scriptStart+idx+1) + ')');
}
