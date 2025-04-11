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

// تحميل ملف PDF من Google Drive
function loadPDF() {
    console.log('بدء تحميل PDF من Google Drive...');
    
    // رابط Google Drive للمشاركة المباشرة (يجب تغييره إلى رابط المجلة الخاصة بك)
    // هذا مثال فقط، استبدله برابط المجلة الخاصة بك
    const googleDriveFileID = 'YOUR_FILE_ID';
    const pdfUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileID}`;
    
    // يمكنك أيضًا استخدام الملف المحلي إذا كان متاحًا
    const localPdfUrl = '2025.pdf';
    
    // اختيار المصدر (Google Drive أو محلي)
    const selectedUrl = localPdfUrl; // غيّر هذا إلى pdfUrl لاستخدام Google Drive
    
    fetch(selectedUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`فشل في جلب الملف: ${response.status} ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            // تحويل Blob إلى ArrayBuffer
            const fileReader = new FileReader();
            fileReader.onload = function() {
                const arrayBuffer = this.result;
                
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
                        if (pdf.numPages > 1) {
                            renderPage(2);
                        }
                        
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
            };
            
            // قراءة Blob كـ ArrayBuffer
            fileReader.readAsArrayBuffer(blob);
        })
        .catch(error => {
            console.error('خطأ في تحميل الملف:', error);
            fallbackLoadPDF();
        });
}

// طريقة بديلة لتحميل PDF في حالة فشل fetch
function fallbackLoadPDF() {
    console.log('استخدام طريقة بديلة لتحميل PDF...');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '2030.pdf', true);
    xhr.responseType = 'blob';
    
    xhr.onload = function() {
        if (this.status === 200) {
            const blob = this.response;
            const fileReader = new FileReader();
            
            fileReader.onload = function() {
                const arrayBuffer = this.result;
                
                // تحميل PDF باستخدام PDF.js
                pdfjsLib.getDocument({data: arrayBuffer}).promise
                    .then(function(pdf) {
                        console.log('تم تحميل ملف PDF بنجاح باستخدام الطريقة البديلة');
                        pdfDoc = pdf;
                        pageCountDisplay.textContent = pdf.numPages;
                        
                        // إنشاء صفحات للكتاب
                        createPages(pdf.numPages);
                        
                        // تهيئة turn.js
                        initTurn();
                        
                        // عرض الصفحة الأولى
                        renderPage(1);
                        if (pdf.numPages > 1) {
                            renderPage(2);
                        }
                        
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
            };
            
            fileReader.readAsArrayBuffer(blob);
        } else {
            console.error('فشل في تحميل PDF:', this.status, this.statusText);
            alert('فشل في تحميل ملف PDF. الرجاء التأكد من وجود الملف في المسار الصحيح.');
            loadingOverlay.style.display = 'none';
        }
    };
    
    xhr.onerror = function() {
        console.error('خطأ في الشبكة أثناء تحميل PDF');
        alert('خطأ في الشبكة أثناء تحميل ملف PDF');
        loadingOverlay.style.display = 'none';
    };
    
    xhr.send();
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
        display: 'double', // عرض صفحتين
        acceleration: true,
        elevation: 50,
        gradients: true,
        duration: 1000, // مدة أطول للتأثير
        direction: 'ltr', // تغيير اتجاه الكتاب للعربية (من اليمين إلى اليسار)
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

// زر الصفحة السابقة
document.getElementById('prev').addEventListener('click', function() {
    if (pageNum <= 1) return;
    
    // إضافة تأثير نقر للزر
    this.classList.add('active');
    setTimeout(() => this.classList.remove('active'), 200);
    
    pageNum--;
    $(flipbook).turn('previous');
});

// زر الصفحة التالية
document.getElementById('next').addEventListener('click', function() {
    if (pageNum >= pdfDoc.numPages) return;
    
    // إضافة تأثير نقر للزر
    this.classList.add('active');
    setTimeout(() => this.classList.remove('active'), 200);
    
    pageNum++;
    $(flipbook).turn('next');
});

// التعامل مع تغيير حجم النافذة
window.addEventListener('resize', function() {
    if (flipbook) {
        $(flipbook).turn('size', flipbook.clientWidth, flipbook.clientHeight);
        
        // إعادة عرض الصفحات الحالية بعد تغيير الحجم
        renderPage(pageNum);
        if (pageNum > 1) renderPage(pageNum - 1);
        if (pageNum < pdfDoc.numPages) renderPage(pageNum + 1);
    }
});

// إضافة دعم لوحة المفاتيح
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') { // تغيير من ArrowLeft إلى ArrowRight للعربية
        if (pageNum < pdfDoc.numPages) {
            pageNum++;
            $(flipbook).turn('next');
        }
    } else if (e.key === 'ArrowLeft') { // تغيير من ArrowRight إلى ArrowLeft للعربية
        if (pageNum > 1) {
            pageNum--;
            $(flipbook).turn('previous');
        }
    }
});

// بدء التحميل عندما تكون الصفحة جاهزة
document.addEventListener('DOMContentLoaded', function() {
    // إظهار شاشة التحميل
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.opacity = '1';
    
    // تحميل PDF
    loadPDF();
});
