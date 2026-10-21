/* =====================================
   BIGDIVO STUDIO — AYLA
   VIDRO CONGELADO INTERATIVO
   ===================================== */

"use strict";

const canvas = document.getElementById("vidro");
const ctx = canvas.getContext("2d");

const instrucao = document.getElementById("instrucao");
const video = document.getElementById("video");

const imagemVidro = new Image();
imagemVidro.src = "imagens/vidro.png";

/*
  Aproximadamente 7 passadas:
  cada passada equivale a percorrer
  cerca de 70% da largura da tela.
*/

const PASSADAS = 7;
const DISTANCIA_POR_PASSADA = 0.70;

let largura = 0;
let altura = 0;

let limpando = false;
let ultimoPonto = null;

let distanciaTotal = 0;
let distanciaNecessaria = 0;

let finalizado = false;
let videoPreparado = false;

/* =====================================
   PREPARAR A IMAGEM CONGELADA
   ===================================== */

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

  desenharImagemCover(imagemVidro);
}

imagemVidro.onload = prepararVidro;

imagemVidro.onerror = () => {
  console.error("Não foi possível carregar imagens/vidro.png");
};

/* =====================================
   LIMPAR O VIDRO COM O DEDO
   ===================================== */

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

/* =====================================
   INTERAÇÃO
   ===================================== */

canvas.addEventListener("pointerdown", e => {
  if (finalizado || !imagemVidro.complete) return;

  e.preventDefault();

  limpando = true;
  ultimoPonto = null;

  canvas.setPointerCapture(e.pointerId);

  limparCaminho(e.clientX, e.clientY);

  /*
    Prepara o vídeo durante a interação.
    A reprodução será iniciada depois.
  */

  if (!videoPreparado) {
    videoPreparado = true;

    video.muted = true;
    video.load();
  }
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

/* =====================================
   FINALIZAR O VIDRO
   ===================================== */

async function finalizarVidro() {
  if (finalizado) return;

  finalizado = true;
  limpando = false;

  instrucao.classList.add("ocultar");
  canvas.classList.add("desaparecer");

  await esperar(2000);

  canvas.style.display = "none";
  instrucao.style.display = "none";

  await esperar(500);

  iniciarVideo();
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* =====================================
   INICIAR VÍDEO
   ===================================== */

async function iniciarVideo() {
  video.currentTime = 0;
  video.muted = true;

  video.classList.add("mostrar");

  try {
    await video.play();
  } catch (erro) {
    console.warn(
      "O navegador bloqueou a reprodução automática:",
      erro
    );
  }
}

/* =====================================
   QUANDO O VÍDEO TERMINAR
   ===================================== */

video.addEventListener("ended", () => {
  /*
    Mantém o vídeo visível no último quadro.
  */
  video.pause();
});

/* =====================================
   INICIALIZAÇÃO
   ===================================== */

if (imagemVidro.complete && imagemVidro.naturalWidth > 0) {
  prepararVidro();
     }
