# Google Play'de yayın rehberi

Bu rehber, oyunu Android uygulaması olarak Google Play'de yayınlamak ve Google Play Games liderlik tablosunu açmak için gereken adımları sırasıyla anlatır. Bilgisayarınıza Android Studio kurmanız gerekmez: uygulama paketi GitHub Actions'ta derlenir.

> Bu rehber Ekim 2026 koşullarına göre yazıldı. Google Play kuralları zaman zaman değişir; Play Console'daki uyarılar her zaman önceliklidir.

---

## 0. Bir kez karar verilecekler

**Paket adı:** `com.yuzyilinizinde.oyun`. Play'e ilk yüklemeden sonra **asla değiştirilemez**. Değiştirmek isterseniz ilk yüklemeden önce şu dört yerde aynı anda değiştirin:
`capacitor.config.json` (appId), `android/app/build.gradle` (namespace ve applicationId), `android/app/src/main/res/values/strings.xml` (package_name ve custom_url_scheme) ve `android/app/src/main/java/com/yuzyilinizinde/oyun/` klasörünün yolu ile içindeki üç dosyanın ilk satırındaki `package`.

**Ücret ve gelir:** Oyun ücretsiz, reklamsız ve uygulama içi satın almasız yayınlanır. Bağış sayfası (`bagis.html`) web sürümünde ana menüden açılır; Android uygulamasında bağlantı varsayılan olarak gizlidir (Play'in ödeme politikası uygulama içinden Play dışı ödeme sayfalarına yönlendirmeyi kısıtlar). Bağış sayfasının adresini mağaza açıklamasına ya da web sitenize koyabilirsiniz; veri güvenliği ve içerik beyanlarında bağışla ilgili bir şey beyan etmeniz gerekmez.

---

## 1. Geliştirici hesabı

1. <https://play.google.com/console/signup> adresinden **kişisel** geliştirici hesabı açın (tek seferlik 25 ABD doları).
2. Kimlik doğrulamasını ve telefon doğrulamasını tamamlayın. Geliştirici adı mağazada herkese görünür.
3. **Önemli:** 13 Kasım 2023'ten sonra açılan kişisel hesaplarda, üretime (herkese açık yayına) geçmeden önce **en az 12 test kullanıcısıyla 14 gün kesintisiz kapalı test** yapılması zorunludur (adım 7).

---

## 2. Yükleme anahtarı (bir kez)

Google Play, uygulamayı kendi **uygulama imzalama anahtarıyla** imzalar (Play Uygulama İmzalama). Sizin elinizde yalnızca **yükleme anahtarı** olur. Bu dosyayı ve parolasını kaybetmeyin, kimseyle paylaşmayın; yedekleyin.

Java yüklü bir bilgisayarda (Android Studio ile gelir) terminalde:

```bash
keytool -genkeypair -v -keystore yuzyilin-izinde-upload.jks -alias upload -keyalg RSA -keysize 4096 -validity 10000
```

Parolayı ve sorulan bilgileri girin. Sonra dosyanın base64 hâlini alın:

- macOS: `base64 -i yuzyilin-izinde-upload.jks | tr -d '\n' > anahtar-base64.txt`
- Linux: `base64 -w0 yuzyilin-izinde-upload.jks > anahtar-base64.txt`
- Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("yuzyilin-izinde-upload.jks")) | Set-Content anahtar-base64.txt`

GitHub deposunda **Settings → Secrets and variables → Actions → New repository secret** ile dört sır ekleyin:

| Sır adı | Değer |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `anahtar-base64.txt` dosyasının içeriği |
| `ANDROID_KEYSTORE_PASSWORD` | anahtar deposu parolası |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | anahtar parolası (genellikle aynı parola) |

`.jks` dosyasını ve `anahtar-base64.txt` dosyasını **depoya eklemeyin** (`.gitignore` bunları zaten dışlar).

---

## 3. Uygulamayı derleme

### 3.1 Depoyu ilk kez kurma (bilgisayar gerekmez)

1. <https://github.com/new> adresinde boş bir depo açın (ör. `yuzyilin-izinde`; **Add a README file** kutusunu işaretleyin).
2. Depoda **Add file → Create new file**; dosya adına `.github/workflows/android.yml` yazın ve projedeki `.github/workflows/android.yml` dosyasının içeriğini yapıştırıp **Commit changes** deyin.
3. **Add file → Upload files** ile projenin zip dosyasını (`yuzyilin-izinde.zip`) depo köküne yükleyip **Commit changes** deyin.
4. **Actions** sekmesinde "Android paketi" işi kendiliğinden başlar: zip'i açar, dosyaları depoya işler (zip'i siler) ve derler. 5–10 dakika sürer.

Zip'in içindeki `deploy.yml` (GitHub Pages yayını) `.github/eklenecek-is-akislari/` klasörüne konur; web sürümünü de yayınlamak isterseniz onu `.github/workflows/` içine taşıyın (Actions bu dosyaları kendi kendine yazamaz).

### 3.2 Her derleme

1. **Actions → Android paketi → Run workflow** (main dalına her gönderimde de kendiliğinden çalışır).
2. İş bitince depodaki **Releases** sayfasında en üstteki kayıtta dosyalar görünür; telefondan doğrudan indirip kurabilirsiniz (aynı dosyalar iş sayfasının altındaki **Artifacts** bölümünde de bulunur):
   - `...-release.aab` → Google Play'e yüklenecek dosya
   - `...-release.apk` → telefonunuza doğrudan kurup deneyebileceğiniz imzalı paket
   - `...-debug.apk` → imza sırları (adım 2) henüz eklenmemişse üretilen deneme paketi; oynamak için yeterlidir, Play'e yüklenemez
3. Sürüm numaraları kendiliğinden artar (versionCode = 100 + iş numarası). Sürüm adı `package.json` içindeki `version` alanından gelir; yeni sürümde orayı değiştirin (ör. `1.0.1`) ya da `v1.0.1` etiketi gönderin; etiketler kalıcı bir Release oluşturur, diğer derlemeler "ön sürüm" olarak işaretlenir.

---

## 4. Play Console'da uygulamayı oluşturma

**Tüm uygulamalar → Uygulama oluştur:**
- Uygulama adı: `Yüzyılın İzinde` · Varsayılan dil: **Türkçe – tr-TR**
- Uygulama mı, oyun mu: **Oyun** · Ücretsiz mi, ücretli mi: **Ücretsiz**
- Beyanları onaylayın.

---

## 5. Google Play Games liderlik tablosu

### 5.1 Play Games Hizmetleri projesi
**Büyüme → Play Games Hizmetleri → Kurulum ve yönetim → Yapılandırma:**
1. "Oyunum zaten Google API'lerini kullanmıyor" seçeneğiyle **yeni bir Play Games Hizmetleri projesi** oluşturun (arka planda bir Google Cloud projesi açılır).
2. Bu sayfadaki **Proje kimliği**ni (yalnızca rakamlar) not edin.

### 5.2 Kimlik bilgisi (oturum açabilmek için zorunlu)
1. Yapılandırma sayfasında **Kimlik bilgisi ekle → Android**.
2. İstenirse Google Cloud'da **OAuth izin ekranı**nı yapılandırın (Kullanıcı türü: Harici; uygulama adı, destek e-postası).
3. Android OAuth istemcisi oluşturun: paket adı `com.yuzyilinizinde.oyun`, **SHA-1** parmak izi olarak Play Console → **Test ve yayınla → Uygulama bütünlüğü → Uygulama imzalama** sayfasındaki **"Uygulama imzalama anahtarı sertifikası"** SHA-1 değerini kullanın. (Bu sayfa, ilk .aab dosyasını herhangi bir kanala yükledikten sonra görünür; o yüzden adım 6.1'i yapıp geri dönebilirsiniz.)
4. Telefonunuza Play dışından kurduğunuz imzalı APK ile de oturum açmak isterseniz aynı sayfadaki **yükleme anahtarı** SHA-1'iyle ikinci bir Android kimlik bilgisi ekleyin.

### 5.3 Liderlik tablosu
**Kurulum ve yönetim → Liderlik tabloları → Liderlik tablosu oluştur:**
- Ad: `En uzun yolculuk`
- Puan biçimi: **Sayısal**, ondalık basamak: **0**, özel birim: tekil `metre`, çoğul `metre`
- Sıralama: **Daha büyük daha iyi**
- Simge: `store/grafik/liderlik-simgesi-512.png`
- Alt sınır `0`, üst sınır `10000000` (hile koruması açık kalabilir)

Oluşturduktan sonra liderlik tablosu kimliğini (`CgkI…` ile başlar) not edin.

### 5.4 Kimlikleri uygulamaya yazma
GitHub'da `android/app/src/main/res/values/games-ids.xml` dosyasını açıp kalem simgesiyle düzenleyin:

```xml
<string name="game_services_project_id" translatable="false">123456789012</string>
<string name="leaderboard_distance" translatable="false">CgkIxxxxxxxxxxEAIQAQ</string>
```

Kaydedip **Android paketi** işini yeniden çalıştırın. (Kimlikler girilmeden derlenen uygulama da sorunsuz çalışır; yalnızca liderlik düğmesi görünmez.)

### 5.5 Test kullanıcıları ve yayın
- **Play Games Hizmetleri → Test kullanıcıları**: kendi Google hesabınızı ve test edenleri ekleyin. Play Games yapılandırması yayınlanana kadar yalnızca bu hesaplar oturum açabilir.
- Her şey çalışınca **Play Games Hizmetleri → Kurulum ve yönetim → İncele ve yayınla** ile yapılandırmayı yayınlayın.

**Oyunun içinde:** Oyun açılınca Play Games oturumu kendiliğinden açılır. Menüde sağ üstteki kupa simgesi ve oyun sonundaki **Liderlik tablosu** düğmesi tabloyu açar; her oyunun sonunda koşulan mesafe (metre) gönderilir. Oturum yoksa skor saklanır ve oturum açılınca gönderilir.

---

## 6. Test kanalları

### 6.1 Dahili test (hemen)
**Test et ve yayınla → Test → Dahili test → Yeni sürüm oluştur:** `.aab` dosyasını yükleyin, sürüm notunu yazın, kendinizi test kullanıcısı olarak ekleyip katılım bağlantısıyla uygulamayı Play'den kurun. Play Games oturumu ve liderlik tablosu en güvenilir biçimde bu kurulumla denenir.

### 6.2 Kapalı test (yeni kişisel hesaplar için zorunlu)
1. **Kapalı test → Kanal oluştur**, `.aab` yükleyin.
2. **En az 12** test kullanıcısı ekleyin (e-posta listesi ya da Google Grubu). Katılım bağlantısını gönderin; her biri bağlantıdan katılıp uygulamayı Play'den kurmalı ve **14 gün boyunca** kurulu tutmalı, ara ara oynamalı.
3. 14 gün dolunca **Kontrol paneli → Üretim erişimi başvurusu**nu doldurun (test süreci ve geri bildirimler hakkında birkaç soru sorulur).

---

## 7. Uygulama içeriği beyanları
**Politika ve programlar → Uygulama içeriği** sayfasındaki her başlığı doldurun:

| Başlık | Yanıt |
|---|---|
| Gizlilik politikası | `https://KULLANICI-ADINIZ.github.io/DEPO-ADI/privacy.html` (önce `privacy.html` içindeki `BURAYA-E-POSTA-ADRESINIZ` yerine e-postanızı yazın) |
| Uygulama erişimi | Tüm işlevler özel erişim gerektirmeden kullanılabilir |
| Reklamlar | Hayır, uygulamamda reklam yok |
| Reklam kimliği | Hayır (izin bildirimden kaldırıldı) |
| İçerik derecelendirmesi | Aşağıdaki 7.1 |
| Hedef kitle | 13–15, 16–17, 18 ve üzeri (13 yaş altı seçilirse Aileler politikası devreye girer) · "Çocukların ilgisini çekebilir mi?" → Hayır |
| Veri güvenliği | Aşağıdaki 7.2 |
| Haber uygulaması / Devlet uygulaması / Finansal özellikler / Sağlık | Hayır |

