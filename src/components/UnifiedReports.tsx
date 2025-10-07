import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { StressEvent, SleepData } from '../App';
import { Calendar, TrendingUp, TrendingDown, Moon, Brain, Heart, Award, Target, Clock, Zap, BarChart3, Sparkles, ThumbsUp, Star, CheckCircle, Lightbulb, Activity, Coffee, Bed, AlertTriangle, TrendingDown as Recovery } from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer, Area, AreaChart, ComposedChart } from 'recharts';

interface UnifiedReportsProps {
  stressEvents: StressEvent[];
  sleepData: SleepData[];
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4'];

export const UnifiedReports: React.FC<UnifiedReportsProps> = ({ 
  stressEvents, 
  sleepData 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Helper functions
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getScoreColor = (score: number, type: 'sleep' | 'stress' | 'hrv') => {
    if (type === 'sleep') {
      if (score >= 3.5) return 'text-green-600';
      if (score >= 2.5) return 'text-blue-600';
      if (score >= 1.5) return 'text-yellow-600';
      return 'text-red-600';
    } else if (type === 'stress') {
      if (score <= 3) return 'text-green-600';
      if (score <= 5) return 'text-yellow-600';
      if (score <= 7) return 'text-orange-600';
      return 'text-red-600';
    } else if (type === 'hrv') {
      if (score >= 40) return 'text-green-600';
      if (score >= 30) return 'text-blue-600';
      if (score >= 20) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  // Data processing
  const getDailyData = () => {
    const today = new Date();
    const todayEvents = stressEvents.filter(event => 
      event.timestamp.toDateString() === today.toDateString()
    );
    const todaySleep = sleepData.find(sleep => 
      sleep.date.toDateString() === today.toDateString() ||
      sleep.date.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()
    );

    const avgIntensity = todayEvents.length > 0
      ? todayEvents.reduce((sum, event) => sum + event.intensity, 0) / todayEvents.length
      : 0;

    // Calculate average HRV improvement
    const completedEvents = todayEvents.filter(e => e.completed && e.hrvBefore && e.hrvAfter);
    const avgHrvImprovement = completedEvents.length > 0
      ? completedEvents.reduce((sum, e) => sum + (e.hrvAfter! - e.hrvBefore!), 0) / completedEvents.length
      : 0;

    return { todayEvents, todaySleep, avgIntensity, avgHrvImprovement, completedEvents };
  };

  const getWeeklyData = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEvents = stressEvents.filter(event => event.timestamp >= weekStart);
    const weekSleep = sleepData.filter(sleep => sleep.date >= weekStart).slice(0, 7);

    const avgSleepDuration = weekSleep.length > 0 
      ? weekSleep.reduce((sum, sleep) => sum + sleep.totalSleep, 0) / weekSleep.length
      : 0;
    
    const avgStressIntensity = weekEvents.length > 0
      ? weekEvents.reduce((sum, event) => sum + event.intensity, 0) / weekEvents.length
      : 0;

    return {
      weekEvents,
      weekSleep,
      avgSleepDuration: Math.round(avgSleepDuration),
      avgStressIntensity: Number(avgStressIntensity.toFixed(1))
    };
  };

  const getMonthlyData = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthEvents = stressEvents.filter(event => event.timestamp >= monthStart);
    const monthSleep = sleepData.filter(sleep => sleep.date >= monthStart);

    const avgSleepDuration = monthSleep.length > 0 
      ? monthSleep.reduce((sum, sleep) => sum + sleep.totalSleep, 0) / monthSleep.length
      : 0;

    const totalStressEvents = monthEvents.length;
    const avgStressIntensity = monthEvents.length > 0
      ? monthEvents.reduce((sum, event) => sum + event.intensity, 0) / monthEvents.length
      : 0;

    // Get stress categories
    const stressCategories = monthEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStressCategory = Object.entries(stressCategories)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      monthEvents,
      monthSleep,
      avgSleepDuration: Math.round(avgSleepDuration),
      totalStressEvents,
      avgStressIntensity: Number(avgStressIntensity.toFixed(1)),
      topStressCategory,
      stressCategories
    };
  };

  const dailyData = getDailyData();
  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();

  // Enhanced Analysis Functions
  const getStressFactorAnalysis = (events: StressEvent[]) => {
    const categories = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const triggers = events.reduce((acc, event) => {
      if (event.triggers) {
        event.triggers.forEach(trigger => {
          acc[trigger] = (acc[trigger] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return { categories, triggers };
  };

  const getTimeFrequencyAnalysis = (events: StressEvent[]) => {
    const timeSlots = {
      morning: { count: 0, events: [] as StressEvent[] },
      afternoon: { count: 0, events: [] as StressEvent[] },
      evening: { count: 0, events: [] as StressEvent[] }
    };

    events.forEach(event => {
      const hour = event.timestamp.getHours();
      if (hour >= 6 && hour < 12) {
        timeSlots.morning.count++;
        timeSlots.morning.events.push(event);
      } else if (hour >= 12 && hour < 18) {
        timeSlots.afternoon.count++;
        timeSlots.afternoon.events.push(event);
      } else {
        timeSlots.evening.count++;
        timeSlots.evening.events.push(event);
      }
    });

    return timeSlots;
  };

  const getHRVAnalysis = (events: StressEvent[]) => {
    const completedEvents = events.filter(e => e.completed && e.hrvBefore && e.hrvAfter);
    if (completedEvents.length === 0) return null;

    const improvements = completedEvents.map(e => ({
      before: e.hrvBefore!,
      after: e.hrvAfter!,
      improvement: e.hrvAfter! - e.hrvBefore!,
      category: e.category,
      triggers: e.triggers || []
    }));

    const avgImprovement = improvements.reduce((sum, i) => sum + i.improvement, 0) / improvements.length;
    const successRate = improvements.filter(i => i.improvement > 0).length / improvements.length * 100;

    return {
      avgImprovement: Math.round(avgImprovement),
      successRate: Math.round(successRate),
      improvements,
      totalSessions: completedEvents.length
    };
  };

  const getSleepStressCorrelation = (sleepData: SleepData[], stressEvents: StressEvent[]) => {
    const correlations = sleepData.map(sleep => {
      const nextDay = new Date(sleep.date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const nextDayEvents = stressEvents.filter(event => 
        event.timestamp.toDateString() === nextDay.toDateString()
      );
      
      const avgStress = nextDayEvents.length > 0 
        ? nextDayEvents.reduce((sum, e) => sum + e.intensity, 0) / nextDayEvents.length 
        : 0;

      return {
        date: sleep.date,
        sleepDuration: sleep.totalSleep,
        sleepQuality: sleep.sleepQuality,
        deepSleep: sleep.deepSleep,
        remSleep: sleep.remSleep,
        nextDayStress: avgStress,
        stressEvents: nextDayEvents.length
      };
    });

    return correlations;
  };

  const generateSmartInsights = (period: 'daily' | 'weekly' | 'monthly') => {
    const insights: Array<{
      type: 'peak_time' | 'trigger_pattern' | 'hrv_success' | 'sleep_impact' | 'caffeine_effect' | 'breathing_effectiveness';
      message: string;
      severity: 'info' | 'warning' | 'success';
      icon: string;
    }> = [];

    if (period === 'daily') {
      const timeAnalysis = getTimeFrequencyAnalysis(dailyData.todayEvents);
      const hrvAnalysis = getHRVAnalysis(dailyData.todayEvents);
      const stressFactors = getStressFactorAnalysis(dailyData.todayEvents);

      // Peak time analysis
      const peakTimeSlot = Object.entries(timeAnalysis)
        .reduce((peak, [slot, data]) => data.count > peak.count ? { slot, count: data.count } : peak, { slot: '', count: 0 });
      
      if (peakTimeSlot.count > 0) {
        insights.push({
          type: 'peak_time',
          message: `Your stress peaks during ${peakTimeSlot.slot} (${peakTimeSlot.count} event${peakTimeSlot.count > 1 ? 's' : ''} today)`,
          severity: 'warning',
          icon: '⏰'
        });
      }

      // Caffeine effect analysis
      const caffeineEvents = dailyData.todayEvents.filter(e => e.triggers?.includes('caffeine'));
      if (caffeineEvents.length > 0) {
        const avgCaffeineStress = caffeineEvents.reduce((sum, e) => sum + e.intensity, 0) / caffeineEvents.length;
        insights.push({
          type: 'caffeine_effect',
          message: `Caffeine intake linked to ${caffeineEvents.length} stress event${caffeineEvents.length > 1 ? 's' : ''} (avg ${avgCaffeineStress.toFixed(1)}/10)`,
          severity: 'warning',
          icon: '☕'
        });
      }

      // HRV success rate
      if (hrvAnalysis && hrvAnalysis.totalSessions > 0) {
        insights.push({
          type: 'hrv_success',
          message: `4-7-8 breathing improved HRV in ${hrvAnalysis.successRate}% of sessions (+${hrvAnalysis.avgImprovement} avg)`,
          severity: 'success',
          icon: '💚'
        });
      }
    }

    if (period === 'weekly') {
      const hrvAnalysis = getHRVAnalysis(weeklyData.weekEvents);
      const correlations = getSleepStressCorrelation(weeklyData.weekSleep, weeklyData.weekEvents);
      
      // Sleep-stress correlation
      const poorSleepDays = correlations.filter(c => c.sleepDuration < 360); // Less than 6 hours
      const avgStressAfterPoorSleep = poorSleepDays.length > 0 
        ? poorSleepDays.reduce((sum, c) => sum + c.nextDayStress, 0) / poorSleepDays.length 
        : 0;
      
      if (poorSleepDays.length > 0) {
        insights.push({
          type: 'sleep_impact',
          message: `Poor sleep (<6h) led to ${avgStressAfterPoorSleep.toFixed(1)}/10 avg stress next day`,
          severity: 'warning',
          icon: '😴'
        });
      }

      // Weekly pattern analysis
      const weeklyTimeAnalysis = getTimeFrequencyAnalysis(weeklyData.weekEvents);
      const busyDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        .map(day => {
          const dayEvents = weeklyData.weekEvents.filter(e => 
            e.timestamp.toLocaleDateString('en', { weekday: 'long' }) === day
          );
          return { day, count: dayEvents.length };
        })
        .reduce((peak, current) => current.count > peak.count ? current : peak);

      if (busyDay.count > 0) {
        insights.push({
          type: 'peak_time',
          message: `You experience stress most frequently on ${busyDay.day}s (${busyDay.count} events this week)`,
          severity: 'info',
          icon: '📅'
        });
      }
    }

    if (period === 'monthly') {
      const hrvAnalysis = getHRVAnalysis(monthlyData.monthEvents);
      const stressFactors = getStressFactorAnalysis(monthlyData.monthEvents);
      
      // Long-term breathing effectiveness
      if (hrvAnalysis && hrvAnalysis.totalSessions >= 5) {
        insights.push({
          type: 'breathing_effectiveness',
          message: `Consistent breathing practice: ${hrvAnalysis.totalSessions} sessions with ${hrvAnalysis.avgImprovement}+ avg HRV improvement`,
          severity: 'success',
          icon: '🌟'
        });
      }

      // Trigger pattern analysis
      const topTrigger = Object.entries(stressFactors.triggers)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (topTrigger && topTrigger[1] > 2) {
        insights.push({
          type: 'trigger_pattern',
          message: `${topTrigger[0].replace('_', ' ')} is your most frequent trigger (${topTrigger[1]} times this month)`,
          severity: 'warning',
          icon: '⚠️'
        });
      }
    }

    return insights;
  };

  const renderDailyReport = () => {
    const timeAnalysis = getTimeFrequencyAnalysis(dailyData.todayEvents);
    const hrvAnalysis = getHRVAnalysis(dailyData.todayEvents);
    const stressFactors = getStressFactorAnalysis(dailyData.todayEvents);
    const insights = generateSmartInsights('daily');
    
    // Time-based data for chart
    const timeData = [
      { 
        time: 'Morning (6-12)', 
        events: timeAnalysis.morning.count,
        avgIntensity: timeAnalysis.morning.events.length > 0 
          ? timeAnalysis.morning.events.reduce((sum, e) => sum + e.intensity, 0) / timeAnalysis.morning.events.length 
          : 0
      },
      { 
        time: 'Afternoon (12-18)', 
        events: timeAnalysis.afternoon.count,
        avgIntensity: timeAnalysis.afternoon.events.length > 0 
          ? timeAnalysis.afternoon.events.reduce((sum, e) => sum + e.intensity, 0) / timeAnalysis.afternoon.events.length 
          : 0
      },
      { 
        time: 'Evening (18-6)', 
        events: timeAnalysis.evening.count,
        avgIntensity: timeAnalysis.evening.events.length > 0 
          ? timeAnalysis.evening.events.reduce((sum, e) => sum + e.intensity, 0) / timeAnalysis.evening.events.length 
          : 0
      }
    ];

    return (
      <div className="space-y-6">
        {/* AI Daily Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-none">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Daily AI Analysis</h3>
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">{dailyData.todayEvents.length}</div>
                    <p className="text-xs text-gray-600">Total Events</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className={`text-2xl font-bold mb-1 ${getScoreColor(dailyData.avgIntensity, 'stress')}`}>
                      {dailyData.avgIntensity.toFixed(1)}/10
                    </div>
                    <p className="text-xs text-gray-600">Avg Intensity</p>
                  </div>
                </div>

                {/* HRV Recovery Section */}
                {hrvAnalysis && (
                  <div className="bg-white/60 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">HRV Recovery</span>
                      <Heart className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Success Rate: <span className="font-medium text-green-600">{hrvAnalysis.successRate}%</span></span>
                      <span className="text-gray-600">Avg Improvement: <span className="font-medium text-blue-600">+{hrvAnalysis.avgImprovement}</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stress Factors Classification */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3>Stress Factor Analysis</h3>
          </div>
          
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-medium mb-2">Primary Categories:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stressFactors.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">{category}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Triggers */}
            {Object.keys(stressFactors.triggers).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Contributing Factors:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stressFactors.triggers).map(([trigger, count]) => (
                    <Badge key={trigger} variant="secondary" className="flex items-center gap-1">
                      {trigger === 'caffeine' && <Coffee className="w-3 h-3" />}
                      {trigger === 'poor_sleep' && <Bed className="w-3 h-3" />}
                      {trigger.includes('sleep') && <Moon className="w-3 h-3" />}
                      <span>{trigger.replace('_', ' ')}</span>
                      <span className="text-xs">({count})</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Time Distribution Analysis */}
        {dailyData.todayEvents.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3>Time Distribution & Intensity</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'events' ? `${value} event${value !== 1 ? 's' : ''}` : `${Number(value).toFixed(1)}/10`,
                      name === 'events' ? 'Events' : 'Avg Intensity'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar yAxisId="left" dataKey="events" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="avgIntensity" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* HRV Before/After Analysis */}
        {hrvAnalysis && hrvAnalysis.improvements.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Recovery className="w-5 h-5 text-primary" />
              <h3>HRV Recovery Analysis</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{hrvAnalysis.successRate}%</div>
                <p className="text-xs text-green-700">Success Rate</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">+{hrvAnalysis.avgImprovement}</div>
                <p className="text-xs text-blue-700">Avg Improvement</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">{hrvAnalysis.totalSessions}</div>
                <p className="text-xs text-purple-700">Sessions Today</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Individual Session Results:</h4>
              {hrvAnalysis.improvements.slice(0, 3).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <span className="text-sm">{session.category}</span>
                  <span className={`text-sm font-medium ${session.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {session.before} → {session.after} ({session.improvement > 0 ? '+' : ''}{session.improvement})
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Smart Insights */}
        {insights.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3>AI Insights</h3>
            </div>
            
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    insight.severity === 'success' ? 'bg-green-50 border-green-200' :
                    insight.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{insight.icon}</span>
                    <p className={`text-sm ${
                      insight.severity === 'success' ? 'text-green-700' :
                      insight.severity === 'warning' ? 'text-orange-700' :
                      'text-blue-700'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Sleep Quality Impact */}
        {dailyData.todaySleep && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-primary" />
              <h3>Sleep Quality Analysis</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600 mb-1">
                  {formatTime(dailyData.todaySleep.deepSleep)}
                </div>
                <p className="text-xs text-blue-700">Deep Sleep</p>
                <p className="text-xs text-muted-foreground">{Math.round((dailyData.todaySleep.deepSleep / dailyData.todaySleep.totalSleep) * 100)}% of total</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600 mb-1">
                  {formatTime(dailyData.todaySleep.remSleep)}
                </div>
                <p className="text-xs text-purple-700">REM Sleep</p>
                <p className="text-xs text-muted-foreground">{Math.round((dailyData.todaySleep.remSleep / dailyData.todaySleep.totalSleep) * 100)}% of total</p>
              </div>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Sleep Quality Impact:</span> {
                  dailyData.todaySleep.sleepQuality === 'excellent' ? 'Excellent sleep likely contributing to better stress resilience today.' :
                  dailyData.todaySleep.sleepQuality === 'good' ? 'Good sleep supporting your stress management today.' :
                  dailyData.todaySleep.sleepQuality === 'fair' ? 'Fair sleep may be impacting your stress levels today.' :
                  'Poor sleep likely contributing to higher stress sensitivity today.'
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderWeeklyReport = () => {
    const insights = generateSmartInsights('weekly');
    const correlations = getSleepStressCorrelation(weeklyData.weekSleep, weeklyData.weekEvents);
    const hrvAnalysis = getHRVAnalysis(weeklyData.weekEvents);

    // Weekly trend data
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayEvents = weeklyData.weekEvents.filter(event => 
        event.timestamp.toDateString() === date.toDateString()
      );
      const avgIntensity = dayEvents.length > 0 
        ? dayEvents.reduce((sum, e) => sum + e.intensity, 0) / dayEvents.length 
        : 0;
      return {
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        events: dayEvents.length,
        intensity: Number(avgIntensity.toFixed(1)),
        completed: dayEvents.filter(e => e.completed).length
      };
    });

    // Sleep vs Stress correlation data
    const sleepStressData = correlations.map(c => ({
      date: c.date.toLocaleDateString('en', { weekday: 'short' }),
      sleepHours: Number((c.sleepDuration / 60).toFixed(1)),
      nextDayStress: c.nextDayStress,
      deepSleep: c.deepSleep,
      remSleep: c.remSleep
    }));

    // Stress category distribution
    const categoryData = weeklyData.weekEvents.reduce((acc, event) => {
      const existing = acc.find(item => item.name === event.category);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: event.category, value: 1 });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    return (
      <div className="space-y-6">
        {/* Weekly AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-none">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Weekly AI Analysis</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-emerald-600 mb-1">{weeklyData.weekEvents.length}</div>
                    <p className="text-xs text-gray-600">Total Events</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className={`text-xl font-bold mb-1 ${getScoreColor(weeklyData.avgStressIntensity, 'stress')}`}>
                      {weeklyData.avgStressIntensity}/10
                    </div>
                    <p className="text-xs text-gray-600">Avg Stress</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-600 mb-1">
                      {formatTime(weeklyData.avgSleepDuration)}
                    </div>
                    <p className="text-xs text-gray-600">Avg Sleep</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Weekly Stress Trend */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3>Daily Stress Levels (Line Chart)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'intensity' ? `${value}/10` : value,
                    name === 'intensity' ? 'Avg Stress' : 'Events'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stress Categories Pie Chart */}
        {categoryData.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3>Weekly Stress Factor Distribution</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} events`, name]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Sleep vs Stress Correlation */}
        {sleepStressData.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-primary" />
              <h3>Sleep vs Next-Day Stress (Dual Axis)</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sleepStressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[4, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'sleepHours' ? `${value}h` : `${value}/10`,
                      name === 'sleepHours' ? 'Sleep Duration' : 'Next Day Stress'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar yAxisId="right" dataKey="sleepHours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="nextDayStress" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* HRV Effectiveness This Week */}
        {hrvAnalysis && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h3>Breathing Exercise Effectiveness</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{hrvAnalysis.successRate}%</div>
                <p className="text-sm text-green-700">Sessions with HRV improvement</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">+{hrvAnalysis.avgImprovement}</div>
                <p className="text-sm text-blue-700">Average HRV increase</p>
              </div>
            </div>
          </Card>
        )}

        {/* Weekly Smart Insights */}
        {insights.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3>Weekly AI Insights</h3>
            </div>
            
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    insight.severity === 'success' ? 'bg-green-50 border-green-200' :
                    insight.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{insight.icon}</span>
                    <p className={`text-sm leading-relaxed ${
                      insight.severity === 'success' ? 'text-green-700' :
                      insight.severity === 'warning' ? 'text-orange-700' :
                      'text-blue-700'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderMonthlyReport = () => {
    const insights = generateSmartInsights('monthly');
    const hrvAnalysis = getHRVAnalysis(monthlyData.monthEvents);
    
    // Category distribution for better insights
    const categoryData = Object.entries(monthlyData.stressCategories || {})
      .map(([category, count]) => ({ name: category, value: count }))
      .sort((a, b) => b.value - a.value);

    // Monthly wellness score calculation
    const wellnessScore = Math.round(Math.max(0, Math.min(100, 
      (10 - monthlyData.avgStressIntensity) * 8 + 
      (monthlyData.avgSleepDuration / 480) * 20 + 
      (hrvAnalysis?.successRate || 0) * 0.3
    )));

    return (
      <div className="space-y-6">
        {/* Monthly AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-none">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Monthly Wellness Summary</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-purple-600 mb-1">{monthlyData.totalStressEvents}</div>
                    <p className="text-xs text-gray-600">Total Events</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-indigo-600 mb-1">{wellnessScore}</div>
                    <p className="text-xs text-gray-600">Wellness Score</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-pink-600 mb-1">
                      {hrvAnalysis ? `+${hrvAnalysis.avgImprovement}` : 'N/A'}
                    </div>
                    <p className="text-xs text-gray-600">Avg HRV Boost</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Monthly Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${getScoreColor(monthlyData.avgStressIntensity, 'stress')}`}>
              {monthlyData.avgStressIntensity}/10
            </div>
            <p className="text-sm text-muted-foreground">Average Stress Intensity</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatTime(monthlyData.avgSleepDuration)}
            </div>
            <p className="text-sm text-muted-foreground">Average Sleep Duration</p>
          </Card>
        </div>

        {/* Stress Categories Analysis */}
        {categoryData.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3>Monthly Stress Source Analysis</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip 
                    formatter={(value) => [`${value} events`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Long-term HRV Effectiveness */}
        {hrvAnalysis && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h3>Monthly Breathing Practice Results</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">{hrvAnalysis.totalSessions}</div>
                <p className="text-sm text-green-700">Total Sessions</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">{hrvAnalysis.successRate}%</div>
                <p className="text-sm text-blue-700">Success Rate</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">+{hrvAnalysis.avgImprovement}</div>
                <p className="text-sm text-purple-700">Avg HRV Improvement</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Consistency Insight:</span> {
                  hrvAnalysis.totalSessions >= 20 ? 'Excellent consistency! Your regular practice is building strong stress resilience.' :
                  hrvAnalysis.totalSessions >= 10 ? 'Good practice frequency. Consider increasing sessions for even better results.' :
                  'Room for improvement. More frequent breathing exercises could enhance your stress management.'
                }
              </p>
            </div>
          </Card>
        )}

        {/* Monthly AI Insights */}
        {insights.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3>Monthly AI Insights</h3>
            </div>
            
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    insight.severity === 'success' ? 'bg-green-50 border-green-200' :
                    insight.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <p className={`text-sm leading-relaxed ${
                      insight.severity === 'success' ? 'text-green-700' :
                      insight.severity === 'warning' ? 'text-orange-700' :
                      'text-blue-700'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Overall Wellness Score */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h3>Overall Wellness Score</h3>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-4">
              {wellnessScore}
            </div>
            <p className="text-muted-foreground mb-4">Overall Wellness Score</p>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Based on stress levels ({Math.round((10 - monthlyData.avgStressIntensity) * 8)}%), 
              sleep quality ({Math.round((monthlyData.avgSleepDuration / 480) * 20)}%), 
              and breathing effectiveness ({Math.round((hrvAnalysis?.successRate || 0) * 0.3)}%)
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2>AI Wellness Reports</h2>
        </div>
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-6">
            {renderDailyReport()}
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-6">
            {renderWeeklyReport()}
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-6">
            {renderMonthlyReport()}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};