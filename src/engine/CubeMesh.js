import * as mat4 from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/mat4.js';

export default class CubeMesh {
  constructor(gl) {
    this.gl = gl;
    this.rotation = 0;

    this.buffers = this.initBuffers();
  }

  initBuffers() {
    const gl = this.gl;

    const positions = [
        // Face avant
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

      // Face arrière
      -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

      // Face supérieure
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

      // Face inférieure
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

      // Face droite
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

      // Face gauche
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];
    const colors = [
      [1.0, 1.0, 1.0, 1.0], // Face avant : blanc
      [1.0, 0.0, 0.0, 1.0], // Face arrière : rouge
      [0.0, 1.0, 0.0, 1.0], // Face supérieure : vert
      [0.0, 0.0, 1.0, 1.0], // Face inférieure : bleu
      [1.0, 1.0, 0.0, 1.0], // Face droite : jaune
      [1.0, 0.0, 1.0, 1.0], // Face gauche : violet
    ];
    const indices = [
      0,  1,  2,      0,  2,  3,    // avant
      4,  5,  6,      4,  6,  7,    // arrière
      8,  9,  10,     8,  10, 11,   // haut
      12, 13, 14,     12, 14, 15,   // bas
      16, 17, 18,     16, 18, 19,   // droite
      20, 21, 22,     20, 22, 23,   // gauche
    ];

    // Transformer les colors
    let flatColors = [];
    for (let i = 0; i < colors.length; ++i) {
      const faceColor = colors[i];
      // 4 sommets par face
      for (let j = 0; j < 4; ++j) {
        flatColors.push(...faceColor);
      }
    }


    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatColors), gl.STATIC_DRAW);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return { pos: posBuf, col: colBuf, idx: idxBuf };
  }

  update(dt) {
    this.rotation += dt;
  }

  getModelViewMatrix() {
    const m = mat4.create();
    mat4.translate(m, m, [0, 0, -6]);
    mat4.rotate(m, m, this.rotation, [0, 0, 1]);
    mat4.rotate(m, m, this.rotation * 0.7, [0, 1, 0]);
    return m;
  }
}
