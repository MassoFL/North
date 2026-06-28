#!/usr/bin/env node
// Crée (une seule fois) l'agent Mistral persistant utilisé par /api/chat,
// puis affiche son ID à coller dans la variable d'environnement Vercel MISTRAL_AGENT_ID.
//
// Usage :
//   MISTRAL_API_KEY=ta_cle node scripts/create-agent.js
//
// Nécessite Node 18+ (fetch global).

const { agentPayload } = require('../api/_agentConfig');

(async () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
        console.error('❌ Définis MISTRAL_API_KEY avant de lancer le script :');
        console.error('   MISTRAL_API_KEY=ta_cle node scripts/create-agent.js');
        process.exit(1);
    }

    try {
        const r = await fetch('https://api.mistral.ai/v1/agents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agentPayload())
        });

        const text = await r.text();
        if (!r.ok) {
            console.error('❌ Échec de création de l\'agent (HTTP ' + r.status + ') :');
            console.error(text);
            process.exit(1);
        }

        const agent = JSON.parse(text);
        console.log('\n✅ Agent créé avec succès.\n');
        console.log('   MISTRAL_AGENT_ID=' + agent.id + '\n');
        console.log('→ Ajoute cette variable dans Vercel (Settings → Environment Variables),');
        console.log('  puis lance un nouveau déploiement (Redeploy).');
    } catch (e) {
        console.error('❌ Erreur :', e.message || e);
        process.exit(1);
    }
})();
