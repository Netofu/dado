// Importa as bibliotecas principais
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GUI } from 'dat.gui';

let renderer, scene, camera, controls, gui;
const clock = new THREE.Clock();

function init() {
    // Configuração do renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Cena
    scene = new THREE.Scene();

    // Carregando um ambiente HDRI para o fundo
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    new RGBELoader()
        .load('https://raw.githubusercontent.com/MATA65-ComputacaoGrafica-2024-2/atividade-unidade-ii-Netofu/main/lilienstein_4k.exr', (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            scene.environment = envMap;
            scene.background = envMap;
        });

    // Câmera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    // Controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // GUI
    gui = new GUI();

    // Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Adicionando o modelo do átrio Sponza
    const loader = new GLTFLoader();
    loader.load(
        '/Assets/Models/glTF/Sponza.gltf', // Caminho ajustado
        (gltf) => {
            const sponza = gltf.scene;
            sponza.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(sponza);
        }
    );

    // Adicionando objetos complementares
    addComplementaryModels();

    // Adicionando objetos geométricos para efeitos
    addEffects();

    // Janela de redimensionamento
    window.addEventListener('resize', onWindowResize);

    // Renderização
    animate();
}

function addComplementaryModels() {
    const loader = new GLTFLoader();

    // Modelo de um Gameboy
    loader.load(
        'https://raw.githubusercontent.com/MATA65-ComputacaoGrafica-2024-2/atividade-unidade-ii-Netofu/main/SM_Gameboy.fbx',
        (gltf) => {
            const gameboy = gltf.scene;
            gameboy.scale.set(0.1, 0.1, 0.1);
            gameboy.position.set(-5, 1, -3);
            scene.add(gameboy);
        }
    );

    // Modelo de uma Fita Cassette
    loader.load(
        'https://raw.githubusercontent.com/MATA65-ComputacaoGrafica-2024-2/atividade-unidade-ii-Netofu/main/cassette_tape.glb',
        (gltf) => {
            const cassette = gltf.scene;
            cassette.scale.set(0.5, 0.5, 0.5);
            cassette.position.set(2, 1, 2);
            scene.add(cassette);
        }
    );
}

function addEffects() {
    // Objeto translúcido
    const translucentMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccee,
        transmission: 0.9,
        thickness: 0.5,
    });
    const translucentSphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), translucentMaterial);
    translucentSphere.position.set(-3, 1, 0);
    scene.add(translucentSphere);

    // Espelho dinâmico
    const mirrorGeometry = new THREE.PlaneGeometry(5, 5);
    const mirrorRenderTarget = new THREE.WebGLRenderTarget(512, 512);
    const mirrorCamera = new THREE.CubeCamera(0.1, 500, mirrorRenderTarget);
    const mirrorMaterial = new THREE.MeshBasicMaterial({ envMap: mirrorRenderTarget.texture });

    const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror.position.set(3, 2.5, 0);
    mirror.rotation.y = Math.PI;
    scene.add(mirror);

    scene.add(mirrorCamera);

    // Atualizando reflexões dinâmicas no loop de animação
    mirror.onBeforeRender = () => {
        mirror.visible = false;
        mirrorCamera.update(renderer, scene);
        mirror.visible = true;
    };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    const delta = clock.getDelta();
    controls.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();
