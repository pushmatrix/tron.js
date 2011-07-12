var grid;
var players = [];
var currentPlayer = 0;
var otherPlayer = 1;
var startPositions = [];
var gl;

var oldX = 0;
var oldY = 0;
var rotationX = 8.7;
var rotationY = 120;

var deltaX = 0;
var deltaY = 0;
var dragging = false;
var elapsed = Date.now();

var speed = 8;
var currentProgram;
var crateGif;
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
            console.log("shader not found!");
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
         console.log("couldn't determine whether fragment or vertex shader.")
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
   var shaderProgram2;
   var textureShaderProgram;
   var glowHorizProgram;
   var glowVertProgram;


   var rttFramebuffer;
   var rttTexture; 
   var basicSquare = {};
   function initTextureFrameBuffer() {
     
     basicSquare.vertices = [-1, 1, 0,
                              -1, -1, 0,
                              1, 1, 0,
                              1, -1, 0];
     basicSquare.vbo = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, basicSquare.vbo);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(basicSquare.vertices), gl.STATIC_DRAW);
     basicSquare.vbo.itemSize = 3;
     basicSquare.vbo.numItems = 4;
     
     basicSquare.texCoords = [0, 1, 0, 0, 1, 1, 1, 0];
     basicSquare.textureIBO = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, basicSquare.textureIBO);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(basicSquare.texCoords), gl.STATIC_DRAW);
     
     
     rttFramebuffer = gl.createFramebuffer();
     gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
     rttFramebuffer.width = 512;
     rttFramebuffer.height = 512;

     rttTexture = gl.createTexture();
     gl.bindTexture(gl.TEXTURE_2D, rttTexture);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
     gl.generateMipmap(gl.TEXTURE_2D);
     
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
     
     var renderbuffer = gl.createRenderbuffer();
     gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
     gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
     gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
     
     gl.bindTexture(gl.TEXTURE_2D, null);
     gl.bindRenderbuffer(gl.RENDERBUFFER, null);
     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
   }
   
   function initShaders() {
       var fragmentShader = getShader(gl, "shader-fs");
       var vertexShader = getShader(gl, "shader-vs");
       
       var fragmentShader2 = getShader(gl, "texture-shader-fs");
       var vertexShader2 = getShader(gl, "shader-vs2");
       
       var textureFragmentShader = getShader(gl, "texture-shader-fs");
      
       var glowHorizShader = getShader(gl, "horiz-glow-fs");
       var glowVertShader = getShader(gl, "vert-glow-fs");

        
       glowHorizProgram = gl.createProgram();
       gl.attachShader(glowHorizProgram, vertexShader2);
       gl.attachShader(glowHorizProgram, glowHorizShader);
       gl.linkProgram(glowHorizProgram);
       
       glowVertProgram = gl.createProgram();
       gl.attachShader(glowVertProgram, vertexShader2);
       gl.attachShader(glowVertProgram, glowVertShader);
       gl.linkProgram(glowVertProgram);  
        
       shaderProgram = gl.createProgram();
       gl.attachShader(shaderProgram, vertexShader);
       gl.attachShader(shaderProgram, fragmentShader);
       gl.linkProgram(shaderProgram);
       
       shaderProgram2 = gl.createProgram();
        gl.attachShader(shaderProgram2, vertexShader2);
        gl.attachShader(shaderProgram2, fragmentShader2);
        gl.linkProgram(shaderProgram2);
       
       textureShaderProgram = gl.createProgram();
        gl.attachShader(textureShaderProgram, vertexShader);
        gl.attachShader(textureShaderProgram, textureFragmentShader);
        gl.linkProgram(textureShaderProgram);

       if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
           alert("Could not initialise shaders");
       }

       gl.useProgram(shaderProgram);

       shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
       gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

       shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
      // gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
       
       shaderProgram.uColorUniform = gl.getUniformLocation(shaderProgram, "uVertexColor");
       shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
       shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
       shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
       
       
       shaderProgram2.vertexPositionAttribute = gl.getAttribLocation(shaderProgram2, "aVertexPosition");
       gl.enableVertexAttribArray(shaderProgram2.vertexPositionAttribute);

        shaderProgram2.textureCoordAttribute = gl.getAttribLocation(shaderProgram2, "aTextureCoord");
        //gl.enableVertexAttribArray(shaderProgram2.textureCoordAttribute);

        shaderProgram2.uColorUniform = gl.getUniformLocation(shaderProgram2, "uVertexColor");
        shaderProgram2.pMatrixUniform = gl.getUniformLocation(shaderProgram2, "uPMatrix");
        shaderProgram2.mvMatrixUniform = gl.getUniformLocation(shaderProgram2, "uMVMatrix");
        shaderProgram2.samplerUniform = gl.getUniformLocation(shaderProgram2, "uSampler");
      // gl.useProgram(shaderProgram);
       
      
       
       glowHorizProgram.vertexPositionAttribute = gl.getAttribLocation(glowHorizProgram, "aVertexPosition");
        gl.enableVertexAttribArray(glowHorizProgram.vertexPositionAttribute);

         glowHorizProgram.textureCoordAttribute = gl.getAttribLocation(glowHorizProgram, "aTextureCoord");
         //gl.enableVertexAttribArray(shaderProgram2.textureCoordAttribute);
       
       glowHorizProgram.uColorUniform = gl.getUniformLocation(glowHorizProgram, "uVertexColor");
       glowHorizProgram.pMatrixUniform = gl.getUniformLocation(glowHorizProgram, "uPMatrix");
       glowHorizProgram.mvMatrixUniform = gl.getUniformLocation(glowHorizProgram, "uMVMatrix");
       glowHorizProgram.samplerUniform = gl.getUniformLocation(glowHorizProgram, "uSampler");
       
       glowVertProgram.vertexPositionAttribute = gl.getAttribLocation(glowVertProgram, "aVertexPosition");
         gl.enableVertexAttribArray(glowVertProgram.vertexPositionAttribute);

          glowVertProgram.textureCoordAttribute = gl.getAttribLocation(glowVertProgram, "aTextureCoord");

        glowVertProgram.uColorUniform = gl.getUniformLocation(glowVertProgram, "uVertexColor");
        glowVertProgram.pMatrixUniform = gl.getUniformLocation(glowVertProgram, "uPMatrix");
        glowVertProgram.mvMatrixUniform = gl.getUniformLocation(glowVertProgram, "uMVMatrix");
        glowVertProgram.samplerUniform = gl.getUniformLocation(glowVertProgram, "uSampler");
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

