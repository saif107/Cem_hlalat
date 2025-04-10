// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// PDF file path - make sure this matches your file location exactly
const pdfPath = './2030.pdf';
let pdfDoc = null;
let pageCount = 0;

// Load the PDF with better error handling
function loadPDF() {
    console.log('Attempting to load PDF from:', pdfPath);
    
    // Create a fetch request to check if the file exists
    fetch(pdfPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        })
        .then(pdf => {
            console.log('PDF loaded successfully');
            pdfDoc = pdf;
            pageCount = pdf.numPages;
            console.log('Number of pages:', pageCount);
            
            // Initialize the flipbook after loading the PDF
            initializeFlipbook();
        })
        .catch(error => {
            console.error('Error loading PDF:', error);
            alert('حدث خطأ أثناء تحميل ملف PDF: ' + error.message);
        });
}

function initializeFlipbook() {
    const flipbook = document.getElementById('flipbook');
    
    // Create pages for the flipbook
    for (let i = 1; i <= pageCount; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.dataset.pageNumber = i;
        flipbook.appendChild(pageDiv);
    }
    
    // Initialize turn.js
    $(flipbook).turn({
        width: flipbook.clientWidth,
        height: flipbook.clientHeight,
        autoCenter: true,
        display: 'double',
        acceleration: true,
        elevation: 50,
        gradients: true,
        when: {
            turning: function(event, page, view) {
                // Load the required pages
                const range = $(this).turn('range', page);
                for (let i = range[0]; i <= range[1]; i++) {
                    renderPage(i);
                }
            },
            turned: function(event, page, view) {
                // Load the visible pages
                for (let i = 0; i < view.length; i++) {
                    if (view[i] > 0) {
                        renderPage(view[i]);
                    }
                }
            }
        }
    });
    
    // Render initial pages
    renderPage(1);
    if (pageCount > 1) {
        renderPage(2);
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        $(flipbook).turn('size', flipbook.clientWidth, flipbook.clientHeight);
    });
    
    // Navigation buttons
    document.getElementById('prev').addEventListener('click', function() {
        $(flipbook).turn('previous');
    });
    
    document.getElementById('next').addEventListener('click', function() {
        $(flipbook).turn('next');
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            $(flipbook).turn('next');
        } else if (e.key === 'ArrowRight') {
            $(flipbook).turn('previous');
        }
    });
}

function renderPage(pageNumber) {
    if (!pdfDoc || pageNumber > pageCount) return;
    
    const pageDiv = document.querySelector(`.page[data-page-number="${pageNumber}"]`);
    if (pageDiv && !pageDiv.hasAttribute('data-rendered')) {
        pageDiv.setAttribute('data-rendered', 'true');
        
        pdfDoc.getPage(pageNumber).then(function(page) {
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Calculate scale to fit the page in the container
            const containerWidth = pageDiv.clientWidth;
            const containerHeight = pageDiv.clientHeight;
            const scale = Math.min(
                containerWidth / viewport.width,
                containerHeight / viewport.height
            );
            
            const scaledViewport = page.getViewport({ scale });
            
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            // Render the PDF page
            page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise.then(function() {
                // Add the rendered page to the DOM
                pageDiv.style.backgroundImage = `url(${canvas.toDataURL()})`;
            });
        });
    }
}

// Start loading the PDF when the page is loaded
document.addEventListener('DOMContentLoaded', loadPDF);
