// ==UserScript==
// @name         TOMMYZ V3 - Audio Engine Pro (Discord)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Engine xử lý âm thanh chuyên sâu cho Discord Web - Giao diện PON HELLFIRE, kéo thả, thu gọn
// @author       Tommyz + PonFire
// @match        https://discord.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // =====================================================
    // 1. CSS - GIAO DIỆN PON HELLFIRE + TOMMYZ
    // =====================================================
    GM_addStyle(`
        .tommyz-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 340px;
            background: #0a0c0f;
            border: 3px solid #58ffff;
            border-radius: 16px;
            font-family: 'Segoe UI', system-ui, 'Poppins', sans-serif;
            color: #fff;
            backdrop-filter: blur(12px);
            background-color: rgba(0, 0, 0, 0.92);
            z-index: 999999;
            box-shadow: 0 0 20px rgba(88, 255, 255, 0.3), 0 0 60px rgba(88, 255, 255, 0.1);
            transition: width 0.2s ease;
            user-select: none;
        }
        .tommyz-header {
            font-size: 16px;
            font-weight: bold;
            padding: 12px 16px;
            background: #11141a;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #58ffff;
            cursor: grab;
            transition: 0.05s linear;
        }
        .tommyz-header:active {
            cursor: grabbing;
        }
        .tommyz-header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            pointer-events: none;
            color: #58ffff;
            text-shadow: 0 0 8px rgba(88, 255, 255, 0.3);
        }
        .tommyz-header-buttons {
            display: flex;
            gap: 8px;
            pointer-events: auto;
        }
        .tommyz-collapse-btn {
            background: #1c232e;
            border: 1px solid #2d3846;
            color: #58ffff;
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
        .tommyz-collapse-btn:hover {
            background: #58ffff;
            color: #000;
        }
        .tommyz-close-btn {
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
        .tommyz-close-btn:hover {
            background: #d00;
        }
        .tommyz-body {
            padding: 14px;
            overflow: hidden;
        }
        .tommyz-body.collapsed {
            display: none;
        }
        .tommyz-status {
            font-size: 11px;
            text-align: center;
            padding: 6px;
            margin-bottom: 12px;
            border-radius: 8px;
            background: #11141a;
            border: 1px solid #2d3846;
            color: #ffaa44;
        }
        .tommyz-status.active {
            border-color: #58ffff;
            color: #58ffff;
        }
        .tommyz-section-title {
            font-size: 10px;
            color: #ff5555;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin: 12px 0 8px 0;
            text-transform: uppercase;
        }
        .tommyz-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-bottom: 10px;
        }
        .tommyz-voice-btn {
            background: #1c232e;
            border: 1px solid #2d3846;
            color: #c9d1d9;
            padding: 8px 6px;
            font-weight: bold;
            font-size: 11px;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s ease;
            text-align: center;
        }
        .tommyz-voice-btn:hover {
            background: #25303f;
        }
        .tommyz-voice-btn.active {
            background: #58ffff;
            color: #000;
            border-color: #58ffff;
            box-shadow: 0 0 12px rgba(88, 255, 255, 0.4);
        }
        .tommyz-control {
            margin-bottom: 12px;
        }
        .tommyz-label {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 3px;
            color: #a3b1cc;
        }
        .tommyz-label-neon {
            color: #58ffff !important;
            font-weight: bold;
            text-shadow: 0 0 5px rgba(88, 255, 255, 0.5);
        }
        input.tommyz-slider {
            width: 100%;
            accent-color: #58ffff;
            cursor: pointer;
            background: #222;
        }
        .tommyz-footer {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        .tommyz-footer button {
            flex: 1;
            background: #1c232e;
            border: 1px solid #2d3846;
            color: #c9d1d9;
            padding: 8px;
            cursor: pointer;
            font-weight: bold;
            border-radius: 6px;
            font-size: 11px;
            transition: 0.1s;
        }
        .tommyz-footer button:hover {
            background: #ff5555;
            color: #fff;
            border-color: #ff5555;
        }
        .tommyz-rescue {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            justify-content: center;
            align-items: center;
            border-radius: 16px;
            z-index: 10;
        }
        .tommyz-rescue-box {
            background: #ff3333;
            color: #fff;
            padding: 12px 20px;
            font-weight: bold;
            border: 2px solid #fff;
            cursor: pointer;
            border-radius: 8px;
        }
        .tommyz-open-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 56px;
            height: 56px;
            background: #11141a;
            border: 3px solid #58ffff;
            color: #58ffff;
            border-radius: 50%;
            display: none;
            justify-content: center;
            align-items: center;
            font-size: 26px;
            cursor: grab;
            z-index: 999999;
            box-shadow: 0 0 20px rgba(88, 255, 255, 0.5);
            font-weight: bold;
            user-select: none;
        }
        .tommyz-open-btn:active {
            cursor: grabbing;
        }
    `);

    // =====================================================
    // 2. CORE ENGINE (GIỮ NGUYÊN TỪ TOMMYZ V2)
    // =====================================================
    
    // PARAMS
    const PARAMS = {
        caoDo: 1.0,
        amLuongMic: 1.0,
        throatCut: 8000,
        doVang: 0.0,
        doTo: 1.0
    };

    window.DiscordContext = null;

    const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
    
    window.AudioContext = function(...args) {
        const ctx = new NativeAudioContext({ latencyHint: 'interactive', sampleRate: 48000 });
        window.DiscordContext = ctx;
        
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        g.gain.value = 0.0001;
        osc.connect(g).connect(ctx.destination);
        osc.start();

        setInterval(() => {
            const rescue = document.getElementById('tommyz-rescue');
            if (rescue) {
                rescue.style.display = ctx.state === 'suspended' ? 'flex' : 'none';
            }
        }, 1000);

        return ctx;
    };
    window.AudioContext.prototype = NativeAudioContext.prototype;

    // WORKLET
    const WORKLET_CODE = `
        class TommyzEngine extends AudioWorkletProcessor {
            constructor() {
                super();
                this.delayBufferL = new Float32Array(24000);
                this.delayBufferR = new Float32Array(24000);
                this.delayIndex = 0;
                this.lastL = 0;
                this.lastR = 0;
                this.pitchPhase = 0;
                this.lpL = 0;
                this.lpR = 0;
            }

            static get parameterDescriptors() {
                return [
                    { name: 'caoDo', defaultValue: 1.0 },
                    { name: 'amLuongMic', defaultValue: 1.0 },
                    { name: 'throatCut', defaultValue: 8000 },
                    { name: 'doVang', defaultValue: 0.0 },
                    { name: 'doTo', defaultValue: 1.0 }
                ];
            }

            process(inputs, outputs, parameters) {
                const input = inputs[0];
                const output = outputs[0];
                if (!input || input.length === 0) return true;

                const p_caoDo = parameters.caoDo[0];
                const p_amLuongMic = parameters.amLuongMic[0];
                const p_throatCut = parameters.throatCut[0];
                const p_doVang = parameters.doVang[0];
                const p_doTo = parameters.doTo[0];

                const rc = 1.0 / (2 * Math.PI * p_throatCut);
                const dt = 1.0 / 48000;
                const alpha = dt / (rc + dt);

                for (let i = 0; i < input[0].length; i++) {
                    let L = input[0][i];
                    let R = input[1] ? input[1][i] : L;

                    L *= p_amLuongMic;
                    R *= p_amLuongMic;

                    if (p_caoDo !== 1.0) {
                        this.pitchPhase += (p_caoDo - 1.0) * 0.08;
                        if (this.pitchPhase > Math.PI) this.pitchPhase -= Math.PI * 2;
                        if (this.pitchPhase < -Math.PI) this.pitchPhase += Math.PI * 2;
                        const mod = Math.sin(this.pitchPhase);
                        const formantFactor = p_caoDo > 1.2 ? 0.5 : 0.3;
                        L *= (1.0 + mod * formantFactor);
                        R *= (1.0 + mod * formantFactor);
                    }

                    L = this.lastL + alpha * (L - this.lastL);
                    R = this.lastR + alpha * (R - this.lastR);
                    this.lastL = L;
                    this.lastR = R;

                    if (p_doVang > 0) {
                        const echoL = this.delayBufferL[this.delayIndex];
                        const echoR = this.delayBufferR[this.delayIndex];

                        this.delayBufferL[this.delayIndex] = L + echoL * p_doVang;
                        this.delayBufferR[this.delayIndex] = R + echoR * p_doVang;

                        L += echoL * 0.5;
                        R += echoR * 0.5;

                        this.delayIndex = (this.delayIndex + 1) % 24000;
                    }

                    // Làm rõ chữ & bự giọng
                    let midL = L - this.lpL;
                    this.lpL += 0.25 * midL;
                    L += midL * 0.45;
                    let midR = R - this.lpR;
                    this.lpR += 0.25 * midR;
                    R += midR * 0.45;

                    L *= p_doTo;
                    R *= p_doTo;

                    L = Math.tanh(L * 1.2) / 1.2;
                    R = Math.tanh(R * 1.2) / 1.2;

                    if (L > 5.0) L = 5.0;
                    if (L < -5.0) L = -5.0;
                    if (R > 5.0) R = 5.0;
                    if (R < -5.0) R = -5.0;

                    output[0][i] = L;
                    if (output[1]) output[1][i] = R;
                }
                return true;
            }
        }
        registerProcessor('tommyz-engine', TommyzEngine);
    `;

    // CORE
    const Core = {
        node: null,
        
        async inject(stream) {
            const ctx = window.DiscordContext;
            if (!ctx) return stream;

            const dest = ctx.createMediaStreamDestination();
            const source = ctx.createMediaStreamSource(stream);
            
            const bypass = ctx.createGain();
            source.connect(bypass);
            bypass.connect(dest);

            UI.setStatus("🔄 ĐANG KẾT NỐI...");

            const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            try {
                await ctx.audioWorklet.addModule(url);
                this.node = new AudioWorkletNode(ctx, 'tommyz-engine');
                
                setTimeout(() => {
                    bypass.disconnect();
                    source.connect(this.node);
                    this.node.connect(dest);
                    this.update();
                    UI.setStatus("✅ ĐÃ KÍCH HOẠT");
                }, 1500);

            } catch(e) {
                console.error("[ERROR]", e);
                UI.setStatus("❌ BỊ CHẶN (CSP)");
            }

            return dest.stream;
        },

        update() {
            if (!this.node) return;
            const p = this.node.parameters;
            const t = window.DiscordContext.currentTime;

            p.get('caoDo').setTargetAtTime(PARAMS.caoDo, t, 0.05);
            p.get('amLuongMic').setTargetAtTime(PARAMS.amLuongMic, t, 0.05);
            p.get('throatCut').setTargetAtTime(PARAMS.throatCut, t, 0.05);
            p.get('doVang').setTargetAtTime(PARAMS.doVang, t, 0.05);
            p.get('doTo').setTargetAtTime(PARAMS.doTo, t, 0.05);
        }
    };

    const nativeGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (constraints) => {
        if (constraints.audio) {
            constraints.audio = {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            };
        }
        try {
            const rawStream = await nativeGUM(constraints);
            return Core.inject(rawStream);
        } catch (e) {
            return nativeGUM(constraints);
        }
    };

    // =====================================================
    // 3. UI - GIAO DIỆN PON HELLFIRE
    // =====================================================
    const UI = {
        init() {
            const widget = document.createElement('div');
            widget.className = 'tommyz-widget';
            widget.id = 'tommyz-widget';
            widget.innerHTML = `
                <div class="tommyz-header" id="tommyz-drag-handle">
                    <div class="tommyz-header-title">
                        <span>⚡ TOMMYZ V3 ⚡</span>
                    </div>
                    <div class="tommyz-header-buttons">
                        <button class="tommyz-collapse-btn" id="tommyz-collapse-btn" title="Thu gọn/Mở rộng">▼</button>
                        <button class="tommyz-close-btn" id="tommyz-close-btn" title="Đóng widget">✖</button>
                    </div>
                </div>
                <div class="tommyz-body" id="tommyz-body">
                    <div class="tommyz-status" id="tommyz-status">⏳ KHỞI TẠO...</div>
                    
                    <div class="tommyz-rescue" id="tommyz-rescue">
                        <div class="tommyz-rescue-box">⚠ CLICK ĐỂ SỬA ÂM THANH</div>
                    </div>

                    <div class="tommyz-section-title">🎤 CHỌN GIỌNG</div>
                    <div class="tommyz-grid">
                        <button class="tommyz-voice-btn active" data-voice="goc" style="grid-column: span 2;">🎙️ GỐC (GIỌNG THƯỜNG)</button>
                        <button class="tommyz-voice-btn" data-voice="baby">👶 GIỌNG BABY</button>
                        <button class="tommyz-voice-btn" data-voice="congai">👩 CON GÁI</button>
                    </div>

                    <div class="tommyz-section-title">⚙️ ĐIỀU CHỈNH CHUYÊN SÂU</div>

                    <div class="tommyz-control">
                        <div class="tommyz-label"><span class="tommyz-label-neon">🎵 Cao Độ</span><span id="v-caoDo">1.00x</span></div>
                        <input type="range" id="tommyz-caoDo" class="tommyz-slider" min="10" max="200" value="100">
                    </div>
                    <div class="tommyz-control">
                        <div class="tommyz-label"><span class="tommyz-label-neon">🎚️ Âm Lượng Mic</span><span id="v-amLuongMic">1.0x</span></div>
                        <input type="range" id="tommyz-amLuongMic" class="tommyz-slider" min="0" max="100" value="10">
                    </div>
                    <div class="tommyz-control">
                        <div class="tommyz-label"><span class="tommyz-label-neon">🔪 Throat Cut</span><span id="v-throatCut">8000Hz</span></div>
                        <input type="range" id="tommyz-throatCut" class="tommyz-slider" min="500" max="8000" value="8000">
                    </div>
                    <div class="tommyz-control">
                        <div class="tommyz-label"><span class="tommyz-label-neon">🌊 Độ Vang</span><span id="v-doVang">0%</span></div>
                        <input type="range" id="tommyz-doVang" class="tommyz-slider" min="0" max="90" value="0">
                    </div>
                    <div class="tommyz-control">
                        <div class="tommyz-label"><span class="tommyz-label-neon">📢 Độ To</span><span id="v-doTo">1x</span></div>
                        <input type="range" id="tommyz-doTo" class="tommyz-slider" min="1" max="500" value="1">
                    </div>

                    <div class="tommyz-footer">
                        <button id="tommyz-reset-btn">🔄 ĐẶT LẠI</button>
                        <button id="tommyz-min-btn">📦 ẨN MENU</button>
                    </div>
                </div>
            `;
            document.body.appendChild(widget);

            // Nút mở menu
            const openBtn = document.createElement('div');
            openBtn.className = 'tommyz-open-btn';
            openBtn.id = 'tommyz-open-btn';
            openBtn.innerText = '⚡';
            document.body.appendChild(openBtn);

            this.bind();
            this.makeDraggable();
            this.loadSettings();
        },

        setStatus(text, isActive = false) {
            const el = document.getElementById('tommyz-status');
            if (!el) return;
            el.innerText = text;
            if (isActive) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        },

        bind() {
            const elCaoDo = document.getElementById('tommyz-caoDo');
            const elThroat = document.getElementById('tommyz-throatCut');
            const elVang = document.getElementById('tommyz-doVang');
            const elMic = document.getElementById('tommyz-amLuongMic');
            const elTo = document.getElementById('tommyz-doTo');

            // Voice buttons
            const buttons = document.querySelectorAll('.tommyz-voice-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    buttons.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');

                    const voiceType = e.target.getAttribute('data-voice');
                    
                    if (voiceType === 'goc') {
                        elCaoDo.value = 100;
                        elThroat.value = 8000;
                        elVang.value = 0;
                    } else if (voiceType === 'baby') {
                        elCaoDo.value = 162;
                        elThroat.value = 7500;
                        elVang.value = 8;
                    } else if (voiceType === 'congai') {
                        elCaoDo.value = 136;
                        elThroat.value = 6500;
                        elVang.value = 12;
                    }

                    elCaoDo.dispatchEvent(new Event('input'));
                    elThroat.dispatchEvent(new Event('input'));
                    elVang.dispatchEvent(new Event('input'));
                });
            });

            // Sliders
            elCaoDo.addEventListener('input', (e) => {
                const v = parseFloat(e.target.value) / 100;
                PARAMS.caoDo = v;
                document.getElementById('v-caoDo').innerText = v.toFixed(2) + "x";
                Core.update();
                this.saveSettings();
            });
            elMic.addEventListener('input', (e) => {
                const v = parseFloat(e.target.value) / 10;
                PARAMS.amLuongMic = v;
                document.getElementById('v-amLuongMic').innerText = v.toFixed(1) + "x";
                Core.update();
                this.saveSettings();
            });
            elThroat.addEventListener('input', (e) => {
                const v = parseInt(e.target.value);
                PARAMS.throatCut = v;
                document.getElementById('v-throatCut').innerText = v + "Hz";
                Core.update();
                this.saveSettings();
            });
            elVang.addEventListener('input', (e) => {
                const v = parseFloat(e.target.value);
                PARAMS.doVang = v / 100;
                document.getElementById('v-doVang').innerText = v + "%";
                Core.update();
                this.saveSettings();
            });
            elTo.addEventListener('input', (e) => {
                const v = parseFloat(e.target.value);
                PARAMS.doTo = v;
                document.getElementById('v-doTo').innerText = v + "x";
                Core.update();
                this.saveSettings();
            });

            // Reset
            document.getElementById('tommyz-reset-btn').addEventListener('click', () => {
                document.querySelector('[data-voice="goc"]').click();
                elMic.value = 10;
                elTo.value = 1;
                elMic.dispatchEvent(new Event('input'));
                elTo.dispatchEvent(new Event('input'));
                this.saveSettings();
            });

            // Ẩn/Mở menu
            const widget = document.getElementById('tommyz-widget');
            const openBtn = document.getElementById('tommyz-open-btn');
            document.getElementById('tommyz-min-btn').addEventListener('click', () => {
                widget.style.display = 'none';
                openBtn.style.display = 'flex';
            });
            openBtn.addEventListener('click', () => {
                if (openBtn.dataset.dragged === 'true') return;
                widget.style.display = 'block';
                openBtn.style.display = 'none';
            });

            // Đóng widget
            document.getElementById('tommyz-close-btn').addEventListener('click', () => {
                widget.style.display = 'none';
                openBtn.style.display = 'flex';
            });

            // Thu gọn
            const collapseBtn = document.getElementById('tommyz-collapse-btn');
            const body = document.getElementById('tommyz-body');
            let isCollapsed = GM_getValue('tommyz_collapsed', false);
            
            function updateCollapse() {
                if (isCollapsed) {
                    body.classList.add('collapsed');
                    collapseBtn.innerHTML = '▶';
                    collapseBtn.title = 'Mở rộng';
                } else {
                    body.classList.remove('collapsed');
                    collapseBtn.innerHTML = '▼';
                    collapseBtn.title = 'Thu gọn';
                }
                GM_setValue('tommyz_collapsed', isCollapsed);
            }
            updateCollapse();
            
            collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isCollapsed = !isCollapsed;
                updateCollapse();
            });

            // Rescue
            document.getElementById('tommyz-rescue').addEventListener('click', () => {
                if (window.DiscordContext) window.DiscordContext.resume();
            });

            // Phím Insert
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Insert' || e.keyCode === 45) {
                    if (widget.style.display === 'none') {
                        widget.style.display = 'block';
                        openBtn.style.display = 'none';
                    } else {
                        widget.style.display = 'none';
                        openBtn.style.display = 'flex';
                    }
                }
            });
        },

        makeDraggable() {
            const widget = document.getElementById('tommyz-widget');
            const handle = document.getElementById('tommyz-drag-handle');
            const openBtn = document.getElementById('tommyz-open-btn');
            
            let isDragging = false;
            let dragStartX = 0, dragStartY = 0;
            let startLeft = 0, startTop = 0;
            
            // Khôi phục vị trí
            const posX = GM_getValue('tommyz_pos_x', null);
            const posY = GM_getValue('tommyz_pos_y', null);
            if (posX !== null && posY !== null) {
                widget.style.left = posX + 'px';
                widget.style.top = posY + 'px';
                widget.style.right = 'auto';
                widget.style.bottom = 'auto';
            }
            
            // Drag widget
            handle.addEventListener('mousedown', (e) => {
                if (e.target.closest('button')) return;
                isDragging = true;
                const rect = widget.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                widget.style.cursor = 'grabbing';
                e.preventDefault();
            });
            
            // Drag open button
            openBtn.addEventListener('mousedown', (e) => {
                isDragging = true;
                const rect = openBtn.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                openBtn.dataset.dragged = 'false';
                e.preventDefault();
            });
            
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const isOpenBtn = openBtn.style.display !== 'none';
                const target = isOpenBtn ? openBtn : widget;
                
                let newLeft = startLeft + (e.clientX - dragStartX);
                let newTop = startTop + (e.clientY - dragStartY);
                
                const maxLeft = window.innerWidth - target.offsetWidth - 10;
                const maxTop = window.innerHeight - target.offsetHeight - 10;
                newLeft = Math.min(maxLeft, Math.max(10, newLeft));
                newTop = Math.min(maxTop, Math.max(10, newTop));
                
                target.style.left = newLeft + 'px';
                target.style.top = newTop + 'px';
                target.style.right = 'auto';
                target.style.bottom = 'auto';
                
                if (isOpenBtn) {
                    openBtn.dataset.dragged = 'true';
                }
            });
            
            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    widget.style.cursor = '';
                    GM_setValue('tommyz_pos_x', widget.offsetLeft);
                    GM_setValue('tommyz_pos_y', widget.offsetTop);
                }
            });
        },

        saveSettings() {
            GM_setValue('tommyz_caoDo', PARAMS.caoDo);
            GM_setValue('tommyz_amLuongMic', PARAMS.amLuongMic);
            GM_setValue('tommyz_throatCut', PARAMS.throatCut);
            GM_setValue('tommyz_doVang', PARAMS.doVang);
            GM_setValue('tommyz_doTo', PARAMS.doTo);
        },

        loadSettings() {
            PARAMS.caoDo = GM_getValue('tommyz_caoDo', 1.0);
            PARAMS.amLuongMic = GM_getValue('tommyz_amLuongMic', 1.0);
            PARAMS.throatCut = GM_getValue('tommyz_throatCut', 8000);
            PARAMS.doVang = GM_getValue('tommyz_doVang', 0.0);
            PARAMS.doTo = GM_getValue('tommyz_doTo', 1.0);
            
            document.getElementById('tommyz-caoDo').value = PARAMS.caoDo * 100;
            document.getElementById('tommyz-amLuongMic').value = PARAMS.amLuongMic * 10;
            document.getElementById('tommyz-throatCut').value = PARAMS.throatCut;
            document.getElementById('tommyz-doVang').value = PARAMS.doVang * 100;
            document.getElementById('tommyz-doTo').value = PARAMS.doTo;
            
            document.getElementById('v-caoDo').innerText = PARAMS.caoDo.toFixed(2) + "x";
            document.getElementById('v-amLuongMic').innerText = PARAMS.amLuongMic.toFixed(1) + "x";
            document.getElementById('v-throatCut').innerText = PARAMS.throatCut + "Hz";
            document.getElementById('v-doVang').innerText = (PARAMS.doVang * 100) + "%";
            document.getElementById('v-doTo').innerText = PARAMS.doTo + "x";
            
            Core.update();
        }
    };

    // =====================================================
    // 4. KHỞI ĐỘNG
    // =====================================================
    UI.init();
    setTimeout(() => {
        UI.setStatus("✅ SẴN SÀNG", true);
    }, 2000);

})();
