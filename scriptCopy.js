const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Variáveis
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let darkMode = false; // Modo escuro
let gameOver = false; // Estado de "Game Over"
let gameStarted = false; // Estado de "Jogo Iniciado"
let jumpSound;
let crouchSound;
let gameOverSound;
let backgroundMusic;
let musicStarted = false;

// Função para carregar a música de fundo
function loadBackgroundMusic() {
  backgroundMusic = new Audio('Musica de fundo (mp3cut.net) (1).mp3'); // Substitua pelo caminho da sua música
  backgroundMusic.loop = true; // Tocar em loop
  backgroundMusic.volume = 0.0085; // Ajustar o volume (30% do volume máximo)
}

// Função para iniciar a música de fundo
function startBackgroundMusic() {
  if (!musicStarted && backgroundMusic) {
    backgroundMusic.currentTime = 0; // Reinicia a música (para tocar do início)
    backgroundMusic.play().catch(error => {
      console.error('Erro ao reproduzir música de fundo:', error);
    });
    musicStarted = true; // Marca que a música foi iniciada
  }
}

// Event listener para a primeira interação do usuário
document.addEventListener('click', () => {
  startBackgroundMusic();
}, { once: true }); // O evento só será disparado uma vez

document.addEventListener('DOMContentLoaded', () => {
  loadBackgroundMusic();
});

document.addEventListener('click', () => {
  startBackgroundMusic();
}, { once: true });

document.addEventListener('keydown', () => {
  startBackgroundMusic();
}, { once: true });

document.addEventListener('touchstart', () => {
  startBackgroundMusic();
}, { once: true });


// Função para carregar os sons
function loadSounds() {
  jumpSound = new Audio('Mario Jump Sound Effect.mp3'); // Substitua pelo caminho do seu som de pulo
  crouchSound = new Audio('crouch.mp3'); // Substitua pelo caminho do seu som de abaixar
  gameOverSound = new Audio('gameOver.mp3'); // Substitua pelo caminho do seu som de game over

  // Ajustar o volume dos sons (opcional)
  jumpSound.volume = 0.007; 
  crouchSound.volume = 0.3;
  gameOverSound.volume = 0.1;
}

// URLs das imagens de fundo para modo claro e escuro
const cloudImageLight = new Image();
cloudImageLight.src = '7.png'; // Substitua pelo caminho da sua imagem de nuvens (modo claro)

const cloudImageDark = new Image();
cloudImageDark.src = '5.png'; // Substitua pelo caminho da sua imagem de nuvens (modo escuro)

const buildingImageLight = new Image();
buildingImageLight.src = '6.png'; // Substitua pelo caminho da sua imagem de prédios (modo claro)

const buildingImageDark = new Image();
buildingImageDark.src = '4.png'; // Substitua pelo caminho da sua imagem de prédios (modo escuro)

// URLs das imagens do personagem para modo claro e escuro
const playerImageLight = new Image();
playerImageLight.src = 'Colorful Clean Rainbow Storyboard Brainstorm (1).png'; // Substitua pelo caminho da sua imagem do personagem (modo claro)

const playerImageDark = new Image();
playerImageDark.src = 'pato.png'; // Substitua pelo caminho da sua imagem do personagem (modo escuro)

// Arrays de URLs das imagens para os obstáculos
const obstacleImagesLight = [
  'Colorful Clean Rainbow Storyboard Brainstorm (4).png',  // Substitua pelos URLs das imagens do modo claro
  'Colorful Clean Rainbow Storyboard Brainstorm (4).png',
  'Colorful Clean Rainbow Storyboard Brainstorm (4).png'
];

const obstacleImagesDark = [
  'lixoo.png',   // Substitua pelos URLs das imagens do modo escuro
  'lixoo.png',
  'lixoo.png'
];

// Carregar fontes personalizadas
const loadFonts = async () => {
  const font1 = new FontFace('Jersey 15', 'url(https://fonts.gstatic.com/s/jersey15/v1/ll0_K2aCJYbzasq7Z4v7yA.woff2)');
  const font2 = new FontFace('Alkatra', 'url(https://fonts.gstatic.com/s/alkatra/v1/ZgNQjP5MC7jJ7yF7zEfV.woff2)');

  try {
    await font1.load();
    await font2.load();
    document.fonts.add(font1);
    document.fonts.add(font2);
    console.log('Fontes carregadas com sucesso!');
  } catch (err) {
    console.error('Erro ao carregar fontes:', err);
  }
};

