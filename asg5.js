import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js'
// import { DirectionalLightHelper } from 'three/examples/jsm/helpers/DirectionalLightHelper.js';
import { DirectionalLightHelper, AxesHelper } from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

// /Users/victoria/Documents/CSE 160/cse160-asg5/src/pick.js

function main() {
    const pickToggle = true;
    class PickHelper {
        constructor() {
          this.raycaster = new THREE.Raycaster();
          this.pickedObject = null;
          this.pickedObjectSavedColor = 0;
        }
        pick(normalizedPosition, scene, camera, time) {
          // restore the color if there is a picked object
        //   if (this.pickedObject) {
        //     this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        //     this.pickedObject = undefined;
        //   }
        if (this.pickedObject && this.pickedObject.material && "emissive" in this.pickedObject.material) {
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        }
        
       
          // cast a ray through the frustum
          this.raycaster.setFromCamera(normalizedPosition, camera);
          // get the list of objects the ray intersected
          const intersectedObjects = this.raycaster.intersectObjects(scene.children);
        //   if (intersectedObjects.length) {
        //     // pick the first object. It's the closest one
        //     this.pickedObject = intersectedObjects[0].object;
        //     // save its color
        //     this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        //     // set its emissive color to flashing red/yellow
        //     this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
        //   }
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
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    

    // const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Set up the camera position
    // camera.position.x = 10.5;
    // camera.position.y = 10.5;
    // camera.position.z = 13;

    camera.position.x = -13.67;
    camera.position.y = 8;
    camera.position.z = -14.9;

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

       

    // scene.fog = new THREE.Fog(0xff00ff, near, far);

    // {
    //     const loader = new THREE.CubeTextureLoader();
    //     const texture = loader.load([
    //       'resources/img/cubemaps/Standard-Cube-Map/px.png',
    //       'resources/img/cubemaps/Standard-Cube-Map/nx.png',
    //       'resources/img/cubemaps/Standard-Cube-Map/py.png',
    //       'resources/img/cubemaps/Standard-Cube-Map/ny.png',
    //       'resources/img/cubemaps/Standard-Cube-Map/pz.png',
    //       'resources/img/cubemaps/Standard-Cube-Map/nz.png',
    //     ]);
    //     scene.background = texture;
    //   }

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

    // scene.background = new THREE.Color( 'white' );

    // const skyLoader = new THREE.TextureLoader();
    // const bgTexture = skyLoader.load('resources/img/daikanyama.jpg');
    // bgTexture.colorSpace = THREE.SRGBColorSpace;
    // scene.background = bgTexture;

    // Define ambient, directional, and helpers
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // const lightK = new THREE.DirectionalLight(0xFFFFFF, 0.4);
    // lightK.position.set(-5, 4, -5);
    // lightK.target.position.set(5, 0, 5);
    // scene.add(lightK);
    // scene.add(lightK.target);

    //     const lightHelper = new DirectionalLightHelper(lightK, 2);
    // scene.add(lightHelper);

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



    // // Create a helper for the light
    // const lightHelper = new DirectionalLightHelper(light1, 2);
    // scene.add(lightHelper);

    // const axesHelper = new AxesHelper(2);
    // scene.add(axesHelper);

    
    const light = new THREE.RectAreaLight( 0xffffff, 1, 10, 8 );
    light.position.set( 0, 10, 0 );
    light.rotation.x = THREE.MathUtils.degToRad( - 90 );
    scene.add( light );

    // const helper = new RectAreaLightHelper( light );
    // light.add( helper );


    // // add point light
    // const pointLight = new THREE.PointLight(0xffffff, 2);
    // pointLight.position.set(0, 9, -1.25);
    // // pointLight.target.position.set(0, 5, 0);
    // scene.add(pointLight);

    // const pointLight2 = new THREE.PointLight(0xffffff, 2);
    // pointLight2.position.set(0, 9, 0.75);
    // // pointLight.target.position.set(0, 5, 0);
    // scene.add(pointLight2);

    // const pointLight3 = new THREE.PointLight(0xffffff, 2);
    // pointLight3.position.set(0, 9, 2.625);
    // // pointLight.target.position.set(0, 5, 0);
    // scene.add(pointLight3);
    // // const helper = new THREE.PointLightHelper(pointLight);
    // // scene.add(helper);





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
    const cubes = [];

    const cylinders = [
        { x: 0, y: 5, z: againstWallZ, 
            radiusT: 0.35, 
            radiusB:0.35, 
            height: 1, 
            color: 0xd46648 
        },
        { x: 3, y: 8.85, z: againstWallZ, 
            radiusT: 0.3, 
            radiusB: 0.3, 
            height: 0.4, 
            color: 0x32a852 
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

        //Random box on shelf
        { x: 1, y: 5.25, z: againstWallZ, 
            width: 0.5,
            height: 1.5, 
            depth: 1,
            color: 0xffaaff 
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
        cube.position.set(-1, 3.0725, -3);
        cube.rotateOnWorldAxis(new THREE.Vector3(0, 0.5, 0), Math.PI / 4);
        scene.add(cube);
        
        // cubes.push(cube);


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

    
    function createTexturedBox({ width, height, depth, textures, position, rotation }) {
        const scene = new THREE.Scene();
        
        const loader = new THREE.TextureLoader();
        const materials = textures.map((path) => new THREE.MeshBasicMaterial({ map: loader.load(path) }));
    
        // Front face
        const frontGeometry = new THREE.PlaneGeometry(width, height);
        const front = new THREE.Mesh(frontGeometry, materials[0]);  // Texture for front
        front.position.set(0, height / 2, depth / 2); 
        front.rotation.y = Math.PI; // Rotate 
    
        // Back face
        const backGeometry = new THREE.PlaneGeometry(width, height);
        const back = new THREE.Mesh(backGeometry, materials[1]); // Texture for back
        back.position.set(0, height / 2, -depth / 2); // Position it at back
        back.rotation.y = 0;
    
        // Left face
        const leftGeometry = new THREE.PlaneGeometry(depth, height);
        const left = new THREE.Mesh(leftGeometry, materials[2]); // Texture for left side
        left.position.set(-width / 2, height / 2, 0);
        left.rotation.y = Math.PI / 2;
    
        // Right face
        const rightGeometry = new THREE.PlaneGeometry(depth, height);
        const right = new THREE.Mesh(rightGeometry, materials[3]); // Texture for right side
        right.position.set(width / 2, height / 2, 0);
        right.rotation.y = -Math.PI / 2;
    
        // Top face
        const topGeometry = new THREE.PlaneGeometry(width, depth);
        const top = new THREE.Mesh(topGeometry, materials[4]); // Texture for top
        top.position.set(0, height, 0);
        top.rotation.x = -Math.PI / 2;
    
        // Bottom face
        const bottomGeometry = new THREE.PlaneGeometry(width, depth);
        const bottom = new THREE.Mesh(bottomGeometry, materials[5]); // Texture for bottom
        bottom.position.set(0, 0, 0);
        bottom.rotation.x = Math.PI / 2;
    
        // Add all faces to the scene
        scene.add(front);
        scene.add(back);
        scene.add(left);
        scene.add(right);
        scene.add(top);
        scene.add(bottom);
    
        // Apply the position and rotation for the entire box
        scene.position.set(position.x, position.y, position.z);
        scene.rotation.set(
            THREE.MathUtils.degToRad(rotation.x),
            THREE.MathUtils.degToRad(rotation.y),
            THREE.MathUtils.degToRad(rotation.z)
        );
    
        return scene;
    }

    loadObjects(scene);

    function render(time) {

        time *= 0.001;
        // console.log(camera.position);

        // cubes.forEach(cube => {
        //     cube.rotation.x = time;
        //     cube.rotation.y = time;
        // });

        // Place animation in here
        // const canvasAspect = canvas.clientWidth / canvas.clientHeight;
        // const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
        // const aspect = imageAspect / canvasAspect;
       
        // bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
        // bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;
       
        // bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
        // bgTexture.repeat.y = aspect > 1 ? 1 : aspect;
        if(pickToggle){
            pickHelper.pick(pickPosition, scene, camera, time);
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);

        
    }

    requestAnimationFrame(render);
}



main();