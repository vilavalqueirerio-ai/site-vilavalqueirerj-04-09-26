/* ========================================
   POST /api/admin/auth - Valida o login do administrador
   Recebe JSON { user, pass } e confere com as variáveis
   ADMIN_USER / ADMIN_PASS (padrão: jsmunize / jojo7811).
   ======================================== */
import { json, checkCredentials } from '../../_defaults.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    let body;
    try {
        body = await request.json();
    } catch (err) {
        return json({ ok: false, error: 'body' }, 400);
    }

    const allowedUser = env.ADMIN_USER || 'jsmunize';
    const allowedPass = env.ADMIN_PASS || 'jojo7811';

    if (body.user === allowedUser && body.pass === allowedPass) {
        return json({ ok: true });
    }
    return json({ ok: false, error: 'invalid', message: 'Usuário ou senha inválidos.' }, 401);
}