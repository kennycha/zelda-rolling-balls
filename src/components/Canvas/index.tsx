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
import Ball from "../../core/Ball";
import { RotationAxisTypes } from "../../types";

const cx = classNames.bind(styles);

const ACCELERATION = 0.001;

const Canvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const rotationAxisRef = useRef<RotationAxisTypes>("x");
  const rotationXSpeedRef = useRef<number>(0);
  const rotationZSpeedRef = useRef<number>(0);
  const shouldResetRef = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || !resetButtonRef.current) return;
    const resetButton = resetButtonRef.current;

    const clock = new THREE.Clock();

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
    camera.position.set(5.5, 5.5, 20);
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 3;
    controls.maxDistance = 25;

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

    let ball = new Ball();
    ball.display(scene, world);

    const draw = () => {
      const delta = clock.getDelta();
      renderer.render(scene, camera);
      controls.update();
      world.step(delta);

      maze.rotate("x", rotationXSpeedRef.current);
      maze.rotate("z", rotationZSpeedRef.current);

      if (shouldResetRef.current) {
        maze.resetTransform();
        goal.reset();
        maze.update();
        ball.update();
        shouldResetRef.current = false;
      }

      if (ball.checkIsOut()) {
        ball.dispose(scene, world);
        ball = new Ball();
        ball.display(scene, world);
      }

      ball.update();
      maze.update();
      goal.update();

      requestAnimationFrame(draw);
    };

    draw();

    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp": {
          rotationAxisRef.current = "x";
          rotationXSpeedRef.current -= ACCELERATION;
          break;
        }
        case "ArrowDown": {
          rotationAxisRef.current = "x";
          rotationXSpeedRef.current += ACCELERATION;
          break;
        }
        case "ArrowLeft": {
          rotationAxisRef.current = "z";
          rotationZSpeedRef.current += ACCELERATION;
          break;
        }
        case "ArrowRight": {
          rotationAxisRef.current = "z";
          rotationZSpeedRef.current -= ACCELERATION;
          break;
        }
        default: {
          break;
        }
      }
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleResetButtonClick = () => {
      rotationXSpeedRef.current = 0;
      rotationZSpeedRef.current = 0;
      shouldResetRef.current = true;
      resetButton.blur();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeydown);
    resetButton.addEventListener("click", handleResetButtonClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeydown);
      resetButton.removeEventListener("click", handleResetButtonClick);
    };
  }, []);

  return (
    <div ref={containerRef} className={cx("container")}>
      <div className={cx("buttonWrapper")}>
        <button className={cx("resetButton")} ref={resetButtonRef}>
          reset
        </button>
      </div>
    </div>
  );
};

export default Canvas;
