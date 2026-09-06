const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BASE_URL = 'https://kos-engine-server-1.onrender.com';

const PATCHED_BIN_SHA256 = 'f383dd9415c7d7ead026c3db483fc15217d57524074b09636ea4861e8526ea11';

const CONNECT_RESPONSE = {
  success: true,
  short_device_id: "Iay0mlw5",
  message: "Connected successfully.",
  redirect: "",
  nonce: "LY1+vc0VlLC1EB4a90Qrow==",
  ads: [
    { image_url: "https://cdn.ioscheat.xyz/logo/CardSlide/p1.jpeg", link_url: "https://t.me/CodeVortex2" },
    { image_url: "https://cdn.ioscheat.xyz/logo/CardSlide/p2.jpeg", link_url: "https://t.me/CodeVortex2" }
  ],
  game_packages: ["com.miniclip.eightballpool", "com.miniclip.carrom"],
  games: [
    { package: "com.miniclip.eightballpool" },
    { package: "com.miniclip.carrom" }
  ],
  key_info: [
    { key: "ACTIVE", valid: true, expiry: "2099-12-31", type: "premium", max_devices: 99 }
  ],
  unlockable_games: [
    { game_package: "com.miniclip.eightballpool" },
    { game_package: "com.miniclip.carrom" }
  ],
  supported_games: [
    {
      package: "com.miniclip.eightballpool",
      name: "8 Ball Pool",
      version: "56.29.2",
      ver_code: 4014,
      image_url: "https://cdn.ioscheat.xyz/logo/eightball.png",
      loader: {
        sha256: PATCHED_BIN_SHA256,
        url: "https://cdn.ioscheat.xyz/apk/ea8b6bb4b9e8b1b4.bin"
      }
    },
    {
      package: "com.miniclip.eightballpool",
      name: "8 Ball Pool",
      version: "56.29.1",
      ver_code: 4013,
      image_url: "https://cdn.ioscheat.xyz/logo/eightball.png",
      loader: {
        sha256: PATCHED_BIN_SHA256,
        url: "https://cdn.ioscheat.xyz/apk/ea8b6bb4b9e8b1b4.bin"
      }
    },
    {
      package: "com.miniclip.carrom",
      name: "Carrom Pool",
      version: "19.4.0",
      ver_code: 1477,
      image_url: "https://cdn.ioscheat.xyz/logo/carrom.png",
      loader: {
        sha256: "7c53a3c3b06dbcc2236b94be32846449e00d5177eb359270d434bf29f2a3d607",
        url: "https://cdn.ioscheat.xyz/apk/c2c21b5c8c5da750.bin"
      }
    },
    {
      package: "com.miniclip.carrom",
      name: "Carrom Pool",
      version: "19.3.0",
      ver_code: 1473,
      image_url: "https://cdn.ioscheat.xyz/logo/carrom.png",
      loader: {
        sha256: "7c53a3c3b06dbcc2236b94be32846449e00d5177eb359270d434bf29f2a3d607",
        url: "https://cdn.ioscheat.xyz/apk/c2c21b5c8c5da750.bin"
      }
    }
  ],
  seller_directory: {
    countries: [
      {
        country_code: "PK",
        sellers: [
          {
            public_name: "Khalid",
            logo_url: "https://cdn.ioscheat.xyz/avatars/8.jpg",
            telegram: "khalid",
            whatsapp: "+923000000000",
            phone_number: "+923000000000",
            discord: "",
            keys_sold: 50
          }
        ]
      }
    ]
  }
};

// === KOS API ENDPOINTS ===

// Main connect endpoint (NativeBridge.getDataFromServer)
app.get('/api/connect', (req, res) => {
  console.log('[CONNECT]', new Date().toISOString());
  res.json(CONNECT_RESPONSE);
});

app.post('/api/connect', (req, res) => {
  console.log('[CONNECT POST]', new Date().toISOString(), req.body);
  res.json(CONNECT_RESPONSE);
});

// License validation (NativeBridge.validateLicense)
app.get('/api/validate', (req, res) => {
  console.log('[VALIDATE]', new Date().toISOString(), req.query);
  res.json({ success: true, s: "x", message: "License valid", nonce: "LY1+vc0VlLC1EB4a90Qrow==" });
});

app.post('/api/validate', (req, res) => {
  console.log('[VALIDATE POST]', new Date().toISOString(), req.body);
  res.json({ success: true, s: "x", message: "License valid", nonce: "LY1+vc0VlLC1EB4a90Qrow==" });
});

// Native.Login() equivalent - called by .bin loader via JNI
// The native code sends: guid, packageName, activity, language
// Returns: String[3] = [status, resultCode, message]
app.get('/api/login', (req, res) => {
  console.log('[LOGIN GET]', new Date().toISOString(), req.query, req.ip);
  res.json({ success: true, status: "1", result: "1", message: "" });
});

app.post('/api/login', (req, res) => {
  console.log('[LOGIN POST]', new Date().toISOString(), req.body, req.ip);
  res.json({ success: true, status: "1", result: "1", message: "" });
});

// Task dispatch endpoints (task codes 1001-1004)
app.post('/api/task', (req, res) => {
  console.log('[TASK]', new Date().toISOString(), req.body);
  const taskCode = req.body.task_code || req.body.taskCode;
  switch (taskCode) {
    case 1001:
    case '1001':
      res.json(CONNECT_RESPONSE);
      break;
    case 1002:
    case '1002':
      res.json({ success: true, s: "x", message: "License valid", nonce: "LY1+vc0VlLC1EB4a90Qrow==" });
      break;
    case 1003:
    case '1003':
      res.json({ success: true });
      break;
    case 1004:
    case '1004':
      res.json({ success: true, integrity: true });
      break;
    default:
      res.json({ success: true });
  }
});

// Generic auth/login
app.post('/auth', (req, res) => {
  console.log('[AUTH]', new Date().toISOString(), req.body);
  res.json({ success: true, token: "patched_token_" + Date.now(), user: { id: 1, name: "PatchedUser" } });
});

// Reports endpoint
app.post('/api/report', (req, res) => {
  console.log('[REPORT]', new Date().toISOString(), req.body);
  res.json({ success: true });
});

// === BIN/APK SERVING ===
app.get('/apk/:filename', (req, res) => {
  console.log('[APK DOWNLOAD]', new Date().toISOString(), req.params.filename, req.ip);
  const filePath = path.join(__dirname, 'bin', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log('[APK 404]', req.params.filename);
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// === CDN CONTENT (images, logos, avatars) ===
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

// === CATCH-ALL: Accept ANY request and return success ===
// This handles Native.Login() native HTTPS calls and any unknown endpoints
app.all('*', (req, res) => {
  console.log('[CATCH-ALL]', req.method, req.originalUrl, req.ip, new Date().toISOString());
  // Return generic success for any request
  res.json({ success: true, status: "1", result: "1", message: "" });
});

app.listen(PORT, () => {
  console.log('KOS Engine Server running on port ' + PORT);
  console.log('Base URL: ' + BASE_URL);
});
