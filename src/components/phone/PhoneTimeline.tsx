import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { StressEvent } from '../../App';
import { Clock, Check, ChevronRight, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface PhoneTimelineProps {
  stressEvents: StressEvent[];
  onEventClick: (event: StressEvent) => void;
}

export const PhoneTimeline: React.FC<PhoneTimelineProps> = ({ 
  stressEvents, 
  onEventClick 
}) => {
  const today = new Date();
  const todayEvents = stressEvents
    .filter(event => event.timestamp.toDateString() === today.toDateString())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeCategory = (date: Date) => {
    const hour = date.getHours();
    if (hour < 6) return 'Night';
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const groupedEvents = todayEvents.reduce((acc, event) => {
    const category = getTimeCategory(event.timestamp);
    if (!acc[category]) acc[category] = [];
    acc[category].push(event);
    return acc;
  }, {} as Record<string, StressEvent[]>);

  const timeCategories = ['Morning', 'Afternoon', 'Evening', 'Night'];

  if (todayEvents.length === 0) {
    return (
      <div className="space-y-6 pb-20">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2>Today's Timeline</h2>
          </div>
          <p className="text-muted-foreground">No stress events recorded today</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="mb-2">Great day!</h3>
          <p className="text-muted-foreground mb-4">
            No stress detected today. Keep up the good work with your wellness routine.
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Stress-free day
          </Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2>Today's Timeline</h2>
          </div>
          <Badge variant="outline">
            {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold text-primary">{todayEvents.length}</div>
            <p className="text-sm text-muted-foreground">Events</p>
          </div>
          <div>
            <div className="text-xl font-semibold text-green-600">
              {todayEvents.filter(e => e.completed).length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div>
            <div className="text-xl font-semibold text-blue-600">
              {Math.round((todayEvents.filter(e => e.completed).length / todayEvents.length) * 100)}%
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        {timeCategories.map((category) => {
          const events = groupedEvents[category] || [];
          if (events.length === 0) return null;

          return (
            <Card key={category} className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <span>{category}</span>
                <Badge variant="secondary">{events.length}</Badge>
              </h3>
              
              <div className="space-y-3">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => onEventClick(event)}
                      className="w-full p-4 h-auto text-left flex items-center gap-3 hover:bg-muted/50 rounded-xl"
                    >
                      {/* Timeline Dot */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          event.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        {index < events.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                        )}
                      </div>

                      {/* Event Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{event.moodEmoji}</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{event.mood}</span>
                            {event.intensity && (
                              <Badge variant="outline" className="text-xs bg-gradient-to-r from-green-100 to-red-100">
                                {event.intensity}/10
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {event.category}
                              {event.subcategory && ` → ${event.subcategory}`}
                            </Badge>
                          </div>
                          {event.completed && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {formatTime(event.timestamp)}
                            {event.stressWord && ` • Focus: ${event.stressWord}`}
                          </p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Daily Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3>Today's Insights</h3>
        </div>
        
        <div className="space-y-3">
          {/* Most common mood */}
          {(() => {
            const moodCounts = todayEvents.reduce((acc, event) => {
              acc[event.mood] = (acc[event.mood] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            const topMood = Object.entries(moodCounts)
              .sort(([,a], [,b]) => b - a)[0];
            
            if (topMood) {
              return (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Most common feeling:</span>
                  <Badge>{topMood[0]} ({topMood[1]}x)</Badge>
                </div>
              );
            }
          })()}

          {/* Most common category */}
          {(() => {
            const categoryCounts = todayEvents.reduce((acc, event) => {
              acc[event.category] = (acc[event.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            const topCategory = Object.entries(categoryCounts)
              .sort(([,a], [,b]) => b - a)[0];
            
            if (topCategory) {
              return (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Main stress source:</span>
                  <Badge variant="outline">{topCategory[0]} ({topCategory[1]}x)</Badge>
                </div>
              );
            }
          })()}

          {/* Peak stress time */}
          {(() => {
            if (todayEvents.length > 1) {
              const peakTime = getTimeCategory(todayEvents[0].timestamp);
              return (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Peak stress time:</span>
                  <Badge variant="secondary">{peakTime}</Badge>
                </div>
              );
            }
          })()}
        </div>
      </Card>
    </div>
  );
};