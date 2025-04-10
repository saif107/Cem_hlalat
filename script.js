// إعداد عامل PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// المتغيرات
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
const flipbook = document.getElementById('flipbook');
const pageNumDisplay = document.getElementById('page-num');
const pageCountDisplay = document.getElementById('page-count');
const loadingOverlay = document.getElementById('loading-overlay');
const pageTurnShadow = document.querySelector('.page-turn-shadow');

// تحميل ملف PDF باستخدام طرق متعددة للتوافق مع مختلف الأجهزة
function loadPDF() {
    console.log('بدء محاولة تحميل PDF...');
    
    // محاولة تحميل الملف باستخدام fetch أولاً (أكثر توافقًا مع المتصفحات الحديثة)
    fetch('2030.pdf')
        .then(response => {
            if (!response.ok) {
                throw new Error(`فشل في جلب الملف: ${response.status} ${response.statusText}`);
            }
            console.log('تم جلب الملف بنجاح باستخدام fetch');
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            processPdfData(arrayBuffer);
        })
        .catch(error => {
            console.warn('فشل تحميل PDF باستخدام fetch، جاري المحاولة بطريقة أخرى:', error);
            
            // محاولة ثانية باستخدام XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '2030.pdf', true);
            xhr.responseType = 'arraybuffer';
            
            xhr.onload = function() {
                if (this.status === 200) {
                    console.log('تم تحميل الملف بنجاح باستخدام XMLHttpRequest');
                    processPdfData(this.response);
                } else {
                    console.error('فشل في تحميل PDF باستخدام XMLHttpRequest:', this.status, this.statusText);
                    
                    // محاولة ثالثة باستخدام مسار مطلق
                    tryAlternativePaths();
                }
            };
            
            xhr.onerror = function() {
                console.error('خطأ في الشبكة أثناء تحميل PDF باستخدام XMLHttpRequest');
                tryAlternativePaths();
            };
            
            xhr.send();
        });
}

// محاولة تحميل الملف من مسارات بديلة
function tryAlternativePaths() {
    console.log('محاولة تحميل الملف من مسارات بديلة...');
    
    // قائمة بالمسارات البديلة المحتملة
    const alternativePaths = [
        './2030.pdf',
        '../2030.pdf',
        '/2030.pdf',
        'file:///c:/Users/SiFO-PC/Desktop/مشروع/2030.pdf',
        window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + '2030.pdf'
    ];
    
    // محاولة تحميل الملف من كل مسار بديل
    tryNextPath(alternativePaths, 0);
}

// محاولة تحميل الملف من المسار التالي في القائمة
function tryNextPath(paths, index) {
    if (index >= paths.length) {
        // فشلت جميع المحاولات
        console.error('فشلت جميع محاولات تحميل الملف');
        alert('فشل في تحميل ملف PDF. الرجاء التأكد من وجود الملف في المسار الصحيح.');
        loadingOverlay.style.display = 'none';
        return;
    }
    
    console.log('محاولة تحميل الملف من المسار:', paths[index]);
    
    fetch(paths[index])
        .then(response => {
            if (!response.ok) {
                throw new Error(`فشل في جلب الملف: ${response.status} ${response.statusText}`);
            }
            console.log('تم جلب الملف بنجاح من المسار البديل:', paths[index]);
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            processPdfData(arrayBuffer);
        })
        .catch(error => {
            console.warn(`فشل تحميل PDF من المسار ${paths[index]}:`, error);
            // محاولة المسار التالي
            tryNextPath(paths, index + 1);
        });
}

// معالجة بيانات PDF بعد تحميلها بنجاح
function processPdfData(arrayBuffer) {
    // تحميل PDF باستخدام PDF.js
    pdfjsLib.getDocument({data: arrayBuffer}).promise
        .then(function(pdf) {
            console.log('تم تحميل ملف PDF بنجاح');
            pdfDoc = pdf;
            pageCountDisplay.textContent = pdf.numPages;
            
            // إنشاء صفحات للكتاب
            createPages(pdf.numPages);
            
            // تهيئة turn.js
            initTurn();
            
            // عرض الصفحة الأولى
            renderPage(1);
            
            // إخفاء شاشة التحميل
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }, 1000);
        })
        .catch(function(error) {
            console.error('خطأ في تحميل PDF باستخدام PDF.js:', error);
            alert('خطأ في تحميل ملف PDF: ' + error.message);
            loadingOverlay.style.display = 'none';
        });
}

// إنشاء صفحات للكتاب
function createPages(numPages) {
    flipbook.innerHTML = ''; // مسح أي محتوى موجود
    
    for (let i = 1; i <= numPages; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.dataset.pageNumber = i;
        
        // إضافة canvas لكل صفحة
        const canvas = document.createElement('canvas');
        canvas.id = 'page-' + i;
        pageDiv.appendChild(canvas);
        
        flipbook.appendChild(pageDiv);
    }
}

// تهيئة turn.js مع تأثيرات إضافية
function initTurn() {
    $(flipbook).turn({
        width: flipbook.clientWidth,
        height: flipbook.clientHeight,
        autoCenter: true,
        display: 'double', // تغيير إلى عرض صفحتين
        acceleration: true,
        elevation: 50,
        gradients: true,
        duration: 1000, // مدة أطول للتأثير
        when: {
            turning: function(event, page, view) {
                pageNum = page;
                pageNumDisplay.textContent = page;
                renderPage(page);
                
                // إظهار تأثير الظل عند تقليب الصفحة
                pageTurnShadow.style.opacity = '1';
                setTimeout(() => {
                    pageTurnShadow.style.opacity = '0';
                }, 500);
                
                // تحميل الصفحات المجاورة مسبقًا
                if (page > 1) renderPage(page - 1);
                if (page < pdfDoc.numPages) renderPage(page + 1);
            },
            turned: function(event, page, view) {
                // تحديث رقم الصفحة الحالية
                pageNum = page;
                pageNumDisplay.textContent = page;
            }
        }
    });
    
    // تحسين مظهر الصفحات
    $(flipbook).css({
        'transform-style': 'preserve-3d',
        'perspective': '2000px'
    });
}

// عرض صفحة محددة
function renderPage(num) {
    if (!pdfDoc || num < 1 || num > pdfDoc.numPages) return;
    
    const canvas = document.getElementById('page-' + num);
    if (!canvas || canvas.hasAttribute('data-rendered')) return;
    
    pageRendering = true;
    
    // الحصول على الصفحة
    pdfDoc.getPage(num).then(function(page) {
        const ctx = canvas.getContext('2d');
        
        // حساب المقياس لملاءمة الصفحة في الحاوية
        const viewport = page.getViewport({scale: 1});
        const parent = canvas.parentElement;
        const containerWidth = parent.clientWidth;
        const containerHeight = parent.clientHeight;
        
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const scaleFactor = Math.min(scaleX, scaleY) * 0.95; // 95% من الحاوية
        
        const scaledViewport = page.getViewport({scale: scaleFactor});
        
        // تعيين أبعاد canvas
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        
        // عرض الصفحة
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
        };
        
        page.render(renderContext).promise.then(function() {
            pageRendering = false;
            canvas.setAttribute('data-rendered', 'true');
            
            // التحقق مما إذا كانت هناك صفحة معلقة
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
}

// باقي الكود كما هو...
