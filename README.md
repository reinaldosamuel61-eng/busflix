# Busflix

<p align="center">
  <img src="img/iconebusapp.png" alt="Ícone do Busflix" width="120">
</p>

<p align="center">
  <strong>Informação simples para você se movimentar melhor por Caçapava.</strong>
</p>

<p align="center">
  <a href="#sobre-o-projeto">Sobre</a> &nbsp;&bull;&nbsp;
  <a href="#funcionalidades">Funcionalidades</a> &nbsp;&bull;&nbsp;
  <a href="#como-executar">Executar</a> &nbsp;&bull;&nbsp;
  <a href="#personalizacao">Personalização</a> &nbsp;&bull;&nbsp;
  <a href="#contato">Contato</a>
</p>

---

## Sobre o projeto

O **Busflix** é uma aplicação web responsiva para consulta de horários e informações do transporte público de Caçapava, São Paulo.

O projeto foi desenvolvido como parte do **Projeto Integrador (PI) do curso Técnico em Administração do SENAC**. É um projeto acadêmico, sem fins lucrativos e **sem vínculo com a empresa de ônibus Viação Cidade Natureza**.

> O Busflix é uma iniciativa acadêmica independente. As informações exibidas devem ser conferidas antes do uso, especialmente em situações de alteração de itinerário, feriados ou mudanças operacionais.

## Funcionalidades

- Consulta de horários por linha.
- Filtro por dias úteis, sábados e domingos/feriados.
- Seleção do sentido de viagem e ponto de saída.
- Área de próximos horários da linha favorita.
- Escolha e persistência de linha favorita.
- Saudação personalizada com o nome do usuário.
- Carrossel de banners na página inicial.
- Galeria de avisos e novidades com modal de detalhes.
- Navegação por menu inferior e gesto de deslizar entre páginas.
- Botão voltar do dispositivo com retorno para a Home.
- Confirmação de saída após duas tentativas de voltar na Home.
- Formulário de contato com o desenvolvedor integrado ao Formspree.
- Links de contato, endereço, WhatsApp, Facebook e Instagram.
- Modo claro e modo escuro.
- Aumento do tamanho da fonte.
- Instalação como Progressive Web App (PWA).
- Funcionamento offline dos arquivos principais após o primeiro carregamento, quando instalado ou servido por um ambiente compatível.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro, sem framework
- JSON para os dados de horários
- Service Worker para recursos de PWA e cache
- Font Awesome para os ícones
- Formspree para recebimento das mensagens do formulário

## Como executar

O projeto não possui dependências de npm. Para testar localmente, basta abrir o `index.html` no navegador. Porém, o uso de um servidor local é recomendado para que o `fetch` dos horários, o Service Worker e os recursos de PWA funcionem de forma mais consistente.

### Opção 1: VS Code

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**, caso ainda não tenha.
3. Clique com o botão direito em `index.html`.
4. Selecione **Open with Live Server**.

### Opção 2: Python

Com Python instalado, execute na pasta do projeto:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

Para encerrar o servidor, pressione `Ctrl + C` no terminal.

## Estrutura do projeto

```text
BusFlix/
├── app.js                 # Lógica da aplicação e interações
├── horarios.json          # Linhas, sentidos e horários
├── index.html             # Estrutura das telas e modais
├── style.css              # Estilos, responsividade e temas
├── manifest.json          # Configuração de instalação como PWA
├── sw.js                  # Service Worker e cache offline
├── documentos/            # Arquivos de apoio e fontes de dados
└── img/
    ├── banners/           # Imagens dos banners e avisos
    ├── iconebusapp.png    # Ícone principal do aplicativo
    ├── iconepequeno.png   # Favicon
    └── logoanimado.mp4    # Tela de abertura
```

## Personalização

### Horários

Os horários ficam em `horarios.json`. Cada registro representa uma linha e um tipo de dia:

