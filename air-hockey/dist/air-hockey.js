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

/***/ "./js/spawn-in-circle.js":
/*!*******************************!*\
  !*** ./js/spawn-in-circle.js ***!
  \*******************************/
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
__webpack_require__(/*! ../../../../../../../../js/spawn-in-circle.js */ "./js/spawn-in-circle.js")
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=air-hockey.js.map