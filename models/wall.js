var Wall = function(height, startPos) {
  this.height = height;
  this.vertices = [startPos, startPos];
  
  this.grow = function(position, corner) {
    if (corner) {
      this.vertices[this.vertices.length -1];      
    } else {
      this.vertices.push(position);
    }
  }
  
  this.draw = function() {
    
  }
}
