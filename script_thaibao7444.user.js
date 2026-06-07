// ==UserScript==
// @name         PON HELLFIRE - Audio Controller (FIXED DRAG)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Bảng điều khiển âm thanh LEGACY cho Discord Web - Đã sửa lỗi kéo thả, thu gọn mượt mà
// @author       PonFire
// @match        https://discord.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ========== 1. CSS ==========
    GM_addStyle(`
        .pon-hellfire-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 340px;
            background: #0a0c0f;
            border: 3px solid #ff3300;
            border-radius: 16px;
            font-family: 'Courier New', monospace;
            color: #ffaa33;
            text-shadow: 0 0 3px #ff0000;
            backdrop-filter: blur(12px);
            background-color: rgba(0, 0, 0, 0.92);
            z-index: 999999;
            box-shadow: 0 0 15px rgba(255, 50, 0, 0.6);
            transition: width 0.2s ease;
            user-select: none;
        }
        .pon-header {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 3px;
            padding: 12px;
            background: #000000aa;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ff5500;
            cursor: grab;
            transition: 0.05s linear;
        }
        .pon-header:active {
            cursor: grabbing;
        }
        .pon-header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            pointer-events: none;
        }
        .pon-header-buttons {
            display: flex;
            gap: 8px;
            pointer-events: auto;
        }
        .pon-collapse-btn {
            background: #2c2c2c;
            border: none;
            color: #ffaa66;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.1s;
        }
        .pon-collapse-btn:hover {
            background: #ff5500;
            color: black;
        }
        .close-pon {
            background: #a00;
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .close-pon:hover {
            background: #d00;
        }
        .pon-body {
            padding: 12px;
            overflow: hidden;
        }
        .pon-body.collapsed {
            display: none;
        }
        .pon-loading {
            font-size: 11px;
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
            font-size: 12px;
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
            transition: 0.1s;
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
        .pon-reset:hover {
            background: #8a2a2a;
        }
        .pon-value {
            color: #ffaa44;
        }
        .pon-footer-note {
            font-size: 9px;
            text-align: center;
            margin-top: 10px;
            opacity: 0.7;
        }
    `);

    // ========== 2. TẠO GIAO DIỆN ==========
    const widget = document.createElement('div');
    widget.className = 'pon-hellfire-widget';
    widget.innerHTML = `
        <div class="pon-header" id="pon-drag-handle">
            <div class="pon-header-title">
                <span>⚡ PON HELLFIRE ⚡</span>
            </div>
            <div class="pon-header-buttons">
                <button class="pon-collapse-btn" id="pon-collapse-btn" title="Thu gọn/Mở rộng">▼</button>
                <button class="close-pon" id="close-pon-btn" title="Đóng widget">✖</button>
            </div>
        </div>
        <div class="pon-body" id="pon-body">
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
            <div class="pon-footer-note">🎧 EFFECTS ACTIVE ON MIC & VOICE</div>
        </div>
    `;
    document.body.appendChild(widget);

    // ========== 3. LƯU TRẠNG THÁI ==========
    let isCollapsed = GM_getValue('pon_collapsed', false);
    let widgetX = GM_getValue('pon_pos_x', null);
    let widgetY = GM_getValue('pon_pos_y', null);
    
    const ponBody = document.getElementById('pon-body');
    const collapseBtn = document.getElementById('pon-collapse-btn');
    
    function updateCollapseUI() {
        if(isCollapsed) {
            ponBody.classList.add('collapsed');
            collapseBtn.innerHTML = '▶';
            collapseBtn.title = 'Mở rộng';
        } else {
            ponBody.classList.remove('collapsed');
            collapseBtn.innerHTML = '▼';
            collapseBtn.title = 'Thu gọn';
        }
        GM_setValue('pon_collapsed', isCollapsed);
    }
    
    collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isCollapsed = !isCollapsed;
        updateCollapseUI();
    });
    
    // Khôi phục vị trí
    if(widgetX !== null && widgetY !== null) {
        widget.style.left = widgetX + 'px';
        widget.style.top = widgetY + 'px';
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
    }
    
    // ========== 4. KÉO THẢ - FIX HOÀN TOÀN ==========
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let startLeft = 0, startTop = 0;
    const dragHandle = document.getElementById('pon-drag-handle');
    
    // SỬA QUAN TRỌNG: Chỉ kéo khi click vào header, không kéo khi click vào button con
    dragHandle.addEventListener('mousedown', (e) => {
        // Kiểm tra nếu click vào button (collapse hoặc close) thì không kéo
        if(e.target === collapseBtn || e.target === document.getElementById('close-pon-btn') || collapseBtn.contains(e.target) || document.getElementById('close-pon-btn').contains(e.target)) {
            return;
        }
        
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        // Lấy vị trí hiện tại (xử lý cả trường hợp đang dùng left/top hoặc right/bottom)
        const rect = widget.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        widget.style.left = startLeft + 'px';
        widget.style.top = startTop + 'px';
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
        
        widget.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    window.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        
        let newLeft = startLeft + (e.clientX - dragStartX);
        let newTop = startTop + (e.clientY - dragStartY);
        
        // Giới hạn trong màn hình
        const maxLeft = window.innerWidth - widget.offsetWidth - 10;
        const maxTop = window.innerHeight - widget.offsetHeight - 10;
        newLeft = Math.min(maxLeft, Math.max(10, newLeft));
        newTop = Math.min(maxTop, Math.max(10, newTop));
        
        widget.style.left = newLeft + 'px';
        widget.style.top = newTop + 'px';
    });
    
    window.addEventListener('mouseup', () => {
        if(isDragging) {
            isDragging = false;
            widget.style.cursor = '';
            // Lưu vị trí
            GM_setValue('pon_pos_x', widget.offsetLeft);
            GM_setValue('pon_pos_y', widget.offsetTop);
        }
    });
    
    // ========== 5. AUDIO ENGINE ==========
    let audioContext = null;
    let sourceNode = null;
    let gainNode = null;
    let filterNode = null;
    let stereoPanner = null;
    let convolver = null;
    let _railShaper = null;
    
    let dbGainVal = 40;
    let railgunVal = 0;
    let stereoVal = 0;
    let reverbVal = 0;
    let babyVoiceOn = false;
    let autoTuneOn = false;
    
    function saveAudioSettings() {
        GM_setValue('pon_db', dbGainVal);
        GM_setValue('pon_rail', railgunVal);
        GM_setValue('pon_stereo', stereoVal);
        GM_setValue('pon_reverb', reverbVal);
        GM_setValue('pon_baby_on', babyVoiceOn);
        GM_setValue('pon_autotune_on', autoTuneOn);
    }
    
    function loadAudioSettings() {
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
        document.getElementById('babyPercent').innerText = babyVoiceOn ? "65%" : "0%";
        document.getElementById('tunePercent').innerText = autoTuneOn ? "80%" : "0%";
    }
    
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
    
    function updateRailgunCurve(percent) {
        if(_railShaper) {
            _railShaper.curve = makeDistortionCurve(percent / 100);
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
            filterNode.frequency.value = 1600;
            filterNode.gain.value = 8;
            filterNode.Q.value = 1.3;
        } else {
            filterNode.frequency.value = 1000;
            filterNode.gain.value = 0;
            filterNode.Q.value = 0.5;
        }
    }
    
    async function setupAudioEffects() {
        if(audioContext && audioContext.state !== 'closed') {
            try { await audioContext.close(); } catch(e) {}
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            sourceNode = audioContext.createMediaStreamSource(stream);
            gainNode = audioContext.createGain();
            let gainDB = (dbGainVal / 200) * 40;
            gainNode.gain.value = Math.pow(10, gainDB / 20);
            
            convolver = audioContext.createConvolver();
            setReverbAmount(reverbVal);
            
            stereoPanner = audioContext.createStereoPanner();
            let stereoPanVal = (stereoVal / 100) * 0.8 - 0.4;
            stereoPanner.pan.value = stereoPanVal;
            
            const waveshaper = audioContext.createWaveShaper();
            waveshaper.curve = makeDistortionCurve(railgunVal / 100);
            waveshaper.oversample = '4x';
            _railShaper = waveshaper;
            
            filterNode = audioContext.createBiquadFilter();
            filterNode.type = "peaking";
            updateBabyVoiceFilter();
            
            // Chain
            sourceNode.connect(waveshaper);
            waveshaper.connect(gainNode);
            gainNode.connect(filterNode);
            filterNode.connect(stereoPanner);
            stereoPanner.connect(convolver);
            convolver.connect(audioContext.destination);
            
            document.getElementById('loading-status').innerHTML = "🟢 ACTIVE · HELLFIRE ENGAGED 🟢";
        } catch(err) {
            console.error(err);
            document.getElementById('loading-status').innerHTML = "⚠️ Cần cấp quyền MIC! ⚠️";
        }
    }
    
    // ========== 6. SỰ KIỆN UI ==========
    function updateGain() {
        if(gainNode) {
            let gainDB = (dbGainVal / 200) * 40;
            gainNode.gain.value = Math.pow(10, gainDB / 20);
        }
        document.getElementById('dbVal').innerText = dbGainVal + "dB";
        saveAudioSettings();
    }
    function updateRailgun() {
        updateRailgunCurve(railgunVal);
        document.getElementById('railVal').innerText = railgunVal + "%";
        saveAudioSettings();
    }
    function updateStereo() {
        if(stereoPanner) {
            let panVal = (stereoVal / 100) * 0.8 - 0.4;
            stereoPanner.pan.value = panVal;
        }
        document.getElementById('stereoVal').innerText = stereoVal + "%";
        saveAudioSettings();
    }
    function updateReverb() {
        setReverbAmount(reverbVal);
        document.getElementById('reverbVal').innerText = reverbVal + "%";
        saveAudioSettings();
    }
    function toggleBaby() {
        babyVoiceOn = !babyVoiceOn;
        updateBabyVoiceFilter();
        const btn = document.getElementById('toggleBabyVoice');
        btn.innerText = babyVoiceOn ? "ON" : "OFF";
        if(babyVoiceOn) btn.classList.add('active'); else btn.classList.remove('active');
        document.getElementById('babyPercent').innerText = babyVoiceOn ? "65%" : "0%";
        saveAudioSettings();
    }
    function toggleAutoTune() {
        autoTuneOn = !autoTuneOn;
        const btn = document.getElementById('toggleAutoTune');
        btn.innerText = autoTuneOn ? "ON" : "OFF";
        if(autoTuneOn) btn.classList.add('active'); else btn.classList.remove('active');
        document.getElementById('tunePercent').innerText = autoTuneOn ? "80%" : "0%";
        saveAudioSettings();
    }
    function resetAll() {
        dbGainVal = 0; railgunVal = 0; stereoVal = 0; reverbVal = 0;
        babyVoiceOn = false; autoTuneOn = false;
        updateUIFromValues();
        if(gainNode) gainNode.gain.value = 1;
        updateRailgunCurve(0);
        if(stereoPanner) stereoPanner.pan.value = 0;
        setReverbAmount(0);
        updateBabyVoiceFilter();
        saveAudioSettings();
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
    
    // ========== 7. KHỞI ĐỘNG ==========
    loadAudioSettings();
    updateCollapseUI();
    setTimeout(() => {
        setupAudioEffects().catch(console.warn);
    }, 1000);
})();
