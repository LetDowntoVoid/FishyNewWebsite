// Simplified Three.js GLTF Loader
class ThreeJSLoader {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.loader = null;
        this.model = null;
        this.animationMixer = null;
        this.clock = null;
        this.controls = null;
    }

    init() {
        const container = document.getElementById('showcase');
        if (!container) {
            console.error('Showcase container not found');
            return;
        }
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 2, 5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);
        
        // Add lighting
        this.setupLighting();
        
        // Initialize loader
        this.loader = new THREE.GLTFLoader();
        this.clock = new THREE.Clock();

        // Initialize controls if available
        this.initControls();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start render loop
        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    initControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }
    }

    loadGLTF(modelPath) {
        console.log('Loading GLTF model:', modelPath);
        
        this.loader.load(
            modelPath,
            (gltf) => {
                console.log('GLTF loaded successfully');
                
                // Remove previous model if exists
                if (this.model) {
                    this.scene.remove(this.model);
                }

                this.model = gltf.scene;
                this.scene.add(this.model);
                this.model.scale.setScalar(0.25);
                
                

                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Setup animations if available
                this.setupAnimations(gltf);
                
                console.log('GLTF model loaded successfully');
            },
            (progress) => {
                console.log('GLTF Loading progress:', 
                    (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading GLTF:', error);
            }
        );
    }

    setupAnimations(gltf) {
        if (gltf.animations && gltf.animations.length > 0) {
            this.animationMixer = new THREE.AnimationMixer(this.model);
            
            // Play all animations
            gltf.animations.forEach((clip) => {
                const action = this.animationMixer.clipAction(clip);
                action.play();
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update animation mixer for GLTF animations
        if (this.animationMixer) {
            this.animationMixer.update(delta);
        }
        
        // Update orbit controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const container = document.getElementById('showcase');
        
        if (this.camera && this.renderer && container) {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }
}

// Create global instance
const threeJSLoader = new ThreeJSLoader();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Three.js scene...');
    threeJSLoader.init();
    
    // Load the GLTF model with default positioning
    threeJSLoader.loadGLTF('src/3DModel/playerBody.glb');
});

// Export functions for external use
window.loadGLTF = (path) => threeJSLoader.loadGLTF(path);
window.initThree = () => threeJSLoader.init();
window.threeJSLoader = threeJSLoader;