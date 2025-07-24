import Engine from './engine/Engine.js';
import CubeMesh from './engine/CubeMesh.js';

const canvas = document.querySelector('canvas');
const engine = new Engine(canvas);

const cube = new CubeMesh(engine.gl);
engine.addObject(cube);

engine.start();