### 7.1 İçerik derecelendirmesi (IARC anketi)
Kategori **Oyun**. Soruları dürüstçe yanıtlayın; yol gösterici olarak:
- Oyuncu kimseye zarar vermez; kan, yaralanma, silah kullanımı yoktur. Tarihî olaylar (savaşlar, darbeler, saldırılar, depremler) **yazıyla ve siluet sahnelerle** anlatılır: asker, top ve tank siluetleri görünür, şiddet anı gösterilmez. Şiddet sorularında bunu "gerçekçi olmayan, tarihî bağlamda ima edilen" düzeyinde yanıtlayın.
- Korku/rahatsız edici içerik: deprem ve yas anları ağırbaşlı biçimde, görsel dehşet olmadan anlatılır.
- Cinsellik, küfür, uyuşturucu, kumar: yok.
- Kullanıcı etkileşimi (sohbet vb.): yok. Konum paylaşımı: yok. Dijital satın alma: yok.

Sonuç büyük olasılıkla "7 yaş ve üzeri" civarında çıkar; kesin derece anketin sonucudur.

### 7.2 Veri güvenliği
Oyunun kendisi veri toplamaz; ancak Google Play Games SDK'sı oturum açan oyuncular için veri işler ve Play bunun beyan edilmesini ister (resmî kaynak: <https://developer.android.com/games/pgs/data-collection>). Önerilen yanıtlar:

