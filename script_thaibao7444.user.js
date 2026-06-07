// ==UserScript==
// @name         Tiện Ích Dù Thông Minh | Floating Widget
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Thêm widget dù thông minh có thể kéo thả, tự động mở/đóng theo thời tiết ảo, thống kê thời gian, lưu cài đặt
// @author       extension-dev
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ==================== TOÀN BỘ CSS NHÚNG ====================
    GM_addStyle(`
        .umbrella-tm-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 340px;
            background: rgba(30, 30, 35, 0.92);
            backdrop-filter: blur(16px);
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,200,0.2);
            font-family: 'Segoe UI', system-ui, 'Poppins', sans-serif;
            z-index: 999999;
            transition: all 0.2s ease;
            cursor: default;
            user-select: none;
            color: #f0ede8;
        }
        .umbrella-header-drag {
            background: rgba(0,0,0,0.5);
            padding: 12px 16px;
            border-radius: 32px 32px 20px 20px;
            cursor: move;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ffcf8a;
        }
        .umbrella-body {
            padding: 16px;
        }
        .tm-canvas-area {
            background: #25221c;
            border-radius: 28px;
            padding: 10px;
            margin-bottom: 12px;
        }
        canvas.tm-umbrella-canvas {
            display: block;
            width: 100%;
            background: #faf3e0;
            border-radius: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px black;
        }
        .tm-stats {
            display: flex;
            gap: 8px;
            margin: 10px 0;
            background: #2b2a24;
            border-radius: 40px;
            padding: 8px 12px;
            justify-content: space-between;
        }
        .tm-stat {
            text-align: center;
            font-size: 11px;
            background: #1e1e1c;
            padding: 4px 10px;
            border-radius: 40px;
        }
        .tm-stat span:first-child { font-weight: bold; color: #ffcd94; }
        .tm-button-group {
            display: flex;
            gap: 8px;
            margin: 10px 0;
            flex-wrap: wrap;
        }
        .tm-btn {
            background: #3e3a33;
            border: none;
            padding: 6px 12px;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: 0.1s;
            flex: 1;
        }
        .tm-btn-primary { background: #e67e22; }
        .tm-btn-primary:hover { background: #f39c12; transform: scale(0.97);}
        .tm-btn-smart { background: #2c6e4f; }
        .tm-slider-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 12px 0;
            background: #2f2c26;
            padding: 6px 14px;
            border-radius: 60px;
        }
        input.tm-range { width: 140px; }
        .tm-color-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 12px 0;
            background: #2f2c26;
            padding: 6px 14px;
            border-radius: 60px;
        }
        .tm-close-btn {
            background: #9e2d2d;
            border: none;
            color: white;
            border-radius: 30px;
            padding: 2px 12px;
            cursor: pointer;
            font-size: 12px;
        }
        .tm-feedback {
            font-size: 10px;
            text-align: center;
            margin-top: 8px;
            opacity: 0.8;
        }
        @media (max-width: 500px) {
            .umbrella-tm-widget { width: 290px; right: 10px; bottom: 10px; }
        }
    `);

    // ==================== LOGIC CHÍNH ====================
    // Tạo container widget
    const widget = document.createElement('div');
    widget.className = 'umbrella-tm-widget';
    widget.innerHTML = `
        <div class="umbrella-header-drag" id="tm-drag-handle">
            <span>☂️ Dù Thông Minh v2 🌂</span>
            <button class="tm-close-btn" id="tm-close-widget">✖</button>
        </div>
        <div class="umbrella-body">
            <div class="tm-canvas-area">
                <canvas id="tmUmbrellaCanvas" width="400" height="260" style="width:100%; height:auto; aspect-ratio:400/260"></canvas>
                <div style="font-size:10px; text-align:center; margin-top:6px;">👉 Nhấn vào dù để mở/đóng</div>
            </div>
            <div class="tm-stats">
                <div class="tm-stat"><span>⏱️ Tổng mở</span><br><span id="tmTotalStat">0s</span></div>
                <div class="tm-stat"><span>🕒 Phiên</span><br><span id="tmSessionStat">0s</span></div>
                <div class="tm-stat"><span>🌦️</span><br><span id="tmWeatherIcon">☀️</span></div>
            </div>
            <div class="tm-button-group">
                <button class="tm-btn tm-btn-primary" id="tmToggleWeather">🌦️ Đổi thời tiết</button>
                <button class="tm-btn tm-btn-smart" id="tmSmartMode">🧠 Tự động</button>
                <button class="tm-btn" id="tmResetBtn">🔄 Reset</button>
            </div>
            <div class="tm-slider-row">
                <span>📏 Kích thước:</span>
                <input type="range" id="tmSizeSlider" min="70" max="130" value="100" step="2" class="tm-range">
                <span id="tmSizeVal">100%</span>
            </div>
            <div class="tm-color-row">
                <span>🎨 Màu dù:</span>
                <input type="color" id="tmColorPicker" value="#e34d4d">
                <span id="tmFeedbackMsg" class="tm-feedback" style="margin:0;">✅ sẵn sàng</span>
            </div>
            <div class="tm-feedback" id="tmGlobalFeedback">💡 Kéo thả widget · Tự động lưu</div>
        </div>
    `;

    document.body.appendChild(widget);

    // Lấy elements
    const canvas = document.getElementById('tmUmbrellaCanvas');
    const ctx = canvas.getContext('2d');
    const W = 400, H = 260;
    canvas.width = W;
    canvas.height = H;

    // State quản lý
    let currentWeather = 'sunny';      // sunny / rainy
    let umbrellaOpen = true;
    let umbrellaColor = "#e34d4d";
    let umbrellaScale = 100;
    let smartMode = false;
    let totalOpenSeconds = 0;
    let sessionStartTime = null;
    let rainDrops = [];

    // Hàm lưu trữ bằng GM_setValue (Tampermonkey storage)
    function saveSettings() {
        GM_setValue('umbrella_tm_weather', currentWeather);
        GM_setValue('umbrella_tm_open', umbrellaOpen);
        GM_setValue('umbrella_tm_color', umbrellaColor);
        GM_setValue('umbrella_tm_scale', umbrellaScale);
        GM_setValue('umbrella_tm_totalSec', totalOpenSeconds);
        GM_setValue('umbrella_tm_smart', smartMode);
    }

    function loadSettings() {
        let savedWeather = GM_getValue('umbrella_tm_weather', null);
        if(savedWeather) currentWeather = savedWeather;
        let savedOpen = GM_getValue('umbrella_tm_open', null);
        if(savedOpen !== null) umbrellaOpen = savedOpen;
        let savedColor = GM_getValue('umbrella_tm_color', null);
        if(savedColor) umbrellaColor = savedColor;
        let savedScale = GM_getValue('umbrella_tm_scale', null);
        if(savedScale) umbrellaScale = savedScale;
        let savedTotal = GM_getValue('umbrella_tm_totalSec', 0);
        totalOpenSeconds = savedTotal;
        let savedSmart = GM_getValue('umbrella_tm_smart', false);
        smartMode = savedSmart;

        // UI đồng bộ
        document.getElementById('tmColorPicker').value = umbrellaColor;
        document.getElementById('tmSizeSlider').value = umbrellaScale;
        document.getElementById('tmSizeVal').innerText = umbrellaScale+'%';
        if(smartMode) document.getElementById('tmSmartMode').style.background = "#4cae7c";
        else document.getElementById('tmSmartMode').style.background = "#2c6e4f";
    }

    // Cập nhật thống kê hiển thị
    function updateStatsUI() {
        let totalStr = formatTime(totalOpenSeconds);
        document.getElementById('tmTotalStat').innerText = totalStr;
        let sessionSec = 0;
        if(umbrellaOpen && sessionStartTime) {
            sessionSec = Math.floor((Date.now() - sessionStartTime) / 1000);
        }
        document.getElementById('tmSessionStat').innerText = formatTime(sessionSec);
        document.getElementById('tmWeatherIcon').innerHTML = currentWeather === 'sunny' ? '☀️ Nắng' : '🌧️ Mưa';
        let fbSpan = document.getElementById('tmGlobalFeedback');
        if(smartMode) fbSpan.innerText = '🧠 Chế độ thông minh: tự mở/đóng theo thời tiết';
        else fbSpan.innerText = '⚙️ Thủ công · nhấn vào dù để đóng/mở';
    }

    function formatTime(sec) {
        let mins = Math.floor(sec / 60);
        let remain = sec % 60;
        if(mins>0) return `${mins}p ${remain}s`;
        return `${remain}s`;
    }

    // Quản lý thời gian mở dù
    function updateOpenTimeAccumulator() {
        if(umbrellaOpen && sessionStartTime) {
            let now = Date.now();
            let addSec = Math.floor((now - sessionStartTime) / 1000);
            if(addSec > 0) {
                totalOpenSeconds += addSec;
                sessionStartTime = now;
                saveSettings();
            }
        }
        updateStatsUI();
    }

    function setUmbrellaOpenState(open) {
        if(umbrellaOpen === open) return;
        if(umbrellaOpen) {
            if(sessionStartTime) {
                let add = Math.floor((Date.now() - sessionStartTime)/1000);
                if(add>0) totalOpenSeconds += add;
                sessionStartTime = null;
            }
        } else {
            sessionStartTime = Date.now();
        }
        umbrellaOpen = open;
        saveSettings();
        updateStatsUI();
        drawCanvas();
    }

    // Mưa
    function initRain() {
        rainDrops = [];
        for(let i=0;i<65;i++) {
            rainDrops.push({
                x: Math.random() * W,
                y: Math.random() * H * 0.7,
                speed: 2 + Math.random() * 4.5
            });
        }
    }
    function updateRain() {
        if(currentWeather !== 'rainy') return;
        for(let r of rainDrops) {
            r.y += r.speed;
            if(r.y > H-40) { r.y = 5; r.x = Math.random() * W; }
        }
    }

    // VẼ DÙ VỚI SCALE
    function drawOpenedUmbrella(scale) {
        const s = scale/100;
        const cx = W/2;
        const apexY = 50 + (1-s)*5;
        const radius = 88 * s;
        // cán
        ctx.beginPath();
        ctx.moveTo(cx, apexY+8);
        ctx.lineTo(cx, H-45);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#b87c4f';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, H-45);
        ctx.lineTo(cx-5, H-30);
        ctx.lineTo(cx+5, H-30);
        ctx.fillStyle = '#9b5e2c';
        ctx.fill();
        // mái
        ctx.beginPath();
        ctx.ellipse(cx, apexY+4, radius, radius*0.65, 0, Math.PI, 0, true);
        ctx.fillStyle = umbrellaColor;
        ctx.fill();
        ctx.strokeStyle = '#c2734b';
        ctx.stroke();
        for(let ang=-1.1; ang<=1.1; ang+=0.6){
            let dx = Math.sin(ang)*radius*0.85;
            let dy = Math.cos(ang)*radius*0.55;
            ctx.beginPath();
            ctx.moveTo(cx, apexY+4);
            ctx.lineTo(cx+dx, apexY+4+dy);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, apexY-1, 5, 0, 2*Math.PI);
        ctx.fillStyle = '#eebb77';
        ctx.fill();
    }
    function drawClosedUmbrella(scale) {
        const s = scale/100;
        const cx = W/2;
        const foldY = 68;
        ctx.beginPath();
        ctx.moveTo(cx, foldY+4);
        ctx.lineTo(cx, H-45);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#b87c4f';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, H-45);
        ctx.lineTo(cx-5, H-30);
        ctx.lineTo(cx+5, H-30);
        ctx.fill();
        ctx.fillStyle = umbrellaColor;
        ctx.beginPath();
        ctx.ellipse(cx, foldY+2, 28*s, 16*s, 0, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#a5582e';
        ctx.beginPath();
        ctx.ellipse(cx, foldY, 22*s, 12*s, 0, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx-16*s, foldY);
        ctx.lineTo(cx+16*s, foldY);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#7c5a3a';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, foldY-6, 4, 0, 2*Math.PI);
        ctx.fillStyle = '#eebb77';
        ctx.fill();
    }
    function drawBackground() {
        let grad;
        if(currentWeather === 'sunny') {
            grad = ctx.createLinearGradient(0,0,0,H);
            grad.addColorStop(0,'#cde5ff');
            grad.addColorStop(1,'#fff0bc');
        } else {
            grad = ctx.createLinearGradient(0,0,0,H);
            grad.addColorStop(0,'#819fae');
            grad.addColorStop(1,'#c6dbd4');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle = '#7cad6b';
        ctx.fillRect(0, H-40, W, 40);
        for(let i=0;i<10;i++) {
            ctx.beginPath();
            ctx.moveTo(20+i*38, H-40);
            ctx.lineTo(15+i*38, H-55);
            ctx.lineTo(25+i*38, H-55);
            ctx.fillStyle = '#568c3e';
            ctx.fill();
        }
    }
    function drawWeatherEffects() {
        if(currentWeather === 'rainy') {
            for(let r of rainDrops) {
                ctx.fillStyle = '#b9e2ff';
                ctx.beginPath();
                ctx.ellipse(r.x, r.y, 2, 5, 0, 0, 2*Math.PI);
                ctx.fill();
            }
        } else {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(W-35, 30, 15, 0, 2*Math.PI);
            ctx.fillStyle = '#ffdf88';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(W-35, 30, 10, 0, 2*Math.PI);
            ctx.fillStyle = '#ffb347';
            ctx.fill();
            ctx.restore();
        }
    }
    function drawCanvas() {
        ctx.clearRect(0,0,W,H);
        drawBackground();
        if(umbrellaOpen) drawOpenedUmbrella(umbrellaScale);
        else drawClosedUmbrella(umbrellaScale);
        drawWeatherEffects();
    }

    // Animation loop
    let lastSecond = 0;
    function animate() {
        if(currentWeather === 'rainy') updateRain();
        drawCanvas();
        let nowSec = Math.floor(Date.now()/1000);
        if(nowSec !== lastSecond) {
            lastSecond = nowSec;
            updateOpenTimeAccumulator();
        }
        requestAnimationFrame(animate);
    }

    // Logic thông minh
    function applySmartRule() {
        if(smartMode) {
            if(currentWeather === 'rainy' && !umbrellaOpen) setUmbrellaOpenState(true);
            if(currentWeather === 'sunny' && umbrellaOpen) setUmbrellaOpenState(false);
        }
    }
    function toggleWeather() {
        currentWeather = currentWeather === 'sunny' ? 'rainy' : 'sunny';
        if(currentWeather === 'rainy') initRain();
        applySmartRule();
        saveSettings();
        updateStatsUI();
    }
    function toggleSmartMode() {
        smartMode = !smartMode;
        if(smartMode) {
            document.getElementById('tmSmartMode').style.background = "#4cae7c";
            applySmartRule();
        } else {
            document.getElementById('tmSmartMode').style.background = "#2c6e4f";
        }
        saveSettings();
        updateStatsUI();
    }
    function resetWidget() {
        umbrellaColor = "#e34d4d";
        umbrellaScale = 100;
        umbrellaOpen = true;
        currentWeather = 'sunny';
        smartMode = false;
        totalOpenSeconds = 0;
        if(sessionStartTime) sessionStartTime = null;
        sessionStartTime = Date.now();
        document.getElementById('tmColorPicker').value = umbrellaColor;
        document.getElementById('tmSizeSlider').value = 100;
        document.getElementById('tmSizeVal').innerText = "100%";
        document.getElementById('tmSmartMode').style.background = "#2c6e4f";
        if(currentWeather === 'rainy') initRain();
        else initRain(); // chỉ an toàn
        saveSettings();
        updateStatsUI();
        drawCanvas();
    }

    // KÉO THẢ WIDGET
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    const dragHandle = document.getElementById('tm-drag-handle');
    dragHandle.addEventListener('mousedown', (e) => {
        if(e.target.classList && e.target.classList.contains('tm-close-btn')) return;
        isDragging = true;
        dragOffsetX = e.clientX - widget.offsetLeft;
        dragOffsetY = e.clientY - widget.offsetTop;
        widget.style.position = 'fixed';
        widget.style.cursor = 'grabbing';
        e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        let left = e.clientX - dragOffsetX;
        let top = e.clientY - dragOffsetY;
        left = Math.min(window.innerWidth - widget.offsetWidth - 10, Math.max(10, left));
        top = Math.min(window.innerHeight - widget.offsetHeight - 10, Math.max(10, top));
        widget.style.left = left + 'px';
        widget.style.top = top + 'px';
        widget.style.bottom = 'auto';
        widget.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => { isDragging = false; widget.style.cursor = ''; });
    // Đóng widget
    document.getElementById('tm-close-widget').addEventListener('click', () => {
        widget.style.display = 'none';
    });
    // Sự kiện canvas
    canvas.addEventListener('click', () => {
        if(!smartMode) setUmbrellaOpenState(!umbrellaOpen);
        else document.getElementById('tmFeedbackMsg').innerText = '🧠 Đang thông minh, tắt để thủ công';
        setTimeout(()=>{ if(smartMode) document.getElementById('tmFeedbackMsg').innerText = '✅ chế độ tự động'; else document.getElementById('tmFeedbackMsg').innerText = '✅ thủ công'; },600);
    });
    document.getElementById('tmToggleWeather').addEventListener('click', toggleWeather);
    document.getElementById('tmSmartMode').addEventListener('click', toggleSmartMode);
    document.getElementById('tmResetBtn').addEventListener('click', resetWidget);
    document.getElementById('tmSizeSlider').addEventListener('input', (e) => {
        umbrellaScale = parseInt(e.target.value);
        document.getElementById('tmSizeVal').innerText = umbrellaScale+'%';
        saveSettings();
        drawCanvas();
    });
    document.getElementById('tmColorPicker').addEventListener('input', (e) => {
        umbrellaColor = e.target.value;
        saveSettings();
        drawCanvas();
    });

    // khởi tạo
    loadSettings();
    if(currentWeather === 'rainy') initRain();
    else initRain(); // để mảng mưa sẵn
    if(umbrellaOpen && sessionStartTime === null) sessionStartTime = Date.now();
    updateStatsUI();
    animate();
})();
