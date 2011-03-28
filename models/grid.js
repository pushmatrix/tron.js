var Grid = function(rows, cols, cellWidth, cellHeight) {

  // Initialize
  this.rows = rows;
  this.cols = cols;
  this.cellWidth = cellWidth;
  this.cellHeight = cellHeight;

  this.vbo = gl.createBuffer();
  // Create & assign a texture to it.
  this.texture = TextureUtils.createTexture('textures/grid.gif');

  var vertices = [];
  var possibleTexCoords = [1, 0, 0, 0, 1, 1, 0, 1];
  var texCoords = [];
  var index = 0;
  var texIndex = 0;

  // Generate the grid
  for (var i = 0; i <= rows ; i++) {
    for (var j = 0; j <= cols; j++) {
      vertices = vertices.concat([i * cellWidth, 0.0, j * cellHeight]);
      vertices = vertices.concat([(i + 1) * cellHeight, 0.0, j * cellWidth]);

      texCoords = texCoords.concat(possibleTexCoords[texIndex++ % 8], possibleTexCoords[texIndex++ % 8]);
      texCoords = texCoords.concat(possibleTexCoords[texIndex++ % 8], possibleTexCoords[texIndex++ % 8]);
    }
  }

  this.texture.vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.texture.vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


  this.render = function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texture.vbo);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);


    for (var i = 0; i < rows; i++) {
      gl.drawArrays(gl.TRIANGLE_STRIP, i * (cols + 1) * 2, (cols + 1) * 2);
    }
  }
}