// Classes para os elementos de fundo
class BackgroundElement {
  constructor(image, speed, y) {
    this.image = image;
    this.speed = speed;
    this.y = y;
    this.width = canvas.width;
    this.height = canvas.height;

    // Criar múltiplas instâncias do fundo para cobrir a tela inteira
    this.instances = [
      { x: 0 },
      { x: canvas.width }
    ];
  }

  update() {
    for (let instance of this.instances) {
      instance.x -= this.speed;

      // Reposicionar a instância quando ela estiver quase saindo da tela
      if (instance.x <= -this.width) {
        instance.x = canvas.width;
      }
    }
  }

  draw() {
    for (let instance of this.instances) {
      ctx.drawImage(this.image, instance.x, this.y, this.width, this.height);
    }
  }

  setImage(newImage) {
    this.image = newImage;
  }
}

// Altura dos prédios no modo claro e escuro
const buildingHeightLight = canvas.height - 45; // Altura dos prédios no modo claro
const buildingHeightDark = canvas.height - 10; // Altura dos prédios no modo escuro

// Criar elementos de fundo
let clouds = new BackgroundElement(cloudImageLight, 1.5, 0); // Nuvens se movem mais devagar
let buildings = new BackgroundElement(buildingImageLight, 3, buildingHeightLight); // Prédios se movem mais rápido e ficam no chão

// Função para desenhar o fundo
function drawBackground() {
  // Definir a cor de fundo com base no modo escuro
  ctx.fillStyle = darkMode ? "#000000" : "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Desenhar as nuvens
  clouds.update();
  clouds.draw();

  // Aplicar desfoque nos prédios no modo escuro
  if (darkMode) {
    ctx.filter = "blur(1.25px)"; // Aplica um desfoque 
  } else {
    ctx.filter = "none"; // Remove o desfoque no modo claro
  }

  // Desenhar os prédios
  buildings.update();
  buildings.draw();

  // Resetar o filtro para evitar afetar outros elementos
  ctx.filter = "none";
}

// Função para alternar entre modo claro e escuro
function toggleDarkMode() {
  darkMode = !darkMode;

  // Alternar imagens de fundo
  clouds.setImage(darkMode ? cloudImageDark : cloudImageLight);
  buildings.setImage(darkMode ? buildingImageDark : buildingImageLight);

  // Atualizar a altura dos prédios com base no modo
  buildings.y = darkMode ? buildingHeightDark : buildingHeightLight;

  // Alternar imagens dos obstáculos
  changeObstaclesImage();

  // Alternar imagem do personagem
  player.setImage(darkMode);
}

// Alternar entre modo claro e escuro a cada 15 segundos
setInterval(() => {
  if (!gameOver && gameStarted) {
    toggleDarkMode();
  }
}, 15000); // 15 segundos

// Função para alterar as imagens dos obstáculos
function changeObstaclesImage() {
  const images = darkMode ? obstacleImagesDark : obstacleImagesLight;
  obstacles.forEach(obstacle => {
    let randomImage = images[Math.floor(Math.random() * images.length)];
    obstacle.image.src = randomImage;
  });
}

// Event Listeners
document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true;

  if (evt.code === 'KeyR' && gameOver) {
    RestartGame();
  }
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});

class Player {
  constructor(x, y, w, h, imgSrcLight, imgSrcDark) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dy = 0;
    this.jumpForce = 15;
    this.originalHeight = h;
    this.grounded = false;
    this.jumpTimer = 0;

    this.imageLight = new Image();
    this.imageLight.src = imgSrcLight;

    this.imageDark = new Image();
    this.imageDark.src = imgSrcDark;

    this.image = this.imageLight; // Inicialmente, use a imagem do modo claro
    this.imageLoaded = false;

    this.imageLight.onload = () => {
      this.imageLoaded = true;
    };
    this.imageDark.onload = () => {
      this.imageLoaded = true;
    };
  }

  Draw() {
    if (this.imageLoaded) {
      ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
  }

  Jump() {
    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;

      // Reproduzir o som de pulo
      if (jumpSound) {
        jumpSound.currentTime = 0; // Reinicia o som (para tocar novamente)
        jumpSound.play();
      }
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      this.jumpTimer++;
      this.dy = -this.jumpForce - (this.jumpTimer / 50);
    }
  }

  Animate() {
    if (keys['Space'] || keys['KeyW'] || keys['ArrowUp']) {
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    if (keys['ShiftLeft'] || keys['KeyS'] || keys['ArrowDown']) {
      this.h = this.originalHeight / 2;

      // Reproduzir o som de abaixar
      if (crouchSound) {
        crouchSound.currentTime = 0; // Reinicia o som (para tocar novamente)
        crouchSound.play();
      }
    } else {
      this.h = this.originalHeight;
    }

    this.y += this.dy;

    if (this.y + this.h < canvas.height) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.h;
    }

    this.Draw();
  }

  setImage(darkMode) {
    this.image = darkMode ? this.imageDark : this.imageLight;
  }
}

