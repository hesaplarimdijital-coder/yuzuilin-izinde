# QA Raporu — Yüzyılın İzinde

Tarih: 9 Ekim 2026 · Sürüm: final (artifact v11) · Ortam: Chromium (Playwright, başsız), 6 ekran boyutu

## Kapsam

Oyunun tamamı bir test uzmanı gözüyle, otomatik senaryolarla tarandı: yükleme, menü, eğitim, fizik, çarpışmalar, can/ışık, duraklatma, oyun sonu, dönem kilidi, boyut değişimi, dayanıklılık (ses/depolama yok), zaman çizelgesi, yazı sığması, Android köprüsü, performans, tuşlar, ses motoru, bekleme modu; ayrıca mola bölgeleri, eğitim akışı (16 kombinasyon), engel üstüne iniş, kuleler ve geniş çukurlar, deprem sarsıntısı, yas yürüyüşü, 105 olaylık tam maraton ve yüksek zorlukta otomatik pilot adaleti.

**Sonuç: 74/74 otomatik denetim geçti (bağış sayfası ve menü bağlantısı dahil); 9 bulgu düzeltildi. Son turda eklenen değişiklikler (yazı boyutu, yıl rakamlarının orta şeridin arkasına alınması, bağış sayfası) sonrasında takım yeniden çalıştırıldı: mola bölgeleri 0 ihlal, eğitim 16/16, 105 olaylık maraton hatasız, iniş 10/10, deprem sarsıntısı 0.**

## Bu turda bulunan ve düzeltilen hatalar

| # | Bulgu | Düzeltme |
|---|---|---|
| 1 | Güneş tepelerin ardına inince ışık huzmeleri manzaranın üstünden çiziliyor, yataya yakın huzme ekran boyunca "ufuk çizgisi" gibi duruyordu | Huzmeler artık yalnızca gökyüzünde, tepelerin arkasında; yelpaze sadece yukarı açılıyor |
| 2 | Sis bantlarının geçiş satırı iki kez boyanıyordu (ekran boyunca ince çizgi) | Tam piksel sınırı, tek boyama |
| 3 | Oyun sonu: 0,3 m'lik koşu "Yeni rekor!" sayılıp 0 m olarak kaydediliyordu | Rekor tam metre üzerinden karşılaştırılıyor |
| 4 | Oyun sonunda Enter, odaktaki "Yeniden koş" düğmesini de tıklıyor; oyun iki kez başlıyordu | Enter'da varsayılan davranış engellendi |
| 5 | Dar dikey telefonlarda tireli uzun başlıklar ("Çaldıran-Muradiye") ekrandan taşıyordu | Satır kırma tireden bölüyor; sığmayan blok kendiliğinden küçülüyor |
| 6 | Kısa yatay telefonlarda en uzun açıklamalar karakterin başına iniyordu | Blok, yazı alt kenarı karakterin üstünde kalacak biçimde ölçeklendiriliyor |
| 7 | Kenar payı (coyote) 0,13 sn tanımlıydı ama çukur kuralı onu 0,08 sn'de kesiyordu | Sabitler tutarlı hâle getirildi (0,09 sn / 13 birim) |
| 8 | Olay yazısı sahnenin ve yıl rakamlarının üstünde karışıyordu | Daha geniş, yumuşak kenarlı ve örtücü perde |
| 9 | Hız artışı fark edilmeyecek kadar yavaştı | Subway Surfers tarzı eğri: 1 dk ~1,1×, 3 dk ~1,2×, 10 dk ~1,4×, tavan 1,5× |

## Doğrulanan davranışlar (özet)

- Zıplama yükseklikleri: dokunuş 137, basılı 162, çift 284 birim; tampon ve kenar payı çalışıyor; çukurdayken zıplama yok.
- Engele çarpma: can −1, 2 sn dokunulmazlık, engel kırılır; üç çarpma → ölüm → oyun sonu; çukura düşme → yeniden doğma.
- Platform: üstüne iniş can götürmez, yandan çarpma can götürür ve üstüne çıkarır; engel üstlerine iniş (10 engel türü) can götürmez.
- 50 ışık → can; canlar doluyken can birikir.
- Kuleler (7 dönem): tam basılı tek zıplamayla 0/61 geçiş, çift zıplamayla geçiş; geniş çukur: dokunuş geçmez, tam zıplama sınırda, çift zıplama her zaman geçer.
- Okuma molası: 600 sn'de 13 olay, 0 ihlal. Eğitim: 16 cihaz/zamanlama kombinasyonunun hepsi tamamlandı; her aşamada "Eğitimi geç" güvenli.
- 105 olay sırayla; yıl sayacı tekdüze; hiçbir yıl atlanmıyor; son olaydan sonra gelecek yıllar sayılıyor; 9000 sn maratonda bellek sabit (~10 MB), hata yok.
- Depremlerde sarsıntı 0; yas yürüyüşü ~8 sn, 130 hızında, engelsiz.
- Duraklatma: P/Esc, düğme, sekme gizlenince ve odak kaybında; duraklatmada oyun ilerlemiyor.
- Boyut değişimi oyun içinde güvenli (sahneler yeniden kuruluyor); dikeyde "telefonu çevir" ipucu.
- AudioContext yokken ve localStorage engelliyken oyun çalışıyor.
- Android köprüsü (sahte Capacitor): kupa düğmesi, geri tuşu, skor bekletme ve girişten sonra gönderme.
- Artifact derlemeleri: dış istek yok, yazı tipleri gömülü, test sürümünde panel var.
- Bağış: menüde sessiz bağlantı (yeni sekme), uygulamada gizli; sayfa yapılandırılmamışken altı tutar "yakında", yapılandırılınca bağlantılar ve IBAN/Papara kopyalama çalışıyor.
- Yüksek zorlukta (d≈0,77, hız 642) 10 dakikalık otomatik pilot: 13 can kaybı, kule/geniş çukurda 0.

## Bilinen sınırlar ve riskler

- Başsız tarayıcıda FPS yazılım çizimiyle ölçülüyor (15 FPS); gerçek cihazlarda anlamlı değil. Oyun yavaş cihazlarda kaliteyi kendisi düşürüyor (doğrulandı).
- Android paketi bu ortamda derlenemedi (Google depolarına erişim yok); Java kodu API taslaklarına karşı derlendi. İlk derleme GitHub Actions'ta yapılmalı.
- Play Games oturumu, liderlik tablosu ve APK kurulumu gerçek cihazda denenmeli (aşağıdaki liste).

## Gerçek cihazda elle denenecekler

1. Telefonda (Chrome/Safari) menü, dokunuşla zıplama, basılı tutma, çift zıplama; sesin ilk dokunuşla açılması.
2. Yatay/dikey döndürme; tam ekran düğmesi; arka plana alınca duraklama.
3. Android uygulaması: açılış ekranı, tam ekran, geri tuşu, kupa düğmesi → Play Games girişi → tablo; oyun sonunda skorun tabloda görünmesi (birkaç dakika sürebilir).
4. Eğitim akışı ve "Eğitimi geç"; oyun sonu → "Yeniden koş" (eğitimsiz).
5. Uzun koşu (10+ dk): hız artışı, kuleler ve geniş çukurlar seyrek mi, okunabilirlik.
