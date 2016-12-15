window.onload = function(){


	var isStatic = getParameterByName( 'static' ) === 'true';

	console.log( "isStatic", isStatic );


	// THE USUAL SUSPECTS
	var scene = new THREE.Scene(),
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
		renderer = new THREE.WebGLRenderer(),
		controls = new THREE.OrbitControls( camera );

    	projector = new THREE.Projector();
        var selectedFaces = [];
        
	camera.position.z = 600;
	renderer.autoClear = false;
	controls.noZoom = false;
	controls.noPan = true;

	document.querySelector( '#container' ).appendChild( renderer.domElement );


	function resize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		cubeCamera.aspect = window.innerWidth / window.innerHeight;
		cubeCamera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}




	// SKYBOX


	var cubeCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		cubeScene = new THREE.Scene();


	var path = "models/",
		format = '.jpg',
		urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var textureCube = THREE.ImageUtils.loadTextureCube( urls );
	var shader = THREE.ShaderLib[ "cube" ];
		shader.uniforms[ "tCube" ].value = textureCube;

	var material = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		side: THREE.BackSide,
		depthWrite: false

	} ),

	mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
	cubeScene.add( mesh );



	///


	var NUM_VERTS 	= 50, //isStatic ? 3000 : 100,
		RADIUS 		= 200,
		SPEED 		= 0.01,
		vertices 	= [],
		quaternion 	= new THREE.Quaternion,
		geometry 	= new THREE.Geometry();

    var allVertices;
	// Since we're moving the vertices every frame, make it dynamic
	geometry.dynamic = true;


	// Create some vertices
	i = NUM_VERTS;
	while( i-- > 0 ){ 

		// Set up some initial positions
		geometry.vertices[i] = new THREE.Vector3(
			( Math.random()) * 100.0, 
			( Math.random()) * 10.0, 
			( Math.random()) * 100.0
		);
        if(geometry.vertices[i].x < 20){
            geometry.vertices[i].y += Math.random() * 100;
        }

		vertices[i] = {
			vertex: geometry.vertices[i],
			axis: new THREE.Vector3(
				( Math.random() + 0.01 ) * 2.0 - 1.0, 
				( Math.random() + 0.01 ) * 2.0 - 1.0, 
				( Math.random() + 0.01 ) * 2.0 - 1.0
			),
			velocity: (( Math.random() * 2.0 ) + 0.3 ) * SPEED
		}

	}

    //
    
    

    
    function concaveHull(convexHull) {
    console.log("made it");
    var countDigs = 0;
        var digThreashHold = 3;
    
        //console.log(convexHull);
        //console.log("oldVertices " + convexHull.oldVertices.length);
        //console.log("edges " + convexHull.edge.length);
        //console.log("faces " + convexHull.faces.length);
        //console.log(convexHull.vertices.length + " " + oldVertices.vertices.length);
        //console.log(convexHull.faces);
        
        concaveList = {};//{a:1.b:1,c:1}
        var inHull = new Set();

        var verticesInHull = {};
        var infaces = {};
        

        
        for(var i=0;i<convexHull.faces.length;i++){
            if(verticesInHull.hasOwnProperty((convexHull.faces[i].a).toString())){
                verticesInHull[convexHull.faces[i].a] += 1;
                
            }else {
                verticesInHull[convexHull.faces[i].a] = 1;
                inHull.add(convexHull.faces[i].a);
                
            }
            if(verticesInHull.hasOwnProperty((convexHull.faces[i].b).toString())){
                verticesInHull[convexHull.faces[i].b] += 1;
            }else {
                verticesInHull[convexHull.faces[i].b] = 1;
                inHull.add(convexHull.faces[i].b);
            }
            if(verticesInHull.hasOwnProperty((convexHull.faces[i].c).toString())){
                verticesInHull[convexHull.faces[i].c] += 1;
            }else {
                verticesInHull[convexHull.faces[i].c] = 1;
                inHull.add(convexHull.faces[i].c);
            }
            concaveList[i] = {}; // making sure we copy values, not create new pointer to old geometry
            concaveList[i].a = convexHull.faces[i].a;
            concaveList[i].b = convexHull.faces[i].b;
            concaveList[i].c = convexHull.faces[i].c;
            
        }
        console.log(convexHull.faces);

        var facesToRemove = {};
        var numFacesAtStart = convexHull.faces.length;
        
        var newFaces = [];
        
        for (var i = 0;i<numFacesAtStart;i++){ //this is confusing because faces stores indices to vertices, clean up later
            if(!convexHull.faces[i]){continue;}
            
            var keepFace = true;
            
            //console.log("looping over faces " + i);
            var nearestInnerPoint = -1;
            var nearestDistance = 9999999999999;
            
            var triangleMidPoint = new THREE.Vector3(
                (convexHull.vertices[convexHull.faces[i].a].x + convexHull.vertices[convexHull.faces[i].b].x + convexHull.vertices[convexHull.faces[i].c].x)/3,
                (convexHull.vertices[convexHull.faces[i].a].y + convexHull.vertices[convexHull.faces[i].b].y + convexHull.vertices[convexHull.faces[i].c].y)/3,
                (convexHull.vertices[convexHull.faces[i].a].z + convexHull.vertices[convexHull.faces[i].b].z + convexHull.vertices[convexHull.faces[i].c].z)/3
            );
            
            
                for (var j = 0;j<convexHull.vertices.length;j++){
                    if(convexHull.vertices[j].distanceTo(triangleMidPoint) < nearestDistance &&
                        !inHull.has(j) &&
                        j != convexHull.faces[i].a &&
                        j != convexHull.faces[i].b &&
                        j != convexHull.faces[i].c) {
                       //console.log(verticesInHull.hasOwnProperty(j.toString()));
                        nearestInnerPoint = j;
                        //console.log(convexHull.vertices[j]);
                        nearestDistance = convexHull.vertices[j].distanceTo(triangleMidPoint);
                        //console.log(nearestDistance);
                    }
            }
            if(nearestInnerPoint== -1){continue;}
            var nearestVec = convexHull.vertices[nearestInnerPoint];
            
            //calculate eh = (D(ci1, ci2)) + D(ci2, ci3) + D(ci3, ci1))/3; 
            var ci1 = convexHull.faces[i].a
            var ci2 = convexHull.faces[i].b
            var ci3 = convexHull.faces[i].c
            //console.log("is #? " + i + " " + convexHull.faces.length);

            
            var eh = ((convexHull.vertices[convexHull.faces[i].a].distanceTo(convexHull.vertices[convexHull.faces[i].b]) + 
                       convexHull.vertices[convexHull.faces[i].b].distanceTo(convexHull.vertices[convexHull.faces[i].c]) + 
                       convexHull.vertices[convexHull.faces[i].c].distanceTo(convexHull.vertices[convexHull.faces[i].a]))/3.0);
            var dd = Math.min(convexHull.vertices[convexHull.faces[i].a].distanceTo(nearestVec),
                       convexHull.vertices[convexHull.faces[i].b].distanceTo(nearestVec),
                       convexHull.vertices[convexHull.faces[i].c].distanceTo(nearestVec))
            
            
            
            if (eh/dd > digThreashHold &&
                nearestInnerPoint != -1 &&
                convexHull.faces[i].b != convexHull.faces[i].c && convexHull.faces[i].c != convexHull.faces[i].a &&
                countDigs < 100)
            {
            countDigs += 1;
            //console.log("distance between this " + convexHull.vertices[convexHull.faces[i].b].x + " and " + convexHull.faces[i].c + " " + convexHull.vertices[convexHull.faces[i].c].x);
                console.log("ratio " + eh/dd);
                console.log("closest distance " + nearestDistance);
                console.log("dig here "  + i + " to " + nearestInnerPoint + " length " + convexHull.faces.length);
                
                
                //insert new planes (ci1,ci2, k), (ci2, ci3, k), and (ci3, ci1, k)
                //into the tail of ConcaveList;
                //delete plane (ci1, ci2, ci3) from the ConcaveList; //delete old faces
                convexHull.faces.push( new THREE.Face3( convexHull.faces[i].a, convexHull.faces[i].b, nearestInnerPoint ));
                convexHull.faces.push( new THREE.Face3( nearestInnerPoint, convexHull.faces[i].b, convexHull.faces[i].c));
                convexHull.faces.push( new THREE.Face3( convexHull.faces[i].a,nearestInnerPoint , convexHull.faces[i].c));
                
                newFaces.push( new THREE.Face3( convexHull.faces[i].a, convexHull.faces[i].b, nearestInnerPoint ));
                newFaces.push( new THREE.Face3( nearestInnerPoint, convexHull.faces[i].b, convexHull.faces[i].c));
                newFaces.push( new THREE.Face3( convexHull.faces[i].a,nearestInnerPoint , convexHull.faces[i].c));
                //console.log(convexHull.faces[i]);
                //facesToRemove[i] = {a: convexHull.faces[i].a, b: convexHull.faces[i].b, c: convexHull.faces[i].c};
                //convexHull.faces = convexHull.faces.filter( function(v) { return v; });

                console.log(i)
                //console.log(convexHull.faces[i]);
                
                

                // delete convexHull.faces[i];
                keepFace = false;


                //i--;
    
            }
            if(keepFace){newFaces.push(convexHull.faces[i].clone());} 
            else {}
        } //end faces traversal
        
        for (i = 0; i < facesToRemove.length; i++) {
            //console.log("deleting " + facesToRemove[i]);
            //delete convexHull.faces[facesToRemove[i]];
            //convexHull.faces[facesToRemove[i]] = {};
            //console.log("logging " + facesToRemove[i]);
            
            
            
        }
        
        geometry.faces = newFaces;
        geometry.computeFaceNormals();
        geometry.faces = convexHull.faces.filter( function(v) { return v; });
        geometry.elementsNeedUpdate = true; // update faces
        

    
        //console.log(convexHull.vertices[nearestInnerPoint]);
        
    }
    
    var testSphereG = new THREE.SphereGeometry(1);
    var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

    
	function update(){

		// Reposition all the vertices
		i = vertices.length;
		while( i-- > 0 ){ 

			quaternion.setFromAxisAngle( vertices[i].axis, vertices[i].velocity )
			vertices[i].vertex.applyQuaternion( quaternion );			

		}

		if( isStatic ) console.time('hull')
        allVertices = geometry.clone()
        //console.log("vertices " + geometry.vertices.length + " " + allVertices.vertices.length);
        //console.log("faces " + geometry.faces.length + " " + allVertices.faces.length);
		QuickHull( geometry );
        //console.log("vertices " + geometry.vertices.length + " " + allVertices.vertices.length);
        //console.log("faces " + geometry.faces.length + " " + allVertices.faces.length);
        concaveHull( geometry );
		if( isStatic ) console.timeEnd('hull')
		geometry.verticesNeedUpdate = true;			
		
	}
	
	update();
	scene.add( new THREE.Mesh( geometry, new THREE.MeshNormalMaterial( {} )));

    //editGeometry = the geometry who's vertices we want to show

    geometry1 = new THREE.Geometry();

    sprite = THREE.ImageUtils.loadTexture( "models/px.jpg" );

    for ( i = 0; i < geometry.vertices.length; i ++ ) {

        geometry1.vertices.push(geometry.vertices[i]);

    }

    material = new THREE.PointCloudMaterial( { size: 35, sizeAttenuation: false, map: sprite, transparent: true } );
    material.color.setHSL( 1.0, 0.3, 0.7 );

    particles = new THREE.PointCloud( geometry1, material );
    particles.sortParticles = true;
    scene.add( particles );
    
    
    //document.addEventListener("click", function(){ update(); });
    //document.addEventListener("mousemove", function(){ update(); });
	document.addEventListener( 'click', onDocumentMouseDown, false );
    
    function onDocumentMouseDown( event ) 
    {
        update();
        geometry.normalsNeedUpdate = true;
    }


    function animate(){

    	controls.update();
    	//if( !isStatic ) update();
    	cubeCamera.rotation.copy( camera.rotation );

    	renderer.clear();

    	// Oooh, double render...
    	renderer.render( cubeScene, cubeCamera );
    	renderer.render( scene, camera );
    	

    	requestAnimationFrame( animate );

    }

    window.addEventListener( 'resize', resize )
	resize();
    animate();
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}



