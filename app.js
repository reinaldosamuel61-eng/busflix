// ==========================================
// 1. DADOS DO CARROSSEL (CONECTA BAIRRO)
// ==========================================
// Banners que aparecem no card azul da home (o carrossel que troca sozinho a cada 5s).
// Cada item é um banner. Para ADICIONAR um novo banner, copie um objeto e cole no final
// da lista (a ordem aqui é a ordem em que eles aparecem no carrossel):
//   - imagem: caminho do arquivo da imagem dentro de img/banners/
//   - link:   para onde o usuário vai ao tocar no banner (ex: '#avisos' abre a aba Avisos)
//   - alt:    texto alternativo (acessibilidade/leitor de tela), descreva o que a imagem mostra
// Para REMOVER um banner, basta apagar o objeto correspondente.
const bannersHome = [
    { imagem: 'img/banners/avisos.png', link: '#avisos', alt: 'Aviso sobre o horário de circulação no feriado de 09 de julho' },
    { imagem: 'img/banners/avisos 2.png', link: '#avisos', alt: 'Informação do transporte público' },
    { imagem: 'img/banners/lechef.png', link: '#avisos', alt: 'Informação do transporte público' },

];

// Lista única de avisos da galeria (sem categorias). Cada objeto é um "pôster" que
// aparece na grade da página Avisos e, ao tocar, abre no modal com todos os detalhes.
// Campos de cada aviso:
//   - titulo: título grande dentro do modal (e usado como texto alternativo do pôster)
//   - texto:  texto/descrição abaixo do título, mostrado só dentro do modal
//   - link:   texto do botão/link verde no final do modal (não precisa ser um link real)
//   - imagem: (opcional) caminho da imagem de capa em img/banners/. Se remover este
//             campo, o pôster/modal ficam só com fundo colorido (sem foto).
// Para ADICIONAR um aviso novo, copie um objeto e cole no final da lista.
// Para REMOVER, basta apagar o objeto correspondente.
const avisosGaleria = [
    {
        titulo: 'PAT Caçapava — Vagas abertas!',
        texto: 'O Posto de Atendimento ao Trabalhador tem novas oportunidades de emprego.',
        link: 'patcacapava.sp.gov.br',
        imagem: 'img/banners/avisos 2.png'
    },
    {
        titulo: 'Atenção: Desvio na Linha 01',
        texto: 'Devido a obras, os ônibus via Nova Caçapava sofrerão atrasos nesta sexta-feira.',
        link: 'Ver detalhes',
        imagem: 'img/banners/avisos 2.png'
    },
    {
        titulo: 'Lanchonete da Praça',
        texto: 'Mostre que usa o Busflix e ganhe desconto no salgado e refrigerante!',
        link: '@lanchonetedapraca',
        imagem: 'img/banners/avisos 2.png'
    },
    {
        titulo: 'Confira seu itinerário antes de sair',
        texto: 'Consulte os horários atualizados da sua linha no Busflix.',
        link: 'Ver horários',
        imagem: 'img/banners/avisos 2.png'
    }
];

let slideAtual = 0;
let dadosGerais = [];
let intervaloCarrossel;
let saidaAtual = 0;
let tipoDiaAtual = 'dias_uteis';
let linhaAtual = '';
let linhaFavorita = localStorage.getItem('busflix-linha-favorita') || '';
let sentidoFavorito = Number(localStorage.getItem('busflix-sentido-favorito')) || 0;
let promptInstalacao;
const paginasNavegacao = ['home', 'horarios', 'avisos', 'contato', 'sobre'];
const ordemSwipe = ['sobre', 'contato', 'home', 'avisos', 'horarios'];
let paginaAtual = 'home';
let inicioArrastePaginaX = 0;
let inicioArrastePaginaY = 0;
let retornoHomeArmado = false;

// ==========================================
// 2. INICIALIZAÇÃO DO APP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    configurarNavegacao();
    carregarHorarios();
    configurarCarrossel(); // Inicia o carrossel junto com o resto do site
    configurarGaleria();
    configurarAcoesFavoritaHome();
    configurarAcessibilidade();
    configurarInstalacaoPwa();
    configurarTelaAbertura();
    configurarConfiguracoes();
    configurarContatoDesenvolvedor();
    renderizarSaudacao();
    window.setInterval(renderizarProximosHorarios, 60000);
});

