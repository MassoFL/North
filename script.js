// Supabase configuration
const supabaseUrl = 'https://xfiytwnqkljoqvlqghjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaXl0d25xa2xqb3F2bHFnaGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzQ5MTIsImV4cCI6MjA3ODk1MDkxMn0.1tRrcRHy3AHIydP6d5PE18T4R6ys4sZTIlW6uDQZIyo';

console.log('Configuration Supabase:', { supabaseUrl, supabaseKey: supabaseKey.substring(0, 20) + '...' });
console.log('Environment:', { 
    protocol: window.location.protocol, 
    host: window.location.host,
    isProduction: window.location.host.includes('vercel.app')
});

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('Client Supabase créé:', supabase);

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
        this.initializeElements();
        this.bindEvents();
        this.checkAuth();
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
        this.skillType.addEventListener('change', () => this.handleSkillTypeChange());
        this.addMilestoneBtn.addEventListener('click', () => this.addMilestoneInput());
        
        // Add goal modal
        this.addGoalBtn = document.getElementById('addGoalBtn');
        this.addGoalModal = document.getElementById('addGoalModal');
        this.addGoalBtn.addEventListener('click', () => this.openAddGoalModal());
        
        // Menu utilisateur
        this.menuToggle = document.getElementById('menuToggle');
        this.userMenu = document.getElementById('userMenu');
        this.menuToggle.addEventListener('click', () => this.toggleUserMenu());
        
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
            const { data: { session }, error } = await supabase.auth.getSession();
            
            console.log('Session check result:', { session, error, environment: window.location.host });
            
            if (error) {
                console.error('Erreur lors de la vérification de session:', error);
                this.showAuth();
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
                console.log('Aucune session trouvée, affichage de l\'auth');
                this.showAuth();
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
                result = await supabase.auth.signInWithPassword({ email, password });
            } else {
                console.log('Inscription avec Supabase...');
                result = await supabase.auth.signUp({ email, password });
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
        await supabase.auth.signOut();
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
        milestoneDiv.innerHTML = `
            <input type="text" class="milestone-name" placeholder="Nom du milestone" maxlength="100">
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

        // Vérifier les doublons seulement si ce n'est pas une édition
        if (!this.editingSkillId && this.skills.find(skill => skill.name.toLowerCase() === skillName.toLowerCase())) {
            alert('Cet objectif existe déjà');
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
                const { error } = await supabase
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
                const { data, error } = await supabase
                    .from('skills')
                    .insert([
                        { 
                            name: skillName, 
                            hours: 0, 
                            user_id: this.user.id,
                            type: type,
                            milestones: milestones ? JSON.stringify(milestones.map(m => ({ name: m, completed: false }))) : null,
                            target: target,
                            target_unit: targetUnit
                        }
                    ])
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
        this.milestonesContainer.innerHTML = `
            <div class="milestone-input">
                <input type="text" class="milestone-name" placeholder="Nom du milestone" maxlength="100">
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
                const { error } = await supabase
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

    async deleteSkill(skillId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
            try {
                const { error } = await supabase
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
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', this.user.id);

            if (error) {
                console.error('Erreur Supabase lors du chargement:', error);
                throw error;
            }

            console.log('Skills chargées:', data);
            this.skills = data || [];
            this.renderSkills();
        } catch (error) {
            console.error('Erreur lors du chargement des skills:', error);
            this.skills = [];
            // Ne pas bloquer la connexion si les skills ne se chargent pas
        }
    }

    getSkillColor(hours, type = 'continuous', target = null) {
        let maxHours = 50;
        
        // Ajuster maxHours selon le type
        if (type === 'target' && target) {
            maxHours = target;
        } else if (type === 'project') {
            maxHours = 100; // Projets plus longs
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

        this.skillsContainer.innerHTML = this.skills
            .map(skill => this.renderSkillItem(skill))
            .join('');
            
        // Forcer le recalcul des batteries après un délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
            this.recalculateAllBatteries();
        }, 150);
    }

    renderSkillItem(skill) {
        const typeLabels = {
            continuous: 'Habitude',
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
            <div class="skill-item ${isCompleted ? 'completed' : ''}" data-type="${skill.type}">
                <div class="skill-info">
                    <div class="skill-type-badge">${typeLabels[skill.type] || 'Habitude'}</div>
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-hours">${skill.hours} heure${skill.hours !== 1 ? 's' : ''}</div>
                    ${progressInfo}
                    ${milestonesInfo}
                </div>
                <div class="skill-controls">
                    ${!isCompleted ? `
                        <button class="increment-btn" onclick="skillsTracker.incrementSkill(${skill.id})">
                            +
                        </button>
                    ` : `
                        <div class="completed-badge">Terminé</div>
                    `}
                    <div class="menu-container">
                        <button class="menu-btn" onclick="skillsTracker.toggleMenu(${skill.id})">
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
                
                const { error } = await supabase
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
            // Fermer le menu
            document.getElementById(`menu-${skillId}`).style.display = 'none';
            
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
                    milestoneDiv.innerHTML = `
                        <input type="text" class="milestone-name" value="${milestone.name}" maxlength="100">
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
        // Créer un ID unique pour cette batterie
        const batteryId = `battery-${skillId || Date.now()}`;
        
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
}

// Initialize the app
const skillsTracker = new SkillsTracker();