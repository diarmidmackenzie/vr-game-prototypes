AFRAME.registerComponent('spawn-balls', {
  init() {

    // wait 5 seconds to check for replicated pucks before spawning them in.
    setTimeout(() => {  
      const scene = this.el.sceneEl

      // no need for balls if they already exist
      if (document.querySelector('[radius="0.05"]')) {
        return
      }

      const html = `<a-sphere position="0 1.5 0" radius="0.05" color="red"
                              physx-body="type: dynamic"
                              networked="template: #ball-template">
                    </a-sphere>
                    <a-sphere position="0.01 1.8 -0.01" radius="0.05" color="red"
                              physx-body="type: dynamic"
                              networked="template: #ball-template">
                    </a-sphere>
                    <a-sphere position="0 2.2 0.01" radius="0.05" color="red"
                              physx-body="type: dynamic"
                              networked="template: #ball-template">
                    </a-sphere>`
      scene.insertAdjacentHTML("beforeend", html)

    }, 5000)
  }
})