function configurarContatoDesenvolvedor() {
    const modal = document.getElementById('developer-modal');
    const abrir = document.getElementById('abrir-formulario-desenvolvedor');
    const fechar = document.getElementById('fechar-formulario-desenvolvedor');
    const backdrop = document.getElementById('developer-modal-backdrop');
    if (!modal || !abrir || !fechar || !backdrop) return;

    const fecharModal = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
    };
    abrir.addEventListener('click', () => {
        modal.hidden = false;
        document.body.classList.add('modal-open');
        document.getElementById('contato-nome')?.focus();
    });
    fechar.addEventListener('click', fecharModal);
    backdrop.addEventListener('click', fecharModal);
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape' && !modal.hidden) fecharModal();
    });
}

function configurarConfiguracoes() {
    const painel = document.getElementById('settings-panel');
    const abrir = document.getElementById('abrir-configuracoes');
    const fechar = document.getElementById('fechar-configuracoes');
    const salvar = document.getElementById('salvar-nome');
    const nome = document.getElementById('nome-usuario');
    const seletorLinhaFavorita = document.getElementById('favorite-line-select');
    if (!painel || !abrir || !fechar || !salvar || !nome) return;

    nome.value = localStorage.getItem('busflix-nome') || '';
    abrir.addEventListener('click', () => abrirConfiguracoes('nome-usuario'));
    fechar.addEventListener('click', fecharConfiguracoes);
    painel.addEventListener('click', evento => {
        if (evento.target === painel) fecharConfiguracoes();
    });
    salvar.addEventListener('click', salvarNomeUsuario);
    nome.addEventListener('keydown', evento => {
        if (evento.key === 'Enter') salvarNomeUsuario();
    });

    seletorLinhaFavorita?.addEventListener('change', () => {
        linhaFavorita = seletorLinhaFavorita.value;
        sentidoFavorito = 0;
        if (linhaFavorita) {
            localStorage.setItem('busflix-linha-favorita', linhaFavorita);
            localStorage.setItem('busflix-sentido-favorito', String(sentidoFavorito));
        } else {
            localStorage.removeItem('busflix-linha-favorita');
            localStorage.removeItem('busflix-sentido-favorito');
        }
        renderizarSentidosFavorita();
        renderizarProximosHorarios();
    });

    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape' && !painel.hidden) fecharConfiguracoes();
    });
    if (!localStorage.getItem('busflix-nome')) {
        painel.hidden = false;
        document.body.classList.add('modal-open');
    }
}

function abrirConfiguracoes(campoFoco = 'nome-usuario') {
    const painel = document.getElementById('settings-panel');
    if (!painel) return;
    painel.hidden = false;
    document.body.classList.add('modal-open');
    const campo = document.getElementById(campoFoco);
    campo?.focus();
}

function fecharConfiguracoes() {
    const painel = document.getElementById('settings-panel');
    if (!painel) return;
    painel.hidden = true;
    document.body.classList.remove('modal-open');
}

function salvarNomeUsuario() {
    const nome = document.getElementById('nome-usuario');
    if (!nome) return;
    const valor = nome.value.trim();
    if (!valor) {
        nome.focus();
        return;
    }
    localStorage.setItem('busflix-nome', valor);
    renderizarSaudacao();
    fecharConfiguracoes();
}

function renderizarSaudacao() {
    const saudacao = document.getElementById('saudacao-usuario');
    if (!saudacao) return;
    const hora = new Date().getHours();
    const periodo = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    const nome = localStorage.getItem('busflix-nome');
    saudacao.innerHTML = `${periodo}${nome ? `, ${nome}` : ''}! <span aria-hidden="true">👋</span>`;
}

function configurarTelaAbertura() {
    const tela = document.getElementById('app-splash');
    const video = document.getElementById('splash-video');
    if (!tela || !video) return;

    const fechar = () => {
        tela.classList.add('is-hidden');
        window.setTimeout(() => tela.remove(), 350);
    };
    video.addEventListener('ended', fechar, { once: true });
    video.addEventListener('error', fechar, { once: true });
    window.setTimeout(fechar, 4000);
}

