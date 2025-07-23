// On draw un triangle pour apprendre !!!

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
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
  // Fragment shader
  const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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
  drawScene(gl, programInfo, infos);
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

  // Créé un tableau des positions (vertex) du carrés
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  /**
   * Passer mainenant la liste des positions à WebGL pour construire la forme.
   * Nous faisons cela en créant un Float32Array à partir du tableau JavaScript,
   * puis en l'utilisant pour remplir le tampon en cours.
   */
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
  return {
    positions: positionsBuffer,
  };
}

// Fonction pour draw la scene (c'est dans le nom t'es con ou quoi)
function drawScene(gl, programInfo, buffers) {
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

  // Indiquer à WebGL comment extraire les positions à partir du tampon des
  // positions pour les mettre dans l'attribut vertexPosition.
  {
    const numComponents = 2;  // Extraire 2 valeurs par itération
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

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}