module.exports = {
  packagerConfig: {
    asar: true,
    icon: './src/assets/icon',
    // MacOS için ikon ayarları
    osxSign: {},
    osxNotarize: {
      tool: 'notarytool',
    },
    darwinDarkModeSupport: true,
    executableName: 'Treffy',
    appBundleId: 'com.treffy.app',
    appCategoryType: 'public.app-category.video',
    extend: {
      buildNumber: '1.0.0',
    }
  },
  // Otomatik güncelleme yapılandırması
  electronUpdateConfig: {
    publish: [{
      provider: 'github',
      owner: 'akcware', // GitHub kullanıcı adınızla değiştirin
      repo: 'treffy' // GitHub repo adınızla değiştirin
    }]
  },
  rebuildConfig: {},
  makers: [
    // Windows
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Treffy',
        authors: 'Treffy Team',
        description: 'Yüksek performanslı video konferans uygulaması',
        iconUrl: 'https://raw.githubusercontent.com/yourusername/treffy/main/apps/desktop/src/assets/icon.ico',
        setupIcon: './src/assets/icon.ico'
      },
    },
    // macOS
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        options: {
          icon: './src/assets/icon.icns',
        }
      }
    },
    // macOS DMG
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './src/assets/icon.icns',
        background: './src/assets/dmg-background.png',
        format: 'ULFO'
      }
    },
    // Linux deb
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './src/assets/icon.png',
          categories: ['Video', 'AudioVideo', 'Network'],
          description: 'Yüksek performanslı video konferans uygulaması',
          productName: 'Treffy',
          genericName: 'Video Konferans'
        }
      },
    },
    // Linux rpm
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: './src/assets/icon.png',
          categories: ['Video', 'AudioVideo', 'Network'],
          description: 'Yüksek performanslı video konferans uygulaması',
          productName: 'Treffy',
          genericName: 'Video Konferans'
        }
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'yourusername',
          name: 'treffy'
        },
        prerelease: true
      }
    }
  ]
};