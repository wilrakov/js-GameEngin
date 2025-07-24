import Shader from './Shader.js';
import Renderer from './Renderer.js';

export default class Engine {
  constructor(canvas) {
    this.gl = canvas.getContext('webgl', { antialias: true });
    if (!this.gl) throw new Error("WebGL non supporté");

    this.shader = new Shader(this.gl);
    this.renderer = new Renderer(this.gl, this.shader);
    this.objects = [];
    this.lastTime = 0;
  }

  addObject(obj) {
    this.objects.push(obj);
  }

  start() {
    const loop = (time) => {
      const deltaTime = (time - this.lastTime) * 0.001;
      this.lastTime = time;

      for (const obj of this.objects) obj.update(deltaTime);
      this.renderer.render(this.objects);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
