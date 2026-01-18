// Supabase configuration
const supabaseUrl = 'https://xfiytwnqkljoqvlqghjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaXl0d25xa2xqb3F2bHFnaGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzQ5MTIsImV4cCI6MjA3ODk1MDkxMn0.1tRrcRHy3AHIydP6d5PE18T4R6ys4sZTIlW6uDQZIyo';

console.log('Configuration Supabase:', { supabaseUrl, supabaseKey: supabaseKey.substring(0, 20) + '...' });
console.log('Environment:', { 
    protocol: window.location.protocol, 
    host: window.location.host,
    isProduction: window.location.host.includes('vercel.app')
});

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('Client Supabase créé:', supabaseClient);

// Test de base pour vérifier que Supabase fonctionne
if (!window.supabase) {
    console.error('ERREUR: Supabase n\'est pas chargé!');
    console.log('Tentative de rechargement de Supabase...');
    
    // Essayer de recharger Supabase
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
        console.log('Supabase rechargé avec succès');
        window.location.reload();
    };
    script.onerror = () => {
        alert('Erreur: Impossible de charger Supabase. Problème de réseau ou de CDN.');
    };
    document.head.appendChild(script);
}

class SkillsTracker {
    constructor() {
        this.skills = [];
        this.user = null;
        this.currentOnboardingStep = 1;
        this.editingSkillId = null;
        this.excalidrawAPI = null;
        this.currentWhiteboardSkillId = null;
        this.sharedMaps = [];
        this.currentMapId = null;
        this.currentMapMode = 'view'; // 'view' or 'edit'
        this.viewExcalidrawAPI = null;
        this.initializeElements();
        this.bindEvents();
        this.checkAuth();
        this.checkUrlForSharedMap();
    }

    initializeElements() {
        console.log('Initializing elements...');
        
        this.skillInput = document.getElementById('skillInput');
        this.addSkillBtn = document.getElementById('addSkillBtn');
        this.skillsContainer = document.getElementById('skillsContainer');
        this.authModal = document.getElementById('authModal');
        this.authForm = document.getElementById('authForm');
        this.authTitle = document.getElementById('authTitle');
        this.authSubmit = document.getElementById('authSubmit');
        this.authSwitchText = document.getElementById('authSwitchText');
        this.authSwitchLink = document.getElementById('authSwitchLink');
        this.userInfo = document.getElementById('userInfo');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.email = document.getElementById('email');
        this.password = document.getElementById('password');
        this.onboardingModal = document.getElementById('onboardingModal');
        this.skillType = document.getElementById('skillType');
        this.projectInput = document.getElementById('projectInput');
        this.targetInput = document.getElementById('targetInput');
        this.milestonesContainer = document.getElementById('milestonesContainer');
        this.addMilestoneBtn = document.getElementById('addMilestoneBtn');
        this.target = document.getElementById('target');
        this.targetUnit = document.getElementById('targetUnit');
        this.whiteboardModal = document.getElementById('whiteboardModal');
        this.whiteboardTitle = document.getElementById('whiteboardTitle');
        this.excalidrawContainer = document.getElementById('excalidrawContainer');
        this.saveWhiteboardBtn = document.querySelector('.save-whiteboard-btn');
        
        // Vérifier que les éléments critiques existent
        if (!this.authForm) {
            console.error('ERREUR: authForm non trouvé!');
        }
        if (!this.email) {
            console.error('ERREUR: email input non trouvé!');
        }
        if (!this.password) {
            console.error('ERREUR: password input non trouvé!');
        }
        
        console.log('Elements initialized:', {
            authForm: !!this.authForm,
            email: !!this.email,
            password: !!this.password,
            authSubmit: !!this.authSubmit
        });
    }

