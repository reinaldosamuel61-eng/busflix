// ==========================================
// 1. DADOS DO CARROSSEL (CONECTA BAIRRO)
// ==========================================
const bannersHome = [
    { imagem: 'img/avisos.png', link: '#avisos', alt: 'Aviso sobre o horário de circulação no feriado de 09 de julho' },
    { imagem: 'img/avisos 2.png', link: '#avisos', alt: 'Informação do transporte público' },
];

const avisosDestaque = [
    {
        titulo: 'PAT Caçapava — Vagas abertas!',
        texto: 'O Posto de Atendimento ao Trabalhador tem novas oportunidades de emprego.',
        link: 'patcacapava.sp.gov.br',
        imagem: 'img/avisos 2.png'
    },
    {
        titulo: 'Atenção: Desvio na Linha 01',
        texto: 'Devido a obras, os ônibus via Nova Caçapava sofrerão atrasos nesta sexta-feira.',
        link: 'Ver detalhes',
        imagem: 'img/avisos 2.png'
    },
    {
        titulo: 'Lanchonete da Praça',
        texto: 'Mostre que usa o Busflix e ganhe desconto no salgado e refrigerante!',
        link: '@lanchonetedapraca'
        ,imagem: 'img/avisos 2.png'
    }
];

const storiesPorCategoria = {
    avisos: {
        nome: 'Avisos',
        icone: 'fa-bullhorn',
            stories: [avisosDestaque[0], avisosDestaque[1], {
                titulo: 'Confira seu itinerário antes de sair',
                texto: 'Consulte os horários atualizados da sua linha no Busflix.',
                link: 'Ver horários'
                ,imagem: 'img/avisos 2.png'
            }]
    },
    local: {
        nome: 'Local',
        icone: 'fa-store',
        stories: [avisosDestaque[2], {
            titulo: 'Feira livre neste sábado',
            texto: 'A feira da cidade acontece pela manhã na Praça da Bandeira.',
            link: 'Confira os horários no centro'
            ,imagem: 'img/avisos 2.png'
        }, {
            titulo: 'Novidades perto de você',
            texto: 'Descubra estabelecimentos e ofertas que apoiam o transporte local.',
            link: 'Saiba mais'
            ,imagem: 'img/avisos 2.png'
        }]
    }
};

let slideAtual = 0;
let dadosGerais = [];
let intervaloCarrossel;
let categoriaAtual = 'avisos';
let storyAtual = 0;
let intervaloStories;
let inicioToqueX = 0;
let saidaAtual = 0;
let tipoDiaAtual = 'dias_uteis';
let linhaAtual = '';
let linhaFavorita = localStorage.getItem('busflix-linha-favorita') || '';
let sentidoFavorito = Number(localStorage.getItem('busflix-sentido-favorito')) || 0;
let promptInstalacao;

// ==========================================
// 2. INICIALIZAÇÃO DO APP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    configurarNavegacao();
    carregarHorarios();
    configurarCarrossel(); // Inicia o carrossel junto com o resto do site
    configurarStories();
    configurarPainelFavorita();
    configurarAcessibilidade();
    configurarInstalacaoPwa();
    configurarTelaAbertura();
    configurarConfiguracoes();
    renderizarSaudacao();
    window.setInterval(renderizarProximosHorarios, 60000);
});

function configurarConfiguracoes() {
    const painel = document.getElementById('settings-panel');
    const abrir = document.getElementById('abrir-configuracoes');
    const fechar = document.getElementById('fechar-configuracoes');
    const salvar = document.getElementById('salvar-nome');
    const nome = document.getElementById('nome-usuario');
    if (!painel || !abrir || !fechar || !salvar || !nome) return;

    nome.value = localStorage.getItem('busflix-nome') || '';
    abrir.addEventListener('click', () => {
        painel.hidden = false;
        nome.focus();
        document.body.classList.add('modal-open');
    });
    fechar.addEventListener('click', fecharConfiguracoes);
    painel.addEventListener('click', evento => {
        if (evento.target === painel) fecharConfiguracoes();
    });
    salvar.addEventListener('click', salvarNomeUsuario);
    nome.addEventListener('keydown', evento => {
        if (evento.key === 'Enter') salvarNomeUsuario();
    });
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape' && !painel.hidden) fecharConfiguracoes();
    });
    if (!localStorage.getItem('busflix-nome')) {
        painel.hidden = false;
        document.body.classList.add('modal-open');
    }
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
    saudacao.innerHTML = `${periodo}${nome ? `, ${nome}` : ''}! <span aria-hidden="true">🚌</span>`;
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
    botao.innerHTML = `<i class="fa-solid fa-${escuro ? 'sun' : 'moon'}"></i>`;
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
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(console.error);
}


