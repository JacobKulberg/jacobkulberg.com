import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import { TextureLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';

let world = new CANNON.World();
world.gravity.set(0, -9.81, 0);

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020026);
const renderer = new THREE.WebGLRenderer();

let canvasWidth = Math.min(window.innerWidth, 1500);
let canvasHeight = Math.min(Math.min(window.innerHeight, window.innerWidth * (15 / 28)), 500);
renderer.setSize(canvasWidth, canvasHeight);

renderer.setPixelRatio(window.devicePixelRatio * 2);

const camera = new THREE.PerspectiveCamera(90, canvasWidth / canvasHeight, 0.1, 1000);

$('#court').append(renderer.domElement);

// Create the court geometry and material
const loader = new TextureLoader();
const silhouetteTexture = loader.load('../assets/images/silhouette.png');
const courtTexture = loader.load('../assets/images/court.png');
const courtMaterial = new THREE.MeshLambertMaterial({ map: courtTexture });
const courtGeometry = new THREE.PlaneGeometry(28, 15);
const court = new THREE.Mesh(courtGeometry, courtMaterial);
court.rotation.x = -Math.PI / 2; // Rotate the court to lie flat
scene.add(court);

// Create a plane for the physics engine that the ball will bounce on
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light to the scene
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight1.position.set(-13, 8, 0);
directionalLight1.target = court;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(13, 8, 0);
directionalLight2.target = court;
scene.add(directionalLight2);

// Set the camera position
camera.position.set(0, 10, 15);
camera.lookAt(court.position);
camera.zoom = 1.5;
camera.updateProjectionMatrix();

// Tube for trajectory
let trajectoryTube = null;
const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

// Trajectory Points Array
const maxTrajectoryPoints = 500;
const trajectoryPoints = [];

// Function to create a basketball hoop
function createBasketballHoop(position) {
	const group = new THREE.Group();

	// Create the backboard
	const backboardGeometry = new THREE.BoxGeometry(1.8, 1, 0.1);
	const backboardTexture = loader.load('../assets/images/backboard.png');
	const backboardMaterial = new THREE.MeshLambertMaterial({ map: backboardTexture });
	const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
	backboard.position.set(position.x, position.y + 0.55, position.z - 0.6);
	group.add(backboard);

	// Create the hoop rim
	const rimGeometry = new THREE.TorusGeometry(0.5, 0.08, 16, 100);
	const rimMaterial = new THREE.MeshLambertMaterial({ color: 0xee6730 });
	const rim = new THREE.Mesh(rimGeometry, rimMaterial);
	rim.position.set(position.x, position.y, position.z - 0.1);
	rim.rotation.x = Math.PI / 2;
	group.add(rim);

	// Create a simple net shape
	const netGeometry = new THREE.CylinderGeometry(0.5, 0.35, 0.7, 12, 2, true);
	const netMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true });
	const net = new THREE.Mesh(netGeometry, netMaterial);
	net.position.set(position.x, position.y - 0.35, position.z - 0.1);
	group.add(net);

	return group;
}

function setCourtLogo(teamLogo) {
	if (!teamLogo) return;
	const logoTexture = loader.load(teamLogo);
	const logoMaterial = new THREE.MeshLambertMaterial({ map: logoTexture, transparent: true });
	const logoGeometry = new THREE.PlaneGeometry(4, 4);
	const logo = new THREE.Mesh(logoGeometry, logoMaterial);
	logo.position.set(0, 0.01, 0);
	logo.rotation.x = -Math.PI / 2;
	scene.add(logo);
}

// Add hoops to the scene
const hoop1 = createBasketballHoop(new THREE.Vector3(0, 3, 0));
const hoop2 = createBasketballHoop(new THREE.Vector3(0, 3, 0));
hoop1.rotation.y = Math.PI / 2;
hoop2.rotation.y = -Math.PI / 2;
hoop1.position.x = -13.35;
hoop2.position.x = 13.35;
scene.add(hoop1);
scene.add(hoop2);

