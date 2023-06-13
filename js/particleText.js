let resized = false;

window.addEventListener('load', function () {
	const canvases = [...document.getElementsByClassName('particle-text')];
	canvases.forEach((canvas) => {
		const ctx = canvas.getContext('2d', {
			willReadFrequently: true,
		});

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		class Particle {
			constructor(text, x, y, color) {
				this.text = text;

				if (resized) {
					this.x = x;
					this.y = y;
				} else {
					this.x = canvas.width / 2;
					this.y = canvas.height / 2;
				}

				this.color = color;
				this.finalX = x;
				this.finalY = y;
				this.size = this.text.quality;
				this.dx = 0;
				this.dy = 0;
				this.vx = 0;
				this.vy = 0;
				this.force = 0;
				this.angle = 0;
				this.distance = 0;
				this.friction = Math.random() * 0.6 + 0.015;
				this.ease = Math.random() * 0.1 + 0.05;
			}

			draw() {
				this.text.context.fillStyle = this.color;
				// this.text.context.fillRect(this.x, this.y, this.size, this.size);
				this.text.context.beginPath();
				this.text.context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				this.text.context.fill();
			}

			update() {
				this.dx = this.text.mouse.x - this.x;
				this.dy = this.text.mouse.y - this.y - canvas.getBoundingClientRect().y;
				this.distance = this.dx * this.dx + this.dy * this.dy;

				if (this.distance < this.text.mouse.radius) {
					this.force = -this.text.mouse.radius / this.distance;
					if (this.force < -80) this.force = -80;

					this.angle = Math.atan2(this.dy, this.dx);
					this.vx += this.force * Math.cos(this.angle);
					this.vy += this.force * Math.sin(this.angle);
				}

				this.x += (this.vx *= this.friction) + (this.finalX - this.x) * this.ease;
				this.y += (this.vy *= this.friction) + (this.finalY - this.y) * this.ease;
			}
		}

		class ParticleText {
			constructor(context, canvasWidth, canvasHeight) {
				this.value = canvas.getAttribute('value');
				this.context = context;
				this.canvasWidth = canvasWidth;
				this.canvasHeight = canvasHeight;
				this.textX = this.canvasWidth / 2;
				this.textY = this.canvasHeight / 2;
				this.fontSize = 80;
				this.lineHeight = this.fontSize * 0.85;
				this.maxTextWidth = canvas.width * 0.85;

				this.particles = [];
				this.quality = parseInt(canvas.getAttribute('quality'));
				this.mouse = {
					radius: 10000,
					x: -1000,
					y: -1000,
				};

				window.addEventListener('mousedown', () => {
					this.mouse.radius = 500000;
					setTimeout(() => {
						this.mouse.radius = 10000;
					}, 50);
				});

				window.addEventListener('mousemove', (e) => {
					this.mouse.x = e.x;
					this.mouse.y = e.y;
				});

				window.addEventListener('mouseout', () => {
					this.mouse.x = -1000;
					this.mouse.y = -1000;
				});
			}

			breakLine(text) {
				// const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
				// gradient.addColorStop(0.3, 'red');
				// gradient.addColorStop(0.5, 'fuchsia');
				// gradient.addColorStop(0.7, 'purple');

				this.context.fillStyle = 'white'; // apply gradient here
				this.context.textAlign = 'center';
				this.context.textBaseline = 'middle';
				this.context.font = `${this.fontSize}px \'Fira Code\', monospace`;

				// break text into lines
				let linesArray = [];
				let words = text.split(' ');
				let lineCounter = 0;
				let line = '';

				for (let i = 0; i < words.length; i++) {
					let testLine = line + words[i] + ' ';

					if (this.context.measureText(testLine).width > this.maxTextWidth) {
						line = words[i] + ' ';
						lineCounter++;
					} else {
						line = testLine;
					}

					linesArray[lineCounter] = line;
				}

				let textHeight = this.lineHeight * lineCounter;
				this.textY = this.canvasHeight / 2 - textHeight / 2;

				linesArray.forEach((line, index) => {
					this.context.fillText(line, this.textX, this.textY + index * this.lineHeight);
				});

				this.convertToParticles();
			}

			convertToParticles() {
				this.particles.length = 0;
				const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
				this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

				for (let row = 0; row < this.canvasHeight; row += this.quality) {
					for (let col = 0; col < this.canvasWidth; col += this.quality) {
						const index = (row * this.canvasWidth + col) * 4;
						const alpha = pixels[index + 3];

						if (alpha > 0) {
							const red = pixels[index];
							const green = pixels[index + 1];
							const blue = pixels[index + 2];
							const color = `rgb(${red}, ${green}, ${blue})`;
							this.particles.push(new Particle(this, col, row, color));
						}
					}
				}
			}

			render() {
				this.particles.forEach((particle) => {
					particle.update();
					particle.draw();
				});
			}

			resize(width, height) {
				this.canvasWidth = width;
				this.canvasHeight = height;
				this.textX = this.canvasWidth / 2;
				this.textY = this.canvasHeight / 2;
				this.maxTextWidth = canvas.width * 0.8;
			}
		}

		const text = new ParticleText(ctx, canvas.width, canvas.height);
		text.breakLine(text.value);

		function animate() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			text.render();
			requestAnimationFrame(animate);
		}
		animate();

		window.addEventListener('resize', () => {
			resized = true;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			text.resize(canvas.width, canvas.height);
			text.breakLine(text.value);
		});
	});
});
