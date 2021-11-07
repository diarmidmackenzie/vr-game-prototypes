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

    this.layers = []
    for (var ii = 0; ii < this.data.layers; ii++) {
      layer = []
      for (var jj = 0; jj < this.data.rows; jj++) {
        column = []
        for (var kk = 0; kk < this.data.columns; kk++) {


          var cube = document.createElement('a-box');


          cube.setAttribute("height", this.height)
          cube.setAttribute("width", this.width)
          cube.setAttribute("depth", this.depth)
          cube.setAttribute("position", `${min.x + (kk + 0.5) * this.width} ${min.y + (ii + 0.5) * this.height} ${min.z + (jj + 0.5) * this.depth}`);
          cube.setAttribute("material", "wireframe: true; color: red")

          this.el.sceneEl.appendChild(cube)

          column.push(cube);
        }
        layer.push(column);
      }
      this.layers.push(layer);
    }
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

      console.log("Pre-transform addGeometry")
      addGeometry.computeBoundingBox();
      console.log(addGeometry.boundingBox);

      node.updateMatrixWorld();
      matrix = node.matrixWorld.clone()
      addGeometry.applyMatrix4(matrix)

      console.log("Post-transform addGeometry")
      addGeometry.computeBoundingBox()
      console.log(addGeometry.boundingBox);

      if (firstMerge) {
        newGeometry = addGeometry.clone()
        firstMerge = false;
      }
      else {
        // !! This is inefficient - should collate a list of geometries and merge all in one go...
        newGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries([newGeometry, addGeometry])
      }

      console.log("Post-add newGeometry")
      newGeometry.computeBoundingBox();
      console.log(newGeometry.boundingBox);
    })

    return newGeometry;
  }
});
