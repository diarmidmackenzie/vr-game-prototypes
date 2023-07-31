(function () {

  worldPosition = new THREE.Vector3()
  targetWorldPosition = new THREE.Vector3()

  AFRAME.registerComponent('physx-grab', {

  schema: {
      target: { type: 'selector' },

      // how close to target hand must be to grab
      grabProximity: { default: 0.2 },

      // additional distance tolerated before release
      holdTolerance: { default: 0.1 },
    },

    init() {

      // If a state of "grabbed" is set on a physx-body entity, 
      // the entity is automatically transformed into a kinematic entity.
      // To avoid triggering this (we want to grab using constraints, and leave the
      // body as dynamic), we use a non-clashing name for the state we set on the entity when
      // grabbing it.
      this.GRABBED_STATE = 'grabbed-dynamic';

      this.grabbing = false
      this.grabTarget = null
      this.physxEl = this.el.querySelector('[physx-body]')

      // Bind event handlers
      this.onGripOpen = this.onGripOpen.bind(this);
      this.onGripClose = this.onGripClose.bind(this);

    },

    play() {
      var el = this.el;
      el.addEventListener('gripdown', this.onGripClose);
      el.addEventListener('gripup', this.onGripOpen);
      el.addEventListener('triggerdown', this.onGripClose);
      el.addEventListener('triggerup', this.onGripOpen);
    },

    pause() {
      var el = this.el;
      el.removeEventListener('gripdown', this.onGripClose);
      el.removeEventListener('gripup', this.onGripOpen);
      el.removeEventListener('triggerdown', this.onGripClose);
      el.removeEventListener('triggerup', this.onGripOpen);
    },

    onGripClose: function (evt) {
      this.grabbing = true;

      // joint will be created on next tick (if within range)
    },

    onGripOpen: function (evt) {
      
      this.grabbing = false;
      this.removeJoint()
    },

    addJoint(el, target) {

      this.removeJoint()

      this.joint = document.createElement('a-entity') 
      this.joint.setAttribute("physx-joint", `type: Fixed; target: #${target.id}`)

      el.appendChild(this.joint)
    },

    removeJoint() {

      if (!this.joint) return
      this.joint.parentElement.removeChild(this.joint)
      this.joint = null
    },

    tick() {

      const data = this.data
      const target = data.target
      if (!target) return

      this.el.object3D.getWorldPosition(worldPosition)
      target.object3D.getWorldPosition(targetWorldPosition)

      const dist = targetWorldPosition.sub(worldPosition).length()

      if (dist < data.grabProximity) {
        this.grabTarget = target

        if (this.grabbing && !this.joint) {
          this.addJoint(this.physxEl, target)
        }
      }

      else if (dist > (data.grabProximity + data.holdTolerance)) {

        if (this.grabTarget) {
          this.removeJoint()
          this.grabTarget = null
        }
      }
    }
  })
})()
