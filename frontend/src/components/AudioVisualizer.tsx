import React from 'react';
import { Volume2, Mic } from 'lucide-react';

interface AudioVisualizerProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  label?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isSpeaking = false,
  isListening = false,
  label,
}) => {
  if (!isSpeaking && !isListening) return null;

  return (
    <div className="flex items-center space-x-3 bg-teal-500/10 border border-teal-500/30 rounded-xl px-4 py-2 text-teal-800 animate-pulse">
      {isSpeaking ? (
        <Volume2 className="w-5 h-5 text-teal-600 animate-bounce" />
      ) : (
        <Mic className="w-5 h-5 text-rose-500 animate-pulse" />
      )}
      <div className="flex items-center space-x-1 h-6">
        <span className="w-1 bg-teal-600 rounded-full animate-wave-1"></span>
        <span className="w-1 bg-teal-500 rounded-full animate-wave-2"></span>
        <span className="w-1 bg-teal-700 rounded-full animate-wave-3"></span>
        <span className="w-1 bg-teal-400 rounded-full animate-wave-4"></span>
        <span className="w-1 bg-teal-600 rounded-full animate-wave-5"></span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
        {label || (isSpeaking ? 'AI Speaking' : 'Listening...')}
      </span>
    </div>
  );
};

