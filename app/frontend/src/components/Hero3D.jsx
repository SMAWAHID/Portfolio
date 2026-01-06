import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Lightweight Three.js floating cube + particles
export default function Hero3D({ accent="#22d3ee", secondary="#60a5fa" }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0c0b, 4, 18);

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Main wireframe cube
    const g = new THREE.BoxGeometry(2.2, 2.2, 2.2, 8, 8, 8);
    const edges = new THREE.EdgesGeometry(g);
    const mat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.9 });
    const cube = new THREE.LineSegments(edges, mat);
    cube.position.z = 0;
    scene.add(cube);

    // Inner icosahedron with gradient color
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 0),
      new THREE.MeshStandardMaterial({ color: secondary, metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.85 })
    );
    scene.add(ico);

    // Particles
    const pCount = 120;
    const points = [];
    for (let i = 0; i < pCount; i++) {
      const v = new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8);
      points.push(v);
    }
    const pGeo = new THREE.BufferGeometry().setFromPoints(points);
    const pMat = new THREE.PointsMaterial({ color: accent, size: 0.02, transparent: true, opacity: 0.65 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Lights
    const aLight = new THREE.AmbientLight(0xffffff, 0.3);
    const dLight = new THREE.DirectionalLight(secondary, 1.2);
    dLight.position.set(3, 4, 5);
    scene.add(aLight, dLight);

    let raf; let t = 0;
    const animate = () => {
      t += 0.01;
      cube.rotation.x = Math.sin(t * 0.6) * 0.3;
      cube.rotation.y += 0.01;
      ico.rotation.x += 0.008;
      ico.rotation.y += 0.009;
      ico.position.y = Math.sin(t) * 0.15;
      particles.rotation.y -= 0.002;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      g.dispose(); pGeo.dispose();
      mat.dispose(); pMat.dispose();
    };
  }, [accent, secondary]);

  return <div ref={mountRef} className="w-full h-[240px] md:h-[360px] rounded-xl" />;
}
