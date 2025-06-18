import React, { useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 rounded-lg text-left text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-base">{title}</span>
        <ChevronDownIcon className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-3.5 mt-1 text-sm text-slate-600 bg-slate-50 rounded-md leading-relaxed prose prose-sm max-w-none">
          {children}
        </div>
      )}
    </div>
  );
};

const InfoView: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4">
      <div className="bg-white shadow-2xl rounded-xl p-4 sm:p-6 md:p-8">
        <h2 id="info-title" className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            About Yene Medhanit
        </h2>
        <div className="space-y-2">
          <div className="p-3.5 rounded-lg text-slate-700 bg-slate-50">
            <h3 className="font-medium text-base mb-1">Theme</h3>
            <p className="text-sm text-slate-500">Currently using Light Theme. Dark mode is planned for a future update.</p>
          </div>
          
          <CollapsibleSection title="Our Mission" initiallyOpen={true}>
            <p>Yene Medhanit is your personal medication assistant, designed to provide clear and accessible information about your medicines in multiple languages.</p>
            <p className="mt-2">Our goal is to empower you with knowledge for better health management and to bridge language barriers in healthcare information.</p>
          </CollapsibleSection>

          <CollapsibleSection title="How to Use This App" initiallyOpen={true}>
            <ol className="list-decimal list-inside space-y-1.5">
              <li><strong>Select Language:</strong> Choose your preferred display language on the Home screen.</li>
              <li><strong>Choose Input Method:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                    <li><em>Scan with Camera:</em> Point your camera at the medication packaging or prescription. Confirm or retake the image.</li>
                    <li><em>Enter Manually:</em> Type the medication name into the search bar.</li>
                </ul>
              </li>
              <li><strong>Get Information:</strong> The app will fetch and display details about the medication.</li>
              <li><strong>Use History:</strong> Access your recent searches and cached items from the History tab for quick lookups.</li>
              <li><strong>Ad Support:</strong> To keep this service free, a brief message may appear after a couple of searches.</li>
            </ol>
          </CollapsibleSection>

           <CollapsibleSection title="Important Disclaimer">
            <p className="font-semibold text-amber-700">This application is for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment.</p>
            <p className="mt-2">Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication.</p>
            <p className="mt-2">Never disregard professional medical advice or delay in seeking it because of something you have read on this application.</p>
            <p className="mt-2">If you think you may have a medical emergency, call your doctor, go to the emergency department, or call emergency services immediately.</p>
          </CollapsibleSection>

          <CollapsibleSection title="Rate Limiting">
             <p>To ensure fair usage of the AI services powering this app, there's a limit of {process.env.RATE_LIMIT_COUNT || 5} requests per minute. If you exceed this, you'll be asked to wait briefly.</p>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};

export default InfoView;