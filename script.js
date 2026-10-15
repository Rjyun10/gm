// Nome de usuário do GitHub do Gabriel
const username = 'gabrielpsnmonteiro1-gif';
const projectsContainer = document.getElementById('projects-container');
const btnLoadMore = document.getElementById('btn-load-more');

// Repositórios que você deseja priorizar no topo da lista
const projetosDestaque = [
    // Adicione nomes exatos de repositórios aqui se quiser destacar algum
];

// Repositórios que devem ser ocultados do portfólio (ex: perfis, configs)
const projetosIgnorados = [
    'gabrielpsnmonteiro1-gif.github.io'
];

// Dicionário opcional para personalizar descrições em português
const projectDescriptions = {
    // 'nome-do-repo': 'Descrição personalizada.'
};

let todosProjetos = [];
let projetosExibidos = 0;
const itensPorPagina = 8;

document.addEventListener('DOMContentLoaded', () => {
    const githubLink = document.getElementById('github-profile-link');
    if (githubLink) {
        githubLink.href = `https://github.com/${username}`;
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    fetchGitHubProjects();
    initNavbarObserver();
    initMobileNavClose();

    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', exibirMaisProjetos);
    }
});

// Função que cria o HTML do card adaptando os botões conforme a disponibilidade do GitHub Pages
function renderCard(repo) {
    if (!projectsContainer) return;

    const title = repo.name;
    const desc = repo.description;
    const repoLink = repo.html_url;
    const language = repo.language;
    const hasPages = repo.has_pages; // Retorna true se o GitHub Pages estiver ativo no repositório

    const finalDesc = projectDescriptions[title] || desc || 'Nenhuma descrição fornecida no repositório.';
    const cardCol = document.createElement('div');
    cardCol.className = 'col-md-6 col-lg-4';

    // Monta os botões dinamicamente com base no 'hasPages'
    let botoesAcao = '';

    if (hasPages) {
        // Se tiver GitHub Pages, mostra os dois botões: Ver Demo e Ver Código
        const pagesLink = `https://${username}.github.io/${title}/`;
        botoesAcao = `
            <div class="d-flex gap-2">
                <a href="${pagesLink}" target="_blank" class="btn btn-green btn-sm flex-fill">
                    <i class="fas fa-external-link-alt me-1"></i> Ver Demo
                </a>
                <a href="${repoLink}" target="_blank" class="btn btn-outline-custom btn-sm flex-fill" title="Ver Código no GitHub">
                    <i class="fab fa-github me-1"></i> Código
                </a>
            </div>
        `;
    } else {
        // Se NÃO tiver GitHub Pages, mostra apenas o botão de ver o código ocupando o espaço todo
        botoesAcao = `
            <div>
                <a href="${repoLink}" target="_blank" class="btn btn-outline-custom btn-sm w-100">
                    <i class="fab fa-github me-1"></i> Ver Apenas Código (Sem Página)
                </a>
            </div>
        `;
    }

    cardCol.innerHTML = `
        <div class="custom-card p-4 d-flex flex-column justify-content-between h-100">
            <div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <i class="fas fa-folder-open text-success fs-4"></i>
                    <span class="badge bg-dark border border-secondary text-muted font-mono small">${hasPages ? 'Deploy Ativo' : 'Apenas Código'}</span>
                </div>
                <h3 class="h5 fw-bold mb-2 text-break">${title}</h3>
                <p class="text-secondary small mb-3">${finalDesc}</p>
            </div>
            <div>
                <div class="d-flex flex-wrap gap-1 mb-3">
                    <span class="tech-badge">${language || 'Diversos'}</span>
                    <span class="tech-badge">SENAI</span>
                </div>
                ${botoesAcao}
            </div>
        </div>
    `;
    projectsContainer.appendChild(cardCol);
}

// Controla a paginação em lotes
function exibirMaisProjetos() {
    const proximoLimite = projetosExibidos + itensPorPagina;
    const arrayParaExibir = todosProjetos.slice(projetosExibidos, proximoLimite);

    arrayParaExibir.forEach(repo => {
        renderCard(repo);
    });

    projetosExibidos = proximoLimite;

    if (btnLoadMore) {
        if (projetosExibidos >= todosProjetos.length) {
            btnLoadMore.classList.add('d-none');
        } else {
            btnLoadMore.classList.remove('d-none');
        }
    }
}

// Busca os repositórios públicos direto da API do GitHub
async function fetchGitHubProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
        if (!response.ok) throw new Error('Erro ao buscar repositórios do GitHub');
        
        let repos = await response.json();

        // Filtra os repositórios ignorados
        repos = repos.filter(repo => !projetosIgnorados.includes(repo.name));

        // Ordena colocando os destaques primeiro
        repos.sort((a, b) => {
            const indexA = projetosDestaque.indexOf(a.name);
            const indexB = projetosDestaque.indexOf(b.name);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
        });

        todosProjetos = repos;
        projetosExibidos = 0;
        if (projectsContainer) projectsContainer.innerHTML = '';

        if (todosProjetos.length === 0) {
            projectsContainer.innerHTML = '<div class="col-12 text-center text-muted"><p>Nenhum projeto encontrado no momento.</p></div>';
            return;
        }

        exibirMaisProjetos();

    } catch (error) {
        console.error('Erro:', error);
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <div class="col-12 text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <p>Não foi possível carregar os projetos do GitHub no momento. Tente novamente mais tarde.</p>
                </div>
            `;
        }
    }
}

// Funções auxiliares de navegação
function initNavbarObserver() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active', 'text-success');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active', 'text-success');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

function initMobileNavClose() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.getElementById('navbarNav');

    if (navbarCollapse) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            });
        });
    }
}