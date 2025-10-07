import React, { createContext, useContext, useState, useEffect } from 'react';

type DeviceType = 'watch' | 'phone';

interface DeviceContextType {
  device: DeviceType;
  setDevice: (device: DeviceType) => void;
  isWatch: boolean;
  isPhone: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

interface DeviceProviderProps {
  children: React.ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [device, setDevice] = useState<DeviceType>('phone');

  useEffect(() => {
    // Detect device type based on screen size
    const checkDevice = () => {
      if (window.innerWidth <= 200) {
        setDevice('watch');
      } else {
        setDevice('phone');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const value = {
    device,
    setDevice,
    isWatch: device === 'watch',
    isPhone: device === 'phone'
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};