// Resize the canvas when the window is resized
let windowWidth = $(window).width();
$(window).on('resize orientationchange', (e) => {
	if ($('#court').height() == 0) return;

	if (windowWidth == $(window).width()) return;
	windowWidth = $(window).width();

	let canvasWidth = Math.min(window.innerWidth, 1500);
	let canvasHeight = Math.min(Math.min(window.innerHeight, window.innerWidth * (15 / 28)), 500);
	renderer.setSize(canvasWidth, canvasHeight);

	camera.aspect = canvasWidth / canvasHeight;
	camera.updateProjectionMatrix();

	renderer.setPixelRatio(window.devicePixelRatio * 2);

	setCourtViewportHeight();
});

let playerGroup;
function addPlayer(x, y, headshot) {
	let distance1 = distance(x, y, -13.35, 0);
	let distance2 = distance(x, y, 13.35, 0);
	let isCloseToRim = distance1 <= 2 || distance2 <= 2;

	playerGroup = new THREE.Group();

	// put a circle on the ground at coordinates x, y
	const circleGeometry = new THREE.RingGeometry(7 / 20, 9 / 20, 50);
	const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const circle = new THREE.Mesh(circleGeometry, circleMaterial);
	circle.position.set(x, 0.05, y);
	circle.rotation.x = -Math.PI / 2;
	playerGroup.add(circle);

	// put a floating triangle above the circle
	let triangleGeometry1 = new THREE.BufferGeometry();
	// prettier-ignore
	let vertices1 = new Float32Array([
		 x - 1.1,  1.5, y, // v0
		        x, 0.7, y, // v1
		 x + 1.1,  1.5, y, // v2
	]);
	if (isCloseToRim) {
		// prettier-ignore
		vertices1 = new Float32Array([
			 x - 0.7,  1.5, y, // v0
			       x,  0.7, y, // v1
			 x + 0.7,  1.5, y, // v2
		]);
	}
	triangleGeometry1.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));
	const triangleMaterial1 = new THREE.MeshBasicMaterial({ color: 0x7e7ae6 });
	const triangle1 = new THREE.Mesh(triangleGeometry1, triangleMaterial1);
	playerGroup.add(triangle1);

	let triangleGeometry2 = new THREE.BufferGeometry();
	// prettier-ignore
	let vertices2 = new Float32Array([
		 x - 0.8,  1.4, y + 0.01, // v0
		       x,  0.8, y + 0.01, // v1
		 x + 0.8,  1.4, y + 0.01, // v2
	]);
	if (isCloseToRim) {
		// prettier-ignore
		vertices2 = new Float32Array([
			 x - 0.525,  1.4, y + 0.01, // v0
			          x, 0.8, y + 0.01, // v1
			 x + 0.525,  1.4, y + 0.01, // v2
		]);
	}
	triangleGeometry2.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
	const triangleMaterial2 = new THREE.MeshBasicMaterial({ color: 0x3c387a });
	const triangle2 = new THREE.Mesh(triangleGeometry2, triangleMaterial2);
	playerGroup.add(triangle2);

	// put a plane on top of the triangle
	let playerSize = 2.5;
	if (isCloseToRim) {
		playerSize = 1.5;
	}
	const planeGeometry = new THREE.PlaneGeometry(playerSize, playerSize);
	const planeTexture = silhouetteTexture;
	const planeMaterial = new THREE.MeshStandardMaterial({ map: planeTexture, transparent: true });
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	updatePlayerTexture(plane, headshot);
	plane.position.set(x, isCloseToRim ? 2.25 : 2.75, y);
	playerGroup.add(plane);

	// add a light above the player
	const rectLight = new THREE.RectAreaLight(0xffffff, 1, playerSize, playerSize);
	rectLight.position.set(x, isCloseToRim ? 2.25 : 2.75, y + 1);
	rectLight.lookAt(plane.position);
	playerGroup.add(rectLight);

	let playerGroupPosition = new THREE.Vector3(x, 0, y);
	let cameraPosition = new THREE.Vector3(camera.position.x, 0, camera.position.y + 10);
	let angle = Math.atan2(cameraPosition.x - playerGroupPosition.x, cameraPosition.z - playerGroupPosition.z);
	rotateAboutPoint(playerGroup, new THREE.Vector3(x, 0, y), new THREE.Vector3(0, 1, 0), angle, false);

	// add the player to the scene
	scene.add(playerGroup);
}

