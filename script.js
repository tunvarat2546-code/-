// ========== Enhanced Browser Compatibility & Debug Setup ==========

// Debug mode และ detection
const DEBUG_MODE = true; // เปลี่ยนเป็น false หลังจากแก้ไขเสร็จ
const ENABLE_ALTERNATIVE_METHODS = true; // เปิดใช้วิธีทางเลือก

function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        console.log(`🔍 DEBUG: ${message}`, data || '');
    }
}

// ตรวจสอบสภาพแวดล้อมและข้อจำกัด
function detectEnvironmentRestrictions() {
    const restrictions = [];
    
    // ตรวจสอบ third-party cookies
    if (!navigator.cookieEnabled) {
        restrictions.push('Cookies ถูกปิด');
    }
    
    // ตรวจสอบ local storage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        restrictions.push('Local Storage ถูกบล็อก');
    }
    
    // ตรวจสอบ fetch cors mode
    const corsSupported = 'credentials' in Request.prototype;
    if (!corsSupported) {
        restrictions.push('CORS ไม่รองรับเต็มรูปแบบ');
    }
    
    debugLog('Environment restrictions detected', restrictions);
    return restrictions;
}

// ========== Global Variables ==========

let currentQuestionIndex = 1;
const totalQuestions = 23;

// **เปลี่ยน URL นี้เป็น Apps Script URL ของคุณ**
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyjZTljGl05CT2DdoOqZ7jySQKCs1MxQY0DXzXmTw5jyRAWH9zrzT3YsUuiB8-m1hOc/exec';

// Alternative submission methods
const ALTERNATIVE_METHODS = {
    // Method 1: Form submission with iframe (bypasses CORS)
    iframe: true,
    // Method 2: JSONP-style callback
    jsonp: true,
    // Method 3: Image pixel tracking (สำหรับกรณีฉุกเฉิน)
    pixel: true
};

// ========== DOM Elements ==========

const progressFill = document.getElementById('progressFill');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const form = document.getElementById('politicalStyleForm');
const loadingScreen = document.getElementById('loadingScreen');
const successScreen = document.getElementById('successScreen');

// ========== Initialize ==========

document.addEventListener('DOMContentLoaded', async function() {
    debugLog('DOM Content Loaded');
    
    // ตรวจสอบสภาพแวดล้อม
    const restrictions = detectEnvironmentRestrictions();
    logDeviceInfo();
    
    // แสดงข้อมูล debug
    if (DEBUG_MODE && restrictions.length > 0) {
        console.warn('⚠️ Environment restrictions detected:', restrictions);
    }
    
    updateProgress();
    totalQuestionsSpan.textContent = totalQuestions;
    form.addEventListener('submit', handleFormSubmissionMultiMethod);
    setupAutoAdvance();
    
    debugLog('Political Style Quiz Loaded Successfully!');
    console.log('🎉 Political Style Quiz Loaded Successfully!');
    
    // ทดสอบการเชื่อมต่อ
    if (DEBUG_MODE) {
        setTimeout(testConnectivity, 2000);
    }
});

// ========== Connectivity Testing ==========

async function testConnectivity() {
    debugLog('Testing connectivity...');
    
    try {
        // ทดสอบการเชื่อมต่อกับ Google Apps Script
        const testResponse = await fetch(APPS_SCRIPT_URL + '?test=1', {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-cache'
        });
        
        debugLog('Connectivity test completed', {
            ok: testResponse.ok,
            status: testResponse.status,
            type: testResponse.type
        });
        
    } catch (error) {
        debugLog('Connectivity test failed', error);
        console.warn('⚠️ การทดสอบการเชื่อมต่อไม่สำเร็จ - อาจมีข้อจำกัดเครือข่าย');
    }
}

function logDeviceInfo() {
    if (DEBUG_MODE) {
        debugLog('Browser Info', {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            onLine: navigator.onLine,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : 'Not available'
        });
    }
}

// ========== Navigation Functions (เหมือนเดิม) ==========

