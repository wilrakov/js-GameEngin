const canvas = document.querySelector("canvas");
const gl = canvas.getContext('webgl');

function resizeCanvas() {
  const aspect = 16 / 9;
  let width = window.innerWidth;
  let height = window.innerHeight;

  if (width / height > aspect) {
    width = height * aspect;
  } else {
    height = width / aspect;
  }
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Vertex shader (position des sommets)
const vertexShaderSource = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`

// Fragment shader (couleur)
const fragmentShaderSource = `
void main() {
  gl_FragColor = vec4(0, 0, 1, 1);
}
`

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(program));
}

// Triangle
const positions = new Float32Array([
  0, 0.5,
  -0.5, -0.5,
  0.5, -0.5
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

gl.useProgram(program);
const positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Clear and draw
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);
