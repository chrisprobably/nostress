import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { SleepData, StressEvent } from '../App';
import { Moon, Sun, Clock, Heart, Activity, TrendingUp, Calendar, Bed, Brain, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';


interface SleepTrackerProps {
  sleepData: SleepData[];
  stressEvents?: StressEvent[];
  onMeditationPlan?: () => void;
}

export const SleepTracker: React.FC<SleepTrackerProps> = ({ sleepData, stressEvents = [], onMeditationPlan }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week'>('day');
  
  // Get latest sleep data
  const latestSleep = sleepData[0];
  const weekData = sleepData.slice(0, 7);

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
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSleepQualityBadgeColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-700';
      case 'good': return 'bg-blue-100 text-blue-700';
      case 'fair': return 'bg-yellow-100 text-yellow-700';
      case 'poor': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getWeeklyAverages = () => {
    if (weekData.length === 0) return null;
    
    const avgTotalSleep = weekData.reduce((sum, day) => sum + day.totalSleep, 0) / weekData.length;
    const avgRemSleep = weekData.reduce((sum, day) => sum + day.remSleep, 0) / weekData.length;
    const avgDeepSleep = weekData.reduce((sum, day) => sum + day.deepSleep, 0) / weekData.length;
    const avgEfficiency = weekData.reduce((sum, day) => sum + day.sleepEfficiency, 0) / weekData.length;
    
    return {
      totalSleep: Math.round(avgTotalSleep),
      remSleep: Math.round(avgRemSleep),
      deepSleep: Math.round(avgDeepSleep),
      efficiency: Math.round(avgEfficiency)
    };
  };

  // Calculate daily stress-sleep breakdown
  const getDailyStressSleepBreakdown = () => {
    if (!stressEvents || weekData.length === 0) return null;

    return weekData.map(sleep => {
      // Find stress events for this sleep date
      const sleepDate = new Date(sleep.date);
      const dayStart = new Date(sleepDate.getFullYear(), sleepDate.getMonth(), sleepDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayStressEvents = stressEvents.filter(event => 
        event.timestamp >= dayStart && event.timestamp < dayEnd
      );

      // Categorize by time of day
      const morning = dayStressEvents.filter(e => {
        const hour = e.timestamp.getHours();
        return hour >= 6 && hour < 12;
      }).length;

      const afternoon = dayStressEvents.filter(e => {
        const hour = e.timestamp.getHours();
        return hour >= 12 && hour < 18;
      }).length;

      const evening = dayStressEvents.filter(e => {
        const hour = e.timestamp.getHours();
        return hour >= 18 || hour < 6;
      }).length;

      // Calculate sleep score (0-100)
      const sleepScore = Math.round(
        (sleep.sleepEfficiency * 0.4) + // 40% weight on efficiency
        ((sleep.totalSleep / 480) * 100 * 0.3) + // 30% weight on duration (8h = 480min)
        ((sleep.deepSleep / sleep.totalSleep) * 100 * 0.15) + // 15% weight on deep sleep
        ((sleep.remSleep / sleep.totalSleep) * 100 * 0.15) // 15% weight on REM sleep
      );

      return {
        date: sleep.date,
        dateStr: sleep.date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        weekday: sleep.date.toLocaleDateString([], { weekday: 'short' }),
        totalStress: dayStressEvents.length,
        morningStress: morning,
        afternoonStress: afternoon,
        eveningStress: evening,
        sleepScore: Math.min(100, sleepScore),
        sleepQuality: sleep.sleepQuality,
        sleepEfficiency: sleep.sleepEfficiency,
        totalSleep: sleep.totalSleep,
        remSleep: sleep.remSleep,
        deepSleep: sleep.deepSleep,
        lightSleep: sleep.lightSleep,
        awakeTime: sleep.awakeTime
      };
    }).reverse(); // Reverse to show chronological order
  };

  const dailyBreakdown = getDailyStressSleepBreakdown();

  const weeklyAvg = getWeeklyAverages();

  if (!latestSleep) {
    return (
      <div className="space-y-6 pb-20">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Moon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="mb-2">Sleep Tracking</h2>
          <p className="text-muted-foreground mb-4">
            No sleep data recorded yet. Make sure your Apple Watch is worn during sleep.
          </p>
          <Button variant="outline">
            Set Sleep Schedule
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Bedtime Meditation CTA */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="mb-1">Sleep & Recovery</h2>
            <p className="text-muted-foreground text-sm">Track your sleep and prepare for better rest</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Moon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {onMeditationPlan && (
          <Button
            onClick={onMeditationPlan}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg"
          >
            <Bed className="w-5 h-5 mr-2" />
            Tonight's Meditation Plan
          </Button>
        )}
      </Card>

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('day')}
            className="flex-1"
          >
            Today
          </Button>
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('week')}
            className="flex-1"
          >
            Weekly
          </Button>
        </div>
      </Card>

      {selectedPeriod === 'day' ? (
        <>
          {/* Latest Sleep Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-primary" />
                <h2>Last Night's Sleep</h2>
              </div>
              <Badge className={getSleepQualityBadgeColor(latestSleep.sleepQuality)}>
                {latestSleep.sleepQuality}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary mb-1">
                  {formatTime(latestSleep.totalSleep)}
                </div>
                <p className="text-sm text-muted-foreground">Total Sleep</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600 mb-1">
                  {latestSleep.sleepEfficiency}%
                </div>
                <p className="text-sm text-muted-foreground">Sleep Efficiency</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Bedtime
                </span>
                <span>{formatTimeOnly(latestSleep.bedtime)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Wake Time
                </span>
                <span>{formatTimeOnly(latestSleep.wakeTime)}</span>
              </div>
            </div>
          </Card>

          {/* Sleep Stages */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Sleep Stages
            </h3>
            
            {/* Visual Sleep Stages Bar */}
            <div className="mb-4">
              <div className="flex h-8 rounded-lg overflow-hidden bg-muted">
                <div 
                  className="bg-purple-500 flex items-center justify-center text-white text-xs"
                  style={{ width: `${(latestSleep.remSleep / latestSleep.totalSleep) * 100}%` }}
                >
                  {latestSleep.remSleep > 30 && 'REM'}
                </div>
                <div 
                  className="bg-indigo-600 flex items-center justify-center text-white text-xs"
                  style={{ width: `${(latestSleep.deepSleep / latestSleep.totalSleep) * 100}%` }}
                >
                  {latestSleep.deepSleep > 30 && 'Deep'}
                </div>
                <div 
                  className="bg-blue-400 flex items-center justify-center text-white text-xs"
                  style={{ width: `${(latestSleep.lightSleep / latestSleep.totalSleep) * 100}%` }}
                >
                  Light
                </div>
                <div 
                  className="bg-orange-400 flex items-center justify-center text-white text-xs"
                  style={{ width: `${(latestSleep.awakeTime / latestSleep.totalSleep) * 100}%` }}
                >
                  {latestSleep.awakeTime > 15 && 'Awake'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">REM Sleep</span>
                  </div>
                  <span className="text-sm font-medium">{formatTime(latestSleep.remSleep)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <span className="text-sm">Deep Sleep</span>
                  </div>
                  <span className="text-sm font-medium">{formatTime(latestSleep.deepSleep)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm">Light Sleep</span>
                  </div>
                  <span className="text-sm font-medium">{formatTime(latestSleep.lightSleep)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-sm">Awake</span>
                  </div>
                  <span className="text-sm font-medium">{formatTime(latestSleep.awakeTime)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Health Metrics */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Health Metrics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Heart Rate</p>
                <div className="text-sm">
                  <span className="font-medium">{latestSleep.heartRate?.avg} bpm</span>
                  <span className="text-muted-foreground ml-2">
                    ({latestSleep.heartRate?.min}-{latestSleep.heartRate?.max})
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Movements</p>
                <div className="text-sm font-medium">{latestSleep.movements}</div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Weekly Summary */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2>Weekly Summary</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary mb-1">
                  {weeklyAvg ? formatTime(weeklyAvg.totalSleep) : '--'}
                </div>
                <p className="text-sm text-muted-foreground">Avg Sleep</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600 mb-1">
                  {weeklyAvg ? `${weeklyAvg.efficiency}%` : '--'}
                </div>
                <p className="text-sm text-muted-foreground">Avg Efficiency</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-medium text-purple-600 mb-1">
                  {weeklyAvg ? formatTime(weeklyAvg.remSleep) : '--'}
                </div>
                <p className="text-sm text-muted-foreground">Avg REM</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-indigo-600 mb-1">
                  {weeklyAvg ? formatTime(weeklyAvg.deepSleep) : '--'}
                </div>
                <p className="text-sm text-muted-foreground">Avg Deep</p>
              </div>
            </div>
          </Card>

          {/* Weekly Sleep Chart */}
          <Card className="p-6">
            <h3 className="mb-4">Sleep History</h3>
            
            <div className="space-y-3">
              {weekData.map((sleep, index) => (
                <motion.div
                  key={sleep.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground">
                      {sleep.date.toLocaleDateString([], { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-medium">
                      {sleep.date.toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{formatTime(sleep.totalSleep)}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSleepQualityBadgeColor(sleep.sleepQuality)}`}
                      >
                        {sleep.sleepQuality}
                      </Badge>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div 
                        className="bg-purple-500"
                        style={{ width: `${(sleep.remSleep / sleep.totalSleep) * 100}%` }}
                      />
                      <div 
                        className="bg-indigo-600"
                        style={{ width: `${(sleep.deepSleep / sleep.totalSleep) * 100}%` }}
                      />
                      <div 
                        className="bg-blue-400"
                        style={{ width: `${(sleep.lightSleep / sleep.totalSleep) * 100}%` }}
                      />
                      <div 
                        className="bg-orange-400"
                        style={{ width: `${(sleep.awakeTime / sleep.totalSleep) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {sleep.sleepEfficiency}%
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Daily Stress & Sleep Breakdown */}
          {dailyBreakdown && dailyBreakdown.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3>Daily Stress & Sleep</h3>
              </div>
              
              <div className="space-y-3">
                {dailyBreakdown.map((day, index) => (
                  <motion.div
                    key={day.dateStr}
                    className="p-4 bg-muted/30 rounded-lg space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* Date Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">{day.weekday}</div>
                          <div className="text-sm font-medium">{day.dateStr}</div>
                        </div>
                        <div className="h-6 w-px bg-border"></div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={
                              day.totalStress === 0 ? "bg-green-100 text-green-700" :
                              day.totalStress <= 2 ? "bg-blue-100 text-blue-700" : 
                              day.totalStress <= 4 ? "bg-yellow-100 text-yellow-700" : 
                              "bg-red-100 text-red-700"
                            }
                          >
                            {day.totalStress} {day.totalStress === 1 ? 'stress' : 'stresses'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Sleep Score</span>
                          <div className={`text-lg font-semibold ${
                            day.sleepScore >= 85 ? 'text-green-600' :
                            day.sleepScore >= 70 ? 'text-blue-600' :
                            day.sleepScore >= 55 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {day.sleepScore}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stress Time Distribution */}
                    {day.totalStress > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Stress Distribution</div>
                        <div className="flex gap-2">
                          {day.morningStress > 0 && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs">
                              🌅 {day.morningStress} morning
                            </Badge>
                          )}
                          {day.afternoonStress > 0 && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                              ☀️ {day.afternoonStress} afternoon
                            </Badge>
                          )}
                          {day.eveningStress > 0 && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                              🌙 {day.eveningStress} evening
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sleep Stages Visualization */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Sleep Stages</span>
                        <span>{formatTime(day.totalSleep)} • {day.sleepEfficiency}% efficient</span>
                      </div>
                      <div className="flex h-6 rounded-lg overflow-hidden bg-muted">
                        <div 
                          className="bg-purple-500 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(day.remSleep / day.totalSleep) * 100}%` }}
                          title={`REM: ${formatTime(day.remSleep)}`}
                        >
                          {day.remSleep > 30 && 'REM'}
                        </div>
                        <div 
                          className="bg-indigo-600 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(day.deepSleep / day.totalSleep) * 100}%` }}
                          title={`Deep: ${formatTime(day.deepSleep)}`}
                        >
                          {day.deepSleep > 30 && 'Deep'}
                        </div>
                        <div 
                          className="bg-blue-400 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(day.lightSleep / day.totalSleep) * 100}%` }}
                          title={`Light: ${formatTime(day.lightSleep)}`}
                        >
                          Light
                        </div>
                        <div 
                          className="bg-orange-400 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(day.awakeTime / day.totalSleep) * 100}%` }}
                          title={`Awake: ${formatTime(day.awakeTime)}`}
                        >
                          {day.awakeTime > 15 && 'Awake'}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-muted-foreground">{formatTime(day.remSleep)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                          <span className="text-muted-foreground">{formatTime(day.deepSleep)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-muted-foreground">{formatTime(day.lightSleep)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-muted-foreground">{formatTime(day.awakeTime)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Sleep Insights */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3>Weekly Insights</h3>
            </div>
            
            <div className="space-y-3">
              {/* Best Sleep Quality */}
              {(() => {
                const bestSleep = weekData.find(s => s.sleepQuality === 'excellent') || 
                               weekData.find(s => s.sleepQuality === 'good');
                if (bestSleep) {
                  return (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Best night:</span>
                      <Badge className="bg-green-100 text-green-700">
                        {bestSleep.date.toLocaleDateString([], { weekday: 'short' })} - {bestSleep.sleepQuality}
                      </Badge>
                    </div>
                  );
                }
              })()}

              {/* Sleep Goal Progress */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm">Sleep goal (7-9h):</span>
                <Badge className="bg-blue-100 text-blue-700">
                  {weekData.filter(s => s.totalSleep >= 420 && s.totalSleep <= 540).length}/7 days
                </Badge>
              </div>

              {/* Average Bedtime */}
              {(() => {
                const avgBedtime = weekData.reduce((sum, s) => sum + s.bedtime.getHours() * 60 + s.bedtime.getMinutes(), 0) / weekData.length;
                const bedtimeHour = Math.floor(avgBedtime / 60);
                const bedtimeMin = Math.round(avgBedtime % 60);
                return (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm">Average bedtime:</span>
                    <Badge className="bg-purple-100 text-purple-700">
                      {bedtimeHour > 12 ? bedtimeHour - 12 : bedtimeHour}:{bedtimeMin.toString().padStart(2, '0')} {bedtimeHour >= 12 ? 'PM' : 'AM'}
                    </Badge>
                  </div>
                );
              })()}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};