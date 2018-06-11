var renderer, scene, camera, game, light, gameMesh, view;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
// camera
var VIEW_ANGLE = 45;
var ASPECT = WIDTH / HEIGHT;
var NEAR = 1;
var FAR = 500;

function init(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH, HEIGHT );
    renderer.setClearColorHex( 0x101010, 1 );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
    document.body.appendChild( renderer.domElement );
    light = new THREE.DirectionalLight( 0xffffff );
    scene.add( light );
    gameMesh = new THREE.Mesh();
    view = new THREE.Mesh();
    scene.add( gameMesh );
    game = new Game( scene, gameMesh );
    game.registerKeyControls({
        up: [38,87],
        down: [40,83],
        left: [37,65],
        right: [39,68],
        rotateLeft: [81,1037,1065],
        rotateRight: [69,1039,1068],
        select: [13,32],
        menu: [27]
    });
    animate();
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener('mousemove', onMouseMove, false );
}
function animate(){
    requestAnimationFrame( animate, undefined );
    render();
}

function render(){
    var position, quaternion;
    position = game.look.position.clone();
    quaternion = game.look.quaternion.clone();
    camera.position.add( position.sub(camera.position).multiplyScalar(0.15) );
    camera.quaternion.slerp( quaternion, 0.15 );
    light.position.copy( camera.position );
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
var dx, dy;
function onMouseMove(event) {
    dx = event.x / window.innerWidth - 0.5;
    dy = - event.y / window.innerHeight + 0.5;
}

window.addEventListener( 'load', init);