/* ============================================
   Rose Day 3D Website - Main JavaScript
   ============================================ */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initFloatingPetals();
    initScrollAnimations();
    initButtonEffects();
    initCardAnimations();
});

/* ============================================
   Three.js 3D Rose
   ============================================ */
function initThreeJS() {
    const canvas = document.getElementById('rose-canvas');
    const container = document.getElementById('rose-container');

    if (!canvas || !container) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    camera.position.y = 0.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfce7f3, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffc0cb, 0.4);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xff69b4, 0.5);
    rimLight.position.set(0, 5, -3);
    scene.add(rimLight);

    // Rose group
    const roseGroup = new THREE.Group();
    scene.add(roseGroup);

    // Rose materials
    const petalMaterial = new THREE.MeshStandardMaterial({
        color: 0xe63971,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    const innerPetalMaterial = new THREE.MeshStandardMaterial({
        color: 0xc9184a,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
        roughness: 0.6,
        metalness: 0.05
    });

    // Create layered petals
    function createPetal(scale, curveIntensity) {
        const shape = new THREE.Shape();
        const width = 0.5 * scale;
        const height = 0.8 * scale;

        shape.moveTo(0, 0);
        shape.bezierCurveTo(
            width * 0.8, height * 0.3,
            width, height * 0.8,
            0, height
        );
        shape.bezierCurveTo(
            -width, height * 0.8,
            -width * 0.8, height * 0.3,
            0, 0
        );

        const extrudeSettings = {
            depth: 0.02,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 3
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Add curve to petal
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            const curve = Math.sin((y / height) * Math.PI) * curveIntensity;
            positions.setZ(i, positions.getZ(i) + curve);
        }
        geometry.computeVertexNormals();

        return geometry;
    }

    // Inner petals (tighter, darker)
    for (let layer = 0; layer < 3; layer++) {
        const petalsInLayer = 5 + layer * 2;
        const layerRadius = 0.1 + layer * 0.15;
        const layerHeight = 0.3 - layer * 0.1;

        for (let i = 0; i < petalsInLayer; i++) {
            const angle = (i / petalsInLayer) * Math.PI * 2 + layer * 0.3;
            const petalGeometry = createPetal(0.4 + layer * 0.1, 0.15 + layer * 0.05);
            const petal = new THREE.Mesh(petalGeometry, layer < 2 ? innerPetalMaterial : petalMaterial);

            petal.position.x = Math.cos(angle) * layerRadius;
            petal.position.z = Math.sin(angle) * layerRadius;
            petal.position.y = layerHeight;

            petal.rotation.y = -angle + Math.PI / 2;
            petal.rotation.x = -0.3 - layer * 0.2;
            petal.rotation.z = (Math.random() - 0.5) * 0.2;

            roseGroup.add(petal);
        }
    }

    // Outer petals (larger, more open)
    for (let layer = 0; layer < 3; layer++) {
        const petalsInLayer = 8 + layer * 2;
        const layerRadius = 0.5 + layer * 0.3;
        const layerHeight = -layer * 0.15;

        for (let i = 0; i < petalsInLayer; i++) {
            const angle = (i / petalsInLayer) * Math.PI * 2 + layer * 0.2;
            const petalGeometry = createPetal(0.6 + layer * 0.15, 0.2 + layer * 0.1);
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);

            petal.position.x = Math.cos(angle) * layerRadius;
            petal.position.z = Math.sin(angle) * layerRadius;
            petal.position.y = layerHeight;

            petal.rotation.y = -angle + Math.PI / 2;
            petal.rotation.x = -0.8 - layer * 0.3;
            petal.rotation.z = (Math.random() - 0.5) * 0.3;

            roseGroup.add(petal);
        }
    }

    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 2, 16);
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -1.2;
    roseGroup.add(stem);

    // Sepal (green leaves at base of flower)
    const sepalMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5a27,
        roughness: 0.5,
        metalness: 0.05,
        side: THREE.DoubleSide
    });

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const sepalShape = new THREE.Shape();
        sepalShape.moveTo(0, 0);
        sepalShape.bezierCurveTo(0.1, 0.2, 0.05, 0.4, 0, 0.5);
        sepalShape.bezierCurveTo(-0.05, 0.4, -0.1, 0.2, 0, 0);

        const sepalGeometry = new THREE.ExtrudeGeometry(sepalShape, {
            depth: 0.02,
            bevelEnabled: false
        });
        const sepal = new THREE.Mesh(sepalGeometry, sepalMaterial);
        sepal.position.x = Math.cos(angle) * 0.15;
        sepal.position.z = Math.sin(angle) * 0.15;
        sepal.position.y = -0.2;
        sepal.rotation.y = -angle;
        sepal.rotation.x = -1.2;
        roseGroup.add(sepal);
    }

    // Position rose
    roseGroup.rotation.x = 0.3;
    roseGroup.position.y = 0.3;

    // Mouse & Touch interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let lastTouchX = 0;
    let lastTouchY = 0;

    // Mouse events
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    });

    container.addEventListener('mouseleave', () => {
        mouseX = 0;
        mouseY = 0;
    });

    // Touch events for mobile
    container.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            isDragging = true;
            lastTouchX = event.touches[0].clientX;
            lastTouchY = event.touches[0].clientY;
        }
    }, { passive: true });

    container.addEventListener('touchmove', (event) => {
        if (isDragging && event.touches.length === 1) {
            const deltaX = event.touches[0].clientX - lastTouchX;
            const deltaY = event.touches[0].clientY - lastTouchY;
            mouseX += deltaX * 0.005;
            mouseY += deltaY * 0.005;
            mouseX = Math.max(-1, Math.min(1, mouseX));
            mouseY = Math.max(-1, Math.min(1, mouseY));
            lastTouchX = event.touches[0].clientX;
            lastTouchY = event.touches[0].clientY;
        }
    }, { passive: true });

    container.addEventListener('touchend', () => {
        isDragging = false;
        // Slowly return to center
        setTimeout(() => {
            mouseX *= 0.5;
            mouseY *= 0.5;
        }, 500);
    }, { passive: true });

    // Enhanced Animation
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.015;

        // Smooth rotation towards mouse/touch input
        targetRotationY = mouseX * 0.6;
        targetRotationX = 0.3 + mouseY * 0.4;

        roseGroup.rotation.y += (targetRotationY - roseGroup.rotation.y) * 0.03;
        roseGroup.rotation.x += (targetRotationX - roseGroup.rotation.x) * 0.03;

        // Enhanced floating animation with subtle wobble
        roseGroup.position.y = 0.3 + Math.sin(time) * 0.08 + Math.sin(time * 1.5) * 0.02;
        roseGroup.position.x = Math.sin(time * 0.5) * 0.03;

        // Gentle continuous rotation
        roseGroup.rotation.y += 0.003;

        // Subtle petal breathing effect
        const breathe = 1 + Math.sin(time * 0.8) * 0.02;
        roseGroup.scale.set(breathe, breathe, breathe);

        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);
}

