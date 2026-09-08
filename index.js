const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BASE_URL = 'https://kos-engine-server-1.onrender.com';
const BIN_SHA256_8BP = 'f383dd9415c7d7ead026c3db483fc15217d57524074b09636ea4861e8526ea11';
const BIN_SHA256_CARROM = '7c53a3c3b06dbcc2236b94be32846449e00d5177eb359270d434bf29f2a3d607';

// === IN-MEMORY DATABASE ===
const keys = {};
const devices = {};

function generateKey() {
  const seg = () => crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

function createKey(type, days) {
  const key = generateKey();
  const expiry = new Date(Date.now() + days * 86400000).toISOString();
  keys[key] = { key, type, expiry, created: new Date().toISOString(), active: true };
  return keys[key];
}

// Pre-create some keys
createKey('premium', 365);
createKey('premium', 30);
createKey('trial', 7);

console.log('Generated keys:', Object.keys(keys).join(', '));

// === MAIN ENDPOINTS ===

// /connect — called on app start, returns game data
app.all('/connect', (req, res) => {
  const body = req.body || {};
  const androidId = body.android_id || req.query.android_id || 'Iay0mlw5';
  console.log('[CONNECT]', new Date().toISOString(), { androidId, ip: req.ip });
  
  res.json({
    success: true,
    short_device_id: String(androidId || '').padEnd(8, '0').slice(0, 8),
    message: "Connected successfully.",
    redirect: "",
    nonce: "LY1+vc0VlLC1EB4a90Qrow==",
    ads: [
      { image_url: BASE_URL + "/cdn/logo/CardSlide/p1.jpeg", link_url: "https://t.me/CodeVortex2" },
      { image_url: BASE_URL + "/cdn/logo/CardSlide/p2.jpeg", link_url: "https://t.me/CodeVortex2" }
    ],
    game_packages: ["com.miniclip.eightballpool", "com.miniclip.carrom"],
    games: [
      { game_package: "com.miniclip.eightballpool", game_name: "8 Ball Pool", game_version: "56.29.2", game_ver_code: 4014, game_image_url: BASE_URL + "/cdn/logo/eightball.png", expiry: "2099-12-31" },
      { game_package: "com.miniclip.carrom", game_name: "Carrom Pool", game_version: "19.4.0", game_ver_code: 1477, game_image_url: BASE_URL + "/cdn/logo/carrom.png", expiry: "2099-12-31" }
    ],
    key_info: [{ key_string: "ACTIVE", valid: true, expiry: "2099-12-31", type: "premium", max_devices: 99, game_package: "com.miniclip.eightballpool" }],
    unlockable_games: [
      { game_package: "com.miniclip.eightballpool" },
      { game_package: "com.miniclip.carrom" }
    ],
    supported_games: [
      {
        game_package: "com.miniclip.eightballpool",
        package: "com.miniclip.eightballpool",
        name: "8 Ball Pool",
        version: "56.29.2",
        ver_code: 4014,
        image_url: BASE_URL + "/cdn/logo/eightball.png",
        loader: {
          sha256: BIN_SHA256_8BP,
          url: BASE_URL + "/apk/ea8b6bb4b9e8b1b4.bin"
        }
      },
      {
        game_package: "com.miniclip.eightballpool",
        package: "com.miniclip.eightballpool",
        name: "8 Ball Pool",
        version: "56.29.1",
        ver_code: 4013,
        image_url: BASE_URL + "/cdn/logo/eightball.png",
        loader: {
          sha256: BIN_SHA256_8BP,
          url: BASE_URL + "/apk/ea8b6bb4b9e8b1b4.bin"
        }
      },
      {
        game_package: "com.miniclip.carrom",
        package: "com.miniclip.carrom",
        name: "Carrom Pool",
        version: "19.4.0",
        ver_code: 1477,
        image_url: BASE_URL + "/cdn/logo/carrom.png",
        loader: {
          sha256: BIN_SHA256_CARROM,
          url: BASE_URL + "/apk/c2c21b5c8c5da750.bin"
        }
      },
      {
        game_package: "com.miniclip.carrom",
        package: "com.miniclip.carrom",
        name: "Carrom Pool",
        version: "19.3.0",
        ver_code: 1473,
        image_url: BASE_URL + "/cdn/logo/carrom.png",
        loader: {
          sha256: BIN_SHA256_CARROM,
          url: BASE_URL + "/apk/c2c21b5c8c5da750.bin"
        }
      }
    ],
    seller_directory: {
      countries: [{
        country_code: "PK",
        sellers: [{
          public_name: "Khalid",
          logo_url: BASE_URL + "/cdn/avatars/8.jpg",
          telegram: "khalid",
          whatsapp: "+923000000000",
          phone_number: "+923000000000",
          discord: "",
          keys_sold: 50
        }]
      }]
    }
  });
});

// /validate — key validation
app.all('/validate', (req, res) => {
  const body = req.body || {};
  const androidId = body.android_id || req.query.android_id || '';
  const licenseKey = body.license_key || req.query.license_key || '';
  
  console.log('[VALIDATE]', new Date().toISOString(), { androidId, licenseKey, ip: req.ip });

  if (!androidId) {
    return res.status(400).json({ error: "android_id is required" });
  }
  if (!licenseKey) {
    return res.status(400).json({ error: "license_key is required" });
  }

  const keyData = keys[licenseKey];
  if (!keyData) {
    return res.json({ success: false, message: "Invalid license key", nonce: "" });
  }
  if (!keyData.active) {
    return res.json({ success: false, message: "License key is deactivated", nonce: "" });
  }
  if (new Date(keyData.expiry) < new Date()) {
    return res.json({ success: false, message: "License key has expired", nonce: "" });
  }

  res.json({
    success: true,
    s: "x",
    message: "License valid",
    nonce: "LY1+vc0VlLC1EB4a90Qrow=="
  });
});

// === KEY MANAGEMENT ===
app.get('/admin/keys', (req, res) => {
  res.json({ keys: Object.values(keys) });
});

app.post('/admin/generate', (req, res) => {
  const type = req.body.type || 'premium';
  const days = parseInt(req.body.days) || 30;
  const key = createKey(type, days);
  console.log('[KEY GENERATED]', key);
  res.json({ success: true, key });
});

// === BIN/APK SERVING ===
app.get('/apk/:filename', (req, res) => {
  console.log('[BIN DOWNLOAD]', req.params.filename);
  const filePath = path.join(__dirname, 'bin', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) { res.status(404).json({ error: 'File not found' }); }
  });
});

