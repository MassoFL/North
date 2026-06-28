// Vercel serverless function — proxy vers l'Agents API de Mistral (avec recherche web).
// La clé MISTRAL_API_KEY reste côté serveur (variable d'environnement Vercel),
// elle n'est jamais exposée au navigateur.
//
// Optionnel : définir MISTRAL_AGENT_ID pour réutiliser un agent existant
// (évite d'en recréer un à chaque démarrage à froid de la fonction).

const BASE = 'https://api.mistral.ai/v1/beta';
const MODEL = 'mistral-medium-latest';

// Cache de l'agent pour les invocations "à chaud" de la même instance.
let cachedAgentId = null;

function instructions() {
    return `Tu es l'assistant créatif de "BoredThinker / LokedIn", une application où les utilisateurs publient des "Stories" (Histoires).

Concept d'une Story :
- C'est un "mur" composé d'une liste ordonnée de blocs.
- Quatre types de blocs : Texte, Tableau blanc (un dessin ou schéma façon Excalidraw), Carrousel de photos, et Vidéo.
- Chaque Story a un titre, affiché en gras en haut de l'histoire.
- Une Story peut être lue comme une "vidéo consolidée" : dans l'ordre des blocs, chaque texte est affiché à l'écran et lu à voix haute, chaque photo est montrée, chaque vidéo est jouée.

Ton rôle :
- Aider l'utilisateur à DÉVELOPPER son Histoire : trouver des idées, structurer le récit, choisir l'ordre et le type des blocs, améliorer ou rédiger des textes, suggérer quelles photos / dessins / vidéos ajouter, soigner le fil narratif et l'accroche.
- Tu peux effectuer des recherches sur le web pour obtenir des informations à jour, vérifier des faits ou enrichir l'histoire ; cite alors tes sources.
- Tu es un CONSEILLER purement conversationnel. Tu n'as AUCUN moyen d'agir sur l'Histoire, ni de créer, modifier ou supprimer un bloc. Ne prétends jamais l'avoir fait. À la place, donne des suggestions concrètes que l'utilisateur appliquera lui-même.
- Réponds dans la langue de l'utilisateur (français par défaut). Sois concret, créatif et concis. Propose des exemples directement réutilisables : titres, paragraphes, plan de blocs.`;
}

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
        body: JSON.stringify({
            model: MODEL,
            name: 'BoredThinker Story Assistant',
            description: 'Assistant créatif pour développer des Stories, avec recherche web.',
            instructions: instructions(),
            tools: [{ type: 'web_search' }],
            completion_args: { temperature: 0.7, top_p: 0.95 }
        })
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

        const r = await fetch(`${BASE}/conversations/start`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ agent_id: agentId, inputs })
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