- Uygulamanız gerekli kullanıcı veri türlerinden herhangi birini topluyor ya da paylaşıyor mu? **Evet**
- Aktarım sırasında şifreleniyor mu? **Evet**
- Kullanıcılar verilerinin silinmesini isteyebiliyor mu? **Evet** (Play Games profili ya da Google Hesabım üzerinden; gizlilik politikasında anlatılıyor)
- Toplanan veriler (hepsi **toplanıyor, paylaşılmıyor**):
  - **Kişisel bilgiler → Kullanıcı kimlikleri** (Play Games oyuncu kimliği): Uygulama işlevselliği
  - **Uygulama etkinliği → Diğer işlemler** (liderlik tablosuna gönderilen skor): Uygulama işlevselliği
  - **Uygulama bilgileri ve performansı → Kilitlenme günlükleri, Teşhis**: Analiz (SDK kararlılığı)

Bu yanıtların doğruluğundan geliştirici sorumludur; Google'ın sayfası değişirse ona göre güncelleyin.

---

## 8. Mağaza girişi
`store/listeleme-tr.md` dosyasındaki metinleri ve `store/grafik/` klasöründeki görselleri yükleyin (simge 512×512, öne çıkan görsel 1024×500, en az 2 en çok 8 telefon ekran görüntüsü). İsterseniz `store/listeleme-en.md` ile İngilizce çeviri ekleyin.

