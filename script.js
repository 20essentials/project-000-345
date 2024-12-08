let html = document.documentElement;

class Bubble extends HTMLElement {
  width = html.getBoundingClientRect().width;
  height = html.getBoundingClientRect().height;
  bubbleWidth = 100;
  bubbleRadio = 50;
  x = this.getRandomPosition(this.width, 100);
  y = this.getRandomPosition(this.height, 100);
  dirX = 8;
  dirY = 8;

  constructor() {
    super();
    this.update = this.update.bind(this);
    this.attachShadow({ mode: 'open' });
  }

  get style() {
    return `  
    :host {
        --pink: #ff8deb;
        --violet: #945df9;
        --green: #5bd9c8;
        background: radial-gradient(circle 70px at 100% 0%, var(--pink) 70%, transparent), radial-gradient(circle 70px at 75% 25%, var(--violet) 70%, transparent), radial-gradient(circle 70px at 50% 50%, var(--green) 70%, transparent); 
        position: absolute;
        box-shadow: inset 0 0 0 4px black;
        display: block;
        width: ${this.bubbleWidth}px;
        height: ${this.bubbleWidth}px;
        background-color: transparent;
        border-radius: 50%;
        border: 2px solid #fff;
        transform: translate(${this.x}px, ${this.y}px);

        &::before {
          content: '';
          display: block;
          position: absolute;
          border-radius: inherit;
          background-color: red;
          background-color: transparent;
          width: 92%;
          height: 92%;
          border-left: 10px solid white;
          border-block: 8px solid transparent;
          top: 50%;
          filter: blur(1.5px);
          left: 50%;
          transform: translate(-50%, -50%) scale(.8) rotate(-40deg)
        }

        .top-bubble {
          position: absolute;
          width: 25%;
          height: 18%;
          background-color: white;
          filter: blur(2px);
          border-radius: 999px;
          
          &.top-bubble-1 {
            transform: rotate(32deg);
            right: 24%;
            top: 15%;
          }
          &.top-bubble-2 {
            transform: rotate(-115deg) scaleY(0.9);
            border-radius: 999px 800px / 999px 900px;
            right: 11%;
            width: 30%;
            top: 27%;
          }
        }
      }
    ;`;
  }

  drawBubble() {
    this.shadowRoot.innerHTML = `
      <style>${this.style}</style>
      <div class="top-bubble top-bubble-1"></div>
      <div class="top-bubble top-bubble-2"></div>
    `;
  }

  connectedCallback() {
    this.drawBubble();
    this.update();
  }

  getRandomPosition(max, min) {
    return Math.floor(Math.random() * (max - min * 2 + min));
  }

  update() {
    const { width, height } = html.getBoundingClientRect();

    if (this.x < 0) {
      this.dirX = -this.dirX;
    }
    if (this.x > width - this.bubbleWidth - 10) {
      this.dirX = -this.dirX;
    }
    if (this.y < 0) {
      this.dirY = -this.dirY;
    }
    if (this.y > height - this.bubbleWidth - 10) {
      this.dirY = -this.dirY;
    }

    if (this.x + 50 > width || this.y + 50 > height) {
      this.x = this.getRandomPosition(width, 100);
      this.y = this.getRandomPosition(height, 100);
    }

    this.x += this.dirX;
    this.y += this.dirY;

    this.drawBubble();

    requestAnimationFrame(this.update);
  }
}

customElements.define('bubble-element', Bubble);
let numberOfBubbles = 9;

const allBubbles = Array.from(
  { length: numberOfBubbles },
  (_, i) => new Bubble()
);

function getDistance(posX1, posY1, posX2, posY2) {
  return Math.sqrt(Math.pow(posX2 - posX1, 2) + Math.pow(posY2 - posY1, 2));
}

function resolveCollision(bubble1, bubble2) {
  const xVelocityDiff = bubble1.dirX - bubble2.dirX;
  const yVelocityDiff = bubble1.dirY - bubble2.dirY;

  const xDist = bubble2.x - bubble1.x;
  const yDist = bubble2.y - bubble1.y;

  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    const angle = -Math.atan2(bubble2.y - bubble1.y, bubble2.x - bubble1.x);

    const u1 = rotate({ x: bubble1.dirX, y: bubble1.dirY }, angle);
    const u2 = rotate({ x: bubble2.dirX, y: bubble2.dirY }, angle);

    const v1 = { x: u2.x, y: u1.y };
    const v2 = { x: u1.x, y: u2.y };

    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    bubble1.dirX = vFinal1.x;
    bubble1.dirY = vFinal1.y;
    bubble2.dirX = vFinal2.x;
    bubble2.dirY = vFinal2.y;
  }
}

function rotate(velocity, angle) {
  return {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };
}

function calculateDistance(bubble1, bubble2) {
  const distance = getDistance(bubble1.x, bubble1.y, bubble2.x, bubble2.y);

  if (distance < bubble1.bubbleRadio + bubble2.bubbleRadio) {
    resolveCollision(bubble1, bubble2);

    const overlap = bubble1.bubbleRadio + bubble2.bubbleRadio - distance;
    const angle = Math.atan2(bubble2.y - bubble1.y, bubble2.x - bubble1.x);

    bubble1.x -= (Math.cos(angle) * overlap) / 2;
    bubble1.y -= (Math.sin(angle) * overlap) / 2;

    bubble2.x += (Math.cos(angle) * overlap) / 2;
    bubble2.y += (Math.sin(angle) * overlap) / 2;
  }
}

function loop() {
  for (let i = 0; i < allBubbles.length; i++) {
    for (let j = i + 1; j < allBubbles.length; j++) {
      calculateDistance(allBubbles[i], allBubbles[j]);
    }
  }

  requestAnimationFrame(loop);
}

loop();

for (let bubble = 0; bubble < allBubbles.length; bubble++) {
  document.body.appendChild(allBubbles[bubble]);
}