let ballGeometry = new THREE.SphereGeometry(0.45, 32, 32);
let ballMaterial = new THREE.MeshLambertMaterial();
ballMaterial.depthTest = false;
let ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(-Number.MAX_SAFE_INTEGER, 2, -Number.MAX_SAFE_INTEGER);
scene.add(ball);

let ballShape = new CANNON.Sphere(0.45);
let ballBody = new CANNON.Body({ mass: 5, shape: ballShape });
ballBody.position.set(-Number.MAX_SAFE_INTEGER, 2, -Number.MAX_SAFE_INTEGER);
world.addBody(ballBody);

let madeBasketTimeoutID, redX;

function shootBall(x, y, team, made) {
	madeBasket = false;

	const ballGeometry = new THREE.SphereGeometry(0.45, 32, 32);
	const ballTexture = loader.load('../assets/images/basketball.png');
	const ballMaterial = new THREE.MeshLambertMaterial({ map: ballTexture });
	ballMaterial.depthTest = false;
	ball = new THREE.Mesh(ballGeometry, ballMaterial);
	ball.position.set(x, 2, y);
	scene.add(ball);

	const ballShape = new CANNON.Sphere(0.45);
	ballBody = new CANNON.Body({ mass: 5, shape: ballShape });
	ballBody.position.set(x, 2, y);
	world.addBody(ballBody);

	let rimPosition = new THREE.Vector3((team === 0 ? -1 : 1) * 13.5, 3.5, -0.1);
	if (isJumpBall) {
		rimPosition = new THREE.Vector3(0, 5, 0);
	}

	let height = calculatePracticalHeight(ball.position, rimPosition);
	let velocity = calculateParabolicVelocity(ball.position, rimPosition, height);
	ballBody.velocity.set(velocity.v.x + (!made ? Math.random() / 3 : 0), velocity.v.y + (!made ? Math.random() / 3 : 0), velocity.v.z + (!made ? Math.random() / 3 : 0));

	let id = setInterval(() => {
		if ((ballBody.velocity.y < 0 && ballBody.position.y <= 3.25) || (isJumpBall && ballBody.velocity.y < 0 && ballBody.position.y <= 4)) {
			if (!made) {
				scene.remove(ball);
				ball.geometry.dispose();
				ball.material.dispose();
				world.remove(ballBody);

				if (redX) {
					scene.remove(redX);
					redX.children.forEach((child) => {
						if (child.geometry) child.geometry.dispose();
						if (child.material) child.material.dispose();
					});
				}
				redX = addRedXAtRim(ball.position);
			}

			ballBody.velocity.set(0, ballBody.velocity.y, 0);
			madeBasket = true;
			isJumpBall = false;

			clearInterval(id);
		}
	}, 10);
}

let madeBasket = false;
function shootBasket(x = 0, y = 0, team = 0, made = true, headshot = null) {
	clearTimeout(madeBasketTimeoutID);

	scene.remove(playerGroup);
	playerGroup?.children.forEach((child) => {
		if (child.geometry) child.geometry.dispose();
		if (child.material) child.material.dispose();
	});
	scene.remove(ball);
	ball.geometry.dispose();
	ball.material.dispose();
	if (ballBody) world.remove(ballBody);
	if (redX) {
		scene.remove(redX);
		redX.children.forEach((child) => {
			if (child.geometry) child.geometry.dispose();
			if (child.material) child.material.dispose();
		});
		redX = null;
	}

	addPlayer(x, y, headshot);
	shootBall(x, y, team, made);

	// fade ball
	ball.material.transparent = true;
	ball.material.opacity = 1;

	// Remove previous trajectory tube if exists
	if (trajectoryTube) {
		scene.remove(trajectoryTube);
		trajectoryTube.children.forEach((child) => {
			if (child.geometry) child.geometry.dispose();
			if (child.material) child.material.dispose();
		});
		trajectoryTube = null;
	}

	// Clear trajectory points
	trajectoryPoints.length = 0;
}

