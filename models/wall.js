var Wall = function(height, startPos) {
  this.height = height;

  this.vertices = [startPos.x, startPos.y + 1, startPos.z];
  this.vertices = this.vertices.concat([startPos.x, startPos.y, startPos.z]);
  this.vertices = this.vertices.concat([startPos.x +5, startPos.y + 1, startPos.z]);
  this.vertices = this.vertices.concat([startPos.x +5, startPos.y, startPos.z]);
  
  this.vbo = gl.createBuffer();
  this.vbo.itemSize = 4;
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
  
  this.grow = function(position, corner) {
    if (!corner) {
      this.vertices[this.vertices.length - 6] = position.x;
      this.vertices[this.vertices.length - 4] = position.z;
      
      this.vertices[this.vertices.length - 3] = position.x;
      this.vertices[this.vertices.length - 1] = position.z;  
    } else {
      this.vertices = this.vertices.concat([position.x, position.y + 1, position.z]);
      this.vertices = this.vertices.concat([position.x, position.y, position.z]);
      this.vertices = this.vertices.concat([position.x, position.y + 1, position.z]);
      this.vertices = this.vertices.concat([position.x, position.y, position.z]);
      this.vbo.itemSize += 4;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
  
  }
  this.render = function() {
     gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
     gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
     gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vbo.itemSize);
  }
}