function configurarAcessibilidade() {
    const alternarTema = document.getElementById('alternar-tema');
    const ajustarFonte = document.getElementById('ajustar-fonte');
    const temaEscuro = localStorage.getItem('busflix-tema') === 'escuro';
    const tamanhoFonte = localStorage.getItem('busflix-fonte') || 'normal';
    document.body.classList.toggle('dark-mode', temaEscuro);
    document.body.classList.toggle('large-font', tamanhoFonte === 'grande');
    atualizarControleTema(temaEscuro);
    atualizarControleFonte(tamanhoFonte === 'grande');

    alternarTema?.addEventListener('click', () => {
        const ativo = document.body.classList.toggle('dark-mode');
        localStorage.setItem('busflix-tema', ativo ? 'escuro' : 'claro');
        atualizarControleTema(ativo);
    });
    ajustarFonte?.addEventListener('click', () => {
        const ativo = document.body.classList.toggle('large-font');
        localStorage.setItem('busflix-fonte', ativo ? 'grande' : 'normal');
        atualizarControleFonte(ativo);
    });
}

function atualizarControleTema(escuro) {
    const botao = document.getElementById('alternar-tema');
    if (!botao) return;
    const texto = escuro ? 'Modo claro' : 'Modo escuro';
    botao.innerHTML = `<i class="fa-solid fa-${escuro ? 'sun' : 'moon'}"></i><span>${texto}</span>`;
    botao.setAttribute('aria-label', escuro ? 'Ativar modo claro' : 'Ativar modo escuro');
    botao.title = escuro ? 'Modo claro' : 'Modo escuro';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', escuro ? '#111A17' : '#FFFFFF');
}

function atualizarControleFonte(grande) {
    const botao = document.getElementById('ajustar-fonte');
    if (!botao) return;
    botao.classList.toggle('active', grande);
    botao.setAttribute('aria-label', grande ? 'Usar tamanho normal da fonte' : 'Aumentar tamanho da fonte');
}

function configurarInstalacaoPwa() {
    const aviso = document.getElementById('install-notice');
    const instalar = document.getElementById('instalar-app');
    const fechar = document.getElementById('fechar-install');
    if (!aviso || !instalar || !fechar) return;

    window.addEventListener('beforeinstallprompt', evento => {
        evento.preventDefault();
        promptInstalacao = evento;
        if (!localStorage.getItem('busflix-install-dismissed')) aviso.hidden = false;
    });
    instalar.addEventListener('click', async () => {
        if (!promptInstalacao) return;
        promptInstalacao.prompt();
        await promptInstalacao.userChoice;
        promptInstalacao = null;
        aviso.hidden = true;
    });
    fechar.addEventListener('click', () => {
        aviso.hidden = true;
        localStorage.setItem('busflix-install-dismissed', 'true');
    });
    window.addEventListener('appinstalled', () => { aviso.hidden = true; });

    if (!('serviceWorker' in navigator)) return;

    const hostLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (hostLocal) {
        desativarCacheNoAmbienteLocal();
        return;
    }

    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(console.error);
}

async function desativarCacheNoAmbienteLocal() {
    try {
        const registros = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registros.map(registro => registro.unregister()));
        const nomesCache = await caches.keys();
        await Promise.all(nomesCache.map(nome => caches.delete(nome)));
    } catch (erro) {
        console.warn('Falha ao limpar cache local de desenvolvimento:', erro);
    }
}


// ==========================================
// 3. MOTOR DO CARROSSEL (NOVO)
// ==========================================
// Estas funções apenas LEEM a lista bannersHome e desenham na tela.
// Para mudar o conteúdo dos banners, edite bannersHome lá em cima — não mexa aqui.
function configurarCarrossel() {
    const btnEsq = document.querySelector('.nav-arrow.left');
    const btnDir = document.querySelector('.nav-arrow.right');

    // Só adiciona os eventos se os botões existirem na tela
    if (btnEsq && btnDir) {
        btnEsq.addEventListener('click', () => mudarSlide(-1));
        btnDir.addEventListener('click', () => mudarSlide(1));
        renderizarSlide();
        iniciarRotacaoAutomatica();
    }
}

function iniciarRotacaoAutomatica() {
    // Troca de banner sozinha a cada 5 segundos (5000ms). Mude o valor aqui para ajustar a velocidade.
    intervaloCarrossel = window.setInterval(() => mudarSlide(1), 5000);
}

// Avança (direcao = 1) ou volta (direcao = -1) um banner, voltando ao começo/fim quando chega na ponta da lista.
function mudarSlide(direcao) {
    slideAtual += direcao;

    if (slideAtual >= bannersHome.length) {
        slideAtual = 0;
    } else if (slideAtual < 0) {
        slideAtual = bannersHome.length - 1;
    }

    renderizarSlide();
}

