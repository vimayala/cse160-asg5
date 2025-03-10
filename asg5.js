// import * as THREE from './node_modules/three/build/three.module.js';
// import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
// import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
// import {MTLLoader} from 'three/addons/loaders/MTLLoader.js'
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/MTLLoader.js';
import { GUI } from 'https://unpkg.com/three@0.160.0/examples/jsm/libs/lil-gui.module.min.js';


// import { DirectionalLightHelper } from 'three/examples/jsm/helpers/DirectionalLightHelper.js';
// import { AxesHelper } from 'three';
// import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
// import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

// /Users/victoria/Documents/CSE 160/cse160-asg5/src/pick.js


// Adjusted from helper linked site with ChatGPT
function main() {
    const pickToggle = true;
    class PickHelper {
        constructor() {
          this.raycaster = new THREE.Raycaster();
          this.pickedObject = null;
          this.pickedObjectSavedColor = 0;
        }
        pick(normalizedPosition, scene, camera, time) {
        if (this.pickedObject && this.pickedObject.material && "emissive" in this.pickedObject.material) {
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        }
        
        this.raycaster.setFromCamera(normalizedPosition, camera);
          const intersectedObjects = this.raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            this.pickedObject = intersectedObjects[0].object;
        
            if (this.pickedObject.material && 'emissive' in this.pickedObject.material) {
                this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
                this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
            }
        }
        
        }
      }
    
 
    function getCanvasRelativePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
        x: (event.clientX - rect.left) * canvas.width  / rect.width,
        y: (event.clientY - rect.top ) * canvas.height / rect.height,
        };
    }

    // Set up the canvas
    const canvas = document.querySelector('#c');
    // const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        alpha: true,
      });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);



    // Set up the camera
    const fov = 60;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    // Asked ChatGPT to help with resizing the canvas here
    // const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);

    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    camera.position.set(-13.67, 8, -14.9);

    const camera2 = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    camera2.position.set(0, 10, 0); // Top-down view
    // camera2.position.x = 5;
    // camera2.position.y = 10;
    // camera2.position.z = -12;
    camera2.lookAt(0, 0, 0);

    let activeCamera = camera; // Start with camera1


    // const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    camera.position.x = -13.67;
    camera.position.y = 8;
    camera.position.z = -14.9;

    // Allow orbit controls
    const controls = new OrbitControls( camera, canvas );
    controls.target.set( 2.5, 4, 3 );
    controls.update();

    const controls2 = new OrbitControls( camera2, canvas );
    controls2.target.set( 0, 5, 0 );
    controls2.update();

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
    const pickHelper = new PickHelper();

    const pickPosition = {x: 0, y: 0};
    clearPickPosition();



    function setPickPosition(event) {
        const pos = getCanvasRelativePosition(event);
        pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
        pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
      }
       
      function clearPickPosition() {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        pickPosition.x = -100000;
        pickPosition.y = -100000;
      }

    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);

       

    scene.fog = new THREE.Fog(0xff00ff, near, far);

    {
        const skyLoader = new THREE.TextureLoader();
        const texture = skyLoader.load(
            // From 360cities.net
            // https://www.360cities.net/image/high-street-apartments-360-panorama
          'resources/img/cubemaps/whiteRoom.jpg',
          () => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = texture;
            scene.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
          });

    }

    // Define ambient, directional, and helpers
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xFFFFFF, 1);
    light1.position.set(0, 9, 0);
    light1.target.position.set(0, 11, 0);
    scene.add(light1);
    scene.add(light1.target);


    const light2 = new THREE.DirectionalLight(0xFFFFFF, 1);
    light2.position.set(0, 9, 0);
    light2.target.position.set(0, 5, 0);
    scene.add(light2);
    scene.add(light2.target);
    
    const light = new THREE.RectAreaLight( 0xffffff, 1, 10, 8 );
    light.position.set( 0, 10, 0 );
    light.rotation.x = THREE.MathUtils.degToRad( - 90 );
    scene.add( light );

    // Define shelf properties
    const shelfWidth = 7; 
    const shelfHeight = 0.375;
    const shelfDepth = 2;

    const shelfGeometry = new THREE.BoxGeometry(shelfWidth, shelfHeight, shelfDepth);

    const material = new THREE.MeshStandardMaterial({ color: 0xede2ce });
    const againstWallZ = -4.125
    const shelves = [
        { x: 0, y: 4.5, z: againstWallZ },
        { x: 0, y: 6.5, z: againstWallZ },
        { x: 0, y: 8.5, z: againstWallZ }
    ];


    // Define cube properties
    const boxWidth = 1;
    const boxHeight = 0.28;
    const boxDepth = 1.5;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);


    // Define shapes to be created
    const cylinders = [
        // Fake jar
        { x: -2, y: 5, z: againstWallZ, 
            radiusT: 0.35, 
            radiusB: 0.35, 
            height: 1, 
            color: 0xd46648 
        },
        { x: -2, y: 5.45, z: againstWallZ, 
            radiusT: 0.4, 
            radiusB: 0.4, 
            height: 0.075, 
            color: 0xa3a3a3 
        },
        { x: -2, y: 5.5, z: againstWallZ, 
            radiusT: 0.375, 
            radiusB: 0.375, 
            height: 0.125, 
            color: 0xcccccc 
        },

        // Fake canister
        { x: 3, y: 9.1, z: againstWallZ, 
            radiusT: 0.3, 
            radiusB: 0.3, 
            height: 0.0625, 
            color: 0x8a8396 
        },
        { x: 3, y: 9.05, z: againstWallZ, 
            radiusT: 0.35, 
            radiusB: 0.35, 
            height: 0.0625, 
            color: 0x8a8a8a 
        },
        { x: 3, y: 8.85, z: againstWallZ, 
            radiusT: 0.3, 
            radiusB: 0.3, 
            height: 0.4, 
            color: 0xd6cce6 
        },

        // Pot
        { x: -2.5, y: 6.9, z: againstWallZ, 
            radiusT: 0.5, 
            radiusB: 0.45, 
            height: 0.5, 
            color: 0xc4c4c4 
        },
        { x: -2.5, y: 7.125, z: againstWallZ, 
            radiusT: 0.525, 
            radiusB: 0.525, 
            height: 0.125, 
            color: 0xb8b8b8 
        },
        { x: -2.5, y: 7.2, z: againstWallZ, 
            radiusT: 0.2, 
            radiusB: 0.15, 
            height: 0.2, 
            color: 0xb8b8b8
        },

        // Paper towel + holder
        { x: 3.3, y: 3.425, z: againstWallZ, 
            radiusT: 0.3, 
            radiusB: 0.3, 
            height: 0.85, 
            color: 0xf7f6f2
        },
        { x: 3.3, y: 3, z: againstWallZ, 
            radiusT: 0.325, 
            radiusB: 0.325, 
            height: 0.075, 
            color: 0x9c9c9c
        },

        //Range Hood Buttons
        { x: -3.5, y: 6.2, z: 3.7, 
            radiusT: 0.075, 
            radiusB: 0.075, 
            height: 0.25, 
            color: 0x787878
        },
        { x: -3.5, y: 6.2, z: 3.4, 
            radiusT: 0.075, 
            radiusB: 0.075, 
            height: 0.25, 
            color: 0x787878
        },
        { x: -3.5, y: 6.2, z: 3.1, 
            radiusT: 0.075, 
            radiusB: 0.075, 
            height: 0.25, 
            color: 0x787878
        },
    ];

    const boxes = [
        // Fix walls
        { x: -0.35, y: 5.25, z: -5.75, 
            width: 11,
            height: 11, 
            depth: 0.275,
            color: 0xffffff 
        },
        { x: -5.75, y: 5.25, z: 0, 
            width: 0.275,
            height: 11, 
            depth: 11,
            color: 0xffffff
        },
        // Fix floors
        { x: -0.2, y: -0.1, z: 0.1, 
            width: 11,
            height: 0.25, 
            depth: 11,
            color: 0xffffff
        },

        //Random box on shelf
        { x: 2, y: 7.25, z: againstWallZ, 
            width: 0.5,
            height: 1.5, 
            depth: 1,
            color: 0xd1c27d 
        },

        // Pot handle
        { x: -3.3, y: 7, z: againstWallZ, 
            width: 1,
            height: 0.125, 
            depth: 0.1725,
            color: 0xb8b8b8
        },

        // Paper towel holder stick
        { x: 3.3, y: 3.425, z: againstWallZ, 
            width: 0.125,
            height: 1, 
            depth: 0.125,
            color: 0x9c9c9c
        },

        // Range Hood
        { x: -4.5, y: 8.75, z: 2.5,
            width: 1,
            height: 4, 
            depth: 1,
            color: 0x9c9c9c
        },
        { x: -4.5, y: 6.25, z: 2.5,
            width: 2,
            height: 1, 
            depth: 3,
            color: 0x9c9c9c
        },
    ];

    const spheres = [
        // Fake tomato, probably gonna use texture
        // { x: 0.33, y: 3.125, z: -3.33, 
        //     radius: 0.175,
        //     widthSeg: 16, 
        //     heightSeg: 16,
        //     color: 0xff0000 
        // },
        { x: -4.1, y: 3.5, z: -3.8, 
            radius: 0.2,
            widthSeg: 16, 
            heightSeg: 16,
            color: 0xf75e4a
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
        cube.position.set(-1, 3.0725, -3);
        cube.rotateOnWorldAxis(new THREE.Vector3(0, 0.5, 0), Math.PI / 4);
        scene.add(cube);

        shelves.forEach(({ x, y, z }) => {
            const shelf = new THREE.Mesh(shelfGeometry, material);
            shelf.position.set(x, y, z);
            scene.add(shelf);
        });


        cylinders.forEach(({ x, y, z, radiusT, radiusB, height, color }) => {
            const cylinderGeometry = new THREE.CylinderGeometry(radiusT, radiusB, height, 15);
            const cylinderMaterial = new THREE.MeshStandardMaterial({ color });

            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            cylinder.position.set(x, y, z);
            scene.add(cylinder);
        });

        boxes.forEach(({ x, y, z, width, height, depth, color }) => {
            const boxGeometry = new THREE.BoxGeometry(width, height, depth);
            // const boxMaterial = new THREE.MeshBasicMaterial({ color });
            const boxMaterial = new THREE.MeshStandardMaterial({ color });

            

            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(x, y, z);
            scene.add(box);
        });
        
        spheres.forEach(({ x, y, z, radius, widthSeg, heightSeg, color }) => {
            const sphereGeometry = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
            const sphereMaterial = new THREE.MeshStandardMaterial({ color });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(x, y, z);
            scene.add(sphere);
        });

    };

    loadManager.onProgress = (path, loaded, total) => {
        const progress = loaded / total;
        progressBarElem.style.width = `${progress * 100}%`;
    };

    // Recipe book (custom)
    const loader = new THREE.TextureLoader(loadManager);
    const texturePaths = [
        'resources/img/book/side.jpg',         // front
        'resources/img/book/spine.jpg',        // left
        'resources/img/book/cover.jpg',          // back
        'resources/img/book/back.jpg',          // right
        'resources/img/book/top.jpg',        // top
        'resources/img/book/bottom.jpg'         // bottom
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
            objPath: 'resources/models/KitchenCabinetDrawer/kitchenCabinetDrawer.obj',
            mtlPath: 'resources/models/KitchenCabinetDrawer/kitchenCabinetDrawer.mtl',
            position: { x: 0.75, y: 0, z: -1.95 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 180, z: 0 } 
        },
        {
            objPath: 'resources/models/KitchenCabinetDrawer/kitchenCabinetDrawer.obj',
            mtlPath: 'resources/models/KitchenCabinetDrawer/kitchenCabinetDrawer.mtl',
            position: { x: -2.25, y: 0, z: -1.95 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 180, z: 0 } 
        },
        {
            objPath: 'resources/models/KitchenCabinetDrawer/kitchenCabinetDrawer.obj',
            mtlPath: 'resources/models/KitchenCabinetDrawer/kitchenCabinetDrawer.mtl',
            position: { x: -5.25, y: 0, z: -1.95 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 180, z: 0 } 
        },
        {
            objPath: 'resources/models/kitchenCabinet/cabinet.obj',
            mtlPath: 'resources/models/kitchenCabinet/cabinet.mtl',
            position: { x: -2.25, y: 0, z: -1.95 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 270, z: 0 } 
        },
        {
            objPath: 'resources/models/KitchenSink/kitchenSink.obj',
            mtlPath: 'resources/models/KitchenSink/kitchenSink.mtl',
            position: { x: -2.25, y: 0, z: 1.05 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 270, z: 0 } 
        },
        // {
        //     objPath: 'resources/models/kitchenCabinet/cabinet.obj',
        //     mtlPath: 'resources/models/kitchenCabinet/cabinet.mtl',
        //     position: { x: -2.25, y: 0, z: 4 }, 
        //     scale: { x: 7, y: 7, z: 7 }, 
        //     rotation: { x: 0, y: 270, z: 0 } 
        // },

        {
            objPath: 'resources/models/KitchenStove/kitchenStove.obj',
            mtlPath: 'resources/models/KitchenStove/stove.mtl',
            position: { x: -2.25, y: 0, z: 4 }, 
            scale: { x: 7, y: 7, z: 7 }, 
            rotation: { x: 0, y: 270, z: 0 } 
        }, 

        // {
        //     objPath: 'resources/models/JamJar/CHAHIN_JAM_JAR.obj',
        //     mtlPath: 'resources/models/JamJar/CHAHIN_JAM_JAR.mtl',
        //     position: { x: -3, y: 5, z: -4 }, 
        //     scale: { x: 0.5, y: 0.5, z: 0.5 }, 
        //     rotation: { x: 0, y: 180, z: 0 } 
        // },
        // Stacked Bowls
        {
            objPath: 'resources/models/woodBowl/woodBowl.obj',
            mtlPath: 'resources/models/woodBowl/woodBowl.mtl',
            position: { x: 2.5, y: 4.625, z: -4 }, 
            scale: { x: 5, y: 5, z: 5 }, 
            rotation: { x: 0, y: 0, z: 0 } 
        },
        {
            objPath: 'resources/models/woodBowl/woodBowl.obj',
            mtlPath: 'resources/models/woodBowl/woodBowl.mtl',
            position: { x: 2.5, y: 4.85, z: -4 }, 
            scale: { x: 5, y: 5, z: 5 }, 
            rotation: { x: 0, y: 17, z: 0 } 
        },
        {
            objPath: 'resources/models/woodBowl/woodBowl.obj',
            mtlPath: 'resources/models/woodBowl/woodBowl.mtl',
            position: { x: 2.5, y: 5.125, z: -4 }, 
            scale: { x: 5, y: 5, z: 5 }, 
            rotation: { x: 0, y: 0, z: 0 } 
        },
        // {
        //     objPath: 'resources/models/Bowl/Bowl.obj',
        //     mtlPath: 'resources/models/Bowl/Bowl.mtl',
        //     position: { x: 2, y: 4.825, z: -3 }, 
        //     scale: { x: 0.0125, y: 0.0125, z: 0.0125 }, 
        //     rotation: { x: 270, y: 0, z: 0 } 
        // },
        // {
        //     objPath: 'resources/models/Bowl/Bowl.obj',
        //     mtlPath: 'resources/models/Bowl/Bowl.mtl',
        //     position: { x: 2, y: 5.025, z: -3 }, 
        //     scale: { x: 0.0125, y: 0.0125, z: 0.0125 }, 
        //     rotation: { x: 270, y: 0, z: 0 } 
        // },
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
            // console.log(`Loading: ${mtlPath}`);
            
            mtlLoader.load(mtlPath, (mtl) => {
                // console.log(`Loaded MTL: ${mtlPath}`);
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


    let canModel = null;
    const mtlLoader = new MTLLoader();
    mtlLoader.load('resources/models/Can/can.mtl', (mtl) => {
        mtl.preload();
    
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
    
        objLoader.load('resources/models/Can/can.obj', (object) => {
            object.position.set(1, 0.175, 0);
            object.scale.set(1, 1, 1);
            object.rotation.set(
                THREE.MathUtils.degToRad(270), 
                THREE.MathUtils.degToRad(45), 
                THREE.MathUtils.degToRad(0)
            );
    
            scene.add(object);
            canModel = object; // Store reference to animate later
        });
    });
    

    loadObjects(scene);

    
    let circTime = 0; 

    // Forward vs back
    let direction = 1;

    // ChatGPT helped me figure out pause frames
    let pauseFrames = 0;
    const maxPauseFrames = 30;


    // Had ChatGPT help me when website didn't advise enough
    window.addEventListener('keydown', (event) => {
        if (event.key === 'c') {
            activeCamera = (activeCamera === camera) ? camera2 : camera;
        }
    });
    

    function render(time) {

        time *= 0.001;
        if(pickToggle){
            pickHelper.pick(pickPosition, scene, camera, time);
        }


        if (canModel) {
            const radius = 1.25;  
            const speed = 0.01;
    
            if (pauseFrames > 0) {
                pauseFrames--; // Wait for a few frames before resuming
            } else {

                canModel.position.x = radius * Math.cos(circTime);
                canModel.position.z = radius * 0.4 * Math.sin(circTime);
                canModel.rotation.y += 0.05;
    
                circTime += speed * direction;
    
                // Change directions
                if (circTime >= Math.PI || circTime <= 0) {
                    direction *= -1;
                    pauseFrames = maxPauseFrames; // Pause before switching direction
                }
            }
        }

        // renderer.render(scene, camera);
        renderer.render(scene, activeCamera);

        requestAnimationFrame(render);

        
    }

    requestAnimationFrame(render);
}



main();