class Obstacle {
  constructor(x, y, w, h, imgSrc) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dx = -gameSpeed;

    this.image = new Image();
    this.image.src = imgSrc;

    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.imageLoaded = false;
  }

  Update() {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw() {
    if (this.imageLoaded) {
      ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
  }
}

class Text {
  constructor(t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = this.s + "px 'Jersey 15', sans-serif"; // Definindo a fonte Jersey 15 como padrão
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

function SpawnObstacle() {
  let size = RandomIntInRange(30, 80);
  let type = RandomIntInRange(0, 1);

  let randomImage = darkMode
    ? obstacleImagesDark[Math.floor(Math.random() * obstacleImagesDark.length)]
    : obstacleImagesLight[Math.floor(Math.random() * obstacleImagesLight.length)];

  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, randomImage);

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10;
  }
  obstacles.push(obstacle);
}

function RandomIntInRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

// Iniciar o jogo
function Start() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = "20px 'Jersey 15', sans-serif"; // Definindo a fonte Jersey 15 como padrão

  gameSpeed = 3;
  gravity = 1;

  score = 0;
  highscore = 0;
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  player = new Player(30, 0, 80, 80, playerImageLight.src, playerImageDark.src);

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");
}

function RestartGame() {
  gameStarted = true;
  gameOver = false;
  obstacles = [];
  score = 0;
  gameSpeed = 3;
  player.y = 0;
  player.dy = 0;
  player.grounded = false;

  requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

// Função para desenhar o score
function drawScore() {
  scoreText.c = darkMode ? "#FFFFFF" : "#212121"; // Branco no modo escuro, preto no modo claro
  scoreText.Draw();
}

// Função para desenhar o highscore
function drawHighscore() {
  highscoreText.c = darkMode ? "#FFFFFF" : "#212121"; // Branco no modo escuro, preto no modo claro
  highscoreText.Draw();
}

// Função principal de atualização do jogo
function Update() {
  if (gameOver) {
    // Parar a música de fundo
    // if (backgroundMusic) {
    //   backgroundMusic.pause();
    // }

    // Reproduzir o som de game over
    if (gameOverSound) {
      gameOverSound.currentTime = 0; // Reinicia o som (para tocar novamente)
      gameOverSound.play();
    }
    ctx.fillStyle = darkMode ? "#FFFFFF" : "#000000";
    ctx.textAlign = "center";

    // Definindo a fonte para "Game Over"
    ctx.font = "bold 80px 'Jersey 15', sans-serif";
    let gameOverText = "GAME OVER";
    ctx.fillText(gameOverText, canvas.width / 2, canvas.height / 2 - 30);

    // Definindo a fonte para "Pressione R..."
    ctx.font = "30px 'Alkatra', cursive";
    let pressRText = "Pressione R para tentar alcançar o verdadeiro locus amoenus novamente!";
    ctx.fillText(pressRText, canvas.width / 2, canvas.height / 2 + 30);

    return;
  }

  requestAnimationFrame(Update);

  // Desenhar o fundo
  drawBackground();

  if (--spawnTimer <= 0) {
    SpawnObstacle();
    spawnTimer = 200 - gameSpeed * 8;
    if (spawnTimer < 60) spawnTimer = 60;
  }

  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];
    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
    }
    if (
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
    ) {
      gameOver = true;
      obstacles = [];
      score = 0;
      spawnTimer = initialSpawnTimer;
      gameSpeed = 3;
      window.localStorage.setItem('highscore', highscore);
    }
    o.Update();
  }

  player.Animate();

  score++;
  scoreText.t = "Score: " + score;
  drawScore(); // Desenhar o score com a cor correta

  if (score > highscore) {
    highscore = score;
    highscoreText.t = "Highscore: " + highscore;
  }
  drawHighscore(); // Desenhar o highscore com a cor correta

  gameSpeed += 0.003;
}
// Função para desenhar texto com quebra de linha
function drawWrappedText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// Função para desenhar a página de início
function drawStartPage() {
  // Desenhar o fundo com as nuvens em movimento
  drawBackground();

  // Desenhar o título do jogo
  ctx.fillStyle = darkMode ? "#FFFFFF" : "#000000";
  ctx.textAlign = "center";
  ctx.font = "bold 70px 'Jersey 15', sans-serif";
  ctx.fillText("Bem-vindo ao Árcade Game!", canvas.width / 2, canvas.height / 2 - 180); // Título mais acima

  // Desenhar as frases explicativas
  ctx.font = "25px 'Alkatra', cursive";
  drawWrappedText(
    "Durante o arcadismo, havia o chamado 'fingimento árcade' - os temas da literatura eram apenas uma posição, um estado de espírito, e não a realidade dos poetas.",
    canvas.width / 2,
    canvas.height / 2 - 96, // Texto mais abaixo
    canvas.width - 100, // Largura máxima do texto
    35 // Altura da linha
  );

  ctx.font = "35px 'Alkatra', cursive";
  drawWrappedText(
    "Havia uma grande contradição entre a realidade do processo urbano e o mundo bucólico idealizado pelos autores.",
    canvas.width / 2,
    canvas.height / 2 + 20, // Texto mais abaixo
    canvas.width - 100,
    35
  );

  ctx.font = "25px 'Alkatra', cursive";
  drawWrappedText(
    "Esse jogo busca representar essa dualidade, assim, pule os obstáculos da vida no campo, da vida pastoril, e também os obstáculos dos centros urbanos buscando alcançar o verdadeiro locus amoenus.",
    canvas.width / 2,
    canvas.height / 2 + 130, // Texto mais abaixo
    canvas.width - 100,
    35
  );

  // Desenhar o botão de "play"
  drawPlayButton();
}

