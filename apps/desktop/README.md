# Treffy Desktop

Yüksek performanslı video konferans uygulaması.

## Otomatik Güncelleme Özelliği

Treffy Desktop uygulaması, otomatik güncelleme özelliğine sahiptir. Uygulama, GitHub Releases üzerinden yeni sürümleri kontrol eder ve mevcut olduğunda kullanıcıya bildirir.

### Güncelleme Süreci

1. Uygulama her başlatıldığında, arka planda yeni bir sürüm olup olmadığını kontrol eder.
2. Yeni bir sürüm bulunduğunda, kullanıcıya bildirim gösterilir.
3. Kullanıcı isterse güncellemeleri indirebilir ve uygulama kapandığında otomatik olarak kurulur.

### Yeni Sürüm Yayınlama (Geliştiriciler İçin)

GitHub Releases üzerinden yeni bir sürüm yayınlamak için:

1. `package.json` dosyasında versiyon numarasını artırın (örneğin, `"version": "1.0.1"`)
2. GitHub'a değişiklikleri gönderin (`git push`)
3. Yeni sürümü derleyip yayınlamak için:
   ```bash
   pnpm run release
   ```
   Bu komut, yeni sürümü derleyecek ve GitHub'a otomatik olarak yükleyecektir.

4. GitHub'da yeni oluşturulan release'i düzenleyerek sürüm notlarını ekleyin.

### GitHub Yapılandırması

Otomatik güncelleme sistemini kullanmak için, `package.json` ve `forge.config.js` dosyalarında GitHub kullanıcı adını ve repo adını güncellemeniz gerekir:

```json
// package.json içinde:
"build": {
  "publish": [
    {
      "provider": "github",
      "owner": "GITHUB_KULLANICI_ADINIZ",
      "repo": "REPO_ADINIZ"
    }
  ]
}
```

```js
// forge.config.js içinde:
electronUpdateConfig: {
  publish: [{
    provider: 'github',
    owner: 'GITHUB_KULLANICI_ADINIZ',
    repo: 'REPO_ADINIZ'
  }]
}
```

### Notlar

- Yeni sürüm çıkarmak için repository'de push yetkisine sahip olmanız gerekir.
- GitHub token gereklidir. Bu token'ı sistem ortam değişkenlerinde (`GH_TOKEN` veya `GITHUB_TOKEN`) ayarlamanız gerekir.

## Geliştirme

1. Gerekli bağımlılıkları yükleyin:
```
pnpm install
```

2. Geliştirme modunda çalıştırın:
```
pnpm run dev
```

## Dağıtım (Deployment)

### Paketleme Adımları

Öncelikle bağımlılıklarınızı düzelttiğinizden emin olun:

```bash
pnpm run fix-deps
```

Sonra her platform için uygulamanızı paketleyin:

#### Platform Bazlı Paketleme

- **macOS için** (önerilen):
  ```bash
  pnpm run package:mac
  ```
  Bu komut, macOS için uygulama paketini `dist/Treffy-darwin-x64/` dizininde oluşturur.

  Sorun yaşarsanız alternatif yöntem:
  ```bash
  cd temp-build
  electron-packager . Treffy --platform=darwin --arch=x64 --out=../dist
  ```

- **Windows için**:
  ```bash
  pnpm run package:win
  ```

- **Linux için**:
  ```bash
  pnpm run package:linux
  ```

#### Tüm Platformlar İçin Paketleme

```bash
pnpm run package
```

Bu komut macOS, Windows ve Linux için uygulama paketlerini `dist/` dizininde oluşturur.

### Kurulum Programı Oluşturma

Paketleme işleminden sonra kurulum programları oluşturabilirsiniz:

- **macOS DMG için**:
  ```bash
  pnpm run installer:mac
  ```

- **Windows Installer için**:
  ```bash
  pnpm run installer:win
  ```

- **Linux .deb paketi için**:
  ```bash
  pnpm run installer:linux
  ```

## Bağımlılık Kurulumu

Paketleme araçlarını yüklemek için:

```bash
pnpm add --save-dev electron-packager electron-installer-dmg electron-installer-windows electron-installer-debian
```

## Platform Özellikleri ve Gereksinimler

### macOS için Gereksinimler

- Kod imzalama için bir Apple Developer hesabı
- XCode ve Command Line Tools

```bash
xcode-select --install
```

### Windows için Gereksinimler

- Windows üzerinde geliştirme yapıyorsanız: Visual Studio (Community edition yeterli)
- Mac/Linux üzerinden Windows paketi oluşturmak için: Wine

### Linux için Gereksinimler

- Debian/Ubuntu tabanlı sistemler için: `fakeroot`, `dpkg`

```bash
sudo apt-get install -y fakeroot dpkg
```

## Kod İmzalama

### macOS için Kod İmzalama

macOS için paketleme yaparken kod imzalama eklemek için:

```bash
pnpm run package:mac -- --osx-sign.identity='Developer ID Application: YOUR NAME HERE (TEAMID)'
```

### Windows için Kod İmzalama

Windows için paketleme yaparken kod imzalama eklemek için:

```bash
pnpm run package:win -- --win32metadata.CompanyName="Your Company" --win32metadata.FileDescription="Treffy" --win32metadata.OriginalFilename="Treffy.exe" --win32metadata.ProductName="Treffy" --win32metadata.InternalName="Treffy"
```