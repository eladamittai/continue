const express = require('express');
const httpProxy = require('http-proxy');

// Initiate Express and create a router.
const app = express();
const router = express.Router();

// Create a proxy server.
const proxy = httpProxy.createProxyServer();

// This is the method being used by the ingest route.
const posthogIngest = (req, res) => {
  proxy.web(req, res, {
    target: 'https://us.i.posthog.com',
    changeOrigin: true,
    secure: true,
    xfwd: true,
    headers: {
      // These headers aren't necessary, but are useful for our metrics.
      'X-Real-IP': req.ip,
      'X-Forwarded-For': req.ip,
      'X-Forwarded-Host': req.hostname,
    },
  });
};

// This is a very similar method, the only difference being that this
// is the target for static requests.
const posthogStatic = (req, res) => {
  proxy.web(req, res, {
    target: 'http://us.i.posthog.com',
    changeOrigin: true,
    secure: true,
    xfwd: true,
    headers: {
      'X-Real-IP': req.ip,
      'X-Forwarded-For': req.ip,
      'X-Forwarded-Host': req.hostname,
    },
  });
};

// In my case, I decided to use a "/collect" prefix for the proxy endpoints.
router.use('/collect/ingest', posthogIngest);
router.use('/collect/static', posthogStatic);

app.use(router);

app.listen(3001, () => {
  console.log('Reverse-proxy server is running on port 3001');
});