let isJumpBall = false;
function jumpBall(homePlayerHeadshot, awayPlayerHeadshot) {
	isJumpBall = true;
	madeBasket = false;

	let x1 = -2,
		y1 = 0,
		x2 = 2,
		y2 = 0;

	playerGroup = new THREE.Group();

	// put a circle on the ground at coordinates x, y
	const circleGeometry = new THREE.RingGeometry(7 / 20, 9 / 20, 50);
	const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const circle = new THREE.Mesh(circleGeometry, circleMaterial);
	circle.position.set(x1, 0.05, y1);
	circle.rotation.x = -Math.PI / 2;
	playerGroup.add(circle);

	// put a floating triangle above the circle
	let triangleGeometry1 = new THREE.BufferGeometry();
	// prettier-ignore
	let vertices1 = new Float32Array([
		 x1 - 1.1,  1.5, y1, // v0
		        x1, 0.7, y1, // v1
		 x1 + 1.1,  1.5, y1, // v2
	]);
	triangleGeometry1.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));
	const triangleMaterial1 = new THREE.MeshBasicMaterial({ color: 0x7e7ae6 });
	const triangle1 = new THREE.Mesh(triangleGeometry1, triangleMaterial1);
	playerGroup.add(triangle1);

	let triangleGeometry2 = new THREE.BufferGeometry();
	// prettier-ignore
	let vertices2 = new Float32Array([
		 x1 - 0.8,  1.4, y1 + 0.01, // v0
		       x1,  0.8, y1 + 0.01, // v1
		 x1 + 0.8,  1.4, y1 + 0.01, // v2
	]);
	triangleGeometry2.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
	const triangleMaterial2 = new THREE.MeshBasicMaterial({ color: 0x3c387a });
	const triangle2 = new THREE.Mesh(triangleGeometry2, triangleMaterial2);
	playerGroup.add(triangle2);

	// put a plane on top of the triangle
	let playerSize = 2.5;
	const planeGeometry = new THREE.PlaneGeometry(playerSize, playerSize);
	const planeTexture = silhouetteTexture;
	const planeMaterial = new THREE.MeshStandardMaterial({ map: planeTexture, transparent: true });
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	updatePlayerTexture(plane, homePlayerHeadshot);
	plane.position.set(x1, 2.75, y1);
	playerGroup.add(plane);

	// add a light above the player
	const rectLight = new THREE.RectAreaLight(0xffffff, 1, playerSize, playerSize);
	rectLight.position.set(x1, 2.75, y1 + 1);
	rectLight.lookAt(plane.position);
	playerGroup.add(rectLight);

	let playerGroupPosition = new THREE.Vector3(x1, 0, y1);
	let cameraPosition = new THREE.Vector3(camera.position.x, 0, camera.position.y + 10);
	let angle = Math.atan2(cameraPosition.x - playerGroupPosition.x, cameraPosition.z - playerGroupPosition.z);
	rotateAboutPoint(playerGroup, new THREE.Vector3(x1, 0, y1), new THREE.Vector3(0, 1, 0), angle, false);

	// put a circle on the ground at coordinates x, y
	const circle2 = new THREE.Mesh(circleGeometry, circleMaterial);
	circle2.position.set(x2, 0.05, y2);
	circle2.rotation.x = -Math.PI / 2;
	playerGroup.add(circle2);

	// put a floating triangle above the circle
	let triangleGeometry3 = new THREE.BufferGeometry();
	// prettier-ignore
	let vertices3 = new Float32Array([
		 x2 - 1.1,  1.5, y2, // v0
		        x2, 0.7, y2, // v1
		 x2 + 1.1,  1.5, y2, // v2
	]);
	triangleGeometry3.setAttribute('position', new THREE.BufferAttribute(vertices3, 3));
	const triangleMaterial3 = new THREE.MeshBasicMaterial({ color: 0x7e7ae6 });
	const triangle3 = new THREE.Mesh(triangleGeometry3, triangleMaterial3);
	playerGroup.add(triangle3);

	let triangleGeometry4 = new THREE.BufferGeometry();
	// prettier-ignore
	let vertices4 = new Float32Array([
		 x2 - 0.8,  1.4, y2 + 0.01, // v0
		       x2,  0.8, y2 + 0.01, // v1
		 x2 + 0.8,  1.4, y2 + 0.01, // v2
	]);
	triangleGeometry4.setAttribute('position', new THREE.BufferAttribute(vertices4, 3));
	const triangleMaterial4 = new THREE.MeshBasicMaterial({ color: 0x3c387a });
	const triangle4 = new THREE.Mesh(triangleGeometry4, triangleMaterial4);
	playerGroup.add(triangle4);

	// put a plane on top of the triangle
	let playerSize2 = 2.5;
	const planeGeometry2 = new THREE.PlaneGeometry(playerSize2, playerSize2);
	const planeTexture2 = silhouetteTexture;
	const planeMaterial2 = new THREE.MeshStandardMaterial({ map: planeTexture2, transparent: true });
	const plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
	updatePlayerTexture(plane2, awayPlayerHeadshot);
	plane2.position.set(x2, 2.75, y2);
	playerGroup.add(plane2);

	// add a light above the player
	const rectLight2 = new THREE.RectAreaLight(0xffffff, 1, playerSize2, playerSize2);
	rectLight2.position.set(x2, 2.75, y2 + 1);
	rectLight2.lookAt(plane2.position);
	playerGroup.add(rectLight2);

	let playerGroupPosition2 = new THREE.Vector3(x2, 0, y2);
	let cameraPosition2 = new THREE.Vector3(camera.position.x, 0, camera.position.y + 10);
	let angle2 = Math.atan2(cameraPosition2.x - playerGroupPosition2.x, cameraPosition2.z - playerGroupPosition2.z);
	rotateAboutPoint(playerGroup, new THREE.Vector3(x2, 0, y2), new THREE.Vector3(0, 1, 0), angle2, false);

	// add the player to the scene
	scene.add(playerGroup);

	shootBall(0, 0, 0, true, true);

	// fade ball
	ball.material.transparent = true;
	ball.material.opacity = 1;
}

