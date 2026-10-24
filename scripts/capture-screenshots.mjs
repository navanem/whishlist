import fs from 'fs';

async function capture(pageWsUrl, url, outPath, width, height, isMobile) {
  const ws = new WebSocket(pageWsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      cb(data);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const reqId = id++;
      callbacks.set(reqId, resolve);
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });

  await new Promise((resolve) => (ws.onopen = resolve));

  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: isMobile,
  });

  await send('Page.navigate', { url });

  // Poll until .apple-card is in DOM
  let cardCount = 0;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const evalRes = await send('Runtime.evaluate', {
        expression: 'document.querySelectorAll(".m3-card-outlined, .apple-card").length',
        returnByValue: true,
      });
      cardCount = evalRes.result?.result?.value || 0;
      if (cardCount > 0) {
        console.log(`Found ${cardCount} cards on ${url}`);
        break;
      }
    } catch {
      // ignore while navigating
    }
  }

  // Wait extra 1200ms for images and fonts to finish rendering
  await new Promise((r) => setTimeout(r, 1200));

  const res = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(res.result.data, 'base64');
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved ${outPath} (${buffer.length} bytes, ${width}x${height})`);

  ws.close();
}

async function run() {
  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('No page target found');

  const wsUrl = page.webSocketDebuggerUrl;

  // 1. Desktop Home view
  await capture(
    wsUrl,
    'http://127.0.0.1:3035',
    '/Users/vincent/Dev/navanem/wishlist/docs/screenshots/desktop-home.png',
    1280,
    880,
    false
  );

  // 2. Mobile portrait view (iPhone 14/15/16)
  await capture(
    wsUrl,
    'http://127.0.0.1:3035',
    '/Users/vincent/Dev/navanem/wishlist/docs/screenshots/mobile-view.png',
    390,
    844,
    true
  );

  // 3. Family sharing view
  await capture(
    wsUrl,
    'http://127.0.0.1:3035/partage/notre-famille',
    '/Users/vincent/Dev/navanem/wishlist/docs/screenshots/family-sharing.png',
    1280,
    840,
    false
  );
}

run().catch(console.error);
