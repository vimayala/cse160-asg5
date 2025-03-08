import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js'
// import { DirectionalLightHelper } from 'three/examples/jsm/helpers/DirectionalLightHelper.js';
import { DirectionalLightHelper, AxesHelper } from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';



function main() {
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
        pickHelper.pick(pickPosition, scene, camera, time);

        renderer.render(scene, camera);
        requestAnimationFrame(render);

        
    }

    requestAnimationFrame(render);
}



main();