function rotateAboutPoint(obj, point, axis, theta) {
	obj.position.sub(point); // remove the offset
	obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
	obj.position.add(point); // re-add the offset
	obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

// Start the animation loop
function animate() {
	requestAnimationFrame(animate);

	ball.position.copy(ballBody.position);
	// ball.quaternion.copy(ballBody.quaternion);
	ball.rotation.x += Math.random() * 0.05;
	ball.rotation.y += Math.random() * 0.05;
	ball.rotation.z += Math.random() * 0.05;

	if (madeBasket && ball.material.opacity > 0) {
		ball.material.opacity -= 0.04;
	}

	if (ballBody && !madeBasket && ballBody.position.y > 2.5) {
		// Add current ball position to trajectory points
		const position = new THREE.Vector3().copy(ballBody.position);
		trajectoryPoints.push(position);

		// Limit the number of points in the trajectory
		if (trajectoryPoints.length > maxTrajectoryPoints) {
			trajectoryPoints.shift();
		}

		// Update the trajectory tube
		if (trajectoryPoints.length > 1 && !isJumpBall) {
			if (trajectoryTube) {
				scene.remove(trajectoryTube);
				trajectoryTube.children.forEach((child) => {
					if (child.geometry) child.geometry.dispose();
					if (child.material) child.material.dispose();
				});
			}

			trajectoryTube = createDashedTube(trajectoryPoints, 5, 3);
			scene.add(trajectoryTube);
		}
	}

	renderer.render(scene, camera);
}
animate();

let lastTime, animationID;
function engineLoop(time) {
	if (!lastTime) {
		lastTime = time;
	}

	let deltaTime = (time - lastTime) / 1000;
	world.step(1 / 120, deltaTime * 1.5, 10);

	lastTime = time;
	animationID = requestAnimationFrame(engineLoop);
}
animationID = requestAnimationFrame(engineLoop);

function calculateParabolicVelocity(ballPosition, rimPosition, vertexHeight) {
	const g = 9.81;

	const highestY = Math.max(ballPosition.y, rimPosition.y) + vertexHeight;

	const timeToPeak = Math.sqrt((2 * (highestY - ballPosition.y)) / g);

	const totalTime = timeToPeak + Math.sqrt((2 * (highestY - rimPosition.y)) / g);

	const vx = (rimPosition.x - ballPosition.x) / totalTime;
	const vy = g * timeToPeak;
	const vz = (rimPosition.z - ballPosition.z) / totalTime;

	return { v: new CANNON.Vec3(vx, vy, vz), t: totalTime };
}

function calculatePracticalHeight(ballPosition, rimPosition) {
	const distance = Math.sqrt(Math.pow(ballPosition.x - rimPosition.x, 2) + Math.pow(ballPosition.z - rimPosition.z, 2));

	if (distance < 3) return 1;
	if (distance >= 25) return 6.5;

	return Math.floor((distance - 3) / 2) * 0.5 + 1.5;
}

function createDashedTube(trajectoryPoints, segmentLength, gapLength) {
	const dashedTubes = new THREE.Group();

	for (let i = 0; i < trajectoryPoints.length - 1; i += segmentLength + gapLength) {
		const startPoint = trajectoryPoints[Math.min(i, trajectoryPoints.length - 1)];
		const endPoint = trajectoryPoints[Math.min(i + segmentLength, trajectoryPoints.length - 1)];

		const curve = new THREE.LineCurve3(startPoint, endPoint);
		const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
		const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);

		dashedTubes.add(tube);
	}

	return dashedTubes;
}

