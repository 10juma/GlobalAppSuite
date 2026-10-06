# GlobalAppSuite — Sitio web y landing pages

Sitio principal de **Global App Suite** (`globalappsuite.com.mx`) y las landing pages de los productos SaaS propios. No hay framework ni build step: todo es HTML + CSS + JS estático. El backend de los formularios de contacto corre como Serverless Function en **Vercel**.

---

## Estructura

```
GlobalAppSuite/
├── index.html          # Sitio principal (empresa, servicios, portafolio)
├── favicon.png         # Ícono del sitio principal
│
├── api/
│   └── contacto.js     # Serverless Function (Vercel) — formularios de contacto
│
├── revendo/
│   ├── index.html      # Landing page de Revendo
│   └── img/            # Imágenes propias de Revendo (webp optimizadas)
│
└── pitazo/
    ├── index.html      # Landing page de Pitazo
    ├── favicon.ico
    └── img/            # Imágenes de Pitazo (screenshots + publicidad)
```

---

## Despliegue

Alojado en **Vercel**. El directorio raíz se sirve como sitio estático; la carpeta `api/` se despliega automáticamente como Serverless Functions.

No se requiere build. Un push a `main` despliega todo.

---

## Formulario de contacto (`api/contacto.js`)

Recibe `POST /api/contacto` con JSON `{ nombre, correo, mensaje, origen }` y envía el correo por **Resend**.

### Variables de entorno en Vercel

| Variable | Obligatoria | Default |
|---|---|---|
| `RESEND_API_KEY` | Sí | — |
| `CONTACTO_PARA` | No | `juanmanuel@globalappsuite.com.mx` |
| `CONTACTO_DE` | No | `Global App Suite <revendo@globalappsuite.com.mx>` |

### Orígenes reconocidos

| `origen` en el body | Etiqueta en el correo |
|---|---|
| `sitio` | Sitio GlobalAppSuite |
| `revendo` | Revendo |
| `pitazo` | Pitazo |

Para agregar un nuevo producto, añadir su clave al objeto `ORIGENES` en `contacto.js`.

### Protección anti-bots

El formulario incluye un campo `web` oculto (honeypot). Si llega relleno, el servidor responde `{ ok: true }` sin enviar nada.

---

## Productos propios

### Revendo
- **URL**: `globalappsuite.com.mx/revendo/`
- **App**: `revendo.globalappsuite.com.mx`
- **Descripción**: SaaS para negocios que compran, producen o revenden productos. Inventario, ventas, compras, producción con recetas, rutas de reparto.
- **Precio**: $49 MXN/mes · 15 días gratis
- **Stack de la app**: ASP.NET Core · Flutter · SQL Server · Stripe

### Pitazo
- **URL**: `globalappsuite.com.mx/pitazo/`
- **App**: `pitazo.globalappsuite.com.mx`
- **Descripción**: SaaS para gestión de ligas de fútbol 7. Partidos en vivo, equipos, árbitros, canchas, finanzas, comunicados y app móvil.
- **Precio**: $799/mes (plan base: 1 cancha · 1 liga · 30 equipos) + add-ons opcionales · 30 días gratis
- **Add-ons**: canchas extra (+$350/cancha), ligas extra (+$200), paquetes de equipos (+$150/20 equipos), estadísticas avanzadas (+$150), comunicación, reservas por hora (+$500), admins extra (+$120)
- **Stack de la app**: ASP.NET Core · Flutter · SQL Server · SignalR · Firebase · Stripe

---

## Convención de imágenes

- Las imágenes del sitio principal van en la raíz o en carpetas específicas por producto.
- Las imágenes de cada landing van en `/<producto>/img/`.
- Al copiar desde el share de Windows en macOS, eliminar los archivos `._*` y `.DS_Store` que genera el Finder:

```bash
find "/Volumes/[C] Windows 11/Dev/GlobalAppSuite" \( -name "._*" -o -name ".DS_Store" \) -delete
```

---

## Agregar una nueva landing page

1. Crear la carpeta `/<producto>/` con `index.html` e `img/`.
2. Agregar la tarjeta del producto en la sección `#productos` de `index.html` (raíz), siguiendo el patrón de las tarjetas de Revendo y Pitazo.
3. Registrar el origen en `api/contacto.js` si el nuevo producto tendrá formulario de contacto propio.
