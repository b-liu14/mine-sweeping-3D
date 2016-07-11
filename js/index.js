if (!Detector.webgl) Detector.addGetWebGLMessage();
var container, stats;
var camera, scene, renderer, controls, objects = [];
var particleLight;
var mouse,intersect,raycaster,isShiftDown = false;
var loader = new THREE.FontLoader();
loader.load('fonts/gentilis_regular.typeface.json', function(font) {
	init(font);
	animate();
});

function init(font) {
	container = document.createElement('div');
	document.body.appendChild(container);
	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000);
	camera.position.set(0.0, 400, 400 * 3.5);
	//
	var reflectionCube = new THREE.CubeTextureLoader()
		.setPath('textures/cube/SwedishRoyalCastle/')
		.load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
	reflectionCube.format = THREE.RGBFormat;
	scene = new THREE.Scene();
	scene.background = reflectionCube;
	// Materials
	var imgTexture = new THREE.TextureLoader().load("textures/planets/moon_1024.jpg");
	imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
	imgTexture.anisotropy = 16;
	imgTexture = null;
	var shininess = 50,
		specular = 0x333333,
		shading = THREE.SmoothShading;
	var materials = [];
	var cubeWidth = 400;
	var numberOfSphersPerSide = 5;
	var sphereRadius = (cubeWidth / numberOfSphersPerSide) * 0.8 * 0.5;
	var stepSize = 1.0 / numberOfSphersPerSide;
	var geometry = new THREE.SphereBufferGeometry(sphereRadius, 32, 16);
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	var material_begin= { color: 0x23EA14, reflectivity: 0.5 };
	var material_safe= { color: 0x7F7F7F };
	var material_dangerous= { color: 0xEB1318 };
	for(var x = 0; x < numberOfSphersPerSide; x++){
		for (var y = 0; y < numberOfSphersPerSide; y++) {
			for(var z = 0; z < numberOfSphersPerSide; z++){
				var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( material_begin ) );
				mesh.position.x = x * 150 - 200;
				mesh.position.y = y * 150 - 200;
				mesh.position.z = z * 150 - 200;
				objects.push(mesh);
				scene.add(mesh);
			}
		}
	}

	// function addLabel(name, location) {
	// 	var textGeo = new THREE.TextGeometry(name, {
	// 		font: font,
	// 		size: 20,
	// 		height: 1,
	// 		curveSegments: 1
	// 	});
	// 	var textMaterial = new THREE.MeshBasicMaterial({
	// 		color: 0xffffff
	// 	});
	// 	var textMesh = new THREE.Mesh(textGeo, textMaterial);
	// 	textMesh.position.copy(location);
	// 	scene.add(textMesh);
	// }
	//
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setClearColor(0x0a0a0a);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.sortObjects = true;
	container.appendChild(renderer.domElement);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	//
	stats = new Stats();
	container.appendChild(stats.dom);
	controls = new THREE.OrbitControls(camera);
	controls.target.set(0, 0, 0);
	controls.update();
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );
	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
//
function animate() {
	requestAnimationFrame(animate);
	render();
	stats.update();
}
function onDocumentMouseDown( event ) {
	event.preventDefault();
	mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects );
	if ( intersects.length > 0 ) {
		intersect = intersects[ 0 ].object;
		// delete cube
		if ( !isShiftDown ) {
			if ( intersect.state === 0 ) {
				intersect.state = 1;
			}
		// create cube
		} else {
			if (intersect.state === 0) {
				intersect.state = 2;
			}
			else {
				intersect.state = 0;
			}
		}
	}
}
function onDocumentKeyDown( event ) {
	switch( event.keyCode ) {
		case 16: isShiftDown = true;
		break;
	}
}
function onDocumentKeyUp( event ) {
	switch ( event.keyCode ) {
		case 16: isShiftDown = false;
		break;
	}
}
function render() {
	var timer = Date.now() * 0.00025;
	camera.lookAt(scene.position);
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects );
	if (intersects.length > 0) {
		intersect = intersects[0].object;
		switch (intersect.state) {
			case 0:
				intersect.material.color = new THREE.Color(0x23EA14);
				break;
			case 1:
				intersect.material.color = new THREE.Color(0x000000);
				break;
			case 2:
				intersect.material.color = new THREE.Color(0xEB1318);
				break;
			default:
				// statements_def
				break;
		}
	}
	for (var i = 0, l = objects.length; i < l; i++) {
		var object = objects[i];
		object.rotation.y += 0.005;
	}
	renderer.render(scene, camera);
}