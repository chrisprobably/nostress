import React, { useState } from 'react';
import { Button } from '../ui/button';
import { SleepData } from '../../App';
import { Moon, Sun, Heart, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface WatchSleepTrackerProps {
  sleepData: SleepData[];
  onBack: () => void;
}

export const WatchSleepTracker: React.FC<WatchSleepTrackerProps> = ({ 
  sleepData, 
  onBack 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const latestSleep = sleepData[selectedIndex];

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimeOnly = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSleepQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSleepQualityEmoji = (quality: string): string => {
    switch (quality) {
      case 'excellent': return '🌟';
      case 'good': return '😴';
      case 'fair': return '😐';
      case 'poor': return '😵';
      default: return '💤';
    }
  };

  if (!latestSleep) {
    return (
      <div className="min-h-screen bg-black text-white p-2">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-sm font-medium">Sleep</h2>
          <div className="w-6" />
        </div>

        <div className="flex flex-col items-center justify-center h-32">
          <Moon className="w-8 h-8 text-blue-400 mb-3" />
          <p className="text-xs text-gray-400 text-center">
            No sleep data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-1 text-white/60 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <h2 className="text-sm font-medium">Sleep</h2>
          <p className="text-xs text-gray-400">
            {latestSleep.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-1">
          {sleepData.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                disabled={selectedIndex === 0}
                className="p-1 text-white/60 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIndex(Math.min(sleepData.length - 1, selectedIndex + 1))}
                disabled={selectedIndex === sleepData.length - 1}
                className="p-1 text-white/60 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sleep Quality Badge */}
      <div className="text-center mb-4">
        <div className="text-2xl mb-1">{getSleepQualityEmoji(latestSleep.sleepQuality)}</div>
        <div className={`text-sm font-medium capitalize ${getSleepQualityColor(latestSleep.sleepQuality)}`}>
          {latestSleep.sleepQuality}
        </div>
      </div>

      {/* Main Sleep Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center p-3 border border-gray-600 rounded-lg">
          <div className="text-lg font-medium text-blue-400">
            {formatTime(latestSleep.totalSleep)}
          </div>
          <div className="text-xs text-gray-400">Total Sleep</div>
        </div>
        <div className="text-center p-3 border border-gray-600 rounded-lg">
          <div className="text-lg font-medium text-green-400">
            {latestSleep.sleepEfficiency}%
          </div>
          <div className="text-xs text-gray-400">Efficiency</div>
        </div>
      </div>

      {/* Sleep Times */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between p-2 border border-gray-600 rounded-lg">
          <div className="flex items-center gap-2">
            <Moon className="w-3 h-3 text-purple-400" />
            <span className="text-xs">Bedtime</span>
          </div>
          <span className="text-xs font-medium">{formatTimeOnly(latestSleep.bedtime)}</span>
        </div>
        <div className="flex items-center justify-between p-2 border border-gray-600 rounded-lg">
          <div className="flex items-center gap-2">
            <Sun className="w-3 h-3 text-yellow-400" />
            <span className="text-xs">Wake</span>
          </div>
          <span className="text-xs font-medium">{formatTimeOnly(latestSleep.wakeTime)}</span>
        </div>
      </div>

      {/* Sleep Stages */}
      <div className="mb-4">
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Sleep Stages
        </h3>
        
        {/* Visual Sleep Bar */}
        <div className="mb-3">
          <div className="flex h-4 rounded-md overflow-hidden bg-gray-700">
            <div 
              className="bg-purple-500"
              style={{ width: `${(latestSleep.remSleep / latestSleep.totalSleep) * 100}%` }}
            />
            <div 
              className="bg-indigo-600"
              style={{ width: `${(latestSleep.deepSleep / latestSleep.totalSleep) * 100}%` }}
            />
            <div 
              className="bg-blue-400"
              style={{ width: `${(latestSleep.lightSleep / latestSleep.totalSleep) * 100}%` }}
            />
            <div 
              className="bg-orange-400"
              style={{ width: `${(latestSleep.awakeTime / latestSleep.totalSleep) * 100}%` }}
            />
          </div>
        </div>

        {/* Sleep Stage Details */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>REM</span>
            </div>
            <span>{formatTime(latestSleep.remSleep)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-indigo-600 rounded-full" />
              <span>Deep</span>
            </div>
            <span>{formatTime(latestSleep.deepSleep)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>Light</span>
            </div>
            <span>{formatTime(latestSleep.lightSleep)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span>Awake</span>
            </div>
            <span>{formatTime(latestSleep.awakeTime)}</span>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 border border-gray-600 rounded-lg">
          <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <div className="text-xs font-medium">{latestSleep.heartRate?.avg} bpm</div>
          <div className="text-xs text-gray-400">Avg HR</div>
        </div>
        <div className="text-center p-2 border border-gray-600 rounded-lg">
          <Activity className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <div className="text-xs font-medium">{latestSleep.movements}</div>
          <div className="text-xs text-gray-400">Movements</div>
        </div>
      </div>

      {/* Navigation Indicator */}
      {sleepData.length > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {sleepData.slice(0, 7).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === selectedIndex ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};