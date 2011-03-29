var Grid = function(rows, cols, cellWidth, cellHeight) {

  // Initialize
  this.rows = rows;
  this.cols = cols;
  this.cellWidth = cellWidth;
  this.cellHeight = cellHeight;
  
  // Make the map for collisions
  this.map = [];
  for (var i = 0; i <= rows + 1; i++) {
    for (var j = 0; j <= cols + 1; j++) {
      map = [0];
    }
  }

  this.vbo = gl.createBuffer();

  var vertices = [];

  // Generate the grid
  for (var i = 0; i <= rows ; i++) {
    for (var j = 0; j < cols; j++) {
      vertices = vertices.concat([i * cellWidth, 0.0, j * cellHeight]);
      vertices = vertices.concat([(i + 1) * cellHeight, 0.0, j * cellWidth]);
      
      vertices = vertices.concat([i * cellWidth, 0.0, j * cellHeight]);
      vertices = vertices.concat([i * cellWidth, 0.0, (j + 1) * cellWidth]);
      
      vertices = vertices.concat([(i + 1) * cellWidth, 0.0, j * cellHeight]);
      vertices = vertices.concat([(i + 1) * cellWidth, 0.0, (j + 1) * cellWidth]);
    }
    vertices = vertices.concat([i * cellWidth, 0.0, (cols) * cellWidth]);
    vertices = vertices.concat([(i + 1) * cellWidth, 0.0, (cols) * cellWidth]);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


  this.render = function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    
    color3(0,1,1);
    gl.uniform4fv(shaderProgram.uColorUniform, new Float32Array([0,1,1,1]));
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    for (var i = 0; i <= rows; i++) {
      gl.drawArrays(gl.LINES, cols * 6 + 2, i * (cols * 6 + 2));
    }
  }
  
  this.cellType = function(coord) {
    if (coord.y > cols || coord.x > rows || coord.x < 0 || coord.y < 0) {
      return -1;
    }
    var index = coord.y * cols + coord.x;
    if (map[index]) {
      return 1;
    } 
    else {
      map[index] = 1;
      return 0;
    }
  }
  
  this.setWall = function(coord) {
    var index = coord.y * cols + coord.x;
    map[index] = 1;
  }
  
  this.reset = function(coord) {
    
  }
}