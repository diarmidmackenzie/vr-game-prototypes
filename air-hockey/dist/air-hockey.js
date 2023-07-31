(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/display-room-key.js":
/*!*********************************!*\
  !*** ./src/display-room-key.js ***!
  \*********************************/
/***/ (() => {

AFRAME.registerComponent('display-room-key', {

  init() {
    this.el.setAttribute('text', `value: Room Key\n${ROOM_KEY}; align: center; wrapCount: 10`)
  }
})

/***/ }),

/***/ "./src/networking.js":
/*!***************************!*\
  !*** ./src/networking.js ***!
  \***************************/
/***/ (() => {

AFRAME.registerComponent('networking', {

  init() {

    this.el.setAttribute('networked-scene', 
                         `serverURL: air-hockey-naf-server.glitch.me;
                          room: ${ROOM_KEY};
                          adapter: wseasyrtc`)
  }
})

/***/ }),

/***/ "./src/physx-grab.js":
/*!***************************!*\
  !*** ./src/physx-grab.js ***!
  \***************************/
/***/ (() => {

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


/***/ }),

/***/ "./src/spawn-balls.js":
/*!****************************!*\
  !*** ./src/spawn-balls.js ***!
  \****************************/
/***/ (() => {

AFRAME.registerComponent('spawn-balls', {
  init() {

    // wait 5 seconds to check for replicated pucks before spawning them in.
    setTimeout(() => {  
      const scene = this.el.sceneEl

      // no need for balls if they already exist
      if (document.querySelector('[height="0.01"]')) {
        return
      }

      const html = `<a-cylinder id="puck" position="0 1.5 0" radius="0.05" height="0.01" color="white"
                              physx-body="type: dynamic">
                    </a-cylinder>`
      scene.insertAdjacentHTML("beforeend", html)

    }, 5000)
  }
})

/***/ }),

/***/ "./src/spawn-in-circle.js":
/*!********************************!*\
  !*** ./src/spawn-in-circle.js ***!
  \********************************/
/***/ (() => {

/* global AFRAME, THREE */
AFRAME.registerComponent('spawn-in-circle', {
  schema: {
    radius: {type: 'number', default: 1}
  },

  init: function() {
    var el = this.el;
    var center = el.getAttribute('position');

    var angleRad = this.getRandomAngleInRadians();
    var circlePoint = this.randomPointOnCircle(this.data.radius, angleRad);
    var worldPoint = {x: circlePoint.x + center.x, y: center.y, z: circlePoint.y + center.z};
    el.setAttribute('position', worldPoint);
    // console.log('world point', worldPoint);

    /*var angleDeg = angleRad * 180 / Math.PI;
    var angleToCenter = -1 * angleDeg + 90;
    angleRad = THREE.MathUtils.degToRad(angleToCenter);
    el.object3D.rotation.set(0, angleRad, 0);*/
    // console.log('angle deg', angleDeg);
  },

  getRandomAngleInRadians: function() {
    return Math.random()*Math.PI*2;
  },

  randomPointOnCircle: function (radius, angleRad) {
    var x = Math.cos(angleRad)*radius;
    var y = Math.sin(angleRad)*radius;
    return {x: x, y: y};
  }
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__(/*! ../../../../../../../../src/display-room-key.js */ "./src/display-room-key.js")
__webpack_require__(/*! ../../../../../../../../src/networking.js */ "./src/networking.js")
__webpack_require__(/*! ../../../../../../../../src/spawn-in-circle.js */ "./src/spawn-in-circle.js")
__webpack_require__(/*! ../../../../../../../../src/spawn-balls.js */ "./src/spawn-balls.js")
__webpack_require__(/*! ../../../../../../../../src/physx-grab.js */ "./src/physx-grab.js")
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=air-hockey.js.map