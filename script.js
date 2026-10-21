/* ==========================================
   BIGDIVO STUDIO
   AYLA — BAILE DE INVERNO ENCANTADO
   ========================================== */

const esperar = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const gelo = document.getElementById("gelo");
const ctx = gelo.getContext("2d", {
  willReadFrequently: true
});

const neve = document.getElementById("neve");
const neveCtx = neve.getContext("2d");

const musica = document.getElementById("musica");
const controleMusica = document.getElementById("controle-musica");
const instrucao = document.getElementById("instrucao");

const portas = document.getElementById("portas");
const jardim = document.getElementById("jardim");
const salao = document.getElementById("salao");
const final = document.getElementById("final");

let limpando = false;
let finalizado = false;
let iniciado = false;
let ultimoPonto = null;

let largura = 0;
let altura = 0;

const TAMANHO_BLOCO = 12;
const PORCENTAGEM_FINAL = 0.70;

let colunas = 0;
let linhas = 0;
let blocosLimpos = new Set();

/* ==========================================
   VIDRO EMBAÇADO
   ========================================== */

function prepararGelo() {
  largura = window.innerWidth;
  altura = window.innerHeight;

  gelo.width = largura;
  gelo.height = altura;

  colunas = Math.ceil(largura / TAMANHO_BLOCO);
  linhas = Math.ceil(altura / TAMANHO_BLOCO);

  blocosLimpos.clear();

  ctx.globalCompositeOperation = "source-over";

  // Base translúcida azul-gelo.
  const fundo = ctx.createLinearGradient(
    0, 0,
    largura, altura
  );

  fundo.addColorStop(0, "rgba(226,242,255,0.94)");
  fundo.addColorStop(0.45, "rgba(188,218,247,0.88)");
  fundo.addColorStop(1, "rgba(231,245,255,0.94)");

  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, largura, altura);

  // Névoa leitosa, simulando vidro embaçado.
  for (let i = 0; i < 85; i++) {
    const x = Math.random() * largura;
    const y = Math.random() * altura;
    const raio = 30 + Math.random() * 110;

    const nevoa = ctx.createRadialGradient(
      x, y, 0,
      x, y, raio
    );

    nevoa.addColorStop(
      0,
      "rgba(255,255,255,0.17)"
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

  // Cristais delicados nas bordas.
  for (let i = 0; i < 190; i++) {
    const lado = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (lado === 0) {
      x = Math.random() * largura;
      y = Math.random() * altura * 0.18;
    } else if (lado === 1) {
      x = Math.random() * largura;
      y = altura - Math.random() * altura * 0.18;
    } else if (lado === 2) {
      x = Math.random() * largura * 0.18;
      y = Math.random() * altura;
    } else {
      x = largura - Math.random() * largura * 0.18;
      y = Math.random() * altura;
    }

    const tamanho = 4 + Math.random() * 18;

    ctx.strokeStyle =
      `rgba(255,255,255,${0.15 + Math.random() * 0.4})`;

    ctx.lineWidth = 0.5 + Math.random();

    ctx.beginPath();

    ctx.moveTo(x - tamanho, y);
    ctx.lineTo(x + tamanho, y);

    ctx.moveTo(x, y - tamanho);
    ctx.lineTo(x, y + tamanho);

    ctx.moveTo(
      x - tamanho * 0.6,
      y - tamanho * 0.6
    );

    ctx.lineTo(
      x + tamanho * 0.6,
      y + tamanho * 0.6
    );

    ctx.moveTo(
      x + tamanho * 0.6,
      y - tamanho * 0.6
    );

    ctx.lineTo(
      x - tamanho * 0.6,
      y + tamanho * 0.6
    );

    ctx.stroke();
  }

  // Brilho congelado nas bordas.
  const borda = ctx.createRadialGradient(
    largura / 2,
    altura / 2,
    largura * 0.15,
    largura / 2,
    altura / 2,
    Math.max(largura, altura) * 0.75
  );

  borda.addColorStop(0, "rgba(255,255,255,0)");
  borda.addColorStop(1, "rgba(255,255,255,0.35)");

  ctx.fillStyle = borda;
  ctx.fillRect(0, 0, largura, altura);
}

/* ==========================================
   LIMPEZA COM O DEDO
   ========================================== */

function raioLimpeza() {
  return Math.max(
    19,
    Math.min(32, largura * 0.055)
  );
}

function limpar(x, y) {
  const raio = raioLimpeza();

  ctx.save();

  ctx.globalCompositeOperation = "destination-out";

  const pincel = ctx.createRadialGradient(
    x, y, raio * 0.45,
    x, y, raio
  );

  pincel.addColorStop(0, "rgba(0,0,0,1)");
  pincel.addColorStop(0.65, "rgba(0,0,0,0.95)");
  pincel.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = pincel;

  ctx.beginPath();
  ctx.arc(x, y, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  registrarAreaLimpa(x, y, raio);
}

/* ==========================================
   MEDIÇÃO DA ÁREA LIMPA
   ========================================== */

function registrarAreaLimpa(x, y, raio) {
  const inicioColuna = Math.max(
    0,
    Math.floor((x - raio) / TAMANHO_BLOCO)
  );

  const fimColuna = Math.min(
    colunas - 1,
    Math.floor((x + raio) / TAMANHO_BLOCO)
  );

  const inicioLinha = Math.max(
    0,
    Math.floor((y - raio) / TAMANHO_BLOCO)
  );

  const fimLinha = Math.min(
    linhas - 1,
    Math.floor((y + raio) / TAMANHO_BLOCO)
  );

  for (
    let linha = inicioLinha;
    linha <= fimLinha;
    linha++
  ) {
    for (
      let coluna = inicioColuna;
      coluna <= fimColuna;
      coluna++
    ) {
      const centroX =
        coluna * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;

      const centroY =
        linha * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;

      const distancia = Math.hypot(
        centroX - x,
        centroY - y
      );

      // Conta somente a região central do pincel.
      if (distancia <= raio * 0.65) {
        blocosLimpos.add(
          linha * colunas + coluna
        );
      }
    }
  }

  const total = colunas * linhas;

  if (
    !finalizado &&
    blocosLimpos.size / total >= PORCENTAGEM_FINAL
  ) {
    finalizarGelo();
  }
}

/* ==========================================
   MOVIMENTO CONTÍNUO DO DEDO
   ========================================== */

function limparCaminho(x, y) {
  if (!ultimoPonto) {
    limpar(x, y);
    ultimoPonto = { x, y };
    return;
  }

  const distancia = Math.hypot(
    x - ultimoPonto.x,
    y - ultimoPonto.y
  );

  const passos = Math.max(
    1,
    Math.ceil(distancia / 6)
  );

  const origem = { ...ultimoPonto };

  for (let i = 1; i <= passos; i++) {
    const px =
      origem.x + (x - origem.x) * i / passos;

    const py =
      origem.y + (y - origem.y) * i / passos;

    limpar(px, py);

    if (finalizado) break;
  }

  ultimoPonto = { x, y };
}

/* ==========================================
   INTERAÇÃO
   ========================================== */

gelo.addEventListener("pointerdown", e => {
  if (finalizado) return;

  e.preventDefault();

  limpando = true;

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
  limpando = false;
  ultimoPonto = null;
}

gelo.addEventListener("pointerup", terminarToque);
gelo.addEventListener("pointercancel", terminarToque);

/* ==========================================
   FINALIZAÇÃO DO GELO
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
   HISTÓRIA CINEMATOGRÁFICA
   ========================================== */

function ativarCena(cena) {
  document.querySelectorAll(".cena").forEach(
    elemento => elemento.classList.remove("ativa")
  );

  cena.classList.add("ativa");
}

async function iniciarHistoria() {
  // Aproximação das portas.
  portas.classList.add("aproximar");

  await esperar(5000);

  // Luz mágica na abertura.
  portas.classList.add("abrir");

  await esperar(2400);

  // Jardim encantado.
  ativarCena(jardim);

  await esperar(8000);

  // Salão de baile.
  ativarCena(salao);

  await esperar(7000);

  // Movimento para a direita.
  salao.classList.add("girar");

  await esperar(1800);

  // Moldura final.
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
    0,
    0,
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
   BOTÕES E JANELAS
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
prepararNeve();
animarNeve();

window.addEventListener("resize", () => {
  prepararNeve();

  // Não recria o gelo durante a limpeza.
  // Isso evita apagar as áreas já reveladas.
});
