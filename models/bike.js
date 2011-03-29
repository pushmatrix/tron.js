var Bike = function(startPos, speed, grid, color) {
  this.speed = speed;
  this.startPos = startPos;
  this.position = {x: startPos.x, y: 0.0, z: startPos.z };
  this.grid = grid;
  this.color = color;
  this.direction = {x: 1, y: 0};
  this.nextDirection = {x: 0, y: 0};
  this.turnTravel = 0;

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
      
      distance -= this.grid.cellWidth - this.partial;
      this.partial = 0;
      if (this.nextDirection.x != 0 || this.nextDirection.y != 0) {
        this.direction.x = this.nextDirection.x;
        this.direction.y = this.nextDirection.y;
        this.nextDirection.x = 0;
        this.nextDirection.y = 0;
        this.turnTravel = 0;
        // grow wall
      }
      // handle collision
      
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
    

    // grow wall
  }
    
    
  /*
     GLfloat distance = d_speed * timestep;
      if (d_partial + distance >= grid.d_cellWidth) {
        d_position.x() += d_direction.x() * (grid.d_cellWidth - d_partial);
        d_position.z() += d_direction.y() * (grid.d_cellWidth - d_partial);
        d_cellPos += d_direction;
        distance -= grid.d_cellWidth - d_partial;
        d_partial = 0;
        // If there is a turn.
        if (d_nextDirection.x() != 0 || d_nextDirection.y() != 0) {
          d_direction.x() = d_nextDirection.x();
          d_direction.y() = d_nextDirection.y();
          d_nextDirection.x() = 0;
          d_nextDirection.y() = 0;
          d_turnTravel = 0;
          d_wall.grow(d_position, true);
        }
        if (grid.cellType(d_cellPos) != 0) {
          d_speed = 0;
        }
      }
      while (distance >= grid.d_cellWidth) {
        d_position.x() += d_direction.x() * (grid.d_cellWidth);
        d_position.z() += d_direction.y() * (grid.d_cellWidth);
        d_cellPos += d_direction;
        distance -= grid.d_cellWidth;
        if (grid.cellType(d_cellPos) != 0) {
          d_speed = 0;
        }
      }
      d_partial += distance;
      d_turnTravel += distance;
      d_position.x() += d_direction.x() * distance;
      d_position.z() += d_direction.y() * distance;
      if(d_turnTravel > getDepth()) {
        d_wall.grow(d_position, false);
      }
    */
  
  this.render = function() {
    mvPushMatrix();
    color3(1,1,1);
    mat4.translate(mvMatrix, [this.position.x, this.position.y, this.position.z]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vbo.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.ibo);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.ibo.itemSize, gl.FLOAT, false, 0, 0);
    
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, this.ibo.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();
  }
  
}