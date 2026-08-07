/**
 * Recibe los leads de la landing y los escribe en la hoja "Leads" del CRM
 * ASETRANSC_Seguimiento_Leads_actualizado.
 *
 * Instalación (una sola vez):
 *   1. Ir a script.google.com (o abrir la hoja → Extensiones → Apps Script;
 *      da igual, el script abre la hoja por ID)
 *   2. Pegar este archivo completo, reemplazando lo que haya
 *   3. Guardar (icono del disquete) -- hasta que no se guarde, el menú de
 *      funciones aparece vacío y no se puede ejecutar nada
 *   4. Elegir la función probarGuardado y pulsar Ejecutar, para autorizar
 *   5. Implementar → Nueva implementación → tipo "Aplicación web"
 *        · Ejecutar como: Yo
 *        · Quién tiene acceso: Cualquier usuario
 *   6. Autorizar cuando lo pida (es tu propia cuenta sobre tu propia hoja)
 *   7. Copiar la URL que entrega y pegarla en CRM_ENDPOINT dentro de index.html
 *
 * Al cambiar este código hay que volver a "Implementar → Gestionar
 * implementaciones → editar → Nueva versión", si no se sigue ejecutando la
 * versión anterior.
 */

// Identificador de la hoja ASETRANSC_Seguimiento_Leads_actualizado. Se abre por
// ID y no con getActiveSpreadsheet() para que funcione también si el script se
// creó como proyecto suelto (script.google.com) y no desde Extensiones.
var ID_HOJA = '13FWsqyDH3pKaDddr77Fl6YgwczM8qK1IrShJ8SS623U';

// La fila 3 tiene los encabezados; los datos arrancan en la 4.
var FILA_ENCABEZADOS = 3;
var NOMBRE_HOJA = 'Leads';

// Responsable por defecto de los leads que entran por la landing.
var RESPONSABLE = 'Diego Fernández';

// Días que se suman a la fecha de contacto para proponer el próximo seguimiento.
var DIAS_SEGUIMIENTO = 7;

function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);
    guardarLead(datos);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // Se registra el error en el log de Apps Script para poder revisarlo,
    // pero se responde 200: el cliente no debe ver un fallo del CRM.
    console.error('No se pudo guardar el lead: ' + err + ' | payload: ' + (e && e.postData ? e.postData.contents : 'vacío'));
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function guardarLead(d) {
  var hoja = SpreadsheetApp.openById(ID_HOJA).getSheetByName(NOMBRE_HOJA);
  if (!hoja) throw new Error('No existe la pestaña "' + NOMBRE_HOJA + '" en la hoja indicada');

  var hoy = new Date();
  var seguimiento = new Date(hoy.getTime() + DIAS_SEGUIMIENTO * 24 * 60 * 60 * 1000);
  var zona = Session.getScriptTimeZone();

  // "Interés" no tiene columna propia en el CRM: se guarda en Notas, que es
  // donde el asesor ya escribe el contexto del prospecto.
  var notas = d.interes ? ('Interés declarado en la landing: ' + d.interes) : '';

  // El orden debe coincidir con las columnas A..N de la hoja.
  var fila = [
    Utilities.formatDate(hoy, zona, 'yyyy-MM-dd'),          // A Fecha contacto
    d.nombre   || '',                                        // B Nombre
    d.empresa  || '',                                        // C Empresa
    d.telefono || '',                                        // D Teléfono
    d.correo   || '',                                        // E Correo
    d.flota    || '',                                        // F Tipo de flota
    d.marca    || 'Sin definir',                             // G Marca de interés
    'Landing page',                                          // H Origen del lead
    'Nuevo',                                                 // I Estado
    Utilities.formatDate(seguimiento, zona, 'yyyy-MM-dd'),   // J Próximo seguimiento
    RESPONSABLE,                                             // K Responsable
    notas,                                                   // L Notas
    d.mercado  || '',                                        // M Mercado
    d.sector   || ''                                         // N Sector vertical
  ];

  // Se escribe en la primera fila libre después de los encabezados, en vez de
  // appendRow: la hoja trae 1000 filas con formato, y appendRow las saltaría
  // todas dejando los datos al final del archivo.
  var ultima = Math.max(hoja.getLastRow(), FILA_ENCABEZADOS);
  hoja.getRange(ultima + 1, 1, 1, fila.length).setValues([fila]);
}

/**
 * Prueba manual: ejecutar esta función desde el editor de Apps Script
 * (seleccionarla arriba y pulsar Ejecutar) para verificar que escribe bien
 * antes de conectar la landing. Escribe una fila de prueba que hay que borrar.
 */
function probarGuardado() {
  guardarLead({
    nombre: 'PRUEBA - borrar esta fila',
    empresa: 'Empresa de prueba',
    telefono: '3000000000',
    correo: 'prueba@correo.com',
    flota: '5-10 vehículos',
    marca: 'Sinotruk',
    interes: 'Diagnóstico gratuito de flota',
    mercado: 'Huila',
    sector: 'Café'
  });
}

/**
 * Restaura los encabezados de las columnas A..F, que se perdieron al pasar el
 * archivo de Excel a Google Sheets: quedaron en blanco y sin el fondo verde,
 * así que la tabla se veía cortada.
 *
 * Copia el formato desde G3 en vez de fijarlo a mano, para que quede idéntico
 * al resto aunque el diseño de la hoja cambie más adelante.
 *
 * Ejecutar una sola vez desde el editor.
 */
function repararEncabezados() {
  var hoja = SpreadsheetApp.openById(ID_HOJA).getSheetByName(NOMBRE_HOJA);
  if (!hoja) throw new Error('No existe la pestaña "' + NOMBRE_HOJA + '"');

  var titulos = ['Fecha contacto', 'Nombre', 'Empresa', 'Teléfono', 'Correo', 'Tipo de flota'];
  var destino = hoja.getRange(FILA_ENCABEZADOS, 1, 1, titulos.length); // A3:F3

  // El formato se toma de una columna que sí lo conserva.
  hoja.getRange(FILA_ENCABEZADOS, 7).copyTo(destino, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  destino.setValues([titulos]);

  // La franja azul del título también se cortaba en la columna G.
  hoja.getRange(1, 7).copyTo(hoja.getRange(1, 1, 1, 6), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);

  SpreadsheetApp.flush();
}
