/* ========================================
   VILA VALQUEIRE RJ - Função serverless do Instagram
   Cloudflare Pages Function: /api/instagram

   Busca as postagens mais recentes do perfil Business/Criador
   usando a Instagram Graph API. O token é lido da variável de
   ambiente INSTAGRAM_TOKEN (protegido — nunca exposto ao navegador).

   Como configurar no Cloudflare:
   1. Crie um app em developers.facebook.com e obtenha o token
      de longa duração com permissão instagram_business_basic.
   2. Em Cloudflare Pages > Settings > Environment variables,
      adicione:
        INSTAGRAM_TOKEN = seu token
        INSTAGRAM_USER_ID = número do seu perfil (essas etapas no README)
   3. Faça o deploy. O feed é atualizado aqui no servidor.
   ======================================== */

const GRAPH_URL = 'https://graph.facebook.com/v21.0';

function json(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=300',
            'Access-Control-Allow-Origin': '*',
            ...extraHeaders
        }
    });
}

export async function onRequest(context) {
    const { env } = context;

    const token = env.INSTAGRAM_TOKEN;
    const userId = env.INSTAGRAM_USER_ID;

    if (!token || !userId) {
        return json({
            ok: false,
            error: 'config',
            message: 'Defina INSTAGRAM_TOKEN e INSTAGRAM_USER_ID nas variáveis de ambiente do Cloudflare Pages.'
        }, 200);
    }

    const fields = [
        'id',
        'caption',
        'media_type',
        'media_url',
        'thumbnail_url',
        'permalink',
        'timestamp',
        'like_count',
        'comments_count'
    ].join(',');

    const url = `${GRAPH_URL}/${userId}/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${token}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data.error) {
            return json({
                ok: false,
                error: 'api',
                message: data.error ? data.error.message : 'Erro ao consultar a API do Instagram.'
            }, 200);
        }

        const posts = (data.data || []).map(post => ({
            id: post.id,
            caption: post.caption || '',
            media_type: post.media_type || 'IMAGE',
            media_url: post.media_url || '',
            thumbnail_url: post.thumbnail_url || '',
            permalink: post.permalink || '',
            timestamp: post.timestamp || '',
            like_count: post.like_count || 0,
            comments_count: post.comments_count || 0
        }));

        return json({
            ok: true,
            count: posts.length,
            posts,
            fetched_at: new Date().toISOString()
        });
    } catch (err) {
        return json({
            ok: false,
            error: 'network',
            message: 'Falha de rede ao buscar o feed do Instagram.'
        }, 200);
    }
}