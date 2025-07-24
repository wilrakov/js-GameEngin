export default class Shader {
  constructor(gl) {
    this.gl = gl;

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
        }
    `;
    const fsSource = `
        varying lowp vec4 vColor;

        void main(void) {
        gl_FragColor = vColor;
        }
    `;

    this.program = this.initShaderProgram(vsSource, fsSource);
    this.attribLocations = {
      vertexPosition: gl.getAttribLocation(this.program, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(this.program, 'aVertexColor'),
    };
    this.uniformLocations = {
      projectionMatrix: gl.getUniformLocation(this.program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(this.program, 'uModelViewMatrix'),
    };
  }

  initShaderProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error('Shader error : ' + gl.getProgramInfoLog(shaderProgram));
    }
    return shaderProgram;
  }

  loadShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error('Compile error : ' + this.gl.getShaderInfoLog(shader));
    }
    return shader;
  }
}
