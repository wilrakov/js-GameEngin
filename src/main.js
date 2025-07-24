// On draw un carré pour apprendre !!!

// Ici c'est pour gérer le rotate d'un carré
var squareRotation = 0.0;

main();

function main() {
  // Get le canvas
  const canvas = document.querySelector('canvas');

  // Initialise webgl et vérifie si il y a erreur
  const gl = canvas.getContext('webgl');
  if (!gl) {
    // erreur
    alert("WebGL manque mon reuf");
    return;
  }

  // --- SHADERS ---
  // Vertex shader
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
  // Fragment shader
  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  /**
   * Ok alors là c'est dur à expliquer...
   * en gros dans nos shader, on définit des paramètres, et bah là on va devoir dire quels
   * sont les paramètres en qq sorte.
   * Enfin je crois que c'est ça, je comprends pas encore cette partie là, je vais me documenter
   */
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  };

  // Défini la couleur pour le clear
  gl.clearColor(0.0, 0.0, 0.0, 1.0);                // R G B A
  // Efface l'écran (buffer)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const infos = initBuffers(gl);

  // Boucle de rendu
  var then = 0;

  function render(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, infos, deltaTime);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// Initialisation des shaders
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Créé le program shader
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // Si création échoue => error
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Problème de shaders zebi : " + gl.getProgramInfoLog(shaderProgram));
    return null;
  } else {
    console.log("ok ok carré tout s'init");
  }

  return shaderProgram;
}

//
// Crée un shader du type fourni, charge le source et le compile.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Envoie la source à l'objet shader (jsp ce que ça veut dire mais ok)
  gl.shaderSource(shader, source);

  // Compile le prog shader
  gl.compileShader(shader);

  // On gère les erreurs (encore… ça fait bcp là non ?)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("bon bah errrrreeeeur: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Fonction initBuffer, pour initialiser le buffer (bah ouais, logique)
 * En gros là on va juste stocké les vertex de mon joli carré voili voilou
 */
function initBuffers(gl) {
  // Créé un tampon pour les positions du square
  const positionsBuffer = gl.createBuffer();

  // Définir positionBuffer comme étant le buffer 'choisi' pour les prochaines opérations
  gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);

  // Mon beau cube
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


  /**
   * Passer mainenant la liste des positions à WebGL pour construire la forme.
   * Nous faisons cela en créant un Float32Array à partir du tableau JavaScript,
   * puis en l'utilisant pour remplir le tampon en cours.
   */
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // --- COLORS ---
  const faceColors = [
    [1.0, 1.0, 1.0, 1.0], // Face avant : blanc
    [1.0, 0.0, 0.0, 1.0], // Face arrière : rouge
    [0.0, 1.0, 0.0, 1.0], // Face supérieure : vert
    [0.0, 0.0, 1.0, 1.0], // Face inférieure : bleu
    [1.0, 1.0, 0.0, 1.0], // Face droite : jaune
    [1.0, 0.0, 1.0, 1.0], // Face gauche : violet
  ]
  // Converti le tableau des couleurs -> face en tableau de couleur -> vertex
  var colors = [];
  for(j = 0; j<faceColors.length; j++) {
    const c = faceColors[j];
    colors = colors.concat(c, c, c, c);
  }
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Tableau (périodique) des éléments
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // Ce tableau définit chaque face comme deux triangles, en utilisant les
  // indices dans le tableau des sommets pour spécifier la position de chaque
  // triangle.

  const indices = [
    0,  1,  2,      0,  2,  3,    // avant
    4,  5,  6,      4,  6,  7,    // arrière
    8,  9,  10,     8,  10, 11,   // haut
    12, 13, 14,     12, 14, 15,   // bas
    16, 17, 18,     16, 18, 19,   // droite
    20, 21, 22,     20, 22, 23,   // gauche
  ];
  // Envoyer maintenant le tableau des éléments à GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
  return {
    positions: positionsBuffer,
    colors: colorBuffer,
    indices: indexBuffer,
  };
}

// Fonction pour draw la scene (c'est dans le nom t'es con ou quoi)
function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Effacement en noir
  gl.clearDepth(1.0);                 // tout effacer
  gl.enable(gl.DEPTH_TEST);           // ativer le test de profondeur
  gl.depthFunc(gl.LEQUAL);            // les choses proches cachent les choses lointaines (logique)

  // Efface le canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /** 
   * Créer une matrice de perspective, une matrice spéciale qui est utilisée pour
   * simuler la distorsion de la perspective dans une caméra.
   * Notre champ de vision est de 45 degrés, avec un rapport largeur/hauteur qui
   * correspond à la taille d'affichage du canvas ;
   * et nous voulons seulement voir les objets situés entre 0,1 unité et 100 unités
   * à partir de la caméra.
   */
  const fov = (45 * Math.PI) / 180; // en radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = glMatrix.mat4.create();
  
  glMatrix.mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);

  // Définir la position de dessin comme étant le point d'origine, le centre de la scène
  const modelViewMatrix = glMatrix.mat4.create();

  // Déplacer la position de dessin vers celle du carré
  glMatrix.mat4.translate(
    modelViewMatrix,
    modelViewMatrix,
    [-0.0, 0.0, -6.0]
  );
  // Rotate le cube
  glMatrix.mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    squareRotation,
    [0, 0, 1],
  )
  glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation * 0.7, [0, 1, 0]);

  // Indiquer à WebGL comment extraire les positions à partir du tampon des
  // positions pour les mettre dans l'attribut vertexPosition.
  {
    const numComponents = 3;  // Extraire 2 valeurs par itération
    const type = gl.FLOAT;    // Les données dans le tampons sont des float 32 bit
    const normalize = false;  // ne pas normaliser
    const stride = 0;         // combien d'octets extraire entre un jeu de valeurs et le suivant
    
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }
  // Indiquer à WebGL comment transférer les couleurs du tampon des couleurs
  // dans l'attribut vertexColor.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  // Indiquer à WebGL d'utiliser notre programme pour dessiner
  gl.useProgram(programInfo.program);

  // Définir les uniformes du shader
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  squareRotation += deltaTime;
}