import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, SwitchCamera, Sparkles, Edit3, Image as ImageIcon, AlertCircle, Play, Info } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../data/samples';
import { SampleProduct } from '../types/scanner';

interface CameraCaptureProps {
  onScanImage: (base64: string, mimeType: string) => void;
  onScanText: (text: string, productName?: string) => void;
  isScanning: boolean;
  scanProgressText: string;
  forceOpenTextModal?: boolean;
  onCloseTextModal?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onScanImage,
  onScanText,
  isScanning,
  scanProgressText,
  forceOpenTextModal,
  onCloseTextModal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showTextModal, setShowTextModal] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [customProductName, setCustomProductName] = useState<string>('');

  useEffect(() => {
    if (forceOpenTextModal) {
      setShowTextModal(true);
    }
  }, [forceOpenTextModal]);

  // Start video stream
  const startCamera = async (facing: 'environment' | 'user') => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser or upload an image file instead.'
          : 'Camera device not accessible or not supported in this view. Use file upload or test samples below!'
      );
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  // Toggle camera facing mode
  const toggleCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (streamActive) {
      startCamera(nextFacing);
    }
  };

  // Capture frame from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPreviewImage(dataUrl);
    stopCamera();
    onScanImage(dataUrl, 'image/jpeg');
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewImage(result);
      stopCamera();
      onScanImage(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSelectSample = (sample: SampleProduct) => {
    setPreviewImage(null);
    stopCamera();
    onScanText(sample.ingredientsText, `${sample.brand} - ${sample.title}`);
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setShowTextModal(false);
    if (onCloseTextModal) onCloseTextModal();
    onScanText(customText.trim(), customProductName.trim() || undefined);
  };

  return (
    <div className="space-y-6">
      {/* Hero scan banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>AI Food Toxicology &amp; Live Internet Grounding</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Mammalian Carcinogen &amp; Bio-Engineered Ingredient Radar
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
            Snap a photo of any food or cosmetic label. ToxiScan scans international toxicology databases, peer-reviewed rodent bioassays, and USDA Bioengineered disclosure rules to expose harmful preservatives (BHA, BHT, Potassium Bromate, Nitrites, TBHQ) and bio-engineered ingredients.
          </p>
        </div>

        {/* Viewfinder / Capture Box */}
        <div className="mt-8 bg-zinc-950/90 rounded-2xl border border-zinc-800 p-4 sm:p-6 shadow-2xl">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[460px] bg-zinc-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-zinc-800/80">
            {/* Live Video View */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                streamActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Preview Image if captured/uploaded */}
            {previewImage && !streamActive && (
              <img
                src={previewImage}
                alt="Captured Label"
                className="absolute inset-0 w-full h-full object-contain bg-black/60"
              />
            )}

            {/* Scanning Radar Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30" />
                  <div className="w-full h-full rounded-full border-4 border-t-amber-400 border-r-rose-500 border-b-transparent border-l-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                  </div>
                </div>

                <div className="max-w-md">
                  <h3 className="text-lg font-bold text-white mb-2">Analyzing Toxicology &amp; BE Status</h3>
                  <p className="text-sm text-zinc-300">{scanProgressText || 'Grounding findings with live internet search & peer-reviewed animal studies...'}</p>
                  <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>NTP • IARC • USDA AMS • PubMed</span>
                  </div>
                </div>
              </div>
            )}

            {/* Target Alignment Overlay when camera is active */}
            {streamActive && !isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-10">
                <div className="w-full h-full max-w-sm max-h-64 border-2 border-dashed border-emerald-400/70 rounded-xl relative flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-emerald-300 uppercase tracking-widest font-mono">
                    Align Ingredient Label
                  </div>
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                </div>
              </div>
            )}

            {/* Standby State when camera is inactive and no preview */}
            {!streamActive && !previewImage && !isScanning && (
              <div className="p-6 text-center max-w-md z-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-4 text-emerald-400 shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white">Ready to Scan Ingredients</h3>
                <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                  Activate camera to point at ingredients, upload a photo, or enter ingredient text.
                </p>

                {cameraError && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start text-left space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {!streamActive ? (
                <button
                  type="button"
                  onClick={() => startCamera(cameraFacing)}
                  disabled={isScanning}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Camera</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isScanning}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg shadow-rose-900/40 active:scale-95"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span>Capture &amp; Analyze</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    disabled={isScanning}
                    title="Flip camera"
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors border border-zinc-700"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    disabled={isScanning}
                    className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs transition-colors border border-zinc-700"
                  >
                    Close
                  </button>
                </>
              )}

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs sm:text-sm flex items-center space-x-2 transition-colors border border-zinc-700"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Upload Image</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTextModal(true)}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm flex items-center space-x-2 transition-colors border border-zinc-700/60"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Paste Text Directly</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Test Products Section */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Or Test Instant Real-World Product Samples</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select one of these common food profiles to see mammalian toxicology, carcinogen analysis, and BE status in action:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_PRODUCTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="group p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{sample.imageThumbnail}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      sample.id.includes('organic')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {sample.badge}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {sample.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 group-hover:text-zinc-200">
                <span className="text-[11px] text-zinc-500">{sample.brand}</span>
                <span className="inline-flex items-center text-emerald-400 font-medium text-[11px] group-hover:underline">
                  Analyze <Play className="w-3 h-3 ml-1 fill-current" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Paste Modal */}
      {showTextModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span>Input Product Ingredients</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Paste the text from an ingredient panel or recipe to check for preservatives, animal carcinogenicity, and bioengineered crops.
            </p>

            <form onSubmit={handleManualTextSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Product Name (optional)
                </label>
                <input
                  type="text"
                  value={customProductName}
                  onChange={(e) => setCustomProductName(e.target.value)}
                  placeholder="e.g. Traditional Potato Chips or Smoked Sausage"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Ingredients List <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Potatoes, Canola Oil, Dextrose, Salt, Monosodium Glutamate, TBHQ (preservative), Yellow 5 Lake, Soy Lecithin..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTextModal(false);
                    if (onCloseTextModal) onCloseTextModal();
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Analyze Ingredients
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