/* ============================================
   Falling Hearts Background (Cherry Blossom Style)
   ============================================ */
function initFloatingPetals() {
    const container = document.getElementById('petals-container');
    if (!container) return;

    const heartsCount = 25;

    for (let i = 0; i < heartsCount; i++) {
        createFallingHeart(container, i);
    }
}

function createFallingHeart(container, index) {
    const heart = document.createElement('div');
    heart.className = 'floating-petal';

    // Random properties for natural falling effect
    const size = 12 + Math.random() * 14;
    const left = Math.random() * 100;
    const delay = Math.random() * 20;
    const duration = 8 + Math.random() * 12;
    const swayAmount = 20 + Math.random() * 40;

    heart.style.cssText = `
        left: ${left}%;
        font-size: ${size}px;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        --sway: ${swayAmount}px;
    `;

    container.appendChild(heart);
}

/* ============================================
   Scroll Animations
   ============================================ */
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    reveals.forEach(reveal => observer.observe(reveal));

    // Parallax effect on scroll
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');

    if (hero && scrolled < window.innerHeight) {
        const opacity = 1 - (scrolled / window.innerHeight) * 0.5;
        const translateY = scrolled * 0.3;
        hero.style.transform = `translateY(${translateY}px)`;
        hero.style.opacity = opacity;
    }
}

/* ============================================
   Card Hover Animations
   ============================================ */
function initCardAnimations() {
    const cards = document.querySelectorAll('.memory-card');

    cards.forEach((card, index) => {
        // Add staggered reveal animation
        card.style.transitionDelay = `${index * 0.1}s`;

        // Add subtle tilt on hover for desktop
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) translateY(0) rotateX(0) rotateY(0)';
        });
    });
}

/* ============================================
   Button Effects
   ============================================ */