---

## 9. Üretime çıkış ve güncellemeler
1. Üretim erişimi onaylanınca **Üretim → Yeni sürüm oluştur**, `.aab` yükleyin, ülkeleri seçin (ör. tüm ülkeler) ve incelemeye gönderin. İlk inceleme birkaç gün sürebilir.
2. Güncelleme için: oyunda değişiklik yapın → `package.json` içindeki `version` değerini artırın → **Android paketi** işini çalıştırın → yeni `.aab` dosyasını önce dahili teste, sonra üretime yükleyin.
3. **Hedef API düzeyi:** Proje Android 16'yı (API 36) hedefler; Google Play'in Ağustos 2026'dan beri istediği düzey budur. Google her yıl bu sınırı yükseltir; Capacitor'ı güncellemek (`npm i @capacitor/core@latest @capacitor/android@latest @capacitor/cli@latest` ve `npx cap sync android`) genellikle yeterlidir.

---

## Sık sorunlar

- **Liderlik düğmesi görünmüyor:** `games-ids.xml` içindeki proje kimliği boş ya da hatalı; yalnızca rakamlardan oluşmalı.
- **"Giriş yapılamadı":** SHA-1 parmak izi (5.2) ya da paket adı yanlış; hesap test kullanıcısı değil (5.5); uygulama Play dışından kurulmuş ve yükleme anahtarı kimlik bilgisi eklenmemiş.
- **Skor görünmüyor:** Liderlik tablosu kimliği hatalı ya da tablo henüz yayınlanmamış; Play Games'in skorları göstermesi birkaç dakika sürebilir.
- **Derleme hatası:** Actions sayfasındaki günlüğün sonundaki hata satırını kontrol edin; çoğunlukla eksik bir sır (adım 2) ya da hatalı biçimlenmiş bir XML (5.4) sebeptir.