```json
{
  "linha": "Nome da linha",
  "tipo_dia": "dias_uteis",
  "saindo_de": [
    {
      "origem": "Ponto de origem",
      "destino": "Destino",
      "horarios": [
        {
          "hora": "06:30",
          "observacao": "Informação do trajeto"
        }
      ]
    }
  ],
  "observacoes": []
}
```

Valores aceitos para `tipo_dia`:

- `dias_uteis`
- `sabados`
- `domingos_feriados`

Ao adicionar ou alterar horários, mantenha o JSON válido e preserve esses nomes de campos para que a aplicação consiga renderizar os dados.

### Banners da Home

Os banners são configurados no início de `app.js`, na constante `bannersHome`:

```javascript
{
    imagem: 'img/banners/meu-banner.png',
    link: '#avisos',
    alt: 'Descrição acessível da imagem'
}
```

A proporção recomendada para os banners é **16:7**, por exemplo `1600 x 700 px`.

### Avisos da galeria

Os itens da galeria ficam na constante `avisosGaleria`, também em `app.js`:

```javascript
{
    titulo: 'Título do aviso',
    texto: 'Descrição exibida no modal.',
    link: 'Texto complementar',
    imagem: 'img/banners/aviso.png'
}
```

As imagens da galeria usam proporção **2:3**, por exemplo `800 x 1200 px`.

## Formulário de contato

O formulário **Fale com o desenvolvedor** usa o endpoint do Formspree:

```text
https://formspree.io/f/mjgzykdp
```

O envio é feito via `fetch`, portanto o usuário permanece no modal e recebe uma mensagem de sucesso ou erro sem ser redirecionado para outra página.

Campos obrigatórios:

- Nome
- E-mail
- Assunto
- Mensagem

Para trocar o endpoint, altere o atributo `action` do formulário em `index.html`.

## PWA e cache

O arquivo `manifest.json` define o nome, ícone, cores e modo de exibição standalone do aplicativo.

O `sw.js` realiza o cache dos arquivos principais e permite que a aplicação carregue recursos essenciais mesmo sem conexão, depois do primeiro acesso bem-sucedido.

Durante o desenvolvimento em `localhost`, o próprio Busflix remove registros e caches antigos do Service Worker para evitar que alterações fiquem presas em uma versão anterior.

Se uma versão antiga continuar aparecendo em produção, atualize o cache do navegador ou altere `CACHE_NAME` em `sw.js` para publicar uma nova versão.

## Navegação e acessibilidade

- A navegação usa hashes como `#home`, `#horarios`, `#avisos`, `#contato` e `#sobre`.
- O histórico do navegador é atualizado ao trocar de página.
- O gesto horizontal é organizado assim:
  - Direita: Home → Avisos → Horários.
  - Esquerda: Home → Contato → Sobre.
- Modais podem ser fechados pelo botão de fechar, pelo fundo externo ou pela tecla `Esc`.
- Controles possuem rótulos acessíveis e os campos do formulário usam associação entre `label` e entrada.
- O tema e o tamanho da fonte escolhidos ficam salvos no `localStorage`.

## Contato institucional

- **E-mail:** [vt@cidadenatureza.com.br](mailto:vt@cidadenatureza.com.br)
- **Endereço:** R. Barreto Leme, 130 - Jardim Maria Cândida, Caçapava - SP, 12284-040
- **WhatsApp:** [+55 12 99705-6410](https://wa.me/5512997056410)
- **Facebook:** [Viação Cidade Natureza](https://www.facebook.com/profile.php?id=61561646206898)
- **Instagram:** [@viacaocidadenatureza](https://www.instagram.com/viacaocidadenatureza/)

## Desenvolvedor

- **GitHub:** [reinaldosamuel61-eng](https://github.com/reinaldosamuel61-eng)

## Licença e uso

Este repositório é um projeto acadêmico sem fins lucrativos. Os conteúdos, horários, imagens e documentos devem ser utilizados apenas conforme as autorizações e condições aplicáveis a cada material.

Antes de distribuir ou publicar o projeto, verifique as permissões de uso das imagens, documentos, marcas e informações de terceiros incluídos na aplicação.
