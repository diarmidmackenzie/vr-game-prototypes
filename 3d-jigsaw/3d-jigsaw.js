const INDEX_MAP = [1, 0, 3, 2, 5, 4];

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
    var cubeIndex = '';
    this.pieces = []
    for (var ii = 0; ii < this.data.layers; ii++) {
      for (var jj = 0; jj < this.data.rows; jj++) {
        for (var kk = 0; kk < this.data.columns; kk++) {

          cubeIndex = `${ii}-${jj}-${kk}`

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
          piece.setAttribute("jigsaw-piece", "");

          // uncomment this out to create an exploded view.
          // piece.object3D.position.copy(cube.object3D.position);
          // piece.object3D.position.multiplyScalar(0.1);
          this.el.sceneEl.appendChild(piece);

          piece.adjacentPieceIds = []
          piece.referencePoints = []
          trackAdjacentPiece(cube, 1, 0, 0)
          trackAdjacentPiece(cube, -1, 0, 0)
          trackAdjacentPiece(cube, 0, 1, 0)
          trackAdjacentPiece(cube, 0, -1, 0)
          trackAdjacentPiece(cube, 0, 0, 1)
          trackAdjacentPiece(cube, 0, 0, -1)

          function trackAdjacentPiece(cube, iDelta, jDelta, kDelta) {

            piece.adjacentPieceIds.push(`#cube${ii + iDelta}-${jj + jDelta}-${kk + kDelta}`)

            const referencePoint = document.createElement('a-entity');
            referencePoint.object3D.position.x = cube.object3D.position.x + iDelta * this.width * 0.5;
            referencePoint.object3D.position.y = cube.object3D.position.y + jDelta * this.height * 0.5;
            referencePoint.object3D.position.z = cube.object3D.position.z + kDelta * this.depth * 0.5;
            piece.referencePoints.push(referencePoint)
          }

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

    function shiftPositionFromGeometryToMesh(geometry, mesh, center) {

      mesh.position.add(center)
      geometry.translate(-center.x, -center.y, -center.z);

      // And also update child object positions...
      mesh.children.forEach((child) => {
        child.position.sub(center)
      })

    }

    function findBufferGeometryCenter(geometry) {

      const center = new THREE.Vector3();

      const positions = geometry.getAttribute("position");

      center.x = positions.array.reduce((a, b, index) => (a + ((index % 3 === 0) ? b : 0)), 0) / positions.count;
      center.y = positions.array.reduce((a, b, index) => (a + ((index % 3 === 1) ? b : 0)), 0) / positions.count;
      center.z = positions.array.reduce((a, b, index) => (a + ((index % 3 === 2) ? b : 0)), 0) / positions.count;

      return center;
    }

    this.cubes.forEach((cube, index) => {

      if (true) {
        const cubeGeometry = transformGeometry(cube.object3D.children[0].geometry, cube.object3D);
        const intersect = CSG.intersect([this.geometry, cubeGeometry]);
        const intersectGeometry = CSG.BufferGeometry(intersect)
        const material = new THREE.MeshStandardMaterial();

        this.pieces[index].setObject3D('mesh', new THREE.Mesh(intersectGeometry, material));

        const center = findBufferGeometryCenter(intersectGeometry);

        console.log(`Cube ${index} center cube vs. geometry average.`);
        console.log(cube.object3D.position);
        console.log(center);
        shiftPositionFromGeometryToMesh(intersectGeometry,
                                        this.pieces[index].object3D,
                                        center)
        this.pieces[index].setAttribute("material", "color:#dd8833; metallic:0.5");
      }
    });

    setTimeout(this.applyPhysics.bind(this), 3000);
  },

  applyPhysics: function() {

    this.pieces.forEach((piece) => {
      piece.setAttribute("ammo-body", "type:dynamic")
      piece.setAttribute("ammo-shape", "type:hull")
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

AFRAME.registerComponent('jigsaw-piece', {

  init: function() {
    this.el.setAttribute("clickable");
    this.el.addEventListener("raycaster-intersected", this.hoverStart.bind(this));
    this.el.addEventListener("raycaster-intersected-cleared", this.hoverEnd.bind(this));
  },

  hoverStart: function() {

    this.el.removeAttribute('animation__hover')
    this.el.setAttribute('animation__hover',
    {
        property: 'material.color',
        from: '#dd8833',
        to: '#ffaa44',
        dur: 200
    });
  },

  hoverEnd: function() {

    this.el.removeAttribute('animation__unhover')
    this.el.setAttribute('animation__unhover',
    {
        property: 'material.color',
        from: '#ffaa44',
        to: '#dd8833',
        dur: 200
    });
  }
});

AFRAME.registerComponent('grab-controls', {

  init: function() {
    this.el.addEventListener("triggerdown", this.triggerDown.bind(this));
    this.el.addEventListener("triggerup", this.triggerUp.bind(this));

    this.grabbedEl = null;

    this.matrix = new THREE.Matrix4();

    this.myWorldPosition = new THREE.Vector3();
    this.adjacentWorldPosition = new THREE.Vector3();
    this.compareVectors = new THREE.Vector3();
    this.compareQuaternions = new THREE.Quaternion();
  },

  triggerDown: function(evt) {

    const intersections = this.el.components.raycaster.intersectedEls;

    if (intersections.length > 0) {

      this.grabbedEl = intersections[0];

      // switch object from dynamic to kinematic
      // and make non-grabable by the other controller.
      // (!! consider race condition - maybe need to do better here...)
      this.grabbedEl.setAttribute("ammo-body", "type:kinematic");
      this.grabbedEl.removeAttribute("clickable");

      // reparent object to controller.
      const object = this.grabbedEl.object3D;
      matrix.copy(this.el.object3D.matrixWorld);
      matrix.invert();
      object.matrix.premultiply(matrix);
      object.matrix.decompose(object.position, object.quaternion, object.scale);

      this.el.object3D.add(object);
    }
  },

  triggerUp: function(evt) {

    if (this.grabbedEl) {

      // reparent object to scene.
      const object = this.grabbedEl.object3D;
      this.el.sceneEl.object3D.add(object);
      matrix.copy(this.el.object3D.matrixWorld);
      object.matrix.premultiply(matrix);
      object.matrix.decompose(object.position, object.quaternion, object.scale);

      // switch object back to dynamic.
      // needs to be a brief pause while object data changes are applied,
      // or the object disappears.
      setTimeout(this.restartPhysics.bind(this), 50);
    }
  },

  restartPhysics: function() {
    this.grabbedEl.setAttribute("ammo-body", "type:dynamic");
    this.grabbedEl.setAttribute("clickable");

    this.grabbedEl = null;
  },

  tick: function() {

    this.el.adjacentPieceIds.forEach((id, index) => {

      const adjacentPiece = document.getElementById(id)

      if (!adjacentPiece) return;

      // get the other piece's index for this piece.
      adjacentIndex = INDEX_MAP[index]

      const adjacentReference = adjacentPiece.referencePoints[adjacentIndex];
      myReference = this.el.referencePoints[index];

      myReference.getWorldPosition(this.myWorldPosition);
      adjacentReference.getWorldPosition(this.adjacentWorldPosition);

      this.compareVectors.sub(this.myWorldPosition,
                              this.adjacentWorldPosition);

      if (this.compareVectors.lengthSq < 0.01) {
        // The blocks are close together.  Now check rotation.

        // can compare rotations directly (no need to translate into world space)
        const angle = myReference.object3D.quaternion.angleTo(adjacentReference.object3D.quaternion);

        // if < 0.1 radians, consider this a match...
        if (angle < 0.1) {

          console.log("Pieces matched")
        }
      }
    })
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
