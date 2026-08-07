/**
 * Recibe los leads de la landing y los escribe en la hoja "Leads" del CRM
 * ASETRANSC_Seguimiento_Leads_actualizado.
 *
 * Instalación (una sola vez):
 *   1. Abrir la hoja en Google Sheets
 *   2. Menú Extensiones → Apps Script
 *   3. Borrar lo que haya y pegar este archivo completo
 *   4. Guardar (icono del disquete)
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
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
  if (!hoja) throw new Error('No existe la hoja "' + NOMBRE_HOJA + '"');

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
