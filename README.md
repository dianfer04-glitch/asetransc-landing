# Landing page — ASETRANSC Colombia

Página pública de presentación de ASETRANSC Colombia S.A.S., pensada para enviarse
por WhatsApp a clientes potenciales.

**En vivo:** https://dianfer04-glitch.github.io/asetransc-landing/

## Estructura

```
├── index.html          La página completa (HTML + estilos + scripts en un solo archivo)
├── assets/
│   ├── og-image.jpg    Imagen de vista previa al compartir el enlace (1200×630)
│   └── favicon.svg     Ícono de la pestaña del navegador
└── README.md
```

Es un sitio estático: no necesita servidor, base de datos ni mantenimiento.

## Cómo se capturan los prospectos

Al enviar el formulario pasan dos cosas:

1. **Se registra el lead en el CRM** — la hoja `ASETRANSC_Seguimiento_Leads_actualizado`
   de Google Drive. Así queda guardado aunque el cliente se arrepienta y no llegue a
   mandar el WhatsApp.
2. **Se abre el chat de WhatsApp** del asesor con el mensaje ya escrito.

El número del asesor está en la constante `WHATSAPP_ASESOR` dentro de `index.html`
(aparece también en el botón flotante de WhatsApp).

### Conectar el CRM (paso único, lo hace el dueño de la hoja)

Mientras `CRM_ENDPOINT` esté vacío en `index.html`, el formulario **solo abre WhatsApp**:
el lead no se pierde, pero tampoco queda registrado en la hoja.

1. Abrir la hoja `ASETRANSC_Seguimiento_Leads_actualizado` en Google Sheets
2. Menú **Extensiones → Apps Script**
3. Borrar el contenido y pegar `crm-apps-script.gs` completo (está en este repo)
4. Guardar
5. **Implementar → Nueva implementación → Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Autorizar cuando lo pida
7. Copiar la URL resultante y pegarla en `CRM_ENDPOINT` dentro de `index.html`
8. `git commit` y `git push`

Antes de conectar la landing conviene ejecutar la función `probarGuardado()` desde el
editor de Apps Script: escribe una fila de prueba en la hoja (hay que borrarla después)
y confirma que las columnas quedan alineadas.

## Código QR

En `assets/` está el QR que lleva a la landing, listo para usar:

| Archivo | Para qué |
|---|---|
| `qr-landing.png` | 1400×1400 px — volantes, tarjetas, publicaciones en redes |
| `qr-landing.svg` | Vectorial — pendones, vallas, cualquier tamaño sin perder nitidez |

Lleva `?utm_source=qr`, así que los leads que entren escaneándolo quedan
identificados en el CRM y no se confunden con los de otros canales.

Para generar uno de una campaña puntual:

```bash
node generar-qr.js qr feria-neiva
```

Eso crea `qr-landing-feria-neiva.png` con `utm_campaign=feria-neiva`, y en el CRM
esos leads llegan con la campaña anotada en la columna Notas. Sirve para saber qué
volante o qué evento funcionó.

Usa corrección de errores alta (nivel H): un QR impreso se ensucia, se dobla y se
escanea de lejos; con corrección baja dejaría de leerse.

**Al imprimirlo:** mínimo 2,5 cm de lado para escaneo de cerca, y deja el margen
blanco alrededor — sin ese margen muchos lectores no lo detectan.

## Meta Ads

La página trae el **Meta Pixel** listo, pero desactivado hasta que se le ponga el ID:
`window.META_PIXEL_ID` en el `<head>` de `index.html`. Se saca del Administrador de
eventos de Meta → Orígenes de datos. Mientras esté vacío no se carga ningún script de
Meta ni se envía nada.

Eventos que ya se registran:

| Evento | Cuándo se dispara | Para qué sirve |
|---|---|---|
| `PageView` | Al abrir la página | Público de remarketing |
| `Lead` | Al enviar el formulario | **Es el que optimiza la campaña.** Incluye la marca de interés como categoría |
| `Contact` | Al pulsar el botón flotante de WhatsApp | Evita subestimar resultados: sin él solo contarían los envíos del formulario |

Antes de gastar en anuncios conviene verificar con la extensión **Meta Pixel Helper**
de Chrome que los tres eventos aparecen.

**Pendiente para poder anunciar:** Meta exige una **política de privacidad** accesible
desde la landing para aprobar campañas que capturan datos. Todavía no existe.

### Qué columna llena cada campo

| Campo del formulario | Columna del CRM |
|---|---|
| *(automático)* | A · Fecha contacto |
| Nombre completo | B · Nombre |
| Empresa | C · Empresa |
| Teléfono / WhatsApp | D · Teléfono |
| Correo | E · Correo |
| Tamaño de flota | F · Tipo de flota |
| Marca de interés | G · Marca de interés |
| *(fijo: "Landing page")* | H · Origen del lead |
| *(fijo: "Nuevo")* | I · Estado |
| *(automático: +7 días)* | J · Próximo seguimiento |
| *(fijo, ver `RESPONSABLE`)* | K · Responsable |
| ¿Qué te interesa? | L · Notas |
| ¿Dónde operas? | M · Mercado |
| ¿Qué transportas? | N · Sector vertical |

"¿Qué te interesa?" no tiene columna propia en el CRM, así que se guarda en **Notas**.

## Cómo hacer cambios

1. Editar `index.html`.
2. `git add . && git commit -m "descripción del cambio" && git push`
3. GitHub Pages publica solo, en 1-2 minutos.

## Migrar a Cloudflare Pages (recomendado a futuro)

GitHub Pages funciona bien, pero Cloudflare Pages es más rápido en Colombia y
permite dominio propio con más control. Para migrar:

1. Crear cuenta gratuita en https://pages.cloudflare.com
2. **Connect to Git** → elegir este repositorio
3. Build command: *(vacío)* · Output directory: `/`
4. Deploy

Al conectar un dominio propio (ej. `asetransc.com`), hay que actualizar las URLs
absolutas de las etiquetas `og:image`, `og:url` y `canonical` en `index.html`:
si apuntan al dominio viejo, la vista previa de WhatsApp se rompe.

## Verificar la vista previa de WhatsApp

Después de cada despliegue que toque las etiquetas `og:`, conviene revisar cómo se ve
el enlace al compartirlo:

- https://developers.facebook.com/tools/debug/ (pegar la URL y usar *Scrape Again*)

WhatsApp cachea la vista previa: si se cambia la imagen, puede tardar en reflejarse.
