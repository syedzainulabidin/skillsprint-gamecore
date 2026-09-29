import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export default function Hero3DCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Color Palette: Muddy Green (#525B44), Off-White/Gold, Charcoal
    const primaryColor = new THREE.Color("#525B44");
    const highlightColor = new THREE.Color("#8A9A68");
    const accentColor = new THREE.Color("#EAE1D2");

    // Central Icosahedron Wireframe Core
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: highlightColor,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // Orbital Ring 1
    const ring1Geo = new THREE.TorusGeometry(2.4, 0.015, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: highlightColor, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    // Orbital Ring 2
    const ring2Geo = new THREE.TorusGeometry(2.8, 0.01, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Floating Particles System around Node
    const particlesCount = 180;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.035,
      color: primaryColor,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse Interaction Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouseX = (event.clientX - rect.left - width / 2) * 0.0015;
      mouseY = (event.clientY - rect.top - height / 2) * 0.0015;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth Mouse Inertia
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotations
      coreMesh.rotation.y += 0.005;
      coreMesh.rotation.x += 0.002;

      innerMesh.rotation.y -= 0.008;

      ring1.rotation.z += 0.004;
      ring2.rotation.z -= 0.003;

      particleSystem.rotation.y += 0.001;

      // Subtle Camera/Scene Tilt based on Mouse
      scene.rotation.y = targetX * 1.2;
      scene.rotation.x = -targetY * 1.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[520px] flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}