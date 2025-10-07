import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Calendar } from './ui/calendar';
import { 
  Brain, 
  Moon, 
  Calendar as CalendarIcon, 
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Plus,
  History,
  Zap,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StressEvent } from '../App';
import { ThoughtRecord, ThoughtRecordEntry } from './ThoughtRecord';
import { ThoughtLoopsComparison } from './ThoughtLoopsComparison';
import { CircularThoughtMap } from './CircularThoughtMap';

export interface ThoughtLoop {
  id: string;
  timestamp: Date;
  trigger: string;
  automaticThought: string;
  beliefPercentage: number;
  emotion: string;
  emotionIntensity: number;
  thinkingError: string;
  behaviorResponse: string;
  balancedThought?: string;
  newEmotionIntensity?: number;
  actionPlan?: string;
  completed: boolean;
  sleepRelated: boolean;
  category?: string;
}

interface CBTITrackerProps {
  stressEvents: StressEvent[];
  thoughtLoops: ThoughtLoop[];
  thoughtRecords: ThoughtRecordEntry[];
  onThoughtLoopCompleted: (loop: ThoughtLoop) => void;
  onThoughtRecordCompleted: (record: ThoughtRecordEntry) => void;
  onClose?: () => void;
}

export const CBTITracker: React.FC<CBTITrackerProps> = ({ 
  stressEvents, 
  thoughtLoops,
  thoughtRecords = [],
  onThoughtLoopCompleted,
  onThoughtRecordCompleted,
  onClose
}) => {
  const [currentView, setCurrentView] = useState<'overview' | 'new-record' | 'evening-review' | 'bedtime' | 'comparison' | 'calendar' | 'insights' | 'voice-map'>('overview');
  const [showEveningPrompt, setShowEveningPrompt] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ThoughtRecordEntry | null>(null);
  const [recordMode, setRecordMode] = useState<'full' | 'evening' | 'bedtime'>('full');

  // Check for evening review prompt (9-11 PM)
  useEffect(() => {
    const checkEveningTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 21 && hour <= 23) {
        const todayIncomplete = thoughtRecords.filter(record => {
          const recordDate = new Date(record.timestamp);
          return recordDate.toDateString() === now.toDateString() && !record.completed;
        });
        
        if (todayIncomplete.length > 0) {
          setShowEveningPrompt(true);
        }
      }
    };

    const timer = setInterval(checkEveningTime, 60000);
    checkEveningTime();
    
    return () => clearInterval(timer);
  }, [thoughtRecords]);

  const getTodayStats = () => {
    const today = new Date();
    const todayRecords = thoughtRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate.toDateString() === today.toDateString();
    });

    const completedRecords = todayRecords.filter(record => record.completed);
    
    return {
      total: todayRecords.length,
      completed: completedRecords.length,
      sleepRelated: todayRecords.filter(record => record.sleepRelated).length,
      avgImprovement: completedRecords.length > 0 
        ? completedRecords.reduce((sum, record) => sum + (record.initialBeliefPercentage - record.finalBeliefPercentage), 0) / completedRecords.length 
        : 0
    };
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyRecords = thoughtRecords.filter(record => 
      new Date(record.timestamp) >= weekAgo && record.completed
    );

    const mostCommonBias = getMostCommonBias(weeklyRecords);
    const avgBeliefReduction = weeklyRecords.length > 0 
      ? weeklyRecords.reduce((sum, record) => sum + (record.initialBeliefPercentage - record.finalBeliefPercentage), 0) / weeklyRecords.length 
      : 0;

    return {
      totalSessions: weeklyRecords.length,
      avgBeliefReduction,
      avgEmotionReduction: weeklyRecords.length > 0 
        ? weeklyRecords.reduce((sum, record) => sum + (record.emotionIntensity - record.finalEmotionIntensity), 0) / weeklyRecords.length 
        : 0,
      mostCommonBias,
      streak: calculateStreak()
    };
  };

  const getMostCommonBias = (records: ThoughtRecordEntry[]) => {
    const biasCount: Record<string, number> = {};
    records.forEach(record => {
      record.cognitiveBiases.forEach(bias => {
        biasCount[bias] = (biasCount[bias] || 0) + 1;
      });
    });
    
    const mostCommon = Object.entries(biasCount).reduce((prev, current) => 
      current[1] > prev[1] ? current : prev, ['', 0]
    );
    
    return mostCommon[0] || 'None identified';
  };

  const calculateStreak = () => {
    // Calculate consecutive days with completed thought records
    const sortedRecords = [...thoughtRecords]
      .filter(record => record.completed)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const record of sortedRecords) {
      const recordDate = new Date(record.timestamp);
      recordDate.setHours(0, 0, 0, 0);
      
      if (recordDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (recordDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const handleNewRecord = (mode: 'full' | 'evening' | 'bedtime') => {
    setRecordMode(mode);
    setCurrentView('new-record');
  };

  const handleRecordCompleted = (record: ThoughtRecordEntry) => {
    onThoughtRecordCompleted(record);
    setSelectedRecord(record);
    setCurrentView('comparison');
  };

  const handleCompletionAndReturn = (record: ThoughtRecordEntry) => {
    onThoughtRecordCompleted(record);
    if (onClose) {
      onClose();
    } else {
      setCurrentView('overview');
    }
  };

  const handleEveningReview = () => {
    setShowEveningPrompt(false);
    handleNewRecord('evening');
  };

  const renderCalendarView = () => {
    const today = new Date();
    const monthRecords = thoughtRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate.getMonth() === today.getMonth() && 
             recordDate.getFullYear() === today.getFullYear();
    });

    // Group records by date for calendar dots
    const recordsByDate = monthRecords.reduce((acc, record) => {
      const dateKey = new Date(record.timestamp).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(record);
      return acc;
    }, {} as Record<string, ThoughtRecordEntry[]>);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2>Monthly Overview</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentView('overview')}
          >
            Back
          </Button>
        </div>

        <Card className="p-6">
          <Calendar
            mode="single"
            className="rounded-md border"
            modifiers={{
              hasRecords: (date) => {
                const dateKey = date.toDateString();
                return !!recordsByDate[dateKey];
              },
              completed: (date) => {
                const dateKey = date.toDateString();
                const dayRecords = recordsByDate[dateKey] || [];
                return dayRecords.some(record => record.completed);
              }
            }}
            modifiersClassNames={{
              hasRecords: "bg-blue-100 text-blue-800",
              completed: "bg-green-100 text-green-800"
            }}
          />
        </Card>

        {/* Month Summary */}
        <Card className="p-6">
          <h3 className="mb-4">This Month</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-primary">{monthRecords.length}</div>
              <p className="text-xs text-muted-foreground">Total Records</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {monthRecords.filter(r => r.completed).length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderInsights = () => {
    const weeklyStats = getWeeklyStats();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2>Progress & Insights</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentView('overview')}
          >
            Back
          </Button>
        </div>

        {/* Key Metrics */}
        <Card className="p-6">
          <h3 className="mb-4">Weekly Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {Math.round(weeklyStats.avgBeliefReduction)}%
              </div>
              <p className="text-xs text-muted-foreground">Avg Belief Reduction</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {Math.round(weeklyStats.avgEmotionReduction)}
              </div>
              <p className="text-xs text-muted-foreground">Avg Emotion Reduction</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {weeklyStats.totalSessions}
              </div>
              <p className="text-xs text-muted-foreground">Sessions This Week</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-orange-600">
                {weeklyStats.streak}
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>

        {/* Most Common Thinking Pattern */}
        <Card className="p-6">
          <h3 className="mb-4">Most Common Pattern</h3>
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div>
              <p className="font-medium text-amber-700">{weeklyStats.mostCommonBias}</p>
              <p className="text-sm text-amber-600">Focus area for improvement</p>
            </div>
            <Badge className="bg-amber-100 text-amber-700">
              Work on this
            </Badge>
          </div>
        </Card>

        {/* Completion Rate */}
        <Card className="p-6">
          <h3 className="mb-4">Completion Rate</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Thought Records</span>
              <span className="text-sm font-medium">
                {thoughtRecords.filter(r => r.completed).length}/{thoughtRecords.length}
              </span>
            </div>
            <Progress 
              value={thoughtRecords.length > 0 ? (thoughtRecords.filter(r => r.completed).length / thoughtRecords.length) * 100 : 0} 
              className="h-2" 
            />
          </div>
        </Card>
      </div>
    );
  };

  const todayStats = getTodayStats();

  if (currentView === 'new-record') {
    return (
      <ThoughtRecord
        mode={recordMode}
        onCompleted={(record) => {
          onThoughtRecordCompleted(record);
          // Show success message and return to overview
          if (onClose) {
            onClose();
          } else {
            setCurrentView('overview');
          }
        }}
        onCancel={() => setCurrentView('overview')}
      />
    );
  }

  if (currentView === 'comparison' && selectedRecord) {
    return (
      <ThoughtLoopsComparison
        entry={selectedRecord}
        onBack={() => setCurrentView('overview')}
        onClose={onClose}
      />
    );
  }

  if (currentView === 'calendar') {
    return renderCalendarView();
  }

  if (currentView === 'insights') {
    return renderInsights();
  }

  if (currentView === 'voice-map') {
    return (
      <CircularThoughtMap
        onCompleted={(analysis) => {
          // Convert voice analysis to thought record
          const voiceRecord: ThoughtRecordEntry = {
            id: Date.now().toString(),
            timestamp: new Date(),
            situation: 'Voice-described situation',
            automaticThought: analysis.transcript,
            initialBeliefPercentage: 80,
            emotion: analysis.emotions[0] || 'stress',
            emotionIntensity: 70,
            cognitiveBiases: analysis.thoughts,
            advice: {
              toOther: analysis.suggestions[0] || 'This will pass',
              beliefAfter: 40
            },
            finalBeliefPercentage: 40,
            finalEmotionIntensity: 35,
            plannedActions: analysis.suggestions.slice(0, 2).map(suggestion => ({ title: suggestion })),
            completed: true,
            sleepRelated: false,
            category: 'Voice Analysis'
          };
          
          onThoughtRecordCompleted(voiceRecord);
          if (onClose) {
            onClose();
          } else {
            setCurrentView('overview');
          }
        }}
        onCancel={() => setCurrentView('overview')}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Evening Review Prompt */}
      <AnimatePresence>
        {showEveningPrompt && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm bg-background rounded-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <Moon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="mb-2">Evening Reflection</h3>
                  <p className="text-sm text-muted-foreground">
                    Take 5 minutes to review today's thoughts and create healthier patterns
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEveningPrompt(false)}
                    className="flex-1"
                  >
                    Later
                  </Button>
                  <Button 
                    onClick={handleEveningReview}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  >
                    Start Review
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Start Options */}
      <div className="space-y-4">
        <h2>What's happening in your mind?</h2>
        
        {/* Voice input option */}
        <Button 
          onClick={() => setCurrentView('voice-map')}
          className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-emerald-400 to-blue-600"
        >
          <Mic className="w-8 h-8" />
          <span className="text-sm">Voice Thought Map</span>
          <span className="text-xs opacity-80">Speak or type your thoughts</span>
        </Button>
        
        {/* Quick mood check */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => handleNewRecord('evening')}
            className="h-16 flex flex-col gap-2 bg-gradient-to-br from-blue-400 to-blue-600"
          >
            <Brain className="w-5 h-5" />
            <span className="text-sm">I'm stressed</span>
          </Button>
          
          <Button 
            onClick={() => handleNewRecord('bedtime')}
            className="h-16 flex flex-col gap-2 bg-gradient-to-br from-purple-400 to-purple-600"
          >
            <Moon className="w-5 h-5" />
            <span className="text-sm">Can't sleep</span>
          </Button>
        </div>

        <Button 
          onClick={() => handleNewRecord('full')}
          variant="outline"
          className="w-full h-12"
        >
          <Plus className="w-4 h-4 mr-2" />
          Written Analysis
        </Button>
      </div>

      {/* Today's Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3>Today's Progress</h3>
          <Badge variant="outline">{todayStats.completed}/{todayStats.total}</Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">{Math.round(todayStats.avgImprovement)}%</div>
            <p className="text-xs text-muted-foreground">Improved</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">{getWeeklyStats().streak}</div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">{getWeeklyStats().totalSessions}</div>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
        </div>
      </Card>

      {/* Quick Access Methods */}
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-400/20 to-blue-400/20" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3>Cognitive Restructuring</h3>
              <p className="text-sm text-muted-foreground">
                Transform negative thought patterns into balanced perspectives
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setCurrentView('voice-map')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Map
            </Button>
            <Button 
              onClick={() => handleNewRecord('bedtime')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Moon className="w-4 h-4 mr-2" />
              Sleep Focus
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center space-y-2">
            <CalendarIcon className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="text-sm font-medium">Calendar</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentView('calendar')}
              className="w-full"
            >
              View
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center space-y-2">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto" />
            <h4 className="text-sm font-medium">Insights</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentView('insights')}
              className="w-full"
            >
              View
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center space-y-2">
            <History className="w-8 h-8 text-purple-600 mx-auto" />
            <h4 className="text-sm font-medium">History</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Navigate to history view
                console.log('View history');
              }}
              className="w-full"
            >
              View
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Thought Records */}
      {thoughtRecords.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3>Recent Records</h3>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {thoughtRecords.slice(0, 3).map((record, index) => (
              <motion.div
                key={record.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => {
                  setSelectedRecord(record);
                  setCurrentView('comparison');
                }}
              >
                <div className={`w-3 h-3 rounded-full ${record.completed ? 'bg-green-500' : 'bg-orange-400'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{record.automaticThought}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {record.sleepRelated && (
                      <Badge variant="outline" className="text-xs">
                        <Moon className="w-3 h-3 mr-1" />
                        Sleep
                      </Badge>
                    )}
                  </div>
                </div>
                {record.completed && (
                  <div className="text-xs text-green-600 font-medium">
                    -{record.initialBeliefPercentage - record.finalBeliefPercentage}%
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};