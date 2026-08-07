/*
 * Genera el código QR que lleva a la landing.
 *
 * Uso:  node generar-qr.js [utm_source] [utm_campaign]
 * Ej.:  node generar-qr.js qr feria-neiva
 *
 * El enlace lleva utm_source para que los leads que entren por el QR queden
 * marcados en el CRM y no se confundan con los que llegan por otros canales.
 *
 * Se usa corrección de errores alta (H): un QR impreso se ensucia, se dobla o
 * se lee de lejos, y con corrección baja deja de funcionar.
 */
const fs = require('node:fs');
const path = require('node:path');
const QRCode = require(path.join(__dirname, '..', 'paquete_code', 'scripts', 'node_modules', 'qrcode'));

const BASE = 'https://dianfer04-glitch.github.io/asetransc-landing/';
const AZUL = '#1B3A4B';

const fuente = process.argv[2] || 'qr';
const campana = process.argv[3] || '';

const params = new URLSearchParams({ utm_source: fuente });
if (campana) params.set('utm_campaign', campana);
const destino = BASE + '?' + params.toString();

const dir = path.join(__dirname, 'assets');
fs.mkdirSync(dir, { recursive: true });

const sufijo = campana ? `-${campana}` : '';
const archivoPng = path.join(dir, `qr-landing${sufijo}.png`);
const archivoSvg = path.join(dir, `qr-landing${sufijo}.svg`);

const opciones = {
  errorCorrectionLevel: 'H',
  margin: 2,
  color: { dark: AZUL, light: '#FFFFFF' },
};

(async () => {
  // PNG grande: sirve para imprimir sin que se pixele.
  await QRCode.toFile(archivoPng, destino, { ...opciones, width: 1400 });
  // SVG: escala a cualquier tamaño sin perder nitidez (vallas, pendones).
  await QRCode.toFile(archivoSvg, destino, { ...opciones, type: 'svg', width: 1400 });

  console.log(JSON.stringify({
    destino,
    png: path.basename(archivoPng),
    svg: path.basename(archivoSvg),
    kb: Math.round(fs.statSync(archivoPng).size / 1024),
  }, null, 1));
})();
