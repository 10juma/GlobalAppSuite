// Recibe el formulario de contacto (sitio principal y /revendo) y lo envía por Resend.
// Variables de entorno en Vercel:
//   RESEND_API_KEY   (obligatoria)  llave de Resend; nunca va en el repositorio
//   CONTACTO_PARA    (opcional)     destino; por defecto juanmanuel@globalappsuite.com.mx
//   CONTACTO_DE      (opcional)     remitente verificado en Resend; por defecto el de Revendo
const DESTINO = process.env.CONTACTO_PARA || 'juanmanuel@globalappsuite.com.mx';
const REMITENTE = process.env.CONTACTO_DE || 'Global App Suite <revendo@globalappsuite.com.mx>';
const ORIGENES = {
  revendo: 'Revendo',
  pitazo: 'Pitazo',
  sitio: 'Sitio GlobalAppSuite',
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, mensaje: 'Método no permitido.' });
  }

  const b = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});

  // Trampa para bots: este campo va oculto y una persona nunca lo llena. Se responde "ok" sin enviar nada.
  if (b.web) return res.status(200).json({ ok: true });

  const nombre = String(b.nombre || '').trim();
  const correo = String(b.correo || '').trim();
  const mensaje = String(b.mensaje || '').trim();
  const origen = ORIGENES[b.origen] ? b.origen : 'sitio';

  if (nombre.length < 2 || nombre.length > 100) return error(res, 'Escribe tu nombre.');
  if (!EMAIL_RE.test(correo) || correo.length > 150) return error(res, 'Escribe un correo válido para poder responderte.');
  if (mensaje.length < 10 || mensaje.length > 3000) return error(res, 'Cuéntanos un poco más en tu mensaje (mínimo 10 caracteres).');

  const llave = process.env.RESEND_API_KEY;
  if (!llave) {
    console.error('Falta RESEND_API_KEY en las variables de entorno de Vercel.');
    return res.status(500).json({ ok: false, mensaje: 'No pudimos enviar tu mensaje. Escríbenos por WhatsApp.' });
  }

  const html =
    '<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">' +
    `<p><strong>Origen:</strong> ${esc(ORIGENES[origen])}</p>` +
    `<p><strong>Nombre:</strong> ${esc(nombre)}</p>` +
    `<p><strong>Correo:</strong> ${esc(correo)}</p>` +
    '<p><strong>Mensaje:</strong></p>' +
    `<p style="white-space:pre-wrap">${esc(mensaje)}</p></div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${llave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: REMITENTE,
        to: [DESTINO],
        reply_to: correo, // al darle "Responder" le contestas directo a quien escribió
        subject: `[${ORIGENES[origen]}] Mensaje de ${nombre}`.slice(0, 150),
        html,
      }),
    });
    if (!r.ok) {
      console.error('Resend respondió', r.status, await r.text());
      return res.status(502).json({ ok: false, mensaje: 'No pudimos enviar tu mensaje. Escríbenos por WhatsApp.' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Error al llamar a Resend', e);
    return res.status(502).json({ ok: false, mensaje: 'No pudimos enviar tu mensaje. Escríbenos por WhatsApp.' });
  }
};

function error(res, mensaje) { return res.status(400).json({ ok: false, mensaje }); }
function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
