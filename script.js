/* ==========================================
   BIGDIVO STUDIO
   AYLA — BAILE DE INVERNO ENCANTADO
   JAVASCRIPT COMPLETO
   ========================================== */

"use strict";

/* ==========================================
   ELEMENTOS
   ========================================== */

const esperar = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const gelo = document.getElementById("gelo");
const ctx = gelo.getContext("2d");

const neve = document.getElementById("neve");
const neveCtx = neve.getContext("2d");

const musica = document.getElementById("musica");
const controleMusica = document.getElementById("controle-musica");
const instrucao = document.getElementById("instrucao");

const portas = document.getElementById("portas");
const jardim = document.getElementById("jardim");
const salao = document.getElementById("salao");
const final = document.getElementById("final");

/* ==========================================
   CONFIGURAÇÕES DA ABERTURA
   ========================================== */

const PASSADAS_NECESSARIAS = 7;
const DISTANCIA_MINIMA = 0.25;

let passadas = 0;
let distanciaDaPassada = 0;

let limpando = false;
let finalizado = false;
let iniciado = false;
let ultimoPonto = null;

let largura = 0;
let altura = 0;

/* ==========================================
   PREPARAÇÃO DO VIDRO
   ========================================== */

function prepararGelo() {
  largura = window.innerWidth;
  altura = window.innerHeight;

  gelo.width = largura;
  gelo.height = altura;

  ctx.clearRect(0, 0, largura, altura);

  /*
    Vidro embaçado:
    fundo branco-azulado translúcido.
  */

  const fundo = ctx.createLinearGradient(
    0, 0,
    largura, altura
  );

  fundo.addColorStop(
    0,
    "rgba(238,247,255,0.90)"
  );

  fundo.addColorStop(
    0.5,
    "rgba(207,229,248,0.83)"
  );

  fundo.addColorStop(
    1,
    "rgba(239,248,255,0.91)"
  );

  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, largura, altura);

  /*
    Condensação suave:
    manchas irregulares de névoa.
  */

  for (let i = 0; i < 120; i++) {
    const x = Math.random() * largura;
    const y = Math.random() * altura;
    const raio = 25 + Math.random() * 95;

    const nevoa = ctx.createRadialGradient(
      x, y, 0,
      x, y, raio
    );

    nevoa.addColorStop(
      0,
      "rgba(255,255,255,0.23)"
    );

    nevoa.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle = nevoa;

    ctx.fillRect(
      x - raio,
      y - raio,
      raio * 2,
      raio * 2
    );
  }

  /*
    Geada concentrada nas bordas.
  */

  for (let i = 0; i < 230; i++) {
    const lado = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (lado === 0) {
      x = Math.random() * largura;
      y = Math.random() * altura * 0.13;
    } else if (lado === 1) {
      x = Math.random() * largura;
      y = altura - Math.random() * altura * 0.13;
    } else if (lado === 2) {
      x = Math.random() * largura * 0.13;
      y = Math.random() * altura;
    } else {
      x = largura - Math.random() * largura * 0.13;
      y = Math.random() * altura;
    }

    const tamanho = 2 + Math.random() * 12;

    ctx.strokeStyle =
      `rgba(255,255,255,${0.12 + Math.random() * 0.35})`;

    ctx.lineWidth = 0.5 + Math.random() * 0.7;

    ctx.beginPath();

    ctx.moveTo(x - tamanho, y);
    ctx.lineTo(x + tamanho, y);

    ctx.moveTo(x, y - tamanho);
    ctx.lineTo(x, y + tamanho);

    ctx.stroke();
  }

  /*
    Vinheta de gelo nas extremidades.
  */

  const vinheta = ctx.createRadialGradient(
    largura / 2,
    altura / 2,
    largura * 0.12,
    largura / 2,
    altura / 2,
    Math.max(largura, altura) * 0.7
  );

  vinheta.addColorStop(
    0,
    "rgba(255,255,255,0)"
  );

  vinheta.addColorStop(
    1,
    "rgba(240,250,255,0.45)"
  );

  ctx.fillStyle = vinheta;
  ctx.fillRect(0, 0, largura, altura);
}

