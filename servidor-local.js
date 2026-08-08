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
