import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { 
  Brain, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mic,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ThoughtRecordEntry {
  id: string;
  timestamp: Date;
  
  // Section A: Monitoring (First 4 columns)
  situation: string; // Required
  automaticThought: string; // Required
  initialBeliefPercentage: number; // 0-100%
  emotion: string; // Required
  emotionIntensity: number; // 0-100
  cognitiveBiases: string[]; // Can be multiple
  
  // Section B: Suitable Response (6 questions)
  evidence?: {
    supporting: string;
    opposing: string;
    beliefAfter: number;
  };
  alternatives?: {
    explanations: string[];
    beliefAfter: number;
  };
  outcomes?: {
    worst: string;
    best: string;
    realistic: string;
    beliefAfter: number;
  };
  impact?: {
    maintaining: string;
    adjusting: string;
    beliefAfter: number;
  };
  advice?: {
    toOther: string;
    beliefAfter: number;
  };
  action?: {
    plans: Array<{
      title: string;
      deadline?: Date;
      reminder?: Date;
    }>;
    beliefAfter: number;
  };
  
  // Section C: Conclusion
  finalBeliefPercentage: number;
  finalEmotionIntensity: number;
  plannedActions: Array<{
    title: string;
    deadline?: Date;
    reminder?: Date;
    completed?: boolean;
  }>;
  
  completed: boolean;
  sleepRelated: boolean;
  category?: string;
}

interface ThoughtRecordProps {
  onCompleted: (entry: ThoughtRecordEntry) => void;
  onCancel: () => void;
  initialData?: Partial<ThoughtRecordEntry>;
  mode?: 'full' | 'evening' | 'bedtime';
}

const cognitiveBiases = [
  'Catastrophizing',
  'All-or-Nothing',
  'Mind Reading', 
  'Fortune Telling',
  'Emotional Reasoning',
  'Should Statements',
  'Labeling',
  'Personalization',
  'Mental Filter',
  'Overgeneralization'
];

export const ThoughtRecord: React.FC<ThoughtRecordProps> = ({ 
  onCompleted, 
  onCancel, 
  initialData,
  mode = 'full'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [entry, setEntry] = useState<Partial<ThoughtRecordEntry>>({
    timestamp: new Date(),
    completed: false,
    sleepRelated: mode === 'bedtime',
    initialBeliefPercentage: 50,
    emotionIntensity: 50,
    finalBeliefPercentage: 50,
    finalEmotionIntensity: 50,
    cognitiveBiases: [],
    plannedActions: [],
    ...initialData
  });
  
  const [showBeliefRating, setShowBeliefRating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isVoiceInput, setIsVoiceInput] = useState(false);

  const totalSteps = mode === 'evening' ? 6 : mode === 'bedtime' ? 5 : 10;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the thought record
      const completedEntry: ThoughtRecordEntry = {
        ...entry as ThoughtRecordEntry,
        id: Date.now().toString(),
        completed: true,
        finalBeliefPercentage: entry.action?.beliefAfter || entry.finalBeliefPercentage || 50
      };
      onCompleted(completedEntry);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const updateEntry = (updates: Partial<ThoughtRecordEntry>) => {
    setEntry(prev => ({ ...prev, ...updates }));
  };

  const triggerBeliefRating = (question: string, currentBelief: number) => {
    setCurrentQuestion(question);
    setShowBeliefRating(true);
  };

  const handleBeliefUpdate = (newBelief: number) => {
    // Update the belief for the current question context
    const updates: any = {};
    
    if (currentQuestion.includes('evidence')) {
      updates.evidence = { ...entry.evidence, beliefAfter: newBelief };
    } else if (currentQuestion.includes('alternatives')) {
      updates.alternatives = { ...entry.alternatives, beliefAfter: newBelief };
    } else if (currentQuestion.includes('outcomes')) {
      updates.outcomes = { ...entry.outcomes, beliefAfter: newBelief };
    } else if (currentQuestion.includes('impact')) {
      updates.impact = { ...entry.impact, beliefAfter: newBelief };
    } else if (currentQuestion.includes('advice')) {
      updates.advice = { ...entry.advice, beliefAfter: newBelief };
    } else if (currentQuestion.includes('action')) {
      updates.action = { ...entry.action, beliefAfter: newBelief };
    }
    
    updateEntry(updates);
    setShowBeliefRating(false);
  };

  const renderStepContent = () => {
    if (mode === 'evening') {
      return renderEveningSteps();
    } else if (mode === 'bedtime') {
      return renderBedtimeSteps();
    } else {
      return renderFullSteps();
    }
  };

  const renderEveningSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3>What's bothering you right now?</h3>
            <Textarea
              placeholder="Describe what's on your mind..."
              value={entry.situation || ''}
              onChange={(e) => updateEntry({ situation: e.target.value })}
              className="min-h-20"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3>What thought keeps coming up?</h3>
            <Textarea
              placeholder="What are you telling yourself about this?"
              value={entry.automaticThought || ''}
              onChange={(e) => updateEntry({ automaticThought: e.target.value })}
              className="min-h-20"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3>How are you feeling about this?</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {['Anxious', 'Angry', 'Sad', 'Frustrated', 'Overwhelmed', 'Worried'].map((emotion) => (
                <Button
                  key={emotion}
                  variant={entry.emotion === emotion ? 'default' : 'outline'}
                  onClick={() => updateEntry({ emotion })}
                  size="sm"
                >
                  {emotion}
                </Button>
              ))}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">How intense is this feeling?</p>
              <Slider
                value={[entry.emotionIntensity || 50]}
                onValueChange={([value]) => updateEntry({ emotionIntensity: value })}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="text-center mt-2">
                <span className="text-xl font-semibold text-primary">{entry.emotionIntensity || 50}/100</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3>What would you tell a good friend?</h3>
            <p className="text-sm text-muted-foreground">
              If your best friend had this exact problem, what would you say to them?
            </p>
            <Textarea
              placeholder="I would tell them..."
              value={entry.advice?.toOther || ''}
              onChange={(e) => updateEntry({ 
                advice: { ...entry.advice, toOther: e.target.value, beliefAfter: entry.advice?.beliefAfter || 50 }
              })}
              className="min-h-20"
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3>How do you feel now?</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  How intense is the feeling now?
                </p>
                <Slider
                  value={[entry.finalEmotionIntensity || 50]}
                  onValueChange={([value]) => updateEntry({ finalEmotionIntensity: value })}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="text-center mt-2">
                  <span className="text-xl font-semibold text-green-600">{entry.finalEmotionIntensity || 50}/100</span>
                  {entry.emotionIntensity && entry.finalEmotionIntensity && entry.finalEmotionIntensity < entry.emotionIntensity && (
                    <p className="text-xs text-green-600 mt-1">
                      ↓ {entry.emotionIntensity - entry.finalEmotionIntensity} points better!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3>One small step</h3>
            <p className="text-sm text-muted-foreground">
              What's one small thing you can do about this?
            </p>
            <Textarea
              placeholder="Tomorrow I will..."
              value={entry.plannedActions?.[0]?.title || ''}
              onChange={(e) => {
                const actions = [...(entry.plannedActions || [])];
                actions[0] = { ...actions[0], title: e.target.value };
                updateEntry({ plannedActions: actions });
              }}
              className="min-h-16"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderBedtimeSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3>What's your main worry about falling asleep?</h3>
            <Textarea
              placeholder="E.g., I won't fall asleep and tomorrow will be ruined..."
              value={entry.automaticThought || ''}
              onChange={(e) => updateEntry({ automaticThought: e.target.value })}
              className="min-h-20"
            />
            <div>
              <p className="text-sm text-muted-foreground mb-2">How much do you believe this? (0-100%)</p>
              <Slider
                value={[entry.initialBeliefPercentage || 50]}
                onValueChange={([value]) => updateEntry({ initialBeliefPercentage: value })}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-center mt-2">
                <span className="text-xl font-semibold text-primary">{entry.initialBeliefPercentage || 50}%</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3>What would be a more helpful thought for sleep?</h3>
            <Textarea
              placeholder="E.g., Even if I don't sleep perfectly, I can rest and function tomorrow..."
              value={entry.advice?.toOther || ''}
              onChange={(e) => updateEntry({ 
                advice: { ...entry.advice, toOther: e.target.value, beliefAfter: entry.advice?.beliefAfter || 50 }
              })}
              className="min-h-20"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3>How much do you believe the worry now?</h3>
            <Slider
              value={[entry.finalBeliefPercentage || 50]}
              onValueChange={([value]) => updateEntry({ finalBeliefPercentage: value })}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-2xl font-semibold text-green-600">{entry.finalBeliefPercentage || 50}%</span>
              {entry.initialBeliefPercentage && entry.finalBeliefPercentage && entry.finalBeliefPercentage < entry.initialBeliefPercentage && (
                <p className="text-sm text-green-600 mt-1">
                  ↓ {entry.initialBeliefPercentage - entry.finalBeliefPercentage}% decrease
                </p>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 text-center">
            <h3>Let's prepare for sleep</h3>
            <p className="text-muted-foreground">
              We'll do a brief 2-3 minute breathing exercise and body scan to help you relax
            </p>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 text-center">
            <h3>Sleep well!</h3>
            <p className="text-muted-foreground">
              Your thought record has been saved. Remember your balanced thought if the worry returns.
            </p>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm italic">
                "{entry.advice?.toOther || 'Rest is valuable even if sleep isn\'t perfect.'}"
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFullSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3>What happened? (Situation/Event)</h3>
            <p className="text-sm text-muted-foreground">
              Describe what happened, where, when, and with whom
            </p>
            <Textarea
              placeholder="E.g., On the way to the library at 7:30 yesterday"
              value={entry.situation || ''}
              onChange={(e) => updateEntry({ situation: e.target.value })}
              className="min-h-20"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3>What was your automatic thought?</h3>
            <p className="text-sm text-muted-foreground">
              What was your first reaction? What went through your mind?
            </p>
            <Textarea
              placeholder="E.g., If I fail this exam, what will happen?"
              value={entry.automaticThought || ''}
              onChange={(e) => updateEntry({ automaticThought: e.target.value })}
              className="min-h-20"
            />
            <div>
              <p className="text-sm text-muted-foreground mb-2">How much do you believe this? (0-100%)</p>
              <Slider
                value={[entry.initialBeliefPercentage || 50]}
                onValueChange={([value]) => updateEntry({ initialBeliefPercentage: value })}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-center mt-2">
                <span className="text-xl font-semibold text-primary">{entry.initialBeliefPercentage || 50}%</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3>Emotion and Intensity</h3>
            <p className="text-sm text-muted-foreground">
              What emotion did you feel and how intense was it?
            </p>
            <Textarea
              placeholder="E.g., Anxiety, frustration, sadness..."
              value={entry.emotion || ''}
              onChange={(e) => updateEntry({ emotion: e.target.value })}
              className="min-h-16"
            />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Intensity (0-100)</p>
              <Slider
                value={[entry.emotionIntensity || 50]}
                onValueChange={([value]) => updateEntry({ emotionIntensity: value })}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-center mt-2">
                <span className="text-xl font-semibold text-primary">{entry.emotionIntensity || 50}/100</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3>Cognitive Biases</h3>
            <p className="text-sm text-muted-foreground">
              What thinking traps might be involved? (Select all that apply)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {cognitiveBiases.map((bias) => (
                <div key={bias} className="flex items-center space-x-2">
                  <Checkbox
                    id={bias}
                    checked={entry.cognitiveBiases?.includes(bias)}
                    onCheckedChange={(checked) => {
                      const biases = entry.cognitiveBiases || [];
                      if (checked) {
                        updateEntry({ cognitiveBiases: [...biases, bias] });
                      } else {
                        updateEntry({ cognitiveBiases: biases.filter(b => b !== bias) });
                      }
                    }}
                  />
                  <label htmlFor={bias} className="text-sm">{bias}</label>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3>Q1: Evidence</h3>
            <p className="text-sm text-muted-foreground">
              What evidence supports your automatic thought? What evidence goes against it?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-green-700">Supporting Evidence</label>
                <Textarea
                  placeholder="Evidence that supports this thought..."
                  value={entry.evidence?.supporting || ''}
                  onChange={(e) => updateEntry({ 
                    evidence: { ...entry.evidence, supporting: e.target.value, beliefAfter: entry.evidence?.beliefAfter || 50 }
                  })}
                  className="min-h-20 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-red-700">Opposing Evidence</label>
                <Textarea
                  placeholder="Evidence against this thought..."
                  value={entry.evidence?.opposing || ''}
                  onChange={(e) => updateEntry({ 
                    evidence: { ...entry.evidence, opposing: e.target.value, beliefAfter: entry.evidence?.beliefAfter || 50 }
                  })}
                  className="min-h-20 mt-1"
                />
              </div>
            </div>
            <Button
              onClick={() => triggerBeliefRating('evidence', entry.evidence?.beliefAfter || entry.initialBeliefPercentage || 50)}
              className="w-full"
            >
              Update Belief Level
            </Button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3>Q2: Alternative Explanations</h3>
            <p className="text-sm text-muted-foreground">
              What are other possible explanations for this situation?
            </p>
            <Textarea
              placeholder="List other ways to interpret what happened..."
              value={entry.alternatives?.explanations?.join('\n') || ''}
              onChange={(e) => updateEntry({ 
                alternatives: { 
                  ...entry.alternatives, 
                  explanations: e.target.value.split('\n').filter(exp => exp.trim()),
                  beliefAfter: entry.alternatives?.beliefAfter || 50
                }
              })}
              className="min-h-24"
            />
            <Button
              onClick={() => triggerBeliefRating('alternatives', entry.alternatives?.beliefAfter || entry.initialBeliefPercentage || 50)}
              className="w-full"
            >
              Update Belief Level
            </Button>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>Q3: Outcome Range</h3>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip (Optional)
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              What's the worst that could happen? The best? The most realistic?
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-red-600">Worst Case</label>
                <Textarea
                  placeholder="What's the worst that could happen?"
                  value={entry.outcomes?.worst || ''}
                  onChange={(e) => updateEntry({ 
                    outcomes: { ...entry.outcomes, worst: e.target.value, beliefAfter: entry.outcomes?.beliefAfter || 50 }
                  })}
                  className="min-h-16 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-green-600">Best Case</label>
                <Textarea
                  placeholder="What's the best outcome?"
                  value={entry.outcomes?.best || ''}
                  onChange={(e) => updateEntry({ 
                    outcomes: { ...entry.outcomes, best: e.target.value, beliefAfter: entry.outcomes?.beliefAfter || 50 }
                  })}
                  className="min-h-16 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-blue-600">Most Realistic</label>
                <Textarea
                  placeholder="What's most likely to happen?"
                  value={entry.outcomes?.realistic || ''}
                  onChange={(e) => updateEntry({ 
                    outcomes: { ...entry.outcomes, realistic: e.target.value, beliefAfter: entry.outcomes?.beliefAfter || 50 }
                  })}
                  className="min-h-16 mt-1"
                />
              </div>
            </div>
            <Button
              onClick={() => triggerBeliefRating('outcomes', entry.outcomes?.beliefAfter || entry.initialBeliefPercentage || 50)}
              className="w-full"
            >
              Update Belief Level
            </Button>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <h3>Q4: Impact Comparison</h3>
            <p className="text-sm text-muted-foreground">
              What are the effects of continuing vs. changing this thinking?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-orange-600">If I Keep Thinking This Way</label>
                <Textarea
                  placeholder="Effects of maintaining this thought..."
                  value={entry.impact?.maintaining || ''}
                  onChange={(e) => updateEntry({ 
                    impact: { ...entry.impact, maintaining: e.target.value, beliefAfter: entry.impact?.beliefAfter || 50 }
                  })}
                  className="min-h-20 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-green-600">If I Adjust My Thinking</label>
                <Textarea
                  placeholder="Effects of changing this thought..."
                  value={entry.impact?.adjusting || ''}
                  onChange={(e) => updateEntry({ 
                    impact: { ...entry.impact, adjusting: e.target.value, beliefAfter: entry.impact?.beliefAfter || 50 }
                  })}
                  className="min-h-20 mt-1"
                />
              </div>
            </div>
            <Button
              onClick={() => triggerBeliefRating('impact', entry.impact?.beliefAfter || entry.initialBeliefPercentage || 50)}
              className="w-full"
            >
              Update Belief Level
            </Button>
          </div>
        );
      case 9:
        return (
          <div className="space-y-4">
            <h3>Q5: Advice to a Friend</h3>
            <p className="text-sm text-muted-foreground">
              If someone you care about was in this situation, what would you tell them?
            </p>
            <Textarea
              placeholder="What advice would you give to a good friend?"
              value={entry.advice?.toOther || ''}
              onChange={(e) => updateEntry({ 
                advice: { ...entry.advice, toOther: e.target.value, beliefAfter: entry.advice?.beliefAfter || 50 }
              })}
              className="min-h-20"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const suggestion = "You would probably tell them to be kind to themselves and that one situation doesn't define everything.";
                updateEntry({ 
                  advice: { ...entry.advice, toOther: suggestion, beliefAfter: entry.advice?.beliefAfter || 50 }
                });
              }}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Generate Suggestion
            </Button>
            <Button
              onClick={() => triggerBeliefRating('advice', entry.advice?.beliefAfter || entry.initialBeliefPercentage || 50)}
              className="w-full mt-4"
            >
              Update Belief Level
            </Button>
          </div>
        );
      case 10:
        return (
          <div className="space-y-4">
            <h3>Q6: Action Plan</h3>
            <p className="text-sm text-muted-foreground">
              What's the smallest next step you can take? (1-2 specific actions)
            </p>
            <div className="space-y-3">
              <div>
                <Textarea
                  placeholder="E.g., Contact teaching assistant tomorrow at 9 AM"
                  value={entry.action?.plans?.[0]?.title || ''}
                  onChange={(e) => {
                    const plans = [...(entry.action?.plans || [])];
                    plans[0] = { ...plans[0], title: e.target.value };
                    updateEntry({ 
                      action: { ...entry.action, plans, beliefAfter: entry.action?.beliefAfter || 50 }
                    });
                  }}
                  className="min-h-16"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Second action (optional)"
                  value={entry.action?.plans?.[1]?.title || ''}
                  onChange={(e) => {
                    const plans = [...(entry.action?.plans || [])];
                    if (e.target.value) {
                      plans[1] = { ...plans[1], title: e.target.value };
                    } else {
                      plans.splice(1, 1);
                    }
                    updateEntry({ 
                      action: { ...entry.action, plans, beliefAfter: entry.action?.beliefAfter || 50 }
                    });
                  }}
                  className="min-h-16"
                />
              </div>
            </div>
            <Button
              onClick={() => triggerBeliefRating('action', entry.action?.beliefAfter || entry.initialBeliefPercentage || 50)}
              className="w-full"
            >
              Complete & Update Final Belief
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return entry.situation?.trim();
      case 2:
        return entry.automaticThought?.trim();
      case 3:
        return entry.emotion?.trim();
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {mode === 'evening' ? 'Evening Review' : mode === 'bedtime' ? 'Bedtime CBT-I' : 'Thought Record'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>
        <Badge variant="outline">
          {mode === 'evening' ? '5 min' : mode === 'bedtime' ? '3 min' : '10-15 min'}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Content */}
      <div className="space-y-6">
        <Card className="p-6">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {currentStep === totalSteps ? 'Complete' : 'Next'}
            {currentStep < totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Belief Rating Modal */}
      <AnimatePresence>
        {showBeliefRating && (
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
                <h3 className="text-lg font-semibold">Update Belief Level</h3>
                <p className="text-sm text-muted-foreground">
                  How much do you believe your original automatic thought now?
                </p>
                
                <div className="space-y-4">
                  <Slider
                    value={[entry.finalBeliefPercentage || 50]}
                    onValueChange={([value]) => updateEntry({ finalBeliefPercentage: value })}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-2xl font-semibold text-primary">
                      {entry.finalBeliefPercentage || 50}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBeliefRating(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleBeliefUpdate(entry.finalBeliefPercentage || 50)}
                    className="flex-1"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};