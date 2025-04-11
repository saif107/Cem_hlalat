import React, { useEffect, useRef } from 'react';
import WebViewer from '@pdftron/webviewer';
import { Book } from 'lucide-react';

function App() {
  const viewer = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

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
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-6 text-center rtl">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Book className="w-8 h-8 text-blue-600" />
            متوسطة الشهداء رزيق - برهوم
          </h1>
          <h2 className="text-xl text-gray-600 mb-1">المجلة المدرسية - العدد الاول - افريل 2025</h2>
          <h3 className="text-2xl font-semibold text-blue-600">أحفـــــاد نوفمبـــــر</h3>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div 
          className="w-full h-[800px] rounded-lg shadow-2xl overflow-hidden" 
          ref={viewer}
        ></div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p className="text-sm">برمجة و تصميم الاستاذ حوض سيف الدين</p>
      </footer>
    </div>
  );
}

export default App;