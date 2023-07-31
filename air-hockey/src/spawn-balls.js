AFRAME.registerComponent('spawn-balls', {
  init() {

    // wait 5 seconds to check for replicated pucks before spawning them in.
    setTimeout(() => {  
      const scene = this.el.sceneEl

      // no need for balls if they already exist
      if (document.querySelector('[height="0.01"]')) {
        return
      }

      const html = `<a-cylinder id="puck" position="0 1.015 0" radius="0.05" height="0.01" color="white"
                              physx-body="type: dynamic; highPrecision: true"
                              physx-material="staticFriction: 0; dynamicFriction: 0; restitution: 1">
                    </a-cylinder>`
      scene.insertAdjacentHTML("beforeend", html)

    }, 5000)
  }
})