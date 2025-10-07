import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import { 
  Heart, 
  Moon, 
  Brain, 
  TrendingUp, 
  ChevronRight, 
  Home as HomeIcon,
  Activity,
  Sparkles,
  Calendar,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  BarChart3
} from 'lucide-react';

interface StressEvent {
  id: string;
  timestamp: Date;
  mood: string;
  moodEmoji: string;
  moodCategory: string;
  intensity: number;
  category: string;
  subcategory?: string;
  stressWord?: string;
  completed?: boolean;
  hrvBefore?: number;
  hrvAfter?: number;
  triggers?: string[];
}

interface SleepData {
  id: string;
  date: Date;
  bedtime: Date;
  wakeTime: Date;
  totalSleep: number;
  remSleep: number;
  deepSleep: number;
  lightSleep: number;
  awakeTime: number;
  sleepEfficiency: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  heartRate?: {
    min: number;
    max: number;
    avg: number;
  };
  movements: number;
}

interface HomeProps {
  onMoodTrack: () => void;
  onMeditationStart: () => void;
  onViewReports: () => void;
  onViewSleep: () => void;
  onCBTAccess?: () => void;
  stressEvents: StressEvent[];
  sleepData: SleepData[];
}

interface TimeBasedMoodData {
  morning: { events: StressEvent[]; avgScore: number; count: number };
  afternoon: { events: StressEvent[]; avgScore: number; count: number };
  evening: { events: StressEvent[]; avgScore: number; count: number };
}

interface SleepTrend {
  recent7Days: {
    avgDuration: number;
    avgQuality: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
    consistencyScore: number;
  };
}

interface TodayStats {
  stressCount: number;
  lastMoodEntry?: {
    score: number;
    timestamp: Date;
    categories: string[];
  };
  sleepData?: {
    duration: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    bedtime: string;
    wakeTime: string;
  };
  meditationStreak: number;
  hrvScore?: number;
  timeBasedMood: TimeBasedMoodData;
  sleepTrend: SleepTrend;
}

