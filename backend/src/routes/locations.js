const express = require('express');
const router = express.Router();

// Türkiye'nin tüm illeri
const cities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
  'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat',
  'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın',
  'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

// İlçe verileri - sadece büyük illerin bazı ilçeleri
const districts = {
  'İstanbul': ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
  'Ankara': ['Çankaya', 'Keçiören', 'Mamak', 'Yenimahalle', 'Altındağ', 'Etimesgut', 'Sincan', 'Pursaklar', 'Gölbaşı', 'Kazan', 'Akyurt', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çubuk', 'Elmadağ', 'Evren', 'Haymana', 'Kalecik', 'Kızılcahamam', 'Nallıhan', 'Polatlı', 'Şereflikoçhisar'],
  'İzmir': ['Konak', 'Balçova', 'Bayraklı', 'Bornova', 'Buca', 'Çiğli', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karşıyaka', 'Narlıdere', 'Bergama', 'Beydağ', 'Aliağa', 'Çeşme', 'Dikili', 'Foça', 'Karaburun', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Menderes', 'Menemen', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
  'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Orhaneli', 'Orhangazi', 'Yenişehir'],
  'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Aksu', 'Döşemealtı', 'Akseki', 'Alanya', 'Demre', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Korkuteli', 'Kumluca', 'Manavgat', 'Serik'],
  'Adana': ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Tufanbeyli', 'Yumurtalık', 'Feke', 'Aladağ'],
  'Konya': ['Meram', 'Karatay', 'Selçuklu', 'Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysinir', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Kulu', 'Sarayönü', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
  'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Oğuzeli', 'Nizip', 'İslahiye', 'Nurdağı', 'Karkamış', 'Yavuzeli', 'Araban'],
  'Mersin': ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mut', 'Silifke', 'Tarsus'],
  'Diyarbakır': ['Bağlar', 'Kayapınar', 'Sur', 'Yenişehir', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kocaköy', 'Kulp', 'Lice', 'Silvan'],
  'Samsun': ['İlkadım', 'Atakum', 'Canik', 'Tekkeköy', 'Alaçam', 'Asarcık', 'Ayvacık', 'Bafra', 'Çarşamba', 'Havza', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Terme', 'Vezirköprü', 'Yakakent'],
  'Kayseri': ['Kocasinan', 'Melikgazi', 'Talas', 'Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Tomarza', 'Yahyalı', 'Yeşilhisar'],
  'Eskişehir': ['Odunpazarı', 'Tepebaşı', 'Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar'],
  'Denizli': ['Pamukkale', 'Merkezefendi', 'Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Sarayköy', 'Serinhisar', 'Tavas'],
  'Sivas': ['Merkez', 'Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Suşehri', 'Şarkışla', 'Ulaş', 'Yıldızeli', 'Zara'],
  'Trabzon': ['Ortahisar', 'Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Sürmene', 'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'],
  'Malatya': ['Battalgazi', 'Yeşilyurt', 'Akçadağ', 'Arapgir', 'Arguvan', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan'],
  'Manisa': ['Şehzadeler', 'Yunusemre', 'Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Turgutlu'],
  'Erzurum': ['Yakutiye', 'Palandöken', 'Aziziye', 'Aşkale', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere'],
  'Van': ['İpekyolu', 'Tuşba', 'Edremit', 'Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Erciş', 'Gevaş', 'Gürpınar', 'Muradiye', 'Özalp', 'Saray'],
  'Balıkesir': ['Karesi', 'Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
  'Kahramanmaraş': ['Dulkadiroğlu', 'Onikişubat', 'Afşin', 'Andırın', 'Çağlayancerit', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Pazarcık', 'Türkoğlu'],
  'Şanlıurfa': ['Eyyübiye', 'Haliliye', 'Karaköprü', 'Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Halfeti', 'Harran', 'Hilvan', 'Siverek', 'Suruç', 'Viranşehir'],
  'Muğla': ['Menteşe', 'Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Milas', 'Ortaca', 'Ula', 'Yatağan'],
  'Aydın': ['Efeler', 'Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'],
  'Tekirdağ': ['Süleymanpaşa', 'Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Şarköy'],
  'Kocaeli': ['İzmit', 'Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'],
  'Hatay': ['Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı', 'Altınözü'],
  'Sakarya': ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'],
  'Tokat': ['Merkez', 'Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'],
  'Ordu': ['Altınordu', 'Akkuş', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Piraziz', 'Ulubey', 'Ünye'],
  'Kütahya': ['Merkez', 'Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Pazarlar', 'Simav', 'Şaphane', 'Tavşanlı'],
  'Elazığ': ['Merkez', 'Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Palu', 'Sivrice'],
  'Zonguldak': ['Merkez', 'Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu'],
  'Kırklareli': ['Merkez', 'Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Pehlivanköy', 'Pınarhisar', 'Vize'],
  'Edirne': ['Merkez', 'Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Süloğlu', 'Uzunköprü'],
  'Çanakkale': ['Merkez', 'Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Yenice'],
  'Kastamonu': ['Merkez', 'Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'],
  'Sinop': ['Merkez', 'Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Saraydüzü', 'Türkeli'],
  'Rize': ['Merkez', 'Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Pazar'],
  'Giresun': ['Merkez', 'Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'],
  'Amasya': ['Merkez', 'Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merzifon', 'Suluova', 'Taşova'],
  'Çorum': ['Merkez', 'Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'],
  'Yozgat': ['Merkez', 'Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yenifakılı', 'Yerköy'],
  'Bolu': ['Merkez', 'Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Mudurnu', 'Seben', 'Yeniçağa'],
  'Burdur': ['Merkez', 'Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Tefenni', 'Yeşilova'],
  'Isparta': ['Merkez', 'Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'],
  'Uşak': ['Merkez', 'Banaz', 'Eşme', 'Karahallı', 'Sivaslı', 'Ulubey'],
  'Afyonkarahisar': ['Merkez', 'Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'],
  'Kırşehir': ['Merkez', 'Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Mucur'],
  'Çankırı': ['Merkez', 'Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Orta', 'Şabanözü', 'Yapraklı'],
  'Bilecik': ['Merkez', 'Bozüyük', 'Gölpazarı', 'İnhisar', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
  'Artvin': ['Merkez', 'Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Murgul', 'Şavşat', 'Yusufeli'],
  'Gümüşhane': ['Merkez', 'Kelkit', 'Köse', 'Kürtün', 'Şiran', 'Torul'],
  'Erzincan': ['Merkez', 'Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'],
  'Kars': ['Merkez', 'Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Sarıkamış', 'Selim', 'Susuz'],
  'Ağrı': ['Merkez', 'Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Patnos', 'Taşlıçay', 'Tutak'],
  'Muş': ['Merkez', 'Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Varto'],
  'Bitlis': ['Merkez', 'Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Mutki', 'Tatvan'],
  'Bingöl': ['Merkez', 'Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Solhan', 'Yayladere', 'Yedisu'],
  'Tunceli': ['Merkez', 'Çemişgezek', 'Hozat', 'Mazgirt', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'],
  'Hakkâri': ['Merkez', 'Çukurca', 'Şemdinli', 'Yüksekova'],
  'Adıyaman': ['Merkez', 'Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Samsat', 'Sincik', 'Tut'],
  'Mardin': ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Yeşilli'],
  'Siirt': ['Merkez', 'Baykan', 'Eruh', 'Kurtalan', 'Pervari', 'Şirvan'],
  'Batman': ['Merkez', 'Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Sason'],
  'Şırnak': ['Merkez', 'Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Silopi', 'Uludere'],
  'Nevşehir': ['Merkez', 'Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Ürgüp'],
  'Niğde': ['Merkez', 'Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Ulukışla'],
  'Aksaray': ['Merkez', 'Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Ortaköy', 'Sarıyahşi'],
  'Karaman': ['Merkez', 'Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Sarıveliler'],
  'Kırıkkale': ['Merkez', 'Bahşılı', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Sulakyurt', 'Yahşihan'],
  'Bartın': ['Merkez', 'Amasra', 'Kurucaşile', 'Ulus'],
  'Ardahan': ['Merkez', 'Çıldır', 'Damal', 'Göle', 'Hanak', 'Posof'],
  'Iğdır': ['Merkez', 'Aralık', 'Karakoyunlu', 'Tuzluca'],
  'Yalova': ['Merkez', 'Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Termal'],
  'Karabük': ['Merkez', 'Eflani', 'Eskipazar', 'Ovacık', 'Safranbolu', 'Yenice'],
  'Kilis': ['Merkez', 'Elbeyli', 'Musabeyli', 'Polateli'],
  'Osmaniye': ['Merkez', 'Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Sumbas', 'Toprakkale'],
  'Düzce': ['Merkez', 'Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Yığılca'],
  'Bayburt': ['Merkez', 'Aydıntepe', 'Demirözü']
};

// Tüm illeri getir
router.get('/cities', (req, res) => {
  try {
    res.json({ cities });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Belirli bir ilin ilçelerini getir
router.get('/districts/:city', (req, res) => {
  try {
    const city = req.params.city;
    const cityDistricts = districts[city] || [];
    
    res.json({ 
      city,
      districts: cityDistricts 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
