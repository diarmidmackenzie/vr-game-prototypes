AFRAME.registerComponent('cuboid-slice', {
  schema: {
    columns: {type: 'number', default: 5},
    rows: {type: 'number', default: 5},
    layers: {type: 'number', default: 5},
  },

  init: function() {

    const mesh = this.el.children[0].getObject3D('mesh')

    if (!mesh) {
        this.el.addEventListener('model-loaded', e => {
        this.init.call(this, this.data)
        })
        return;
    }

    // compute geometry for entire GLTF model.
    this.geometry = this.geometryFromMesh(mesh);

    this.geometry.computeBoundingBox();

    const min = this.geometry.boundingBox.min
    const max = this.geometry.boundingBox.max


    const bboxWidth = max.x - min.x
    const bboxHeight = max.y - min.y
    const bboxDepth = max.z - min.z

    this.height = bboxHeight / this.data.layers;
    this.width = bboxWidth / this.data.columns;
    this.depth = bboxDepth / this.data.rows;

    this.cubes = []
    var cubeIndex = 0;
    this.pieces = []
    for (var ii = 0; ii < this.data.layers; ii++) {
      for (var jj = 0; jj < this.data.rows; jj++) {
        for (var kk = 0; kk < this.data.columns; kk++) {

          var cube = document.createElement('a-box');

          cube.setAttribute("id", `cube${cubeIndex}`)
          cube.setAttribute("height", this.height)
          cube.setAttribute("width", this.width)
          cube.setAttribute("depth", this.depth)
          cube.object3D.position.x = min.x + (kk + 0.5) * this.width;
          cube.object3D.position.y = min.y + (ii + 0.5) * this.height;
          cube.object3D.position.z = min.z + (jj + 0.5) * this.depth;

          //cube.setAttribute("material", "wireframe: true; color: red")
          cube.setAttribute("visible", "false")

          this.el.sceneEl.appendChild(cube)

          this.cubes.push(cube);

          var piece = document.createElement('a-entity');
          piece.object3D.position.copy(cube.object3D.position);
          // uncomment this out to create an exploded view.
          piece.object3D.position.multiplyScalar(0.1);
          this.el.sceneEl.appendChild(piece);


          this.pieces.push(piece);
        }
      }
    }

    mesh.parent.remove(mesh);
    //this.createIntersectGeometry();

    setTimeout(this.createIntersectGeometry.bind(this), 1000);
  },

  createIntersectGeometry: function() {

    console.log("Begin Intersection work.")

    function transformGeometry(geometry, mesh) {

      transformedGeometry = new THREE.BufferGeometry();

      transformedGeometry.copy(geometry)

      const euler = new THREE.Euler();
      const position = new THREE.Vector3();
      const scale = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();

      mesh.updateMatrixWorld();

     // update rotation before position, else position will be changed by rotation.
      mesh.getWorldQuaternion(quaternion)
      euler.setFromQuaternion(quaternion, "XYZ");
      transformedGeometry.rotateX(euler.x)
      transformedGeometry.rotateY(euler.y)
      transformedGeometry.rotateZ(euler.z)

      // update scale before position, else position will be changed by scale.
      mesh.getWorldScale(scale);
      transformedGeometry.scale(scale.x, scale.y, scale.z);

      // update position last.
      mesh.getWorldPosition(position);
      transformedGeometry.translate(position.x, position.y, position.z);

      return transformedGeometry;
    }

    this.cubes.forEach((cube, index) => {

      if (true) {
        const cubeGeometry = transformGeometry(cube.object3D.children[0].geometry, cube.object3D);
        const intersect = CSG.intersect([this.geometry, cubeGeometry]);
        const intersectGeometry = CSG.BufferGeometry(intersect)
        const material = new THREE.MeshNormalMaterial();
        this.pieces[index].setObject3D('mesh', new THREE.Mesh(intersectGeometry, material));

      }
    });
  },

  // consytruct the entire geometry from a mesh (which may be a multi-mesh GLTF model)
  geometryFromMesh(mesh) {

    var newGeometry;
    var addGeometry;
    matrix = new THREE.Matrix4();

    mesh.updateMatrixWorld();
    firstMerge = true;
    mesh.traverse(function(node) {

      var geometry;

      if(node.type != "Mesh") return;
      addGeometry = node.geometry.clone();

      //console.log("Pre-transform addGeometry")
      addGeometry.computeBoundingBox();
      //console.log(addGeometry.boundingBox);

      node.updateMatrixWorld();
      matrix = node.matrixWorld.clone()
      addGeometry.applyMatrix4(matrix)

      //console.log("Post-transform addGeometry")
      addGeometry.computeBoundingBox()
      //console.log(addGeometry.boundingBox);

      if (firstMerge) {
        newGeometry = addGeometry.clone()
        firstMerge = false;
      }
      else {
        // !! This is inefficient - should collate a list of geometries and merge all in one go...
        newGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries([newGeometry, addGeometry])
      }

      //console.log("Post-add newGeometry")
      newGeometry.computeBoundingBox();
      //console.log(newGeometry.boundingBox);
    })

    return newGeometry;
  }
});