// ==========================================
// 3. MOTOR DO CARROSSEL (NOVO)
// ==========================================
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
    intervaloCarrossel = window.setInterval(() => mudarSlide(1), 5000);
}

function mudarSlide(direcao) {
    slideAtual += direcao;

    if (slideAtual >= bannersHome.length) {
        slideAtual = 0;
    } else if (slideAtual < 0) {
        slideAtual = bannersHome.length - 1;
    }

    renderizarSlide();
}

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

    botoes.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const paginaAlvo = btn.dataset.page;

            botoes.forEach(b => b.classList.toggle('active', b === btn));
            secoes.forEach(secao => secao.classList.toggle('active', secao.id === `${paginaAlvo}-page`));

            if (paginaAlvo === 'avisos') {
                renderizarStory();
            }
        });
    });
}

function configurarStories() {
    const lista = document.getElementById('stories-list');
    if (!lista) return;

    lista.innerHTML = Object.entries(storiesPorCategoria).map(([categoria, dados]) => `
        <button class="story-bubble ${categoria === categoriaAtual ? 'selected' : ''}" data-category="${categoria}" aria-label="Abrir stories de ${dados.nome}">
            <span class="story-ring"><i class="fa-solid ${dados.icone}"></i></span>
            <span>${dados.nome}</span>
        </button>
    `).join('');

    lista.addEventListener('click', evento => {
        const story = evento.target.closest('[data-category]');
        if (!story) return;
        categoriaAtual = story.dataset.category;
        storyAtual = 0;
        renderizarStory();
        iniciarStories();
    });

    const visualizador = document.getElementById('story-viewer');
    visualizador.addEventListener('pointerdown', evento => {
        inicioToqueX = evento.clientX;
    });
    visualizador.addEventListener('pointerup', evento => {
        const deslocamento = evento.clientX - inicioToqueX;
        if (Math.abs(deslocamento) >= 45) {
            mudarStory(deslocamento < 0 ? 1 : -1);
        }
    });

    renderizarStory();
    iniciarStories();
}

function mudarStory(direcao) {
    const totalStories = storiesPorCategoria[categoriaAtual].stories.length;
    storyAtual = (storyAtual + direcao + totalStories) % totalStories;
    renderizarStory();
    iniciarStories();
}

function iniciarStories() {
    window.clearInterval(intervaloStories);
    intervaloStories = window.setInterval(() => {
        mudarStory(1);
    }, 6000);
}

function renderizarStory() {
    const categoria = storiesPorCategoria[categoriaAtual];
    const aviso = categoria.stories[storyAtual];
    const visualizador = document.getElementById('story-viewer');
    const lista = document.getElementById('stories-list');
    if (!visualizador || !lista) return;

    const conteudoImagem = aviso.imagem
        ? `<div class="story-image story-image-fade" role="img" aria-label="${aviso.titulo}" style="background-image: url('${aviso.imagem}')"></div>`
        : '';
    const classeImagem = aviso.imagem ? ' image-story' : '';
    visualizador.className = `story-viewer${classeImagem}`;
    visualizador.innerHTML = `
        <div class="story-progress" id="story-progress">${categoria.stories.map((_, index) => `<span class="story-progress-bar ${index === storyAtual ? 'active' : ''}"></span>`).join('')}</div>
        ${conteudoImagem}
        <div class="story-copy">
            <h3>${aviso.titulo}</h3>
            <p>${aviso.texto}</p>
            <strong>${aviso.link}</strong>
        </div>
    `;
    lista.querySelectorAll('.story-bubble').forEach(item => item.classList.toggle('selected', item.dataset.category === categoriaAtual));
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
    renderizarOpcoesFavoritas(linhas);
    renderizarSentidosFavorita();
    renderizarProximosHorarios();
}

