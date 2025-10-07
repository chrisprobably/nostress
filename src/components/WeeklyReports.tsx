import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { StressEvent, SleepData } from '../App';
import { Calendar, TrendingUp, TrendingDown, Moon, Brain, Heart, Activity, Award, Target, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface WeeklyReportsProps {
  stressEvents: StressEvent[];
  sleepData: SleepData[];
}

export const WeeklyReports: React.FC<WeeklyReportsProps> = ({ 
  stressEvents, 
  sleepData 
}) => {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = last week, etc.

  // Calculate date ranges
  const getWeekRange = (weeksAgo: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - (weeksAgo * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { start: startOfWeek, end: endOfWeek };
  };

  const { start: weekStart, end: weekEnd } = getWeekRange(selectedWeek);

  // Filter data for selected week
  const weekStressEvents = stressEvents.filter(event => 
    event.timestamp >= weekStart && event.timestamp <= weekEnd
  );

  const weekSleepData = sleepData.filter(sleep => 
    sleep.date >= weekStart && sleep.date <= weekEnd
  );

  // Calculate weekly metrics
  const calculateWeeklyMetrics = () => {
    // Sleep metrics
    const avgSleepDuration = weekSleepData.length > 0 
      ? weekSleepData.reduce((sum, sleep) => sum + sleep.totalSleep, 0) / weekSleepData.length
      : 0;
    
    const avgSleepEfficiency = weekSleepData.length > 0
      ? weekSleepData.reduce((sum, sleep) => sum + sleep.sleepEfficiency, 0) / weekSleepData.length
      : 0;

    const sleepQualityScore = weekSleepData.length > 0
      ? weekSleepData.reduce((sum, sleep) => {
          const scores = { excellent: 4, good: 3, fair: 2, poor: 1 };
          return sum + (scores[sleep.sleepQuality] || 0);
        }, 0) / weekSleepData.length
      : 0;

    // Stress metrics
    const totalStressEvents = weekStressEvents.length;
    const avgStressIntensity = weekStressEvents.length > 0
      ? weekStressEvents.reduce((sum, event) => sum + event.intensity, 0) / weekStressEvents.length
      : 0;

    const completionRate = totalStressEvents > 0
      ? (weekStressEvents.filter(event => event.completed).length / totalStressEvents) * 100
      : 0;

    // Stress categories
    const stressCategories = weekStressEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStressCategory = Object.entries(stressCategories)
      .sort(([,a], [,b]) => b - a)[0];

    // Mood patterns
    const moodCategories = weekStressEvents.reduce((acc, event) => {
      acc[event.moodCategory] = (acc[event.moodCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topMoodCategory = Object.entries(moodCategories)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      sleep: {
        avgDuration: Math.round(avgSleepDuration),
        avgEfficiency: Math.round(avgSleepEfficiency),
        qualityScore: sleepQualityScore,
        nightsTracked: weekSleepData.length
      },
      stress: {
        totalEvents: totalStressEvents,
        avgIntensity: Number(avgStressIntensity.toFixed(1)),
        completionRate: Math.round(completionRate),
        topCategory: topStressCategory,
        topMoodCategory: topMoodCategory
      }
    };
  };

  const metrics = calculateWeeklyMetrics();

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getScoreColor = (score: number, type: 'sleep' | 'stress' | 'completion') => {
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
    } else if (type === 'completion') {
      if (score >= 90) return 'text-green-600';
      if (score >= 70) return 'text-blue-600';
      if (score >= 50) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getOverallWellnessScore = () => {
    let score = 0;
    let components = 0;

    // Sleep component (40% weight)
    if (metrics.sleep.nightsTracked > 0) {
      const sleepScore = (metrics.sleep.qualityScore / 4) * 40;
      score += sleepScore;
      components++;
    }

    // Stress management component (40% weight)
    if (metrics.stress.totalEvents > 0) {
      const stressScore = ((10 - metrics.stress.avgIntensity) / 10) * 40;
      score += stressScore;
      components++;
    }

    // Completion rate component (20% weight)
    if (metrics.stress.totalEvents > 0) {
      const completionScore = (metrics.stress.completionRate / 100) * 20;
      score += completionScore;
      components++;
    }

    return components > 0 ? Math.round(score * (3 / components)) : 0;
  };

  const wellnessScore = getOverallWellnessScore();

  const getWeekLabel = (weeksAgo: number) => {
    if (weeksAgo === 0) return 'This Week';
    if (weeksAgo === 1) return 'Last Week';
    return `${weeksAgo} weeks ago`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Week Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2>Weekly Report</h2>
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {[0, 1, 2, 3].map((weekIndex) => (
            <Button
              key={weekIndex}
              variant={selectedWeek === weekIndex ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWeek(weekIndex)}
              className="flex-shrink-0"
            >
              {getWeekLabel(weekIndex)}
            </Button>
          ))}
        </div>

        <div className="mt-4 text-sm text-muted-foreground text-center">
          {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
        </div>
      </Card>

      {/* Overall Wellness Score */}
      <Card className="p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${wellnessScore}, 100`}
                className={getScoreColor(wellnessScore / 10, 'completion')}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-semibold">{wellnessScore}</span>
            </div>
          </div>
          
          <h3 className="mb-2">Wellness Score</h3>
          <p className="text-sm text-muted-foreground">
            Based on sleep quality, stress management, and exercise completion
          </p>
        </div>
      </Card>

      {/* Sleep Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-primary" />
          <h3>Sleep Summary</h3>
        </div>

        {metrics.sleep.nightsTracked > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600 mb-1">
                  {formatTime(metrics.sleep.avgDuration)}
                </div>
                <p className="text-sm text-muted-foreground">Avg Sleep</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600 mb-1">
                  {metrics.sleep.avgEfficiency}%
                </div>
                <p className="text-sm text-muted-foreground">Avg Efficiency</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Sleep Quality Score:</span>
              <div className="flex items-center gap-2">
                <div className={`text-sm font-medium ${getScoreColor(metrics.sleep.qualityScore, 'sleep')}`}>
                  {metrics.sleep.qualityScore.toFixed(1)}/4.0
                </div>
                <Award className={`w-4 h-4 ${getScoreColor(metrics.sleep.qualityScore, 'sleep')}`} />
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {metrics.sleep.nightsTracked}/7 nights tracked
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Moon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No sleep data for this week</p>
          </div>
        )}
      </Card>

      {/* Stress Management */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3>Stress Management</h3>
        </div>

        {metrics.stress.totalEvents > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-600 mb-1">
                  {metrics.stress.totalEvents}
                </div>
                <p className="text-sm text-muted-foreground">Stress Events</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold mb-1 ${getScoreColor(metrics.stress.avgIntensity, 'stress')}`}>
                  {metrics.stress.avgIntensity}/10
                </div>
                <p className="text-sm text-muted-foreground">Avg Intensity</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Exercise Completion:</span>
              <div className="flex items-center gap-2">
                <div className={`text-sm font-medium ${getScoreColor(metrics.stress.completionRate, 'completion')}`}>
                  {metrics.stress.completionRate}%
                </div>
                <Target className={`w-4 h-4 ${getScoreColor(metrics.stress.completionRate, 'completion')}`} />
              </div>
            </div>

            {metrics.stress.topCategory && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Main stress source:</span>
                <Badge variant="outline">{metrics.stress.topCategory[0]} ({metrics.stress.topCategory[1]}x)</Badge>
              </div>
            )}

            {metrics.stress.topMoodCategory && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Dominant emotion:</span>
                <Badge variant="outline" className="capitalize">
                  {metrics.stress.topMoodCategory[0].replace('-', '/')} ({metrics.stress.topMoodCategory[1]}x)
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No stress events this week</p>
            <p className="text-sm text-muted-foreground mt-1">Great job maintaining low stress!</p>
          </div>
        )}
      </Card>

      {/* Weekly Insights & Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3>Insights & Recommendations</h3>
        </div>

        <div className="space-y-3">
          {/* Sleep insights */}
          {metrics.sleep.nightsTracked > 0 && (
            <>
              {metrics.sleep.avgDuration < 420 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Consider more sleep</p>
                    <p className="text-xs text-yellow-700">
                      You're averaging {formatTime(metrics.sleep.avgDuration)}. Aim for 7-9 hours.
                    </p>
                  </div>
                </div>
              )}

              {metrics.sleep.avgEfficiency < 85 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Moon className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Improve sleep efficiency</p>
                    <p className="text-xs text-blue-700">
                      Try maintaining a consistent sleep schedule and creating a relaxing bedtime routine.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Stress insights */}
          {metrics.stress.totalEvents > 0 && (
            <>
              {metrics.stress.avgIntensity > 6 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <Heart className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">High stress detected</p>
                    <p className="text-xs text-red-700">
                      Consider adding more relaxation techniques to your daily routine.
                    </p>
                  </div>
                </div>
              )}

              {metrics.stress.completionRate < 70 && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Activity className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Complete more exercises</p>
                    <p className="text-xs text-purple-700">
                      Breathing exercises help manage stress. Try to complete them when prompted.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Positive reinforcement */}
          {wellnessScore >= 80 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Award className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Excellent wellness management!</p>
                <p className="text-xs text-green-700">
                  Keep up the great work with your sleep and stress management routine.
                </p>
              </div>
            </div>
          )}

          {metrics.stress.totalEvents === 0 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Zap className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Stress-free week!</p>
                <p className="text-xs text-green-700">
                  No stress events detected. Your wellness routine is working well.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Weekly Goals for Next Week */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3>Goals for Next Week</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border border-dashed border-muted-foreground rounded-lg">
            <Moon className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sleep consistently</p>
              <p className="text-xs text-muted-foreground">Aim for 7-9 hours every night</p>
            </div>
            <div className="w-5 h-5 border-2 border-muted-foreground rounded"></div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-dashed border-muted-foreground rounded-lg">
            <Brain className="w-4 h-4 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">Complete stress exercises</p>
              <p className="text-xs text-muted-foreground">100% completion rate</p>
            </div>
            <div className="w-5 h-5 border-2 border-muted-foreground rounded"></div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-dashed border-muted-foreground rounded-lg">
            <Heart className="w-4 h-4 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">Maintain low stress levels</p>
              <p className="text-xs text-muted-foreground">Keep average intensity below 5</p>
            </div>
            <div className="w-5 h-5 border-2 border-muted-foreground rounded"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};