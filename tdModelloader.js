const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 0);
camera.lookAt(0, 0, 0);

const horizCont = document.querySelector('.cnv');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
horizCont.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

let model;
let modelLoaded = false;

const mtlLoader = new THREE.MTLLoader();
mtlLoader.setPath('src/3DModel/');
mtlLoader.load('modelLogo.mtl', (materials) => {
  materials.preload();

  const objLoader = new THREE.OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('src/3DModel/');
  objLoader.load('modelLogo.obj', (object) => {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());

    const baseWidth = 1920;
    const baseScale = 2;
    const scaleFactor = (window.innerWidth / baseWidth) * baseScale;

    object.position.x -= center.x;
    object.position.y -= center.y;
    object.position.z -= center.z;

    object.scale.setScalar(scaleFactor / 7.5);

    object.rotation.Y = -Math.PI / 2;

    model = object;

    // Set rotation based on device type
    if (window.innerWidth <= 768) {
      model.rotation.x = 0; // Mobile: already at final rotation
      object.scale.setScalar(scaleFactor / 3);
    } else {
      model.rotation.x = Math.PI / 2 + Math.PI/95;
    }

    scene.add(model);
    modelLoaded = true;
    addFloatingAnimation();
  },

  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },

  (error) => {
    console.error('Error loading model:', error);
  });
});

function addFloatingAnimation() {
  if (!model) return;

  gsap.killTweensOf(model.rotation, "z");

  gsap.to(model.rotation, {
    y: "+=0.05",
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (modelLoaded) {
    const baseWidth = 1920;
    const baseScale = 2;
    const scaleFactor = (window.innerWidth / baseWidth) * baseScale;
    model.scale.setScalar(scaleFactor * 8.5);
  }

  ScrollTrigger.getAll().forEach(t => t.kill());
  initHorizontalScroll();
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

gsap.registerPlugin(ScrollTrigger);

function initHorizontalScroll() {
  const wrapper = document.querySelector(".horizontal-wrapper");
  const longText = document.querySelector(".longText");

  if (window.innerWidth > 768) {
    const textRight = longText.getBoundingClientRect().right;
    const wrapperLeft = wrapper.getBoundingClientRect().left;
    const buffer = 300;
    const scrollDistance = textRight - wrapperLeft - window.innerWidth + buffer;

    const horizontalTween = gsap.to(wrapper, {
      x: () => `-${scrollDistance}px`,
      ease: "none"
    });

    ScrollTrigger.create({
      trigger: ".horizontal-section",
      start: "top top",
      end: () => scrollDistance,
      pin: true,
      scrub: 1,
      animation: horizontalTween,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (model && window.innerWidth > 768) {
          model.rotation.x = (1 - self.progress) * Math.PI / 2;
        }
      }
    });
  } else {
    // Mobile fallback: make sure model is at endpoint
    if (model) {
      model.rotation.x = 0;
    }
  }
}

initHorizontalScroll();