/* Unused - borrowed what I needed...
AFRAME.registerComponent('csg-intersect', {
    schema: {
      a: {type: 'selector'},
      b: {type: 'selector'}
    },

    init: function () {

        // a bit of a hack... work around the fact that object3D matrices are not initialized yet in init()
        setTimeout(this.intersectMesh.bind(this), 2000);
    },

    intersectMesh: function () {

        console.log("Begin intersection")
        meshA = this.data.a.getObject3D('mesh');
        meshB = this.data.b.getObject3D('mesh');

        meshNodeA = this.getMeshNode(meshA);
        meshNodeB = this.getMeshNode(meshB);

        // new CSG library

        function transformGeometry(geometry, mesh) {

          const euler = new THREE.Euler();
          const position = new THREE.Vector3();
          const scale = new THREE.Vector3();
          const quaternion = new THREE.Quaternion();

          mesh.updateMatrixWorld();

         // update rotation before position, else position will be changed by rotation.
          mesh.getWorldQuaternion(quaternion)
          euler.setFromQuaternion(quaternion, "XYZ");
          geometry.rotateX(euler.x)
          geometry.rotateY(euler.y)
          geometry.rotateZ(euler.z)

          // update scale before position, else position will be changed by scale.
          mesh.getWorldScale(scale);
          geometry.scale(scale.x, scale.y, scale.z);

          // update position last.
          mesh.getWorldPosition(position);
          geometry.translate(position.x, position.y, position.z);

        }

        console.log("Start CSG processing")
        const geometryA = new THREE.BufferGeometry()
        geometryA.copy(meshNodeA.geometry)
        const geometryB= new THREE.BufferGeometry()
        geometryB.copy(meshNodeB.geometry)

        console.log("Pre-transform BBs")
        geometryA.computeBoundingBox();
        console.log(geometryA.boundingBox);
        geometryB.computeBoundingBox();
        console.log(geometryB.boundingBox);

        transformGeometry(geometryA, meshNodeA)
        transformGeometry(geometryB, meshNodeB)

        console.log("Post-transform BBs")
        geometryA.computeBoundingBox();
        console.log(geometryA.boundingBox);
        geometryB.computeBoundingBox();
        console.log(geometryB.boundingBox);

        const intersect = CSG.intersect([geometryA, geometryB]);

        const material = new THREE.MeshNormalMaterial();

        const intersectGeometry = CSG.BufferGeometry(intersect)
        console.log(intersectGeometry);

        this.el.setObject3D('mesh', new THREE.Mesh(intersectGeometry, material));

        console.log("End CSG processing")
    },

    getMeshNode: function (mesh) {
      var meshNode;

      mesh.traverse(function(node) {
        if(node.type != "Mesh") return;
        meshNode = node;
      });

      return meshNode;
    }

});
*/
