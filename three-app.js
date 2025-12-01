// Three.js 3D Visualization Engine
class ThreeApp {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationId = null;
        this.objects = [];
        
        this.initThree();
    }
    
    initThree() {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Setup camera
        const canvas = document.getElementById(this.canvasId);
        this.camera = new THREE.PerspectiveCamera(
            60, 
            canvas.clientWidth / canvas.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(10, 10, 10);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            preserveDrawingBuffer: true // Important for recording
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Setup controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Add lights
        this.addLights();
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(0x4488ff, 0xff8844, 0.3);
        this.scene.add(hemisphereLight);
    }
    
    async generateVisualization(codeStructure) {
        // Clear previous objects
        this.clearScene();
        
        // Add a grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        this.scene.add(gridHelper);
        this.objects.push(gridHelper);
        
        // Create visualization based on code structure
        this.createCodeStructure(codeStructure);
        
        // Add some decorative particles
        this.addParticles();
    }
    
    createCodeStructure(structure) {
        const { functions, classes, variables, totalLines, complexity } = structure;
        
        // Create central platform
        const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 32);
        const platformMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,
            shininess: 100
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -2;
        platform.receiveShadow = true;
        this.scene.add(platform);
        this.objects.push(platform);
        
        // Create pillars for functions
        functions.forEach((func, index) => {
            const height = 3 + (index * 0.5);
            const radius = 0.3;
            
            // Pillar
            const geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
            const material = new THREE.MeshPhongMaterial({ color: 0x3498db });
            const pillar = new THREE.Mesh(geometry, material);
            
            const angle = (index / functions.length) * Math.PI * 2;
            const distance = 4;
            pillar.position.x = Math.cos(angle) * distance;
            pillar.position.z = Math.sin(angle) * distance;
            pillar.position.y = height / 2 - 2;
            pillar.castShadow = true;
            
            this.scene.add(pillar);
            this.objects.push(pillar);
            
            // Add function name
            this.addText(func.name, 
                pillar.position.x, 
                pillar.position.y + height / 2 + 0.5, 
                pillar.position.z,
                0.3
            );
        });
        
        // Create cubes for classes
        classes.forEach((cls, index) => {
            const size = 1 + (index * 0.2);
            const geometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0xe74c3c,
                transparent: true,
                opacity: 0.8
            });
            const cube = new THREE.Mesh(geometry, material);
            
            const angle = (index / Math.max(classes.length, 1)) * Math.PI * 2 + Math.PI / 4;
            const distance = 6;
            cube.position.x = Math.cos(angle) * distance;
            cube.position.z = Math.sin(angle) * distance;
            cube.position.y = size / 2 - 2;
            cube.castShadow = true;
            
            cube.rotation.x = Math.random() * Math.PI;
            cube.rotation.y = Math.random() * Math.PI;
            
            this.scene.add(cube);
            this.objects.push(cube);
            
            // Add class name
            this.addText(cls.name, 
                cube.position.x, 
                cube.position.y + size / 2 + 0.5, 
                cube.position.z,
                0.3
            );
        });
        
        // Create spheres for variables
        variables.forEach((variable, index) => {
            if (index < 20) { // Limit to 20 variables
                const radius = 0.2 + (index % 3) * 0.1;
                const geometry = new THREE.SphereGeometry(radius, 16, 16);
                const material = new THREE.MeshPhongMaterial({ color: 0x2ecc71 });
                const sphere = new THREE.Mesh(geometry, material);
                
                sphere.position.x = (Math.random() - 0.5) * 10;
                sphere.position.z = (Math.random() - 0.5) * 10;
                sphere.position.y = radius - 1;
                sphere.castShadow = true;
                
                this.scene.add(sphere);
                this.objects.push(sphere);
            }
        });
        
        // Add central tower representing code complexity
        const complexityTower = this.createComplexityTower(complexity, totalLines);
        this.scene.add(complexityTower);
        this.objects.push(complexityTower);
    }
    
    createComplexityTower(complexity, totalLines) {
        const group = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(2, 2.5, 1, 32);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x9b59b6 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        group.add(base);
        
        // Tower segments based on complexity
        const segmentHeight = Math.min(totalLines / 50, 5); // Cap height
        for (let i = 0; i < complexity; i++) {
            const segmentGeometry = new THREE.CylinderGeometry(
                1.5 - i * 0.1,
                1.6 - i * 0.1,
                segmentHeight / complexity,
                16
            );
            const segmentMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color(`hsl(${i * 30}, 70%, 50%)`)
            });
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            
            segment.position.y = 1 + (i * segmentHeight / complexity);
            segment.castShadow = true;
            group.add(segment);
        }
        
        // Top sphere
        const topGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const topMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf1c40f,
            emissive: 0x444400
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 1 + segmentHeight + 0.8;
        top.castShadow = true;
        group.add(top);
        
        group.position.y = -2;
        
        return group;
    }
    
    addText(text, x, y, z, size = 0.5) {
        // Create a canvas for text texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        // Draw text
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = '40px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.set(x, y, z);
        sprite.scale.set(size * text.length * 0.5, size, 1);
        
        this.scene.add(sprite);
        this.objects.push(sprite);
    }
    
    addParticles() {
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Positions
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = Math.random() * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
            
            // Colors
            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        this.objects.push(particleSystem);
        
        // Animate particles
        particleSystem.userData = { speed: 0.01 };
        
        return particleSystem;
    }
    
    clearScene() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            if (obj.texture) obj.texture.dispose();
        });
        this.objects = [];
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Rotate some objects
        this.objects.forEach((obj, index) => {
            if (obj.type === 'Points') {
                // Animate particles
                const positions = obj.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] -= 0.01;
                    if (positions[i + 1] < -5) {
                        positions[i + 1] = 10;
                    }
                }
                obj.geometry.attributes.position.needsUpdate = true;
            }
            
            // Slow rotation for some objects
            if (index % 7 === 0 && obj.rotation) {
                obj.rotation.y += 0.01;
            }
        });
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        const canvas = document.getElementById(this.canvasId);
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clearScene();
        this.renderer.dispose();
    }
}