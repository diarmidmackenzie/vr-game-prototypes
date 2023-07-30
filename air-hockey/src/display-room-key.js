AFRAME.registerComponent('display-room-key', {

  init() {
    this.el.setAttribute('text', `value: Room Key\n${ROOM_KEY}; align: center; wrapCount: 10`)
  }
})