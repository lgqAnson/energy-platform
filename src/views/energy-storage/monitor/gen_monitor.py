# -*- coding: utf-8 -*-
import os
path = os.path.join(os.path.dirname(__file__), 'Monitor.vue')
with open(path, 'w', encoding='utf-8') as f:
    f.write('<template>\n')
    f.write('  <div>hello</div>\n')
    f.write('</template>\n')
print('ok')
