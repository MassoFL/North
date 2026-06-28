// Vercel serverless function — proxy vers l'Agents API de Mistral (avec recherche web).
// La clé MISTRAL_API_KEY reste côté serveur (variable d'environnement Vercel),
// elle n'est jamais exposée au navigateur.
//
// Optionnel : définir MISTRAL_AGENT_ID pour réutiliser un agent existant
// (évite d'en recréer un à chaque démarrage à froid de la fonction).

const { agentPayload } = require('./_agentConfig');

const BASE = 'https://api.mistral.ai/v1';

// Cache de l'agent pour les invocations "à chaud" de la même instance.
let cachedAgentId = null;

function contextMessage(story) {
    if (!story || !story.title) return '';
    let ctx = `Contexte (ne réponds pas directement à ce message, utilise-le comme base) — Histoire en cours :\n- Titre : "${story.title}"`;
    if (Array.isArray(story.blocks) && story.blocks.length) {
        ctx += `\n- Blocs actuels (dans l'ordre) :`;
        story.blocks.forEach((b, i) => {
            if (b.type === 'text') ctx += `\n  ${i + 1}. Texte : "${String(b.text || '').slice(0, 300)}"`;
            else if (b.type === 'whiteboard') ctx += `\n  ${i + 1}. Tableau blanc (dessin/schéma)`;
            else if (b.type === 'carousel') ctx += `\n  ${i + 1}. Carrousel de ${b.count || 0} photo(s)`;
            else if (b.type === 'video') ctx += `\n  ${i + 1}. Vidéo`;
        });
    } else {
        ctx += `\n- Aucun bloc pour l'instant.`;
    }
    return ctx;
}

async function getAgentId(headers) {
    if (process.env.MISTRAL_AGENT_ID) return process.env.MISTRAL_AGENT_ID;
    if (cachedAgentId) return cachedAgentId;

    const r = await fetch(`${BASE}/agents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(agentPayload())
    });
    if (!r.ok) {
        throw new Error('Création de l\'agent: ' + (await r.text()).slice(0, 300));
    }
    const agent = await r.json();
    cachedAgentId = agent.id;
    return cachedAgentId;
}

// Extrait le texte assistant + les sources citées depuis la réponse "conversations".
function extractReply(data) {
    const outputs = Array.isArray(data.outputs) ? data.outputs : [];
    let text = '';
    const sources = [];
    const seen = new Set();

    for (const o of outputs) {
        if (!o) continue;
        const isMessage = o.type === 'message.output' || o.role === 'assistant' || o.content !== undefined;
        if (!isMessage) continue;

        const content = o.content;
        if (typeof content === 'string') {
            text += content;
        } else if (Array.isArray(content)) {
            for (const chunk of content) {
                if (!chunk) continue;
                if (chunk.type === 'text' && typeof chunk.text === 'string') {
                    text += chunk.text;
                } else if (chunk.type === 'tool_reference' && chunk.url) {
                    if (!seen.has(chunk.url)) {
                        seen.add(chunk.url);
                        sources.push({ title: chunk.title || chunk.url, url: chunk.url });
                    }
                }
            }
        }
    }
    return { text: text.trim(), sources };
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: "La clé MISTRAL_API_KEY n'est pas configurée sur le serveur." });
        return;
    }

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const body = (req.body && typeof req.body === 'object')
            ? req.body
            : JSON.parse(req.body || '{}');

        const incoming = Array.isArray(body.messages) ? body.messages : [];
        const safeMessages = incoming
            .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .slice(-20)
            .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

        const agentId = await getAgentId(headers);

        const inputs = [];
        const ctx = contextMessage(body.story);
        if (ctx) inputs.push({ role: 'user', content: ctx });
        for (const m of safeMessages) inputs.push(m);

        const r = await fetch(`${BASE}/conversations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ agent_id: agentId, inputs, stream: false })
        });

        if (!r.ok) {
            res.status(502).json({ error: 'Erreur API Mistral: ' + (await r.text()).slice(0, 500) });
            return;
        }

        const data = await r.json();
        let { text, sources } = extractReply(data);
        let reply = text || '(réponse vide)';
        if (sources.length) {
            reply += '\n\nSources :\n' + sources.map((s, i) => `${i + 1}. ${s.title} — ${s.url}`).join('\n');
        }
        res.status(200).json({ reply });
    } catch (e) {
        res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
    }
};
