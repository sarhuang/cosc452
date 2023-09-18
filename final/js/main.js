/* SOURCES
* Among Us model and texture: https://sketchfab.com/3d-models/among-us-obj-ea2015c880bc438d9d26faffb553d6b6
* Asteroid model & texture: https://www.cgtrader.com/items/1016384/download-page
* Sun, stars texture: https://www.solarsystemscope.com/textures/
*/


// Ideally, we like to avoid global vars, a GL context lives as long as the window does
// So this is a case where it is understandable to have it in global space.
var gl = null;
var myShader = null;
var amongusDrawable = null;
var asteroidDrawable = null;
var sunDrawable = null;

var modelViewMatrix = null;
var projectionMatrix = null;
var normalMatrix = null;
var lightSource = null;
var globalTime = 0.0;
var parsedData = null;

//Textures
var amongusDiffuseTexture = null;
var amongusNormalTexture = null;
var asteroidDiffuseTexture = null;
var asteroidNormalTexture = null;
var sunDiffuseTexture = null;
var sunNormalTexture = null;

var uSampler = null;	
var uSamplerNormal = null;


function initBackground(){
	var bg = gl.createTexture();
	bg.Img = new Image();
	bg.Img.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, bg);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bg.Img);
	}
	bg.Img.src = "../shared/resources/textures/stars.jpg";
}	

function main() {
	const canvas = document.getElementById('glCanvas');
	// Initialize the GL context
	gl = canvas.getContext('webgl2');

	// Only continue if WebGL is available and working
	if (gl === null) {
		alert('Unable to initialize WebGL2. Contact the TA.');
		return;
	}

	// Set starry background
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	initBackground();

	// Clear the depth buffer
	gl.clearDepth(1.0);
	// Enable the depth function to draw nearer things over farther things
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.DEPTH_TEST);


	// Draw the scene repeatedly
	let then = 0.0;
	function render(now) {
		now *= 0.001;  // convert to seconds
		const deltaTime = now - then;
		then = now;

		drawScene(deltaTime);
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

	// The Projection matrix rarely needs updated.
	// Uncommonly, it is only modified in wacky sequences ("drunk" camera effect in GTAV)
	// or an artificial "zoom" using FOV (ARMA3)
	// Typically it is only updated when the viewport changes aspect ratio.
	// So, set it up here once since we won't let the viewport/canvas resize.
	const FOV = degreesToRadians(60);
	const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar  = 100.0;
	projectionMatrix = glMatrix.mat4.create();
	glMatrix.mat4.perspective(projectionMatrix,
			FOV,
			aspectRatio,
			zNear,
			zFar);

	// Setup Controls
	setupUI();

	// Right now, in draw, the scene will not render until the drawable is prepared
	// this allows us to acynchronously load content. If you are not familiar with async
	// that is a-okay! This link below should explain more on that topic:
	// https://blog.bitsrc.io/understanding-asynchronous-javascript-the-event-loop-74cd408419ff
	setupScene();
}



function setupUI() {
	// in index.html we need to setup some callback functions for the sliders
	// right now just have them report the values beside the slider.
	let sliders = ['cam', 'look'];
	let dims = ['X', 'Y', 'Z'];
	// for cam and look UI..
	sliders.forEach(controlType => {
		// for x, y, z control slider...
		dims.forEach(dimension => {
			let slideID = `${controlType}${dimension}`;
			console.log(`Setting up control for ${slideID}`);
			let slider = document.getElementById(slideID);
			let sliderVal = document.getElementById(`${slideID}Val`);
			// These are called "callback functions", essentially when the input
			// value for the slider or the field beside the slider change,
			// run the code we supply here!
			slider.oninput = () => {
				let newVal = slider.value;
				sliderVal.value = newVal;
			};
			sliderVal.oninput = () => {
				let newVal = sliderVal.value;
				slider.value = newVal;
			};
		});
	});	
}


function loadTexture(path){
	var tex = gl.createTexture();
	var img = new Image();
	img.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
	}
	img.src = path;
	return tex;
}


