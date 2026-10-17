# Chrome Web Store mağaza içeriği

Görseller `assets.html` dosyasından headless Chrome ile üretilir (24-bit PNG, alfa kanalsız). Adres sonuna `/en` eklenince aynı görsel İngilizce çizilir: `assets.html#s1`, `assets.html#s1/en`.

Paket `default_locale: "en"` ile İngilizce + Türkçe (`_locales/`). Dashboard'da **Mağaza girişi** sayfasında dil seçiciyle her dil için ayrı açıklama ve görsel girilir.

| Mağazadaki alan | English (`store/en/`) | Türkçe (`store/tr/`) |
| --- | --- | --- |
| Ekran görüntüsü 1 | `screenshot-1-before-after.png` | `screenshot-1-oncesi-sonrasi.png` |
| Ekran görüntüsü 2 | `screenshot-2-reels-landscape.png` | `screenshot-2-reels-yatay-mod.png` |
| Ekran görüntüsü 3 | `screenshot-3-features.png` | `screenshot-3-ozellikler.png` |
| Küçük tanıtım bloğu | `promo-small-440x280.png` | `promo-small-440x280.png` |
| Kayan yazı tanıtım bloğu | `promo-marquee-1400x560.png` | `promo-marquee-1400x560.png` |
| Mağaza simgesi | `../icon128.png` | `../icon128.png` |

---

## Mağaza girişi — English (varsayılan)

**Category:** Tools

### Description

```text
Do videos that were filmed sideways show up lying on their side on Instagram? With Video Rotator for Instagram, rotate the video you are watching with one click and enjoy it in landscape mode on desktop.

HOW TO USE
• Hover over a video on Instagram; a rotate button appears at the edge of the video.
• Click the button: the video rotates 90° and switches to landscape mode.
• Click again for 180°, 270° and back to the original. Shift + click rotates the other way.

FEATURES
• Each video on its own: only the video you are watching rotates; the others stay as they are.
• Real landscape mode: on Reels and post dialogs the video widens, and the like, comment, share and sound controls follow the new size.
• Layout stays intact: in the home feed the video rotates inside its own box; nothing on the page shifts.
• Auto reset: move on to the next video and it returns to normal by itself.
• Smart button placement: the button stays clear of Instagram elements such as the poster's name, menus and sound controls.
• No setup needed, and it does not slow the page down.

PRIVACY
The extension does not collect, store or share any personal data. It runs only on instagram.com pages and never contacts a server.

This extension is not affiliated with, endorsed by, or sponsored by Instagram or Meta.
```

---

## Mağaza girişi — Türkçe

**Kategori:** Araçlar

### Açıklama

```text
Dik tutularak çekilmiş ama aslında yatay olan videolar Instagram'da yan yatmış mı görünüyor? Video Rotator for Instagram ile izlediğiniz videoyu tek tıkla döndürün ve masaüstünde yatay modda rahatça izleyin.

NASIL KULLANILIR
• Instagram'da bir videonun üzerine gelin; videonun kenarında döndürme butonu belirir.
• Butona tıklayın: video 90° döner ve yatay moda geçer.
• Tekrar tıklayarak 180°, 270° ve orijinal haline geçin. Shift + tık ters yöne döndürür.

ÖZELLİKLER
• Her video bağımsız: Sadece izlediğiniz video döner, diğer videolar etkilenmez.
• Gerçek yatay mod: Reels ve gönderi pencerelerinde video genişler; beğen, yorum, paylaş ve ses butonları yeni boyuta göre yerleşir.
• Düzen bozulmaz: Ana sayfa akışında video kendi kutusunun içinde döner, sayfa kaymaz.
• Otomatik sıfırlama: Sonraki videoya geçtiğinizde video kendiliğinden eski haline döner.
• Akıllı buton konumu: Buton; paylaşan kişinin adı, menü ve ses butonu gibi Instagram öğelerinin üstüne binmez.
• Ayar gerektirmez, sayfayı yavaşlatmaz.

GİZLİLİK
Uzantı hiçbir kişisel veri toplamaz, saklamaz veya paylaşmaz. Yalnızca instagram.com sayfalarında çalışır ve hiçbir sunucuya bağlanmaz.

Bu uzantı Instagram veya Meta ile bağlantılı değildir; onlar tarafından desteklenmez veya onaylanmaz.
```

---

## Ek alanlar (tüm diller)

- **Resmi URL:** Yok (Google Search Console'da doğrulanmış bir site eklenirse seçilebilir)
- **Ana sayfa URL'si:** `https://github.com/gkhns89/insta-rotate`
- **Destek URL'si:** `https://github.com/gkhns89/insta-rotate/issues`
- **Yetişkinlere yönelik içerik:** Kapalı

## Dağıtım

- **Görünürlük:** Herkese açık
- **Dağıtım bölgeleri:** Tüm bölgeler

---

## Gizlilik sekmesi

İnceleme ekibi okuduğu için İngilizce.

### Single purpose

```text
Lets users rotate a selected video on the Instagram desktop website so that videos filmed sideways can be watched in the correct orientation and in landscape mode.
```

### Host permission justification

```text
The content script must run on https://www.instagram.com/* to show the rotate button on top of Instagram videos and to rotate the video the user selects. The extension does not access any other site and does not read or send any data.
```

### Remote code

**No, I am not using remote code.** All code is included in the package.

### Data usage

Hiçbir veri türünü işaretlemeyin (uzantı veri toplamaz). Alttaki üç beyanı onaylayın:

- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

### Privacy policy URL

```text
https://github.com/gkhns89/insta-rotate#privacy-policy
```

---

## Test talimatları

```text
1. Sign in to https://www.instagram.com with any Instagram account.
2. Open https://www.instagram.com/reels/
3. Hover over a video; a rotate button appears at the middle of the video's right edge.
4. Click it: the video rotates 90° and widens into landscape mode. Click again for 180°, 270° and back to the original. Shift + click rotates the other way.
5. Scroll to the next video: the previous one automatically returns to normal.
The same works for videos in the home feed and in post dialogs.
```
