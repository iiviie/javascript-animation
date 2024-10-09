const canvas = document.getElementById('canvas');
        const c = canvas.getContext('2d');

        let score = 0;
        let gameRunning = false;
        let difficulty = 1;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const objects = [];

        const planetImage = new Image();
        planetImage.src = '/images/planetsprite.png';
        const collisionSound = new Audio('/sounds/collision.mp3');

        const planet = {
            x: center.x,
            y: center.y,
            radius: 30,
            health: 100,
            draw() {
                c.drawImage(planetImage, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            }
        };

        const debrisImage = new Image();
        debrisImage.src = '/images/debris.png';
        let debrisImageLoaded = false;
        debrisImage.onload = () => {
            debrisImageLoaded = true;
        };

        class Debris {
            constructor() {
                this.width = 50; 
                this.height = 50; 
                this.clickRadius = 40;
                this.setRandomPosition();
                this.speed = Math.random() * 0.5 + 0.5;
                this.zigzag = Math.random() < 0.3;
                this.zigzagAngle = 0;
                this.rotation = 0;
                this.rotationSpeed = Math.random() * 0.1 - 0.05;
            }

            setRandomPosition() {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.max(canvas.width, canvas.height);
                this.x = center.x + Math.cos(angle) * distance;
                this.y = center.y + Math.sin(angle) * distance;
            }

            update() {
                const dx = center.x - this.x;
                const dy = center.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                let moveX = (dx / distance) * this.speed * difficulty;
                let moveY = (dy / distance) * this.speed * difficulty;

                if (this.zigzag) {
                    this.zigzagAngle += 0.1;
                    const zigzagStrength = 2;
                    moveX += Math.sin(this.zigzagAngle) * zigzagStrength;
                    moveY += Math.cos(this.zigzagAngle) * zigzagStrength;
                }

                this.x += moveX;
                this.y += moveY;
                this.rotation += this.rotationSpeed;
            }

            draw() {
                if (debrisImageLoaded) {
                    c.save();
                    c.translate(this.x, this.y);
                    c.rotate(this.rotation);
                    c.drawImage(debrisImage, -this.width / 2, -this.height / 2, this.width, this.height);
                    c.restore();
                } else {
                    // Fallback to circle if image is  not loaded
                    c.beginPath();
                    c.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
                    c.fillStyle = 'gray';
                    c.fill();
                    c.closePath();
                }
            }
        }

        class Spaceship {
            constructor() {
                this.width = 40;
                this.height = 30;
                this.setRandomPosition();
                this.speed = Math.random() * 0.3 + 0.2;
                this.letter = ['W', 'A', 'S', 'D'][Math.floor(Math.random() * 4)];
            }

            setRandomPosition() {
                const side = Math.floor(Math.random() * 4);
                switch (side) {
                    case 0: this.x = Math.random() * canvas.width; this.y = -this.height; break;
                    case 1: this.x = canvas.width + this.width; this.y = Math.random() * canvas.height; break;
                    case 2: this.x = Math.random() * canvas.width; this.y = canvas.height + this.height; break;
                    case 3: this.x = -this.width; this.y = Math.random() * canvas.height; break;
                }
            }

            update() {
                const dx = center.x - this.x;
                const dy = center.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.x += (dx / distance) * this.speed * difficulty;
                this.y += (dy / distance) * this.speed * difficulty;
            }

            draw() {
                c.save();
                c.translate(this.x, this.y);

                const angle = Math.atan2(center.y - this.y, center.x - this.x);
                c.rotate(angle);
              
              
                // Draw spaceship body
                c.fillStyle = 'silver';
                c.beginPath();
                c.moveTo(this.width / 2, 0);
                c.lineTo(-this.width / 2, this.height / 3);
                c.lineTo(-this.width / 3, 0);
                c.lineTo(-this.width / 2, -this.height / 3);
                c.closePath();
                c.fill();

                // Draw cockpit
                c.fillStyle = 'red';
                c.beginPath();
                c.ellipse(this.width / 6, 0, this.width / 6, this.height / 4, 0, 0, Math.PI * 2);
                c.fill();

                // Draw letter
                c.fillStyle = 'white';
                c.textAlign = 'center';
                c.textBaseline = 'middle';

                c.fillText(this.letter, -this.width / 6, 0);

                c.restore();
            }
        }

        function spawnObjects() {
            if (Math.random() < 0.01 * difficulty) objects.push(new Debris());
            if (Math.random() < 0.005 * difficulty) objects.push(new Spaceship());
        }

        //draws the objects in the teh objects array
        function draw() {
            c.clearRect(0, 0, canvas.width, canvas.height);
            planet.draw();
            objects.forEach(obj => obj.draw());

            c.fillStyle = 'white';
            c.font = '20px Arial';
            c.textAlign = 'left';
            c.fillText(`Score: ${score}`, 10, 30);
            c.fillText(`Health: ${planet.health}`, 10, 60);
        }

        function update() {
            if (!gameRunning) {
                spawnObjects();
                objects.forEach(obj => obj.update());
                checkCollisions();
                difficulty += 0.00005;
            }
        }

        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop); //this thing is pretty cool
        }

        gameLoop();

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj instanceof Debris) {
                    const dx = obj.x - clickX;
                    const dy = obj.y - clickY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < obj.clickRadius) {
                        objects.splice(i, 1);
                        score += 10;
                        break;
                    }
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            if (['W', 'A', 'S', 'D'].includes(key)) {
                for (let i = objects.length - 1; i >= 0; i--) {
                    const obj = objects[i];
                    if (obj instanceof Spaceship && obj.letter === key) {
                        objects.splice(i, 1);
                        score += 20;
                        break;
                    }
                }
            }
        });


        //add collison detection and its implementation to the health of the planet
        function checkCollisions() {
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                const dx = obj.x - center.x;
                const dy = obj.y - center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < planet.radius + (obj.width / 2)) {
                    objects.splice(i, 1);
                    planet.health -= 10;
                    if (planet.health <= 0) gameRunning = true;
                }
            }
        }