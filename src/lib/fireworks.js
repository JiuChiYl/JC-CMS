const fireworksCanvas = document.querySelector('.fireworks');
const ctx = fireworksCanvas.getContext('2d');

let pointerX = 0;
let pointerY = 0;

const state = {
  darkMode: 'system'
};

const lightColors = ['102, 167, 221', '62, 131, 225', '33, 78, 194'];
const darkColors = ['252, 146, 174', '202, 180, 190', '207, 198, 255'];

const config = {
  colors: state.darkMode === 'dark' ? darkColors : lightColors,
  numberOfParticles: 20,
  orbitRadius: { min: 50, max: 100 },
  circleRadius: { min: 10, max: 20 },
  diffuseRadius: { min: 50, max: 100 },
  animeDuration: { min: 900, max: 1500 }
};

function setCanvasSize() {
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
  fireworksCanvas.style.width = `${window.innerWidth}px`;
  fireworksCanvas.style.height = `${window.innerHeight}px`;
}

function updateCoords(e) {
  pointerX = e.clientX;
  pointerY = e.clientY;
}

function setParticleDirection(p) {
  const angle = (anime.random(0, 360) * Math.PI) / 180;
  const value = anime.random(config.diffuseRadius.min, config.diffuseRadius.max);
  const radius = (Math.random() < 0.5 ? -1 : 1) * value;
  return {
    x: p.x + radius * Math.cos(angle),
    y: p.y + radius * Math.sin(angle)
  };
}

function createParticle(x, y) {
  const color = `rgba(${config.colors[anime.random(0, config.colors.length - 1)]},${anime.random(0.2, 0.8)})`;
  const radius = anime.random(config.circleRadius.min, config.circleRadius.max);
  const angle = anime.random(0, 360);
  const endPos = setParticleDirection({ x, y });

  return {
    x, y, color, radius, angle, endPos,
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius * Math.sin(Math.PI / 3), this.radius * Math.cos(Math.PI / 3));
      ctx.lineTo(-this.radius * Math.sin(Math.PI / 3), this.radius * Math.cos(Math.PI / 3));
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  };
}

function createCircle(x, y) {
  return {
    x, y,
    radius: 0.1,
    alpha: 0.5,
    lineWidth: 6,
    color: state.darkMode === 'dark' ? 'rgb(233, 179, 237)' : 'rgb(106, 159, 255)',
    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
      ctx.lineWidth = this.lineWidth;
      ctx.strokeStyle = this.color;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };
}

function renderParticle(anim) {
  anim.animatables.forEach(animatable => {
    if (typeof animatable.target.draw === 'function') {
      animatable.target.draw();
    }
  });
}


let activeFireworksCount = 0;

function animateParticles(x, y) {
  const circle = createCircle(x, y);
  const particles = Array.from({ length: config.numberOfParticles }, () => createParticle(x, y));

  activeFireworksCount++;

  anime.timeline({
    complete: () => {
      activeFireworksCount--;
      if (activeFireworksCount <= 0) {
        activeFireworksCount = 0;
        fireworksRender.pause();
        ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
      }
    }
  })
    .add({
      targets: particles,
      x(p) { return p.endPos.x },
      y(p) { return p.endPos.y },
      radius: 0,
      duration: anime.random(config.animeDuration.min, config.animeDuration.max),
      easing: 'easeOutExpo',
      update: renderParticle
    })
    .add({
      targets: circle,
      radius: anime.random(config.orbitRadius.min, config.orbitRadius.max),
      lineWidth: 0,
      alpha: {
        value: 0,
        easing: 'linear',
        duration: anime.random(600, 800)
      },
      duration: anime.random(1200, 1800),
      easing: 'easeOutExpo',
      update: renderParticle
    }, 0);
}

const fireworksRender = anime({
  duration: Infinity,
  autoplay: false,
  update: () => {
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  }
});

export function handleMouseDown(e) {
  if (activeFireworksCount === 0) fireworksRender.play();
  updateCoords(e);
  animateParticles(pointerX, pointerY);
}

// Wallpaper Engine settings - merge with existing listener
if (!window.wallpaperPropertyListener) {
  window.wallpaperPropertyListener = {};
}

const originalApplyUserProperties = window.wallpaperPropertyListener.applyUserProperties || function () { };

window.wallpaperPropertyListener.applyUserProperties = function (props) {
  originalApplyUserProperties(props);
  if (props.fireworks) {
    if (props.fireworks.value) {
      window.addEventListener('mousedown', handleMouseDown);
    } else {
      window.removeEventListener('mousedown', handleMouseDown);
    }
  }
  if (props.fireworkstheme) {
    updateTheme(props.fireworkstheme.value);
  }
};

const originalSetPaused = window.wallpaperPropertyListener.setPaused || function () { };
window.wallpaperPropertyListener.setPaused = function (isPaused) {
  originalSetPaused(isPaused);
  if (isPaused) {
    fireworksRender.pause();
  } else {
    if (activeFireworksCount > 0) fireworksRender.play();
  }
};

// Setup
window.addEventListener('resize', setCanvasSize);
setCanvasSize();

// Initial setup based on default value
// window.addEventListener('mousedown', handleMouseDown);

// Optional: watch for theme change (not reactive in pure HTML)
function updateTheme(theme) {
  if (theme === 'system') {
    state.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    state.darkMode = theme;
  }
  config.colors = state.darkMode === 'dark' ? darkColors : lightColors;
}

// Initial theme setup
updateTheme('system');

// Watch for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (state.darkMode === 'system') {
    updateTheme('system');
  }
});