TextureUtils = function() {
  var handleLoadedTexture = function(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  
  var createTexture = function(filepath) {
    // Create & assign a texture to it.
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function() { handleLoadedTexture(texture) };
    texture.image.src = filepath + '?v=' + Math.random(); // prevents caching.
    return texture;
  }
  
  return { 
    createTexture: createTexture 
  }
}();