function nextQuestion() {
    const currentCard = document.querySelector(`[data-question="${currentQuestionIndex}"]`);
    
    if (!validateCurrentQuestion()) {
        showValidationMessage();
        return;
    }
    
    currentCard.classList.remove('active');
    currentQuestionIndex++;
    
    const nextCard = document.querySelector(`[data-question="${currentQuestionIndex}"]`);
    if (nextCard) {
        nextCard.classList.add('active');
        updateProgress();
        
        nextCard.style.opacity = '0';
        nextCard.style.transform = 'translateX(30px)';
        setTimeout(() => {
            nextCard.style.transition = 'all 0.5s ease';
            nextCard.style.opacity = '1';
            nextCard.style.transform = 'translateX(0)';
        }, 10);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousQuestion() {
    if (currentQuestionIndex <= 1) return;
    
    const currentCard = document.querySelector(`[data-question="${currentQuestionIndex}"]`);
    currentCard.classList.remove('active');
    currentQuestionIndex--;
    
    const prevCard = document.querySelector(`[data-question="${currentQuestionIndex}"]`);
    if (prevCard) {
        prevCard.classList.add('active');
        updateProgress();
        
        prevCard.style.opacity = '0';
        prevCard.style.transform = 'translateX(-30px)';
        setTimeout(() => {
            prevCard.style.transition = 'all 0.5s ease';
            prevCard.style.opacity = '1';
            prevCard.style.transform = 'translateX(0)';
        }, 10);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== Validation Functions (เหมือนเดิม) ==========

function validateCurrentQuestion() {
    const currentCard = document.querySelector(`[data-question="${currentQuestionIndex}"]`);
    if (!currentCard) return false;
    
    const requiredInputs = currentCard.querySelectorAll('input[required]');
    
    for (let input of requiredInputs) {
        if (input.type === 'radio') {
            const radioGroup = currentCard.querySelectorAll(`input[name="${input.name}"]`);
            let isChecked = false;
            for (let radio of radioGroup) {
                if (radio.checked) {
                    isChecked = true;
                    break;
                }
            }
            if (!isChecked) return false;
        } else if (input.type === 'email') {
            if (!input.value.trim() || !isValidEmail(input.value)) return false;
        } else {
            if (!input.value.trim()) return false;
        }
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showValidationMessage() {
    const existingPopup = document.querySelector('.validation-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    const popup = document.createElement('div');
    popup.className = 'validation-popup';
    
    const currentCard = document.querySelector(`[data-question="${currentQuestionIndex}"]`);
    const isEmailQuestion = currentCard && currentCard.querySelector('input[type="email"]');
    
    const message = isEmailQuestion 
        ? 'กรุณาใส่อีเมลที่ถูกต้อง' 
        : 'กรุณาตอบคำถามให้ครบถ้วนก่อนไปยังคำถามถัดไป';
    
    popup.innerHTML = `
        <div class="validation-content">
            <h3>⚠️ กรุณาตรวจสอบข้อมูล</h3>
            <p>${message}</p>
            <button onclick="closeValidationPopup()" class="btn btn-next">ตกลง</button>
        </div>
    `;
    
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); display: flex; justify-content: center;
        align-items: center; z-index: 1001; animation: fadeIn 0.3s ease;
    `;
    
    const content = popup.querySelector('.validation-content');
    content.style.cssText = `
        background: white; padding: 30px; border-radius: 15px; text-align: center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3); max-width: 400px; width: 90%;
        animation: slideInUp 0.3s ease;
    `;
    
    document.body.appendChild(popup);
    popup.querySelector('button').focus();
}

function closeValidationPopup() {
    const popup = document.querySelector('.validation-popup');
    if (popup) {
        popup.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => popup.remove(), 300);
    }
}

// ========== Progress Update ==========

function updateProgress() {
    const progress = (currentQuestionIndex / totalQuestions) * 100;
    progressFill.style.width = `${Math.min(100, progress)}%`;
    currentQuestionSpan.textContent = currentQuestionIndex;
    
    if (progress >= 100) {
        progressFill.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
    } else if (progress >= 75) {
        progressFill.style.background = 'linear-gradient(45deg, #FF9800, #FFC107)';
    } else if (progress >= 50) {
        progressFill.style.background = 'linear-gradient(45deg, #2196F3, #03A9F4)';
    } else {
        progressFill.style.background = 'linear-gradient(45deg, #9C27B0, #E91E63)';
    }
}

// ========== Multi-Method Form Submission ==========

async function handleFormSubmissionMultiMethod(e) {
    e.preventDefault();
    debugLog('Form submission started with multi-method approach');
    
    if (!validateAllRequiredFields()) {
        alert('กรุณาตอบคำถามให้ครบถ้วนทุกข้อก่อนส่ง');
        return;
    }
    
    loadingScreen.style.display = 'flex';
    
    const formData = new FormData(form);
    
    // สร้าง timestamp
    const timestamp = new Date().toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    formData.append('timestamp', timestamp);
    
    debugLog('Form data prepared', {
        timestamp,
        dataSize: Array.from(formData.entries()).length,
        entries: Array.from(formData.entries())
    });
    
    // ลำดับการลองส่ง: Fetch -> XHR -> IFrame -> JSONP
    const methods = [
        { name: 'fetch', fn: () => submitWithFetch(formData) },
        { name: 'xhr', fn: () => submitWithXHR(formData) },
        { name: 'iframe', fn: () => submitWithIframe(formData) },
        { name: 'jsonp', fn: () => submitWithJSONP(formData) }
    ];
    
    let lastError = null;
    
    for (const method of methods) {
        try {
            debugLog(`Trying ${method.name} method...`);
            await method.fn();
            debugLog(`${method.name} method succeeded!`);
            handleSuccess(`Success via ${method.name}`);
            return; // สำเร็จแล้วออกจาก loop
        } catch (error) {
            debugLog(`${method.name} method failed`, error);
            lastError = error;
            
            // รอหน่อยก่อนลองวิธีถัดไป
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // ถ้าทุกวิธีไม่สำเร็จ
    debugLog('All methods failed', lastError);
    handleSubmissionError(lastError || new Error('ทุกวิธีการส่งข้อมูลไม่สำเร็จ'));
}

// Method 1: Fetch API
async function submitWithFetch(formData) {
    const response = await Promise.race([
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        }),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Fetch timeout')), 15000)
        )
    ]);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
}

// Method 2: XMLHttpRequest
function submitWithXHR(formData) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) { // 0 for local files
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`XHR error! status: ${xhr.status}`));
                }
            }
        };
        
        xhr.onerror = () => reject(new Error('XHR network error'));
        xhr.ontimeout = () => reject(new Error('XHR timeout'));
        
        xhr.timeout = 15000;
        xhr.open('POST', APPS_SCRIPT_URL, true);
        xhr.send(formData);
    });
}

// Method 3: Hidden Iframe (bypasses most CORS issues)
function submitWithIframe(formData) {
    return new Promise((resolve, reject) => {
        debugLog('Creating hidden iframe for submission...');
        
        // สร้าง form element ใหม่
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = APPS_SCRIPT_URL;
        hiddenForm.target = 'hidden_iframe_' + Date.now();
        hiddenForm.style.display = 'none';
        
        // สร้าง iframe ซ่อน
        const iframe = document.createElement('iframe');
        iframe.name = hiddenForm.target;
        iframe.style.display = 'none';
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        
        // เพิ่ม input fields ลงในฟอร์ม
        for (let [key, value] of formData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            hiddenForm.appendChild(input);
        }
        
        // เพิ่ม callback parameter
        const callbackInput = document.createElement('input');
        callbackInput.type = 'hidden';
        callbackInput.name = 'callback';
        callbackInput.value = 'iframe_callback_' + Date.now();
        hiddenForm.appendChild(callbackInput);
        
        // เพิ่มเข้า DOM
        document.body.appendChild(iframe);
        document.body.appendChild(hiddenForm);
        
        // ตั้งค่า timeout
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Iframe submission timeout'));
        }, 20000);
        
        // ฟังก์ชันทำความสะอาด
        const cleanup = () => {
            clearTimeout(timeout);
            document.body.removeChild(iframe);
            document.body.removeChild(hiddenForm);
        };
        
        // เมื่อ iframe โหลดเสร็จ
        iframe.onload = () => {
            debugLog('Iframe loaded, assuming success...');
            cleanup();
            resolve('Iframe submission completed');
        };
        
        iframe.onerror = () => {
            cleanup();
            reject(new Error('Iframe submission failed'));
        };
        
        // ส่งฟอร์ม
        hiddenForm.submit();
        debugLog('Form submitted via iframe');
    });
}

// Method 4: JSONP-style submission
function submitWithJSONP(formData) {
    return new Promise((resolve, reject) => {
        debugLog('Attempting JSONP-style submission...');
        
        const callbackName = 'jsonp_callback_' + Date.now();
        const script = document.createElement('script');
        
        // สร้าง query string
        const params = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            params.append(key, value);
        }
        params.append('callback', callbackName);
        
        // ตั้งค่า global callback
        window[callbackName] = function(response) {
            debugLog('JSONP callback received', response);
            document.head.removeChild(script);
            delete window[callbackName];
            clearTimeout(timeout);
            resolve(response);
        };
        
        // ตั้งค่า timeout
        const timeout = setTimeout(() => {
            document.head.removeChild(script);
            delete window[callbackName];
            reject(new Error('JSONP timeout'));
        }, 15000);
        
        script.onerror = () => {
            document.head.removeChild(script);
            delete window[callbackName];
            clearTimeout(timeout);
            reject(new Error('JSONP script error'));
        };
        
        script.src = `${APPS_SCRIPT_URL}?${params.toString()}`;
        document.head.appendChild(script);
    });
}

function handleSuccess(result) {
    debugLog('Handling success response', result);
    console.log('✅ Server response:', result);
    
    loadingScreen.style.display = 'none';
    successScreen.style.display = 'flex';
    
    setTimeout(() => {
        successScreen.style.display = 'none';
        if (confirm('ต้องการทำแบบสอบถามใหม่อีกครั้งหรือไม่?')) {
            resetForm();
        }
    }, 5000);
}

function handleSubmissionError(error) {
    debugLog('Handling submission error', error);
    loadingScreen.style.display = 'none';
    
    let errorMessage = '⚠️ ไม่สามารถส่งข้อมูลได้\n\n';
    errorMessage += '🔧 สาเหตุที่เป็นไปได้:\n';
    errorMessage += '• เครือข่าย/องค์กรบล็อก Google Scripts\n';
    errorMessage += '• การตั้งค่าความปลอดภัยของเบราว์เซอร์\n';
    errorMessage += '• Firewall หรือ Proxy ขัดขวาง\n\n';
    errorMessage += '💡 วิธีแก้ไข:\n';
    errorMessage += '• ลองใช้เครือข่ายอื่น (เช่น มือถือ hotspot)\n';
    errorMessage += '• ลองเบราว์เซอร์อื่น (Chrome, Firefox, Safari)\n';
    errorMessage += '• ปิดโปรแกรมป้องกันไวรัสชั่วคราว\n';
    errorMessage += '• ติดต่อผู้ดูแลเครือข่าย\n\n';
    errorMessage += '🆘 กรณีฉุกเฉิน: ถ่ายหน้าจอคำตอบส่งให้ผู้ดูแล';
    
    alert(errorMessage);
    
    // เสนอให้ลองอีกครั้ง
    setTimeout(() => {
        if (confirm('ต้องการลองส่งข้อมูลอีกครั้งหรือไม่?')) {
            handleFormSubmissionMultiMethod(new Event('submit'));
        }
    }, 3000);
}

function validateAllRequiredFields() {
    const requiredInputs = form.querySelectorAll('input[required]');
    const radioGroups = {};
    
    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            if (!radioGroups[input.name]) {
                radioGroups[input.name] = [];
            }
            radioGroups[input.name].push(input);
        }
    });
    
    for (let groupName in radioGroups) {
        const isChecked = radioGroups[groupName].some(radio => radio.checked);
        if (!isChecked) return false;
    }
    
    for (let input of requiredInputs) {
        if (input.type !== 'radio') {
            if (input.type === 'email') {
                if (!input.value.trim() || !isValidEmail(input.value)) return false;
            } else {
                if (!input.value.trim()) return false;
            }
        }
    }
    
    return true;
}

// ========== Auto-advance Setup ==========

function setupAutoAdvance() {
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio') {
            const optionCard = e.target.closest('.option-card');
            if (optionCard) {
                optionCard.style.transform = 'scale(1.02)';
                optionCard.style.transition = 'transform 0.2s ease';
                setTimeout(() => optionCard.style.transform = 'scale(1)', 200);
            }
            
            setTimeout(() => {
                if (validateCurrentQuestion() && currentQuestionIndex < totalQuestions) {
                    const currentCard = document.querySelector(`[data-question="${currentQuestionIndex}"]`);
                    if (currentCard && currentCard.classList.contains('active')) {
                        nextQuestion();
                    }
                }
            }, 1000);
        }
    });
}

// ========== Utility Functions ==========

function resetForm() {
    form.reset();
    currentQuestionIndex = 1;
    
    const cards = document.querySelectorAll('.question-card');
    cards.forEach(card => card.classList.remove('active'));
    
    const firstCard = document.querySelector('[data-question="1"]');
    if (firstCard) firstCard.classList.add('active');
    
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    debugLog('Form reset successfully');
    console.log('🔄 Form reset successfully');
}

// ========== Keyboard Navigation ==========

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.target.closest('textarea') && !e.target.closest('button')) {
        e.preventDefault();
        if (currentQuestionIndex === totalQuestions + 1) {
            form.dispatchEvent(new Event('submit'));
        } else if (validateCurrentQuestion()) {
            nextQuestion();
        } else {
            showValidationMessage();
        }
    }
    
    if (e.key === 'Escape') closeValidationPopup();
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (validateCurrentQuestion()) nextQuestion();
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        previousQuestion();
    }
});

// ========== Accessibility Enhancements ==========

document.addEventListener('focusin', function(e) {
    if (e.target.type === 'radio') {
        const card = e.target.closest('.option-card');
        if (card) {
            card.style.outline = '2px solid #2196F3';
            card.style.outlineOffset = '2px';
        }
    }
});

document.addEventListener('focusout', function(e) {
    if (e.target.type === 'radio') {
        const card = e.target.closest('.option-card');
        if (card) card.style.outline = 'none';
    }
});

// ========== Network Status Monitoring ==========

window.addEventListener('online', () => {
    debugLog('Connection restored');
    console.log('🌐 การเชื่อมต่อเครือข่ายกลับมาแล้ว');
});

window.addEventListener('offline', () => {
    debugLog('Connection lost');
    console.log('📶 สูญเสียการเชื่อมต่อเครือข่าย');
    alert('⚠️ สูญเสียการเชื่อมต่ออินเทอร์เน็ต\nกรุณาตรวจสอบการเชื่อมต่อก่อนส่งข้อมูล');
});