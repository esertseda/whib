# My Travel Map - Gezi Rehberi Uygulaması

Bu uygulama, kullanıcıların seyahat planlarını oluşturmasına, turistik yerleri keşfetmesine ve kişisel gezi rehberleri hazırlamasına yardımcı olan kapsamlı bir seyahat uygulamasıdır.

## 🚀 Yeni Özellikler

### 📋 Gezi Rehberi Oluşturma
- **Turistik Yerler Seçimi**: Geoapify API'si ile şehirdeki turistik yerleri keşfedin
- **Yelp Entegrasyonu**: Restoranlar, kafeler ve barları Yelp'ten bulun
- **Kategorize Edilmiş Liste**: Seçilen yerler otomatik olarak kategorilere ayrılır
- **Kişisel Notlar**: Her yer için notlar ve hatırlatmalar ekleyin

### 🎯 Gezi Rehberi Özellikleri
- **Özet İstatistikler**: Toplam yer sayısı, kategori sayısı ve şehir sayısı
- **Kategorilere Göre Düzenleme**:
  - 🏛️ Turistik Yerler
  - 🍽️ Restoranlar
  - 🏛️ Müzeler
  - 🛍️ Alışveriş
  - ☕ Kafeler
  - 🍸 Barlar
  - 🏙️ Şehirler
  - 📍 Diğer Yerler

### 📄 PDF Export
- Gezi rehberinizi PDF formatında dışa aktırın
- Profesyonel görünümlü, tarih damgalı PDF'ler
- Şehir adıyla otomatik dosya adlandırma

### ✏️ Notlar Sistemi
- Her yer için kişisel notlar ekleyin
- Seyahat ipuçları ve hatırlatmalar
- Modal pencere ile kolay düzenleme

## 🛠️ Kurulum

### Backend Kurulumu
```bash
cd backend
npm install
npm start
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```

## 📱 Kullanım

### 1. Şehir Arama
- Ana sayfada şehir arama kutusunu kullanın
- Şehir seçildiğinde otomatik olarak turistik bilgiler yüklenir

### 2. Turistik Yerler Seçimi
- **Geoapify Turistik Yerler**: Şehirdeki turistik yerleri görün ve seçin
- **Yelp Restoranlar**: Restoranları puanlarına göre keşfedin
- **Yelp Kafeler**: Kafeleri bulun ve seçin
- **Yelp Barlar**: Barları keşfedin

### 3. Gezi Rehberi Oluşturma
- Seçilen yerler otomatik olarak "My Travel Planner" bölümüne eklenir
- Her yer için notlar ekleyebilirsiniz
- Kategorilere göre düzenlenmiş görünüm

### 4. PDF Export
- "Export as PDF" butonuna tıklayın
- Gezi rehberiniz PDF formatında indirilir

### 5. Notlar Ekleme
- Her yerin yanındaki 📝 butonuna tıklayın
- Modal pencerede notlarınızı yazın
- "Save Notes" ile kaydedin

## 🔧 Teknik Özellikler

### Backend API'ler
- `GET /api/travel-info?city=...` - Şehir bilgilerini getirir
- `GET /api/places?wishlist=true` - Wishlist yerlerini getirir
- `POST /api/places` - Yeni yer ekler
- `PUT /api/places/:id` - Yer günceller (notlar dahil)
- `DELETE /api/places/:id` - Yer siler

### Frontend Bileşenleri
- `WishlistView.vue` - Ana gezi rehberi sayfası
- `AttractionsList.vue` - Turistik yerler listesi
- `CitySearch.vue` - Şehir arama bileşeni

### Veritabanı Şeması
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  country: String,
  city: String,
  coordinates: { lat: Number, lng: Number },
  visitedAt: Date,
  photoUrl: String,
  wishlist: Boolean,
  category: String,
  notes: String  // Yeni eklenen alan
}
```

## 🌟 Özellikler

### ✅ Tamamlanan Özellikler
- [x] Turistik yerler seçimi ve listeleme
- [x] Yelp entegrasyonu (restoranlar, kafeler, barlar)
- [x] Kategorilere göre düzenleme
- [x] Kişisel notlar sistemi
- [x] PDF export özelliği
- [x] Gezi rehberi özet istatistikleri
- [x] Responsive tasarım
- [x] Modal pencere ile not düzenleme

### 🔄 Gelecek Özellikler
- [ ] Gezi rotası oluşturma
- [ ] Harita üzerinde yer işaretleme
- [ ] Fotoğraf ekleme
- [ ] Sosyal medya paylaşımı
- [ ] Çoklu dil desteği
- [ ] Offline mod desteği

## 📞 Destek

Herhangi bir sorun yaşarsanız veya önerileriniz varsa, lütfen issue açın.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 