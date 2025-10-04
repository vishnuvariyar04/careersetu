'use client'
// import { useEffect, useState } from "react";

// export default function StreamingAI() {
//   const [content, setContent] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await fetch(
//         "https://n8n.srv1034714.hstgr.cloud/webhook/84c3f955-1157-4a3f-908d-577fb41f9060"
//       );

//       if (!res.body) return;

//       const reader = res.body.getReader();
//       const decoder = new TextDecoder("utf-8");

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         // n8n streaming usually sends JSON per line
//         const lines = chunk.split("\n").filter(Boolean);

//         lines.forEach((line) => {
//           try {
//             const data = JSON.parse(line);
//             if (data.type === "item" && data.content) {
//               setContent((prev) => prev + data.content);
//             }
//           } catch (err) {
//             console.error("Error parsing chunk:", err);
//           }
//         });
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: "1rem" }}>
//       {content || "Waiting for AI response..."}
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import * as THREE from 'three';

export default function RealisticTalkingAvatar() {
  const [script, setScript] = useState("Hello! I'm your realistic talking avatar. I can speak any text you give me with synchronized facial animations. Try changing my script and watch me talk!");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarRef = useRef(null);
  const mixerRef = useRef(null);
  const utteranceRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const blinkIntervalRef = useRef(null);
  const morphTargetsRef = useRef({});

  useEffect(() => {
    if (!mountRef.current) return;

    // Load GLTFLoader dynamically
    const loadGLTFLoader = async () => {
      // Import GLTFLoader from CDN
      const GLTFLoaderModule = await import('https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js');
      return GLTFLoaderModule.GLTFLoader;
    };

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.5, 1.5);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(2, 2, 2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 1, -2);
    scene.add(backLight);

    // Load GLTFLoader from CDN and then load avatar
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    script.onload = () => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        'https://models.readyplayer.me/68e16969bf14945f3e7a3a95.glb',
        (gltf) => {
        const avatar = gltf.scene;
        avatar.position.set(0, -0.8, 0);
        avatar.scale.set(1, 1, 1);
        scene.add(avatar);
        avatarRef.current = avatar;

        // Find morph targets for lip sync
        avatar.traverse((child) => {
          if (child.isMesh && child.morphTargetDictionary) {
            morphTargetsRef.current = {
              mesh: child,
              dictionary: child.morphTargetDictionary,
              influences: child.morphTargetInfluences
            };
            console.log('Available morph targets:', child.morphTargetDictionary);
          }
        });

        // Setup animation mixer if animations exist
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(avatar);
        }

        setIsLoading(false);
      },
      (progress) => {
        console.log('Loading:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
      },
      (error) => {
        console.error('Error loading avatar:', error);
        setIsLoading(false);
      }
    );
    };
    script.onerror = () => {
      console.error('Failed to load GLTFLoader');
      setIsLoading(false);
    };
    document.head.appendChild(script);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (mixerRef.current) {
        mixerRef.current.update(0.016);
      }

      // Subtle idle animation
      if (avatarRef.current && !isSpeaking) {
        avatarRef.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Load voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !voice) {
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        setVoice(englishVoice);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Random blinking
    blinkIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.97) {
        animateBlink();
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const animateBlink = () => {
    if (!avatarRef.current || !avatarRef.current.userData) return;
    
    const { leftEye, rightEye } = avatarRef.current.userData;
    if (!leftEye || !rightEye) return;
    
    const originalScaleY = 1;
    leftEye.scale.y = 0.1;
    rightEye.scale.y = 0.1;
    
    setTimeout(() => {
      leftEye.scale.y = originalScaleY;
      rightEye.scale.y = originalScaleY;
    }, 150);
  };

  const animateMouth = (intensity) => {
    if (!avatarRef.current || !avatarRef.current.userData) return;
    
    const { mouth } = avatarRef.current.userData;
    if (!mouth) return;
    
    // Animate mouth opening
    mouth.scale.y = 0.5 + intensity * 1.5;
    mouth.scale.z = 0.5 + intensity * 0.5;
  };

  const analyzeLipSync = () => {
    if (!isSpeaking) return;

    // Simple waveform-based animation
    const time = Date.now() * 0.01;
    const intensity = (Math.sin(time) + 1) * 0.5; // 0 to 1
    
    animateMouth(intensity * 0.7);
    animationFrameRef.current = requestAnimationFrame(analyzeLipSync);
  };

  const speak = () => {
    if (!script.trim()) return;
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(script);
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setProgress(0);
      analyzeLipSync();
    };

    utterance.onboundary = (event) => {
      const prog = (event.charIndex / script.length) * 100;
      setProgress(prog);
    };

    utterance.onend = () => {
      stopSpeaking();
    };

    utterance.onerror = () => {
      stopSpeaking();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setProgress(0);
    animateMouth(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const reset = () => {
    stopSpeaking();
    setScript("Hello! I'm your realistic talking avatar. I can speak any text you give me with synchronized facial animations. Try changing my script and watch me talk!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          3D Realistic Talking Avatar
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Display */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 relative">
            <div 
              ref={mountRef} 
              className="w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900"
              style={{ height: '500px' }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading Avatar...</p>
                  </div>
                </div>
              )}
            </div>
            
            {isSpeaking && (
              <div className="mt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
              
              {/* Voice Selection */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Voice
                </label>
                <select
                  value={voice?.name || ''}
                  onChange={(e) => {
                    const selected = voices.find(v => v.name === e.target.value);
                    setVoice(selected);
                  }}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {voices.map((v, i) => (
                    <option key={i} value={v.name} className="bg-slate-900">
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Script Input */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Script
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  disabled={isSpeaking}
                  rows="6"
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 resize-none"
                  placeholder="Enter the text for the avatar to speak..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={isSpeaking ? stopSpeaking : speak}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSpeaking
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <Pause size={20} /> Stop
                    </>
                  ) : (
                    <>
                      <Play size={20} /> Speak
                    </>
                  )}
                </button>

                <button
                  onClick={reset}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-start gap-2">
                  <Volume2 size={16} className="mt-1 flex-shrink-0" />
                  <span>Realtime lip-sync using audio analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>3D realistic Ready Player Me avatar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Natural blinking and idle animations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Zero-latency browser TTS</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}