// Vercel serverless function — proxy vers l'API de chat Mistral.
// La clé MISTRAL_API_KEY reste côté serveur (variable d'environnement Vercel),
// elle n'est jamais exposée au navigateur.

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL = 'mistral-small-latest';

function buildSystemPrompt(story) {
    let ctx = '';
    if (story && story.title) {
        ctx += `\n\nHistoire en cours de rédaction par l'utilisateur :\n- Titre : "${story.title}"`;
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
    }

    return `Tu es l'assistant créatif de "LokedIn", une application où les utilisateurs publient des "Stories" (Histoires).

Concept d'une Story :
- C'est un "mur" composé d'une liste ordonnée de blocs.
- Il existe quatre types de blocs : Texte, Tableau blanc (un dessin ou schéma façon Excalidraw), Carrousel de photos, et Vidéo.
- Chaque Story a un titre, affiché en gras en haut de l'histoire.
- Une Story peut être lue comme une "vidéo consolidée" : dans l'ordre des blocs, chaque texte est affiché à l'écran et lu à voix haute, chaque photo est montrée, chaque vidéo est jouée.

Ton rôle :
- Aider l'utilisateur à DÉVELOPPER son Histoire : trouver des idées, structurer le récit, choisir l'ordre et le type des blocs, améliorer ou rédiger des textes, suggérer quelles photos / dessins / vidéos ajouter, soigner le fil narratif et l'accroche.
- Tu es un CONSEILLER purement conversationnel. Tu n'as AUCUN moyen d'agir sur l'Histoire, ni de créer, modifier ou supprimer un bloc. Ne prétends jamais l'avoir fait. À la place, donne des suggestions concrètes que l'utilisateur appliquera lui-même.
- Réponds dans la langue de l'utilisateur (français par défaut). Sois concret, créatif et concis. Quand c'est utile, propose des exemples directement réutilisables : titres, paragraphes, plan de blocs.${ctx}`;
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

    try {
        const body = (req.body && typeof req.body === 'object')
            ? req.body
            : JSON.parse(req.body || '{}');

        const incoming = Array.isArray(body.messages) ? body.messages : [];
        const safeMessages = incoming
            .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .slice(-20)
            .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

        const messages = [
            { role: 'system', content: buildSystemPrompt(body.story) },
            ...safeMessages
        ];

        const r = await fetch(MISTRAL_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!r.ok) {
            const errText = await r.text();
            res.status(502).json({ error: 'Erreur API Mistral: ' + errText.slice(0, 500) });
            return;
        }

        const data = await r.json();
        const reply = data.choices && data.choices[0] && data.choices[0].message
            ? data.choices[0].message.content
            : '';
        res.status(200).json({ reply });
    } catch (e) {
        res.status(500).json({ error: 'Erreur serveur: ' + (e.message || String(e)) });
    }
};
