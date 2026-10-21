const esperar = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const gelo = document.getElementById("gelo");
const ctx = gelo.getContext("2d");

const neve = document.getElementById("neve");
const neveCtx = neve.getContext("2d");

const musica = document.getElementById("musica");

let limpando = false;
let movimentos = 0;
let iniciado = false;
let finalizado = false;

/* CONFIGURAÇÃO DO GELO */

function prepararGelo() {

  gelo.width = window.innerWidth;
  gelo.height = window.innerHeight;

  const gradiente = ctx.createLinearGradient(
    0, 0,
    gelo.width,
    gelo.height
  );

  gradiente.addColorStop(0, "#d9eaff");
  gradiente.addColorStop(.5, "#aac8e9");
  gradiente.addColorStop(1, "#e9f5ff");

  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, gelo.width, gelo.height);

  // Cristais congelados

  for (let i = 0; i < 230; i++) {

    const x = Math.random() * gelo.width;
    const y = Math.random() * gelo.height;

    const tamanho = Math.random() * 35 + 5;

    ctx.strokeStyle =
      `rgba(255,255,255,${Math.random() * .6})`;

    ctx.lineWidth = .7;

    ctx.beginPath();

    ctx.moveTo(x - tamanho, y);
    ctx.lineTo(x + tamanho, y);

    ctx.moveTo(x, y - tamanho);
    ctx.lineTo(x, y + tamanho);

    ctx.stroke();
  }

}

/* LIMPEZA COM O DEDO */

function limpar(x, y) {

  ctx.globalCompositeOperation =
    "destination-out";

  const raio = Math.max(
    45,
    window.innerWidth * .12
  );

  const gradiente = ctx.createRadialGradient(
    x, y, 0,
    x, y, raio
  );

  gradiente.addColorStop(0, "rgba(0,0,0,1)");
  gradiente.addColorStop(.65, "rgba(0,0,0,.9)");
  gradiente.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradiente;

  ctx.beginPath();
  ctx.arc(x, y, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation =
    "source-over";

}

gelo.addEventListener("pointerdown", e => {

  if (finalizado) return;

  limpando = true;

  gelo.setPointerCapture(e.pointerId);

  limpar(e.clientX, e.clientY);

  if (!iniciado) {

    iniciado = true;

    musica.volume = .35;

    musica.play().catch(() => {});

  }

});

gelo.addEventListener("pointermove", e => {

  if (!limpando || finalizado) return;

  limpar(e.clientX, e.clientY);

  movimentos++;

  if (movimentos > 35) {
    finalizarGelo();
  }

});

gelo.addEventListener("pointerup", () => {
  limpando = false;
});

gelo.addEventListener("pointercancel", () => {
  limpando = false;
});

/* REVELAÇÃO MÁGICA */

async function finalizarGelo() {

  if (finalizado) return;

  finalizado = true;

  document.getElementById("instrucao").remove();

  gelo.style.transition =
    "opacity 1.8s ease";

  gelo.style.opacity = "0";

  await esperar(1800);

  gelo.remove();

  iniciarCinema();

}

/* SEQUÊNCIA CINEMATOGRÁFICA */

async function iniciarCinema() {

  const portas = document.getElementById("portas");

  portas.classList.add("aproximar");

  await esperar(5000);

  portas.classList.add("abrir");

  await esperar(3500);

  mostrarCena("jardim");

  await esperar(8000);

  mostrarCena("salao");

  await esperar(7000);

  document
    .getElementById("salao")
    .classList.add("girar");

  await esperar(1700);

  mostrarCena("final");

}

/* TROCA DE CENAS */

function mostrarCena(id) {

  document.querySelectorAll(".cena")
    .forEach(cena => {
      cena.classList.remove("ativa");
    });

  document.getElementById(id)
    .classList.add("ativa");

}

/* NEVE CONTÍNUA */

let flocos = [];

function prepararNeve() {

  neve.width = window.innerWidth;
  neve.height = window.innerHeight;

  flocos = [];

  for (let i = 0; i < 85; i++) {

    flocos.push({

      x: Math.random() * neve.width,

      y: Math.random() * neve.height,

      raio: Math.random() * 2.5 + .5,

      velocidade: Math.random() * 1.1 + .3,

      oscilacao: Math.random() * 2

    });

  }

}

function animarNeve() {

  neveCtx.clearRect(
    0, 0,
    neve.width,
    neve.height
  );

  flocos.forEach(f => {

    neveCtx.beginPath();

    neveCtx.arc(
      f.x,
      f.y,
      f.raio,
      0,
      Math.PI * 2
    );

    neveCtx.fillStyle =
      "rgba(255,255,255,.75)";

    neveCtx.fill();

    f.y += f.velocidade;

    f.x += Math.sin(
      f.y * .01
    ) * .25;

    if (f.y > neve.height) {

      f.y = -10;
      f.x = Math.random() * neve.width;

    }

  });

  requestAnimationFrame(animarNeve);

}

/* JANELAS INTERATIVAS */

const conteudos = {

  confirmacao: {
    titulo: "Confirmação de Presença",
    texto: `
      <p>
        Informações para confirmação
        disponíveis em breve.
      </p>
    `
  },

  local: {
    titulo: "Local da Festa",
    texto: `
      <p>
        Local a definir.
      </p>
    `
  },

  presente: {
    titulo: "Sugestões de Presentes",
    texto: `
      <p>Perfumes e hidratantes</p>
      <p>Maquiagens e cosméticos</p>
      <p>Bijuterias e acessórios</p>
      <p>Bolsas e carteiras</p>
      <p>Kits de beleza e autocuidado</p>
    `
  },

  traje: {
    titulo: "Dress Code",
    texto: `
      <p><strong>Traje Social</strong></p>
      <br>
      <p>
        Mulheres: vestidos de festa
        ou conjuntos sociais elegantes.
      </p>
      <br>
      <p>
        Homens: camisa social,
        calça social e blazer opcional.
      </p>
    `
  }

};

function abrirModal(tipo) {

  const dados = conteudos[tipo];

  if (!dados) return;

  document.getElementById("modal-titulo")
    .textContent = dados.titulo;

  document.getElementById("modal-conteudo")
    .innerHTML = dados.texto;

  document.getElementById("modal")
    .classList.add("aberto");

}

function fecharModal() {

  document.getElementById("modal")
    .classList.remove("aberto");

}

document.getElementById("modal")
  .addEventListener("click", e => {

    if (e.target.id === "modal") {
      fecharModal();
    }

  });

/* CONTROLE DE MÚSICA */

function alternarMusica() {

  if (musica.paused) {

    musica.play().catch(() => {});

  } else {

    musica.pause();

  }

}

/* INICIALIZAÇÃO */

prepararGelo();
prepararNeve();
animarNeve();