// Pega o banner da posição atual (slideAtual) e atualiza a imagem/link/bolinhas na tela.
function renderizarSlide() {
    const dados = bannersHome[slideAtual];
    const imagem = document.querySelector('.home-banner-image');
    const link = document.querySelector('.home-banner-link');
    if (imagem && link) {
        imagem.src = dados.imagem;
        imagem.alt = dados.alt;
        link.href = dados.link;
    }

    const areaDots = document.querySelector('.carousel-dots');
    if (areaDots) {
        areaDots.innerHTML = ''; 
        
        bannersHome.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === slideAtual) {
                dot.classList.add('active');
            }
            areaDots.appendChild(dot);
        });
    }
}


// ==========================================
// 4. NAVEGAÇÃO E HORÁRIOS (MANTIDO)
// ==========================================
function configurarNavegacao() {
    const botoes = document.querySelectorAll('[data-page]');
    const secoes = document.querySelectorAll('.page');

    const exibirPagina = pagina => {
        paginaAtual = paginasNavegacao.includes(pagina) ? pagina : 'home';
        botoes.forEach(btn => btn.classList.toggle('active', btn.dataset.page === paginaAtual));
        secoes.forEach(secao => secao.classList.toggle('active', secao.id === `${paginaAtual}-page`));
    };

    const navegarPara = (pagina, substituir = false) => {
        const destino = paginasNavegacao.includes(pagina) ? pagina : 'home';
        retornoHomeArmado = false;
        if (substituir) {
            window.history.replaceState({ pagina: destino }, '', `#${destino}`);
        } else if (destino !== paginaAtual) {
            window.history.pushState({ pagina: destino }, '', `#${destino}`);
        }
        exibirPagina(destino);
    };

    botoes.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            navegarPara(btn.dataset.page);
        });
    });

    const paginaInicial = window.location.hash.slice(1);
    navegarPara(paginasNavegacao.includes(paginaInicial) ? paginaInicial : 'home', true);
    window.history.pushState({ pagina: paginaAtual, guard: true }, '', `#${paginaAtual}`);
    window.history.pushState({ pagina: paginaAtual, guard: true }, '', `#${paginaAtual}`);

    const mostrarConfirmacaoSaida = () => {
        const modal = document.getElementById('exit-confirmation');
        if (!modal) return;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        document.getElementById('confirmar-saida')?.focus();
    };

    const fecharConfirmacaoSaida = () => {
        const modal = document.getElementById('exit-confirmation');
        if (!modal) return;
        modal.hidden = true;
        document.body.classList.remove('modal-open');
    };

    document.getElementById('cancelar-saida')?.addEventListener('click', () => {
        fecharConfirmacaoSaida();
        window.history.pushState({ pagina: 'home', guard: true }, '', '#home');
        window.history.pushState({ pagina: 'home', guard: true }, '', '#home');
        retornoHomeArmado = false;
    });
    document.getElementById('confirmar-saida')?.addEventListener('click', () => {
        fecharConfirmacaoSaida();
        window.close();
        window.setTimeout(() => {
            if (!document.hidden) window.location.replace('about:blank');
        }, 100);
    });
    document.getElementById('exit-confirmation-backdrop')?.addEventListener('click', () => {
        fecharConfirmacaoSaida();
        window.history.pushState({ pagina: 'home', guard: true }, '', '#home');
        window.history.pushState({ pagina: 'home', guard: true }, '', '#home');
        retornoHomeArmado = false;
    });

    window.addEventListener('popstate', () => {
        if (paginaAtual !== 'home') {
            navegarPara('home', true);
            window.history.pushState({ pagina: 'home', guard: true }, '', '#home');
            retornoHomeArmado = false;
            return;
        }

        if (!retornoHomeArmado) {
            retornoHomeArmado = true;
            return;
        }

        mostrarConfirmacaoSaida();
    });

    const principal = document.querySelector('.home-content');
    principal?.addEventListener('touchstart', evento => {
        if (evento.target.closest('button, a, input, select, textarea, .gallery-modal')) return;
        const toque = evento.changedTouches[0];
        inicioArrastePaginaX = toque.clientX;
        inicioArrastePaginaY = toque.clientY;
    }, { passive: true });
    principal?.addEventListener('touchend', evento => {
        if (evento.target.closest('button, a, input, select, textarea, .gallery-modal')) return;
        const toque = evento.changedTouches[0];
        const deslocamentoX = toque.clientX - inicioArrastePaginaX;
        const deslocamentoY = toque.clientY - inicioArrastePaginaY;
        if (Math.abs(deslocamentoX) < 60 || Math.abs(deslocamentoX) <= Math.abs(deslocamentoY)) return;

        const indicePagina = ordemSwipe.indexOf(paginaAtual);
        const proximaPagina = ordemSwipe[indicePagina + (deslocamentoX > 0 ? 1 : -1)];
        if (proximaPagina) navegarPara(proximaPagina);
    }, { passive: true });
}

