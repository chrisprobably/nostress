import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, Heart, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface NotificationTriggerProps {
  onTrigger: () => void;
}

type HRVStatus = 'normal' | 'too-low' | 'too-high';

export const NotificationTrigger: React.FC<NotificationTriggerProps> = ({ onTrigger }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentHRV, setCurrentHRV] = useState<HRVStatus>('normal');
  const [hrvValue, setHrvValue] = useState(45); // Mock HRV value in milliseconds

  // Simulate HRV monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate realistic HRV values and statuses
      const randomValue = Math.floor(Math.random() * 60) + 20; // 20-80ms range
      setHrvValue(randomValue);
      
      if (randomValue < 30) {
        setCurrentHRV('too-low');
      } else if (randomValue > 65) {
        setCurrentHRV('too-high');
      } else {
        setCurrentHRV('normal');
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleTrigger = () => {
    if (currentHRV === 'normal') {
      // Don't trigger notification for normal HRV
      return;
    }

    setIsSimulating(true);
    
    // Simulate a brief delay for HRV anomaly detection
    setTimeout(() => {
      setIsSimulating(false);
      onTrigger();
    }, 1500);
  };

  const getHRVStatusConfig = () => {
    switch (currentHRV) {
      case 'too-low':
        return {
          icon: <TrendingDown className="w-3 h-3" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Low',
          description: 'Below normal range'
        };
      case 'too-high':
        return {
          icon: <TrendingUp className="w-3 h-3" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          label: 'High',
          description: 'Above normal range'
        };
      default:
        return {
          icon: <Activity className="w-3 h-3" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Normal',
          description: 'Within normal range'
        };
    }
  };

  const statusConfig = getHRVStatusConfig();
  const canTrigger = currentHRV !== 'normal';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1 text-xs ${statusConfig.bgColor} ${statusConfig.color} border-current`}
        >
          {statusConfig.icon}
          <span>HRV: {hrvValue}ms</span>
        </Badge>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleTrigger}
          disabled={isSimulating || !canTrigger}
          className={`flex items-center gap-2 ${!canTrigger ? 'opacity-50' : ''}`}
          title={!canTrigger ? 'HRV Normal - No Alert Needed' : `HRV Anomaly (${statusConfig.label.toLowerCase()}) - Click to simulate detection`}
        >
          {isSimulating ? (
            <>
              <Heart className="w-4 h-4 animate-pulse text-red-500" />
              <span className="text-xs">Detecting...</span>
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              <span className="text-xs">
                {canTrigger ? 'Trigger Alert' : 'Normal'}
              </span>
            </>
          )}
        </Button>
      </div>
      
      {canTrigger && (
        <p className="text-xs text-muted-foreground">
          💡 HRV anomalies automatically trigger mood check-ins to help understand your mental state
        </p>
      )}
    </div>
  );
};