/* ==========================================
   LIMPEZA DO VIDRO
   ========================================== */

function raioLimpeza() {
  return Math.max(
    18,
    Math.min(27, largura * 0.052)
  );
}

function limpar(x, y) {
  const raio = raioLimpeza();

  ctx.save();

  ctx.globalCompositeOperation = "destination-out";

  const pincel = ctx.createRadialGradient(
    x, y, raio * 0.35,
    x, y, raio
  );

  pincel.addColorStop(
    0,
    "rgba(0,0,0,1)"
  );

  pincel.addColorStop(
    0.65,
    "rgba(0,0,0,0.95)"
  );

  pincel.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  ctx.fillStyle = pincel;

  ctx.beginPath();
  ctx.arc(x, y, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function limparCaminho(x, y) {
  if (!ultimoPonto) {
    limpar(x, y);
    ultimoPonto = { x, y };
    return;
  }

  const origem = { ...ultimoPonto };

  const distancia = Math.hypot(
    x - origem.x,
    y - origem.y
  );

  distanciaDaPassada += distancia;

  const passos = Math.max(
    1,
    Math.ceil(distancia / 5)
  );

  for (let i = 1; i <= passos; i++) {
    const px =
      origem.x + (x - origem.x) * i / passos;

    const py =
      origem.y + (y - origem.y) * i / passos;

    limpar(px, py);
  }

  ultimoPonto = { x, y };
}

/* ==========================================
   INTERAÇÃO COM O DEDO
   ========================================== */

gelo.addEventListener("pointerdown", e => {
  if (finalizado) return;

  e.preventDefault();

  limpando = true;
  distanciaDaPassada = 0;
  ultimoPonto = null;

  gelo.setPointerCapture(e.pointerId);

  limparCaminho(e.clientX, e.clientY);

  if (!iniciado) {
    iniciado = true;

    musica.volume = 0.35;
    musica.play().catch(() => {});
  }
});

gelo.addEventListener("pointermove", e => {
  if (!limpando || finalizado) return;

  e.preventDefault();

  limparCaminho(e.clientX, e.clientY);
});

function terminarToque() {
  if (!limpando || finalizado) return;

  limpando = false;
  ultimoPonto = null;

  /*
    Só conta como passada quando
    o dedo percorre uma distância
    de pelo menos 25% da largura.
  */

  if (
    distanciaDaPassada >=
    window.innerWidth * DISTANCIA_MINIMA
  ) {
    passadas++;
  }

  distanciaDaPassada = 0;

  if (passadas >= PASSADAS_NECESSARIAS) {
    finalizarGelo();
  }
}

gelo.addEventListener("pointerup", terminarToque);
gelo.addEventListener("pointercancel", terminarToque);

/* ==========================================
   FINALIZAÇÃO DO VIDRO
   ========================================== */

async function finalizarGelo() {
  if (finalizado) return;

  finalizado = true;
  limpando = false;

  instrucao.classList.add("ocultar");
  gelo.classList.add("desaparecer");

  await esperar(2300);

  gelo.remove();
  instrucao.remove();

  iniciarHistoria();
}

/* ==========================================
   PREPARAÇÃO DAS PORTAS
   ========================================== */

function prepararPortas() {
  /*
    Mantemos a imagem original como
    cenário e criamos duas folhas
    que simulam a abertura.
  */

  if (portas.querySelector(".folha-porta")) return;

  const fundoJardim = document.createElement("div");
  fundoJardim.className = "jardim-atras";

  const esquerda = document.createElement("div");
  esquerda.className = "folha-porta esquerda";

  const direita = document.createElement("div");
  direita.className = "folha-porta direita";

  portas.appendChild(fundoJardim);
  portas.appendChild(esquerda);
  portas.appendChild(direita);
}

/* ==========================================
   CENAS CINEMATOGRÁFICAS
   ========================================== */

function ativarCena(cena) {
  document.querySelectorAll(".cena").forEach(
    elemento => elemento.classList.remove("ativa")
  );

  cena.classList.add("ativa");
}

async function iniciarHistoria() {
  portas.classList.add("aproximar");

  await esperar(5000);

  portas.classList.add("abrir");

  await esperar(3000);

  ativarCena(jardim);

  await esperar(8000);

  ativarCena(salao);

  await esperar(7000);

  salao.classList.add("girar");

  await esperar(1800);

  ativarCena(final);

  await esperar(1600);

  final.classList.add("mostrar-conteudo");
}

/* ==========================================
   NEVE CONTÍNUA
   ========================================== */

let flocos = [];

function prepararNeve() {
  neve.width = window.innerWidth;
  neve.height = window.innerHeight;

  flocos = [];

  const quantidade = Math.min(
    90,
    Math.floor(neve.width * 0.2)
  );

  for (let i = 0; i < quantidade; i++) {
    flocos.push({
      x: Math.random() * neve.width,
      y: Math.random() * neve.height,
      raio: 0.6 + Math.random() * 2,
      velocidade: 0.3 + Math.random() * 1.1,
      oscilacao: Math.random() * Math.PI * 2
    });
  }
}

function animarNeve() {
  neveCtx.clearRect(
    0, 0,
    neve.width,
    neve.height
  );

  for (const floco of flocos) {
    floco.y += floco.velocidade;

    floco.x += Math.sin(
      floco.oscilacao + floco.y * 0.01
    ) * 0.25;

    if (floco.y > neve.height) {
      floco.y = -5;
      floco.x = Math.random() * neve.width;
    }

    neveCtx.beginPath();

    neveCtx.arc(
      floco.x,
      floco.y,
      floco.raio,
      0,
      Math.PI * 2
    );

    neveCtx.fillStyle =
      "rgba(255,255,255,0.75)";

    neveCtx.fill();
  }

  requestAnimationFrame(animarNeve);
}

/* ==========================================
   BOTÕES INTERATIVOS
   ========================================== */

const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modal-titulo");
const modalTexto = document.getElementById("modal-texto");

const conteudos = {
  confirmacao: {
    titulo: "Confirmação",
    texto: `
      <p>
        Informações para confirmação
        disponíveis em breve.
      </p>
    `
  },

  local: {
    titulo: "Localização",
    texto: `
      <p>
        O local do Baile de Inverno
        Encantado será informado em breve.
      </p>
    `
  },

  presentes: {
    titulo: "Sugestões de Presentes",
    texto: `
      <p>
        Perfumes, skincare, cosméticos,
        acessórios, bolsas e kits de beleza.
      </p>
    `
  },

  traje: {
    titulo: "Dress Code",
    texto: `
      <p><strong>Traje Social</strong></p>
      <p>
        Mulheres: vestidos ou produções elegantes.
      </p>
      <p>
        Homens: camisa e calça social.
        Blazer opcional.
      </p>
    `
  }
};

document.querySelectorAll(".botao").forEach(botao => {
  botao.addEventListener("click", () => {
    const tipo = botao.dataset.modal;
    const conteudo = conteudos[tipo];

    if (!conteudo) return;

    modalTitulo.textContent = conteudo.titulo;
    modalTexto.innerHTML = conteudo.texto;

    modal.classList.remove("oculto");
  });
});

function fecharModal() {
  modal.classList.add("oculto");
}

document.getElementById("fechar-modal")
  .addEventListener("click", fecharModal);

document.querySelector(".modal-fundo")
  .addEventListener("click", fecharModal);

/* ==========================================
   CONTROLE DA MÚSICA
   ========================================== */

controleMusica.addEventListener("click", () => {
  if (musica.paused) {
    musica.play().catch(() => {});
  } else {
    musica.pause();
  }
});

/* ==========================================
   INICIALIZAÇÃO
   ========================================== */

prepararGelo();
prepararPortas();
prepararNeve();
animarNeve();

window.addEventListener("resize", prepararNeve);