// Monta a grade de pôsteres (estilo catálogo da Netflix: só a imagem, sem legenda visível)
// e liga o clique que abre o modal com os detalhes. Chamada uma única vez ao carregar a página.
function configurarGaleria() {
    const grade = document.getElementById('gallery-grid');
    if (!grade) return;

    // Cada item da galeria é um botão com a imagem de capa (ou um fundo colorido, se não tiver imagem).
    grade.innerHTML = avisosGaleria.map((item, index) => `
        <button type="button" class="gallery-item" data-index="${index}" aria-label="Ver detalhes: ${item.titulo}">
            <span class="gallery-item-image${item.imagem ? '' : ' gallery-item-image--vazia'}" ${item.imagem ? `style="background-image: url('${item.imagem}')"` : ''}></span>
        </button>
    `).join('');

    grade.addEventListener('click', evento => {
        const botao = evento.target.closest('[data-index]');
        if (!botao) return;
        abrirGaleriaModal(Number(botao.dataset.index));
    });

    configurarGaleriaModal();
}

// Índice do aviso aberto no momento no modal (usado pelas setas de próximo/anterior).
let indiceGaleriaAtual = 0;
let inicioArrasteModalX = 0;
let inicioArrasteModalY = 0;

// Liga os botões/áreas que fecham o modal (X, fundo escuro, tecla Esc), as setas de
// navegação e o arraste (swipe) para trocar de aviso ou fechar.
function configurarGaleriaModal() {
    const modal = document.getElementById('gallery-modal');
    const card = document.getElementById('gallery-modal-card');
    const fechar = document.getElementById('gallery-modal-close');
    const backdrop = document.getElementById('gallery-modal-backdrop');
    const anterior = document.getElementById('gallery-modal-prev');
    const proximo = document.getElementById('gallery-modal-next');
    if (!modal || !card || !fechar || !backdrop || !anterior || !proximo) return;

    fechar.addEventListener('click', fecharGaleriaModal);
    backdrop.addEventListener('click', fecharGaleriaModal);
    anterior.addEventListener('click', () => mudarGaleriaModal(-1));
    proximo.addEventListener('click', () => mudarGaleriaModal(1));
    document.addEventListener('keydown', evento => {
        if (modal.hidden) return;
        if (evento.key === 'Escape') fecharGaleriaModal();
        if (evento.key === 'ArrowLeft') mudarGaleriaModal(-1);
        if (evento.key === 'ArrowRight') mudarGaleriaModal(1);
    });

    // Arrastar para os lados troca de aviso; arrastar para cima/baixo fecha o modal
    // (o que tiver o maior deslocamento é quem "ganha", pra não confundir os dois gestos).
    card.addEventListener('pointerdown', evento => {
        inicioArrasteModalX = evento.clientX;
        inicioArrasteModalY = evento.clientY;
        // Sem isso, soltar o dedo fora do card (comum num arraste vertical) faz o
        // pointerup não disparar aqui, porque o card deixa de estar sob o dedo.
        card.setPointerCapture(evento.pointerId);
    });
    card.addEventListener('pointerup', evento => {
        const deslocamentoX = evento.clientX - inicioArrasteModalX;
        const deslocamentoY = evento.clientY - inicioArrasteModalY;

        if (Math.abs(deslocamentoY) > Math.abs(deslocamentoX)) {
            if (Math.abs(deslocamentoY) >= 60) fecharGaleriaModal();
            return;
        }

        if (Math.abs(deslocamentoX) >= 45) {
            mudarGaleriaModal(deslocamentoX < 0 ? 1 : -1);
        }
    });
}

// Preenche o modal com os dados do aviso tocado e abre ele "suspenso" sobre a tela.
function abrirGaleriaModal(index) {
    indiceGaleriaAtual = index;
    preencherGaleriaModal();

    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    // O requestAnimationFrame garante que o navegador aplique "hidden = false" antes de
    // ligar a classe que dispara a transição de entrada (senão o fade não anima).
    requestAnimationFrame(() => modal.classList.add('is-open'));
}

