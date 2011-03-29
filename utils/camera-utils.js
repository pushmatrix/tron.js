var gluLookAt = function(eyex, eyey, eyez, 
												 centerx, centery, centerz, 
												 upx, upy, upz) {
		
		var forward = vec3.create([centerx - eyex,
								 							 centery - eyey,
								 							 centerz - eyez]);
		
		var up = vec3.create([upx, upy, upz]);
		var side = vec3.create();
		
		var m = mat4.create();

    vec3.normalize(forward);
		vec3.normalize(up);
		
    /* Side = forward x up */
    vec3.cross(forward, up, side);

    /* Recompute up as: up = side x forward */
    vec3.cross(side, forward, up);

		mat4.identity(m);
		m[0] = side[0];
		m[1] = side[1];
		m[2] = side[2];
    
		m[4] = up[0];
		m[5] = up[1];
		m[6] = up[2];
    
		m[8] = -forward[0];
		m[9] = -forward[1];
		m[10] = -forward[2];

		mat4.multiply(m, mvMatrix, mvMatrix);
		mat4.translate(mvMatrix, [-eyex, -eyey, -eyez]);
}