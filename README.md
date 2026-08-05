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

El formulario **no usa backend**. Al enviarlo, arma un mensaje de WhatsApp con los
datos que llenó el cliente y abre el chat del asesor. El prospecto llega directo al
celular donde ya se atiende, en vez de quedarse en una hoja de cálculo que nadie revisa.

El número del asesor está en la constante `WHATSAPP_ASESOR` dentro de `index.html`.
Para cambiarlo, se edita ahí (aparece también en el botón flotante de WhatsApp).

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