// Async as it loads resources over the network.
async function setupScene() {	
	let amongusObjData = await loadNetworkResourceAsText('../shared/resources/models/amongus.obj');
	let amongusVertSource = await loadNetworkResourceAsText('../shared/resources/shaders/verts/amongus300.vert');
	let amongusFragSource = await loadNetworkResourceAsText('../shared/resources/shaders/frags/amongus300.frag');
	amongusNormalTexture = loadTexture('../shared/resources/textures/amongus/Plastic_4K_Normal.jpg');
	amongusDiffuseTexture = loadTexture('../shared/resources/textures/amongus/Plastic_4K_Diffuse.jpg');
	amongusDrawable = initializeMyObject(amongusVertSource, amongusFragSource, amongusObjData, amongusDiffuseTexture, amongusNormalTexture);

	let asteroidObjData = await loadNetworkResourceAsText('../shared/resources/models/asteroid.obj');
    let asteroidVertSource = await loadNetworkResourceAsText('../shared/resources/shaders/verts/asteroid300.vert');
    let asteroidFragSource = await loadNetworkResourceAsText('../shared/resources/shaders/frags/asteroid300.frag');
	asteroidNormalTexture = loadTexture('../shared/resources/textures/asteroid/rock_Normal_DirectX.png');
    asteroidDiffuseTexture = loadTexture('../shared/resources/textures/asteroid/rock_Base_Color.png');
	asteroidDrawable = initializeMyObject(asteroidVertSource, asteroidFragSource, asteroidObjData, asteroidDiffuseTexture, asteroidNormalTexture);

	let sunObjData = await loadNetworkResourceAsText('../shared/resources/models/sphereTextured.obj');
    let sunVertSource = await loadNetworkResourceAsText('../shared/resources/shaders/verts/sun300.vert');
    let sunFragSource = await loadNetworkResourceAsText('../shared/resources/shaders/frags/sun300.frag');
    sunNormalTexture = loadTexture('../shared/resources/textures/amongus/Plastic_4K_Normal.jpg');
    sunDiffuseTexture = loadTexture('../shared/resources/textures/sun_diffuse_texture.jpg'); 
    sunDrawable = initializeMyObject(sunVertSource, sunFragSource, sunObjData, sunDiffuseTexture, sunNormalTexture);
}



function drawScene(deltaTime) {
	let dustSlider = document.getElementById("dustVal");
	globalTime += deltaTime;
	
	// Clear the color buffer with specified clear color
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const numAsteroids = 10;
	const asteroidPosX = [1.3, 0.5, 1.0, 1.2, -1.5, -1.8, 1.0, 0.8, -0.1, -0.3];
	const asteroidPosY = [0.5, 0.0, 1.5, -1.0, -1.0, -1.1, -1.1, 0.15, -1.0, 0.5];
	const asteroidPosZ = [-2.0, -4.0, -4.0, -2.0, -3.0, -2.0, -3.0, -2.0, -2.0, -2.0];
	const asteroidSizes = [0.5, 0.3, 0.5, 0.8, 0.4, 0.5, 0.3, 0.4, 0.3, 0.4];
	const asteroidRotations = [0.1, -0.14, 0.136, -0.132, -0.128, 0.123, 0.12, -0.132, 0.124, -0.16];
		
	if(asteroidDrawable != null){
		for(let i = 0; i < numAsteroids; i++){
			let modelMatrix = glMatrix.mat4.create();
			let objectWorldPos = [asteroidPosX[i], asteroidPosY[i], asteroidPosZ[i]];
			glMatrix.mat4.translate(modelMatrix, modelMatrix, objectWorldPos);
			glMatrix.mat4.rotate(modelMatrix, modelMatrix, globalTime * asteroidRotations[i], [-1.0, -1.0, -1.0]);
			let scaleMatrix = glMatrix.mat4.create();
			glMatrix.mat4.scale(scaleMatrix, scaleMatrix, [asteroidSizes[i], asteroidSizes[i], asteroidSizes[i]]);

			//Camera		
			let viewMatrix = glMatrix.mat4.create();
			let cameraPos = [0.0, 0.0, 0.0];
		    let cameraFocus = [0.0, 0.0, 0.0];
			glMatrix.mat4.lookAt(viewMatrix, cameraPos, cameraFocus, [0.0, 1.0, 0.0]);
			lightSource = cameraPos;
					
			//Combine
			modelViewMatrix = glMatrix.mat4.create();
			glMatrix.mat4.mul(modelViewMatrix, modelMatrix, scaleMatrix);
		    glMatrix.mat4.mul(modelViewMatrix, viewMatrix, modelViewMatrix);
		
			//Normal
			normalMatrix = glMatrix.mat4.create();
			glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
			glMatrix.mat4.transpose(normalMatrix, normalMatrix);
		
			asteroidDrawable.draw();
		}
	}

	if(amongusDrawable != null){
        let modelMatrix = glMatrix.mat4.create();
        let objectWorldPos = [0.0, 0.0, -6.0];
        let rotationAxis = [1.0, 1.0, 1.0];
        glMatrix.mat4.translate(modelMatrix, modelMatrix, objectWorldPos);
        glMatrix.mat4.rotate(modelMatrix, modelMatrix, globalTime * 0.1, rotationAxis);

        //Camera
        let viewMatrix = glMatrix.mat4.create();
        let cameraPos = [camXVal.value, camYVal.value, camZVal.value];
        let cameraFocus = [lookXVal.value, lookYVal.value, lookZVal.value];
        glMatrix.mat4.lookAt(viewMatrix, cameraPos, cameraFocus, [0.0, 1.0, 0.0]);
        lightSource = cameraPos;
	
        //Combine matrices
        modelViewMatrix = glMatrix.mat4.create();
        glMatrix.mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);

        //Normal matrix
        normalMatrix = glMatrix.mat4.create();
        glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
        glMatrix.mat4.transpose(normalMatrix, normalMatrix);

        amongusDrawable.draw();
    }

	if(sunDrawable != null){
        let modelMatrix = glMatrix.mat4.create();
        let objectWorldPos = [-3.4, -0.3, -5.0];
        let rotationAxis = [1.0, 1.0, 1.0];
        glMatrix.mat4.translate(modelMatrix, modelMatrix, objectWorldPos);
        glMatrix.mat4.rotate(modelMatrix, modelMatrix, globalTime * 0.05, rotationAxis);
        let scaleMatrix = glMatrix.mat4.create();
        glMatrix.mat4.scale(scaleMatrix, scaleMatrix, [2.0, 2.0, 2.0]);

        //Camera
        let viewMatrix = glMatrix.mat4.create();
        let cameraPos = [0.0, 0.0, 0.0];
        let cameraFocus = [0.0, 0.0, 0.0];
        glMatrix.mat4.lookAt(viewMatrix, cameraPos, cameraFocus, [0.0, 1.0, 0.0]);
		lightSource = cameraPos;
		
        //Combine
        modelViewMatrix = glMatrix.mat4.create();
        glMatrix.mat4.mul(modelViewMatrix, modelMatrix, scaleMatrix);
        glMatrix.mat4.mul(modelViewMatrix, viewMatrix, modelViewMatrix);

        //Normal
        normalMatrix = glMatrix.mat4.create();
        glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
        glMatrix.mat4.transpose(normalMatrix, normalMatrix);

        sunDrawable.draw();
    }
}





