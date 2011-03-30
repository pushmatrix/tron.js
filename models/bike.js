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
  this.angle = -Math.PI * 0.5;
  this.wall = new Wall(1, startPos);
  // set a wall on the starting position
  this.grid.setWall(this.cellPos);
  

  this.vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
  
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bikeMesh.vertices), gl.STATIC_DRAW);
  this.vbo.itemSize = 3;
  this.vbo.numItems = bikeMesh.vertices.length;

  this.ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bikeMesh.indices), gl.STATIC_DRAW);
  this.ibo.itemSize = 1;
  this.ibo.numItems = bikeMesh.indices.length;
  
  
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
    
    //if (this.turnTravel > 4) {
      this.wall.grow(this.position, false);
   // }

  }
  
  this.turnLeft = function() {
    this.nextDirection.x = this.direction.y;
    this.nextDirection.y = -this.direction.x;
    this.angle += Math.PI * 0.5;
  }
  
  this.turnRight = function() {
    this.nextDirection.x = -this.direction.y;
    this.nextDirection.y = this.direction.x;
    this.angle -= Math.PI * 0.5;
  }
  
  this.render = function() {
    color3(this.color.x, this.color.y, this.color.z);
    this.wall.render();
    mvPushMatrix();
    mat4.translate(mvMatrix, [this.position.x, this.position.y, this.position.z]);
    mat4.rotate(mvMatrix, this.angle, [0, 1, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, this.vbo.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.ibo);
    gl.vertexAttribPointer(currentProgram.textureCoordAttribute, this.ibo.itemSize, gl.FLOAT, false, 0, 0);
    
    mat4.scale(mvMatrix, [0.3, 0.3, 0.3]);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, this.ibo.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();
    setMatrixUniforms();
  }
  
}