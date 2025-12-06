'use client'
import React, { useEffect, useRef, useState } from 'react';
import { TalkingHead } from "../../lib/modules/talkinghead.mjs"; 
import { HeadTTS } from "../../lib/modules/headtts.mjs";
import './TalkingHead.css'; 

const TalkingHeadComponent = () => {
  const avatarRef = useRef(null);
  const headRef = useRef(null);
  const headTTSRef = useRef(null);

  const subtitleTimerRef = useRef(null);

  // LATENCY
  const startTimeRef = useRef(0);
  const isFirstChunkRef = useRef(false);

  // --- NEW: Chunk counting ---
  const chunkCountRef = useRef(0);
  const totalPartsRef = useRef(0);

  // UI STATE
  const [inputText, setInputText] = useState("Life is like a box of chocolates. You never know what you're gonna get.");
  const [selectedPerson, setSelectedPerson] = useState("julia");
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [subtitles, setSubtitles] = useState("");
  const [latency, setLatency] = useState(null);

  const handleSpeechFinished = () => {
    console.log("🔥 FULL SENTENCE FINISHED (all chunks spoken)");
    clearSubtitles();
  };

  const persons = {
    "julia": {
      avatar: { url: "/avatars/julia.glb", body: "F", avatarMood: "neutral" },
      view: { cameraY: 0 },
      setup: { voice: "af_bella", language: "en-us", speed: 1, audioEncoding: "wav" }
    },
    "david": {
      avatar: { url: "/avatars/david.glb", body: "M", avatarMood: "neutral" },
      view: { cameraY: -20 },
      setup: { voice: "am_fenrir", language: "en-us", speed: 1, audioEncoding: "wav" }
    }
  };

  useEffect(() => {
    if (headRef.current) return;

    const init = async () => {
      try {
        const head = new TalkingHead(avatarRef.current, {
          ttsEndpoint: "N/A",
          cameraView: "upper",
          mixerGainSpeech: 3,
          cameraRotateEnable: false
        });
        headRef.current = head;

        const headtts = new HeadTTS({
          endpoints: ["webgpu", "wasm"],
          languages: ["en-us"],
          voices: ["af_bella", "am_fenrir"],
          voiceURL: window.location.origin + "/voices",
          workerModule: window.location.origin + "/modules/worker-tts.mjs",
          dictionaryURL: window.location.origin + "/dictionaries",
          audioCtx: head.audioCtx,
          trace: 0,
        });
        headTTSRef.current = headtts;

        headtts.onmessage = (message) => {
          if (message.type === "audio") {
            const data = message.data;

            // --- store PARTS TOTAL only once ---
            if (totalPartsRef.current === 0) {
              totalPartsRef.current = message.metaData.partsTotal;
              console.log("Total chunks for this sentence:", totalPartsRef.current);
            }

            // --- LATENCY on first chunk ---
            if (isFirstChunkRef.current) {
              setLatency(Math.round(performance.now() - startTimeRef.current));
              isFirstChunkRef.current = false;
            }

            // --- On chunk finish callback ---
            const onChunkFinished = () => {
              chunkCountRef.current++;

              console.log("Chunk finished:", chunkCountRef.current, "/", totalPartsRef.current);

              if (chunkCountRef.current === totalPartsRef.current) {
                console.log("🔥 Entire sentence finished!");
                handleSpeechFinished();
              }
            };

            // --- Play audio with chunk-end callback ---
            head.speakMarker(() => clearSubtitles());
            head.speakAudio(
              data,
              {},
              (word) => addSubtitle(word),
              onChunkFinished   // <-- NEW
            );
          }

          else if (message.type === "error") {
            setLoadingStatus("Error: " + message.data?.error);
          }
        };

        await loadPerson("julia");
        head.start();

      } catch (err) {
        console.error("Init failed", err);
        setLoadingStatus("Error: " + err.message);
      }
    };

    init();
    return () => { if (headRef.current) headRef.current.stop(); };

  }, []);

  const loadPerson = async (name) => {
    const head = headRef.current;
    const headtts = headTTSRef.current;
    const person = persons[name];

    if (!head || !headtts) return;
    setLoadingStatus(`Loading ${name}...`);

    try {
      await Promise.all([
        head.showAvatar(person.avatar),
        headtts.connect()
      ]);
      
      head.setView(head.viewName, person.view);
      head.cameraClock = 999;
      headtts.setup(person.setup);
      setLoadingStatus("");

    } catch (err) {
      setLoadingStatus("Error: " + err.message);
    }
  };

  const addSubtitle = (word, ms = 2000) => {
    if (word) setSubtitles(prev => prev + word);

    if (subtitleTimerRef.current) clearTimeout(subtitleTimerRef.current);

    subtitleTimerRef.current = setTimeout(() => clearSubtitles(), ms);
  };

  const clearSubtitles = () => {
    if (subtitleTimerRef.current) clearTimeout(subtitleTimerRef.current);
    setSubtitles("");
  };

  const handleSpeak = () => {
    if (headTTSRef.current && inputText) {

      // --- RESET CHUNK COUNTERS ---
      chunkCountRef.current = 0;
      totalPartsRef.current = 0;

      // resume audio ctx
      if (headRef.current.audioCtx.state === 'suspended') {
        headRef.current.audioCtx.resume();
      }

      setLatency(null);
      startTimeRef.current = performance.now();
      isFirstChunkRef.current = true;

      headTTSRef.current.synthesize({ input: inputText });
    }
  };

  const handlePersonChange = (e) => {
    const val = e.target.value;
    setSelectedPerson(val);
    loadPerson(val);
  };

  return (
    <div className="th-container">
      <div id="avatar" ref={avatarRef} className="th-avatar-viewport" />

      <div className="th-controls">
        <input 
          type="text"
          className="th-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <select 
          className="th-select"
          value={selectedPerson}
          onChange={handlePersonChange}
          disabled={loadingStatus !== ""}
        >
          <option value="julia">Julia</option>
          <option value="david">David</option>
        </select>

        <button 
          className="th-button"
          onClick={handleSpeak}
          disabled={loadingStatus !== ""}
        >
          {loadingStatus !== "" ? "Wait" : "Speak"}
        </button>
      </div>

      {latency && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: '#4CAF50',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 90
        }}>
          Response Time: {latency}ms
        </div>
      )}

      {loadingStatus && <div className="th-info">Status: {loadingStatus}</div>}

      <div className="th-subtitles">{subtitles}</div>
    </div>
  );
};

export default TalkingHeadComponent;
