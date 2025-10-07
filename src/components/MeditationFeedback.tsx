import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { MeditationPlan, MeditationFeedback } from './BedroomMeditationPlan';
import { ThumbsUp, ThumbsDown, RefreshCw, CheckCircle2, Circle, Star, Clock, Zap } from 'lucide-react';

interface MeditationFeedbackProps {
  plan: MeditationPlan;
  completedModules: string[];
  sessionDuration: number; // actual duration in minutes
  onSubmit: (feedback: MeditationFeedback) => void;
}

export const MeditationFeedback: React.FC<MeditationFeedbackProps> = ({
  plan,
  completedModules,
  sessionDuration,
  onSubmit
}) => {
  const [effectiveness, setEffectiveness] = useState<'good' | 'okay' | 'want_change' | null>(null);
  const [fellAsleepDuring, setFellAsleepDuring] = useState<'breathing' | 'body_scan' | 'imagery' | 'music' | null>(null);
  const [stressLevelAfter, setStressLevelAfter] = useState<number>(5);
  const [additionalFeedback, setAdditionalFeedback] = useState('');

  const effectivenessOptions = [
    {
      id: 'good' as const,
      title: 'Effective',
      description: 'Felt relaxed and ready for sleep',
      icon: <ThumbsUp className="w-5 h-5" />,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      id: 'okay' as const,
      title: 'Somewhat helpful',
      description: 'Some relaxation, but could be better',
      icon: <Circle className="w-5 h-5" />,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    },
    {
      id: 'want_change' as const,
      title: 'Want to try different approach',
      description: 'Prefer a different technique next time',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    }
  ];

  const moduleOptions = [
    { id: 'breathing' as const, label: 'Breathing Exercise', emoji: '🫁' },
    { id: 'body_scan' as const, label: 'Body Scan', emoji: '🧘‍♀️' },
    { id: 'imagery' as const, label: 'Guided Imagery', emoji: '🌅' },
    { id: 'music' as const, label: 'Music Relaxation', emoji: '🎵' }
  ];

  const getCompletionRate = () => {
    return Math.round((completedModules.length / plan.modules.length) * 100);
  };

  const getDurationComparison = () => {
    const plannedDuration = plan.totalDuration;
    const difference = sessionDuration - plannedDuration;
    
    if (Math.abs(difference) < 2) return 'on-time';
    if (difference > 0) return 'longer';
    return 'shorter';
  };

  const handleSubmit = () => {
    if (!effectiveness) return;

    const feedback: MeditationFeedback = {
      effectiveness,
      fellAsleepDuring,
      completedModules,
      sessionDuration,
      stressLevelAfter
    };

    onSubmit(feedback);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 text-center bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30">
            <motion.div
              className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: 3 }}
            >
              <Star className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="mb-2 text-white">Session Complete!</h2>
            <p className="text-white/80 text-sm">
              You've completed your personalized bedtime meditation
            </p>
          </Card>
        </motion.div>

        {/* Session Summary */}
        <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">Session Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/80">Duration</span>
              </div>
              <div className="text-right">
                <span className="text-white font-medium">{Math.round(sessionDuration)} min</span>
                <div className="text-xs text-white/60">
                  {getDurationComparison() === 'on-time' && '✅ As planned'}
                  {getDurationComparison() === 'longer' && '⏰ Extended session'}
                  {getDurationComparison() === 'shorter' && '⚡ Efficient session'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/80">Completion</span>
              </div>
              <div className="text-right">
                <span className="text-white font-medium">{getCompletionRate()}%</span>
                <div className="text-xs text-white/60">
                  {completedModules.length}/{plan.modules.length} modules
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white/80">Stress Level</span>
              </div>
              <span className="text-white font-medium">{plan.stressLevel.toUpperCase()}</span>
            </div>
          </div>
        </Card>

        {/* Completed Modules */}
        <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">Completed Modules</h3>
          
          <div className="space-y-2">
            {plan.modules.map((module) => (
              <div
                key={module.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  completedModules.includes(module.id)
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  completedModules.includes(module.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white/60'
                }`}>
                  {completedModules.includes(module.id) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">{module.title}</span>
                  <div className="text-xs text-white/60">{module.duration} minutes</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Effectiveness Rating */}
        <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">How effective was tonight's session?</h3>
          
          <div className="space-y-3">
            {effectivenessOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    effectiveness === option.id
                      ? option.color
                      : 'border-white/20 hover:border-white/30'
                  }`}
                  onClick={() => setEffectiveness(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={effectiveness === option.id ? option.color.split(' ')[0] : 'text-white/60'}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{option.title}</h4>
                      <p className="text-sm text-white/70">{option.description}</p>
                    </div>
                    {effectiveness === option.id && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Did you fall asleep? */}
        <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">Did you fall asleep during the session?</h3>
          <p className="text-sm text-white/60 mb-4">This helps us optimize future sessions</p>
          
          <div className="space-y-2">
            <Button
              variant={fellAsleepDuring === null ? "default" : "outline"}
              onClick={() => setFellAsleepDuring(null)}
              className="w-full justify-start"
            >
              No, I completed the full session awake
            </Button>
            
            {moduleOptions.map((module) => (
              <Button
                key={module.id}
                variant={fellAsleepDuring === module.id ? "default" : "outline"}
                onClick={() => setFellAsleepDuring(module.id)}
                className="w-full justify-start"
                disabled={!completedModules.includes(module.id)}
              >
                <span className="mr-2">{module.emoji}</span>
                Yes, during {module.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Stress Level After */}
        <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">How do you feel now?</h3>
          <p className="text-sm text-white/60 mb-4">Rate your current stress level (1 = very calm, 10 = very stressed)</p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60 min-w-[80px]">Very Calm</span>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevelAfter}
                onChange={(e) => setStressLevelAfter(Number(e.target.value))}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    #10b981 0%, 
                    #10b981 ${(10 - stressLevelAfter) * 10}%, 
                    rgba(255, 255, 255, 0.2) ${(10 - stressLevelAfter) * 10}%, 
                    rgba(255, 255, 255, 0.2) 100%)`
                }}
              />
              <span className="text-sm text-white/60 min-w-[80px] text-right">Very Stressed</span>
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-white">{stressLevelAfter}/10</span>
              <div className="text-sm text-white/60 mt-1">
                {stressLevelAfter <= 3 && '😌 Very relaxed'}
                {stressLevelAfter > 3 && stressLevelAfter <= 6 && '😊 Moderately calm'}
                {stressLevelAfter > 6 && stressLevelAfter <= 8 && '😐 Some stress remaining'}
                {stressLevelAfter > 8 && '😤 Still feeling stressed'}
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="pb-8">
          <Button
            onClick={handleSubmit}
            disabled={!effectiveness}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-xl shadow-lg text-lg"
          >
            {effectiveness ? "Submit Feedback" : "Please rate the session effectiveness first"}
          </Button>
        </div>
      </div>
    </div>
  );
};