function configurarPainelFavorita() {
    const painel = document.getElementById('favorite-line-panel');
    const abrir = document.getElementById('abrir-favorita');
    const fechar = document.getElementById('fechar-favorita');
    const alterarSentido = document.getElementById('alterar-sentido');
    const verTodosHorarios = document.getElementById('ver-todos-horarios');
    if (!painel || !abrir || !fechar || !alterarSentido || !verTodosHorarios) return;

    abrir.addEventListener('click', () => {
        painel.hidden = false;
        document.body.classList.add('modal-open');
    });
    fechar.addEventListener('click', fecharPainelFavorita);
    alterarSentido.addEventListener('click', alternarSentidoFavorito);
    verTodosHorarios.addEventListener('click', abrirTodosHorarios);
    painel.addEventListener('click', evento => {
        if (evento.target === painel) fecharPainelFavorita();
    });
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape' && !painel.hidden) fecharPainelFavorita();
    });
}

function fecharPainelFavorita() {
    const painel = document.getElementById('favorite-line-panel');
    if (!painel) return;
    painel.hidden = true;
    document.body.classList.remove('modal-open');
}

function renderizarOpcoesFavoritas(linhas) {
    const container = document.getElementById('linhas-favoritas');
    if (!container) return;
    container.innerHTML = linhas.length ? linhas.map(linha => `
        <button type="button" class="favorite-line-option ${linha === linhaFavorita ? 'active' : ''}" data-favorite-line="${linha}">
            <i class="fa-solid fa-bus"></i><span>${linha}</span><i class="fa-solid fa-check"></i>
        </button>
    `).join('') : '<p class="aviso-temporario">Nenhuma linha disponível.</p>';
    container.querySelectorAll('[data-favorite-line]').forEach(opcao => opcao.addEventListener('click', () => {
        linhaFavorita = opcao.dataset.favoriteLine;
        sentidoFavorito = 0;
        localStorage.setItem('busflix-linha-favorita', linhaFavorita);
        localStorage.setItem('busflix-sentido-favorito', sentidoFavorito);
        renderizarOpcoesFavoritas(linhas);
        renderizarSentidosFavorita();
        renderizarProximosHorarios();
    }));
}

function renderizarSentidosFavorita() {
    const botao = document.getElementById('alterar-sentido');
    const rota = dadosGerais.find(item => item.linha === linhaFavorita && item.tipo_dia === obterTipoDiaAtual()) || dadosGerais.find(item => item.linha === linhaFavorita);
    const sentidos = rota?.saindo_de || [];
    if (sentidoFavorito >= sentidos.length) sentidoFavorito = 0;
    if (botao) {
        botao.hidden = !linhaFavorita || sentidos.length < 2;
        botao.title = sentidos.length > 1 ? `Alterar sentido: ${sentidos[sentidoFavorito]?.origem || ''} para ${sentidos[sentidoFavorito]?.destino || ''}` : '';
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
    if (subtitulo) subtitulo.textContent = sentido ? `${sentido.origem} → ${sentido.destino}` : 'Toque para configurar';
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
            <span><b>${item.origem}</b><small>Para ${item.destino}</small></span>
        </div>
    `).join('');
}

function abrirTodosHorarios() {
    if (!linhaFavorita) return;

    const botaoHorarios = document.querySelector('[data-page="horarios"]');
    if (botaoHorarios) botaoHorarios.click();
    fecharPainelFavorita();

    linhaAtual = linhaFavorita;
    tipoDiaAtual = obterTipoDiaAtual();
    saidaAtual = sentidoFavorito;

    const seletorLinha = document.getElementById('seletor-linha');
    const filtroDia = document.querySelector(`[data-day="${tipoDiaAtual}"]`);
    if (seletorLinha) seletorLinha.value = linhaAtual;
    document.querySelectorAll('.day-tab').forEach(item => item.classList.toggle('active', item === filtroDia));
    renderizarOpcoesSaida();
    renderizarHorariosSelecionados();
}