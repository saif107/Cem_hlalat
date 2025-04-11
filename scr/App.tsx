import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import { Book, Loader2 } from 'lucide-react';

function App() {
  const viewer = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!viewer.current || hasInitialized.current) return;
    
    hasInitialized.current = true;

    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/2030.pdf',
        licenseKey: 'demo:1234567890',
        enableRightToLeftViewerLayout: true,
      },
      viewer.current,
    ).then((instance) => {
      const { documentViewer } = instance.Core;
      
      documentViewer.setViewerOption(documentViewer.ViewerOption.DEFAULT_LAYOUT_MODE, documentViewer.LayoutMode.FacingContinuous);
      documentViewer.setViewerOption(documentViewer.ViewerOption.READ_DIRECTION, documentViewer.ReadDirection.R2L);
      
      documentViewer.addEventListener('documentLoaded', () => {
        setIsLoading(false);
      });
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg py-12 text-center rtl animate-fade-in border-b border-indigo-100">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-4 page-title">
            <Book className="w-12 h-12 text-indigo-600" />
            متوسطة الشهداء رزيق - برهوم
          </h1>
          <div className="space-y-4">
            <h2 className="text-2xl text-gray-600">المجلة المدرسية - العدد الاول - افريل 2025</h2>
            <h3 className="text-4xl font-bold gradient-text tracking-wider">
              أحفـــــاد نوفمبـــــر
            </h3>
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="relative viewer-container rounded-3xl overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 loading-overlay z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
                <p className="text-2xl text-gray-700">جاري تحميل المجلة...</p>
              </div>
            </div>
          )}
          <div 
            className="w-full h-[800px] page" 
            ref={viewer}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-xl opacity-90 hover:opacity-100 transition-opacity">
            برمجة و تصميم الاستاذ حوض سيف الدين
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;