import React, { useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { StressEvent } from '../App';
import { Calendar, TrendingUp, Target, Clock } from 'lucide-react';

interface ReportsProps {
  stressEvents: StressEvent[];
}

export const Reports: React.FC<ReportsProps> = ({ stressEvents }) => {
  const today = new Date();
  
  // Daily data for the last 7 days
  const dailyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayEvents = stressEvents.filter(event => 
        event.timestamp.toDateString() === date.toDateString()
      );
      
      data.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        events: dayEvents.length,
        completed: dayEvents.filter(e => e.completed).length
      });
    }
    return data;
  }, [stressEvents, today]);

  // Weekly data for the last 4 weeks
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + (i * 7)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekEvents = stressEvents.filter(event => 
        event.timestamp >= weekStart && event.timestamp <= weekEnd
      );
      
      data.push({
        week: `Week ${4 - i}`,
        period: `${weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`,
        events: weekEvents.length,
        completed: weekEvents.filter(e => e.completed).length,
        completionRate: weekEvents.length > 0 ? Math.round((weekEvents.filter(e => e.completed).length / weekEvents.length) * 100) : 0
      });
    }
    return data;
  }, [stressEvents, today]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categories = stressEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      'Work': '#3B82F6',
      'Health': '#EF4444', 
      'Money': '#10B981',
      'Life': '#8B5CF6'
    };

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: colors[name as keyof typeof colors] || '#6B7280'
    }));
  }, [stressEvents]);

  // Mood patterns
  const moodData = useMemo(() => {
    const moods = stressEvents.reduce((acc, event) => {
      acc[event.mood] = (acc[event.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(moods)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([mood, count]) => ({ mood, count }));
  }, [stressEvents]);

  // Time of day analysis
  const timeData = useMemo(() => {
    const hours = stressEvents.reduce((acc, event) => {
      const hour = event.timestamp.getHours();
      const period = hour < 6 ? 'Night' : 
                   hour < 12 ? 'Morning' : 
                   hour < 18 ? 'Afternoon' : 'Evening';
      acc[period] = (acc[period] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { period: 'Morning', count: hours.Morning || 0 },
      { period: 'Afternoon', count: hours.Afternoon || 0 },
      { period: 'Evening', count: hours.Evening || 0 },
      { period: 'Night', count: hours.Night || 0 }
    ];
  }, [stressEvents]);

  const todayEvents = stressEvents.filter(event => 
    event.timestamp.toDateString() === today.toDateString()
  );

  const thisWeekEvents = stressEvents.filter(event => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return event.timestamp >= weekStart;
  });

  return (
    <div className="space-y-6 pb-20">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-5 h-5 text-primary" />
          <h2>Analytics & Insights</h2>
        </div>
        <p className="text-muted-foreground">
          Track your stress patterns and progress over time
        </p>
      </Card>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {/* Today's Summary */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3>Today's Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary">{todayEvents.length}</div>
                <p className="text-sm text-muted-foreground">Events</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">
                  {todayEvents.filter(e => e.completed).length}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {todayEvents.length > 0 
                    ? Math.round((todayEvents.filter(e => e.completed).length / todayEvents.length) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </Card>

          {/* 7-Day Trend */}
          <Card className="p-6">
            <h3 className="mb-4">7-Day Stress Events</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Bar dataKey="events" fill="#8884d8" />
                  <Bar dataKey="completed" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#8884d8] rounded"></div>
                <span>Total Events</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#82ca9d] rounded"></div>
                <span>Completed</span>
              </div>
            </div>
          </Card>

          {/* Most Common Times */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3>Stress Patterns by Time</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="period" type="category" />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {/* This Week Summary */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3>This Week</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary">{thisWeekEvents.length}</div>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">
                  {thisWeekEvents.length > 0 
                    ? Math.round((thisWeekEvents.filter(e => e.completed).length / thisWeekEvents.length) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </Card>

          {/* 4-Week Trend */}
          <Card className="p-6">
            <h3 className="mb-4">4-Week Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Line type="monotone" dataKey="events" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="completionRate" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#8884d8] rounded"></div>
                <span>Weekly Events</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#82ca9d] rounded"></div>
                <span>Completion Rate %</span>
              </div>
            </div>
          </Card>

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3>Stress Sources</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="outline" className="text-xs">{category.value}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card className="p-6">
        <h3 className="mb-4">💡 Insights</h3>
        <div className="space-y-3 text-sm">
          {moodData.length > 0 && (
            <div>
              <span className="font-medium">Most common feeling:</span>
              <span className="text-muted-foreground"> {moodData[0].mood} ({moodData[0].count} times)</span>
            </div>
          )}
          {categoryData.length > 0 && (
            <div>
              <span className="font-medium">Top stress source:</span>
              <span className="text-muted-foreground"> {categoryData[0].name} ({categoryData[0].value} events)</span>
            </div>
          )}
          <div>
            <span className="font-medium">Total sessions completed:</span>
            <span className="text-muted-foreground"> {stressEvents.filter(e => e.completed).length} out of {stressEvents.length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};