/* ==========================================
   BIGDIVO STUDIO — AYLA
   VIDRO CONGELADO + VÍDEO CINEMATOGRÁFICO
   ========================================== */

"use strict";

const canvas = document.getElementById("vidro");
const ctx = canvas.getContext("2d");

const instrucao = document.getElementById("instrucao");
const video = document.getElementById("video");

const imagemVidro = new Image();
imagemVidro.src = "imagens/vidro.png";

const PASSADAS = 7;
const DISTANCIA_POR_PASSADA = 0.70;

let largura = 0;
let altura = 0;

let limpando = false;
let ultimoPonto = null;

let distanciaTotal = 0;
let distanciaNecessaria = 0;

let finalizado = false;
let videoAutorizado = false;
let videoIniciado = false;

/* ==========================================
   PREPARAR VIDRO
   ========================================== */

function desenharImagemCover(img) {
  const escala = Math.max(
    largura / img.width,
    altura / img.height
  );

  const larguraImagem = img.width * escala;
  const alturaImagem = img.height * escala;

  const x = (largura - larguraImagem) / 2;
  const y = (altura - alturaImagem) / 2;

  ctx.drawImage(
    img,
    x,
    y,
    larguraImagem,
    alturaImagem
  );
}

function prepararVidro() {
  largura = window.innerWidth;
  altura = window.innerHeight;

  canvas.width = largura;
  canvas.height = altura;

  distanciaNecessaria =
    largura * DISTANCIA_POR_PASSADA * PASSADAS;

  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, largura, altura);

  if (imagemVidro.naturalWidth > 0) {
    desenharImagemCover(imagemVidro);
  }
}

imagemVidro.onload = prepararVidro;

/* ==========================================
   LIMPAR O VIDRO
   ========================================== */

function limparPonto(x, y) {
  const raio = Math.max(
    17,
    Math.min(29, largura * 0.055)
  );

  ctx.save();

  ctx.globalCompositeOperation = "destination-out";

  const pincel = ctx.createRadialGradient(
    x, y, raio * 0.30,
    x, y, raio
  );

  pincel.addColorStop(0, "rgba(0,0,0,1)");
  pincel.addColorStop(0.7, "rgba(0,0,0,0.95)");
  pincel.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = pincel;

  ctx.beginPath();
  ctx.arc(x, y, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function limparCaminho(x, y) {
  if (!ultimoPonto) {
    limparPonto(x, y);
    ultimoPonto = { x, y };
    return;
  }

  const distancia = Math.hypot(
    x - ultimoPonto.x,
    y - ultimoPonto.y
  );

  const passos = Math.max(
    1,
    Math.ceil(distancia / 5)
  );

  const origem = { ...ultimoPonto };

  for (let i = 1; i <= passos; i++) {
    const px =
      origem.x + (x - origem.x) * i / passos;

    const py =
      origem.y + (y - origem.y) * i / passos;

    limparPonto(px, py);
  }

  distanciaTotal += distancia;
  ultimoPonto = { x, y };

  if (
    distanciaTotal >= distanciaNecessaria &&
    !finalizado
  ) {
    finalizarVidro();
  }
}

/* ==========================================
   AUTORIZAR VÍDEO NO PRIMEIRO TOQUE
   ========================================== */

function autorizarVideo() {
  if (videoAutorizado) return;

  videoAutorizado = true;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  /*
    O play acontece durante o toque.
    O vídeo permanece invisível enquanto
    o convidado limpa o vidro.
  */

  const tentativa = video.play();

  if (tentativa && typeof tentativa.then === "function") {
    tentativa.catch(erro => {
      console.warn(
        "Primeira tentativa de reprodução:",
        erro
      );
    });
  }
}

/* ==========================================
   INTERAÇÃO COM O DEDO
   ========================================== */

canvas.addEventListener("pointerdown", e => {
  if (finalizado || imagemVidro.naturalWidth === 0) {
    return;
  }

  e.preventDefault();

  autorizarVideo();

  limpando = true;
  ultimoPonto = null;

  canvas.setPointerCapture(e.pointerId);

  limparCaminho(e.clientX, e.clientY);
});

canvas.addEventListener("pointermove", e => {
  if (!limpando || finalizado) return;

  e.preventDefault();

  limparCaminho(e.clientX, e.clientY);
});

function terminarToque() {
  limpando = false;
  ultimoPonto = null;
}

canvas.addEventListener("pointerup", terminarToque);
canvas.addEventListener("pointercancel", terminarToque);

/* ==========================================
   FINALIZAR LIMPEZA
   ========================================== */

async function finalizarVidro() {
  if (finalizado) return;

  finalizado = true;
  limpando = false;

  instrucao.classList.add("ocultar");
  canvas.classList.add("desaparecer");

  await esperar(1800);

  canvas.style.display = "none";
  instrucao.style.display = "none";

  await esperar(400);

  iniciarVideo();
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ==========================================
   MOSTRAR VÍDEO
   ========================================== */

async function iniciarVideo() {
  if (videoIniciado) return;

  videoIniciado = true;

  /*
    Reinicia para mostrar a primeira imagem
    das portas antes da animação.
  */

  try {
    video.currentTime = 0;
  } catch (erro) {
    console.warn("Não foi possível reiniciar:", erro);
  }

  video.classList.add("mostrar");

  try {
    await video.play();
  } catch (erro) {
    console.warn(
      "Reprodução automática bloqueada:",
      erro
    );

    /*
      Caso o navegador bloqueie,
      um toque adicional inicia o vídeo.
    */

    document.addEventListener(
      "pointerdown",
      () => {
        video.play().catch(console.warn);
      },
      { once: true }
    );
  }
}

/* ==========================================
   FINAL DO VÍDEO
   ========================================== */

video.addEventListener("ended", () => {
  video.pause();
});

/* ==========================================
   INICIALIZAÇÃO
   ========================================== */

if (
  imagemVidro.complete &&
  imagemVidro.naturalWidth > 0
) {
  prepararVidro();
}
