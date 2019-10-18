const script = Buffer.from(String.raw`// examples-demo-mod
  console.log('[mod] load mod of frontend');
`, 'utf-8');

/**
 * @typedef {import('carlo').App} App .
 * 
 * @param {App} app .
 * @param {typeof require} require .
 */
exports.default = async (app, require) => {
  console.log('[mod] load mod of backend');

  const Core = require('@fure/core').Core;
  Core.main.emitter.on('load', () => {
    app.mainWindow().evaluate(() => {
      const script = document.createElement('script');
      script.id = 'mod';
      script.src = 'https://domain/examples-demo-mod';
      document.body.appendChild(script);
    });
  });

  app.serveHandler(async request => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (request.url() !== 'https://domain/examples-demo-mod') return false;
    // redirect all pages to `index.html`.
    const headers = { 'content-type': 'application/x-javascript', 'Access-Control-Allow-Origin': 'localhost' };
    request.fulfill({ status: 200, headers, body: script });
    return true;
  });
}
