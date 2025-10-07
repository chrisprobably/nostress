import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useDevice } from './DeviceContext';
import { Smartphone, Watch, Monitor } from 'lucide-react';

export const DeviceSelector: React.FC = () => {
  const { device, setDevice } = useDevice();

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="w-5 h-5 text-primary" />
        <h3>Device Simulator</h3>
        <Badge variant="outline">Demo Mode</Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Switch between Apple Watch and iPhone interfaces to experience the full app flow.
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={device === 'watch' ? 'default' : 'outline'}
          onClick={() => setDevice('watch')}
          className="flex items-center gap-2 h-auto py-3"
        >
          <Watch className="w-4 h-4" />
          <div className="text-left">
            <div className="font-medium">Apple Watch</div>
            <div className="text-xs opacity-70">200px width</div>
          </div>
        </Button>
        
        <Button
          variant={device === 'phone' ? 'default' : 'outline'}
          onClick={() => setDevice('phone')}
          className="flex items-center gap-2 h-auto py-3"
        >
          <Smartphone className="w-4 h-4" />
          <div className="text-left">
            <div className="font-medium">iPhone</div>
            <div className="text-xs opacity-70">Full interface</div>
          </div>
        </Button>
      </div>
    </Card>
  );
};