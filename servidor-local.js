/*
 * Servidor estático para ver la landing en local antes de publicarla.
 *
 *   node servidor-local.js      →  http://localhost:4000
 *
 * La landing no necesita servidor para funcionar en producción (GitHub Pages
 * sirve los archivos tal cual), pero abrirla como archivo suelto rompe las
 * rutas relativas y el detector de utm_source, así que para probar conviene
 * servirla por HTTP como lo hará el sitio real.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PUERTO = process.env.PORT || 4000;
const RAIZ = __dirname;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  // Guardado de piezas generadas con canvas (solo en local, para diseño).
  if (req.method === 'POST' && req.url === '/_guardar') {
    let cuerpo = '';
    req.on('data', (c) => { cuerpo += c; });
    req.on('end', () => {
      try {
        const { dataUri, nombre } = JSON.parse(cuerpo);
        const buf = Buffer.from(dataUri.split(',')[1], 'base64');
        const destino = path.join(RAIZ, 'assets', path.basename(nombre));
        fs.writeFileSync(destino, buf);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, kb: Math.round(buf.length / 1024) }));
      } catch (e) {
        res.writeHead(400).end(JSON.stringify({ ok: false, error: String(e) }));
      }
    });
    return;
  }

  // Se descarta la query (?utm_source=...) para resolver el archivo.
  let ruta = decodeURIComponent(req.url.split('?')[0]);
  if (ruta === '/') ruta = '/index.html';

  // Nunca salir de la carpeta del proyecto, aunque la URL traiga "..".
  const destino = path.join(RAIZ, path.normalize(ruta).replace(/^([/\\])+/, ''));
  if (!destino.startsWith(RAIZ)) {
    res.writeHead(403).end('Prohibido');
    return;
  }

  fs.readFile(destino, (err, datos) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>No existe: ' + ruta + '</p>');
      return;
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(destino).toLowerCase()] || 'application/octet-stream' });
    res.end(datos);
  });
}).listen(PUERTO, () => {
  console.log('Landing de ASETRANSC en http://localhost:' + PUERTO);
});
