import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.get('/firebase-config.js', (_req, res) => {
  const apiKey = process.env.FIREBASE_API_KEY || '';
  const config = apiKey
    ? {
        apiKey,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || '',
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      }
    : null;

  res.type('application/javascript');
  res.send(`window.__FIREBASE_CONFIG__ = ${JSON.stringify(config)};`);
});

// Serve organized image assets from /images and static app files from root
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(__dirname));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Nexomon Database server running at http://${HOST}:${PORT}`);
});
