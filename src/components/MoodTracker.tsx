import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { StressEvent } from '../App';
import { Calendar, Clock, TrendingUp, Activity, Brain, Heart, Sparkles, Target, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MoodTrackerProps {
  onMoodSelected: (mood: string, emoji: string, moodCategory: string) => void;
  stressEvents: StressEvent[];
  onBreathingExercise?: () => void;
  onCBTIAccess?: () => void;
}

interface MoodOption {
  mood: string;
  emoji: string;
  gradient: string;
  category: 'happy' | 'sad' | 'angry' | 'fear' | 'disgust' | 'surprise';
  description: string;
}

const moodOptions: MoodOption[] = [
  { 
    mood: 'Happy', 
    emoji: '😊', 
    gradient: 'from-yellow-400 to-orange-400',
    category: 'happy',
    description: 'Feeling joyful and positive'
  },
  { 
    mood: 'Sad', 
    emoji: '😔', 
    gradient: 'from-blue-400 to-blue-600',
    category: 'sad',
    description: 'Feeling down or melancholy'
  },
  { 
    mood: 'Angry', 
    emoji: '😡', 
    gradient: 'from-red-400 to-red-600',
    category: 'angry',
    description: 'Feeling frustrated or irritated'
  },
  { 
    mood: 'Anxious', 
    emoji: '😰', 
    gradient: 'from-orange-400 to-amber-500',
    category: 'fear',
    description: 'Feeling worried or nervous'
  },
  { 
    mood: 'Calm', 
    emoji: '😌', 
    gradient: 'from-green-400 to-emerald-500',
    category: 'surprise',
    description: 'Feeling peaceful and relaxed'
  },
  { 
    mood: 'Overwhelmed', 
    emoji: '😵‍💫', 
    gradient: 'from-purple-400 to-purple-600',
    category: 'disgust',
    description: 'Feeling stressed or overloaded'
  },
];

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSelected, stressEvents, onBreathingExercise, onCBTIAccess }) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week'>('day');
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  // Calculate stats
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

  const getWellnessScore = () => {
    if (todayEvents.length === 0) return { score: 85, level: 'Good', color: 'from-green-400 to-emerald-500' };
    
    const avgIntensity = todayEvents.reduce((sum, event) => sum + event.intensity, 0) / todayEvents.length;
    const happyEvents = todayEvents.filter(e => e.moodCategory === 'happy').length;
    const stressEvents = todayEvents.filter(e => ['angry', 'fear', 'sad'].includes(e.moodCategory)).length;
    
    let score = 100;
    score -= avgIntensity * 5; // Reduce score by average intensity
    score -= stressEvents * 10; // Reduce for stress events
    score += happyEvents * 15; // Boost for happy events
    score = Math.max(10, Math.min(100, score)); // Clamp between 10-100
    
    if (score >= 80) return { score, level: 'Excellent', color: 'from-green-400 to-emerald-500' };
    if (score >= 65) return { score, level: 'Good', color: 'from-blue-400 to-blue-500' };
    if (score >= 45) return { score, level: 'Fair', color: 'from-yellow-400 to-orange-400' };
    return { score, level: 'Needs Attention', color: 'from-red-400 to-red-500' };
  };

  const getMoodDistribution = () => {
    const events = selectedPeriod === 'day' ? todayEvents : thisWeekEvents;
    const distribution = events.reduce((acc, event) => {
      acc[event.moodCategory] = (acc[event.moodCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution).map(([category, count]) => {
      const option = moodOptions.find(opt => opt.category === category);
      return {
        category,
        count,
        emoji: option?.emoji || '😐',
        mood: option?.mood || category,
        percentage: events.length > 0 ? (count / events.length) * 100 : 0
      };
    });
  };

  const handleMoodSelect = (option: MoodOption) => {
    setSelectedMood(option);
  };

  const handleContinue = () => {
    if (selectedMood) {
      onMoodSelected(selectedMood.mood, selectedMood.emoji, selectedMood.category);
    }
  };

  const wellness = getWellnessScore();
  const moodDistribution = getMoodDistribution();
  const events = selectedPeriod === 'day' ? todayEvents : thisWeekEvents;

  return (
    <div className="space-y-6 pb-20">
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
            This Week
          </Button>
        </div>
      </Card>

      {/* Wellness Score */}
      <Card className="p-6 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${wellness.color} opacity-10`} />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${wellness.color} flex items-center justify-center`}>
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2>Wellness Score</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedPeriod === 'day' ? "Today's" : "This week's"} emotional health
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold text-primary">{Math.round(wellness.score)}</div>
              <Badge className={`bg-gradient-to-r ${wellness.color} text-white border-0`}>
                {wellness.level}
              </Badge>
            </div>
          </div>
          
          <div className="mb-4">
            <Progress value={wellness.score} className="h-3" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-primary">{events.length}</div>
              <p className="text-xs text-muted-foreground">Check-ins</p>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {events.filter(e => e.completed).length}
              </div>
              <p className="text-xs text-muted-foreground">Exercises</p>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {thisWeekEvents.filter(e => e.moodCategory === 'happy').length}
              </div>
              <p className="text-xs text-muted-foreground">Happy moments</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Mood Distribution */}
      {moodDistribution.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3>Mood Overview</h3>
          </div>
          
          {/* Mood distribution bar */}
          <div className="mb-4">
            <div className="flex h-6 rounded-lg overflow-hidden bg-muted">
              {moodDistribution.map((item, index) => {
                const option = moodOptions.find(opt => opt.category === item.category);
                if (!option || item.percentage === 0) return null;
                
                return (
                  <motion.div
                    key={item.category}
                    className={`bg-gradient-to-r ${option.gradient} flex items-center justify-center text-white text-xs font-medium`}
                    style={{ width: `${item.percentage}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    {item.percentage > 15 && item.emoji}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {moodDistribution.map((item) => {
              const option = moodOptions.find(opt => opt.category === item.category);
              if (!option) return null;
              
              return (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm">{item.mood}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {todayEvents.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3>Recent Check-ins</h3>
            </div>
            {todayEvents.length > 2 && (
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {todayEvents.slice(0, 3).map((event, index) => {
              const option = moodOptions.find(opt => opt.category === event.moodCategory);
              return (
                <motion.div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${option?.gradient || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                    <span className="text-lg">{event.moodEmoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{event.mood}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.intensity}/10
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.category}
                    </p>
                  </div>
                  {event.completed && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Breathing Exercise Quick Access */}
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-blue-400/20 to-purple-400/20" />
        <div className="relative">
          <div className="text-center">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0 rgba(16, 185, 129, 0)',
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                  '0 0 0 rgba(16, 185, 129, 0)'
                ]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Wind className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="mb-2">Breathing Exercise</h2>
            <p className="text-muted-foreground mb-6">
              Choose from multiple breathing techniques to center yourself and reduce stress
            </p>
            
            <div className="flex justify-center items-center gap-2 mb-6">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">4-7-8</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Box</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">4-4</span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground ml-2">& more techniques</span>
            </div>
            
            <Button 
              onClick={onBreathingExercise}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
              size="lg"
              disabled={!onBreathingExercise}
            >
              <Wind className="w-4 h-4 mr-2" />
              Start Breathing Session
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-sm">Quick Check-in</h3>
            <p className="text-muted-foreground mb-4 text-xs">
              How are you feeling right now?
            </p>
            
            <Button 
              onClick={() => setShowMoodSelector(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="sm"
            >
              Start Check-in
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-sm">Thought Analysis</h3>
            <p className="text-muted-foreground mb-4 text-xs">
              Work through automatic thoughts
            </p>
            
            <Button 
              onClick={onCBTIAccess}
              variant="outline"
              className="w-full"
              size="sm"
              disabled={!onCBTIAccess}
            >
              Start CBT-I
            </Button>
          </div>
        </Card>
      </div>

      {/* Insights */}
      {thisWeekEvents.length >= 3 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3>Insights</h3>
          </div>
          
          <div className="space-y-3">
            {/* Most Common Mood */}
            {(() => {
              const mostCommon = moodDistribution.reduce((prev, current) => 
                prev.count > current.count ? prev : current, moodDistribution[0]
              );
              
              if (mostCommon) {
                return (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">Most common mood:</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {mostCommon.emoji} {mostCommon.mood}
                    </Badge>
                  </div>
                );
              }
            })()}

            {/* Stress Pattern */}
            {(() => {
              const stressCount = thisWeekEvents.filter(e => 
                ['angry', 'fear', 'sad'].includes(e.moodCategory)
              ).length;
              const totalCount = thisWeekEvents.length;
              const stressRatio = totalCount > 0 ? (stressCount / totalCount) * 100 : 0;
              
              return (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm">Stress frequency:</span>
                  <Badge className={`${stressRatio > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {Math.round(stressRatio)}% of check-ins
                  </Badge>
                </div>
              );
            })()}

            {/* Exercise Completion */}
            {(() => {
              const completedExercises = thisWeekEvents.filter(e => e.completed).length;
              const totalExercises = thisWeekEvents.length;
              const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
              
              return (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm">Exercise completion:</span>
                  <Badge className="bg-green-100 text-green-700">
                    {Math.round(completionRate)}% completed
                  </Badge>
                </div>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Mood Selector Modal */}
      <AnimatePresence>
        {showMoodSelector && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-background rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center mb-6">
                <h3 className="mb-2">How are you feeling right now?</h3>
                <p className="text-sm text-muted-foreground">
                  Select the emotion that best describes your current state
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {moodOptions.map((option, index) => (
                  <motion.button
                    key={option.mood}
                    onClick={() => handleMoodSelect(option)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden
                      ${selectedMood?.mood === option.mood 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/30'
                      }
                    `}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-10`} />
                    <div className="relative">
                      <div className="text-3xl mb-2">{option.emoji}</div>
                      <div className="text-sm font-medium mb-1">{option.mood}</div>
                      <div className="text-xs text-muted-foreground leading-tight">
                        {option.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {selectedMood && (
                <motion.div
                  className="p-4 bg-muted/30 rounded-xl mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-2xl">{selectedMood.emoji}</span>
                    <span className="font-medium">{selectedMood.mood}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {selectedMood.description}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMoodSelector(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleContinue}
                  disabled={!selectedMood}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};