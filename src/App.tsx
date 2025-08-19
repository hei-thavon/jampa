import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Scene
    const bg = 0xbfeaf5;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, 40, 220);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    camera.position.set(0, 2.2, 6);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0xb0e0c9, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshToonMaterial({ color: 0xa3e48c })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road ring
    const road = new THREE.Mesh(
      new THREE.RingGeometry(5.5, 6.5, 64),
      new THREE.MeshToonMaterial({ color: 0xcfd6df })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    scene.add(road);

    // Character placeholder
    const character = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 1.0, 8, 16),
      new THREE.MeshToonMaterial({ color: 0xff9fb3 })
    );
    character.position.set(0, 1, 0);
    character.castShadow = true;
    scene.add(character);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;

    // Resize (observer + window for safety)
    const onResize = () => {
      if (!mount) return;
      width = mount.clientWidth;
      height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(mount);
    window.addEventListener("resize", onResize);

    // Animation loop
    let frameId = 0;
    const tick = () => {
      frameId = requestAnimationFrame(tick);
      character.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    // Cleanup
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      controls.dispose();
      scene.traverse((obj: any) => {
        obj.geometry?.dispose?.();
        if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m?.dispose?.());
        else obj.material?.dispose?.();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }} />;
}
