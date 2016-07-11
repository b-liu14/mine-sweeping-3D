var color_default = 0x23EA14;
var color_safe = 0x1A25E4;
var color_dangerous = 0xEB1318;
var color_bomb = 0x000000;


if (!Detector.webgl)
	Detector.addGetWebGLMessage();
var container, stats;
var camera, scene, renderer, controls, objects = [];
var particleLight;
var mouse,intersect,raycaster,isShiftDown = false;
var loader = new THREE.FontLoader();
var position_objects = new Array(6);

//init 3D objects Array
for (var i = 0; i < position_objects.length; i++) {
	position_objects[i] = new Array(6);
}
for (var i = 0; i < position_objects.length; i++) {
	for (var j = 0; j < position_objects[i].length; j++) {
		position_objects[i][j] = new Array(6);
	}
}

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

	for(var x = 0; x < numberOfSphersPerSide; x++){
		for (var y = 0; y < numberOfSphersPerSide; y++) {
			for(var z = 0; z < numberOfSphersPerSide; z++){
				var material = new THREE.MeshBasicMaterial( {color:color_default} );
				var mesh = new THREE.Mesh( geometry,  material);
				mesh.position.x = x * 150 - 200;
				mesh.position.y = y * 150 - 200;
				mesh.position.z = z * 150 - 200;

				//init the state of balls
				mesh.state = 0;
				mesh.bombNum = 0;
				mesh.position_x = x;
				mesh.position_y = y;
				mesh.position_z = z;

				objects.push(mesh);
				position_objects[x][y][z] = mesh;
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
		if ( !isShiftDown ) {
			if ( intersect.state === 0 && !intersect.isBomb) {
				//safe
				intersect.state = 1;         
				intersect.bombNum = getBombNum(intersect);

				//To Add The num
				//....
			}
			else if (intersect.state === 0 && intersect.isBomb) {
				//bomb !!
				intersect.state = 3;
			}
		} 
		else {
			if (intersect.state === 0) {
				//lift flag
				intersect.state = 2;        
			}
			else {
				//init state
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
function getBombNum (mesh) {
	var bombNum = 0;
	var x_min = mesh.position_x - 1 >= 0 ? mesh.position_x - 1 : 0;
	var y_min = mesh.position_y - 1 >= 0 ? mesh.position_y - 1 : 0;
	var z_min = mesh.position_z - 1 >= 0 ? mesh.position_z - 1 : 0;
	var x_max = mesh.position_x + 1 >= 0 ? mesh.position_x + 1 : 6;
	var y_max = mesh.position_y + 1 >= 0 ? mesh.position_y + 1 : 6;
	var z_max = mesh.position_z + 1 >= 0 ? mesh.position_z + 1 : 6;
	for (var i = x_min;i < x_max;i++ ) {
		for (var j = y_min;j < y_max;j++) {
			for (var k = z_min;k < z_max;k++) {
				if (position_objects[i][j][k].isBomb) {
					bombNum++;
				}	
			}
		}
	}
	return bombNum;
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
				intersect.material.color = new THREE.Color(color_default);
				break;
			case 1:
				intersect.material.color = new THREE.Color(color_safe);
				break;
			case 2:
				intersect.material.color = new THREE.Color(color_dangerous);
				break;
			case 3:
				intersect.material.color = new THREE.Color(color_bomb);
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