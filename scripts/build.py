"""Chrome Web Store paketlerini üretir.

    python scripts/build.py

Çıktılar (dist/):
  video-rotator-for-instagram-<sürüm>.zip  imzasız paket
  video-rotator-for-instagram-<sürüm>.crx  "Doğrulanmış CRX yüklemeleri" için imzalı paket

İmza anahtarı IVR_SIGNING_KEY ortam değişkeninden, yoksa
~/keys/insta-rotate/private-key.pem dosyasından okunur. Anahtar asla depoya konmaz.
Chrome yolu gerekirse CHROME ortam değişkeniyle verilir.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
FILES = ['manifest.json', 'content.js', 'background.js', 'icon16.png', 'icon48.png', 'icon128.png', '_locales']

CHROME_CANDIDATES = [
    os.environ.get('CHROME', ''),
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
]


def package_files():
    for name in FILES:
        path = ROOT / name
        if path.is_dir():
            yield from sorted(p for p in path.rglob('*') if p.is_file())
        else:
            yield path


def build_zip(base):
    target = DIST / f'{base}.zip'
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as z:
        for path in package_files():
            z.write(path, path.relative_to(ROOT).as_posix())
    return target


def build_crx(base, key):
    chrome = next((c for c in CHROME_CANDIDATES if c and Path(c).exists()), None)
    if not chrome:
        sys.exit('Chrome bulunamadı; CHROME ortam değişkenini ayarlayın.')

    staging = DIST / 'package'
    shutil.rmtree(staging, ignore_errors=True)
    for path in package_files():
        dest = staging / path.relative_to(ROOT)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)

    packed = DIST / 'package.crx'
    packed.unlink(missing_ok=True)
    # Ayrı profil: açık bir Chrome varsa komut ona devredilip beklenmeden dönmesin.
    with tempfile.TemporaryDirectory() as profile:
        subprocess.run([chrome, f'--pack-extension={staging}', f'--pack-extension-key={key}',
                        f'--user-data-dir={profile}', '--no-message-box'], check=False)
        for _ in range(60):
            if packed.exists():
                break
            time.sleep(0.5)
    shutil.rmtree(staging, ignore_errors=True)
    if not packed.exists():
        sys.exit('CRX oluşturulamadı.')

    target = DIST / f'{base}.crx'
    target.unlink(missing_ok=True)
    packed.rename(target)
    return target


def main():
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    base = f"video-rotator-for-instagram-{manifest['version']}"

    key = Path(os.environ.get('IVR_SIGNING_KEY', Path.home() / 'keys' / 'insta-rotate' / 'private-key.pem'))

    DIST.mkdir(exist_ok=True)
    print(build_zip(base))
    if key.exists():
        print(build_crx(base, key))
    else:
        (DIST / f'{base}.crx').unlink(missing_ok=True)  # eski koddan kalmış imzalı paket yüklenmesin
        print(f'İmza anahtarı yok ({key}); .crx üretilmedi. Yayın için anahtarı geçici olarak oraya koyun '
              'ya da IVR_SIGNING_KEY ile yolunu verin, işiniz bitince silin.')


if __name__ == '__main__':
    main()
