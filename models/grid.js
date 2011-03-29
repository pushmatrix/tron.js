var Grid = function(rows, cols, cellWidth, cellHeight) {

  // Initialize
  this.rows = rows;
  this.cols = cols;
  this.cellWidth = cellWidth;
  this.cellHeight = cellHeight;

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
    
    gl.uniform4fv(shaderProgram.uColorUniform, new Float32Array([0,1,1,1]));
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    for (var i = 0; i <= rows; i++) {
      gl.drawArrays(gl.LINES, cols * 6 + 2, i * (cols * 6 + 2));
    }
  }
}