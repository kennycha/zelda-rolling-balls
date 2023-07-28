import * as THREE from "three";
import * as CANNON from "cannon-es";
import { textureLoader } from "./loaders";
import { RotationAxisTypes } from "../types";

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
  private group: THREE.Group;
  private ground: THREE.Mesh;
  private cubes: THREE.Mesh[] = [];
  private body: CANNON.Body;

  constructor() {
    this.group = new THREE.Group();

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
    this.group.add(ground);

    const groundPhysicsShape = new CANNON.Box(
      new CANNON.Vec3(GROUND_SIZE.width / 2, GROUND_SIZE.height / 2, GROUND_SIZE.depth / 2)
    );
    const groundPhysicsMaterial = new CANNON.Material({
      friction: 0.3,
      restitution: 0.3,
    });
    const groundPhysicsBody = new CANNON.Body({ shape: groundPhysicsShape, material: groundPhysicsMaterial, mass: 0 });
    this.body = groundPhysicsBody;

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

    Object.entries(CUBE_POSITIONS).forEach(([key, value]) => {
      const z = parseFloat(key);

      value.forEach((v, idx) => {
        if (v) {
          const x = idx - 4.5;
          const cube = originCube.clone();
          cube.position.set(x, 1, z);
          this.cubes.push(cube);
          this.group.add(cube);

          const cubePhysicsShape = new CANNON.Box(
            new CANNON.Vec3(CUBE_SIZE.width / 2, CUBE_SIZE.height / 2, CUBE_SIZE.depth / 2)
          );

          this.body.addShape(cubePhysicsShape, new CANNON.Vec3(x, 1, z));
        }
      });
    });
  }

  display(scene: THREE.Scene, world: CANNON.World) {
    scene.add(this.group);
    world.addBody(this.body);
  }

  rotate(axis: RotationAxisTypes, speed: number) {
    this.group.rotation[axis] += speed;
  }

  update() {
    const groundWorldPosition = new THREE.Vector3();
    const groundWorldQuaternion = new THREE.Quaternion();
    this.ground.getWorldPosition(groundWorldPosition);
    this.ground.getWorldQuaternion(groundWorldQuaternion);
    this.body.position.set(groundWorldPosition.x, groundWorldPosition.y, groundWorldPosition.z);
    this.body.quaternion.set(
      groundWorldQuaternion.x,
      groundWorldQuaternion.y,
      groundWorldQuaternion.z,
      groundWorldQuaternion.w
    );
  }
}
