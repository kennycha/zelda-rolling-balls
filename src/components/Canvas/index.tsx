import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import Maze from "../../core/Maze";
import { textureLoader } from "../../core/loaders";
import vertexShader from "../../core/shaders/skybox/vertex.glsl?raw";
import fragmentShader from "../../core/shaders/skybox/fragment.glsl?raw";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import Goal from "../../core/Goal";

const cx = classNames.bind(styles);

const Canvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const skyboxGeometry = new THREE.BoxGeometry(50, 50, 50);
    const skyboxTexture = textureLoader.load("wall.jpg");
    const skyboxMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: skyboxTexture },
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
    });
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);

    const world = new CANNON.World();
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.gravity.set(0, -9.82, 0);
    world.allowSleep = true;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(5.5, 5.5, 13);
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 3;
    controls.maxDistance = 20;

    const hemisphereLight = new THREE.HemisphereLight(0xffffff);
    hemisphereLight.castShadow = true;
    hemisphereLight.position.set(10, 30, 0);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.castShadow = true;
    directionalLight.position.set(10, 30, 0);
    scene.add(directionalLight);

    const maze = new Maze();
    maze.display(scene, world);

    const goal = new Goal();
    goal.display(scene, world);

    const draw = () => {
      renderer.render(scene, camera);
      camera.updateMatrix();
      world.step(1 / 60);

      maze.update();
      goal.update();

      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={containerRef} className={cx("container")}></div>;
};

export default Canvas;
