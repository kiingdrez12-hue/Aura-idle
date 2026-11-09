"""Gera vendor/aura-sounds.js com os sons WAV do SoundWeaver (MIT) embutidos em base64.
Uso: python3 tools/sounds/build.py <pasta do plugin soundweaver>
Para trocar um som, mude o id em IDS (ids de reference/sound-library.json) e rode de novo."""
import base64, json, os, sys
IDS = {  # id no jogo -> id do SoundWeaver
  'buy': 'click-crisp-primary', 'coin': 'coin-collect', 'gem': 'coin-double',
  'lvl': 'level-up', 'tier': 'achievement', 'chest': 'confirm-unlock',
  'tab': 'tab-switch', 'tip': 'xp-up', 'no': 'invalid-thunk'}
src = sys.argv[1]
lib = json.load(open(os.path.join(src, 'reference', 'sound-library.json')))
lib = {s['id']: s for s in (lib['sounds'] if isinstance(lib, dict) else lib)}
out = {}
for k, sid in IDS.items():
    b = open(os.path.join(src, 'assets', 'sounds', sid + '.wav'), 'rb').read()
    out[k] = {'id': sid, 'v': lib[sid]['recommendedVolume'], 'b64': base64.b64encode(b).decode()}
root = os.path.join(os.path.dirname(__file__), '..', '..')
with open(os.path.join(root, 'vendor', 'aura-sounds.js'), 'w') as f:
    f.write('/* Sons do SoundWeaver (MIT, pré-renderizados) · gerado por tools/sounds/build.py — não edite à mão */\n')
    f.write('window.AURA_SND=' + json.dumps(out, separators=(',', ':')) + ';\n')
print({k: v['id'] for k, v in out.items()})
