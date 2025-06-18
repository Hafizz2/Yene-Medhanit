import React, { useRef, useEffect, useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false); // Used when "Use this Image" is clicked
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  
  // New state for confirmation step
  const [capturedImagePreviewData, setCapturedImagePreviewData] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraReady(false); // Camera is no longer "live ready"
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    setCameraReady(false);
    setShowConfirmation(false); // Ensure confirmation is hidden when restarting camera
    setCapturedImagePreviewData(null); // Clear any old preview
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const newStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
          };
        }
      } else {
        setError("Camera access is not supported by your browser.");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera permission denied. Please enable camera access in your browser settings.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
           setError("No camera found. Please ensure a camera is connected and enabled.");
        } else {
          setError("Could not access camera. Please ensure it's not in use by another application.");
        }
      } else {
         setError("An unknown error occurred while accessing the camera.");
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCamera]); // stopStream is not needed here as it's called in cleanup

  const handleInitialCapture = () => { // Renamed from handleCapture
    if (videoRef.current && canvasRef.current && cameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const aspectRatio = video.videoWidth / video.videoHeight;
      // Reduce capture size slightly for faster processing and preview, can be adjusted
      const captureWidth = Math.min(video.videoWidth, 640); 
      canvas.width = captureWidth;
      canvas.height = captureWidth / aspectRatio;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64ImageDataUrl = canvas.toDataURL('image/jpeg', 0.9); 
        setCapturedImagePreviewData(base64ImageDataUrl); // Store full data URL for img src
        setShowConfirmation(true);
        stopStream(); // Stop the live stream to show static preview
      }
    } else {
        setError("Camera not ready or stream not available for capture.");
    }
  };

  const handleConfirmCapture = () => {
    if (capturedImagePreviewData) {
      setIsCapturing(true); // Show loading state on "Use this Image" button
      // Send only the base64 part, not the data URL prefix
      onCapture(capturedImagePreviewData.split(',')[1]); 
      // App.tsx will eventually set showCamera(false), unmounting this component
    }
  };

  const handleRetake = () => {
    startCamera(); // This will reset confirmation states
  };

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-base" role="alert">
        <p className="font-semibold text-lg">Camera Error</p>
        <p>{error}</p>
        <button
          onClick={onClose}
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-base"
          aria-label="Close camera view"
        >
          Close
        </button>
      </div>
    );
  }
  
  return (
    <div className="my-6 p-4 border border-slate-300 rounded-lg bg-slate-50 shadow-md">
      <h3 className="text-xl font-semibold text-slate-700 mb-4 text-center">
        {showConfirmation ? "Confirm Image" : "Scan Medication or Prescription"}
      </h3>

      {showConfirmation && capturedImagePreviewData ? (
        <div className="relative w-full aspect-[16/9] max-w-lg mx-auto bg-slate-200 rounded-lg overflow-hidden shadow-inner mb-4">
            <img src={capturedImagePreviewData} alt="Captured preview" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="relative w-full aspect-[16/9] max-w-lg mx-auto bg-slate-200 rounded-lg overflow-hidden shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted 
            className="w-full h-full object-cover"
            aria-label="Live camera feed"
          />
          {!cameraReady && !error && !showConfirmation && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200 bg-opacity-75">
                  <LoadingSpinner text="Initializing camera..." />
              </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
        {showConfirmation ? (
          <>
            <button
              onClick={handleConfirmCapture}
              disabled={isCapturing || !capturedImagePreviewData}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              aria-label="Use this captured image"
            >
              {isCapturing ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                "Use this Image"
              )}
            </button>
            <button
              onClick={handleRetake}
              disabled={isCapturing}
              className="w-full sm:w-auto px-6 py-3.5 border border-slate-300 text-base font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition duration-150 ease-in-out"
              aria-label="Retake image"
            >
              Retake
            </button>
          </>
        ) : (
          <button
            onClick={handleInitialCapture}
            disabled={!cameraReady}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            aria-label="Capture image from camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            Capture
          </button>
        )}
        <button
          onClick={onClose}
          disabled={isCapturing} // Disable cancel if "Use this image" is processing
          className="w-full sm:w-auto px-6 py-3.5 border border-slate-300 text-base font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition duration-150 ease-in-out"
          aria-label="Cancel camera and go back"
        >
          Cancel
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true"></canvas>
    </div>
  );
};

export default CameraCapture;