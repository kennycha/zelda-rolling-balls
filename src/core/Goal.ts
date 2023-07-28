import * as THREE from "three";
import * as CANNON from "cannon-es";
import { textureLoader } from "./loaders";

const GROUND_SIZE = {
  width: 1,
  height: 0.2,
  depth: 1,
};

export default class Goal {
  private mesh: THREE.Mesh;
  private body: CANNON.Body;

  constructor() {
    const texture = textureLoader.load("wall.jpg");

    const geometry = new THREE.BoxGeometry(GROUND_SIZE.width, GROUND_SIZE.height, GROUND_SIZE.depth);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xd8d9cf,
      roughness: 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    this.mesh = mesh;

    const physicsShape = new CANNON.Box(
      new CANNON.Vec3(GROUND_SIZE.width / 2, GROUND_SIZE.height / 2, GROUND_SIZE.depth / 2)
    );
    const physicsMaterial = new CANNON.Material({
      // @TODO material options 변경
      // friction: 0,
      // restitution: 0,
    });
    const body = new CANNON.Body({ shape: physicsShape, material: physicsMaterial, mass: 0 });
    body.position.set(4.5, -10, 4.5);
    this.body = body;
  }

  display(scene: THREE.Scene, world: CANNON.World) {
    scene.add(this.mesh);
    world.addBody(this.body);
  }

  update() {
    const { position, quaternion } = this.body;
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }
}
