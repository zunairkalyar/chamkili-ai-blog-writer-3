
import React from 'react';
import { AutopilotStatus } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface AutoPilotPanelProps {
    isActive: boolean;
    onToggle: (enabled: boolean) => void;
    status: AutopilotStatus;
    currentTask: string;
    countdown: number;
    log: string[];
    prerequisites: {
        shopify: boolean;
        brandVoice: boolean;
        persona: boolean;
    };
}

const formatCountdown = (ms: number): string => {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const PrerequisiteItem: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
    <li className={`flex items-center gap-2 text-sm ${met ? 'text-green-700' : 'text-red-700'}`}>
        {met ? <CheckCircleIcon className="w-5 h-5"/> : <XCircleIcon className="w-5 h-5"/>}
        {label}
    </li>
);

const AutoPilotPanel: React.FC<AutoPilotPanelProps> = ({ isActive, onToggle, status, currentTask, countdown, log, prerequisites }) => {
    const canBeEnabled = prerequisites.shopify && prerequisites.brandVoice && prerequisites.persona;
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label htmlFor="autopilot-toggle" className={`flex items-center ${canBeEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            id="autopilot-toggle" 
                            className="sr-only peer" 
                            checked={isActive} 
                            onChange={(e) => onToggle(e.target.checked)}
                            disabled={!canBeEnabled}
                        />
                        <div className="block w-14 h-8 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors"></div>
                        <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full"></div>
                    </div>
                </label>
                <div className={`text-lg font-bold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
            </div>

             {!canBeEnabled && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <p className="text-sm font-semibold mb-2">Prerequisites not met:</p>
                    <ul className="space-y-1">
                        {!prerequisites.shopify && <PrerequisiteItem label="Shopify Not Connected" met={false} />}
                        {!prerequisites.brandVoice && <PrerequisiteItem label="Brand Voice Not Set" met={false} />}
                        {!prerequisites.persona && <PrerequisiteItem label="Audience Persona Not Set" met={false} />}
                    </ul>
                </div>
            )}
             <p className="text-xs text-gray-500 italic">
                Requires this browser tab to remain open. Auto-Pilot will pause if any errors occur.
             </p>

             <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <div className="p-3 bg-gray-100 rounded-lg text-center">
                    {status === 'idle' && <p className="text-gray-500">Enable to start automatic posting.</p>}
                    {status === 'working' && (
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           <span className="font-semibold">{currentTask || 'Working...'}</span>
                        </div>
                    )}
                    {status === 'waiting' && (
                        <div>
                            <p className="font-semibold text-gray-700">Next post in:</p>
                            <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider">{formatCountdown(countdown)}</p>
                        </div>
                    )}
                     {status === 'error' && (
                        <p className="font-semibold text-red-600">Error! Auto-Pilot paused. Check log.</p>
                     )}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
                 <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Log</h4>
                 <div className="h-48 bg-gray-800 text-white font-mono text-xs p-3 rounded-lg overflow-y-auto flex flex-col-reverse custom-scrollbar">
                    {log.map((entry, index) => <p key={index} className="whitespace-pre-wrap">{entry}</p>)}
                 </div>
            </div>
        </div>
    );
};

export default AutoPilotPanel;
