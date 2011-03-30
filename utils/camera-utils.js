var gluLookAt = function(eyex, eyey, eyez, 
												 centerx, centery, centerz, 
												 upx, upy, upz) {
		
		console.log(eyex, eyey, eyez, 
                           												 centerx, centery, centerz, 
                           												 upx, upy, upz)
		var forward = vec3.create([centerx - eyex,
								 							 centery - eyey,
								 							 centerz - eyez]);
		
		var up = vec3.create([upx, upy, upz]);
		var side = vec3.create();
		
		var m = mat4.create();

    vec3.normalize(forward);
		
    /* Side = forward x up */
    vec3.cross(forward, up, side);


		vec3.normalize(side);
		

    /* Recompute up as: up = side x forward */
    vec3.cross(side, forward, up);
    
 
		mat4.identity(m);
		m[0] = side[0];
		m[4] = side[1];
		m[8] = side[2];
    
		m[1] = up[0];
		m[5] = up[1];
		m[9] = up[2];
    
		m[2] = -forward[0];
		m[6] = -forward[1];
		m[10] = -forward[2];

    var tmp = mat4.create();
    debugger;
		mat4.multiply(mvMatrix, m, mvMatrix);
		mat4.translate(mvMatrix, [-eyex, -eyey, -eyez]);
}