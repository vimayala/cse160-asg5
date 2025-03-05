// import * as THREE from 'three';

// // Create a scene
// const scene = new THREE.Scene();

// import * as THREE from 'three';
             
// function main() {
//     const canvas = document.querySelector('#c');
//     const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

//     // Set camera attributes
//     const fov = 75;
//     const aspect = 2;  // the canvas default
//     const near = 0.1;
//     const far = 5;
//     const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//     camera.position.z = 2;

//     // Create a scene
//     const scene = new THREE.Scene();

//     // Define box geometry
//     const boxWidth = 1;
//     const boxHeight = 1;
//     const boxDepth = 1;
//     const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

//     // Create material
//     const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

//     //Create a mesh
//     const cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);

//     // Render the scene
//     renderer.render(scene, camera);

//     function render(time) {
//         time *= 0.001;  // convert time to seconds
       
//         cube.rotation.x = time;
//         cube.rotation.y = time;
       
//         renderer.render(scene, camera);
       
//         requestAnimationFrame(render);
//       }
//       requestAnimationFrame(render);
    
    
// }




// import * as THREE from 'three';

// function main() {

// 	const canvas = document.querySelector( '#c' );
// 	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

// 	const fov = 75;
// 	const aspect = 2; // the canvas default
// 	const near = 0.1;
// 	const far = 5;
// 	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
// 	camera.position.z = 2;

// 	const scene = new THREE.Scene();

// 	const boxWidth = 1;
// 	const boxHeight = 1;
// 	const boxDepth = 1;
// 	const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

// 	const material = new THREE.MeshBasicMaterial( { color: 0x44aa88 } ); // greenish blue

// 	const cube = new THREE.Mesh( geometry, material );
// 	scene.add( cube );

// 	function render( time ) {

// 		time *= 0.001; // convert time to seconds

// 		cube.rotation.x = time;
// 		cube.rotation.y = time;

// 		renderer.render( scene, camera );

// 		requestAnimationFrame( render );

// 	}

// 	requestAnimationFrame( render );

// }

