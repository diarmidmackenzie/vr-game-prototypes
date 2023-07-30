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

/***/ "./src/a-puck.js":
/*!***********************!*\
  !*** ./src/a-puck.js ***!
  \***********************/
/***/ (() => {

AFRAME.registerPrimitive('a-puck', {
  defaultComponents: {
    puck: {}
  },
})

AFRAME.registerComponent('puck', {

  init() {
    this.el.setAttribute('geometry', 'primitive: sphere; radius: 0.05')
    this.el.setAttribute('material', 'color: red')
    this.el.setAttribute('physx-body', 'type: dynamic')
    this.el.setAttribute('networked', 'template: #ball-template')
  }
})

/***/ }),

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

/***/ "./src/spawn-balls.js":
/*!****************************!*\
  !*** ./src/spawn-balls.js ***!
  \****************************/
/***/ (() => {

AFRAME.registerComponent('spawn-balls', {
  init() {

    const scene = this.el.sceneEl

    // no need for balls if they already exist
    if (scene.querySelector('a-puck')) {
      return
    }

    const html = `<a-puck position="0 1.5 0"></a-puck>
                  <a-puck position="0.01 1.8 -0.01"></a-puck>
                  <a-puck position="0 2.2 0.01"></a-puck>`
    scene.insertAdjacentHTML("beforeend", html)
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
__webpack_require__(/*! ../../../../../../../../src/a-puck.js */ "./src/a-puck.js")
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=air-hockey.js.map