// Troca o aviso exibido no modal (direcao = 1 avança, -1 volta), voltando ao início/fim
// da lista quando chega na ponta (efeito "circular").
function mudarGaleriaModal(direcao) {
    const total = avisosGaleria.length;
    indiceGaleriaAtual = (indiceGaleriaAtual + direcao + total) % total;
    preencherGaleriaModal();
}

// Só atualiza o conteúdo (imagem/título/texto/link) do modal já aberto, sem reanimar a entrada.
function preencherGaleriaModal() {
    const item = avisosGaleria[indiceGaleriaAtual];
    const modal = document.getElementById('gallery-modal');
    const imagem = document.getElementById('gallery-modal-image');
    const titulo = document.getElementById('gallery-modal-title');
    const texto = document.getElementById('gallery-modal-text');
    const link = document.getElementById('gallery-modal-link');
    if (!modal || !imagem || !titulo || !texto || !link) return;

    modal.classList.toggle('sem-imagem', !item.imagem);
    imagem.style.backgroundImage = item.imagem ? `url('${item.imagem}')` : '';
    titulo.textContent = item.titulo;
    texto.textContent = item.texto;
    link.textContent = item.link;
}

// Fecha o modal com uma pequena transição antes de escondê-lo de vez (display:none).
function fecharGaleriaModal() {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    window.setTimeout(() => { modal.hidden = true; }, 220);
}

async function carregarHorarios() {
    try {
        const resposta = await fetch('horarios.json?v=7');
        dadosGerais = await resposta.json();
        configurarHorarios();
        configurarLinhaFavorita();
    } catch (erro) {
        console.error("Erro ao carregar os horários:", erro);
        const lista = document.getElementById('lista-horarios');
        if (lista) {
            lista.innerHTML = '<p class="aviso-temporario">Erro ao carregar os dados. Verifique a conexão.</p>';
        }
    }
}

function configurarHorarios() {
    const opcoesSaida = document.getElementById('opcoes-saida');
    const seletorLinha = document.getElementById('seletor-linha');
    const filtros = document.querySelectorAll('.day-tab');
    if (!opcoesSaida || !seletorLinha || !filtros.length) return;

    const linhas = [...new Set(dadosGerais.map(rota => rota.linha))];
    seletorLinha.innerHTML = '<option value="">Selecionar linha...</option>';
    linhas.forEach(linha => {
        const opcao = document.createElement('option');
        opcao.value = linha;
        opcao.textContent = linha;
        seletorLinha.appendChild(opcao);
    });
    linhaAtual = linhas[0] || '';
    seletorLinha.value = linhaAtual;
    seletorLinha.addEventListener('change', () => {
        linhaAtual = seletorLinha.value;
        saidaAtual = 0;
        renderizarOpcoesSaida();
        renderizarHorariosSelecionados();
    });

    opcoesSaida.addEventListener('click', evento => {
        const opcao = evento.target.closest('[data-saida]');
        if (!opcao) return;
        saidaAtual = Number(opcao.dataset.saida);
        renderizarOpcoesSaida();
        renderizarHorariosSelecionados();
    });

    filtros.forEach(filtro => filtro.addEventListener('click', () => {
        tipoDiaAtual = filtro.dataset.day;
        saidaAtual = 0;
        filtros.forEach(item => item.classList.toggle('active', item === filtro));
        renderizarOpcoesSaida();
        renderizarHorariosSelecionados();
    }));

    renderizarOpcoesSaida();
    renderizarHorariosSelecionados();
}

function renderizarOpcoesSaida() {
    const container = document.getElementById('opcoes-saida');
    const rota = dadosGerais.find(item => item.linha === linhaAtual && item.tipo_dia === tipoDiaAtual) || dadosGerais.find(item => item.linha === linhaAtual);
    if (!container) return;
    const saidas = rota?.saindo_de || [];
    container.innerHTML = saidas.length ? saidas.map((saida, index) => `
        <button type="button" class="departure-option ${index === saidaAtual ? 'active' : ''}" data-saida="${index}">
            <span class="departure-icon"><i class="fa-solid fa-location-dot"></i></span>
            <span><strong>${saida.origem}</strong><small>Para ${saida.destino}</small></span>
        </button>
    `).join('') : '<p class="aviso-temporario">Nenhum ponto de saída cadastrado para esta linha.</p>';
}