// Função para desenhar o botão de "play"
function drawPlayButton() {
  const buttonRadius = 40; // Tamanho do botão
  const buttonX = canvas.width / 2;
  const buttonY = canvas.height / 2 + 250; // Botão mais para baixo

  // Desenhar o círculo do botão
  ctx.beginPath();
  ctx.arc(buttonX, buttonY, buttonRadius, 0, Math.PI * 2);
  ctx.fillStyle = darkMode ? "#FFFFFF" : "#000000";
  ctx.fill();
  ctx.closePath();

  // Desenhar o triângulo de "play" dentro do botão
  ctx.beginPath();
  ctx.moveTo(buttonX - buttonRadius / 2, buttonY - buttonRadius / 2);
  ctx.lineTo(buttonX - buttonRadius / 2, buttonY + buttonRadius / 2);
  ctx.lineTo(buttonX + buttonRadius / 2, buttonY);
  ctx.fillStyle = darkMode ? "#000000" : "#FFFFFF";
  ctx.fill();
  ctx.closePath();
}

// Função para verificar se o clique foi dentro do botão de "play"
function isClickInsideButton(x, y) {
  const buttonRadius = 40;
  const buttonX = canvas.width / 2;
  const buttonY = canvas.height / 2 + 250; // Ajuste para a nova posição do botão

  const distance = Math.sqrt((x - buttonX) ** 2 + (y - buttonY) ** 2);
  return distance <= buttonRadius;
}

// Event listener para o clique do mouse
canvas.addEventListener('click', function (event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (!gameStarted && isClickInsideButton(mouseX, mouseY)) {
    StartGame(); // Iniciar o jogo e a música de fundo
  }
});

// Função para iniciar o jogo
function StartGame() {
  gameStarted = true;
  gameOver = false;
  obstacles = [];
  score = 0;
  gameSpeed = 3;
  player.y = 0;
  player.dy = 0;
  player.grounded = false;

  // // Iniciar a música de fundo após a interação do usuário
  // if (backgroundMusic) {
  //   backgroundMusic.currentTime = 0; // Reinicia a música (para tocar do início)
  //   backgroundMusic.play().catch(error => {
  //     console.error('Erro ao reproduzir música de fundo:', error);
  //   });
  // }

  requestAnimationFrame(Update);
}

// Função para desenhar a página de início e verificar se o jogo deve começar
function drawStartScreen() {
  if (!gameStarted) {
    drawStartPage();
    requestAnimationFrame(drawStartScreen);
  }
}

// Iniciar o carregamento das fontes, sons e música
loadFonts().then(() => {
  loadSounds(); // Carregar os efeitos sonoros
  loadBackgroundMusic(); // Carregar a música de fundo
  Start(); // Preparar o jogo
  drawStartScreen(); // Iniciar a página de início
}).catch(err => {
  console.error('Erro ao carregar fontes, sons ou música:', err);
});