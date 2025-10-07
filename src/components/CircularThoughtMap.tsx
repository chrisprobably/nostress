import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Brain, 
  Heart, 
  Lightbulb, 
  Target, 
  ArrowRight,
  Volume2,
  AlertCircle,
  CheckCircle,
  Keyboard,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ThoughtNode {
  id: string;
  text: string;
  type: 'trigger' | 'automatic' | 'emotion' | 'physical' | 'behavior' | 'alternative' | 'action';
  angle: number;
  radius: number;
  confidence: number;
  connections: string[];
}

interface VoiceAnalysis {
  transcript: string;
  emotions: string[];
  thoughts: string[];
  physicalSensations: string[];
  behaviors: string[];
  suggestions: string[];
}

interface CBTAnalysis {
  // Step 1: Situation/Trigger
  situation: string;
  
  // Step 2: Automatic Thought
  automaticThought: string;
  initialBeliefPercentage: number;
  
  // Step 3: Emotion
  emotion: string;
  emotionIntensity: number;
  
  // Step 4: Thinking Error/Cognitive Distortion
  cognitiveDistortions: string[];
  
  // Step 5: Evaluate/Challenge Thought
  challengeEvidence: string;
  
  // Step 6: Balanced Thought
  balancedThought: string;
  
  // Step 7: Re-rate Emotion & Belief
  finalBeliefPercentage: number;
  finalEmotionIntensity: number;
  
  // Step 8: Behavioral Plan/Experiment
  actionPlans: Array<{
    action: string;
    timeline: string;
    completed?: boolean;
  }>;
  
  // Step 9: Conclusion/Reflection
  beliefChange: number;
  emotionChange: number;
  reflection: string;
}

interface CircularThoughtMapProps {
  onCompleted: (analysis: VoiceAnalysis & { nodes: ThoughtNode[]; cbtAnalysis?: CBTAnalysis }) => void;
  onCancel: () => void;
}