function renderizarHorariosSelecionados() {
    const rota = dadosGerais.find(item => item.linha === linhaAtual && item.tipo_dia === tipoDiaAtual);
    exibirNaTela(rota ? [rota] : []);
}

function exibirNaTela(dados) {
    const lista = document.getElementById('lista-horarios');
    if (!lista) return;
    lista.innerHTML = '';

    if (!dados.length) {
        lista.innerHTML = '<p class="aviso-temporario">Nenhum horário cadastrado para esta linha e dia.</p>';
        return;
    }

    if (!dados[0].saindo_de?.length) {
        lista.innerHTML = '<p class="aviso-temporario">Esta linha ainda não possui horários cadastrados.</p>';
        return;
    }

    const esquemaCores = {
        'dias_uteis': { cor: '#2E7D32', titulo: 'DIAS ÚTEIS' },
        'sabados': { cor: '#F59E0B', titulo: 'SÁBADOS' },       
        'domingos_feriados': { cor: '#D32F2F', titulo: 'DOMINGOS E FERIADOS' } 
    };

    dados.forEach(rota => {
        const configDia = esquemaCores[rota.tipo_dia] || { cor: '#1B365D', titulo: 'HORÁRIOS' };

        const blocoRota = document.createElement('div');
        blocoRota.style.marginBottom = '20px';
        blocoRota.style.border = `2px solid ${configDia.cor}`;
        blocoRota.style.borderRadius = '8px';
        blocoRota.style.overflow = 'hidden';
        blocoRota.style.backgroundColor = '#FFFFFF';

        blocoRota.innerHTML = `
            <div style="background-color: ${configDia.cor}; color: white; padding: 10px; text-align: center; font-weight: bold; font-size: 14px;">
                ${configDia.titulo}
            </div>
        `;

        const trecho = rota.saindo_de?.[saidaAtual];
        if (trecho) {
            const painel = document.createElement('section');
            const horariosPorPeriodo = { manhã: [], tarde: [], noite: [] };
            const horarios = trecho.horarios || [];
            horarios.forEach(horario => {
                const hora = Number(horario.hora.split(':')[0]);
                const periodo = hora < 12 ? 'manhã' : hora < 18 ? 'tarde' : 'noite';
                horariosPorPeriodo[periodo].push(horario);
            });
            painel.style.padding = '14px 15px 8px';
            painel.style.borderTop = '1px solid #eee';
            painel.innerHTML = '';

            if (!horarios.length) {
                painel.innerHTML += '<p style="font-size: 13px; color: #777; padding-bottom: 8px;">Sem horários cadastrados.</p>';
            } else {
                Object.entries(horariosPorPeriodo).forEach(([periodo, horarios]) => {
                    if (!horarios.length) return;
                    const turno = document.createElement('details');
                    turno.className = 'period-accordion';
                    turno.open = periodo === 'manhã';

                    const tituloPeriodo = document.createElement('summary');
                    tituloPeriodo.className = 'period-title';
                    tituloPeriodo.innerHTML = `<span>${periodo}</span><i class="fa-solid fa-chevron-down"></i>`;
                    turno.appendChild(tituloPeriodo);

                    turno.addEventListener('toggle', () => {
                        if (!turno.open) return;
                        painel.querySelectorAll('.period-accordion').forEach(outroTurno => {
                            if (outroTurno !== turno) outroTurno.open = false;
                        });
                    });

                    horarios.forEach(horario => {
                        const item = document.createElement('p');
                        item.className = 'schedule-item';
                        item.innerHTML = `<strong>${horario.hora}</strong> <span>${horario.observacao}</span>`;
                        turno.appendChild(item);
                    });
                    painel.appendChild(turno);
                });
            }

            blocoRota.appendChild(painel);
        }

        if (rota.observacoes.length) {
            const observacoes = document.createElement('p');
            observacoes.style.padding = '10px 15px 14px';
            observacoes.style.color = '#555';
            observacoes.style.fontSize = '13px';
            observacoes.innerHTML = `<strong>Observações:</strong> ${rota.observacoes.join(' ')}`;
            blocoRota.appendChild(observacoes);
        }

        lista.appendChild(blocoRota);
    });
}

function configurarLinhaFavorita() {
    const linhas = [...new Set(dadosGerais.map(rota => rota.linha))];
    if (!linhas.includes(linhaFavorita)) {
        linhaFavorita = '';
        localStorage.removeItem('busflix-linha-favorita');
    }
    preencherSeletorLinhaFavorita(linhas);
    renderizarSentidosFavorita();
    renderizarProximosHorarios();
}

