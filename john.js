// Optimized Three.js GLTF and OBJ Loader
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
        this.objLoader = null;
        this.mtlLoader = null;
        this.placeModel = null;
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
        
        // Initialize loaders
        this.loader = new THREE.GLTFLoader();
        this.mtlLoader = new THREE.MTLLoader();
        this.objLoader = new THREE.OBJLoader();
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
                
                // Enable shadows and ensure materials are opaque
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Ensure materials are completely opaque
                        if (child.material) {
                            this.setMaterialOpaque(child.material);
                        }
                    }
                });
                
                // Setup animations if available
                this.setupAnimations(gltf);
                
                // Position model right in front of camera
                this.positionGLTFModel();
                
                console.log('GLTF model loaded, positioned in front of camera, and made opaque');
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

    setMaterialOpaque(material) {
        if (Array.isArray(material)) {
            material.forEach((mat) => {
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.needsUpdate = true;
            });
        } else {
            material.transparent = false;
            material.opacity = 1.0;
            material.needsUpdate = true;
        }
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

    positionGLTFModel() {
        if (!this.model) return;

        // Get model bounds
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        this.model.position.sub(center);
        
        // Scale model to reasonable size if needed
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 3) {
            const scale = 2/ maxDim;
            this.model.scale.setScalar(scale);
        }
        
        // Position at the same location as betterPlace object
        // Based on your original positioning logic
        this.model.position.y += 3.25;
        this.model.rotation.y += Math.PI / 5;
        this.model.position.x -= 2.15;
        this.model.position.z += 2.25;
        
        console.log('GLTF model positioned at betterPlace location');
    }

    loadOBJ(objPath, mtlPath) {
        console.log('Loading OBJ model:', objPath);
        console.log('Loading MTL materials:', mtlPath);
        
        this.mtlLoader.load(
            mtlPath,
            (materials) => {
                console.log('MTL materials loaded successfully');
                materials.preload();
                this.objLoader.setMaterials(materials);
                this.loadOBJWithMaterials(objPath);
            },
            (progress) => {
                console.log('MTL Loading progress:', 
                    (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading MTL:', error);
                console.log('Attempting to load OBJ without materials...');
                this.loadOBJFallback(objPath);
            }
        );
    }

    loadOBJWithMaterials(objPath) {
        this.objLoader.load(
            objPath,
            (object) => {
                console.log('OBJ loaded successfully with materials');
                this.setupOBJModel(object);
            },
            (progress) => {
                console.log('OBJ Loading progress:', 
                    (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading OBJ with materials:', error);
            }
        );
    }

    loadOBJFallback(objPath) {
        this.objLoader.load(
            objPath,
            (object) => {
                console.log('OBJ loaded without materials');
                
                // Apply default materials
                object.traverse((child) => {
                    if (child.isMesh && !child.material) {
                        child.material = new THREE.MeshLambertMaterial({ 
                            color: 0x888888 
                        });
                    }
                });
                
                this.setupOBJModel(object);
            },
            (progress) => {
                console.log('OBJ Loading progress (no MTL):', 
                    (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading OBJ (fallback):', error);
            }
        );
    }

    setupOBJModel(object) {
        // Remove previous place model if exists
        if (this.placeModel) {
            this.scene.remove(this.placeModel);
        }
        
        this.placeModel = object;
        this.scene.add(this.placeModel);
        
        // Enable shadows for all meshes
        this.placeModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Auto-size and position the map model
        this.autoSizeOBJMap(this.placeModel);
        
        console.log('OBJ map model loaded, auto-sized, and positioned');
    }

    autoSizeOBJMap(mapModel) {
        const box = new THREE.Box3().setFromObject(mapModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log('Original map size:', size);
        console.log('Original map center:', center);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        console.log('Max dimension:', maxDim);
        
        // Calculate scale factor
        const targetSize = 300;
        let scale = targetSize / maxDim;
        
        if (maxDim > 10000) {
            scale = targetSize / maxDim;
            console.log('Detected very large map, using aggressive scaling');
        } else if (maxDim < 10) {
            scale = 5 / maxDim;
            console.log('Detected small map, scaling up');
        }
        
        console.log('Calculated scale factor:', scale);
        
        // Apply scaling and positioning
        mapModel.scale.setScalar(scale);
        
        // Recalculate after scaling
        const scaledBox = new THREE.Box3().setFromObject(mapModel);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        
        // Position the model
        mapModel.position.x = -scaledCenter.x;
        mapModel.position.z = -scaledCenter.z + 90;
        mapModel.position.y = -scaledBox.min.y - 287.5;
        
        console.log('Final map size after scaling:', scaledSize);
        console.log('Final map position:', mapModel.position);
        
        // Adjust camera for map view
        this.adjustCameraForMap(scaledSize);
    }

    adjustCameraForMap(scaledSize) {
        if (this.camera && this.controls) {
            const cameraHeight = Math.max(scaledSize.y * 1.5, 10);
            const cameraDistance = Math.max(scaledSize.x, scaledSize.z) * 0.7;
            
            this.camera.position.set(
                cameraDistance * 0.7, 
                cameraHeight, 
                cameraDistance * 0.7
            );
            
            this.controls.target.set(0, -1, 0);
            this.controls.update();
            
            console.log('Camera repositioned for map view');
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
    
    // Load the GLTF model (now opaque and positioned in front of camera)
    threeJSLoader.loadGLTF('src/3DModel/playerBody.glb');
    
    // Load the OBJ and MTL files
    threeJSLoader.loadOBJ('src/3DModel/betterPlace.obj', 'src/3DModel/betterPlace.mtl');
});

// Export functions for external use
window.loadGLTF = (path) => threeJSLoader.loadGLTF(path);
window.loadOBJ = (objPath, mtlPath) => threeJSLoader.loadOBJ(objPath, mtlPath);
window.initThree = () => threeJSLoader.init();
window.threeJSLoader = threeJSLoader;