export const CircularThoughtMap: React.FC<CircularThoughtMapProps> = ({ 
  onCompleted, 
  onCancel 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [nodes, setNodes] = useState<ThoughtNode[]>([]);
  const [currentStep, setCurrentStep] = useState<'voice' | 'processing' | 'visualization' | 'cbt-analysis' | 'completed'>('voice');
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [showTextInput, setShowTextInput] = useState(false);
  const [hasAudioSupport, setHasAudioSupport] = useState(false);
  const [cbtAnalysis, setCbtAnalysis] = useState<CBTAnalysis>({
    situation: '',
    automaticThought: '',
    initialBeliefPercentage: 75,
    emotion: '',
    emotionIntensity: 70,
    cognitiveDistortions: [],
    challengeEvidence: '',
    balancedThought: '',
    finalBeliefPercentage: 75,
    finalEmotionIntensity: 70,
    actionPlans: [],
    beliefChange: 0,
    emotionChange: 0,
    reflection: ''
  });
  const [cbtStep, setCbtStep] = useState(1);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check for audio and speech recognition support
  useEffect(() => {
    const checkAudioSupport = async () => {
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      
      setHasAudioSupport(hasMediaDevices && hasSpeechRecognition);
      
      if (hasSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + ' ' + finalTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          if (transcript.trim()) {
            processTranscript();
          }
        };
      }
    };

    checkAudioSupport();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionStatus(permission.state);
      return permission.state === 'granted';
    } catch (error) {
      setPermissionStatus('unknown');
      return false;
    }
  };

  const startRecording = async () => {
    if (!hasAudioSupport) {
      setShowTextInput(true);
      return;
    }

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      setShowTextInput(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      updateAudioLevel();

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setTranscript('');
      setPermissionStatus('granted');
    } catch (error: any) {
      // Expected when microphone permission is denied
      setPermissionStatus('denied');
      setShowTextInput(true);
    }
  };

  const updateAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
  };

  const processTranscript = () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    setCurrentStep('processing');
    
    // Simulate processing time
    setTimeout(() => {
      const analysis = analyzeTranscript(transcript);
      const generatedNodes = generateNodesFromAnalysis(analysis);
      setNodes(generatedNodes);
      setIsProcessing(false);
      setCurrentStep('visualization');
    }, 2000);
  };

  const analyzeTranscript = (text: string): VoiceAnalysis => {
    // Simple analysis - in a real app, this would use NLP/AI
    const emotions = extractEmotions(text);
    const thoughts = [extractAutomaticThought(text)];
    const physicalSensations = [extractPhysicalSensation(text)];
    const behaviors = [extractBehavior(text)];
    const suggestions = generateSuggestions(emotions, thoughts);

    return {
      transcript: text,
      emotions,
      thoughts,
      physicalSensations,
      behaviors,
      suggestions
    };
  };

  const extractEmotions = (text: string): string[] => {
    const emotionWords = {
      'anxiety': ['anxious', 'worried', 'nervous', 'scared', 'fearful', 'panicked'],
      'sadness': ['sad', 'depressed', 'down', 'miserable', 'grief', 'disappointed'],
      'anger': ['angry', 'furious', 'irritated', 'frustrated', 'mad', 'rage'],
      'stress': ['stressed', 'overwhelmed', 'pressure', 'burden', 'exhausted'],
      'confusion': ['confused', 'lost', 'uncertain', 'unclear', 'mixed up']
    };

    const detectedEmotions: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [emotion, keywords] of Object.entries(emotionWords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detectedEmotions.push(emotion);
      }
    }

    return detectedEmotions.length > 0 ? detectedEmotions : ['anxiety'];
  };

  const extractAutomaticThought = (transcript: string): string => {
    const lowerText = transcript.toLowerCase();
    
    // Look for thought patterns
    const thoughtMarkers = [
      'i think', 'i believe', 'i feel like', 'what if', 'i worry',
      'i\'m sure', 'i know', 'probably', 'definitely'
    ];
    
    for (const marker of thoughtMarkers) {
      const index = lowerText.indexOf(marker);
      if (index !== -1) {
        const sentence = transcript.substring(index).split(/[.!?]/)[0];
        if (sentence.length < 60) return sentence;
        return sentence.substring(0, 57) + '...';
      }
    }
    
    return 'Negative prediction or interpretation';
  };

  const extractPhysicalSensation = (transcript: string): string => {
    const lowerText = transcript.toLowerCase();
    const physicalTerms = [
      'heart racing', 'sweating', 'shaking', 'tense', 'tight chest',
      'headache', 'stomach', 'nausea', 'dizziness', 'tired', 'exhausted'
    ];
    
    for (const term of physicalTerms) {
      if (lowerText.includes(term)) {
        return term.charAt(0).toUpperCase() + term.slice(1);
      }
    }
    
    return 'Physical tension';
  };

  const extractBehavior = (transcript: string): string => {
    const lowerText = transcript.toLowerCase();
    const behaviorTerms = [
      'avoiding', 'procrastinating', 'checking', 'scrolling',
      'pacing', 'calling', 'texting', 'staying in bed', 'isolating'
    ];
    
    for (const term of behaviorTerms) {
      if (lowerText.includes(term)) {
        return term.charAt(0).toUpperCase() + term.slice(1);
      }
    }
    
    return 'Avoidance or reactive behavior';
  };

  const generateSuggestions = (emotions: string[], thoughts: string[]): string[] => {
    const suggestions = [
      'Practice breathing exercises',
      'Challenge negative thoughts',
      'Take a short walk',
      'Talk to someone you trust',
      'Practice mindfulness'
    ];
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
  };

  const generateActionStep = (analysis: VoiceAnalysis): string => {
    const actionSteps = [
      'Take three deep breaths',
      'Break task into smaller steps', 
      'Seek support or guidance',
      'Challenge the thought',
      'Focus on what you can control',
      'Practice self-compassion'
    ];
    
    // Return a relevant action based on the content
    if (analysis.transcript.toLowerCase().includes('work') || analysis.transcript.toLowerCase().includes('deadline')) {
      return 'Break task into smaller steps';
    }
    if (analysis.emotions.includes('anxiety') || analysis.emotions.includes('fear')) {
      return 'Take three deep breaths';
    }
    
    return actionSteps[0];
  };

  const getNodeColor = (type: string) => {
    const colors = {
      trigger: 'from-amber-400 to-orange-500',     // A - Warm start
      automatic: 'from-red-400 to-red-600',       // B - Alert/concerning
      emotion: 'from-purple-400 to-purple-600',   // C - Emotional
      physical: 'from-pink-400 to-pink-600',      // D - Body response
      behavior: 'from-orange-400 to-orange-600',  // E - Action response
      alternative: 'from-emerald-400 to-green-500', // F - Hope/growth
      action: 'from-blue-400 to-blue-600'         // G - New direction
    };
    return colors[type as keyof typeof colors] || 'from-gray-400 to-gray-500';
  };

  const getNodeIcon = (type: string) => {
    const icons = {
      trigger: Target,      // A - Situation
      automatic: Brain,     // B - Thought
      emotion: Heart,       // C - Feeling  
      physical: Heart,      // D - Body
      behavior: ArrowRight, // E - Action
      alternative: Lightbulb, // F - New perspective
      action: Target        // G - New choice
    };
    const IconComponent = icons[type as keyof typeof icons] || Brain;
    return <IconComponent className="w-4 h-4" />;
  };

  const getNodeLabel = (nodeId: string) => {
    const labels = {
      'A-trigger': 'A',
      'B-automatic': 'B', 
      'C-emotion': 'C',
      'D-physical': 'D',
      'E-behavior': 'E',
      'F-alternative': 'F',
      'G-action': 'G'
    };
    return labels[nodeId as keyof typeof labels] || '';
  };

  const handleComplete = () => {
    const analysis = analyzeTranscript(transcript);
    onCompleted({ ...analysis, nodes, cbtAnalysis: cbtAnalysis as CBTAnalysis });
  };

  const extractSituation = (text: string): string => {
    // Simple extraction - look for context clues
    const situationKeywords = ['when', 'where', 'during', 'while', 'at', 'in', '当', '在', '的时候', '期间'];
    const sentences = text.split(/[。.！!？?]/).filter(s => s.trim());
    
    for (const sentence of sentences) {
      if (situationKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence.trim();
      }
    }
    
    return sentences[0]?.trim() || text.substring(0, 100);
  };

  const initializeCBTAnalysis = () => {
    const situation = extractSituation(transcript);
    const automaticThought = extractAutomaticThought(transcript);
    
    setCbtAnalysis({
      situation,
      automaticThought,
      initialBeliefPercentage: 75,
      emotion: analyzeTranscript(transcript).emotions[0] || 'anxiety',
      emotionIntensity: 70,
      cognitiveDistortions: [],
      challengeEvidence: '',
      balancedThought: '',
      finalBeliefPercentage: 75,
      finalEmotionIntensity: 70,
      actionPlans: [],
      beliefChange: 0,
      emotionChange: 0,
      reflection: ''
    });
    
    setCurrentStep('cbt-analysis');
    setCbtStep(1);
  };

  const handleCBTNext = () => {
    if (cbtStep < 9) {
      setCbtStep(cbtStep + 1);
    } else {
      // Calculate changes for reflection
      const beliefChange = (cbtAnalysis.initialBeliefPercentage || 75) - (cbtAnalysis.finalBeliefPercentage || 75);
      const emotionChange = (cbtAnalysis.emotionIntensity || 70) - (cbtAnalysis.finalEmotionIntensity || 70);
      
      updateCBTAnalysis({ 
        beliefChange, 
        emotionChange 
      });
      
      handleComplete();
    }
  };

  const handleCBTBack = () => {
    if (cbtStep > 1) {
      setCbtStep(cbtStep - 1);
    } else {
      setCurrentStep('visualization');
    }
  };

  const updateCBTAnalysis = (updates: Partial<CBTAnalysis>) => {
    setCbtAnalysis(prev => ({ ...prev, ...updates }));
  };

  const generateNodesFromAnalysis = (analysis: VoiceAnalysis): ThoughtNode[] => {
    const baseRadius = 80;
    const nodes: ThoughtNode[] = [];

    // A - Trigger/Situation (extracted from context)
    nodes.push({
      id: 'A-trigger',
      text: extractSituation(analysis.transcript),
      type: 'trigger',
      angle: 0,
      radius: baseRadius,
      confidence: 85,
      connections: ['B-automatic']
    });

    // B - Automatic Thought
    nodes.push({
      id: 'B-automatic',
      text: analysis.thoughts[0] || 'Automatic negative thought',
      type: 'automatic',
      angle: 60,
      radius: baseRadius,
      confidence: 90,
      connections: ['C-emotion', 'D-physical', 'E-behavior']
    });

    // C - Emotion
    nodes.push({
      id: 'C-emotion',
      text: analysis.emotions[0] || 'Anxiety',
      type: 'emotion',
      angle: 120,
      radius: baseRadius,
      confidence: 95,
      connections: ['D-physical', 'E-behavior']
    });

    // D - Physical Sensation
    nodes.push({
      id: 'D-physical',
      text: analysis.physicalSensations[0] || 'Physical tension',
      type: 'physical',
      angle: 180,
      radius: baseRadius,
      confidence: 80,
      connections: ['E-behavior']
    });

    // E - Behavior
    nodes.push({
      id: 'E-behavior',
      text: analysis.behaviors[0] || 'Avoidance behavior',
      type: 'behavior',
      angle: 240,
      radius: baseRadius,
      confidence: 85,
      connections: ['A-trigger'] // Completes the cycle back to trigger
    });

    // F - Alternative Thought
    nodes.push({
      id: 'F-alternative',
      text: 'More balanced perspective',
      type: 'alternative',
      angle: 300,
      radius: baseRadius + 20,
      confidence: 70,
      connections: ['G-action']
    });

    // G - Action Step
    nodes.push({
      id: 'G-action',
      text: generateActionStep(analysis),
      type: 'action',
      angle: 360,
      radius: baseRadius + 20,
      confidence: 75,
      connections: []
    });

    return nodes;
  };

  // Common cognitive distortions in Chinese context
  const cognitiveDistortions = [
    { id: 'catastrophizing', name: 'Catastrophizing', description: '灾难化 - 把小问题想象成巨大灾难' },
    { id: 'all-or-nothing', name: 'All-or-Nothing', description: '全有全无 - 非黑即白的极端思维' },
    { id: 'mind-reading', name: 'Mind Reading', description: '读心术 - 认为自己知道别人在想什么' },
    { id: 'fortune-telling', name: 'Fortune Telling', description: '预言未来 - 消极预测未来结果' },
    { id: 'overgeneralization', name: 'Overgeneralization', description: '过度概化 - 从单一事件得出普遍结论' },
    { id: 'should-statements', name: 'Should Statements', description: '"应该"思维 - 用"应该"对自己或他人施压' },
    { id: 'emotional-reasoning', name: 'Emotional Reasoning', description: '情绪推理 - 以情绪为事实依据' },
    { id: 'labeling', name: 'Labeling', description: '贴标签 - 给自己或他人贴负面标签' },
    { id: 'personalization', name: 'Personalization', description: '个人化 - 认为所有问题都是自己的错' },
    { id: 'mental-filter', name: 'Mental Filter', description: '心理过滤 - 只关注负面细节' }
  ];

  if (currentStep === 'voice') {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
        <Card className="w-full p-8 text-center space-y-6">
          {/* Permission denied or text input mode */}
          {(showTextInput || permissionStatus === 'denied') ? (
            <div className="space-y-4">
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Keyboard className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <h2 className="mb-2">Text Thought Analysis</h2>
                <p className="text-muted-foreground">
                  {permissionStatus === 'denied' 
                    ? "Voice not available. Type what's on your mind instead:"
                    : "Describe what's bothering you or any thoughts you're having:"
                  }
                </p>
              </div>

              {permissionStatus === 'denied' && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Microphone access was denied. You can still use text input.</span>
                </div>
              )}

              <Textarea
                placeholder="I feel overwhelmed and stressed about work deadlines. My mind keeps racing with thoughts about failure..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-32 text-left"
                autoFocus
              />

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    if (transcript.trim()) {
                      processTranscript();
                    }
                  }}
                  disabled={!transcript.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Analyze Thoughts
                </Button>

                {!transcript.trim() && (
                  <Button
                    onClick={() => {
                      setTranscript('I feel really overwhelmed and stressed about work deadlines. My mind keeps racing with thoughts about failure and disappointment. I can\'t seem to focus and everything feels impossible. I\'m worried that if I don\'t finish this project on time, my boss will think I\'m incompetent and I might lose my job.');
                    }}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Try Demo Text
                  </Button>
                )}

                {hasAudioSupport && permissionStatus !== 'denied' && (
                  <Button
                    onClick={() => setShowTextInput(false)}
                    variant="outline"
                    className="w-full"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Try Voice Instead
                  </Button>
                )}

                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* Voice recording mode */
            <div className="space-y-6">
              <motion.div 
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-400 to-red-600' 
                    : 'bg-gradient-to-br from-emerald-400 to-blue-500'
                }`}
                animate={{ 
                  scale: isRecording ? [1, 1.1, 1] : 1,
                  rotate: isRecording ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: isRecording ? 2 : 0.3,
                  repeat: isRecording ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </motion.div>

              <div>
                <h2 className="mb-2">Voice Thought Analysis</h2>
                <p className="text-muted-foreground">
                  {isRecording 
                    ? "Listening... Share what's on your mind freely"
                    : "Tap to start recording and describe your thoughts or feelings"
                  }
                </p>
              </div>

              {isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-red-500 rounded-full"
                        animate={{
                          height: [4, 8 + (audioLevel / 20), 4],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recording in progress...
                  </p>
                </div>
              )}

              {transcript && (
                <div className="p-3 bg-muted/30 rounded-lg text-sm text-left">
                  <p className="font-medium mb-1">Transcript:</p>
                  <p className="text-muted-foreground">{transcript}</p>
                </div>
              )}

              <div className="space-y-3">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                    size="lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                )}

                <Button
                  onClick={() => setShowTextInput(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Keyboard className="w-5 h-5 mr-2" />
                  Use Text Instead
                </Button>

                {!transcript && (
                  <Button
                    onClick={() => {
                      setTranscript('I feel really overwhelmed and stressed about work deadlines. My mind keeps racing with thoughts about failure and disappointment. I can\'t seem to focus and everything feels impossible. I\'m worried that if I don\'t finish this project on time, my boss will think I\'m incompetent and I might lose my job.');
                      setTimeout(() => processTranscript(), 500);
                    }}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                )}

                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
        <Card className="w-full p-8 text-center space-y-6">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>

          <div>
            <h3 className="mb-2">Analyzing Your Thoughts</h3>
            <p className="text-muted-foreground">
              Creating your personalized thought pattern map...
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Identifying patterns</span>
                <span>Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mapping connections</span>
                <span>Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating insights</span>
                <span>In progress...</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === 'visualization') {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-1">Your Thought Pattern</h2>
            <p className="text-muted-foreground text-sm">
              Interactive circular map showing thought connections
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            ← Back
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          {/* Circular visualization placeholder */}
          <div className="relative w-full h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center">
            <div className="text-center space-y-2">
              <Brain className="w-8 h-8 text-purple-600 mx-auto" />
              <p className="text-sm font-medium text-purple-700">Thought Pattern Map</p>
              <p className="text-xs text-purple-600">Circular visualization would appear here</p>
            </div>

            {/* Show pattern completion header */}
            <motion.div
              className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white rotate-180" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-700">Cycle Complete</h4>
                  <p className="text-xs text-purple-600">
                    This pattern often repeats - let's break it with healthier responses
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Show pattern comparison header */}
          <motion.div
            className="grid grid-cols-2 gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-700">Your Current Pattern</span>
              </div>
              <p className="text-xs text-red-600">Automatic, reactive thinking that increases distress</p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Healthy Alternative</span>
              </div>
              <p className="text-xs text-green-600">Mindful, balanced responses that reduce distress</p>
            </div>
          </motion.div>

          {/* Side-by-side comparison of patterns */}
          <motion.div
            className="space-y-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            {/* First 3 steps - same for both patterns */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <h5 className="font-medium text-red-700 mb-2">Your Current Pattern</h5>
              </div>
              <div className="text-center">
                <h5 className="font-medium text-green-700 mb-2">Healthier Alternative</h5>
              </div>
            </div>

            {/* Step comparison rows */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <strong>Situation:</strong> {nodes.find(n => n.type === 'trigger')?.text || 'Triggering event'}
                </div>
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <strong>Situation:</strong> Same triggering event
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <strong>Thought:</strong> {nodes.find(n => n.type === 'automatic')?.text || 'Negative automatic thought'}
                </div>
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <strong>Thought:</strong> Balanced, realistic perspective
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <strong>Feeling:</strong> {nodes.find(n => n.type === 'emotion')?.text || 'High anxiety/distress'}
                </div>
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <strong>Feeling:</strong> Manageable concern with hope
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <strong>Action:</strong> {nodes.find(n => n.type === 'behavior')?.text || 'Avoidance, rumination'}
                </div>
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <strong>Action:</strong> {nodes.find(n => n.type === 'action')?.text || 'Practical problem-solving'}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3 mt-6">
            <Button
              onClick={initializeCBTAnalysis}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              Start CBT Analysis
            </Button>
            
            <Button
              onClick={handleComplete}
              variant="outline"
              className="w-full"
            >
              Save & Continue Later
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === 'cbt-analysis') {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Step {cbtStep} of 9</div>
            <Progress value={(cbtStep / 9) * 100} className="w-24 h-1 mt-1" />
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="mb-2">CBT Thought Record</h3>
            <p className="text-sm text-muted-foreground">
              Let's examine this thought more carefully
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={cbtStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {cbtStep === 1 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                    识别情境 (Identify Situation/Trigger)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    描述困扰你的具体场景或事件。什么时候、在哪里、和谁在一起？
                  </p>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>例子：</strong> 去图书馆路上想到要考试
                  </div>
                  <Textarea
                    placeholder="描述具体发生了什么..."
                    value={cbtAnalysis.situation || ''}
                    onChange={(e) => updateCBTAnalysis({ situation: e.target.value })}
                    className="min-h-20"
                  />
                </div>
              )}

              {cbtStep === 2 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                    捕捉自动思维 (Capture Automatic Thought)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    那一刻脑子里闪过的第一反应是什么？
                  </p>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>例子：</strong> "如果考试不及格怎么办？"
                  </div>
                  <Textarea
                    placeholder="我想到了..."
                    value={cbtAnalysis.automaticThought || ''}
                    onChange={(e) => updateCBTAnalysis({ automaticThought: e.target.value })}
                    className="min-h-20"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">对这个想法的相信程度 (0-100%)</label>
                    <Slider
                      value={[cbtAnalysis.initialBeliefPercentage || 75]}
                      onValueChange={(value) => updateCBTAnalysis({ initialBeliefPercentage: value[0] })}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {cbtAnalysis.initialBeliefPercentage || 75}%
                    </div>
                  </div>
                </div>
              )}

              {cbtStep === 3 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                    识别情绪 (Identify Emotion)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    这个想法让你感受到什么情绪？强度如何？
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">情绪类型</label>
                      <Textarea
                        placeholder="焦虑、担心、恐惧、愤怒、悲伤..."
                        value={cbtAnalysis.emotion || ''}
                        onChange={(e) => updateCBTAnalysis({ emotion: e.target.value })}
                        className="min-h-16 mt-1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">情绪强度 (0-100)</label>
                      <Slider
                        value={[cbtAnalysis.emotionIntensity || 70]}
                        onValueChange={(value) => updateCBTAnalysis({ emotionIntensity: value[0] })}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-muted-foreground">
                        {cbtAnalysis.emotionIntensity || 70}/100
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {cbtStep === 4 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                    识别认知偏差 (Identify Cognitive Distortions)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    这个想法可能包含哪些思维陷阱？（可多选）
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {cognitiveDistortions.map((distortion) => (
                      <label
                        key={distortion.id}
                        className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={cbtAnalysis.cognitiveDistortions?.includes(distortion.id) || false}
                          onChange={(e) => {
                            const current = cbtAnalysis.cognitiveDistortions || [];
                            if (e.target.checked) {
                              updateCBTAnalysis({ 
                                cognitiveDistortions: [...current, distortion.id] 
                              });
                            } else {
                              updateCBTAnalysis({ 
                                cognitiveDistortions: current.filter(id => id !== distortion.id) 
                              });
                            }
                          }}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-sm">{distortion.name}</div>
                          <div className="text-xs text-muted-foreground">{distortion.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {cbtStep === 5 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">5</span>
                    评价与挑战自动思维 (Evaluate / Challenge Thought)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    通过标准化问题来审视自动思维的合理性
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg text-sm">
                      <strong>思考以下问题：</strong>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• 有什么证据支持它？有什么证据反对它？</li>
                        <li>• 是否存在其他解释？</li>
                        <li>• 最糟糕会怎样？最好会怎样？最可能的结果是什么？</li>
                        <li>• 如果继续相信它会怎样？如果改变它会怎样？</li>
                        <li>• 如果是我的朋友遇到这种情况，我会怎么建议？</li>
                        <li>• 我能做什么实际行动？</li>
                      </ul>
                    </div>
                    
                    <Textarea
                      placeholder="基于上述问题，分析和挑战你的自动思维..."
                      value={cbtAnalysis.challengeEvidence || ''}
                      onChange={(e) => updateCBTAnalysis({ challengeEvidence: e.target.value })}
                      className="min-h-32"
                    />
                  </div>
                </div>
              )}

              {cbtStep === 6 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">6</span>
                    形成替代思维 (Develop Balanced Thought)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    基于你的分析，写出一个更平衡、更现实的想法
                  </p>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>例子：</strong> "虽然考试有挑战，但我已经做了准备，即使结果不完美，我也能从中学习并改进。"
                  </div>
                  <Textarea
                    placeholder="更平衡的想法是..."
                    value={cbtAnalysis.balancedThought || ''}
                    onChange={(e) => updateCBTAnalysis({ balancedThought: e.target.value })}
                    className="min-h-24"
                  />
                </div>
              )}

              {cbtStep === 7 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">7</span>
                    情绪与信念再评估 (Re-rate Emotion & Belief)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    现在重新评估你对原始想法的相信程度和情绪强度
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">对原始想法的相信程度 (0-100%)</label>
                      <Slider
                        value={[cbtAnalysis.finalBeliefPercentage || 75]}
                        onValueChange={(value) => updateCBTAnalysis({ finalBeliefPercentage: value[0] })}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-muted-foreground">
                        {cbtAnalysis.finalBeliefPercentage || 75}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">情绪强度 (0-100)</label>
                      <Slider
                        value={[cbtAnalysis.finalEmotionIntensity || 70]}
                        onValueChange={(value) => updateCBTAnalysis({ finalEmotionIntensity: value[0] })}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-muted-foreground">
                        {cbtAnalysis.finalEmotionIntensity || 70}/100
                      </div>
                    </div>

                    {/* Show improvement if any */}
                    {(cbtAnalysis.initialBeliefPercentage > cbtAnalysis.finalBeliefPercentage || 
                      cbtAnalysis.emotionIntensity > cbtAnalysis.finalEmotionIntensity) && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">进步！</span>
                        </div>
                        <div className="text-xs text-green-600">
                          {cbtAnalysis.initialBeliefPercentage > cbtAnalysis.finalBeliefPercentage && 
                            `信念强度降低了 ${cbtAnalysis.initialBeliefPercentage - cbtAnalysis.finalBeliefPercentage}%`}
                          {(cbtAnalysis.initialBeliefPercentage > cbtAnalysis.finalBeliefPercentage && 
                            cbtAnalysis.emotionIntensity > cbtAnalysis.finalEmotionIntensity) && ' • '}
                          {cbtAnalysis.emotionIntensity > cbtAnalysis.finalEmotionIntensity && 
                            `情绪强度降低了 ${cbtAnalysis.emotionIntensity - cbtAnalysis.finalEmotionIntensity}分`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {cbtStep === 8 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">8</span>
                    制定行动计划 (Create Action Plan)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    把新的想法转化为具体的行动步骤
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg text-sm">
                      <strong>例子：</strong> "今晚复习第三章重点，明天去问助教"
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">具体行动</label>
                      <Textarea
                        placeholder="我将要..."
                        value={cbtAnalysis.actionPlans?.[0]?.action || ''}
                        onChange={(e) => {
                          const newPlans = [...(cbtAnalysis.actionPlans || [])];
                          newPlans[0] = { 
                            action: e.target.value, 
                            timeline: newPlans[0]?.timeline || '今天/明天'
                          };
                          updateCBTAnalysis({ actionPlans: newPlans });
                        }}
                        className="min-h-20 mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">时间安排</label>
                      <Textarea
                        placeholder="什么时候开始？"
                        value={cbtAnalysis.actionPlans?.[0]?.timeline || ''}
                        onChange={(e) => {
                          const newPlans = [...(cbtAnalysis.actionPlans || [])];
                          newPlans[0] = { 
                            action: newPlans[0]?.action || '',
                            timeline: e.target.value
                          };
                          updateCBTAnalysis({ actionPlans: newPlans });
                        }}
                        className="min-h-16 mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cbtStep === 9 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">9</span>
                    结论与反思 (Conclusion & Reflection)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    总结这次思维记录的收获
                  </p>
                  
                  <div className="space-y-4">
                    {/* Summary comparison */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-700 mb-2">之前的思维模式</h5>
                        <div className="text-red-600 space-y-1">
                          <p><strong>想法:</strong> {cbtAnalysis.automaticThought}</p>
                          <p><strong>信念:</strong> {cbtAnalysis.initialBeliefPercentage}%</p>
                          <p><strong>情绪:</strong> {cbtAnalysis.emotion} ({cbtAnalysis.emotionIntensity}/100)</p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-medium text-green-700 mb-2">平衡的思维模式</h5>
                        <div className="text-sm text-green-600 space-y-1">
                          <p><strong>想法:</strong> {cbtAnalysis.balancedThought}</p>
                          <p><strong>信念:</strong> {cbtAnalysis.finalBeliefPercentage}%</p>
                          <p><strong>情绪:</strong> {cbtAnalysis.emotion} ({cbtAnalysis.finalEmotionIntensity}/100)</p>
                          <p><strong>挑战:</strong> {cbtAnalysis.challengeEvidence?.substring(0, 50)}...</p>
                          <p><strong>行动:</strong> {cbtAnalysis.actionPlans?.[0]?.action}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reflection text */}
                    <div>
                      <label className="text-sm font-medium">个人反思</label>
                      <Textarea
                        placeholder="通过这次分析，我学到了..."
                        value={cbtAnalysis.reflection || ''}
                        onChange={(e) => updateCBTAnalysis({ reflection: e.target.value })}
                        className="min-h-24 mt-1"
                      />
                    </div>

                    {/* Progress indicators */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">
                          {cbtAnalysis.initialBeliefPercentage - cbtAnalysis.finalBeliefPercentage}%
                        </div>
                        <div className="text-xs text-blue-600">信念强度降低</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                          {cbtAnalysis.emotionIntensity - cbtAnalysis.finalEmotionIntensity}
                        </div>
                        <div className="text-xs text-green-600">情绪强度降低</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3">
            {cbtStep > 1 && (
              <Button
                onClick={handleCBTBack}
                variant="outline"
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button
              onClick={handleCBTNext}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              disabled={
                (cbtStep === 1 && !cbtAnalysis.situation?.trim()) ||
                (cbtStep === 2 && !cbtAnalysis.automaticThought?.trim()) ||
                (cbtStep === 3 && !cbtAnalysis.emotion?.trim()) ||
                (cbtStep === 4 && (!cbtAnalysis.cognitiveDistortions || cbtAnalysis.cognitiveDistortions.length === 0)) ||
                (cbtStep === 5 && !cbtAnalysis.challengeEvidence?.trim()) ||
                (cbtStep === 6 && !cbtAnalysis.balancedThought?.trim()) ||
                (cbtStep === 8 && (!cbtAnalysis.actionPlans?.[0]?.action?.trim()))
              }
            >
              {cbtStep === 9 ? 'Complete Analysis' : 'Next'}
              {cbtStep < 9 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};