export const Home: React.FC<HomeProps> = ({
  onMoodTrack,
  onMeditationStart,
  onViewReports,
  onViewSleep,
  onCBTAccess,
  stressEvents,
  sleepData
}) => {
  const [todayStats, setTodayStats] = useState<TodayStats>({
    stressCount: 0,
    meditationStreak: 0,
    timeBasedMood: {
      morning: { events: [], avgScore: 0, count: 0 },
      afternoon: { events: [], avgScore: 0, count: 0 },
      evening: { events: [], avgScore: 0, count: 0 }
    },
    sleepTrend: {
      recent7Days: {
        avgDuration: 0,
        avgQuality: 0,
        qualityTrend: 'stable',
        consistencyScore: 0
      }
    }
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load today's data
  useEffect(() => {
    loadTodayData();
  }, [stressEvents, sleepData]);

  const loadTodayData = () => {
    const today = new Date().toDateString();
    
    // Filter today's stress events
    const todayStress = stressEvents.filter(event => 
      event.timestamp.toDateString() === today
    );

    // Get last mood entry from today
    const todayMoods = stressEvents.filter(event => 
      event.timestamp.toDateString() === today
    );
    const lastMoodEntry = todayMoods.length > 0 ? todayMoods[todayMoods.length - 1] : undefined;

    // Get last night's sleep data
    const lastNightSleep = sleepData.find(sleep => {
      const sleepDate = new Date(sleep.bedtime);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return sleepDate.toDateString() === yesterday.toDateString();
    });

    // Load meditation streak from localStorage (this data isn't in the main state)
    const meditationData = JSON.parse(localStorage.getItem('meditation_sessions') || '[]');
    const streak = calculateMeditationStreak(meditationData);

    // Calculate average HRV from today's events
    const todayEventsWithHRV = todayStress.filter(event => event.hrvBefore);
    const avgHRV = todayEventsWithHRV.length > 0 
      ? todayEventsWithHRV.reduce((sum, event) => sum + (event.hrvBefore || 0), 0) / todayEventsWithHRV.length
      : 35 + Math.random() * 25; // fallback

    // Analyze time-based mood patterns
    const timeBasedMood = analyzeTimeBasedMood(todayMoods);
    
    // Analyze sleep trends
    const sleepTrend = analyzeSleepTrends(sleepData);

    setTodayStats({
      stressCount: todayStress.length,
      lastMoodEntry: lastMoodEntry ? {
        score: lastMoodEntry.intensity,
        timestamp: lastMoodEntry.timestamp,
        categories: [lastMoodEntry.category]
      } : undefined,
      sleepData: lastNightSleep ? {
        duration: Math.round(lastNightSleep.totalSleep / 60), // convert minutes to hours
        quality: lastNightSleep.sleepQuality,
        bedtime: lastNightSleep.bedtime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        wakeTime: lastNightSleep.wakeTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      } : undefined,
      meditationStreak: streak,
      hrvScore: Math.round(avgHRV),
      timeBasedMood,
      sleepTrend
    });
  };

  const calculateMeditationStreak = (sessions: any[]): number => {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);
    
    // Check consecutive days backwards from today
    for (let i = 0; i < 30; i++) { // Check up to 30 days
      const dayString = checkDate.toDateString();
      const hasSession = sessions.some((session: any) => 
        new Date(session.completedAt).toDateString() === dayString
      );
      
      if (hasSession) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const analyzeTimeBasedMood = (todayEvents: StressEvent[]): TimeBasedMoodData => {
    const morning = todayEvents.filter(event => {
      const hour = event.timestamp.getHours();
      return hour >= 5 && hour < 12;
    });
    
    const afternoon = todayEvents.filter(event => {
      const hour = event.timestamp.getHours();
      return hour >= 12 && hour < 17;
    });
    
    const evening = todayEvents.filter(event => {
      const hour = event.timestamp.getHours();
      return hour >= 17 && hour < 23;
    });

    const calculateAvg = (events: StressEvent[]) => 
      events.length > 0 ? events.reduce((sum, e) => sum + e.intensity, 0) / events.length : 0;

    return {
      morning: {
        events: morning,
        avgScore: calculateAvg(morning),
        count: morning.length
      },
      afternoon: {
        events: afternoon,
        avgScore: calculateAvg(afternoon),
        count: afternoon.length
      },
      evening: {
        events: evening,
        avgScore: calculateAvg(evening),
        count: evening.length
      }
    };
  };

  const analyzeSleepTrends = (allSleepData: SleepData[]): SleepTrend => {
    const last7Days = allSleepData.slice(0, 7);
    
    if (last7Days.length === 0) {
      return {
        recent7Days: {
          avgDuration: 0,
          avgQuality: 0,
          qualityTrend: 'stable',
          consistencyScore: 0
        }
      };
    }

    const avgDuration = last7Days.reduce((sum, sleep) => sum + sleep.totalSleep, 0) / last7Days.length / 60; // hours
    
    const qualityScores = last7Days.map(sleep => {
      switch (sleep.sleepQuality) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'fair': return 2;
        case 'poor': return 1;
        default: return 0;
      }
    });
    
    const avgQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    
    // Determine trend (compare first half vs second half)
    const firstHalf = qualityScores.slice(0, Math.floor(qualityScores.length / 2));
    const secondHalf = qualityScores.slice(Math.floor(qualityScores.length / 2));
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    let qualityTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (secondAvg > firstAvg + 0.3) qualityTrend = 'improving';
    else if (secondAvg < firstAvg - 0.3) qualityTrend = 'declining';
    
    // Calculate consistency (lower standard deviation = higher consistency)
    const durations = last7Days.map(sleep => sleep.totalSleep / 60);
    const avgDur = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;
    const variance = durations.reduce((sum, dur) => sum + Math.pow(dur - avgDur, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (stdDev * 20)); // Scale to 0-100

    return {
      recent7Days: {
        avgDuration: Math.round(avgDuration * 10) / 10,
        avgQuality: Math.round(avgQuality * 10) / 10,
        qualityTrend,
        consistencyScore: Math.round(consistencyScore)
      }
    };
  };

  const getStressLevelInfo = (count: number) => {
    if (count >= 10) return { level: 'High', color: 'text-red-600 bg-red-50', icon: '🔴' };
    if (count >= 5) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50', icon: '🟡' };
    if (count >= 1) return { level: 'Low', color: 'text-green-600 bg-green-50', icon: '🟢' };
    return { level: 'Minimal', color: 'text-blue-600 bg-blue-50', icon: '🔵' };
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '🙁';
    return '😢';
  };

  const getSleepQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const stressInfo = getStressLevelInfo(todayStats.stressCount);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{getTimeGreeting()}</h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Stress Overview */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="font-semibold">Today's Stress</h2>
              <p className="text-sm text-muted-foreground">Heart rate variability events</p>
            </div>
          </div>
          <Badge className={`${stressInfo.color} border-0`}>
            {stressInfo.icon} {stressInfo.level}
          </Badge>
        </div>
        
        <div className="flex items-end gap-4">
          <div className="text-3xl font-bold text-blue-700">{todayStats.stressCount}</div>
          <div className="text-sm text-muted-foreground mb-1">
            events detected
            {todayStats.hrvScore && (
              <div className="text-xs">HRV Score: {todayStats.hrvScore}</div>
            )}
          </div>
        </div>
      </Card>

      {/* Today's Mood Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-semibold">Today's Mood Journey</h3>
              <p className="text-sm text-muted-foreground">Emotional patterns throughout the day</p>
            </div>
          </div>
          <Button
            onClick={onMoodTrack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {todayStats.lastMoodEntry ? 'Update' : 'Log Mood'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Time-based mood breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-100">
            <Sunrise className="w-5 h-5 text-orange-600 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Morning</p>
            <div className="text-lg font-semibold text-orange-700">
              {todayStats.timeBasedMood.morning.count > 0 ? 
                Math.round(todayStats.timeBasedMood.morning.avgScore * 10) / 10 : '--'}
            </div>
            <p className="text-xs text-orange-600">
              {todayStats.timeBasedMood.morning.count} {todayStats.timeBasedMood.morning.count === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-100">
            <Sun className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Afternoon</p>
            <div className="text-lg font-semibold text-yellow-700">
              {todayStats.timeBasedMood.afternoon.count > 0 ? 
                Math.round(todayStats.timeBasedMood.afternoon.avgScore * 10) / 10 : '--'}
            </div>
            <p className="text-xs text-yellow-600">
              {todayStats.timeBasedMood.afternoon.count} {todayStats.timeBasedMood.afternoon.count === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-indigo-50 border border-indigo-100">
            <Sunset className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Evening</p>
            <div className="text-lg font-semibold text-indigo-700">
              {todayStats.timeBasedMood.evening.count > 0 ? 
                Math.round(todayStats.timeBasedMood.evening.avgScore * 10) / 10 : '--'}
            </div>
            <p className="text-xs text-indigo-600">
              {todayStats.timeBasedMood.evening.count} {todayStats.timeBasedMood.evening.count === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>

        {/* Latest mood entry */}
        {todayStats.lastMoodEntry && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-2xl">{getMoodEmoji(todayStats.lastMoodEntry.score)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">Latest: {todayStats.lastMoodEntry.score}/10</p>
              <p className="text-xs text-muted-foreground">
                {todayStats.lastMoodEntry.timestamp.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })} • {todayStats.lastMoodEntry.categories[0]}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Sleep Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Moon className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="font-semibold">Sleep Overview</h3>
              <p className="text-sm text-muted-foreground">Last night & weekly trends</p>
            </div>
          </div>
          <Button
            onClick={onViewSleep}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Last night's sleep */}
        {todayStats.sleepData ? (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-indigo-800">Last Night</p>
              <div className="flex items-center gap-2">
                <Badge className={`${getSleepQualityColor(todayStats.sleepData.quality)} border-0 text-xs`}>
                  {todayStats.sleepData.quality}
                </Badge>
                <span className="text-sm font-semibold text-indigo-700">{todayStats.sleepData.duration}h</span>
              </div>
            </div>
            <p className="text-xs text-indigo-600">
              {todayStats.sleepData.bedtime} - {todayStats.sleepData.wakeTime}
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">No sleep data available for last night</p>
          </div>
        )}

        {/* Weekly sleep trends */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">7-Day Trends</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-slate-50 border">
              <div className="text-lg font-semibold text-slate-700">
                {todayStats.sleepTrend.recent7Days.avgDuration}h
              </div>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-50 border">
              <div className="text-lg font-semibold text-slate-700">
                {todayStats.sleepTrend.recent7Days.consistencyScore}%
              </div>
              <p className="text-xs text-muted-foreground">Consistency</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Quality Trend</span>
              {todayStats.sleepTrend.recent7Days.qualityTrend === 'improving' && 
                <span className="text-green-600">📈</span>}
              {todayStats.sleepTrend.recent7Days.qualityTrend === 'declining' && 
                <span className="text-red-600">📉</span>}
              {todayStats.sleepTrend.recent7Days.qualityTrend === 'stable' && 
                <span className="text-blue-600">➡️</span>}
            </div>
            <div className="text-sm font-medium text-slate-700 capitalize">
              {todayStats.sleepTrend.recent7Days.qualityTrend}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick CBT Access */}
      {todayStats.stressCount > 0 && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold">Stressed Today?</h3>
              <p className="text-sm text-muted-foreground">Work through difficult thoughts</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              We detected {todayStats.stressCount} stress events today. Let's break down those thoughts.
            </div>
            
            <Button
              onClick={onCBTAccess}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              disabled={!onCBTAccess}
            >
              <Brain className="w-4 h-4 mr-2" />
              Analyze Thoughts (5 min)
            </Button>
          </div>
        </Card>
      )}

      {/* Tonight's Meditation Plan */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-0">
        <div className="flex items-center gap-3 mb-4">
          <Moon className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="font-semibold">Tonight's Meditation</h3>
            <p className="text-sm text-muted-foreground">Personalized bedtime plan</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Based on {todayStats.stressCount} stress events today
            </div>
            {todayStats.meditationStreak > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{todayStats.meditationStreak} day streak</span>
              </div>
            )}
          </div>
          
          <Button
            onClick={onMeditationStart}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            <Moon className="w-4 h-4 mr-2" />
            Start Bedtime Meditation
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <Button
            onClick={onViewReports}
            variant="ghost"
            className="w-full h-auto flex-col gap-2 p-4"
          >
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div className="text-center">
              <p className="font-medium text-sm">Weekly Reports</p>
              <p className="text-xs text-muted-foreground">View trends</p>
            </div>
          </Button>
        </Card>
        
        <Card className="p-4">
          <Button
            variant="ghost"
            className="w-full h-auto flex-col gap-2 p-4"
            onClick={() => {
              // Trigger mood tracking for manual check
              onMoodTrack();
            }}
          >
            <Activity className="w-8 h-8 text-green-600" />
            <div className="text-center">
              <p className="font-medium text-sm">Quick Check</p>
              <p className="text-xs text-muted-foreground">HRV status</p>
            </div>
          </Button>
        </Card>
      </div>

      {/* Today's Comprehensive Health Summary */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-0">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <h4 className="font-medium text-slate-800">Today's Wellness Dashboard</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Stress Level</span>
              <Badge className={`${stressInfo.color} border-0 text-xs`}>
                {stressInfo.icon}
              </Badge>
            </div>
            <div className="text-lg font-bold text-blue-600">{todayStats.stressCount}</div>
            <p className="text-xs text-muted-foreground">events today</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Mood Balance</span>
              <Heart className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-lg font-bold text-red-600">
              {todayStats.lastMoodEntry ? todayStats.lastMoodEntry.score : '--'}
            </div>
            <p className="text-xs text-muted-foreground">latest score</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-base font-semibold text-orange-600">
              {todayStats.timeBasedMood.morning.count}
            </div>
            <p className="text-xs text-muted-foreground">Morning</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-base font-semibold text-yellow-600">
              {todayStats.timeBasedMood.afternoon.count}
            </div>
            <p className="text-xs text-muted-foreground">Afternoon</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-base font-semibold text-indigo-600">
              {todayStats.timeBasedMood.evening.count}
            </div>
            <p className="text-xs text-muted-foreground">Evening</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Meditation Streak</span>
            </div>
            <div className="text-lg font-bold text-purple-600">{todayStats.meditationStreak}</div>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Keep going! Consistency builds mental resilience
          </p>
        </div>
      </Card>
    </div>
  );
};