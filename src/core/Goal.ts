import * as THREE from "three";
import * as CANNON from "cannon-es";
import { textureLoader } from "./loaders";

const GROUND_SIZE = {
  width: 2,
  height: 0.2,
  depth: 2,
};

const GROUND_COLORS = {
  before: 0xd8d9cf,
  after: 0x377d71,
};

export default class Goal {
  private mesh: THREE.Mesh;
  private body: CANNON.Body;
  private beforeMaterial: THREE.MeshStandardMaterial;
  private afterMaterial: THREE.MeshStandardMaterial;

  constructor() {
    const texture = textureLoader.load("wall.jpg");

    const beforeMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: GROUND_COLORS.before,
      roughness: 1,
    });

    const afterMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: GROUND_COLORS.after,
      roughness: 1,
    });

    this.beforeMaterial = beforeMaterial;
    this.afterMaterial = afterMaterial;

    const geometry = new THREE.BoxGeometry(GROUND_SIZE.width, GROUND_SIZE.height, GROUND_SIZE.depth);
    const mesh = new THREE.Mesh(geometry, beforeMaterial);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    this.mesh = mesh;

    const physicsShape = new CANNON.Box(
      new CANNON.Vec3(GROUND_SIZE.width / 2, GROUND_SIZE.height / 2, GROUND_SIZE.depth / 2)
    );
    const physicsMaterial = new CANNON.Material({
      friction: 0.3,
      restitution: 0.3,
    });
    const body = new CANNON.Body({ shape: physicsShape, material: physicsMaterial, mass: 0 });
    body.position.set(5.5, -10, 5.5);
    body.addEventListener("collide", () => {
      this.mesh.material = this.afterMaterial;
    });
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

  reset() {
    this.mesh.material = this.beforeMaterial;
  }
}
