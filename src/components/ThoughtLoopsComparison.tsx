import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Brain,
  TrendingDown,
  TrendingUp,
  Target,
  ChevronLeft,
  LayoutGrid,
  GitBranch
} from 'lucide-react';
import { motion } from 'motion/react';
import { ThoughtRecordEntry } from './ThoughtRecord';

interface ThoughtLoopsComparisonProps {
  entry: ThoughtRecordEntry;
  onBack: () => void;
  onClose?: () => void;
}

interface FlowNode {
  id: string;
  title: string;
  content: string;
  type: 'trigger' | 'thought' | 'emotion' | 'bias' | 'response' | 'action';
  value?: number;
  improvement?: number;
}

export const ThoughtLoopsComparison: React.FC<ThoughtLoopsComparisonProps> = ({ 
  entry, 
  onBack,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'flowchart' | 'cards' | 'circular'>('flowchart');

  // Generate flow nodes for actual (problematic) pattern
  const actualFlow: FlowNode[] = [
    {
      id: 'trigger',
      title: 'Trigger Event',
      content: entry.situation,
      type: 'trigger'
    },
    {
      id: 'automatic-thought',
      title: 'Automatic Thought',
      content: entry.automaticThought,
      type: 'thought',
      value: entry.initialBeliefPercentage
    },
    {
      id: 'emotion',
      title: 'Emotion',
      content: `${entry.emotion}`,
      type: 'emotion',
      value: entry.emotionIntensity
    },
    {
      id: 'bias',
      title: 'Thinking Errors',
      content: entry.cognitiveBiases.join(', '),
      type: 'bias'
    },
    {
      id: 'response',
      title: 'Usual Response',
      content: entry.impact?.maintaining || 'Continued rumination and distress',
      type: 'response'
    }
  ];

  // Generate flow nodes for balanced (healthy) pattern
  const balancedFlow: FlowNode[] = [
    {
      id: 'trigger',
      title: 'Same Trigger',
      content: entry.situation,
      type: 'trigger'
    },
    {
      id: 'balanced-thought',
      title: 'Balanced Thought',
      content: generateBalancedThought(),
      type: 'thought',
      value: entry.finalBeliefPercentage
    },
    {
      id: 'new-emotion',
      title: 'Adjusted Emotion',
      content: `${entry.emotion}`,
      type: 'emotion',
      value: entry.finalEmotionIntensity,
      improvement: entry.emotionIntensity - entry.finalEmotionIntensity
    },
    {
      id: 'awareness',
      title: 'Awareness',
      content: 'Recognition of thinking patterns',
      type: 'bias'
    },
    {
      id: 'action',
      title: 'Planned Action',
      content: entry.plannedActions.map(action => action.title).join('; ') || 
               entry.action?.plans?.map(plan => plan.title).join('; ') || 
               'Constructive action steps',
      type: 'action'
    }
  ];

  function generateBalancedThought(): string {
    // Combine insights from the suitable response questions
    const insights = [];
    
    if (entry.evidence?.opposing) {
      insights.push(entry.evidence.opposing);
    }
    
    if (entry.alternatives?.explanations && entry.alternatives.explanations.length > 0) {
      insights.push(entry.alternatives.explanations[0]);
    }
    
    if (entry.advice?.toOther) {
      insights.push(entry.advice.toOther);
    }
    
    if (entry.outcomes?.realistic) {
      insights.push(entry.outcomes.realistic);
    }

    // Return the most comprehensive insight or a default
    return insights.find(insight => insight.length > 50) || 
           insights[0] || 
           'A more balanced and realistic perspective on this situation';
  }

  const FlowNodeComponent: React.FC<{ 
    node: FlowNode; 
    type: 'actual' | 'balanced';
    index: number;
  }> = ({ node, type, index }) => {
    const isActual = type === 'actual';
    const baseColor = isActual ? 'from-red-50 to-orange-50' : 'from-green-50 to-blue-50';
    const borderColor = isActual ? 'border-red-200' : 'border-green-200';
    const iconColor = isActual ? 'text-red-600' : 'text-green-600';

    return (
      <motion.div
        initial={{ opacity: 0, x: isActual ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`relative p-4 rounded-xl border-2 ${borderColor} bg-gradient-to-br ${baseColor}`}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className={`font-medium text-sm ${iconColor}`}>{node.title}</h4>
          {node.type === 'thought' && (
            <Badge variant="outline" className={`text-xs ${iconColor}`}>
              {node.value}%
            </Badge>
          )}
          {node.type === 'emotion' && (
            <Badge variant="outline" className={`text-xs ${iconColor}`}>
              {node.value}/100
              {node.improvement && (
                <span className="ml-1 text-green-600">
                  ↓{node.improvement}
                </span>
              )}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-700 leading-tight">
          {node.content}
        </p>

        {/* Connector arrow - only show if not the last item */}
        {index < (isActual ? actualFlow.length - 1 : balancedFlow.length - 1) && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <ArrowRight className={`w-4 h-4 ${iconColor} rotate-90`} />
          </div>
        )}
      </motion.div>
    );
  };

  const renderFlowChart = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Actual Pattern */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-red-700">Automatic Pattern</h3>
        </div>
        
        <div className="space-y-8">
          {actualFlow.map((node, index) => (
            <FlowNodeComponent 
              key={node.id} 
              node={node} 
              type="actual" 
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Balanced Pattern */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-green-700">Balanced Pattern</h3>
        </div>
        
        <div className="space-y-8">
          {balancedFlow.map((node, index) => (
            <FlowNodeComponent 
              key={node.id} 
              node={node} 
              type="balanced" 
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-y-4">
      {/* Key Metrics Comparison */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Key Changes</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {entry.initialBeliefPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Initial Belief</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {entry.finalBeliefPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Final Belief</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {entry.emotionIntensity}
            </div>
            <div className="text-xs text-muted-foreground">Initial Emotion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {entry.finalEmotionIntensity}
            </div>
            <div className="text-xs text-muted-foreground">Final Emotion</div>
          </div>
        </div>
        
        {/* Improvement indicators */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <TrendingDown className="w-4 h-4" />
              <span>Belief reduced by {entry.initialBeliefPercentage - entry.finalBeliefPercentage}%</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingDown className="w-4 h-4" />
              <span>Emotion reduced by {entry.emotionIntensity - entry.finalEmotionIntensity} points</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Situation */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-blue-600" />
          <h4 className="font-medium text-blue-700">Trigger Situation</h4>
        </div>
        <p className="text-sm">{entry.situation}</p>
      </Card>

      {/* Thoughts Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h4 className="font-medium text-red-700">Automatic Thought</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">{entry.automaticThought}</p>
          <Badge variant="outline" className="text-red-600">
            Believed {entry.initialBeliefPercentage}%
          </Badge>
        </Card>

        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-green-700">Balanced Thought</h4>
          </div>
          <p className="text-sm text-green-800 mb-2">{generateBalancedThought()}</p>
          <Badge variant="outline" className="text-green-600">
            Believe {entry.finalBeliefPercentage}%
          </Badge>
        </Card>
      </div>

      {/* Cognitive Biases */}
      {entry.cognitiveBiases && entry.cognitiveBiases.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-purple-700">Thinking Patterns Identified</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.cognitiveBiases.map((bias) => (
              <Badge key={bias} variant="outline" className="text-purple-600">
                {bias}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Action Plan */}
      {(entry.plannedActions.length > 0 || entry.action?.plans) && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-blue-700">Next Steps</h4>
          </div>
          <div className="space-y-2">
            {entry.plannedActions.map((action, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">{action.title}</span>
              </div>
            ))}
            {entry.action?.plans?.map((plan, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">{plan.title}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Thought Loops Comparison</h1>
            <p className="text-sm text-muted-foreground">
              Your automatic vs balanced thinking patterns
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'flowchart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('flowchart')}
          >
            <GitBranch className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {entry.initialBeliefPercentage - entry.finalBeliefPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">Belief Reduction</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {entry.emotionIntensity - entry.finalEmotionIntensity}
            </div>
            <p className="text-xs text-muted-foreground">Emotion Decrease</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {entry.plannedActions.length + (entry.action?.plans?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Action Items</p>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="space-y-6">
        {viewMode === 'flowchart' ? renderFlowChart() : renderCards()}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => {
          // Generate calendar entry
          console.log('Save to calendar');
        }} className="flex-1">
          Save to Calendar
        </Button>
        <Button onClick={() => {
          if (onClose) {
            onClose();
          } else {
            onBack();
          }
        }} className="flex-1">
          ✓ Done
        </Button>
      </div>
    </div>
  );
};