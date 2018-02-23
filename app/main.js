import * as rec from './recorder.js';

const W = 1280;
const H = 800;

let renderer, scene, camera;
let controls; // eslint-disable-line no-unused-vars
let mesh;



(function main() {
  
  setup(); // set up scene
  
  loop(); // start game loop
  
})();



function setup() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize( W, H );
  renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild( renderer.domElement );
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, W / H, 0.01, 1000 );
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  camera.position.z = 2;
  
  let geo = new THREE.BoxGeometry( 1, 1, 1 );
  let mat = new THREE.MeshNormalMaterial({ color: 0x1e90ff, wireframe: false });
  mesh = new THREE.Mesh( geo, mat );
  scene.add( mesh );
}


function loop(time) { // eslint-disable-line no-unused-vars
  let speed = 0.5;
  mesh.rotation.x = (time / 1000) * Math.PI/2 * speed;
  // mesh.rotation.y = (time / 1000) * Math.PI/2 * speed * 0.9;
  // mesh.rotation.z = (time / 1000) * Math.PI/2 * speed * 0.8;
  
  requestAnimationFrame( loop );
  renderer.render( scene, camera );
  rec.update( renderer );
}


document.addEventListener('keydown', e => {
  // console.log(e.key, e.keyCode, e);
  
  if (e.key == 'f') { // f .. fullscreen
    if (!document.webkitFullscreenElement) {
      document.querySelector('body').webkitRequestFullscreen();
    } else { document.webkitExitFullscreen(); }
  }
  
  else if (e.key == 'c') {
    rec.startstop(); // start/stop recording
  }
  else if (e.key == 'v') {
    rec.startstop( { start:0 } ); // record from sec 0
  }
  else if (e.key == 'b') {
    rec.startstop( { start:0, duration:1 } ); // record 1 second
  }
});