function configurarAcoesFavoritaHome() {
    const alterarSentido = document.getElementById('alterar-sentido');
    if (alterarSentido) alterarSentido.addEventListener('click', alternarSentidoFavorito);
}

function preencherSeletorLinhaFavorita(linhas) {
    const seletor = document.getElementById('favorite-line-select');
    if (!seletor) return;
    seletor.innerHTML = '<option value="">Selecione uma linha...</option>';
    linhas.forEach(linha => {
        const opcao = document.createElement('option');
        opcao.value = linha;
        opcao.textContent = linha;
        seletor.appendChild(opcao);
    });
    seletor.value = linhaFavorita;
}

function renderizarSentidosFavorita() {
    const botao = document.getElementById('alterar-sentido');
    const seletorLinha = document.getElementById('favorite-line-select');
    const rota = dadosGerais.find(item => item.linha === linhaFavorita && item.tipo_dia === obterTipoDiaAtual()) || dadosGerais.find(item => item.linha === linhaFavorita);
    const sentidos = rota?.saindo_de || [];
    if (seletorLinha && seletorLinha.value !== linhaFavorita) {
        seletorLinha.value = linhaFavorita;
    }
    if (sentidoFavorito >= sentidos.length) sentidoFavorito = 0;

    if (botao) {
        botao.hidden = !linhaFavorita || sentidos.length < 2;
        botao.title = sentidos.length > 1 ? `Alterar sentido: saindo de ${sentidos[sentidoFavorito]?.origem || ''} para ${sentidos[sentidoFavorito]?.destino || ''}` : '';
    }
    atualizarLabelFavorita(sentidos[sentidoFavorito]);
}

function alternarSentidoFavorito() {
    const rota = dadosGerais.find(item => item.linha === linhaFavorita && item.tipo_dia === obterTipoDiaAtual()) || dadosGerais.find(item => item.linha === linhaFavorita);
    const totalSentidos = rota?.saindo_de?.length || 0;
    if (totalSentidos < 2) return;
    sentidoFavorito = (sentidoFavorito + 1) % totalSentidos;
    localStorage.setItem('busflix-sentido-favorito', sentidoFavorito);
    renderizarSentidosFavorita();
    renderizarProximosHorarios();
}

function atualizarLabelFavorita(sentido) {
    const label = document.getElementById('linha-favorita-label');
    if (label) label.textContent = linhaFavorita || 'Escolher linha favorita';
    const subtitulo = document.querySelector('.favorite-line-trigger-copy small');
    if (subtitulo) subtitulo.innerHTML = sentido
        ? `Origem: ${sentido.origem}<br>Destino: ${sentido.destino}`
        : 'Configure em Configurações';
}

function obterTipoDiaAtual() {
    const diaDaSemana = new Date().getDay();
    if (diaDaSemana === 0) return 'domingos_feriados';
    if (diaDaSemana === 6) return 'sabados';
    return 'dias_uteis';
}

function minutosDoHorario(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
}

function renderizarProximosHorarios() {
    const container = document.getElementById('proximos-horarios');
    if (!container) return;
    if (!linhaFavorita) {
        container.innerHTML = '<p class="aviso-temporario">Selecione uma linha para consultar os próximos horários.</p>';
        return;
    }

    const tipoDia = obterTipoDiaAtual();
    const rotas = dadosGerais.filter(item => item.linha === linhaFavorita && item.tipo_dia === tipoDia);
    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const proximos = rotas.flatMap(rota => (rota.saindo_de || []).filter((_, index) => index === sentidoFavorito).flatMap(saida => (saida.horarios || [])
        .filter(item => minutosDoHorario(item.hora) >= minutosAgora)
        .map(horario => ({ origem: saida.origem, destino: saida.destino, horario }))));

    if (!proximos.length) {
        container.innerHTML = `<p class="aviso-temporario">Não há mais horários para esta linha hoje.</p>`;
        return;
    }

    proximos.sort((primeiro, segundo) => minutosDoHorario(primeiro.horario.hora) - minutosDoHorario(segundo.horario.hora));
    container.innerHTML = proximos.slice(0, 3).map(item => `
        <div class="next-schedule-item">
            <strong>${item.horario.hora}</strong>
            <span>
                ${item.horario.observacao ? `<small>[${item.horario.observacao}]</small>` : ''}
            </span>
        </div>
    `).join('');
}
