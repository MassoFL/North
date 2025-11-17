// Supabase configuration
const supabaseUrl = 'https://xfiytwnqkljoqvlqghjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaXl0d25xa2xqb3F2bHFnaGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzQ5MTIsImV4cCI6MjA3ODk1MDkxMn0.1tRrcRHy3AHIydP6d5PE18T4R6ys4sZTIlW6uDQZIyo';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

class SkillsTracker {
    constructor() {
        this.skills = [];
        this.user = null;
        this.currentOnboardingStep = 1;
        this.initializeElements();
        this.bindEvents();
        this.checkAuth();
    }

    initializeElements() {
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
        this.userEmail = document.getElementById('userEmail');
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
    }

    bindEvents() {
        this.addSkillBtn.addEventListener('click', () => this.addSkill());
        this.skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSkill();
        });
        
        this.authForm.addEventListener('submit', (e) => this.handleAuth(e));
        this.authSwitchLink.addEventListener('click', (e) => this.toggleAuthMode(e));
        this.logoutBtn.addEventListener('click', () => this.logout());
        this.skillType.addEventListener('change', () => this.handleSkillTypeChange());
        this.addMilestoneBtn.addEventListener('click', () => this.addMilestoneInput());
    }

    async checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
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
            this.showAuth();
        }
    }

    showAuth() {
        this.authModal.style.display = 'flex';
        document.querySelector('.container').style.display = 'none';
    }

    showApp() {
        this.authModal.style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        this.userInfo.style.display = 'flex';
        this.userEmail.textContent = this.user.email;
        this.renderSkills();
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
        e.preventDefault();
        const email = this.email.value;
        const password = this.password.value;
        const isLogin = this.authTitle.textContent === 'Se connecter';

        try {
            let result;
            if (isLogin) {
                result = await supabase.auth.signInWithPassword({ email, password });
            } else {
                result = await supabase.auth.signUp({ email, password });
            }

            if (result.error) {
                alert('Erreur: ' + result.error.message);
                return;
            }

            if (!isLogin && !result.data.session) {
                alert('Vérifiez votre email pour confirmer votre inscription');
                return;
            }

            this.user = result.data.user;
            await this.loadSkillsFromDB();
            
            // Vérifier si c'est un nouvel utilisateur
            const hasSeenOnboarding = localStorage.getItem(`onboarding_${this.user.id}`);
            if (!hasSeenOnboarding && this.skills.length === 0) {
                this.showOnboarding();
            } else {
                this.showApp();
            }
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    }

    async logout() {
        await supabase.auth.signOut();
        this.user = null;
        this.skills = [];
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

        if (this.skills.find(skill => skill.name.toLowerCase() === skillName.toLowerCase())) {
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
            this.renderSkills();
            this.resetForm();
        } catch (error) {
            alert('Erreur lors de l\'ajout: ' + error.message);
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
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', this.user.id);

            if (error) throw error;

            this.skills = data || [];
            this.renderSkills();
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.skills = [];
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
            .sort((a, b) => b.hours - a.hours)
            .map(skill => this.renderSkillItem(skill))
            .join('');
    }

    renderSkillItem(skill) {
        const typeLabels = {
            continuous: '🔄 Habitude',
            project: '🚀 Projet',
            target: '🎯 Objectif'
        };

        let progressInfo = '';
        let milestonesInfo = '';
        
        if (skill.type === 'target') {
            const progress = Math.min((skill.hours / skill.target) * 100, 100);
            progressInfo = `<div class="skill-progress">${skill.hours}/${skill.target} ${skill.target_unit} (${Math.round(progress)}%)</div>`;
        } else if (skill.type === 'project' && skill.milestones) {
            const milestones = JSON.parse(skill.milestones);
            const completedCount = milestones.filter(m => m.completed).length;
            const totalCount = milestones.length;
            
            milestonesInfo = `
                <div class="skill-progress">${completedCount}/${totalCount} milestones (${Math.round((completedCount/totalCount)*100)}%)</div>
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
        
        const backgroundColor = isCompleted ? '#10b981' : this.getSkillColor(skill.hours, skill.type, skill.target);

        return `
            <div class="skill-item" style="background-color: ${backgroundColor}">
                <div class="skill-info">
                    <div class="skill-type-badge">${typeLabels[skill.type] || '🔄 Habitude'}</div>
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-hours">${skill.hours} heure${skill.hours !== 1 ? 's' : ''}</div>
                    ${progressInfo}
                    ${milestonesInfo}
                </div>
                <div class="skill-controls">
                    ${!isCompleted ? `
                        <button class="increment-btn" onclick="skillsTracker.incrementSkill(${skill.id})">
                            +1
                        </button>
                    ` : `
                        <div class="completed-badge">✅ Terminé</div>
                    `}
                    <button class="delete-btn" onclick="skillsTracker.deleteSkill(${skill.id})">
                        Supprimer
                    </button>
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
}

// Initialize the app
const skillsTracker = new SkillsTracker();