function changeShaderProgram(program) {
  currentProgram = program;
  gl.useProgram(program);
  setMatrixUniforms();
}

function color3(r, g, b) {
  gl.uniform4fv(currentProgram.uColorUniform, new Float32Array([r, g, b, 1]));
}


function setMatrixUniforms() {
  gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);
}



var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;


function drawScene() {
  mvPushMatrix();
  changeShaderProgram(shaderProgram);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(60, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  mat4.translate(mvMatrix, [0, -2.0, -22.0]);
  mat4.rotate(mvMatrix, rotationY, [1, 0, 0]); // Rotate 90 degrees around the Y axis
  
  mat4.rotate(mvMatrix, rotationX, [0, 1, 0]); // Rotate 90 degrees around the Y axis
  
  mat4.translate(mvMatrix, [-5.0, 0, -5]);

  /*
	gluLookAt(player1.camera.xPos, 4, player1.camera.zPos,
	          player1.position.x, player1.position.y, player1.position.z,
	          0, 1, 0 );
	    */
  setMatrixUniforms();
  //..gl.useProgram(shaderProgram2);
  grid.render();
  
  players[0].render();
  if (players[1]) {
    players[1].render();
  }
  
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
  gl.viewport(0, 0, rttFramebuffer.width, rttFramebuffer.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  grid.render();
  players[0].render();
  if( players[1]) {
    players[1].render();
  }
  
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  changeShaderProgram(glowHorizProgram);
  gl.enableVertexAttribArray(currentProgram.textureCoordAttribute);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, rttTexture);
  gl.uniform1i(currentProgram.samplerUniform, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, basicSquare.vbo);
          gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

          gl.bindBuffer(gl.ARRAY_BUFFER, basicSquare.textureIBO);
          gl.vertexAttribPointer(currentProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.disableVertexAttribArray(currentProgram.textureCoordAttribute);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  changeShaderProgram(glowVertProgram);
  gl.enableVertexAttribArray(currentProgram.textureCoordAttribute);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, rttTexture);
  gl.uniform1i(currentProgram.samplerUniform, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, basicSquare.vbo);
          gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

          gl.bindBuffer(gl.ARRAY_BUFFER, basicSquare.textureIBO);
          gl.vertexAttribPointer(currentProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.disableVertexAttribArray(currentProgram.textureCoordAttribute);
  gl.disable(gl.BLEND);
  
  mvPopMatrix();
}


function webGLStart() {
  var canvas = document.getElementById("canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  initTextureFrameBuffer();
  initShaders();
  
  changeShaderProgram(shaderProgram);
   

  crateGif = TextureUtils.createTexture("crate.gif");
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  grid = new Grid(20, 20, 1, 1);
  startPositions[0] = {'x': 1, 'y': 0, 'z': 15};
  players[0] = new Bike(startPositions[0], speed, grid, {x: 0.9, y: 0.4, z: 0.1}, sendGameState);
  
  (function animloop(){
    requestAnimFrame(animloop, gl);
    update();
    drawScene();
    })();
    
    
    now.startGame = function(_startPositions, playerIndex) {
      console.log("GAME START!");
      startPositions = _startPositions;
      currentPlayer = playerIndex;
      otherPlayer = currentPlayer == 1 ? 0 : 1;
      resetGame();
    }
    
    now.receiveMsg = function(msg) {
      console.log(msg);
      players[otherPlayer].position = msg['position'];
      players[otherPlayer].direction = msg['direction'];
      players[otherPlayer].angle = msg['angle'];
      players[otherPlayer].wall.grow(msg['position'], true);
    }

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
  players[0].update(timestep);
  if (players[1]){
    players[1].update(timestep);
  }
}

function keypress(event) {
  var key = String.fromCharCode(event.charCode);
  switch (key) {
      case "a": 
        players[currentPlayer].turnLeft(); 
        break;
      case "s": 
        players[currentPlayer].turnRight(); 
        break;
      case "r": 
        now.resetGame();
        break
    }
//  players[currentPlayer].
}

var sendGameState = function() {
  var msg = { direction: players[currentPlayer].direction, position: players[currentPlayer].position, angle: players[currentPlayer].angle }
  try { now.sendMsg(msg); } catch(err) {console.log(err)}
}

function resetGame() {
  grid = new Grid(20, 20, 1, 1);
  players[currentPlayer] = new Bike(startPositions[currentPlayer], speed, grid, {x: 0.9, y: 0.4, z: 0.1}, sendGameState);
  
  players[otherPlayer] = new Bike(startPositions[otherPlayer], speed, grid, {x: 0.1, y: 1, z: 1});
}
this.onkeypress = keypress;


