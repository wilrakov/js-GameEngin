import * as mat4 from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/mat4.js';

export default class Renderer {
  constructor(gl, shader) {
    this.gl = gl;
    this.shader = shader;
  }

  render(objects) {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 45 * Math.PI / 180, aspect, 0.1, 100);

    for (const obj of objects) {
      const mvMatrix = obj.getModelViewMatrix();
      this.drawObject(obj, projectionMatrix, mvMatrix);
    }
  }

  drawObject(obj, projectionMatrix, modelViewMatrix) {
    const gl = this.gl;
    const shader = this.shader;

    gl.useProgram(shader.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.pos);
    gl.vertexAttribPointer(
      shader.attribLocations.vertexPosition,
      3, gl.FLOAT, false, 0, 0
    );
    gl.enableVertexAttribArray(shader.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.col);
    gl.vertexAttribPointer(
      shader.attribLocations.vertexColor,
      4, gl.FLOAT, false, 0, 0
    );
    gl.enableVertexAttribArray(shader.attribLocations.vertexColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.idx);

    gl.uniformMatrix4fv(shader.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  }
}
