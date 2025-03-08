import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js'
// import { DirectionalLightHelper } from 'three/examples/jsm/helpers/DirectionalLightHelper.js';
import { DirectionalLightHelper, AxesHelper } from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


function main() {

    // Set up the canvas
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);


    // Set up the camera
    const fov = 60;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    // Asked ChatGPT to help with resizing the canvas here
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);

    // const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Set up the camera position
    camera.position.x = 10.5;
    camera.position.y = 10.5;
    camera.position.z = 13;

    // Allow orbit controls
    const controls = new OrbitControls( camera, canvas );
    controls.target.set( 2.5, 5, 3 );
    controls.update();

    // GUI camera updates
    function updateCamera() {
        camera.updateProjectionMatrix();
    }
    
    const gui = new GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);


    // Set up the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 'white' );
    

    // Define ambient, directional, and helpers
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);


    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(0, 9, 0);
    light.target.position.set(0, 5, 0);
    scene.add(light);
    scene.add(light.target);

    // Create a helper for the light
    const lightHelper = new DirectionalLightHelper(light, 2);
    scene.add(lightHelper);

    const axesHelper = new AxesHelper(2);
    scene.add(axesHelper);



    // Define shelf properties
    const shelfWidth = 7; 
    const shelfHeight = 0.375;
    const shelfDepth = 2;

    const shelfGeometry = new THREE.BoxGeometry(shelfWidth, shelfHeight, shelfDepth);

    const material = new THREE.MeshStandardMaterial({ color: 0xeddfc7 });
    const againstWallZ = -4.125
    const shelves = [
        { x: 0, y: 4.5, z: againstWallZ },
        { x: 0, y: 6.5, z: againstWallZ },
        { x: 0, y: 8.5, z: againstWallZ }
    ];


    // Define cube properties
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);


    // Define shapes to be created
    const cubes = [];

    const cylinders = [
        { x: 0, y: 5, z: againstWallZ, 
            radiusT: 0.35, 
            radiusB:0.35, 
            height: 1, 
            color: 0xd46648 
        },
        { x: -2.5, y: 7, z: againstWallZ, 
            radiusT: 0.5, 
            radiusB:0.5, 
            height: 1, 
            color: 0x4682b4 
        },
        { x: 3, y: 8.85, z: againstWallZ, 
            radiusT: 0.3, 
            radiusB: 0.3, 
            height: 0.4, 
            color: 0x32a852 
        }
    ];

    const boxes = [
        { x: 1, y: 5.25, z: againstWallZ, 
            width: 0.5,
            height: 1.5, 
            depth: 1,
            color: 0xffaaff 
        },
    ];

    const spheres = [
        // Fake tomato, probably gonna use texture
        { x: 0.33, y: 3.125, z: -3.33, 
            radius: 0.175,
            widthSeg: 16, 
            heightSeg: 16,
            color: 0xff0000 
        },
        { x: -4, y: 3.35, z: -4, 
            radius: 0.2,
            widthSeg: 16, 
            heightSeg: 16,
            color: 0xf7b54a
        },
        { x: -4.2, y: 3.35, z: -3.8, 
            radius: 0.2,
            widthSeg: 16, 
            heightSeg: 16,
            color: 0xf7b54a
        },
        { x: -4.2, y: 3.35, z: -3.5, 
            radius: 0.2,
            widthSeg: 16, 
            heightSeg: 16,
            color: 0xf7de83
        },
        { x: -3.9, y: 3.35, z: -3.5, 
            radius: 0.2,
            widthSeg: 16, 
            heightSeg: 16,
            color: 0x74a36a
        },
    ];


    // Loading Manager
    const loadManager = new THREE.LoadingManager();

    // Loading Screen Elements
    const loadingElem = document.querySelector('#loading');
    const progressBarElem = document.querySelector('.progressbar');

    loadManager.onLoad = () => {
        loadingElem.style.display = 'none'; // Hide loading screen
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);
        cubes.push(cube);


        shelves.forEach(({ x, y, z }) => {
        const shelf = new THREE.Mesh(shelfGeometry, material);
        shelf.position.set(x, y, z);
        scene.add(shelf);
        });


        cylinders.forEach(({ x, y, z, radiusT, radiusB, height, color }) => {
        const cylinderGeometry = new THREE.CylinderGeometry(radiusT, radiusB, height, 15);
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color });

        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.set(x, y, z);
        scene.add(cylinder);
        });

        boxes.forEach(({ x, y, z, width, height, depth, color }) => {
            const boxGeometry = new THREE.BoxGeometry(width, height, depth);
            const boxMaterial = new THREE.MeshBasicMaterial({ color });

            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(x, y, z);
            scene.add(box);
        });
        
        spheres.forEach(({ x, y, z, radius, widthSeg, heightSeg, color }) => {
            const sphereGeometry = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(x, y, z);
            scene.add(sphere);
        });

    };

    loadManager.onProgress = (path, loaded, total) => {
        const progress = loaded / total;
        progressBarElem.style.width = `${progress * 100}%`;
    };


    const loader = new THREE.TextureLoader(loadManager);
    const texturePaths = [
        'resources/img/flower-1.jpg',
        'resources/img/flower-2.jpg',
        'resources/img/flower-3.jpg',
        'resources/img/flower-4.jpg',
        'resources/img/flower-5.jpg',
        'resources/img/flower-6.jpg'
    ];

    const materials = texturePaths.map(path => 
        new THREE.MeshBasicMaterial({ map: loader.load(path) })
    );

    // Load imported 3D objects
    const objectsToLoad = [
        {
            objPath: 'resources/models/room/kitchenRoom.obj',
            mtlPath: 'resources/models/room/kitchenRoom.mtl',
            position: { x: 0, y: 0, z: 0 }
        },
        {
            objPath: 'resources/models/kitchenCabinet/kitchenCabinet.obj',
            mtlPath: 'resources/models/kitchenCabinet/kitchenCabinet.mtl',
            position: { x: 0.75, y: 0, z: -1.95 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 180, z: 0 } 
        },
        {
            objPath: 'resources/models/kitchenCabinet/kitchenCabinet.obj',
            mtlPath: 'resources/models/kitchenCabinet/kitchenCabinet.mtl',
            position: { x: -2.25, y: 0, z: -1.95 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 180, z: 0 } 
        },
        {
            objPath: 'resources/models/kitchenCabinet/kitchenCabinet.obj',
            mtlPath: 'resources/models/kitchenCabinet/kitchenCabinet.mtl',
            position: { x: -5.25, y: 0, z: -1.95 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 180, z: 0 } 
        },
        {
            objPath: 'resources/models/kitchenCabinet/kitchenCabinet.obj',
            mtlPath: 'resources/models/kitchenCabinet/kitchenCabinet.mtl',
            position: { x: -2.25, y: 0, z: -1.95 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 270, z: 0 } 
        },
        {
            objPath: 'resources/models/kitchenCabinet/kitchenCabinet.obj',
            mtlPath: 'resources/models/kitchenCabinet/kitchenCabinet.mtl',
            position: { x: -2.25, y: 0, z: 1 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 270, z: 0 } 
        },
        {
            objPath: 'resources/models/kitchenCabinet/kitchenCabinet.obj',
            mtlPath: 'resources/models/kitchenCabinet/kitchenCabinet.mtl',
            position: { x: -2.25, y: 0, z: 4 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 270, z: 0 } 
        },
        {
            objPath: 'resources/models/JamJar/CHAHIN_JAM_JAR.obj',
            mtlPath: 'resources/models/JamJar/CHAHIN_JAM_JAR.mtl',
            position: { x: -3, y: 5, z: -4 }, 
            scale: { x: 0.5, y: 0.5, z: 0.5 }, 
            rotation: { x: 0, y: 180, z: 0 } 
        },
        // Stacked Bowls
        {
            objPath: 'resources/models/Bowl/Bowl.obj',
            mtlPath: 'resources/models/Bowl/Bowl.mtl',
            position: { x: 2, y: 4.625, z: -3 }, 
            scale: { x: 0.0125, y: 0.0125, z: 0.0125 }, 
            rotation: { x: 270, y: 0, z: 0 } 
        },
        {
            objPath: 'resources/models/Bowl/Bowl.obj',
            mtlPath: 'resources/models/Bowl/Bowl.mtl',
            position: { x: 2, y: 4.825, z: -3 }, 
            scale: { x: 0.0125, y: 0.0125, z: 0.0125 }, 
            rotation: { x: 270, y: 0, z: 0 } 
        },
        {
            objPath: 'resources/models/Bowl/Bowl.obj',
            mtlPath: 'resources/models/Bowl/Bowl.mtl',
            position: { x: 2, y: 5.025, z: -3 }, 
            scale: { x: 0.0125, y: 0.0125, z: 0.0125 }, 
            rotation: { x: 270, y: 0, z: 0 } 
        },
        // For bowl of fruit
        {
            objPath: 'resources/models/Bowl/Bowl.obj',
            mtlPath: 'resources/models/Bowl/Bowl.mtl',
            position: { x: -5, y: 2.85, z: -3 }, 
            scale: { x: 0.0125, y: 0.0125, z: 0.0125 }, 
            rotation: { x: 270, y: 0, z: 0 } 
        },
        // {
        //     objPath: 'resources/models/kitchenCabinet/kitchenCabinet.obj',
        //     mtlPath: 'resources/models/kitchenCabinet/kitchenCabinet.mtl',
        //     position: { x: -2, y: 0, z: 0 } // Move another cabinet to the left
        // }
    ];
    function loadObjects(scene) {
        const mtlLoader = new MTLLoader();

        objectsToLoad.forEach(({ objPath, mtlPath, position, scale, rotation }) => {
            console.log(`Loading: ${mtlPath}`);
            
            mtlLoader.load(mtlPath, (mtl) => {
                console.log(`Loaded MTL: ${mtlPath}`);
                mtl.preload();

                const objLoader = new OBJLoader();
                objLoader.setMaterials(mtl);

                objLoader.load(objPath, (object) => {
                    
                    // Set position
                    object.position.set(position.x, position.y, position.z);

                    // Set scale (if defined)
                    if (scale) {
                        object.scale.set(scale.x, scale.y, scale.z);
                    }

                    // Set rotation (Three.js uses radians)
                    if (rotation) {
                        object.rotation.set(
                            THREE.MathUtils.degToRad(rotation.x), 
                            THREE.MathUtils.degToRad(rotation.y), 
                            THREE.MathUtils.degToRad(rotation.z)
                        );
                    }

                    scene.add(object);
                }, undefined, (error) => {
                    console.error(`Error loading OBJ: ${objPath}`, error);
                });

            }, undefined, (error) => {
                console.error(`Error loading MTL: ${mtlPath}`, error);
            });
        });
    }

    loadObjects(scene);

    function render(time) {

        time *= 0.001;

        // cubes.forEach(cube => {
        //     cube.rotation.x = time;
        //     cube.rotation.y = time;
        // });

        // Place animation in here

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();