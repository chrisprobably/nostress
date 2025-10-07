import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { StressEvent, SleepData } from '../App';
import { TrendingUp, Calendar, Clock, Target, Activity, Info, Moon, Heart } from 'lucide-react';

interface DashboardProps {
  stressEvents: StressEvent[];
  sleepData?: SleepData[];
  onStartSession: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stressEvents, sleepData = [], onStartSession }) => {
  const today = new Date();
  const todayEvents = stressEvents.filter(event => 
    event.timestamp.toDateString() === today.toDateString()
  );

  const thisWeekEvents = stressEvents.filter(event => {
    const eventDate = event.timestamp;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return eventDate >= weekStart;
  });

  const getStressLevel = () => {
    if (todayEvents.length === 0) return { level: 'Low', color: 'bg-green-500', progress: 20 };
    if (todayEvents.length <= 2) return { level: 'Medium', color: 'bg-yellow-500', progress: 50 };
    return { level: 'High', color: 'bg-red-500', progress: 80 };
  };

  const stressLevel = getStressLevel();

  const topCategories = stressEvents.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(topCategories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Sleep data
  const latestSleep = sleepData[0];
  
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSleepQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* HRV Monitoring Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">HRV Monitoring Active</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              We only send alerts when your heart rate variability is outside the normal range. 
              Normal HRV means no action needed - you're doing great!
            </p>
          </div>
        </div>
      </Card>

      {/* Current Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="mb-1">Today's Status</h3>
            <p className="text-muted-foreground">Stress Level: {stressLevel.level}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${stressLevel.color}`} />
        </div>
        <Progress value={stressLevel.progress} className="mb-4" />
        <Button onClick={onStartSession} className="w-full">
          Quick Check-In
        </Button>
      </Card>

      {/* Sleep Overview */}
      {latestSleep && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-primary" />
            <h3>Last Night's Sleep</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">{formatTime(latestSleep.totalSleep)}</div>
              <p className="text-sm text-muted-foreground">Total Sleep</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getSleepQualityColor(latestSleep.sleepQuality)}`} />
                <span className="text-sm font-medium capitalize">{latestSleep.sleepQuality}</span>
              </div>
              <p className="text-sm text-muted-foreground">Sleep Quality</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{latestSleep.heartRate?.avg} bpm avg</span>
            </div>
            <div className="text-muted-foreground">
              {latestSleep.sleepEfficiency}% efficiency
            </div>
          </div>
        </Card>
      )}

      {/* Today's Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3>Today's Activity</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-primary">{todayEvents.length}</div>
            <p className="text-sm text-muted-foreground">Stress Events</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-primary">
              {todayEvents.filter(e => e.completed).length}
            </div>
            <p className="text-sm text-muted-foreground">Completed Sessions</p>
          </div>
        </div>
      </Card>

      {/* Weekly Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3>This Week</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Events</span>
            <span className="font-semibold">{thisWeekEvents.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <span className="font-semibold">
              {thisWeekEvents.length > 0 
                ? Math.round((thisWeekEvents.filter(e => e.completed).length / thisWeekEvents.length) * 100)
                : 0}%
            </span>
          </div>
        </div>
      </Card>

      {/* Top Stress Categories */}
      {sortedCategories.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3>Top Stress Sources</h3>
          </div>
          <div className="space-y-2">
            {sortedCategories.map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm">{category}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {todayEvents.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3>Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {todayEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-lg">{event.moodEmoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{event.mood}</span>
                    <Badge variant="outline" className="text-xs">{event.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {event.completed && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};