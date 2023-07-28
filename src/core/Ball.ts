import * as THREE from "three";
import * as CANNON from "cannon-es";
import { textureLoader } from "./loaders";

const BALL_RADIUS = 0.5;

export default class Ball {
  private mesh: THREE.Mesh;
  private body: CANNON.Body;

  constructor() {
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 16, 16);
    const texture = textureLoader.load("wall.jpg");
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xa8a196,
      roughness: 0.7,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;

    const physicsShape = new CANNON.Sphere(BALL_RADIUS);
    const physicsMaterial = new CANNON.Material({
      // @TODO material options 변경
      // friction: 0,
      // restitution: 0,
    });
    const body = new CANNON.Body({ shape: physicsShape, material: physicsMaterial, mass: 5 });
    body.position.set(-4.5, 10, -4.5);
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
