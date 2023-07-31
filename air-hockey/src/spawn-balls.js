AFRAME.registerComponent('spawn-balls', {
  init() {

    // wait 5 seconds to check for replicated pucks before spawning them in.
    setTimeout(() => {  
      const scene = this.el.sceneEl

      // no need for balls if they already exist
      if (document.querySelector('[height="0.01"]')) {
        return
      }

      const html = `<a-cylinder id="puck" position="0 1.005 0" radius="0.05" height="0.01" color="white"
                              physx-body="type: dynamic; highPrecision: true"
                              physx-material="staticFriction: 0.1; dynamicFriction: 0.1; restitution: 1">
                      <a-entity physx-joint="type: D6; target:#base; collideWithTarget: false"
                              physx-joint-constraint__xz="constrainedAxes: x, z; linearLimit: -10 10"
                              physx-joint-constraint__y="constrainedAxes: y; linearLimit: 0 0">
                      </a-entity>
                    </a-cylinder>`
      scene.insertAdjacentHTML("beforeend", html)

    }, 5000)
  }
})