    bindEvents() {
        console.log('Binding events...');
        
        this.addSkillBtn.addEventListener('click', () => this.addSkill());
        this.skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSkill();
        });
        
        console.log('Binding auth form...');
        this.authForm.addEventListener('submit', (e) => {
            console.log('Form submitted!');
            this.handleAuth(e);
        });
        
        this.authSwitchLink.addEventListener('click', (e) => {
            console.log('Auth switch clicked!');
            this.toggleAuthMode(e);
        });
        
        this.logoutBtn.addEventListener('click', () => this.logout());
        
        // Archive modal
        this.archiveBtn = document.getElementById('archiveBtn');
        this.archiveModal = document.getElementById('archiveModal');
        this.archivedSkillsContainer = document.getElementById('archivedSkillsContainer');
        this.archiveFilter = document.getElementById('archiveFilter');
        
        this.archiveBtn.addEventListener('click', () => this.openArchiveModal());
        this.skillType.addEventListener('change', () => this.handleSkillTypeChange());
        this.addMilestoneBtn.addEventListener('click', () => this.addMilestoneInput());
        
        // Shared Maps
        this.sharedMapsBtn = document.getElementById('sharedMapsBtn');
        this.sharedMapsModal = document.getElementById('sharedMapsModal');
        this.createMapModal = document.getElementById('createMapModal');
        this.viewSharedMapModal = document.getElementById('viewSharedMapModal');
        this.saveMapMetaBtn = document.getElementById('saveMapMetaBtn');
        
        this.sharedMapsBtn.addEventListener('click', () => this.openSharedMapsModal());
        this.saveMapMetaBtn.addEventListener('click', () => this.saveMapMetadata());
        
        // Add goal modal
        this.addGoalBtn = document.getElementById('addGoalBtn');
        this.addGoalModal = document.getElementById('addGoalModal');
        this.addGoalBtn.addEventListener('click', () => this.openAddGoalModal());
        
        // Menu utilisateur
        this.menuToggle = document.getElementById('menuToggle');
        this.userMenu = document.getElementById('userMenu');
        this.menuToggle.addEventListener('click', () => this.toggleUserMenu());
        
        // Whiteboard save button
        if (this.saveWhiteboardBtn) {
            this.saveWhiteboardBtn.addEventListener('click', () => {
                console.log('Save button clicked via event listener!');
                this.saveWhiteboard();
            });
        }

        // Fermer les menus quand on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-container')) {
                document.querySelectorAll('.menu-dropdown').forEach(menu => {
                    menu.style.display = 'none';
                });
                // Fermer aussi le menu utilisateur
                if (this.userMenu) {
                    this.userMenu.style.display = 'none';
                }
            }
        });
        
        // Recalculer les barres lors du redimensionnement avec debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.recalculateAllBatteries();
            }, 50); // Délai réduit pour plus de réactivité
        });
        
        // Observer pour détecter les changements de taille des éléments
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver((entries) => {
                clearTimeout(this.observerTimeout);
                this.observerTimeout = setTimeout(() => {
                    this.recalculateAllBatteries();
                }, 100);
            });
        }
    }

    async checkAuth() {
        try {
            console.log('Vérification de l\'authentification...');
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            console.log('Session check result:', { session, error, environment: window.location.host });
            
            if (error) {
                console.error('Erreur lors de la vérification de session:', error);
                // Check if there's a shared map in URL
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('thought')) {
                    this.showAuthWithMessage();
                } else {
                    this.showAuth();
                }
                return;
            }
            
            if (session) {
                console.log('Session trouvée:', session.user);
                this.user = session.user;
                await this.loadSkillsFromDB();
                
                // Vérifier si l'utilisateur a déjà vu l'onboarding
                const hasSeenOnboarding = localStorage.getItem(`onboarding_${this.user.id}`);
                if (!hasSeenOnboarding && this.skills.length === 0) {
                    this.showOnboarding();
                } else {
                    this.showApp();
                }
            } else {
                console.log('Aucune session trouvée');
                // Check if there's a shared map in URL
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('thought')) {
                    this.showAuthWithMessage();
                } else {
                    this.showAuth();
                }
            }
        } catch (error) {
            console.error('Erreur dans checkAuth:', error);
            this.showAuth();
        }
    }

    showAuth() {
        this.authModal.style.display = 'flex';
        document.querySelector('.container').style.display = 'none';
    }

    showAuthWithMessage() {
        // Show auth modal with a message about viewing the shared thought
        this.authModal.style.display = 'flex';
        document.querySelector('.container').style.display = 'none';
        
        // Add a message above the form
        const existingMessage = document.querySelector('.auth-shared-message');
        if (!existingMessage) {
            const message = document.createElement('div');
            message.className = 'auth-shared-message';
            message.style.cssText = 'background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #4a9eff;';
            message.innerHTML = `
                <p style="color: #4a9eff; margin: 0 0 10px 0; font-weight: 600;">📖 Thought partagé</p>
                <p style="color: #888; margin: 0; font-size: 14px;">Connectez-vous ou créez un compte pour voir ce thought</p>
            `;
            this.authForm.parentElement.insertBefore(message, this.authForm);
        }
    }

    showApp() {
        console.log('Affichage de l\'app...');
        this.authModal.style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        this.userInfo.style.display = 'flex';
        this.renderSkills();
        console.log('App affichée avec succès');
    }

    toggleAuthMode(e) {
        e.preventDefault();
        const isLogin = this.authTitle.textContent === 'Se connecter';
        
        if (isLogin) {
            this.authTitle.textContent = "S'inscrire";
            this.authSubmit.textContent = "S'inscrire";
            this.authSwitchText.textContent = 'Déjà un compte ?';
            this.authSwitchLink.textContent = 'Se connecter';
        } else {
            this.authTitle.textContent = 'Se connecter';
            this.authSubmit.textContent = 'Se connecter';
            this.authSwitchText.textContent = 'Pas de compte ?';
            this.authSwitchLink.textContent = "S'inscrire";
        }
    }

    async handleAuth(e) {
        console.log('handleAuth called!', e);
        e.preventDefault();
        
        if (!this.email || !this.password) {
            console.error('ERREUR: Elements email/password manquants!');
            alert('Erreur: Éléments de formulaire manquants');
            return;
        }
        
        const email = this.email.value;
        const password = this.password.value;
        const isLogin = this.authTitle.textContent === 'Se connecter';

        console.log('Tentative de connexion:', { 
            email, 
            password: password ? '***' : 'empty', 
            isLogin,
            environment: window.location.host,
            supabaseUrl: supabaseUrl
        });
        
        if (!email || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            let result;
            if (isLogin) {
                console.log('Connexion avec Supabase...');
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            } else {
                console.log('Inscription avec Supabase...');
                result = await supabaseClient.auth.signUp({ email, password });
            }

            console.log('Résultat Supabase complet:', {
                data: result.data,
                error: result.error,
                session: result.data?.session,
                user: result.data?.user
            });

            if (result.error) {
                console.error('Erreur Supabase détaillée:', {
                    message: result.error.message,
                    status: result.error.status,
                    details: result.error
                });
                alert('Erreur de connexion: ' + result.error.message);
                return;
            }

            if (!isLogin && !result.data.session) {
                alert('Vérifiez votre email pour confirmer votre inscription');
                return;
            }

            console.log('Utilisateur connecté:', result.data.user);
            this.user = result.data.user;
            
            console.log('Chargement des skills...');
            await this.loadSkillsFromDB();
            
            // Vérifier si c'est un nouvel utilisateur
            const hasSeenOnboarding = localStorage.getItem(`onboarding_${this.user.id}`);
            console.log('Onboarding vu:', hasSeenOnboarding, 'Skills:', this.skills.length);
            
            if (!hasSeenOnboarding && this.skills.length === 0) {
                console.log('Affichage onboarding');
                this.showOnboarding();
            } else {
                console.log('Affichage app');
                this.showApp();
            }
        } catch (error) {
            console.error('Erreur dans handleAuth:', error);
            console.error('Stack trace:', error.stack);
            alert('Erreur technique: ' + error.message);
        }
    }

    async logout() {
        await supabaseClient.auth.signOut();
        this.user = null;
        this.skills = [];
        
        // Nettoyer les observers
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        this.showAuth();
        this.email.value = '';
        this.password.value = '';
    }

    showOnboarding() {
        this.onboardingModal.style.display = 'flex';
        this.authModal.style.display = 'none';
        document.querySelector('.container').style.display = 'none';
        this.currentOnboardingStep = 1;
    }

    nextOnboardingStep() {
        document.getElementById(`step${this.currentOnboardingStep}`).style.display = 'none';
        this.currentOnboardingStep++;
        
        if (this.currentOnboardingStep <= 4) {
            document.getElementById(`step${this.currentOnboardingStep}`).style.display = 'block';
        }
    }

    finishOnboarding() {
        // Marquer l'onboarding comme terminé
        localStorage.setItem(`onboarding_${this.user.id}`, 'completed');
        
        // Masquer l'onboarding et afficher l'app
        this.onboardingModal.style.display = 'none';
        this.showApp();
        
        // Focus sur l'input pour encourager l'ajout de la première compétence
        setTimeout(() => {
            this.skillInput.focus();
        }, 300);
    }

    handleSkillTypeChange() {
        const type = this.skillType.value;
        
        // Masquer tous les inputs additionnels
        this.projectInput.style.display = 'none';
        this.targetInput.style.display = 'none';
        
        // Afficher l'input approprié
        if (type === 'project') {
            this.projectInput.style.display = 'block';
        } else if (type === 'target') {
            this.targetInput.style.display = 'flex';
        }
    }

    addMilestoneInput() {
        const milestoneDiv = document.createElement('div');
        milestoneDiv.className = 'milestone-input';
        const uniqueId = `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        milestoneDiv.innerHTML = `
            <input type="text" id="${uniqueId}" class="milestone-name" placeholder="Nom du milestone" maxlength="100">
            <button type="button" class="remove-milestone" onclick="this.parentElement.remove()">×</button>
        `;
        this.milestonesContainer.appendChild(milestoneDiv);
    }

    async addSkill() {
        const skillName = this.skillInput.value.trim();
        const type = this.skillType.value;
        
        if (!skillName) {
            alert('Veuillez entrer un nom d\'objectif');
            return;
        }

        // Vérifier les doublons (même nom ET même type)
        const duplicateSkill = this.skills.find(skill => 
            skill.name.toLowerCase() === skillName.toLowerCase() && 
            skill.type === type &&
            skill.id !== this.editingSkillId // Exclure la tâche en cours d'édition
        );
        
        if (duplicateSkill) {
            const typeLabels = {
                continuous: 'habitude',
                task: 'tâche',
                project: 'projet',
                target: 'objectif'
            };
            alert(`Une ${typeLabels[type]} avec ce nom existe déjà`);
            return;
        }

        // Validation selon le type
        let milestones = null;
        let target = null;
        let targetUnit = null;

        if (type === 'project') {
            const milestoneInputs = this.milestonesContainer.querySelectorAll('.milestone-name');
            milestones = Array.from(milestoneInputs)
                .map(input => input.value.trim())
                .filter(value => value !== '');
            
            if (milestones.length === 0) {
                alert('Veuillez ajouter au moins un milestone pour votre projet');
                return;
            }
        } else if (type === 'target') {
            target = parseInt(this.target.value);
            targetUnit = this.targetUnit.value.trim();
            if (!target || target <= 0) {
                alert('Veuillez entrer un objectif valide');
                return;
            }
            if (!targetUnit) {
                alert('Veuillez entrer une unité (ex: vidéos, livres)');
                return;
            }
        }

        try {
            if (this.editingSkillId) {
                // Mode édition
                const { error } = await supabaseClient
                    .from('skills')
                    .update({
                        name: skillName,
                        type: type,
                        milestones: milestones ? JSON.stringify(milestones.map(m => ({ name: m, completed: false }))) : null,
                        target: target,
                        target_unit: targetUnit
                    })
                    .eq('id', this.editingSkillId);

                if (error) throw error;

                // Mettre à jour localement
                const skillIndex = this.skills.findIndex(s => s.id === this.editingSkillId);
                if (skillIndex !== -1) {
                    this.skills[skillIndex] = {
                        ...this.skills[skillIndex],
                        name: skillName,
                        type: type,
                        milestones: milestones ? JSON.stringify(milestones.map(m => ({ name: m, completed: false }))) : null,
                        target: target,
                        target_unit: targetUnit
                    };
                }
            } else {
                // Mode création
                const skillData = { 
                    name: skillName, 
                    hours: 0, 
                    user_id: this.user.id,
                    type: type,
                    milestones: milestones ? JSON.stringify(milestones.map(m => ({ name: m, completed: false }))) : null,
                    target: target,
                    target_unit: targetUnit
                };

                // Ajouter order_index seulement si la colonne existe
                try {
                    const maxOrder = Math.max(...this.skills.map(s => s.order_index || 0), -1);
                    skillData.order_index = maxOrder + 1;
                } catch (e) {
                    // Ignorer si order_index n'existe pas encore
                    console.log('order_index column not available yet');
                }
                
                const { data, error } = await supabaseClient
                    .from('skills')
                    .insert([skillData])
                    .select();

                if (error) throw error;

                this.skills.push(data[0]);
            }

            this.renderSkills();
            this.closeAddGoalModal();
        } catch (error) {
            alert('Erreur lors de l\'opération: ' + error.message);
        }
    }

    resetForm() {
        this.skillInput.value = '';
        this.target.value = '';
        this.targetUnit.value = '';
        this.skillType.value = 'continuous';
        
        // Reset milestones
        const initialMilestoneId = `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.milestonesContainer.innerHTML = `
            <div class="milestone-input">
                <input type="text" id="${initialMilestoneId}" class="milestone-name" placeholder="Nom du milestone" maxlength="100">
                <button type="button" class="remove-milestone" onclick="this.parentElement.remove()">×</button>
            </div>
        `;
        
        this.handleSkillTypeChange();
    }

    openAddGoalModal() {
        this.addGoalModal.style.display = 'flex';
        setTimeout(() => {
            this.skillInput.focus();
        }, 100);
    }

    closeAddGoalModal() {
        this.addGoalModal.style.display = 'none';
        this.resetForm();
        
        // Reset du mode édition
        this.editingSkillId = null;
        document.getElementById('addSkillBtn').textContent = 'Créer';
        document.querySelector('#addGoalModal .modal-header h2').textContent = 'Nouvel objectif';
    }

    async incrementSkill(skillId) {
        const skill = this.skills.find(s => s.id === skillId);
        if (skill) {
            try {
                const { error } = await supabaseClient
                    .from('skills')
                    .update({ hours: skill.hours + 1 })
                    .eq('id', skillId);

                if (error) throw error;

                skill.hours++;
                this.renderSkills();
            } catch (error) {
                alert('Erreur lors de la mise à jour: ' + error.message);
            }
        }
    }

    async decrementSkill(skillId) {
        const skill = this.skills.find(s => s.id === skillId);
        if (skill && skill.hours > 0) {
            try {
                const { error } = await supabaseClient
                    .from('skills')
                    .update({ hours: skill.hours - 1 })
                    .eq('id', skillId);

                if (error) throw error;

                skill.hours--;
                this.renderSkills();
            } catch (error) {
                alert('Erreur lors de la mise à jour: ' + error.message);
            }
        }
    }

    async deleteSkill(skillId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
            try {
                const { error } = await supabaseClient
                    .from('skills')
                    .delete()
                    .eq('id', skillId);

                if (error) throw error;

                this.skills = this.skills.filter(s => s.id !== skillId);
                this.renderSkills();
            } catch (error) {
                alert('Erreur lors de la suppression: ' + error.message);
            }
        }
    }

    async loadSkillsFromDB() {
        try {
            console.log('Chargement des skills pour user:', this.user.id);
            
            // Vérifier d'abord si la colonne whiteboard_data existe
            await this.checkWhiteboardColumn();
            
            const { data, error } = await supabaseClient
                .from('skills')
                .select('*')
                .eq('user_id', this.user.id)
                .eq('archived', false); // Ne charger que les skills non archivées

            if (error) {
                console.error('Erreur Supabase lors du chargement:', error);
                throw error;
            }

            console.log('Skills chargées:', data);
            
            // Debug whiteboard data loading
            if (data && data.length > 0) {
                const skillsWithWhiteboards = data.filter(skill => skill.whiteboard_data);
                console.log(`📋 Skills with whiteboard data: ${skillsWithWhiteboards.length}/${data.length}`);
                
                skillsWithWhiteboards.forEach(skill => {
                    console.log(`Skill "${skill.name}" has whiteboard data:`, {
                        elementsCount: skill.whiteboard_data?.elements?.length || 0,
                        hasAppState: !!skill.whiteboard_data?.appState,
                        filesCount: Object.keys(skill.whiteboard_data?.files || {}).length
                    });
                });
            }
            
            this.skills = data || [];
            this.renderSkills();
        } catch (error) {
            console.error('Erreur lors du chargement des skills:', error);
            this.skills = [];
            // Ne pas bloquer la connexion si les skills ne se chargent pas
        }
    }

    async checkWhiteboardColumn() {
        try {
            const { data, error } = await supabaseClient
                .from('information_schema.columns')
                .select('column_name')
                .eq('table_name', 'skills')
                .eq('column_name', 'whiteboard_data');

            if (error) {
                console.warn('Could not check whiteboard column:', error);
                return;
            }

            if (!data || data.length === 0) {
                console.error('CRITICAL: whiteboard_data column does not exist!');
                console.error('Please run the migration: ALTER TABLE skills ADD COLUMN whiteboard_data JSONB;');
                alert('Erreur: La colonne whiteboard_data n\'existe pas dans la base de données. Veuillez exécuter la migration SQL.');
            } else {
                console.log('✅ whiteboard_data column exists');
            }
        } catch (error) {
            console.warn('Could not verify whiteboard column:', error);
        }
    }

    getSkillColor(hours, type = 'continuous', target = null) {
        let maxHours = 50;
        
        // Ajuster maxHours selon le type
        if (type === 'target' && target) {
            maxHours = target;
        } else if (type === 'project') {
            maxHours = 100; // Projets plus longs
        } else if (type === 'task') {
            maxHours = 30; // Tâches plus courtes que les projets
        }
        
        const progress = Math.min(hours / maxHours, 1);
        
        // Green RGB: (34, 197, 94) to Blue RGB: (59, 130, 246)
        const startR = 34, startG = 197, startB = 94;
        const endR = 59, endG = 130, endB = 246;
        
        const r = Math.round(startR + (endR - startR) * progress);
        const g = Math.round(startG + (endG - startG) * progress);
        const b = Math.round(startB + (endB - startB) * progress);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    renderSkills() {
        if (this.skills.length === 0) {
            this.skillsContainer.innerHTML = `
                <div class="empty-state">
                    Aucun objectif ajouté. Ajoutez votre premier objectif ci-dessus !
                </div>
            `;
            return;
        }

        // Trier les skills par order_index si disponible, sinon par created_at
        const sortedSkills = [...this.skills].sort((a, b) => {
            if (a.order_index !== undefined && b.order_index !== undefined) {
                return a.order_index - b.order_index;
            }
            // Fallback sur created_at si order_index n'existe pas
            return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        });

        this.skillsContainer.innerHTML = sortedSkills
            .map(skill => this.renderSkillItem(skill))
            .join('');
            
        // Initialiser le drag and drop seulement si order_index est disponible
        if (this.skills.length > 0 && this.skills[0].order_index !== undefined) {
            this.initializeDragAndDrop();
        }
            
        // Forcer le recalcul des batteries après un délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
            this.recalculateAllBatteries();
        }, 150);
    }

    getSkillUnitLabel(skill) {
        if (skill.type === 'continuous') {
            return skill.hours === 1 ? 'point' : 'points';
        } else if (skill.type === 'task') {
            return skill.hours === 1 ? 'heure' : 'heures';
        } else if (skill.type === 'target' && skill.target_unit) {
            // Pour les objectifs quantifiés, utiliser l'unité personnalisée
            return skill.target_unit;
        } else {
            return skill.hours === 1 ? 'heure' : 'heures';
        }
    }

    renderSkillItem(skill) {
        const typeLabels = {
            continuous: 'Habitude',
            task: 'Tâche',
            project: 'Projet',
            target: 'Objectif'
        };

        let progressInfo = '';
        let milestonesInfo = '';
        
        if (skill.type === 'target') {
            const progress = Math.min((skill.hours / skill.target) * 100, 100);
            progressInfo = `
                <div class="skill-progress">${skill.hours}/${skill.target} ${skill.target_unit}</div>
                <div class="battery-indicator">
                    ${this.renderBatteryBars(skill.hours, skill.target, skill.id)}
                    <span class="battery-percentage">${Math.round(progress)}%</span>
                </div>
            `;
        } else if (skill.type === 'project' && skill.milestones) {
            const milestones = JSON.parse(skill.milestones);
            const completedCount = milestones.filter(m => m.completed).length;
            const totalCount = milestones.length;
            const progressPercent = Math.round((completedCount/totalCount)*100);
            
            milestonesInfo = `
                <div class="skill-progress">${completedCount}/${totalCount} milestones</div>
                <div class="battery-indicator">
                    ${this.renderBatteryBars(completedCount, totalCount, `project-${skill.id}`)}
                    <span class="battery-percentage">${progressPercent}%</span>
                </div>
                <div class="milestones-list">
                    ${milestones.map((milestone, index) => `
                        <div class="milestone-item">
                            <input type="checkbox" class="milestone-checkbox" 
                                   ${milestone.completed ? 'checked' : ''} 
                                   onchange="skillsTracker.toggleMilestone(${skill.id}, ${index})">
                            <span class="milestone-text ${milestone.completed ? 'completed' : ''}">${milestone.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const isCompleted = (skill.type === 'target' && skill.hours >= skill.target) ||
                           (skill.type === 'project' && skill.milestones && 
                            JSON.parse(skill.milestones).every(m => m.completed));

        return `
            <div class="skill-item ${isCompleted ? 'completed' : ''}" 
                 data-type="${skill.type}" 
                 data-skill-id="${skill.id}"
                 draggable="true">
                <div class="skill-info">
                    <div style="display: flex; align-items: center;">
                        <div class="drag-handle">⋮⋮</div>
                        <div>
                            <div class="skill-type-badge">${typeLabels[skill.type] || 'Habitude'}</div>
                            <div class="skill-name">${skill.name}</div>
                            <div class="skill-hours">${skill.hours} ${this.getSkillUnitLabel(skill)}</div>
                        </div>
                    </div>
                    ${progressInfo}
                    ${milestonesInfo}
                </div>
                <div class="skill-controls" draggable="false">
                    <button class="whiteboard-btn ${skill.whiteboard_data ? 'has-content' : ''}" 
                            draggable="false" 
                            onclick="skillsTracker.openWhiteboard(${skill.id})"
                            title="Tableau blanc">
                        📋
                    </button>
                    ${!isCompleted ? `
                        <div class="increment-controls">
                            <button class="decrement-btn" draggable="false" onclick="skillsTracker.decrementSkill(${skill.id})" ${skill.hours <= 0 ? 'disabled' : ''}>
                                −
                            </button>
                            <button class="increment-btn" draggable="false" onclick="skillsTracker.incrementSkill(${skill.id})">
                                +
                            </button>
                        </div>
                    ` : `
                        <button class="archive-btn" draggable="false" onclick="skillsTracker.archiveSkill(${skill.id})">
                            Archiver
                        </button>
                    `}
                    <div class="menu-container">
                        <button class="menu-btn" draggable="false" onclick="skillsTracker.toggleMenu(${skill.id})">
                            ⋯
                        </button>
                        <div class="menu-dropdown" id="menu-${skill.id}" style="display: none;">
                            <button class="menu-item" onclick="skillsTracker.editSkill(${skill.id})">
                                Modifier
                            </button>
                            <button class="menu-item delete" onclick="skillsTracker.deleteSkill(${skill.id})">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async toggleMilestone(skillId, milestoneIndex) {
        const skill = this.skills.find(s => s.id === skillId);
        if (skill && skill.milestones) {
            try {
                const milestones = JSON.parse(skill.milestones);
                milestones[milestoneIndex].completed = !milestones[milestoneIndex].completed;
                
                const { error } = await supabaseClient
                    .from('skills')
                    .update({ milestones: JSON.stringify(milestones) })
                    .eq('id', skillId);

                if (error) throw error;

                skill.milestones = JSON.stringify(milestones);
                this.renderSkills();
            } catch (error) {
                alert('Erreur lors de la mise à jour: ' + error.message);
            }
        }
    }

    toggleMenu(skillId) {
        // Fermer tous les autres menus
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            if (menu.id !== `menu-${skillId}`) {
                menu.style.display = 'none';
            }
        });

        // Toggle le menu actuel
        const menu = document.getElementById(`menu-${skillId}`);
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }

    editSkill(skillId) {
        const skill = this.skills.find(s => s.id === skillId);
        if (skill) {
            // Fermer le menu s'il existe (sécurité)
            const menu = document.getElementById(`menu-${skillId}`);
            if (menu) {
                menu.style.display = 'none';
            }
            
            // Pré-remplir le formulaire avec les données existantes
            this.skillInput.value = skill.name;
            this.skillType.value = skill.type;
            
            if (skill.type === 'target') {
                this.target.value = skill.target;
                this.targetUnit.value = skill.target_unit;
            } else if (skill.type === 'project' && skill.milestones) {
                const milestones = JSON.parse(skill.milestones);
                this.milestonesContainer.innerHTML = '';
                milestones.forEach(milestone => {
                    const milestoneDiv = document.createElement('div');
                    milestoneDiv.className = 'milestone-input';
                    const uniqueId = `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    milestoneDiv.innerHTML = `
                        <input type="text" id="${uniqueId}" class="milestone-name" value="${milestone.name}" maxlength="100">
                        <button type="button" class="remove-milestone" onclick="this.parentElement.remove()">×</button>
                    `;
                    this.milestonesContainer.appendChild(milestoneDiv);
                });
            }
            
            this.handleSkillTypeChange();
            
            // Changer le mode en édition
            this.editingSkillId = skillId;
            document.getElementById('addSkillBtn').textContent = 'Modifier';
            document.querySelector('#addGoalModal .modal-header h2').textContent = 'Modifier l\'objectif';
            
            this.openAddGoalModal();
        }
    }

    renderBatteryBars(filledBars, totalBars, skillId) {
        // Créer un ID unique pour cette batterie avec timestamp pour éviter les conflits
        const batteryId = `battery-${skillId || 'temp'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        let batteryHTML = `<div class="battery-bars" id="${batteryId}" data-filled="${filledBars}" data-total="${totalBars}">`;
        // Placeholder - sera rempli par calculateOptimalBars après le rendu
        batteryHTML += '</div>';
        
        // Programmer le calcul après que l'élément soit dans le DOM
        setTimeout(() => {
            this.calculateOptimalBars(batteryId, filledBars, totalBars);
            
            // Observer cet élément pour les changements de taille
            if (this.resizeObserver) {
                const element = document.getElementById(batteryId);
                if (element) {
                    this.resizeObserver.observe(element.closest('.skill-item'));
                }
            }
        }, 100);
        
        return batteryHTML;
    }

    async archiveSkill(skillId) {
        if (confirm('Êtes-vous sûr de vouloir archiver cette tâche terminée ?')) {
            try {
                const { error } = await supabaseClient
                    .from('skills')
                    .update({ archived: true })
                    .eq('id', skillId);

                if (error) throw error;

                // Retirer de la liste locale
                this.skills = this.skills.filter(s => s.id !== skillId);
                this.renderSkills();
                
                // Fermer le menu s'il existe (sécurité)
                const menu = document.getElementById(`menu-${skillId}`);
                if (menu) {
                    menu.style.display = 'none';
                }
            } catch (error) {
                alert('Erreur lors de l\'archivage: ' + error.message);
            }
        }
    }

    async openArchiveModal() {
        this.archiveModal.style.display = 'flex';
        await this.loadArchivedSkills();
        this.renderArchivedSkills();
        
        // Fermer le menu utilisateur
        this.userMenu.style.display = 'none';
    }

    closeArchiveModal() {
        this.archiveModal.style.display = 'none';
        this.archivedSkills = [];
    }

    async loadArchivedSkills() {
        try {
            const { data, error } = await supabaseClient
                .from('skills')
                .select('*')
                .eq('user_id', this.user.id)
                .eq('archived', true)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            this.archivedSkills = data || [];
        } catch (error) {
            console.error('Erreur lors du chargement des skills archivées:', error);
            this.archivedSkills = [];
        }
    }

    filterArchive() {
        this.renderArchivedSkills();
    }

    renderArchivedSkills() {
        if (!this.archivedSkills || this.archivedSkills.length === 0) {
            this.archivedSkillsContainer.innerHTML = `
                <div class="empty-archive">
                    Aucune tâche archivée pour le moment.
                </div>
            `;
            return;
        }

        const filterType = this.archiveFilter.value;
        const filteredSkills = filterType === 'all' 
            ? this.archivedSkills 
            : this.archivedSkills.filter(skill => skill.type === filterType);

        if (filteredSkills.length === 0) {
            this.archivedSkillsContainer.innerHTML = `
                <div class="empty-archive">
                    Aucune tâche archivée de ce type.
                </div>
            `;
            return;
        }

        this.archivedSkillsContainer.innerHTML = filteredSkills
            .map(skill => this.renderArchivedSkillItem(skill))
            .join('');
    }

    renderArchivedSkillItem(skill) {
        const typeLabels = {
            continuous: 'Habitude',
            task: 'Tâche',
            project: 'Projet',
            target: 'Objectif'
        };

        let completionInfo = '';
        if (skill.type === 'target') {
            completionInfo = `${skill.hours}/${skill.target} ${skill.target_unit}`;
        } else if (skill.type === 'project' && skill.milestones) {
            const milestones = JSON.parse(skill.milestones);
            const completedCount = milestones.filter(m => m.completed).length;
            completionInfo = `${completedCount}/${milestones.length} milestones`;
        } else {
            // For continuous habits and tasks
            completionInfo = `${skill.hours} ${this.getSkillUnitLabel(skill)}`;
        }

        return `
            <div class="archived-skill-item">
                <div class="archived-skill-info">
                    <div class="archived-skill-name">${skill.name}</div>
                    <div class="archived-skill-details">
                        ${typeLabels[skill.type]} • ${completionInfo}
                    </div>
                </div>
                <div class="archived-skill-actions">
                    <button class="restore-btn" onclick="skillsTracker.restoreSkill(${skill.id})">
                        Restaurer
                    </button>
                    <button class="delete-archived-btn" onclick="skillsTracker.deleteArchivedSkill(${skill.id})">
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    async restoreSkill(skillId) {
        if (confirm('Restaurer cette tâche dans vos objectifs actifs ?')) {
            try {
                const { error } = await supabaseClient
                    .from('skills')
                    .update({ archived: false })
                    .eq('id', skillId);

                if (error) throw error;

                // Recharger les données
                await this.loadArchivedSkills();
                await this.loadSkillsFromDB();
                
                this.renderArchivedSkills();
            } catch (error) {
                alert('Erreur lors de la restauration: ' + error.message);
            }
        }
    }

    async deleteArchivedSkill(skillId) {
        if (confirm('Supprimer définitivement cette tâche archivée ? Cette action est irréversible.')) {
            try {
                const { error } = await supabaseClient
                    .from('skills')
                    .delete()
                    .eq('id', skillId);

                if (error) throw error;

                // Recharger les données
                await this.loadArchivedSkills();
                this.renderArchivedSkills();
            } catch (error) {
                alert('Erreur lors de la suppression: ' + error.message);
            }
        }
    }

    initializeDragAndDrop() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        // Nettoyer les anciens event listeners
        this.skillsContainer.removeEventListener('dragover', this.boundDragOver);
        this.skillsContainer.removeEventListener('drop', this.boundDrop);
        
        // Créer les bound functions pour pouvoir les supprimer plus tard
        this.boundDragOver = (e) => this.handleDragOver(e);
        this.boundDrop = (e) => this.handleDrop(e);
        
        // Ajouter les event listeners au conteneur
        this.skillsContainer.addEventListener('dragover', this.boundDragOver);
        this.skillsContainer.addEventListener('drop', this.boundDrop);
        
        skillItems.forEach(item => {
            // Desktop drag and drop - seulement dragstart et dragend sur les items
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
            // Mobile touch events
            let longPressTimer;
            let isDragging = false;
            let startY = 0;
            
            item.addEventListener('touchstart', (e) => {
                // Ne pas déclencher sur les boutons
                if (e.target.closest('button')) return;
                
                startY = e.touches[0].clientY;
                longPressTimer = setTimeout(() => {
                    if (!isDragging) {
                        isDragging = true;
                        item.classList.add('long-press');
                        navigator.vibrate && navigator.vibrate(50); // Vibration si supportée
                        setTimeout(() => {
                            item.classList.remove('long-press');
                            item.classList.add('mobile-dragging');
                        }, 600);
                    }
                }, 500); // 500ms pour l'appui long
            });
            
            item.addEventListener('touchmove', (e) => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                
                if (isDragging) {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const currentY = touch.clientY;
                    
                    // Trouver l'élément sous le doigt
                    const elementBelow = document.elementFromPoint(touch.clientX, currentY);
                    const skillBelow = elementBelow?.closest('.skill-item');
                    
                    if (skillBelow && skillBelow !== item) {
                        this.handleMobileReorder(item, skillBelow, currentY);
                    }
                }
            });
            
            item.addEventListener('touchend', (e) => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                
                if (isDragging) {
                    isDragging = false;
                    item.classList.remove('mobile-dragging', 'long-press');
                    this.finalizeMobileReorder();
                }
            });
        });
    }

    handleDragStart(e) {
        // S'assurer qu'on drag bien un skill-item
        const skillItem = e.target.closest('.skill-item');
        if (!skillItem) return;
        
        this.draggedElement = skillItem;
        skillItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', skillItem.dataset.skillId);
        
        console.log('Drag started for skill:', skillItem.dataset.skillId);
    }

    handleDragEnd(e) {
        const skillItem = e.target.closest('.skill-item');
        if (skillItem) {
            skillItem.classList.remove('dragging');
        }
        this.draggedElement = null;
        
        // Nettoyer les indicateurs visuels
        document.querySelectorAll('.drag-over').forEach(item => item.classList.remove('drag-over'));
        
        console.log('Drag ended');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!this.draggedElement) return;
        
        // Trouver l'élément le plus proche
        const afterElement = this.getDragAfterElement(this.skillsContainer, e.clientY);
        
        // Réorganiser visuellement
        if (afterElement == null) {
            this.skillsContainer.appendChild(this.draggedElement);
        } else {
            this.skillsContainer.insertBefore(this.draggedElement, afterElement);
        }
    }

    handleDrop(e) {
        e.preventDefault();
        console.log('Drop event triggered');
        
        if (this.draggedElement) {
            this.updateSkillsOrder();
        }
    }

    handleMobileReorder(draggedItem, targetItem, currentY) {
        const targetRect = targetItem.getBoundingClientRect();
        const targetMiddle = targetRect.top + targetRect.height / 2;
        
        if (currentY < targetMiddle) {
            // Insérer avant
            targetItem.parentNode.insertBefore(draggedItem, targetItem);
        } else {
            // Insérer après
            targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
        }
    }

    finalizeMobileReorder() {
        this.updateSkillsOrder();
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.skill-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async updateSkillsOrder() {
        // Vérifier si order_index est disponible
        if (this.skills.length === 0 || this.skills[0].order_index === undefined) {
            console.log('order_index not available, skipping order update');
            return;
        }

        const skillItems = document.querySelectorAll('.skill-item');
        const updates = [];
        
        skillItems.forEach((item, index) => {
            const skillId = parseInt(item.dataset.skillId);
            const skill = this.skills.find(s => s.id === skillId);
            
            if (skill && skill.order_index !== index) {
                skill.order_index = index;
                updates.push({
                    id: skillId,
                    order_index: index
                });
            }
        });
        
        // Mettre à jour en base de données
        if (updates.length > 0) {
            try {
                for (const update of updates) {
                    await supabaseClient
                        .from('skills')
                        .update({ order_index: update.order_index })
                        .eq('id', update.id);
                }
                console.log('Ordre mis à jour:', updates);
            } catch (error) {
                console.error('Erreur lors de la mise à jour de l\'ordre:', error);
                // Recharger les skills en cas d'erreur
                await this.loadSkillsFromDB();
            }
        }
    }

    calculateOptimalBars(batteryId, filledBars, totalBars) {
        const batteryContainer = document.getElementById(batteryId);
        if (!batteryContainer) return;
        
        // S'assurer que le parent a une largeur définie
        const parentElement = batteryContainer.closest('.battery-indicator');
        if (!parentElement) return;
        
        // Calculer la largeur disponible en tenant compte du pourcentage et du gap
        const parentWidth = parentElement.offsetWidth;
        const percentageElement = parentElement.querySelector('.battery-percentage');
        const percentageWidth = percentageElement ? percentageElement.offsetWidth + 8 : 40; // 8px pour le gap
        
        // Ajouter une marge de sécurité sur mobile
        const screenWidth = window.innerWidth;
        const safetyMargin = screenWidth <= 768 ? 10 : 5; // Plus de marge sur mobile
        const containerWidth = Math.max(20, parentWidth - percentageWidth - safetyMargin);
        
        if (containerWidth <= 0) {
            // Réessayer après un court délai si la largeur n'est pas encore calculée
            setTimeout(() => this.calculateOptimalBars(batteryId, filledBars, totalBars), 100);
            return;
        }
        
        // Déterminer le nombre optimal de barres selon la largeur
        const minBarWidth = 2; // largeur minimale d'une barre
        const gap = 1; // espace entre les barres
        let displayBars, displayFilled, groupSize = 1;
        
        // Calculer combien de barres peuvent tenir avec une largeur minimale
        const maxPossibleBars = Math.max(1, Math.floor(containerWidth / (minBarWidth + gap)));
        
        // Limiter le nombre de barres selon la taille d'écran
        let maxBarsLimit;
        if (screenWidth <= 480) {
            maxBarsLimit = Math.min(maxPossibleBars, 20); // Max 20 barres sur très petit écran
        } else if (screenWidth <= 768) {
            maxBarsLimit = Math.min(maxPossibleBars, 30); // Max 30 barres sur mobile
        } else {
            maxBarsLimit = maxPossibleBars; // Pas de limite sur desktop
        }
        
        if (totalBars <= maxBarsLimit) {
            // Afficher toutes les barres si elles peuvent tenir
            displayBars = totalBars;
            displayFilled = filledBars;
        } else {
            // Grouper les unités pour s'adapter à la largeur
            displayBars = maxBarsLimit;
            groupSize = Math.ceil(totalBars / maxBarsLimit);
            displayFilled = Math.ceil(filledBars / groupSize);
        }
        
        // Calculer la largeur exacte de chaque barre pour utiliser tout l'espace
        const totalGapWidth = Math.max(0, (displayBars - 1) * gap);
        const availableBarWidth = containerWidth - totalGapWidth;
        const barWidth = Math.max(minBarWidth, Math.floor(availableBarWidth / displayBars));
        
        // Définir les variables CSS pour la largeur dynamique
        batteryContainer.style.setProperty('--bar-width', `${barWidth}px`);
        batteryContainer.style.setProperty('--bar-gap', `${gap}px`);
        batteryContainer.style.setProperty('--container-width', `${containerWidth}px`);
        
        // Générer les barres sans largeur inline
        let barsHTML = '';
        for (let i = 1; i <= displayBars; i++) {
            const isActive = i <= displayFilled;
            barsHTML += `<div class="battery-bar ${isActive ? 'active' : ''}" 
                              title="${this.getBatteryTooltip(i, groupSize, totalBars, filledBars)}"></div>`;
        }
        
        batteryContainer.innerHTML = barsHTML;
        
        // Ajouter une classe CSS selon la densité pour ajuster la hauteur
        if (barWidth < 4) {
            batteryContainer.classList.add('very-dense');
        } else if (barWidth < 6) {
            batteryContainer.classList.add('dense');
        }
    }

    getBatteryTooltip(barIndex, groupSize, totalBars, filledBars) {
        if (groupSize === 1) {
            return `${barIndex}/${totalBars}`;
        } else {
            const rangeStart = (barIndex - 1) * groupSize + 1;
            const rangeEnd = Math.min(barIndex * groupSize, totalBars);
            return `${rangeStart}-${rangeEnd}/${totalBars} (${filledBars} complétés)`;
        }
    }

    recalculateAllBatteries() {
        // Attendre que le layout soit stabilisé
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { // Double RAF pour s'assurer que le layout est fini
                document.querySelectorAll('.battery-bars[data-filled]').forEach(battery => {
                    const filledBars = parseInt(battery.dataset.filled);
                    const totalBars = parseInt(battery.dataset.total);
                    // Reset des classes pour recalcul propre
                    battery.classList.remove('dense', 'very-dense');
                    // Reset des variables CSS
                    battery.style.removeProperty('--bar-width');
                    battery.style.removeProperty('--bar-gap');
                    battery.style.removeProperty('--container-width');
                    this.calculateOptimalBars(battery.id, filledBars, totalBars);
                });
            });
        });
    }

    toggleUserMenu() {
        const isVisible = this.userMenu.style.display === 'block';
        this.userMenu.style.display = isVisible ? 'none' : 'block';
    }

    async openWhiteboard(skillId) {
        const skill = this.skills.find(s => s.id === skillId);
        if (!skill) return;

        console.log('Opening whiteboard for skill:', skill.name);
        console.log('Saved whiteboard data:', skill.whiteboard_data);

        this.currentWhiteboardSkillId = skillId;
        this.whiteboardTitle.textContent = `Tableau blanc - ${skill.name}`;
        this.whiteboardModal.style.display = 'flex';



        // Attendre que le modal soit visible
        await new Promise(resolve => setTimeout(resolve, 100));

        // Vérifier si Excalidraw est disponible, sinon essayer de le recharger
        if (!window.ExcalidrawLib && !window.Excalidraw) {
            await this.attemptExcalidrawReload();
        }

        // Initialiser Excalidraw
        this.initializeExcalidraw(skill.whiteboard_data);
    }

    async attemptExcalidrawReload() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@excalidraw/excalidraw@0.15.0/dist/excalidraw.production.min.js';
            script.onload = () => {
                console.log('✅ Excalidraw reloaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to reload Excalidraw');
                alert('Impossible de charger Excalidraw. Veuillez recharger la page.');
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    initializeExcalidraw(savedData) {
        // Nettoyer le conteneur
        this.excalidrawContainer.innerHTML = '';

        const excalidrawElement = document.createElement('div');
        excalidrawElement.style.height = '100%';
        excalidrawElement.style.width = '100%';
        this.excalidrawContainer.appendChild(excalidrawElement);

        // Vérifications des dépendances
        if (!window.React) {
            alert('Erreur: React n\'est pas chargé. Rechargez la page.');
            return;
        }

        if (!window.ReactDOM) {
            alert('Erreur: ReactDOM n\'est pas chargé. Rechargez la page.');
            return;
        }

        // Try different ways to access Excalidraw
        let Excalidraw = null;
        
        if (window.ExcalidrawLib && window.ExcalidrawLib.Excalidraw) {
            console.log('✅ Found Excalidraw in ExcalidrawLib');
            Excalidraw = window.ExcalidrawLib.Excalidraw;
            console.log('ExcalidrawLib contents:', Object.keys(window.ExcalidrawLib));
        } else if (window.Excalidraw) {
            console.log('✅ Found Excalidraw as global');
            Excalidraw = window.Excalidraw;
        } else if (window.ExcalidrawLib) {
            console.log('ExcalidrawLib available but no Excalidraw component');
            console.log('ExcalidrawLib contents:', Object.keys(window.ExcalidrawLib));
            
            // Try to find Excalidraw in any property
            for (const key of Object.keys(window.ExcalidrawLib)) {
                if (typeof window.ExcalidrawLib[key] === 'function' || 
                    (typeof window.ExcalidrawLib[key] === 'object' && window.ExcalidrawLib[key].$$typeof)) {
                    console.log('Trying Excalidraw from key:', key);
                    Excalidraw = window.ExcalidrawLib[key];
                    break;
                }
            }
        }
        
        if (!Excalidraw) {
            alert('Erreur: Le composant Excalidraw n\'est pas disponible. Rechargez la page.');
            return;
        }
        
        const initialData = savedData ? {
            elements: savedData.elements || [],
            appState: savedData.appState || {},
            files: savedData.files || {}
        } : {
            elements: [],
            appState: {},
            files: {}
        };



        try {
            
            // Try different API callback approaches for different Excalidraw versions
            const excalidrawProps = {
                initialData: initialData,
                onChange: (elements, appState, files) => {
                    console.log('📝 Excalidraw onChange - Elements:', elements?.length || 0);
                }
            };

            // Multiple API detection methods for compatibility
            excalidrawProps.excalidrawAPI = (api) => {
                this.handleExcalidrawAPI(api);
            };

            excalidrawProps.ref = (api) => {
                this.handleExcalidrawAPI(api);
            };

            excalidrawProps.onPointerUpdate = (payload) => {
                if (payload && payload.excalidrawAPI && !this.excalidrawAPI) {
                    this.handleExcalidrawAPI(payload.excalidrawAPI);
                }
            };

            const excalidrawComponent = React.createElement(Excalidraw, excalidrawProps);

            ReactDOM.render(excalidrawComponent, excalidrawElement);
            
            // Fallback: Try to find API after render
            setTimeout(() => {
                this.tryFindExcalidrawAPI();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error rendering Excalidraw:', error);
            alert('Erreur lors de l\'initialisation d\'Excalidraw: ' + error.message);
        }
    }

    async saveWhiteboard() {
        console.log('saveWhiteboard function called!');
        console.log('excalidrawAPI:', this.excalidrawAPI);
        console.log('currentWhiteboardSkillId:', this.currentWhiteboardSkillId);
        
        if (!this.excalidrawAPI) {
            console.error('ExcalidrawAPI is not available');
            alert('Erreur: L\'API Excalidraw n\'est pas disponible. Essayez de fermer et rouvrir le tableau blanc.');
            return;
        }

        if (!this.currentWhiteboardSkillId) {
            console.error('No current whiteboard skill ID');
            alert('Erreur: Aucun tableau blanc sélectionné.');
            return;
        }

        const saveBtn = document.querySelector('.save-whiteboard-btn');
        if (!saveBtn) {
            console.error('Save button not found');
            return;
        }

        saveBtn.classList.add('saving');
        saveBtn.textContent = '💾 Sauvegarde...';

        try {
            // Vérifier que les méthodes API existent
            if (typeof this.excalidrawAPI.getSceneElements !== 'function') {
                throw new Error('getSceneElements method not available on API');
            }
            if (typeof this.excalidrawAPI.getAppState !== 'function') {
                throw new Error('getAppState method not available on API');
            }
            if (typeof this.excalidrawAPI.getFiles !== 'function') {
                throw new Error('getFiles method not available on API');
            }

            const elements = this.excalidrawAPI.getSceneElements();
            const appState = this.excalidrawAPI.getAppState();
            const files = this.excalidrawAPI.getFiles();

            console.log('Saving whiteboard data...');
            console.log('Elements count:', elements ? elements.length : 0);
            console.log('AppState keys:', appState ? Object.keys(appState) : 'null');
            console.log('Files count:', files ? Object.keys(files).length : 0);

            // Validation des données
            if (!elements) {
                console.warn('No elements to save');
            }
            if (!appState) {
                console.warn('No app state to save');
            }

            const whiteboardData = {
                elements: elements || [],
                appState: appState ? {
                    viewBackgroundColor: appState.viewBackgroundColor,
                    currentItemStrokeColor: appState.currentItemStrokeColor,
                    currentItemBackgroundColor: appState.currentItemBackgroundColor,
                    currentItemFillStyle: appState.currentItemFillStyle,
                    currentItemStrokeWidth: appState.currentItemStrokeWidth,
                    currentItemRoughness: appState.currentItemRoughness,
                    currentItemOpacity: appState.currentItemOpacity,
                    gridSize: appState.gridSize,
                    colorPalette: appState.colorPalette
                } : {},
                files: files || {}
            };

            console.log('Whiteboard data to save:', whiteboardData);

            // Vérifier la connexion Supabase
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }

            const { data, error } = await supabaseClient
                .from('skills')
                .update({ whiteboard_data: whiteboardData })
                .eq('id', this.currentWhiteboardSkillId)
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Successfully saved to database:', data);

            // Mettre à jour localement
            const skill = this.skills.find(s => s.id === this.currentWhiteboardSkillId);
            if (skill) {
                skill.whiteboard_data = whiteboardData;
                console.log('Updated local skill data:', skill);
            } else {
                console.warn('Skill not found in local array for ID:', this.currentWhiteboardSkillId);
            }

            saveBtn.textContent = '✓ Sauvegardé';
            setTimeout(() => {
                saveBtn.classList.remove('saving');
                saveBtn.textContent = '💾 Sauvegarder';
            }, 2000);

            // Rafraîchir l'affichage pour mettre à jour l'indicateur
            this.renderSkills();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            console.error('Error stack:', error.stack);
            
            let errorMessage = '❌ ERREUR DE SAUVEGARDE\n\n';
            errorMessage += `Détails: ${error.message}\n\n`;
            
            if (error.message.includes('getSceneElements')) {
                errorMessage += 'Problème: L\'API Excalidraw ne fonctionne pas.\n';
                errorMessage += 'Solution: Fermez et rouvrez le tableau blanc.';
            } else if (error.message.includes('Supabase')) {
                errorMessage += 'Problème: Erreur de base de données.\n';
                errorMessage += 'Solution: Vérifiez votre connexion internet.';
            } else {
                errorMessage += 'Problème inconnu. Consultez la console du navigateur.';
            }
            
            alert(errorMessage);
            saveBtn.classList.remove('saving');
            saveBtn.textContent = '💾 Sauvegarder';
        }
    }



    handleExcalidrawAPI(api) {
        if (api) {
            this.excalidrawAPI = api;
            console.log('✅ ExcalidrawAPI initialized successfully');
        }
    }

    tryFindExcalidrawAPI() {
        // Try to find the API in the global scope
        if (window.excalidrawAPI) {
            this.handleExcalidrawAPI(window.excalidrawAPI);
        }
    }



    closeWhiteboard() {
        this.whiteboardModal.style.display = 'none';
        this.currentWhiteboardSkillId = null;
        this.excalidrawAPI = null;
        
        // Nettoyer le conteneur React
        if (this.excalidrawContainer.firstChild) {
            ReactDOM.unmountComponentAtNode(this.excalidrawContainer.firstChild);
        }
        this.excalidrawContainer.innerHTML = '';
    }





    async testDatabaseSave() {
        if (!this.currentWhiteboardSkillId) {
            alert('❌ No whiteboard open!');
            return;
        }

        const testData = {
            elements: [
                {
                    id: 'test-element-1',
                    type: 'rectangle',
                    x: 100,
                    y: 100,
                    width: 200,
                    height: 100,
                    strokeColor: '#000000',
                    backgroundColor: '#ffffff'
                }
            ],
            appState: {
                viewBackgroundColor: '#ffffff',
                currentItemStrokeColor: '#000000'
            },
            files: {},
            testTimestamp: new Date().toISOString()
        };

        try {
            alert('🧪 Testing database save with dummy data...');
            
            const { data, error } = await supabaseClient
                .from('skills')
                .update({ whiteboard_data: testData })
                .eq('id', this.currentWhiteboardSkillId)
                .select();

            if (error) {
                alert(`❌ DATABASE SAVE FAILED!\n\nError: ${error.message}\n\nThis means there's a database permission or connection issue.`);
                console.error('Database save error:', error);
            } else {
                alert(`✅ DATABASE SAVE SUCCESSFUL!\n\nTest data was saved successfully.\nThis means the database is working.\n\nThe issue is likely with the Excalidraw API not providing data to save.`);
                console.log('Database save successful:', data);
                
                // Update local data
                const skill = this.skills.find(s => s.id === this.currentWhiteboardSkillId);
                if (skill) {
                    skill.whiteboard_data = testData;
                }
                this.renderSkills();
            }
        } catch (error) {
            alert(`❌ DATABASE TEST FAILED!\n\nError: ${error.message}\n\nCheck your internet connection and Supabase setup.`);
            console.error('Database test error:', error);
        }
    }

    // ===== SHARED MAPS FUNCTIONS =====

    async openSharedMapsModal() {
        this.sharedMapsModal.style.display = 'flex';
        this.switchMapsTab('browse');
        await this.loadSharedMaps();
    }

    closeSharedMapsModal() {
        this.sharedMapsModal.style.display = 'none';
    }

    switchMapsTab(tab) {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        
        if (tab === 'browse') {
            tabs[0].classList.add('active');
            document.getElementById('browseMapsTab').style.display = 'block';
            document.getElementById('myMapsTab').style.display = 'none';
            this.loadSharedMaps();
        } else {
            tabs[1].classList.add('active');
            document.getElementById('browseMapsTab').style.display = 'none';
            document.getElementById('myMapsTab').style.display = 'block';
            this.loadMyMaps();
        }
    }

    async loadSharedMaps() {
        try {
            const { data, error } = await supabaseClient
                .from('shared_maps')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.sharedMaps = data || [];
            this.renderSharedMaps();
        } catch (error) {
            console.error('Error loading shared maps:', error);
            alert('Erreur lors du chargement des thoughts partagés');
        }
    }

    async loadMyMaps() {
        try {
            const { data, error } = await supabaseClient
                .from('shared_maps')
                .select('*')
                .eq('owner_id', this.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.renderMyMaps(data || []);
        } catch (error) {
            console.error('Error loading my maps:', error);
            alert('Erreur lors du chargement de vos thoughts');
        }
    }

    renderSharedMaps() {
        const grid = document.getElementById('sharedMapsGrid');
        
        if (this.sharedMaps.length === 0) {
            grid.innerHTML = `
                <div class="empty-maps-message">
                    <h3>Aucun thought partagé pour le moment</h3>
                    <p>Soyez le premier à créer un Independent Thought !</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.sharedMaps.map(map => `
            <div class="map-card" onclick="skillsTracker.viewSharedMap(${map.id})">
                <div class="map-card-header">
                    <h3 class="map-card-title">${this.escapeHtml(map.title)}</h3>
                    <button class="map-action-btn" onclick="event.stopPropagation(); skillsTracker.shareMapLink(${map.id})" title="Partager le lien">🔗</button>
                </div>
                ${map.description ? `<p class="map-card-description">${this.escapeHtml(map.description)}</p>` : ''}
                <div class="map-card-footer">
                    <span class="map-owner">Independent Thought</span>
                    <div class="map-stats">
                        <span class="map-stat">👁️ ${map.view_count || 0}</span>
                        <span class="map-stat">📅 ${new Date(map.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderMyMaps(maps) {
        const grid = document.getElementById('myMapsGrid');
        
        if (maps.length === 0) {
            grid.innerHTML = `
                <div class="empty-maps-message">
                    <h3>Vous n'avez pas encore de thoughts</h3>
                    <p>Créez votre premier Independent Thought !</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = maps.map(map => `
            <div class="map-card">
                <div class="map-card-header">
                    <h3 class="map-card-title">${this.escapeHtml(map.title)}</h3>
                    <div class="map-card-actions">
                        <button class="map-action-btn" onclick="event.stopPropagation(); skillsTracker.shareMapLink(${map.id})" title="Partager le lien">🔗</button>
                        <button class="map-action-btn" onclick="event.stopPropagation(); skillsTracker.editMap(${map.id})" title="Modifier">✏️</button>
                        <button class="map-action-btn" onclick="event.stopPropagation(); skillsTracker.deleteMap(${map.id})" title="Supprimer">🗑️</button>
                    </div>
                </div>
                ${map.description ? `<p class="map-card-description">${this.escapeHtml(map.description)}</p>` : ''}
                <div class="map-card-footer">
                    <span class="map-owner">${map.is_public ? '🌍 Public' : '🔒 Privé'}</span>
                    <div class="map-stats">
                        <span class="map-stat">👁️ ${map.view_count || 0}</span>
                        <span class="map-stat">📅 ${new Date(map.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openCreateMapModal() {
        this.currentMapId = null;
        document.getElementById('createMapTitle').textContent = 'Créer un Independent Thought';
        document.getElementById('mapTitle').value = '';
        document.getElementById('mapDescription').value = '';
        document.getElementById('mapIsPublic').checked = true;
        this.createMapModal.style.display = 'flex';
    }

    closeCreateMapModal() {
        this.createMapModal.style.display = 'none';
    }

    async saveMapMetadata() {
        const title = document.getElementById('mapTitle').value.trim();
        const description = document.getElementById('mapDescription').value.trim();
        const isPublic = document.getElementById('mapIsPublic').checked;

        if (!title) {
            alert('Veuillez entrer un titre pour le thought');
            return;
        }

        // Store metadata temporarily
        this.tempMapMetadata = { title, description, isPublic };
        
        // Close metadata modal and open Excalidraw editor
        this.closeCreateMapModal();
        this.openMapEditor();
    }

    openMapEditor() {
        this.currentMapMode = 'edit';
        this.viewSharedMapModal.style.display = 'flex';
        document.getElementById('viewMapTitle').textContent = this.tempMapMetadata.title;
        document.getElementById('viewMapOwner').textContent = 'Nouvelle map';
        document.getElementById('viewMapReadOnly').style.display = 'none';

        // Clean existing buttons first
        const header = document.querySelector('#viewSharedMapModal .whiteboard-header .whiteboard-actions');
        const closeBtn = header.querySelector('.close-btn');
        header.innerHTML = '';
        if (closeBtn) {
            header.appendChild(closeBtn);
        }
        
        // Add save button for new map
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-whiteboard-btn';
        saveBtn.textContent = '💾 Sauvegarder le thought';
        saveBtn.onclick = () => this.saveSharedMap();
        header.insertBefore(saveBtn, closeBtn);

        // Initialize Excalidraw for editing
        this.initializeMapExcalidraw(null, false);
    }

    async viewSharedMap(mapId) {
        try {
            // Increment view count
            await supabaseClient.rpc('increment_map_view_count', { map_id: mapId });

            // Load map data
            const { data, error } = await supabaseClient
                .from('shared_maps')
                .select('*')
                .eq('id', mapId)
                .single();

            if (error) throw error;

            this.currentMapId = mapId;
            this.currentMapMode = 'view';
            
            const isOwner = data.owner_id === this.user.id;
            
            document.getElementById('viewMapTitle').textContent = data.title;
            document.getElementById('viewMapOwner').textContent = isOwner ? 'Votre thought' : 'Independent Thought';
            document.getElementById('viewMapReadOnly').style.display = isOwner ? 'none' : 'inline-block';
            
            this.viewSharedMapModal.style.display = 'flex';
            
            // Clean existing buttons first
            const header = document.querySelector('#viewSharedMapModal .whiteboard-header .whiteboard-actions');
            const closeBtn = header.querySelector('.close-btn');
            header.innerHTML = '';
            if (closeBtn) {
                header.appendChild(closeBtn);
            }
            
            // Add share button if public
            if (data.is_public) {
                const shareBtn = document.createElement('button');
                shareBtn.className = 'save-whiteboard-btn share-thought-btn';
                shareBtn.textContent = '🔗 Partager';
                shareBtn.onclick = () => this.shareMapLink(mapId);
                header.insertBefore(shareBtn, closeBtn);
            }
            
            // Initialize Excalidraw with map data
            this.initializeMapExcalidraw(data.excalidraw_data, !isOwner);
            
        } catch (error) {
            console.error('Error viewing map:', error);
            alert('Erreur lors du chargement du thought');
        }
    }

    closeViewSharedMap() {
        this.viewSharedMapModal.style.display = 'none';
        if (this.viewExcalidrawAPI) {
            this.viewExcalidrawAPI = null;
        }
        // Clear the container
        document.getElementById('viewExcalidrawContainer').innerHTML = '';
        
        // Remove all dynamic buttons
        const header = document.querySelector('#viewSharedMapModal .whiteboard-header .whiteboard-actions');
        if (header) {
            // Keep only the close button
            const closeBtn = header.querySelector('.close-btn');
            header.innerHTML = '';
            if (closeBtn) {
                header.appendChild(closeBtn);
            }
        }
    }

    initializeMapExcalidraw(initialData, readOnly) {
        const container = document.getElementById('viewExcalidrawContainer');
        container.innerHTML = '';

        // Check if Excalidraw is available
        const ExcalidrawComponent = window.ExcalidrawLib?.Excalidraw || window.Excalidraw;
        
        if (!ExcalidrawComponent) {
            container.innerHTML = '<div style="color: white; padding: 20px;">Erreur: Excalidraw non chargé. Rechargez la page.</div>';
            return;
        }

        const excalidrawElement = React.createElement(ExcalidrawComponent, {
            initialData: initialData || { elements: [], appState: {} },
            viewModeEnabled: readOnly,
            zenModeEnabled: false,
            gridModeEnabled: false,
            theme: 'light',
            onChange: (elements, appState, files) => {
                if (!readOnly) {
                    // Store the data whenever it changes
                    this.tempMapData = { 
                        elements: elements,
                        appState: appState,
                        files: files 
                    };
                }
            },
            ref: (api) => {
                this.viewExcalidrawAPI = api;
            }
        });

        ReactDOM.render(excalidrawElement, container);
    }

    async saveSharedMap() {
        try {
            // Get current data from Excalidraw API if tempMapData is not set
            let dataToSave = this.tempMapData;
            
            if (!dataToSave && this.viewExcalidrawAPI) {
                const elements = this.viewExcalidrawAPI.getSceneElements();
                const appState = this.viewExcalidrawAPI.getAppState();
                const files = this.viewExcalidrawAPI.getFiles();
                dataToSave = { elements, appState, files };
            }
            
            if (!dataToSave || !dataToSave.elements || dataToSave.elements.length === 0) {
                alert('Créez du contenu avant de sauvegarder');
                return;
            }

            const mapData = {
                title: this.tempMapMetadata.title,
                description: this.tempMapMetadata.description,
                is_public: this.tempMapMetadata.isPublic,
                excalidraw_data: dataToSave,
                owner_id: this.user.id
            };

            const { data, error } = await supabaseClient
                .from('shared_maps')
                .insert([mapData])
                .select()
                .single();

            if (error) throw error;

            alert('✅ Thought sauvegardé avec succès !');
            this.closeViewSharedMap();
            this.switchMapsTab('my-maps');
            
        } catch (error) {
            console.error('Error saving map:', error);
            alert('Erreur lors de la sauvegarde du thought');
        }
    }

    async editMap(mapId) {
        try {
            const { data, error } = await supabaseClient
                .from('shared_maps')
                .select('*')
                .eq('id', mapId)
                .single();

            if (error) throw error;

            this.currentMapId = mapId;
            this.currentMapMode = 'edit';
            this.tempMapMetadata = {
                title: data.title,
                description: data.description,
                isPublic: data.is_public
            };

            document.getElementById('viewMapTitle').textContent = data.title;
            document.getElementById('viewMapOwner').textContent = 'Mode édition';
            document.getElementById('viewMapReadOnly').style.display = 'none';
            
            this.viewSharedMapModal.style.display = 'flex';
            
            // Clean existing buttons first
            const header = document.querySelector('#viewSharedMapModal .whiteboard-header .whiteboard-actions');
            const closeBtn = header.querySelector('.close-btn');
            header.innerHTML = '';
            if (closeBtn) {
                header.appendChild(closeBtn);
            }
            
            // Add update button
            const saveBtn = document.createElement('button');
            saveBtn.className = 'save-whiteboard-btn';
            saveBtn.textContent = '💾 Mettre à jour';
            saveBtn.onclick = () => this.updateSharedMap();
            header.insertBefore(saveBtn, closeBtn);
            
            this.initializeMapExcalidraw(data.excalidraw_data, false);

        } catch (error) {
            console.error('Error loading map for edit:', error);
            alert('Erreur lors du chargement du thought');
        }
    }

    async updateSharedMap() {
        try {
            // Get current data from Excalidraw API if tempMapData is not set
            let dataToSave = this.tempMapData;
            
            if (!dataToSave && this.viewExcalidrawAPI) {
                const elements = this.viewExcalidrawAPI.getSceneElements();
                const appState = this.viewExcalidrawAPI.getAppState();
                const files = this.viewExcalidrawAPI.getFiles();
                dataToSave = { elements, appState, files };
            }
            
            if (!dataToSave) {
                alert('Aucune modification à sauvegarder');
                return;
            }

            const { error } = await supabaseClient
                .from('shared_maps')
                .update({
                    excalidraw_data: dataToSave,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentMapId);

            if (error) throw error;

            alert('✅ Thought mis à jour avec succès !');
            this.closeViewSharedMap();
            this.loadMyMaps();
            
        } catch (error) {
            console.error('Error updating map:', error);
            alert('Erreur lors de la mise à jour du thought');
        }
    }

    async deleteMap(mapId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce thought ?')) {
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('shared_maps')
                .delete()
                .eq('id', mapId);

            if (error) throw error;

            alert('✅ Thought supprimé');
            this.loadMyMaps();
            
        } catch (error) {
            console.error('Error deleting map:', error);
            alert('Erreur lors de la suppression du thought');
        }
    }

    shareMapLink(mapId) {
        // Always use the current domain (works for localhost and production)
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}?thought=${mapId}`;
        
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('🔗 Lien copié dans le presse-papier !\n\n' + shareUrl);
            }).catch(() => {
                this.showShareModal(shareUrl);
            });
        } else {
            this.showShareModal(shareUrl);
        }
    }

    showShareModal(url) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Partager ce thought</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div style="padding: 20px;">
                    <p style="color: #888; margin-bottom: 15px;">Copiez ce lien pour partager :</p>
                    <input type="text" value="${url}" readonly 
                           style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #2a2a2a; 
                                  border-radius: 8px; color: #fff; font-size: 14px;"
                           onclick="this.select()">
                    <button onclick="this.previousElementSibling.select(); document.execCommand('copy'); alert('Copié !');" 
                            style="width: 100%; margin-top: 15px; padding: 12px; background: #4a9eff; 
                                   color: white; border: none; border-radius: 8px; cursor: pointer;">
                        📋 Copier le lien
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    checkUrlForSharedMap() {
        const urlParams = new URLSearchParams(window.location.search);
        const thoughtId = urlParams.get('thought');
        
        if (thoughtId) {
            // Try to view immediately (works for public thoughts)
            // If user is not authenticated, will show auth modal but still attempt to load
            setTimeout(() => {
                this.viewSharedMapFromUrl(parseInt(thoughtId));
            }, 500);
        }
    }

    async viewSharedMapFromUrl(mapId) {
        try {
            // Load map data (no auth required for public maps)
            const { data, error } = await supabaseClient
                .from('shared_maps')
                .select('*')
                .eq('id', mapId)
                .single();

            if (error) throw error;

            // Check if map is public or user is owner
            if (!data.is_public && (!this.user || data.owner_id !== this.user.id)) {
                alert('Ce thought est privé. Connectez-vous pour y accéder.');
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            // Increment view count (only if public or user is authenticated)
            if (data.is_public || this.user) {
                await supabaseClient.rpc('increment_map_view_count', { map_id: mapId });
            }

            this.currentMapId = mapId;
            this.currentMapMode = 'view';
            
            const isOwner = this.user && data.owner_id === this.user.id;
            
            // Hide auth modal if showing
            this.authModal.style.display = 'none';
            
            document.getElementById('viewMapTitle').textContent = data.title;
            document.getElementById('viewMapOwner').textContent = isOwner ? 'Votre thought' : 'Independent Thought';
            document.getElementById('viewMapReadOnly').style.display = isOwner ? 'none' : 'inline-block';
            
            this.viewSharedMapModal.style.display = 'flex';
            
            // Clean existing buttons first
            const header = document.querySelector('#viewSharedMapModal .whiteboard-header .whiteboard-actions');
            const closeBtn = header.querySelector('.close-btn');
            header.innerHTML = '';
            if (closeBtn) {
                header.appendChild(closeBtn);
            }
            
            // Add share button if public
            if (data.is_public) {
                const shareBtn = document.createElement('button');
                shareBtn.className = 'save-whiteboard-btn share-thought-btn';
                shareBtn.textContent = '🔗 Partager';
                shareBtn.onclick = () => this.shareMapLink(mapId);
                header.insertBefore(shareBtn, closeBtn);
            }
            
            // Add login prompt if not authenticated
            if (!this.user) {
                const loginBtn = document.createElement('button');
                loginBtn.className = 'save-whiteboard-btn';
                loginBtn.textContent = '🔐 Se connecter';
                loginBtn.onclick = () => {
                    this.closeViewSharedMap();
                    this.showAuth();
                };
                header.insertBefore(loginBtn, closeBtn);
            }
            
            // Initialize Excalidraw with map data (always read-only if not owner)
            this.initializeMapExcalidraw(data.excalidraw_data, !isOwner);
            
            // Clean URL after opening
            window.history.replaceState({}, document.title, window.location.pathname);
            
        } catch (error) {
            console.error('Error viewing map from URL:', error);
            alert('Erreur lors du chargement du thought. Il n\'existe peut-être plus.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const skillsTracker = new SkillsTracker();
// Make it globally available for onclick handlers
window.skillsTracker = skillsTracker;