/* =========================================================================
   Yüzyılın İzinde — tarih çizelgesi, dönemler ve atmosfer paletleri
   Olayları düzenlemek için yalnızca bu dosyadaki EVENTS listesini değiştirmeniz yeterli.
   Alanlar:
     d  : tarih ('YYYY', 'YYYY-AA' veya 'YYYY-AA-GG')
     c  : kategori  S=Siyasi, T=Toplumsal, E=Ekonomik, D=Doğal
     t  : başlık,  x : kısa açıklama
     s  : arka plan sahnesi (scenes-1.js / scenes-2.js içindeki çizimlerden biri)
     p  : sahne parametreleri (isteğe bağlı)
     m  : atmosfer/ruh hâli (isteğe bağlı)
     fx : özel efektler: shake, slow, siren, fireworks, cheer, whistle, cannon, blackout
     o  : bu olay sırasında çıkacak özel engeller
   ========================================================================= */
(function () {
  'use strict';
  const IZ = window.IZ;

  IZ.CATS = {
    S: { name: 'SİYASİ', color: '#e2483e' },
    T: { name: 'TOPLUMSAL', color: '#e6b35a' },
    E: { name: 'EKONOMİK', color: '#79b58a' },
    D: { name: 'DOĞAL', color: '#6fa8d8' },
    F: { name: 'GELECEK', color: '#f2e6c9' },
  };

  IZ.MONTHS = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];

  // ------------------------------------------------------------------ dönemler
  IZ.ERAS = [
    {
      from: 1920, name: 'Kuruluş Yılları', key: 'kurulus',
      pal: { skyTop: '#6a5f4c', skyMid: '#b5a482', skyBot: '#eadfc4', fog: '#cdbf9f', sun: '#fff4d8', sunX: 0.74, sunY: 330, rays: 0.35, sunVis: 1 },
      grade: { sepia: 0.86 },
      film: { grain: 0.11, scratch: 0.55, flicker: 0.42, dust: 0.5, vignette: 0.72, scan: 0 },
      ground: 'dirt',
      // Kurtuluş ve kuruluş: cephane sandıkları, kağnı tekerleği, çuvallar, kilometre taşları
      obs: { ammo: 3, kagni: 2, sacks: 2, milestone: 2, rock: 2, stump: 1, log: 1 }, tall: 'ammoStack', tower: 'ammoTower',
      plat: ['cart', 'wagon'],
    },
    {
      from: 1938, name: 'İnönü ve Savaş Yılları', key: 'savas',
      pal: { skyTop: '#4a4d50', skyMid: '#8f918d', skyBot: '#d4d0c4', fog: '#b4b0a5', sun: '#f4f1e8', sunX: 0.7, sunY: 300, rays: 0.25, sunVis: 0.9 },
      grade: { gray: 0.72, sepia: 0.28 },
      film: { grain: 0.1, scratch: 0.4, flicker: 0.32, dust: 0.4, vignette: 0.74, scan: 0 },
      ground: 'dirt',
      // savaş yılları: kum torbaları, dikenli tel, bidonlar, karne ile dağıtılan un çuvalları
      obs: { sandbags: 3, wire: 2, jerrycan: 2, sacks: 2, milk: 1 }, tall: 'sandbagTall', tower: 'sandbagTower',
      plat: ['cart', 'wagon'],
    },
    {
      from: 1950, name: 'Demokrat Parti Yılları', key: 'dp',
      pal: { skyTop: '#47708a', skyMid: '#a3bcb8', skyBot: '#efdcb3', fog: '#cbc4a9', sun: '#fff0c8', sunX: 0.72, sunY: 360, rays: 0.3, sunVis: 1 },
      grade: { desat: 0.35, warm: 0.5 },
      film: { grain: 0.09, scratch: 0.2, flicker: 0.14, dust: 0.25, vignette: 0.62, scan: 0 },
      ground: 'cobble',
      // 50'ler: saman balyası, süt güğümü, traktör lastiği, el arabası, şehre göçün bavulları
      obs: { hay: 2, milk: 2, tractorTire: 2, wheelbarrow: 2, suitcase: 1, bench: 1 }, tall: 'hayStack', tower: 'hayTower',
      plat: ['wagon', 'bus'],
    },
    {
      from: 1960, name: 'Darbeler ve Çalkantılar', key: 'darbeler',
      pal: { skyTop: '#33465a', skyMid: '#b07c58', skyBot: '#f2b77a', fog: '#c8946f', sun: '#ffd9a2', sunX: 0.7, sunY: 230, rays: 0.4, sunVis: 1 },
      grade: { warm: 0.6, desat: 0.15 },
      film: { grain: 0.1, scratch: 0.12, flicker: 0.08, dust: 0.15, vignette: 0.66, scan: 0 },
      ground: 'curb',
      // 60–70'ler: tüp, varil, briket yığını, beton boru, çöp bidonu
      obs: { gas: 2, drum: 2, bricks: 2, pipe: 2, bins: 1, tires: 1 }, tall: 'blockStack', tower: 'blockTower',
      plat: ['bus', 'truck'],
    },
    {
      from: 1980, name: 'Dışa Açılma ve Krizler', key: 'acilim',
      pal: { skyTop: '#1f2a4f', skyMid: '#6b4e78', skyBot: '#f19c7a', fog: '#9f768a', sun: '#ffd2b4', sunX: 0.72, sunY: 190, rays: 0.35, sunVis: 1 },
      grade: { cool: 0.3 },
      film: { grain: 0.06, scratch: 0.0, flicker: 0.0, dust: 0.05, vignette: 0.6, scan: 0.35 },
      ground: 'curb',
      // 80–90'lar: yol bariyeri, koni, çatı su deposu, çanak anten, lastikler
      obs: { barrier: 2, cone: 2, waterTank: 2, dish: 2, bins: 1, tires: 1 }, tall: 'tireStack', tower: 'tireTower',
      plat: ['truck', 'container'],
    },
    {
      from: 2002, name: 'Yeni Binyıl', key: 'binyil',
      pal: { skyTop: '#15344c', skyMid: '#4a7f97', skyBot: '#f3c48f', fog: '#93b3ba', sun: '#fff2da', sunX: 0.72, sunY: 300, rays: 0.3, sunVis: 1 },
      grade: {},
      film: { grain: 0.035, scratch: 0, flicker: 0, dust: 0.05, vignette: 0.5, scan: 0 },
      ground: 'pave',
      // 2000'ler: şantiye bariyeri, elektrikli scooter, kargo kolileri, alışveriş arabası
      obs: { barrier2: 2, cone: 1, scooter: 2, parcels: 2, cart: 1 }, tall: 'parcelStack', tower: 'parcelTower',
      plat: ['container', 'truck'],
    },
    {
      from: 2026.85, name: 'Gelecek', key: 'gelecek',
      pal: { skyTop: '#2b3c69', skyMid: '#a093c4', skyBot: '#ffdcae', fog: '#cbbfd8', sun: '#fff7e2', sunX: 0.7, sunY: 150, rays: 0.5, sunVis: 1 },
      grade: {},
      film: { grain: 0.02, scratch: 0, flicker: 0, dust: 0.1, vignette: 0.45, scan: 0 },
      ground: 'meadow',
      // gelecek: teslimat robotları, bahçe kasaları, enerji dolapları
      obs: { pod: 2, planter: 2, rock: 1, scooter: 1 }, tall: 'battery', tower: 'batteryTower',
      plat: ['container'],
    },
  ];

  // ------------------------------------------------------------- ruh hâlleri
  IZ.MOODS = {
    day: {},
    dawn: { skyTop: '#3b4466', skyMid: '#b48aa0', skyBot: '#ffc9a0', fog: '#c8a9a6', sun: '#ffe0c0', sunY: 120, rays: 0.5 },
    dusk: { skyTop: '#24294a', skyMid: '#9a5a62', skyBot: '#ffae78', fog: '#a87c7a', sun: '#ffcc99', sunY: 110, rays: 0.45, darkness: 0.3 },
    overcast: { skyTop: '#5d6266', skyMid: '#8d9294', skyBot: '#bfc2bf', fog: '#a7aaa8', sun: '#e8e8e4', sunY: 420, rays: 0.04, sunVis: 0.22, darkness: 0.1 },
    mourning: { skyTop: '#2b2d30', skyMid: '#575a5d', skyBot: '#8a8c8b', fog: '#707374', sun: '#cfcfcf', sunY: 420, sunVis: 0.08, rays: 0, rain: 0.6, darkness: 0.35 },
    night: { skyTop: '#04060c', skyMid: '#0e1526', skyBot: '#26304a', fog: '#222b3e', sun: '#e3e9ff', sunY: 430, sunVis: 0.85, moon: 1, rays: 0.06, stars: 1, darkness: 0.88 },
    winter: { skyTop: '#59636e', skyMid: '#9aa5ae', skyBot: '#d8dde0', fog: '#b9c2c8', sun: '#f3f6ff', sunY: 380, sunVis: 0.35, rays: 0.08, snow: 1, darkness: 0.1 },
    winternight: { skyTop: '#05080f', skyMid: '#141c2c', skyBot: '#2f3a52', fog: '#2a3346', sun: '#dfe6ff', sunY: 450, sunVis: 0.5, moon: 1, rays: 0.03, stars: 0.5, snow: 1, darkness: 0.9 },
    fire: { skyTop: '#24110c', skyMid: '#7f3420', skyBot: '#ff8a40', fog: '#9a5638', sun: '#ffb070', sunY: 170, sunVis: 0.8, rays: 0.3, embers: 1, ash: 0.6, darkness: 0.45 },
    festive: { skyTop: '#3a3f6a', skyMid: '#c08a7a', skyBot: '#ffd08a', fog: '#d0a98c', sun: '#ffe6b0', sunY: 170, rays: 0.55 },
    nightfest: { skyTop: '#060812', skyMid: '#18183a', skyBot: '#3a2f55', fog: '#2a2946', sun: '#e8e6ff', sunY: 460, sunVis: 0.2, moon: 1, rays: 0, stars: 0.5, darkness: 0.85 },
    quake: { skyTop: '#4a4643', skyMid: '#857c72', skyBot: '#b3a797', fog: '#9e9385', sunVis: 0.2, rays: 0.05, dust: 1, darkness: 0.15 },
    storm: { skyTop: '#272d31', skyMid: '#4f585c', skyBot: '#7f8885', fog: '#68716f', sun: '#d4d8d4', sunY: 440, sunVis: 0.06, rays: 0, rain: 1, darkness: 0.4 },
    eclipse: { skyTop: '#070b1c', skyMid: '#1a2340', skyBot: '#d39a66', fog: '#363b54', sun: '#fff1d6', sunVis: 0, rays: 0, stars: 0.4, darkness: 0.72 },
    heat: { skyTop: '#8aa0aa', skyMid: '#ddcfae', skyBot: '#fbefd4', fog: '#e6d4b0', sun: '#fffbee', sunX: 0.62, sunY: 430, sunVis: 1, rays: 0.6, dust: 0.22 },
  };

  // ------------------------------------------------------------------ olaylar
  IZ.EVENTS = [
    { d: '1920-04-23', c: 'S', t: 'Büyük Millet Meclisi açıldı', x: 'Ankara’da toplanan Türkiye Büyük Millet Meclisi, Kurtuluş Savaşı’nı yönetecek yeni devletin temelini attı.', s: 'tbmm1920', m: 'dawn' },
    { d: '1921-01-20', c: 'S', t: 'İlk anayasa: Teşkilât-ı Esasiye', x: 'Meclis ilk anayasayı kabul etti; “Egemenlik kayıtsız şartsız milletindir” ilkesi ilk kez anayasaya yazıldı.', s: 'constitution', p: { v: 1921 }, m: 'winter' },
    { d: '1921-03-12', c: 'T', t: 'İstiklal Marşı kabul edildi', x: 'Mehmet Akif Ersoy’un yazdığı İstiklal Marşı, Türkiye Büyük Millet Meclisi’nde millî marş olarak kabul edildi.', s: 'tbmm1920', p: { anthem: true }, m: 'dusk' },
    { d: '1921-09-13', c: 'S', t: 'Sakarya Meydan Muharebesi', x: '22 gün 22 gece süren muharebe kazanıldı; Meclis, Mustafa Kemal Paşa’ya mareşal rütbesi ve gazi unvanı verdi.', s: 'battle', p: { v: 'sakarya' }, m: 'dusk', fx: ['cannon'] },
    { d: '1922-08-30', c: 'S', t: 'Büyük Taarruz ve zafer', x: '26 Ağustos’ta Kocatepe’den başlayan taarruz, 30 Ağustos’ta Başkomutanlık Meydan Muharebesi’yle zafere ulaştı; 9 Eylül’de İzmir’e girildi.', s: 'battle', p: { v: 'kocatepe' }, m: 'dawn', fx: ['cannon', 'cheer'] },
    { d: '1922-11-01', c: 'S', t: 'Saltanat kaldırıldı', x: 'Meclis, Osmanlı saltanatını kaldırdı. Son padişah Vahdettin, 17 Kasım’da bir İngiliz savaş gemisiyle İstanbul’dan ayrıldı.', s: 'sultanate', m: 'overcast' },
    { d: '1923-07-24', c: 'S', t: 'Lozan Antlaşması imzalandı', x: 'Yeni Türk devletinin sınırları ve bağımsızlığı uluslararası alanda tanındı.', s: 'lausanne' },
    { d: '1923-10-13', c: 'S', t: 'Ankara başkent oldu', x: 'Bozkırın ortasındaki küçük Anadolu kasabası, yeni devletin başkenti ilan edildi.', s: 'ankara' },
    { d: '1923-10-29', c: 'S', t: 'Cumhuriyet ilan edildi', x: 'Türkiye Cumhuriyeti kuruldu; Mustafa Kemal Paşa ilk Cumhurbaşkanı seçildi. Haber 101 pare top atışıyla duyuruldu.', s: 'republic', m: 'festive', fx: ['cannon', 'cheer'] },
    { d: '1924-03-03', c: 'T', t: 'Eğitim birleşti, halifelik kaldırıldı', x: 'Tevhid-i Tedrisat Kanunu ile bütün okullar tek çatı altında toplandı; aynı gün halifelik kaldırıldı.', s: 'school' },
    { d: '1924-04-20', c: 'S', t: '1924 Anayasası', x: 'Cumhuriyet’in ilk anayasası kabul edildi; yasama ve yürütme yetkisi Meclis’te toplandı.', s: 'constitution', p: { v: 1924 } },
    { d: '1925-11-25', c: 'T', t: 'Şapka Kanunu', x: 'Fes yerine şapka giyilmesi zorunlu hâle geldi; kılık kıyafette yeni bir dönem başladı.', s: 'hats' },
    { d: '1926-02-17', c: 'T', t: 'Türk Medeni Kanunu', x: 'Kadınlara miras, boşanma ve tanıklıkta eşit haklar tanındı; resmî nikâh zorunlu oldu, çok eşlilik yasaklandı.', s: 'civil' },
    { d: '1928-11-01', c: 'T', t: 'Harf Devrimi', x: 'Latin harflerine dayanan yeni Türk alfabesi kabul edildi; Millet Mektepleri’nde her yaştan insan okuma yazma öğrendi.', s: 'alphabet' },
    { d: '1929-10', c: 'E', t: 'Büyük Buhran', x: 'New York borsasının çöküşüyle başlayan dünya krizi Türkiye’yi de vurdu; tarım fiyatları çöktü, devlet ekonomide öne çıktı.', s: 'crash', m: 'overcast' },
    { d: '1932-02-19', c: 'T', t: 'Halkevleri açıldı', x: 'Türk Ocaklarının yerine kurulan Halkevleri; tiyatro, kütüphane, spor ve halk eğitimiyle şehirlerin kültür merkezleri oldu.', s: 'halkevi' },
    { d: '1933-10-29', c: 'T', t: 'Cumhuriyet’in onuncu yılı', x: 'Onuncu yıl coşkuyla kutlandı. Demiryolları Anadolu’nun içlerine uzanıyor, yeni fabrikalar kuruluyordu.', s: 'train', m: 'festive', fx: ['whistle', 'cheer'] },
    { d: '1934-06-21', c: 'T', t: 'Soyadı Kanunu', x: 'Herkes bir soyadı aldı. Meclis, Mustafa Kemal’e “Atatürk” soyadını verdi.', s: 'surname' },
    { d: '1934-12-05', c: 'S', t: 'Kadınlara seçme ve seçilme hakkı', x: '1930’da yerel seçimlerde oy kullanan kadınlar milletvekili seçme ve seçilme hakkı kazandı; 1935’te 18 kadın vekil Meclis’e girdi.', s: 'suffrage' },
    { d: '1935-09-16', c: 'E', t: 'Sanayileşme hamlesi', x: 'Birinci Beş Yıllık Sanayi Planı ile Sümerbank’ın Kayseri Bez Fabrikası açıldı; dokuma, kâğıt ve demir-çelik fabrikaları bunu izledi.', s: 'factory' },
    { d: '1936-07-20', c: 'S', t: 'Montrö Boğazlar Sözleşmesi', x: 'Türkiye, İstanbul ve Çanakkale boğazları üzerinde yeniden tam egemenlik kazandı.', s: 'straits' },
    { d: '1937-02-05', c: 'S', t: 'Altı ilke Anayasa’da', x: 'Cumhuriyetçilik, milliyetçilik, halkçılık, devletçilik, laiklik ve inkılapçılık ilkeleri Anayasa’ya girdi.', s: 'constitution', p: { v: 1937 }, m: 'winter' },
    { d: '1938-11-10', c: 'S', t: 'Atatürk’ün ölümü', x: 'Cumhuriyet’in kurucusu Mustafa Kemal Atatürk, saat 09.05’te Dolmabahçe Sarayı’nda hayatını kaybetti. Ülke yasa boğuldu.', s: 'dolmabahce', m: 'mourning', fx: ['slow', 'siren'] },
    { d: '1938-11-11', c: 'S', t: 'İsmet İnönü Cumhurbaşkanı', x: 'Meclis, İsmet İnönü’yü ikinci Cumhurbaşkanı seçti; “Millî Şef” dönemi başladı.', s: 'cankaya', m: 'overcast' },
    { d: '1939-06-29', c: 'S', t: 'Hatay Türkiye’ye katıldı', x: 'Hatay Meclisi’nin kararıyla Hatay Devleti Türkiye’ye katıldı.', s: 'hatay' },
    { d: '1939-09-01', c: 'S', t: 'İkinci Dünya Savaşı', x: 'Avrupa’da savaş başladı. Türkiye savaşın büyük bölümünde tarafsız kaldı; Şubat 1945’te Almanya ve Japonya’ya savaş ilan etti.', s: 'radio', p: { y1939: true }, m: 'overcast' },
    { d: '1939-12-27', c: 'D', t: 'Erzincan Depremi', x: 'Kışın ortasında gelen 7,9 büyüklüğündeki deprem yaklaşık 33 bin can aldı; Cumhuriyet tarihinin en ölümcül depremlerinden biri.', s: 'quake', p: { v: 1939 }, m: 'winter' },
    { d: '1940-04-17', c: 'T', t: 'Köy Enstitüleri', x: 'Köylerden seçilen gençleri öğretmen olarak yetiştiren okullar kuruldu; öğrenciler okullarını kendi elleriyle inşa etti.', s: 'village' },
    { d: '1942-11-11', c: 'E', t: 'Savaş ekonomisi ve Varlık Vergisi', x: 'Savaşa girmeyen Türkiye’de ekmek karneye bağlandı. Varlık Vergisi özellikle gayrimüslim vatandaşlara ağır yükler getirdi.', s: 'ration', m: 'overcast' },
    { d: '1945-06-26', c: 'S', t: 'Birleşmiş Milletler’in kurucuları arasında', x: 'Türkiye, San Francisco’da Birleşmiş Milletler Antlaşması’nı imzalayan 50 ülkeden biri oldu.', s: 'flags', p: { un: true } },
    { d: '1946-07-21', c: 'S', t: 'Çok partili hayata geçiş', x: 'Demokrat Parti’nin de katıldığı ilk çok partili genel seçim “açık oy, gizli tasnif” usulüyle yapıldı.', s: 'ballot', p: { city: 'ankaraOld', box: 'wood' } },
    { d: '1950-05-14', c: 'S', t: 'Demokrat Parti iktidarda', x: 'Seçimi DP kazandı ve 27 yıllık CHP iktidarı sona erdi. Celal Bayar Cumhurbaşkanı, Adnan Menderes Başbakan oldu.', s: 'ballot', p: { city: 'ankaraOld', box: 'wood', crowd: true }, m: 'festive', fx: ['cheer'] },
    { d: '1950-10', c: 'S', t: 'Kore Savaşı', x: 'Türkiye, Birleşmiş Milletler’in çağrısıyla Kore’ye bir tugay gönderdi.', s: 'troopship', m: 'overcast' },
    { d: '1951-06', c: 'E', t: 'Traktör ve Marshall Planı', x: 'Marshall Planı yardımlarıyla tarımda makineleşme hızlandı; traktör sayısı birkaç yılda on katından fazla arttı.', s: 'tractor' },
    { d: '1952-02-18', c: 'S', t: 'NATO üyeliği', x: 'Türkiye, Yunanistan ile birlikte Kuzey Atlantik İttifakı’na katıldı.', s: 'flags', p: { nato: true, city: 'ankaraOld' } },
    { d: '1953-11-10', c: 'T', t: 'Anıtkabir', x: 'Atatürk’ün naaşı, 15 yıl kaldığı geçici kabrinden Anıtkabir’e taşındı.', s: 'anitkabir', m: 'overcast' },
    { d: '1955-09-06', c: 'T', t: '6–7 Eylül Olayları', x: 'İstanbul’da başta Rumlar olmak üzere gayrimüslimlerin ev, dükkân ve ibadethanelerine saldırılar düzenlendi; olaylar göçü hızlandırdı.', s: 'riot', m: 'night' },
    { d: '1958-08-04', c: 'E', t: 'Devalüasyon', x: 'Döviz darboğazı büyüyünce IMF destekli istikrar programıyla lira devalüe edildi; dolar 2,80 liradan 9 liraya çıktı.', s: 'currency', p: { y1958: true }, m: 'overcast' },
    { d: '1960-05-27', c: 'S', t: '27 Mayıs Darbesi', x: 'Ordu yönetime el koydu. Başbakan Adnan Menderes ile bakanlar Fatin Rüştü Zorlu ve Hasan Polatkan 1961’de idam edildi.', s: 'tanks', p: { time: 'dawn' }, m: 'dawn' },
    { d: '1961-07-09', c: 'S', t: '1961 Anayasası', x: 'Halkoylamasında %61,7 “evet” oyuyla kabul edildi; Anayasa Mahkemesi kuruldu, iki meclisli parlamentoya geçildi.', s: 'ballot', p: { city: 'ankaraOld', box: 'wood', referendum: true } },
    { d: '1961-10-30', c: 'T', t: 'Almanya’ya işçi göçü', x: 'Batı Almanya ile işgücü anlaşması imzalandı; Sirkeci Garı’ndan kalkan trenlerle yüz binlerce kişi gurbete gitti.', s: 'station', fx: ['whistle'], o: ['suitcase'] },
    { d: '1963-09-12', c: 'E', t: 'Ankara Antlaşması', x: 'Türkiye ile Avrupa Ekonomik Topluluğu arasında ortaklık anlaşması imzalandı; tam üyelik hedefi resmen kayda geçti.', s: 'eu', p: { y1963: true } },
    { d: '1966-08-19', c: 'D', t: 'Varto Depremi', x: 'Muş’un Varto ilçesinde 6,9 büyüklüğündeki deprem köyleri yıktı; 2.394 kişi hayatını kaybetti.', s: 'quake', p: { v: 1966 }, m: 'quake' },
    { d: '1966-12-19', c: 'E', t: 'İlk yerli seri üretim otomobil', x: 'Anadol, Otosan fabrikasında banttan indi; otomobil sahibi olmak orta sınıfın hayali hâline geldi.', s: 'car', p: { model: 'anadol' } },
    { d: '1968-01-31', c: 'T', t: 'Televizyon yayını başladı', x: 'TRT Ankara’da ilk televizyon yayınını yaptı; televizyonu olan evlerde komşular ekran başında toplandı.', s: 'tv', m: 'dusk' },
    { d: '1970-06-15', c: 'T', t: '15–16 Haziran direnişi', x: 'Sendika özgürlüğünü kısıtlayan yasa değişikliğine karşı İstanbul ve Kocaeli’de on binlerce işçi iş bırakıp yürüdü.', s: 'factory', p: { march: true }, m: 'dusk' },
    { d: '1971-03-12', c: 'S', t: '12 Mart Muhtırası', x: 'Genelkurmay’ın radyodan okunan muhtırası üzerine Süleyman Demirel hükümeti istifa etti.', s: 'radio', m: 'overcast' },
    { d: '1973-10-30', c: 'E', t: 'Boğaziçi Köprüsü', x: 'Cumhuriyet’in 50. yılında Asya ile Avrupa’yı birbirine bağlayan ilk köprü hizmete açıldı.', s: 'bridge', p: { kind: 'bogazici' }, m: 'festive', fx: ['fireworks', 'cheer'] },
    { d: '1974-07-20', c: 'S', t: 'Kıbrıs Barış Harekâtı', x: 'Adadaki darbenin ardından Türkiye, garantör ülke sıfatıyla Kıbrıs’a askerî harekât düzenledi.', s: 'cyprus' },
    { d: '1976-11-24', c: 'D', t: 'Çaldıran-Muradiye Depremi', x: 'Van’ın Çaldıran ve Muradiye ilçelerinde 7,5 büyüklüğündeki deprem köyleri yıktı; kış soğuğunda 3.840 kişi hayatını kaybetti.', s: 'quake', p: { v: 1976 }, m: 'winter' },
    { d: '1979', c: 'E', t: 'Kuyruk yılları', x: 'Döviz darlığı yüzünden akaryakıt, tüp ve yağ gibi temel ihtiyaçlar için uzun kuyruklar hayatın parçası oldu.', s: 'queue', m: 'overcast', o: ['gas'] },
    { d: '1980-01-24', c: 'E', t: '24 Ocak Kararları', x: 'İhracata ve serbest piyasaya dayalı yeni bir ekonomi modeline geçildi; programın mimarı Turgut Özal’dı.', s: 'port' },
    { d: '1980-09-12', c: 'S', t: '12 Eylül Darbesi', x: 'Ordu yönetime el koydu; Meclis ve siyasi partiler kapatıldı, yüz binlerce kişi gözaltına alındı.', s: 'tanks', p: { time: 'night' }, m: 'night', o: ['barrier'] },
    { d: '1982-11-07', c: 'S', t: '1982 Anayasası', x: 'Halkoylamasında %91,4 “evet” oyuyla kabul edildi; Kenan Evren aynı oylamayla Cumhurbaşkanı oldu.', s: 'ballot', p: { city: 'ankara', box: 'wood', referendum: true, onlyYes: true }, m: 'overcast' },
    { d: '1983-11-06', c: 'S', t: 'Özal dönemi', x: 'Seçimi ANAP kazandı. Başbakan Turgut Özal’la birlikte dışa açılma, ihracat ve özelleştirme dönemi başladı.', s: 'city80', m: 'dusk' },
    { d: '1984-08-15', c: 'S', t: 'PKK saldırıları başladı', x: 'Eruh ve Şemdinli baskınlarıyla başlayan silahlı çatışmalar, sonraki yıllarda on binlerce kişinin hayatına mal oldu.', s: 'mountains', m: 'night' },
    { d: '1987-04-14', c: 'S', t: 'Avrupa Topluluğu’na başvuru', x: 'Türkiye, Avrupa Topluluğu’na tam üyelik için resmen başvurdu; 1963’te başlayan ortaklık yeni bir aşamaya taşındı.', s: 'eu' },
    { d: '1988-07-03', c: 'E', t: 'Fatih Sultan Mehmet Köprüsü', x: 'Boğaz’daki ikinci köprü, Rumelihisarı’nın hemen yanında açıldı ve İstanbul’un iki yakasını yeniden bağladı.', s: 'bridge', p: { kind: 'fsm' }, m: 'dusk' },
    { d: '1988-09-20', c: 'T', t: 'Naim Süleymanoğlu’na altın madalya', x: '“Cep Herkülü”, Seul Olimpiyatları’nda 60 kiloda şampiyon oldu; silkmede kaldırdığı 190 kilo, kendi ağırlığının üç katını aşıyordu.', s: 'lift', m: 'night', fx: ['cheer'] },
    { d: '1989-06', c: 'T', t: 'Bulgaristan’dan büyük göç', x: 'Bulgaristan’daki asimilasyon politikalarından kaçan yaklaşık 300 bin soydaş Türkiye’ye sığındı.', s: 'migration', o: ['suitcase'] },
    { d: '1991-01-17', c: 'S', t: 'Körfez Savaşı', x: 'Irak’a hava harekâtı başladı; Türkiye İncirlik’i açtı. Nisan’da Kuzey Irak’tan kaçan yüz binlerce kişi sınıra dayandı.', s: 'gulf', m: 'winter' },
    { d: '1992-07-25', c: 'E', t: 'Atatürk Barajı', x: 'Güneydoğu Anadolu Projesi’nin kalbi Atatürk Barajı açıldı; Fırat’ın suları tarıma ve elektriğe dönüştü.', s: 'dam' },
    { d: '1993-04-12', c: 'T', t: 'Türkiye internete bağlandı', x: 'ODTÜ’de kurulan 64 kilobitlik hatla Türkiye’nin ilk internet bağlantısı gerçekleşti.', s: 'internet', m: 'night' },
    { d: '1993-04-17', c: 'S', t: 'Turgut Özal’ın ölümü', x: 'Cumhurbaşkanı Turgut Özal görevdeyken hayatını kaybetti; yerine Süleyman Demirel seçildi.', s: 'funeral', m: 'mourning' },
    { d: '1993-06-25', c: 'S', t: 'İlk kadın başbakan', x: 'Tansu Çiller, Türkiye’nin ilk kadın başbakanı oldu.', s: 'parliament' },
    { d: '1994-04-05', c: 'E', t: '5 Nisan Kararları', x: 'Ağır bir döviz krizinin ardından kemer sıkma programı açıklandı; Türk lirası birkaç ayda değerinin yarısından fazlasını yitirdi.', s: 'economy', p: { trend: 'down' }, m: 'overcast' },
    { d: '1996-01-01', c: 'E', t: 'Gümrük Birliği', x: 'Avrupa Birliği ile Gümrük Birliği yürürlüğe girdi; sanayi ürünlerinde gümrük vergileri kalktı.', s: 'customs', m: 'winter' },
    { d: '1997-02-01', c: 'T', t: 'Sürekli Aydınlık İçin Bir Dakika Karanlık', x: 'Susurluk skandalına tepki olarak milyonlarca kişi her akşam saat 21.00’de ışıklarını bir dakika söndürdü.', s: 'blackout', m: 'night', fx: ['blackout'] },
    { d: '1997-02-28', c: 'S', t: '28 Şubat Süreci', x: 'MGK kararlarının ardından Erbakan hükümeti istifa etti; süreç “postmodern darbe” olarak anıldı.', s: 'tanks', p: { time: 'day', few: true }, m: 'overcast' },
    { d: '1999-02-15', c: 'S', t: 'Öcalan yakalandı', x: 'PKK lideri Abdullah Öcalan Kenya’da yakalanarak Türkiye’ye getirildi.', s: 'jet', m: 'night' },
    { d: '1999-08-17', c: 'D', t: 'Marmara Depremi', x: 'Gece 03.02’de Gölcük merkezli 7,4 büyüklüğündeki deprem 17 binden fazla can aldı; gönüllü arama kurtarma ekipleri umut oldu.', s: 'quake', p: { v: 1999 }, m: 'night', b: 'kent' },
    { d: '1999-12', c: 'S', t: 'Avrupa Birliği adaylığı', x: 'Helsinki Zirvesi’nde Türkiye, Avrupa Birliği’ne resmen aday ülke olarak kabul edildi.', s: 'eu', m: 'winter' },
    { d: '2000-05-17', c: 'T', t: 'Galatasaray’a UEFA Kupası', x: 'Kopenhag’daki finalde Arsenal’i penaltılarla yenen Galatasaray, Avrupa kupası kazanan ilk Türk takımı oldu.', s: 'stadium', p: { cup: true }, b: 'istanbul', m: 'nightfest', fx: ['fireworks', 'cheer'] },
    { d: '2001-02-21', c: 'E', t: '2001 Krizi', x: '“Kara Çarşamba”da faizler uçtu, borsa çöktü; lira dalgalanmaya bırakıldı ve yüz binlerce kişi işini kaybetti.', s: 'economy', p: { trend: 'crash', bank: true }, m: 'overcast' },
    { d: '2002-06-29', c: 'T', t: 'Dünya Kupası üçüncülüğü', x: 'A Millî Futbol Takımı, Güney Kore ve Japonya’daki Dünya Kupası’nı üçüncü bitirdi; sokaklar bayram yerine döndü.', s: 'stadium', m: 'nightfest', fx: ['fireworks', 'cheer'] },
    { d: '2002-08-03', c: 'S', t: 'İdam cezası kaldırıldı', x: 'AB uyum yasalarıyla barış zamanında idam cezası kaldırıldı; Kürtçe yayına ve kurslara izin verildi.', s: 'parliament', p: { scales: true, doves: true }, m: 'dusk' },
    { d: '2002-11-03', c: 'S', t: 'AK Parti iktidarda', x: 'Kuruluşundan yaklaşık bir yıl sonra seçime giren AK Parti tek başına iktidar oldu; Meclis’e yalnızca AK Parti ve CHP girebildi.', s: 'ballot', p: { city: 'ankara', box: 'clear' } },
    { d: '2003-03-01', c: 'S', t: '1 Mart Tezkeresi', x: 'Meclis, ABD askerlerinin Irak savaşı için Türkiye’den geçişine izin veren tezkereyi kabul etmedi.', s: 'parliament', p: { vote: [264, 250, 19, 'KABUL EDİLMEDİ'] }, m: 'overcast' },
    { d: '2004-04-24', c: 'S', t: 'Annan Planı referandumu', x: 'Kıbrıs’ın birleşmesi için hazırlanan planı Kıbrıslı Türkler kabul etti, Rumlar reddetti; ada bölünmüş hâlde AB’ye girdi.', s: 'ballot', p: { city: 'kibris', box: 'clear', referendum: true }, b: 'sahil' },
    { d: '2005-01-01', c: 'E', t: 'Paradan altı sıfır atıldı', x: '1.000.000 TL, 1 Yeni Türk Lirası oldu; cüzdanlardaki milyonlar tarihe karıştı.', s: 'currency', m: 'winter' },
    { d: '2005-10-03', c: 'S', t: 'AB müzakereleri başladı', x: '1987’de üyelik başvurusu yapan, 1999’da aday ilan edilen Türkiye ile AB arasında tam üyelik müzakereleri başladı.', s: 'eu' },
    { d: '2006-10-12', c: 'T', t: 'Orhan Pamuk’a Nobel', x: 'Orhan Pamuk, Nobel Edebiyat Ödülü’nü kazanan ilk Türk yazar oldu.', s: 'books', m: 'dusk' },
    { d: '2007-08-28', c: 'S', t: 'Abdullah Gül Cumhurbaşkanı', x: 'Nisan’daki “e-muhtıra” ve erken seçimin ardından Abdullah Gül, Meclis’te 11. Cumhurbaşkanı seçildi.', s: 'parliament', p: { y2007: true } },
    { d: '2010-09-12', c: 'S', t: '2010 Anayasa referandumu', x: 'Değişiklikler %57,9 “evet” oyuyla kabul edildi; yargının yapısı değişti, 12 Eylül darbecilerinin yargılanmasının önü açıldı.', s: 'ballot', p: { city: 'istanbul', box: 'clear', referendum: true } },
    { d: '2011-04-29', c: 'T', t: 'Suriyeli sığınmacılar', x: 'Suriye’deki iç savaştan kaçanlar Türkiye’ye sığınmaya başladı; sayıları yıllar içinde 3,5 milyonu aştı.', s: 'camp' },
    { d: '2011-10-23', c: 'D', t: 'Van Depremi', x: '7,2 büyüklüğündeki deprem ve ardından gelen artçıda 600’ü aşkın kişi hayatını kaybetti.', s: 'quake', p: { v: 2011 }, m: 'quake' },
    { d: '2013-05-31', c: 'T', t: 'Gezi Parkı protestoları', x: 'Taksim Gezi Parkı’ndaki ağaç kesimine karşı başlayan eylemler kısa sürede ülke geneline yayıldı.', s: 'gezi' },
    { d: '2014-05-13', c: 'T', t: 'Soma Faciası', x: 'Soma’daki kömür madeninde çıkan yangında 301 madenci hayatını kaybetti; Türkiye’nin en ağır maden kazası.', s: 'mine', m: 'mourning' },
    { d: '2014-08-10', c: 'S', t: 'Halkın seçtiği ilk Cumhurbaşkanı', x: 'Recep Tayyip Erdoğan, halkın doğrudan oyuyla seçilen ilk Cumhurbaşkanı oldu.', s: 'ballot', p: { city: 'ankara', box: 'clear' }, m: 'dusk' },
    { d: '2015-06-07', c: 'S', t: '7 Haziran ve 1 Kasım seçimleri', x: 'AK Parti 2002’den beri ilk kez tek başına çoğunluğu kaybetti; hükümet kurulamayınca yenilenen 1 Kasım seçiminde çoğunluğu geri aldı.', s: 'ballot', p: { city: 'ankara', box: 'clear', posters: ['7 HAZİRAN', '1 KASIM', 'SANDIK', 'OY'] } },
    { d: '2016-07-15', c: 'S', t: '15 Temmuz darbe girişimi', x: 'FETÖ’ye bağlı bir grup askerin darbe girişimi halkın direnişi ve güvenlik güçleriyle bastırıldı; 251 kişi hayatını kaybetti.', s: 'july15', m: 'night' },
    { d: '2017-04-16', c: 'S', t: 'Cumhurbaşkanlığı Hükümet Sistemi', x: 'Anayasa değişikliği halkoylamasında %51,4 “evet” oyuyla kabul edildi; başbakanlık 2018’de kaldırıldı.', s: 'ballot', p: { city: 'ankara', box: 'clear', referendum: true } },
    { d: '2018-08-10', c: 'E', t: 'Kur krizi', x: 'Türk lirası birkaç gün içinde sert değer kaybetti; dolar 7 lirayı aştı, ekonomi yıl sonunda küçülmeye girdi.', s: 'economy', p: { trend: 'crash', usd: true }, m: 'overcast' },
    { d: '2020-03-11', c: 'T', t: 'COVID-19 salgını', x: 'Türkiye’de ilk vaka görüldü. Okullar kapandı; sokağa çıkma kısıtlamalarıyla şehirler sessizliğe gömüldü.', s: 'covid', m: 'night' },
    { d: '2020-07-24', c: 'T', t: 'Ayasofya yeniden cami', x: 'Danıştay kararının ardından Ayasofya’da 86 yıl sonra ilk cuma namazı kılındı.', s: 'ayasofya' },
    { d: '2020-08-21', c: 'E', t: 'Karadeniz’de doğal gaz', x: 'Sakarya Gaz Sahası’nda Türkiye’nin en büyük doğal gaz keşfi açıklandı; ilk gaz Nisan 2023’te Filyos’ta karaya ulaştı.', s: 'gas', m: 'dusk' },
    { d: '2021-07-28', c: 'D', t: 'Orman yangınları', x: 'Manavgat’ta başlayan yangınlar Akdeniz ve Ege’de haftalarca sürdü; geniş orman alanları küle döndü.', s: 'fire', m: 'fire' },
    { d: '2022-10-29', c: 'E', t: 'Togg banttan indi', x: 'Yerli otomobil Togg’un Gemlik’teki fabrikası açıldı ve seri üretim başladı.', s: 'car', p: { model: 'togg' }, m: 'dusk' },
    { d: '2023-02-06', c: 'D', t: '6 Şubat Depremleri', x: 'Kahramanmaraş merkezli 7,7 ve 7,6 büyüklüğündeki iki deprem 11 ili yıktı; 53 binden fazla kişi hayatını kaybetti.', s: 'quake', p: { v: 2023 }, m: 'winternight', fx: ['slow'] },
    { d: '2023-05-28', c: 'S', t: '2023 seçimleri', x: 'İkinci tura kalan cumhurbaşkanlığı seçimini %52,2 oyla Recep Tayyip Erdoğan kazandı; Kemal Kılıçdaroğlu %47,8 oy aldı.', s: 'ballot', p: { city: 'ankara', box: 'clear', crowd: true } },
    { d: '2023-10-29', c: 'T', t: 'Cumhuriyet 100 yaşında', x: 'Cumhuriyet’in yüzüncü yılı kutlandı; İstanbul Boğazı’nda yüz gemilik bir donanma geçidi yapıldı.', s: 'centennial', m: 'nightfest', fx: ['fireworks', 'cheer'] },
    { d: '2024-03-31', c: 'S', t: '2024 yerel seçimleri', x: 'CHP, 1977’den bu yana ilk kez Türkiye genelinde birinci parti oldu.', s: 'ballot', p: { city: 'istanbul', box: 'clear' } },
    { d: '2025-05-12', c: 'S', t: 'PKK fesih kararı', x: 'Öcalan’ın çağrısının ardından PKK, silahlı mücadeleyi bitirip kendini feshettiğini açıkladı; Temmuz’da ilk grup silahlarını yaktı.', s: 'peace', m: 'dawn' },
    { d: '2026-08-10', c: 'S', t: 'Terörsüz Türkiye Yasası', x: 'Meclis, PKK’nın feshinin ardından silah bırakanlara yönelik yasal çerçeveyi 467 kabul oyuyla yasalaştırdı.', s: 'parliament', p: { vote: [467, 87, 7, 'KABUL EDİLDİ'], doves: true }, m: 'night' },
    { d: '2026-11', c: 'F', t: 'Hikâye sürüyor', x: 'Bundan sonrası henüz yazılmadı. Koşmaya devam et; yarın senin izinle şekillenecek.', s: 'future', m: 'dawn', final: true },
  ];

  // ------------------------------------------------------------ yardımcılar
  IZ.parseDate = function (d) {
    const p = d.split('-').map(Number);
    const y = p[0], m = p[1] || 0, day = p[2] || 0;
    let dec = y;
    if (m) dec += (m - 1) / 12 + (day ? (day - 1) / 365 : 0.5 / 12);
    else dec += 0.5;
    return { y: y, m: m, day: day, dec: dec };
  };
  IZ.fmtDate = function (d) {
    const p = IZ.parseDate(d);
    if (p.day) return p.day + ' ' + IZ.MONTHS[p.m - 1] + ' ' + p.y;
    if (p.m) return IZ.MONTHS[p.m - 1] + ' ' + p.y;
    return String(p.y);
  };
  IZ.EVENTS.forEach(function (e, i) {
    const p = IZ.parseDate(e.d);
    e.i = i;
    e.year = p.y;
    e.dec = p.dec;
    e.label = IZ.fmtDate(e.d);
  });

  IZ.eraIndex = function (dec) {
    let k = 0;
    for (let i = 0; i < IZ.ERAS.length; i++) if (dec >= IZ.ERAS[i].from) k = i;
    return k;
  };
  // ------------------------------------------------------------ arka plan dekorları
  // Her olay, geçtiği yere göre bir arka plan dekoru seçer (js/art-bg.js):
  // kirsal, kent, ankara, istanbul, sanayi, sahil, dogu, gelecek.
  // Olayda `b: 'sahil'` gibi bir alan varsa o kullanılır; yoksa sahne adına bakılır.
  IZ.BG_NAMES = ['kirsal', 'kent', 'ankara', 'istanbul', 'sanayi', 'sahil', 'dogu', 'gelecek'];
  IZ.SCENE_BG = {
    tbmm1920: 'ankara', battle: 'kirsal', sultanate: 'istanbul', lausanne: 'sahil', ankara: 'ankara', republic: 'ankara',
    school: 'kent', hats: 'kent', civil: 'ankara', alphabet: 'kent', crash: 'kent', halkevi: 'kent', train: 'sanayi',
    surname: 'kent', suffrage: 'ankara', factory: 'sanayi', straits: 'istanbul', dolmabahce: 'istanbul', cankaya: 'ankara',
    hatay: 'sahil', quake: 'dogu', village: 'kirsal', ration: 'kent', flags: 'ankara', ballot: 'ankara', troopship: 'sahil',
    tractor: 'kirsal', anitkabir: 'ankara', riot: 'istanbul', currency: 'kent', tanks: 'ankara', station: 'istanbul',
    eu: 'ankara', car: 'sanayi', tv: 'kent', radio: 'ankara', bridge: 'istanbul', cyprus: 'sahil', queue: 'kent',
    port: 'sanayi', city80: 'istanbul', mountains: 'dogu', lift: 'kent', migration: 'kirsal', dam: 'dogu',
    internet: 'ankara', parliament: 'ankara', economy: 'kent', customs: 'sanayi', blackout: 'kent', jet: 'kent',
    stadium: 'kent', stage: 'istanbul', eclipse: 'sahil', books: 'istanbul', camp: 'kirsal', gezi: 'istanbul',
    marmaray: 'istanbul', mine: 'sanayi', dna: 'kent', july15: 'istanbul', airport: 'istanbul', covid: 'kent',
    ayasofya: 'istanbul', kanal: 'istanbul', fire: 'sahil', flood: 'sahil', market: 'kent', volley: 'kent',
    centennial: 'istanbul', rocket: 'sahil', protest: 'istanbul', istquake: 'istanbul', peace: 'dogu', heat: 'dogu',
    court: 'ankara', future: 'gelecek', generic: 'kent',
    constitution: 'ankara', gulf: 'dogu', funeral: 'istanbul', gas: 'sahil',
  };
  IZ.bgOf = function (ev) {
    if (!ev) return 'kent';
    if (ev.b) return ev.b;
    if (ev.p && ev.p.city === 'istanbul') return 'istanbul';
    return IZ.SCENE_BG[ev.s] || 'kent';
  };

  // Bir dönemin ilk olayının indeksi (dönem seçimi için)
  IZ.eraFirstEvent = function (eraIdx) {
    const from = IZ.ERAS[eraIdx].from;
    for (let i = 0; i < IZ.EVENTS.length; i++) if (IZ.EVENTS[i].dec >= from) return i;
    return 0;
  };
})();