function addRedXAtRim(redXPosition) {
	const material = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false });
	material.renderOrder = 1000;

	const line1Geometry = new THREE.BoxGeometry(0.1, 1, 0.1);
	const line1 = new THREE.Mesh(line1Geometry, material);
	line1.position.set(redXPosition.x, redXPosition.y, redXPosition.z);
	line1.rotation.z = Math.PI / 4;

	const line2Geometry = new THREE.BoxGeometry(0.1, 1, 0.1);
	const line2 = new THREE.Mesh(line2Geometry, material);
	line2.position.set(redXPosition.x, redXPosition.y, redXPosition.z);
	line2.rotation.z = -Math.PI / 4;

	const group = new THREE.Group();
	group.add(line1);
	group.add(line2);

	scene.add(group);

	let cameraPosition = new THREE.Vector3(camera.position.x, 0, camera.position.y + 10);
	let angle = Math.atan2(cameraPosition.x - redXPosition.x, cameraPosition.z - redXPosition.z);
	rotateAboutPoint(group, new THREE.Vector3(redXPosition.x, 0, redXPosition.z), new THREE.Vector3(0, 1, 0), angle, false);

	return group;
}

async function updatePlayerTexture(player, headshot) {
	let headshotImage = await getPlayerHeadshot(headshot);
	const texture = loader.load(headshotImage);
	player.material.map = texture;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function disableJumpBall() {
	isJumpBall = false;
}

function setCourtViewportHeight() {
	let point3D = new THREE.Vector3(0, 0, -7.5);

	// Project the point onto the screen
	let vector = point3D.clone();
	vector.project(camera);

	let pixelRatio = window.devicePixelRatio || 1;
	let y = ((1 - (vector.y * 0.5 + 0.5)) * renderer.domElement.height) / pixelRatio;

	if ($('#court').height() != 0) {
		$('#court').css('height', `${y + window.innerHeight / 20}px`);
	}
}
setCourtViewportHeight();

export { scene, world, playerGroup, ball, ballBody, redX, trajectoryTube, shootBasket, addPlayer, setCourtLogo, jumpBall, disableJumpBall, trajectoryPoints };
