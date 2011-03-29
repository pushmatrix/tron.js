var grid;
var bike;
var gl;

var oldX = 0;
var oldY = 0;
var rotationX = 0;
var rotationY = 0;

var deltaX = 0;
var deltaY = 0;
var dragging = false;
var elapsed = Date.now();
   function initGL(canvas) {
       try {
           gl = canvas.getContext("experimental-webgl");
           gl.viewportWidth = canvas.width;
           gl.viewportHeight = canvas.height;
       } catch (e) {
       }
       if (!gl) {
           alert("Could not initialise WebGL, sorry :-(");
       }
   }


   function getShader(gl, id) {
       var shaderScript = document.getElementById(id);
       if (!shaderScript) {
           return null;
       }

       var str = "";
       var k = shaderScript.firstChild;
       while (k) {
           if (k.nodeType == 3) {
               str += k.textContent;
           }
           k = k.nextSibling;
       }

       var shader;
       if (shaderScript.type == "x-shader/x-fragment") {
           shader = gl.createShader(gl.FRAGMENT_SHADER);
       } else if (shaderScript.type == "x-shader/x-vertex") {
           shader = gl.createShader(gl.VERTEX_SHADER);
       } else {
           return null;
       }

       gl.shaderSource(shader, str);
       gl.compileShader(shader);

       if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
           alert(gl.getShaderInfoLog(shader));
           return null;
       }

       return shader;
   }


   var shaderProgram;

   function initShaders() {
       var fragmentShader = getShader(gl, "shader-fs");
       var vertexShader = getShader(gl, "shader-vs");

       shaderProgram = gl.createProgram();
       gl.attachShader(shaderProgram, vertexShader);
       gl.attachShader(shaderProgram, fragmentShader);
       gl.linkProgram(shaderProgram);

       if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
           alert("Could not initialise shaders");
       }

       gl.useProgram(shaderProgram);

       shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
       gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

       shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
       gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
       
       shaderProgram.uColorUniform = gl.getUniformLocation(shaderProgram, "uVertexColor");
       shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
       shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
       shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
   }



var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function color3(r, g, b) {
  gl.uniform4fv(shaderProgram.uColorUniform, new Float32Array([r, g, b, 1]));
}



function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}



var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;



function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  //mat4.translate(mvMatrix, [0, -2.0, -22.0]);
  mat4.rotate(mvMatrix, rotationY, [1, 0, 0]); // Rotate 90 degrees around the Y axis
  
  mat4.rotate(mvMatrix, rotationX, [0, 1, 0]); // Rotate 90 degrees around the Y axis
  
  //mat4.translate(mvMatrix, [-5.0, 0, -5]);

	gluLookAt(0,10,0,-5,0,5,0,1,0);
  setMatrixUniforms();
  grid.render();
  bike.render();
}


function webGLStart() {
  var canvas = document.getElementById("canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  initShaders();

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  grid = new Grid(10, 10, 1, 1);
  var startPos = {'x': 2, 'y': 0, 'z': 2};
  bike = new Bike(startPos, 4, grid, 0);
  
  (function animloop(){
    requestAnimFrame(animloop, gl);
    update();
    drawScene();
    })();

}

function mouseMove(event) {
  if (dragging) {
    var x = event.clientX;
    var y = event.clientY;

    deltaX = x - oldX;
    oldX = x;
    rotationX += deltaX/15.0;

    deltaY = y - oldY;
    oldY = y;
    rotationY += deltaY/15.0;
  }
}
this.onmousemove = mouseMove;

function mouseDown(event) {
  dragging = true;
  
  var x = event.clientX;
  var y = event.clientY;
  
  oldX = x;
  oldY = y;
}
this.onmousedown = mouseDown;

function mouseUp(event) {
  dragging = false;
}
this.onmouseup = mouseUp;

function update() {
  var timestep = (Date.now() - elapsed) * 0.001;
  elapsed = Date.now();
  bike.update(timestep);
}

function keypress(event) {
  var key = event.charCode;
  if (key == 97) {
    bike.nextDirection.x = bike.direction.y;
    bike.nextDirection.y = -bike.direction.x;
  }
  else if (key == 115) {
    bike.nextDirection.x = -bike.direction.y;
    bike.nextDirection.y = bike.direction.x;
  }
}
this.onkeypress = keypress;


