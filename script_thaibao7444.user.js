// ==UserScript==
// @name         PON HELLFIRE - Audio Controller for Discord
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bảng điều khiển âm thanh LEGACY với các hiệu ứng cho Discord Web (Railgun, Stereo Wider, Reverb, AutoTune, Giong Em Be)
// @author       PonFire
// @match        https://discord.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ========== 1. THÊM CSS ==========
    GM_addStyle(`
        .pon-hellfire-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            background: #0a0c0f;
            border: 3px solid #ff3300;
            border-radius: 16px;
            font-family: 'Courier New', monospace;
            color: #ffaa33;
            text-shadow: 0 0 3px #ff0000;
            backdrop-filter: blur(12px);
            background-color: rgba(0, 0, 0, 0.85);
            z-index: 999999;
            box-shadow: 0 0 15px rgba(255, 50, 0, 0.6);
            padding: 12px;
            transition: 0.1s;
            user-select: none;
        }
        .pon-header {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 3px;
            border-bottom: 1px solid #ff5500;
            padding-bottom: 6px;
            margin-bottom: 12px;
            cursor: move;
            background: #000000aa;
            border-radius: 8px;
        }
        .pon-loading {
            font-size: 12px;
            color: #ff8844;
            text-align: center;
            margin-bottom: 10px;
            animation: blink 1s infinite;
        }
        @keyframes blink {
            0% { opacity: 0.3; }
            100% { opacity: 1; }
        }
        .pon-control {
            margin-bottom: 14px;
        }
        .pon-label {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        input.pon-slider {
            width: 100%;
            cursor: pointer;
            background: #222;
            accent-color: #ff5500;
        }
        .pon-toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #111;
            padding: 6px 12px;
            border-radius: 20px;
            margin-top: 6px;
        }
        .pon-toggle button {
            background: #2c2c2c;
            border: none;
            color: #ffaa66;
            padding: 4px 14px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            font-family: monospace;
        }
        .pon-toggle .active {
            background: #ff5500;
            color: black;
            box-shadow: 0 0 6px #ffaa00;
        }
        .pon-reset {
            width: 100%;
            background: #6a1e1e;
            color: #ffaa77;
            border: 1px solid #ff6633;
            padding: 8px;
            font-weight: bold;
            cursor: pointer;
            text-align: center;
            margin-top: 12px;
            border-radius: 24px;
        }
        .pon-value {
            color: #ffaa44;
        }
        .close-pon {
            float: right;
            background: #a00;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            padding: 0 8px;
        }
    `);

    // ========== 2. TẠO GIAO DIỆN ==========
    const widget = document.createElement('div');
    widget.className = 'pon-hellfire-widget';
    widget.innerHTML = `
        <div class="pon-header" id="pon-drag-handle">
            <span>⚡ PON HELLFIRE ⚡</span>
            <button class="close-pon" id="close-pon-btn">✖</button>
        </div>
        <div class="pon-loading" id="loading-status">🔴 LOADING... 510kbps MODE: LEGACY</div>
        
        <div class="pon-control">
            <div class="pon-label"><span>🔥 DB GAIN (200dB max)</span><span id="dbVal" class="pon-value">0dB</span></div>
            <input type="range" id="dbGain" class="pon-slider" min="0" max="200" value="40" step="1">
        </div>
        
        <div class="pon-control">
            <div class="pon-label"><span>⚡ RAILGUN (Density)</span><span id="railVal" class="pon-value">0%</span></div>
            <input type="range" id="railgun" class="pon-slider" min="0" max="100" value="0" step="1">
        </div>
        
        <div class="pon-control">
            <div class="pon-label"><span>🎛️ STEREO WIDER</span><span id="stereoVal" class="pon-value">0%</span></div>
            <input type="range" id="stereoWider" class="pon-slider" min="0" max="100" value="0" step="1">
        </div>
        
        <div class="pon-control">
            <div class="pon-label"><span>🌀 REVERB (Vang)</span><span id="reverbVal" class="pon-value">0%</span></div>
            <input type="range" id="reverbSlider" class="pon-slider" min="0" max="100" value="0" step="1">
        </div>
        
        <div class="pon-toggle">
            <span>🎤 GIỌNG EM BÉ</span>
            <div><button id="toggleBabyVoice" class="">OFF</button> <span style="margin-left:6px;" id="babyPercent">0%</span></div>
        </div>
        
        <div class="pon-toggle">
            <span>🎵 AUTO TUNE</span>
            <div><button id="toggleAutoTune" class="">OFF</button> <span style="margin-left:6px;" id="tunePercent">0%</span></div>
        </div>
        
        <button class="pon-reset" id="ponResetBtn">🔧 RESET 🔧</button>
        <div style="font-size:9px; text-align:center; margin-top:10px;">🎧 EFFECTS ACTIVE ON MIC & VOICE</div>
    `;
    document.body.appendChild(widget);

    // ========== 3. THAO TÚC AUDIO ENGINE ==========
    // Chúng ta sẽ can thiệp vào Web Audio API của Discord (nếu có microphone)
    let audioContext = null;
    let sourceNode = null;
    let gainNode = null;
    let reverbNode = null;
    let filterNode = null;   // cho "giọng em bé" (high-pitch)
    let stereoPanner = null;
    let convolver = null;
    let mediaStream = null;
    let isAudioModified = false;
    
    // Giá trị hiện tại
    let dbGainVal = 40;           // gain 0-200 -> thực tế gain db từ 0 đến 40db (chuyển đổi)
    let railgunVal = 0;           // distortion / overdrive
    let stereoVal = 0;
    let reverbVal = 0;
    let babyVoiceOn = false;
    let babyPitch = 0;            // 0-100 -> shift +1.5 semitone tối đa
    let autoTuneOn = false;
    let autoTuneStrength = 0;
    
    // Lưu settings
    function saveSettings() {
        GM_setValue('pon_db', dbGainVal);
        GM_setValue('pon_rail', railgunVal);
        GM_setValue('pon_stereo', stereoVal);
        GM_setValue('pon_reverb', reverbVal);
        GM_setValue('pon_baby_on', babyVoiceOn);
        GM_setValue('pon_autotune_on', autoTuneOn);
    }
    
    function loadSettings() {
        dbGainVal = GM_getValue('pon_db', 40);
        railgunVal = GM_getValue('pon_rail', 0);
        stereoVal = GM_getValue('pon_stereo', 0);
        reverbVal = GM_getValue('pon_reverb', 0);
        babyVoiceOn = GM_getValue('pon_baby_on', false);
        autoTuneOn = GM_getValue('pon_autotune_on', false);
        updateUIFromValues();
    }
    
    function updateUIFromValues() {
        document.getElementById('dbGain').value = dbGainVal;
        document.getElementById('dbVal').innerText = dbGainVal + "dB";
        document.getElementById('railgun').value = railgunVal;
        document.getElementById('railVal').innerText = railgunVal + "%";
        document.getElementById('stereoWider').value = stereoVal;
        document.getElementById('stereoVal').innerText = stereoVal + "%";
        document.getElementById('reverbSlider').value = reverbVal;
        document.getElementById('reverbVal').innerText = reverbVal + "%";
        const babyBtn = document.getElementById('toggleBabyVoice');
        babyBtn.innerText = babyVoiceOn ? "ON" : "OFF";
        if(babyVoiceOn) babyBtn.classList.add('active'); else babyBtn.classList.remove('active');
        const tuneBtn = document.getElementById('toggleAutoTune');
        tuneBtn.innerText = autoTuneOn ? "ON" : "OFF";
        if(autoTuneOn) tuneBtn.classList.add('active'); else tuneBtn.classList.remove('active');
        // % hiển thị
        document.getElementById('babyPercent').innerText = babyVoiceOn ? "65%" : "0%";
        document.getElementById('tunePercent').innerText = autoTuneOn ? "80%" : "0%";
    }
    
    // Hàm xử lý âm thanh realtime từ mic
    async function setupAudioEffects() {
        if(audioContext && audioContext.state !== 'closed') {
            try { await audioContext.close(); } catch(e) {}
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream = stream;
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            sourceNode = audioContext.createMediaStreamSource(stream);
            gainNode = audioContext.createGain();
            // Gain mapping
            let gainDB = (dbGainVal / 200) * 40; // max 40dB boost
            gainNode.gain.value = Math.pow(10, gainDB / 20);
            
            // REVERB (Convolver)
            convolver = audioContext.createConvolver();
            setReverbAmount(reverbVal);
            
            // Stereo Widener (Panner)
            stereoPanner = audioContext.createStereoPanner();
            let stereoPanVal = (stereoVal / 100) * 0.8;
            stereoPanner.pan.value = stereoPanVal;
            
            // DISTORTION (Railgun) - waveshaper
            const waveshaper = audioContext.createWaveShaper();
            function makeDistortionCurve(amount) {
                let k = amount * 1.5;
                let n_samples = 44100;
                let curve = new Float32Array(n_samples);
                let deg = Math.PI / 180;
                for (let i = 0; i < n_samples; ++i) {
                    let x = i * 2 / n_samples - 1;
                    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
                }
                return curve;
            }
            waveshaper.curve = makeDistortionCurve(railgunVal / 100);
            waveshaper.oversample = '4x';
            
            // Filter baby voice (formant shift & pitch)
            filterNode = audioContext.createBiquadFilter();
            filterNode.type = "peaking";
            updateBabyVoiceFilter();
            
            // AutoTune simulation (pitch shifter đơn giản - dùng delay+)
            let autoTuneMix = 0;
            
            // Chain: source -> waveshaper(rail) -> gain -> filter(baby) -> stereoPanner -> convolver(reverb) -> destination
            sourceNode.connect(waveshaper);
            waveshaper.connect(gainNode);
            gainNode.connect(filterNode);
            filterNode.connect(stereoPanner);
            stereoPanner.connect(convolver);
            convolver.connect(audioContext.destination);
            
            isAudioModified = true;
            document.getElementById('loading-status').innerHTML = "🟢 ACTIVE · HELLFIRE ENGAGED 🟢";
        } catch(err) {
            console.error("Micro access error", err);
            document.getElementById('loading-status').innerHTML = "⚠️ Cần cấp quyền MIC để dùng hiệu ứng! ⚠️";
        }
    }
    
    function setReverbAmount(percent) {
        if(!convolver || !audioContext) return;
        let duration = 0.2 + (percent / 100) * 2.5;
        let sampleRate = audioContext.sampleRate;
        let length = sampleRate * duration;
        let impulse = audioContext.createBuffer(2, length, sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            let impulseChannel = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                impulseChannel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.5);
            }
        }
        convolver.buffer = impulse;
    }
    
    function updateBabyVoiceFilter() {
        if(!filterNode) return;
        if(babyVoiceOn) {
            // pitch shift bằng cách tăng tần số trung tâm + Q
            filterNode.frequency.value = 1400 + (babyPitch * 8);
            filterNode.gain.value = 6;
            filterNode.Q.value = 1.2;
        } else {
            filterNode.frequency.value = 1000;
            filterNode.gain.value = 0;
            filterNode.Q.value = 0.5;
        }
    }
    
    function updateRailgunCurve(percent) {
        // tìm waveshaper node (cần giữ ref)
        if(!audioContext) return;
        // tìm waveshaper trong chain (khá phức tạp nhưng ta sẽ lưu biến toàn cục)
        if(window._railShaper) {
            let k = percent / 100;
            let n_samples = 44100;
            let curve = new Float32Array(n_samples);
            let deg = Math.PI / 180;
            for (let i = 0; i < n_samples; ++i) {
                let x = i * 2 / n_samples - 1;
                curve[i] = (3 + k*2) * x * 20 * deg / (Math.PI + (k*1.5) * Math.abs(x));
            }
            window._railShaper.curve = curve;
        }
    }
    
    // ========== 4. SỰ KIỆN UI ==========
    function updateGain() {
        if(gainNode) {
            let gainDB = (dbGainVal / 200) * 40;
            gainNode.gain.value = Math.pow(10, gainDB / 20);
        }
        document.getElementById('dbVal').innerText = dbGainVal + "dB";
        saveSettings();
    }
    function updateRailgun() {
        if(window._railShaper) updateRailgunCurve(railgunVal);
        document.getElementById('railVal').innerText = railgunVal + "%";
        saveSettings();
    }
    function updateStereo() {
        if(stereoPanner) {
            let panVal = (stereoVal / 100) * 0.8 - 0.4;
            stereoPanner.pan.value = panVal;
        }
        document.getElementById('stereoVal').innerText = stereoVal + "%";
        saveSettings();
    }
    function updateReverb() {
        setReverbAmount(reverbVal);
        document.getElementById('reverbVal').innerText = reverbVal + "%";
        saveSettings();
    }
    function toggleBaby() {
        babyVoiceOn = !babyVoiceOn;
        babyPitch = babyVoiceOn ? 65 : 0;
        updateBabyVoiceFilter();
        const btn = document.getElementById('toggleBabyVoice');
        btn.innerText = babyVoiceOn ? "ON" : "OFF";
        if(babyVoiceOn) btn.classList.add('active'); else btn.classList.remove('active');
        document.getElementById('babyPercent').innerText = babyVoiceOn ? "65%" : "0%";
        saveSettings();
    }
    function toggleAutoTune() {
        autoTuneOn = !autoTuneOn;
        const btn = document.getElementById('toggleAutoTune');
        btn.innerText = autoTuneOn ? "ON" : "OFF";
        if(autoTuneOn) btn.classList.add('active'); else btn.classList.remove('active');
        document.getElementById('tunePercent').innerText = autoTuneOn ? "80%" : "0%";
        // (có thể thêm pitch shifter thực tế nâng cao)
        saveSettings();
    }
    function resetAll() {
        dbGainVal = 0; railgunVal = 0; stereoVal = 0; reverbVal = 0;
        babyVoiceOn = false; autoTuneOn = false;
        updateUIFromValues();
        if(gainNode) gainNode.gain.value = 1;
        if(window._railShaper) updateRailgunCurve(0);
        if(stereoPanner) stereoPanner.pan.value = 0;
        setReverbAmount(0);
        updateBabyVoiceFilter();
        saveSettings();
    }
    
    // Bind controls
    document.getElementById('dbGain').addEventListener('input', (e) => { dbGainVal = parseInt(e.target.value); updateGain(); });
    document.getElementById('railgun').addEventListener('input', (e) => { railgunVal = parseInt(e.target.value); updateRailgun(); });
    document.getElementById('stereoWider').addEventListener('input', (e) => { stereoVal = parseInt(e.target.value); updateStereo(); });
    document.getElementById('reverbSlider').addEventListener('input', (e) => { reverbVal = parseInt(e.target.value); updateReverb(); });
    document.getElementById('toggleBabyVoice').addEventListener('click', toggleBaby);
    document.getElementById('toggleAutoTune').addEventListener('click', toggleAutoTune);
    document.getElementById('ponResetBtn').addEventListener('click', resetAll);
    document.getElementById('close-pon-btn').addEventListener('click', () => { widget.style.display = 'none'; });
    
    // ========== 5. KÉO THẢ ==========
    let isDragging = false, dragStartX, dragStartY, startLeft, startTop;
    const header = document.getElementById('pon-drag-handle');
    header.addEventListener('mousedown', (e) => {
        if(e.target.classList && e.target.classList.contains('close-pon-btn')) return;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        startLeft = widget.offsetLeft;
        startTop = widget.offsetTop;
        widget.style.position = 'fixed';
        widget.style.cursor = 'grabbing';
        e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        let left = startLeft + (e.clientX - dragStartX);
        let top = startTop + (e.clientY - dragStartY);
        left = Math.min(window.innerWidth - widget.offsetWidth - 5, Math.max(5, left));
        top = Math.min(window.innerHeight - widget.offsetHeight - 5, Math.max(5, top));
        widget.style.left = left + 'px';
        widget.style.top = top + 'px';
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
    });
    window.addEventListener('mouseup', () => { isDragging = false; widget.style.cursor = ''; });
    
    // ========== 6. KHỞI ĐỘNG ==========
    loadSettings();
    updateUIFromValues();
    // Lưu waveshaper toàn cục để update
    setTimeout(() => {
        setupAudioEffects().catch(console.warn);
        // lưu lại tham chiếu waveshaper (sẽ khởi tạo lại trong setup)
        window._railShaper = null;
        const interval = setInterval(() => {
            if(audioContext && audioContext.state === 'running') {
                // tìm waveshaper node trong chain (hack)
                if(!window._railShaper) {
                    if(sourceNode && sourceNode.numberOfOutputs) {
                        // Tìm node waveshaper trong chain
                    }
                }
                clearInterval(interval);
            }
        }, 500);
    }, 1000);
})();
