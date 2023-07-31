AFRAME.registerComponent('spawn-balls', {
  init() {

    // wait 5 seconds to check for replicated pucks before spawning them in.
    setTimeout(() => {  
      const scene = this.el.sceneEl

      // no need for balls if they already exist
      if (document.querySelector('[radius="0.06"]')) {
        return
      }

      const html = `<a-sphere id="puck" position="0 1.5 0" radius="0.06" color="white"
                              physx-body="type: dynamic">
                    </a-sphere>`
      scene.insertAdjacentHTML("beforeend", html)

    }, 5000)
  }
})