// === CDN CONTENT ===
app.get('/cdn/logo/:path(*)', (req, res) => {
  const filePath = path.join(__dirname, 'cdn', 'logo', req.params.path);
  res.sendFile(filePath, (err) => {
    if (err) { res.status(404).send('Not found'); }
  });
});

app.get('/cdn/avatars/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'cdn', 'avatars', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) { res.status(404).send('Not found'); }
  });
});

app.get('/logo/:path(*)', (req, res) => {
  const filePath = path.join(__dirname, 'cdn', 'logo', req.params.path);
  res.sendFile(filePath, (err) => {
    if (err) { res.status(404).send('Not found'); }
  });
});

app.get('/avatars/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'cdn', 'avatars', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) { res.status(404).send('Not found'); }
  });
});

// === CATCH-ALL ===
app.all('*', (req, res) => {
  console.log('[CATCH-ALL]', req.method, req.originalUrl, req.ip);
  res.json({ success: true, status: "1", result: "1", message: "" });
});

app.listen(PORT, () => {
  console.log('=================================');
  console.log('KOS Engine Server v2.0');
  console.log('URL: ' + BASE_URL);
  console.log('Port: ' + PORT);
  console.log('Keys:', Object.keys(keys).length);
  console.log('=================================');
  Object.keys(keys).forEach(k => {
    const kd = keys[k];
    console.log(`  ${kd.key} [${kd.type}] expires ${kd.expiry}`);
  });
});
