var Bike = function(startPos, speed, grid, color) {
  this.speed = speed;
  this.startPos = startPos;
  this.cellPos = { x:startPos.x, y: startPos.z };
  this.position = { x: startPos.x, y: 0.0, z: startPos.z };
  this.grid = grid;
  this.color = color;
  this.direction = { x: 1, y: 0 };
  this.nextDirection = { x: 0, y: 0 };
  this.turnTravel = 0;
  this.wall = new Wall(1, startPos);
  // set a wall on the starting position
  this.grid.setWall(this.cellPos);
  

  this.vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
  var vertices = [
  // Front face
  -0.4, -0.4,  0.4,
  0.4, -0.4,  0.4,
  0.4,  0.4,  0.4,
  -0.4,  0.4,  0.4,

  // Back face
  -0.4, -0.4, -0.4,
  -0.4,  0.4, -0.4,
  0.4,  0.4, -0.4,
  0.4, -0.4, -0.4,

  // Top face
  -0.4,  0.4, -0.4,
  -0.4,  0.4,  0.4,
  0.4,  0.4,  0.4,
  0.4,  0.4, -0.4,

  // Bottom face
  -0.4, -0.4, -0.4,
  0.4, -0.4, -0.4,
  0.4, -0.4,  0.4,
  -0.4, -0.4,  0.4,

  // Right face
  0.4, -0.4, -0.4,
  0.4,  0.4, -0.4,
  0.4,  0.4,  0.4,
  0.4, -0.4,  0.4,

  // Left face
  -0.4, -0.4, -0.4,
  -0.4, -0.4,  0.4,
  -0.4,  0.4,  0.4,
  -0.4,  0.4, -0.4,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  this.vbo.itemSize = 3;
  this.vbo.numItems = 24;

  this.ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
  var cubeVertexIndices = [
  0, 1, 2,      0, 2, 3,    // Front face
  4, 5, 6,      4, 6, 7,    // Back face
  8, 9, 10,     8, 10, 11,  // Top face
  12, 13, 14,   12, 14, 15, // Bottom face
  16, 17, 18,   16, 18, 19, // Right face
  20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
  this.ibo.itemSize = 1;
  this.ibo.numItems = 36;
  
  
  this.partial = 0;
  this.update = function(timestep) {
  
    var distance = this.speed * timestep;
    if (this.partial + distance >= grid.cellWidth) {
      this.position.x += this.direction.x * (this.grid.cellWidth - this.partial);
      this.position.z += this.direction.y * (this.grid.cellWidth - this.partial);
      this.cellPos.x += this.direction.x;
      this.cellPos.y += this.direction.y;
      
      distance -= this.grid.cellWidth - this.partial;
      this.partial = 0;
      if (this.nextDirection.x != 0 || this.nextDirection.y != 0) {
        this.direction.x = this.nextDirection.x;
        this.direction.y = this.nextDirection.y;
        this.nextDirection.x = 0;
        this.nextDirection.y = 0;
        this.turnTravel = 0;
        this.wall.grow(this.position, true);
      }
      if (grid.cellType(this.cellPos) != 0) {
        this.speed = 0;
      }
      
    }
    while( this.distance >= this.grid.cellWidth ) {
      this.position.x += this.direction.x * this.grid.cellWidth;
      this.position.z += this.direction.y * this.grid.cellWidth;
      //update cellpos
      this.distance -= this.grid.cellWidth;
      //check collision
      
    }
    this.partial += distance;
    this.turnTravel += distance;
    this.position.x += this.direction.x * distance;
    this.position.z += this.direction.y * distance;
    
    if (this.turnTravel > 0.1) {
      this.wall.grow(this.position, false);
    }

  }
  
  this.turnLeft = function() {
    this.nextDirection.x = this.direction.y;
    this.nextDirection.y = -this.direction.x;
  }
  
  this.turnRight = function() {
    this.nextDirection.x = -this.direction.y;
    this.nextDirection.y = this.direction.x;
  }
  
  this.render = function() {
    color3(this.color.x, this.color.y, this.color.z);
    this.wall.render();
    mvPushMatrix();
    mat4.translate(mvMatrix, [this.position.x, this.position.y, this.position.z]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vbo.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.ibo);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.ibo.itemSize, gl.FLOAT, false, 0, 0);
    
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, this.ibo.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();
    setMatrixUniforms();
  }
  
}