function initializeMyObject(vertSource, fragSource, objData, diffuseTexture, normalTexture) {
	myShader = new ShaderProgram(vertSource, fragSource); // this class is in shader.js
	parsedData = new OBJData(objData); // this class is in obj-loader.js
	let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

	// Generate Buffers on the GPU using the geometry data we pull from the obj
	let vertexPositionBuffer = new VertexArrayData( // this class is in vertex-data.js
			rawData.vertices, // What is the data?
			gl.FLOAT,         // What type should WebGL treat it as?
			3                 // How many per vertex?
			);
	
	let vertexNormalBuffer = new VertexArrayData(rawData.normals, gl.FLOAT, 3);
	let vertexTexCoordBuffer = new VertexArrayData(rawData.uvs, gl.FLOAT, 2);
	let vertexBarycentricBuffer = new VertexArrayData(rawData.barycentricCoords, gl.FLOAT, 3);

	/*
	   For any model that is smooth (non discrete) indices should be used, but we are learning! Maybe you can get this working later?
	   One indicator if a model is discrete: a vertex position has two normals.
	   A cube is discrete if only 8 vertices are used, but each vertex has 3 normals (each vertex is on the corner of three faces!)
	   The sphere and bunny obj models are smooth though */
	// getFlattenedDataFromModelAtIndex does not return indices, but getIndexableDataFromModelAtIndex would
	//let vertexIndexBuffer = new ElementArrayData(rawData.indices);

	// In order to let our shader be aware of the vertex data, we need to bind
	// these buffers to the attribute location inside of the vertex shader.
	// The attributes in the shader must have the name specified in the following object
	// or the draw call will fail, possibly silently!
	// Checkout the vertex shaders in resources/shaders/verts/* to see how the shader uses attributes.
	// Checkout the Drawable constructor and draw function to see how it tells the GPU to bind these buffers for drawing.
	let bufferMap = {
		'aVertexPosition': vertexPositionBuffer,
		'aBarycentricCoord': vertexBarycentricBuffer,
		'aVertexNormal': vertexNormalBuffer, 
		'aVertexTexCoord': vertexTexCoordBuffer 
	};

	let myDrawable = new Drawable(myShader, bufferMap, null, rawData.vertices.length / 3);

	// Checkout the drawable class' draw function. It calls a uniform setup function every time it is drawn. 
	// Put your uniforms that change per frame in this setup function
	myDrawable.uniformLocations = myShader.getUniformLocations(['uModelViewMatrix', 'uProjectionMatrix', 'uNormalMatrix', 
																'uSampler', 'uSamplerNormal', 'uCameraPosition']);
	myDrawable.uniformSetup = () => {
		gl.uniformMatrix4fv(myDrawable.uniformLocations.uProjectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(myDrawable.uniformLocations.uModelViewMatrix, false, modelViewMatrix);
		gl.uniformMatrix4fv(myDrawable.uniformLocations.uNormalMatrix, false, normalMatrix);
		gl.uniform3fv(myDrawable.uniformLocations.uCameraPosition, lightSource);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
		gl.uniform1i(myDrawable.uniformLocations.uSampler, 0);
		gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, normalTexture);
		gl.uniform1i(myDrawable.uniformLocations.uSamplerNormal, 1);
	};

	return myDrawable;
}

// After all the DOM has loaded, we can run the main function.
window.onload = main;
