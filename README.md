# Treffy

Yüksek performanslı video konferans uygulaması.

## Özellikler

- 1080p 60fps'e kadar yüksek kaliteli video desteği
- Masaüstü, mobil ve web platformları desteği
- P2P ve SFU mimarisi seçenekleri
- Ekran paylaşımı, mesajlaşma ve dosya paylaşımı

## Başlarken

```bash
# Gereksinimleri yükle
pnpm install

# Web uygulamasını geliştirme modunda başlat
pnpm dev:web

# Masaüstü uygulamasını geliştirme modunda başlat
pnpm dev:desktop

# Mobil uygulamasını geliştirme modunda başlat
pnpm dev:mobile

# Sinyal sunucusunu geliştirme modunda başlat
pnpm dev:server
```

## Proje Yapısı

```
treffy/
├── apps/
│   ├── desktop/        # Electron uygulaması
│   ├── mobile/         # React Native uygulaması
│   ├── web/            # Web uygulaması
│   └── server/         # Node.js sinyal sunucusu
├── packages/
│   ├── ui/             # Ortak UI bileşenleri
│   ├── webrtc/         # WebRTC soyutlama katmanı
│   └── api/            # API istemcisi ve ortak tipler
```