function initButtonEffects() {
    const sendRoseBtn = document.getElementById('send-rose-btn');

    if (sendRoseBtn) {
        sendRoseBtn.addEventListener('click', () => {
            createRoseBurst(sendRoseBtn);

            // Scroll to message section
            const messageSection = document.getElementById('message');
            if (messageSection) {
                messageSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Song player functionality
    const playBtn = document.getElementById('play-song-btn');
    const audio = document.getElementById('song-audio');

    if (playBtn && audio) {
        playBtn.addEventListener('click', () => {
            const playIcon = playBtn.querySelector('.play-icon');

            if (audio.paused) {
                audio.play();
                playBtn.classList.add('playing');
                playIcon.textContent = '⏸';
                playBtn.style.animation = 'pulse 1s ease-in-out infinite';
            } else {
                audio.pause();
                playBtn.classList.remove('playing');
                playIcon.textContent = '▶';
                playBtn.style.animation = 'none';
            }
        });

        // Reset button when song ends
        audio.addEventListener('ended', () => {
            const playIcon = playBtn.querySelector('.play-icon');
            playBtn.classList.remove('playing');
            playIcon.textContent = '▶';
            playBtn.style.animation = 'none';
        });
    }
}

function createRoseBurst(originEl) {
    const container = document.getElementById('rose-burst-container');
    if (!container) return;

    const burstCount = 22;
    const rect = originEl ? originEl.getBoundingClientRect() : null;
    const startX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const startY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
            const rose = document.createElement('span');
            rose.className = 'rose-burst';
            rose.textContent = '🌹';

            const angle = Math.random() * Math.PI * 2;
            const distance = 120 + Math.random() * 140;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance - 80;
            const scale = 0.6 + Math.random() * 0.9;
            const rotation = `${Math.random() * 140 - 70}deg`;

            rose.style.left = `${startX}px`;
            rose.style.top = `${startY}px`;
            rose.style.setProperty('--x', `${x}px`);
            rose.style.setProperty('--y', `${y}px`);
            rose.style.setProperty('--scale', scale);
            rose.style.setProperty('--rotation', rotation);

            container.appendChild(rose);

            setTimeout(() => rose.remove(), 1700);
        }, i * 35);
    }
}

/* ============================================
   Performance Optimization
   ============================================ */

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Reduce animations when page is not visible
document.addEventListener('visibilitychange', () => {
    const petalsContainer = document.getElementById('petals-container');
    if (petalsContainer) {
        petalsContainer.style.animationPlayState =
            document.hidden ? 'paused' : 'running';
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const sendRoseBtn = document.getElementById("send-rose-btn");

    if (!sendRoseBtn) {
        console.log("Button nahi mila");
        return;
    }

    sendRoseBtn.addEventListener("click", () => {
        alert("🌹 Rose Sent Successfully!");
    });
});
document.addEventListener("DOMContentLoaded", () => {

    const playBtn = document.getElementById("play-song-btn");
    const audio = document.getElementById("song-audio");

    if (!playBtn || !audio) {
        console.log("Button ya audio nahi mila");
        return;
    }

    // IMPORTANT: force volume & unmute
    audio.volume = 1.0;
    audio.muted = false;

    playBtn.addEventListener("click", async () => {
        try {
            audio.muted = false;
            audio.volume = 1.0;

            if (audio.paused) {
                await audio.play();
                playBtn.innerHTML = '<span class="play-icon">⏸</span>';
            } else {
                audio.pause();
                playBtn.innerHTML = '<span class="play-icon">▶</span>';
            }
        } catch (err) {
            console.error("Audio play blocked:", err);
            alert("Browser ne audio block kiya. Page refresh karke dubara click karo.");
        }
    });

});
document.addEventListener("DOMContentLoaded", () => {
    const playBtn = document.getElementById("play-song-btn");
    const audio = document.getElementById("song-audio");

    playBtn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            playBtn.classList.add("playing");
            playBtn.innerHTML = '<span class="play-icon">❚❚</span>';
        } else {
            audio.pause();
            playBtn.classList.remove("playing");
            playBtn.innerHTML = '<span class="play-icon">▶</span>';
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const playBtn = document.getElementById("play-song-btn");
    const audio = document.getElementById("song-audio");

    if (!playBtn || !audio) return;

    playBtn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.classList.add("playing");
                playBtn.innerHTML = '<span class="play-icon">⏸</span>';
            }).catch(() => {
                alert("Browser ne audio block kiya. Page refresh karke dubara click karo.");
            });
        } else {
            audio.pause();
            playBtn.classList.remove("playing");
            playBtn.innerHTML = '<span class="play-icon">▶</span>';
        }
    });
});
