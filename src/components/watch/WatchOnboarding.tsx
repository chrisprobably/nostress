import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { Heart, Bell, Check, Smartphone } from 'lucide-react';

interface WatchOnboardingProps {
  onComplete: () => void;
}

export const WatchOnboarding: React.FC<WatchOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [permissions, setPermissions] = useState({
    health: false,
    notifications: false,
    iphone: false
  });

  const steps = [
    {
      title: 'Connect iPhone',
      subtitle: 'Pair with your iPhone app',
      icon: <Smartphone className="w-8 h-8" />,
      description: 'Make sure the Mindful app is installed on your iPhone and Bluetooth is enabled.',
      action: 'Connect iPhone',
      permission: 'iphone'
    },
    {
      title: 'Health Access',
      subtitle: 'Monitor heart rate variability',
      icon: <Heart className="w-8 h-8" />,
      description: 'We use HR/HRV to detect stress and guide brief breathing exercises.',
      action: 'Allow Health Access',
      permission: 'health'
    },
    {
      title: 'Notifications',
      subtitle: 'Get timely wellness reminders',
      icon: <Bell className="w-8 h-8" />,
      description: 'Receive gentle notifications when stress is detected to help you stay mindful.',
      action: 'Enable Notifications',
      permission: 'notifications'
    }
  ];

  const currentStep = steps[step];

  const handlePermissionGrant = () => {
    const permission = currentStep.permission as keyof typeof permissions;
    setPermissions(prev => ({ ...prev, [permission]: true }));
    
    setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        onComplete();
      }
    }, 1000);
  };

  const isPermissionGranted = permissions[currentStep.permission as keyof typeof permissions];

  return (
    <div className="min-h-screen bg-black text-white p-2 flex flex-col">
      {/* Progress Indicator */}
      <div className="flex justify-center gap-1 mb-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index <= step ? 'bg-white' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
      >
        {/* Icon */}
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500 ${
            isPermissionGranted 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-800 text-gray-300'
          }`}
          animate={{ 
            scale: isPermissionGranted ? [1, 1.2, 1] : 1,
            backgroundColor: isPermissionGranted ? '#10B981' : '#1F2937'
          }}
          transition={{ duration: 0.5 }}
        >
          {isPermissionGranted ? <Check className="w-8 h-8" /> : currentStep.icon}
        </motion.div>

        {/* Title */}
        <div>
          <h2 className="text-lg font-medium mb-1">{currentStep.title}</h2>
          <p className="text-sm text-gray-400">{currentStep.subtitle}</p>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-300 leading-relaxed px-2">
          {currentStep.description}
        </p>

        {/* Action Button */}
        <motion.div
          className="w-full px-2"
          initial={{ opacity: 1 }}
          animate={{ opacity: isPermissionGranted ? 0.5 : 1 }}
        >
          <Button
            onClick={handlePermissionGrant}
            disabled={isPermissionGranted}
            className={`w-full py-3 text-sm rounded-full transition-all duration-300 ${
              isPermissionGranted
                ? 'bg-green-500 hover:bg-green-500'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPermissionGranted ? 'Granted ✓' : currentStep.action}
          </Button>
        </motion.div>

        {/* Step Info */}
        <p className="text-xs text-gray-500">
          Step {step + 1} of {steps.length}
        </p>
      </motion.div>
    </div>
  );
};