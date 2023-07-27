import * as THREE from "three";
import * as CANNON from "cannon-es";
import { textureLoader } from "./loaders";

const GROUND_SIZE = {
  width: 10,
  height: 1,
  depth: 10,
};

const CUBE_SIZE = {
  width: 1,
  height: 1,
  depth: 1,
};

const CUBE_POSITIONS: { [key: string]: boolean[] } = {
  "-4.5": [false, false, true, true, false, false, false, false, true, false],
  "-3.5": [false, false, true, true, true, true, true, false, true, true],
  "-2.5": [true, false, false, false, false, false, false, false, true, false],
  "-1.5": [true, false, true, true, true, true, true, false, false, false],
  "-0.5": [true, false, false, false, false, true, true, false, false, true],
  "0.5": [true, true, false, false, false, false, false, false, false, true],
  "1.5": [true, true, true, false, false, true, true, true, false, false],
  "2.5": [false, false, false, false, true, true, true, false, false, false],
  "3.5": [false, true, false, false, false, false, false, true, true, false],
  "4.5": [true, true, true, false, true, true, true, true, false, false],
};

export default class Maze {
  private ground: THREE.Mesh;
  private groundBody: CANNON.Body;
  private cubes: THREE.Mesh[] = [];
  private cubeBodies: CANNON.Body[] = [];

  constructor() {
    // @TODO 색 변경
    const physicsMaterial = new CANNON.Material("maze");

    const groundTexture = textureLoader.load("tile.jpeg");
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(8, 8);

    const cubeTexture = textureLoader.load("tile.jpeg");

    const groundGeometry = new THREE.BoxGeometry(GROUND_SIZE.width, GROUND_SIZE.height, GROUND_SIZE.depth);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      color: 0x457067,
      metalness: 0.2,
      roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    ground.castShadow = false;
    this.ground = ground;

    const groundPhysicsShape = new CANNON.Box(
      new CANNON.Vec3(GROUND_SIZE.width / 2, GROUND_SIZE.height / 2, GROUND_SIZE.depth / 2)
    );
    const groundPhysicsBody = new CANNON.Body({ shape: groundPhysicsShape, material: physicsMaterial, mass: 0 });
    this.groundBody = groundPhysicsBody;

    const cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE.width, CUBE_SIZE.height, CUBE_SIZE.depth);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      map: cubeTexture,
      color: 0x346056,
      metalness: 0.2,
      roughness: 0.7,
    });
    const originCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    originCube.receiveShadow = true;
    originCube.castShadow = true;

    const cubePhysicsShape = new CANNON.Box(
      new CANNON.Vec3(CUBE_SIZE.width / 2, CUBE_SIZE.height / 2, CUBE_SIZE.depth / 2)
    );
    Object.entries(CUBE_POSITIONS).forEach(([key, value]) => {
      const z = parseFloat(key);

      value.forEach((v, idx) => {
        if (v) {
          const x = idx - 4.5;
          const cube = originCube.clone();
          this.cubes.push(cube);

          const cubePhysicsBody = new CANNON.Body({ shape: cubePhysicsShape, material: physicsMaterial, mass: 0 });
          cubePhysicsBody.position.set(x, 1, z);
          this.cubeBodies.push(cubePhysicsBody);
        }
      });
    });
  }

  display(scene: THREE.Scene, world: CANNON.World) {
    scene.add(this.ground);
    world.addBody(this.groundBody);

    this.cubes.forEach((cube) => {
      scene.add(cube);
    });
    this.cubeBodies.forEach((cubeBody) => {
      world.addBody(cubeBody);
    });
  }

  update() {
    const { position: groundPosition, quaternion: groundQuaternion } = this.groundBody;
    this.ground.position.set(groundPosition.x, groundPosition.y, groundPosition.z);
    this.ground.quaternion.set(groundQuaternion.x, groundQuaternion.y, groundQuaternion.z, groundQuaternion.w);

    this.cubes.forEach((cube, idx) => {
      const { position: cubePosition, quaternion: cubeQuaternion } = this.cubeBodies[idx];
      cube.position.set(cubePosition.x, cubePosition.y, cubePosition.z);
      cube.quaternion.set(cubeQuaternion.x, cubeQuaternion.y, cubeQuaternion.z, cubeQuaternion.w);
    });
  }
}
