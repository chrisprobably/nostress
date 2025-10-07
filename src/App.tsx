import React, { useState, useEffect } from "react";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { DeviceProvider, useDevice } from "./components/DeviceContext";
import { Home } from "./components/Home";
import { MoodTracker } from "./components/MoodTracker";
import { IntensityRating } from "./components/IntensityRating";
import { CategoryTagger } from "./components/CategoryTagger";
import { BreathingExercise } from "./components/BreathingExercise";
import { SleepTracker } from "./components/SleepTracker";
import { UnifiedReports } from "./components/UnifiedReports";
import { NotificationTrigger } from "./components/NotificationTrigger";
import { WatchApp } from "./components/watch/WatchApp";
import {
  Heart,
  Brain,
  BarChart3,
  Smartphone,
  Watch,
  Moon,
  Home as HomeIcon,
  Lightbulb,
  CheckCircle,
  Mic,
} from "lucide-react";
import {
  BedroomMeditationPlan,
  MeditationFeedback,
} from "./components/BedroomMeditationPlan";
import { CBTITracker, ThoughtLoop } from "./components/CBTITracker";
import { ThoughtRecordEntry } from "./components/ThoughtRecord";

export interface StressEvent {
  id: string;
  timestamp: Date;
  mood: string;
  moodEmoji: string;
  moodCategory: string;
  intensity: number; // 1-10 scale
  category: string;
  subcategory?: string;
  stressWord?: string;
  completed?: boolean;
  hrvBefore?: number; // HRV before intervention
  hrvAfter?: number; // HRV after intervention
  triggers?: string[]; // Additional triggers like caffeine, sleep deprivation
}

export interface SleepData {
  id: string;
  date: Date; // Sleep date (when sleep started)
  bedtime: Date;
  wakeTime: Date;
  totalSleep: number; // minutes
  remSleep: number; // minutes
  deepSleep: number; // minutes
  lightSleep: number; // minutes
  awakeTime: number; // minutes
  sleepEfficiency: number; // percentage
  sleepQuality: "poor" | "fair" | "good" | "excellent";
  heartRate?: {
    min: number;
    max: number;
    avg: number;
  };
  movements: number; // number of movements during sleep
}

function AppContent() {
  const { device, setDevice, isWatch, isPhone } = useDevice();
  const [currentView, setCurrentView] = useState("home");
  const [stressEvents, setStressEvents] = useState<StressEvent[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [thoughtLoops, setThoughtLoops] = useState<ThoughtLoop[]>([]);
  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecordEntry[]>(
    []
  );
  const [showNotification, setShowNotification] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<Partial<StressEvent> | null>(
    null
  );
  const [isVoluntaryBreathing, setIsVoluntaryBreathing] = useState(false);
  const [showMeditationPlan, setShowMeditationPlan] = useState(false);
  const [meditationFeedbackHistory, setMeditationFeedbackHistory] = useState<
    MeditationFeedback[]
  >([]);

  console.log("Loading app content");

  // Load mock data on startup
  useEffect(() => {
    const mockEvents: StressEvent[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        mood: "Angry",
        moodEmoji: "😡",
        moodCategory: "angry",
        intensity: 7,
        category: "Work/School",
        stressWord: "deadline",
        completed: true,
        hrvBefore: 28,
        hrvAfter: 42,
        triggers: ["caffeine", "poor_sleep"],
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        mood: "Fear",
        moodEmoji: "😰",
        moodCategory: "fear",
        intensity: 8,
        category: "Work/School",
        completed: true,
        hrvBefore: 24,
        hrvAfter: 38,
        triggers: ["presentation"],
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        mood: "Sad",
        moodEmoji: "😔",
        moodCategory: "sad",
        intensity: 6,
        category: "Family",
        completed: true,
        hrvBefore: 31,
        hrvAfter: 44,
        triggers: ["relationship"],
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        mood: "Jittery",
        moodEmoji: "😵‍💫",
        moodCategory: "disgust",
        intensity: 6,
        category: "Caffeine",
        completed: true,
        hrvBefore: 26,
        hrvAfter: 35,
        triggers: ["caffeine", "coffee"],
      },
      {
        id: "5",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        mood: "Happy",
        moodEmoji: "😊",
        moodCategory: "happy",
        intensity: 4,
        category: "Leisure",
        completed: true,
        hrvBefore: 35,
        hrvAfter: 48,
      },
      {
        id: "6",
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
        mood: "Tired",
        moodEmoji: "😴",
        moodCategory: "sad",
        intensity: 7,
        category: "Sleep Deprivation",
        completed: true,
        hrvBefore: 22,
        hrvAfter: 39,
        triggers: ["poor_sleep", "sleep_debt"],
      },
      {
        id: "7",
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
        mood: "Overwhelmed",
        moodEmoji: "😵‍💫",
        moodCategory: "disgust",
        intensity: 8,
        category: "Finances",
        stressWord: "bills",
        completed: true,
        hrvBefore: 25,
        hrvAfter: 41,
        triggers: ["financial_stress"],
      },
      {
        id: "8",
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        mood: "Anxious",
        moodEmoji: "😰",
        moodCategory: "fear",
        intensity: 6,
        category: "Friends/Social",
        stressWord: "conflict",
        completed: false,
        hrvBefore: 29,
        triggers: ["social_anxiety"],
      },
      {
        id: "9",
        timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000),
        mood: "Restless",
        moodEmoji: "😣",
        moodCategory: "angry",
        intensity: 5,
        category: "Caffeine",
        completed: true,
        hrvBefore: 27,
        hrvAfter: 36,
        triggers: ["caffeine", "energy_drink"],
      },
      {
        id: "10",
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        mood: "Angry",
        moodEmoji: "😡",
        moodCategory: "angry",
        intensity: 9,
        category: "Work/School",
        stressWord: "meeting",
        completed: true,
        hrvBefore: 21,
        hrvAfter: 43,
        triggers: ["work_pressure"],
      },
      {
        id: "11",
        timestamp: new Date(Date.now() - 84 * 60 * 60 * 1000),
        mood: "Sluggish",
        moodEmoji: "😑",
        moodCategory: "sad",
        intensity: 6,
        category: "Sleep Deprivation",
        completed: true,
        hrvBefore: 23,
        hrvAfter: 37,
        triggers: ["poor_sleep", "late_night"],
      },
      {
        id: "12",
        timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000),
        mood: "Calm",
        moodEmoji: "😌",
        moodCategory: "surprise",
        intensity: 3,
        category: "Leisure",
        completed: true,
        hrvBefore: 33,
        hrvAfter: 46,
      },
    ];
    setStressEvents(mockEvents);

    // Mock sleep data for the last 7 days
    const mockSleepData: SleepData[] = [
      {
        id: "1",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        bedtime: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000
        ), // 11 PM yesterday
        wakeTime: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago (7 AM today)
        totalSleep: 456, // 7h 36m
        remSleep: 114, // 1h 54m (25%)
        deepSleep: 91, // 1h 31m (20%)
        lightSleep: 228, // 3h 48m (50%)
        awakeTime: 23, // 23m (5%)
        sleepEfficiency: 95,
        sleepQuality: "good",
        heartRate: { min: 48, max: 72, avg: 54 },
        movements: 12,
      },
      {
        id: "2",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        bedtime: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000 + 23.5 * 60 * 60 * 1000
        ), // 11:30 PM
        wakeTime: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000 + 30.5 * 60 * 60 * 1000
        ), // 6:30 AM
        totalSleep: 390, // 6h 30m
        remSleep: 78, // 1h 18m (20%)
        deepSleep: 59, // 59m (15%)
        lightSleep: 195, // 3h 15m (50%)
        awakeTime: 78, // 1h 18m (15%)
        sleepEfficiency: 83,
        sleepQuality: "fair",
        heartRate: { min: 52, max: 76, avg: 58 },
        movements: 18,
      },
      {
        id: "3",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        bedtime: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000 + 22.5 * 60 * 60 * 1000
        ), // 10:30 PM
        wakeTime: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 60 * 1000
        ), // 6:00 AM
        totalSleep: 432, // 7h 12m
        remSleep: 108, // 1h 48m (25%)
        deepSleep: 86, // 1h 26m (20%)
        lightSleep: 216, // 3h 36m (50%)
        awakeTime: 22, // 22m (5%)
        sleepEfficiency: 93,
        sleepQuality: "good",
        heartRate: { min: 46, max: 68, avg: 52 },
        movements: 8,
      },
      {
        id: "4",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        bedtime: new Date(
          Date.now() - 4 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000
        ), // 12:00 AM (late night)
        wakeTime: new Date(
          Date.now() - 4 * 24 * 60 * 60 * 1000 + 32 * 60 * 60 * 1000
        ), // 8:00 AM
        totalSleep: 360, // 6h 0m
        remSleep: 54, // 54m (15%)
        deepSleep: 36, // 36m (10%)
        lightSleep: 180, // 3h 0m (50%)
        awakeTime: 90, // 1h 30m (25%)
        sleepEfficiency: 75,
        sleepQuality: "poor",
        heartRate: { min: 58, max: 82, avg: 65 },
        movements: 25,
      },
      {
        id: "5",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        bedtime: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000
        ), // 10:00 PM
        wakeTime: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000 + 29 * 60 * 60 * 1000
        ), // 5:00 AM
        totalSleep: 408, // 6h 48m
        remSleep: 102, // 1h 42m (25%)
        deepSleep: 82, // 1h 22m (20%)
        lightSleep: 204, // 3h 24m (50%)
        awakeTime: 20, // 20m (5%)
        sleepEfficiency: 95,
        sleepQuality: "excellent",
        heartRate: { min: 44, max: 64, avg: 50 },
        movements: 6,
      },
      {
        id: "6",
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        bedtime: new Date(
          Date.now() - 6 * 24 * 60 * 60 * 1000 + 22.75 * 60 * 60 * 1000
        ), // 10:45 PM
        wakeTime: new Date(
          Date.now() - 6 * 24 * 60 * 60 * 1000 + 30.25 * 60 * 60 * 1000
        ), // 6:15 AM
        totalSleep: 420, // 7h 0m
        remSleep: 105, // 1h 45m (25%)
        deepSleep: 84, // 1h 24m (20%)
        lightSleep: 210, // 3h 30m (50%)
        awakeTime: 21, // 21m (5%)
        sleepEfficiency: 93,
        sleepQuality: "good",
        heartRate: { min: 47, max: 69, avg: 53 },
        movements: 10,
      },
      {
        id: "7",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        bedtime: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000 + 23.25 * 60 * 60 * 1000
        ), // 11:15 PM
        wakeTime: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000 + 31.5 * 60 * 60 * 1000
        ), // 7:30 AM
        totalSleep: 456, // 7h 36m
        remSleep: 114, // 1h 54m (25%)
        deepSleep: 91, // 1h 31m (20%)
        lightSleep: 228, // 3h 48m (50%)
        awakeTime: 23, // 23m (5%)
        sleepEfficiency: 94,
        sleepQuality: "good",
        heartRate: { min: 45, max: 67, avg: 51 },
        movements: 9,
      },
    ];
    setSleepData(mockSleepData);

    // Mock thought loop data
    const mockThoughtLoops: ThoughtLoop[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        trigger: "Looking at the clock and seeing it's 2 AM",
        automaticThought: "I'll never fall asleep and tomorrow will be ruined",
        beliefPercentage: 85,
        emotion: "Anxiety",
        emotionIntensity: 80,
        thinkingError: "Catastrophizing",
        behaviorResponse: "Tossing and turning, checking phone",
        balancedThought:
          "I've had late nights before and still functioned. Even if I'm tired tomorrow, I can manage and catch up on sleep the next night.",
        newEmotionIntensity: 45,
        actionPlan: "Practice breathing exercise and avoid checking the time",
        completed: true,
        sleepRelated: true,
        category: "Sleep",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        trigger: "Received a critical email from my boss",
        automaticThought:
          "I'm going to get fired and won't be able to find another job",
        beliefPercentage: 70,
        emotion: "Fear",
        emotionIntensity: 75,
        thinkingError: "Fortune Telling",
        behaviorResponse: "Avoiding work tasks, ruminating",
        balancedThought:
          "One critical email doesn't mean I'll be fired. I can address the concerns professionally and learn from this feedback.",
        newEmotionIntensity: 35,
        actionPlan:
          "Draft a thoughtful response and schedule a meeting to discuss",
        completed: true,
        sleepRelated: false,
        category: "Work",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        trigger: "Friend didn't respond to my text for 6 hours",
        automaticThought:
          "They must be angry with me and don't want to be friends anymore",
        beliefPercentage: 60,
        emotion: "Sadness",
        emotionIntensity: 65,
        thinkingError: "Mind Reading",
        behaviorResponse: "Sending multiple follow-up texts",
        completed: false,
        sleepRelated: false,
        category: "Relationships",
      },
    ];
    setThoughtLoops(mockThoughtLoops);

    // Mock thought record data
    const mockThoughtRecords: ThoughtRecordEntry[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        situation: "On the way to the library at 7:30 yesterday",
        automaticThought: "If I fail this exam, what will happen?",
        initialBeliefPercentage: 85,
        emotion: "Anxiety",
        emotionIntensity: 80,
        cognitiveBiases: ["Catastrophizing", "All-or-Nothing"],
        evidence: {
          supporting: "Chapter 3 is difficult, time is running short",
          opposing:
            "Quiz scores have been good, I understand chapters 1-2 well",
          beliefAfter: 65,
        },
        alternatives: {
          explanations: [
            "Study method needs adjustment",
            "Need to ask teaching assistant for help",
            "Time allocation could be better",
          ],
          beliefAfter: 50,
        },
        impact: {
          maintaining: "Continued anxiety, avoidance of studying",
          adjusting: "Focus on Chapter 3 specifically, improved efficiency",
          beliefAfter: 40,
        },
        advice: {
          toOther:
            "If this were a friend, I'd tell them to focus on what they can control and ask for help",
          beliefAfter: 30,
        },
        action: {
          plans: [
            { title: "Contact teaching assistant tomorrow at 9 AM" },
            { title: "Create Chapter 3 outline tonight at 8:30 PM" },
          ],
          beliefAfter: 40,
        },
        finalBeliefPercentage: 40,
        finalEmotionIntensity: 45,
        plannedActions: [
          { title: "Contact teaching assistant tomorrow at 9 AM" },
          { title: "Create Chapter 3 outline tonight at 8:30 PM" },
        ],
        completed: true,
        sleepRelated: false,
        category: "Academic",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        situation: "Looking at the clock showing 2 AM",
        automaticThought: "I'll never fall asleep and tomorrow will be ruined",
        initialBeliefPercentage: 90,
        emotion: "Anxiety",
        emotionIntensity: 85,
        cognitiveBiases: ["Catastrophizing", "Fortune Telling"],
        advice: {
          toOther:
            "Even if I don't sleep perfectly, I can rest and still function tomorrow. I've managed on less sleep before.",
          beliefAfter: 35,
        },
        finalBeliefPercentage: 35,
        finalEmotionIntensity: 40,
        plannedActions: [
          { title: "Practice breathing exercise" },
          { title: "Avoid checking the time" },
        ],
        completed: true,
        sleepRelated: true,
        category: "Sleep",
      },
    ];
    setThoughtRecords(mockThoughtRecords);
  }, []);

  // HRV anomaly detection flow:
  // 1. HRV anomaly → 2. Ask user feeling → 3. Stress tracking → 4. Intensity rating → 5. Stress source classification → 6. Breathing exercise
  const handleTriggerNotification = () => {
    setShowNotification(true);
    setPendingEvent({
      id: Date.now().toString(),
      timestamp: new Date(),
    });
  };

  const handleMoodSelected = (
    mood: string,
    emoji: string,
    moodCategory: string
  ) => {
    if (pendingEvent) {
      setPendingEvent({
        ...pendingEvent,
        mood,
        moodEmoji: emoji,
        moodCategory,
      });
      setCurrentView("intensity");
    }
  };

  const handleIntensitySelected = (intensity: number) => {
    if (pendingEvent) {
      setPendingEvent({
        ...pendingEvent,
        intensity,
      });
      setCurrentView("category");
    }
  };

  const handleCategorySelected = (category: string, subcategory?: string) => {
    if (pendingEvent) {
      // Complete the stress event and go directly to thought record
      const completedEvent: StressEvent = {
        ...(pendingEvent as StressEvent),
        category,
        subcategory,
        completed: true,
      };
      setStressEvents((prev) => [completedEvent, ...prev]);

      // Go directly to evening review mode for quick analysis
      setPendingEvent(null);
      setShowNotification(false);
      setCurrentView("quick-cbt");
    }
  };

  const handleBreathingCompleted = () => {
    if (isVoluntaryBreathing) {
      // Handle voluntary breathing exercise completion
      setIsVoluntaryBreathing(false);
      setCurrentView("mood");
    } else if (pendingEvent) {
      // Show post-breathing options for HRV-triggered sessions
      setCurrentView("post-breathing");
    }
  };

  const handleVoluntaryBreathing = () => {
    setIsVoluntaryBreathing(true);
    setCurrentView("breathing");
  };

  const handleEventCompleted = (event: StressEvent) => {
    setStressEvents((prev) => [event, ...prev]);
  };

  const handleMeditationCompleted = (feedback: MeditationFeedback) => {
    setMeditationFeedbackHistory((prev) => [feedback, ...prev]);
    setShowMeditationPlan(false);
    setCurrentView("sleep"); // Navigate to sleep tracking after meditation
  };

  const handleThoughtLoopCompleted = (loop: ThoughtLoop) => {
    setThoughtLoops((prev) => [loop, ...prev]);
  };

  const handleThoughtRecordCompleted = (record: ThoughtRecordEntry) => {
    setThoughtRecords((prev) => [record, ...prev]);
  };

  const getTodayStressCount = () => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    return stressEvents.filter(
      (event) => event.timestamp >= todayStart && event.timestamp < todayEnd
    ).length;
  };

  const getTodayHRV = () => {
    const todayEvents = stressEvents.filter((event) => {
      const today = new Date();
      const eventDate = new Date(event.timestamp);
      return eventDate.toDateString() === today.toDateString();
    });

    if (todayEvents.length === 0) return undefined;

    const avgHRV =
      todayEvents
        .filter((event) => event.hrvBefore)
        .reduce((sum, event) => sum + (event.hrvBefore || 0), 0) /
      todayEvents.length;

    return Math.round(avgHRV);
  };

  const getHRVBaseline = () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEvents = stressEvents.filter(
      (event) => event.timestamp >= sevenDaysAgo && event.hrvBefore
    );

    if (recentEvents.length < 5) return undefined; // Need at least 5 data points for baseline

    const avgHRV =
      recentEvents.reduce((sum, event) => sum + (event.hrvBefore || 0), 0) /
      recentEvents.length;
    return Math.round(avgHRV);
  };

  const handleViewOnPhone = () => {
    setDevice("phone");
    setCurrentView("reports");
  };

  const renderPhoneView = () => {
    // Handle bedtime meditation plan
    if (showMeditationPlan) {
      return (
        <BedroomMeditationPlan
          stressCountToday={getTodayStressCount()}
          hrvToday={getTodayHRV()}
          hrvBaseline={getHRVBaseline()}
          hasBaseline={getHRVBaseline() !== undefined}
          onCompleted={handleMeditationCompleted}
        />
      );
    }

    // Handle voluntary breathing exercise
    if (isVoluntaryBreathing && currentView === "breathing") {
      return (
        <BreathingExercise
          stressWord="relaxation"
          onCompleted={handleBreathingCompleted}
          onCancel={() => {
            setIsVoluntaryBreathing(false);
            setCurrentView("home");
          }}
        />
      );
    }

    // Handle stress tracking flow states
    if (showNotification || pendingEvent) {
      switch (currentView) {
        case "intensity":
          return pendingEvent?.mood ? (
            <IntensityRating
              mood={pendingEvent.mood}
              moodEmoji={pendingEvent.moodEmoji || ""}
              moodCategory={pendingEvent.moodCategory || ""}
              onIntensitySelected={handleIntensitySelected}
            />
          ) : null;
        case "category":
          return <CategoryTagger onCategorySelected={handleCategorySelected} />;
        case "breathing":
          return (
            <BreathingExercise
              stressWord={pendingEvent?.category || "stress"}
              onCompleted={handleBreathingCompleted}
            />
          );
        case "post-breathing":
          return (
            <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
              <Card className="w-full p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-2">Great work!</h3>
                  <p className="text-muted-foreground mb-4">
                    How are you feeling now? Would you like to continue with a
                    quick analysis?
                  </p>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-4">
                      <div>Source?</div>
                      <div>Intensity?</div>
                      <div>Thoughts?</div>
                    </div>

                    <Button
                      onClick={() => setCurrentView("stress")}
                      className="w-full"
                    >
                      Continue Analysis
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        // Complete and go home
                        const newEvent: StressEvent = {
                          ...(pendingEvent as StressEvent),
                          completed: true,
                        };
                        setStressEvents((prev) => [newEvent, ...prev]);
                        setPendingEvent(null);
                        setShowNotification(false);
                        setCurrentView("home");
                      }}
                      className="w-full"
                    >
                      I'm feeling better now
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        case "quick-cbt":
          return (
            <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
              <div className="mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView("home")}
                >
                  ← Back
                </Button>
              </div>
              <CBTITracker
                stressEvents={stressEvents}
                thoughtLoops={thoughtLoops}
                thoughtRecords={thoughtRecords}
                onThoughtLoopCompleted={handleThoughtLoopCompleted}
                onThoughtRecordCompleted={(record) => {
                  handleThoughtRecordCompleted(record);
                  setCurrentView("home");
                }}
                onClose={() => setCurrentView("home")}
              />
            </div>
          );
        case "offer-thought-record":
          return (
            <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
              <Card className="w-full p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-2">Dive deeper?</h3>
                  <p className="text-muted-foreground mb-4">
                    Would you like to explore the thoughts behind this stress
                    using our structured CBT approach?
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setCurrentView("cbti")}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Thoughts
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        // Schedule evening review
                        setCurrentView("home");
                      }}
                      className="w-full"
                    >
                      Save for Evening Review
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        default:
          return (
            <MoodTracker
              onMoodSelected={handleMoodSelected}
              stressEvents={stressEvents}
              onBreathingExercise={handleVoluntaryBreathing}
              onCBTIAccess={() => setCurrentView("cbti")}
            />
          );
      }
    }

    // Main app views
    switch (currentView) {
      case "home":
        return (
          <Home
            onMoodTrack={() => setCurrentView("stress")}
            onMeditationStart={() => setShowMeditationPlan(true)}
            onViewReports={() => setCurrentView("reports")}
            onViewSleep={() => setCurrentView("sleep")}
            onCBTAccess={() => setCurrentView("cbti")}
            stressEvents={stressEvents}
            sleepData={sleepData}
          />
        );
      case "stress":
        return (
          <MoodTracker
            onMoodSelected={handleMoodSelected}
            stressEvents={stressEvents}
            onBreathingExercise={handleVoluntaryBreathing}
            onCBTIAccess={() => setCurrentView("cbti")}
          />
        );
      case "cbti":
        return (
          <CBTITracker
            stressEvents={stressEvents}
            thoughtLoops={thoughtLoops}
            thoughtRecords={thoughtRecords}
            onThoughtLoopCompleted={handleThoughtLoopCompleted}
            onThoughtRecordCompleted={handleThoughtRecordCompleted}
            onClose={() => setCurrentView("home")}
          />
        );
      case "sleep":
        return (
          <SleepTracker
            sleepData={sleepData}
            stressEvents={stressEvents}
            onMeditationPlan={() => setShowMeditationPlan(true)}
          />
        );
      case "reports":
        return (
          <UnifiedReports stressEvents={stressEvents} sleepData={sleepData} />
        );
      default:
        return (
          <Home
            onMoodTrack={() => setCurrentView("stress")}
            onMeditationStart={() => setShowMeditationPlan(true)}
            onViewReports={() => setCurrentView("reports")}
            onViewSleep={() => setCurrentView("sleep")}
            onCBTAccess={() => setCurrentView("cbti")}
            stressEvents={stressEvents}
            sleepData={sleepData}
          />
        );
    }
  };

  if (isWatch) {
    return (
      <WatchApp
        onEventCompleted={handleEventCompleted}
        onViewOnPhone={handleViewOnPhone}
        sleepData={sleepData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      {/* Notification Overlay */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="mb-2">We noticed you might be feeling stressed</h3>
              <p className="text-muted-foreground mb-4">
                Your HRV suggests elevated stress. Let's do a 3-5 minute
                breathing exercise first, then check in on your thoughts.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setShowNotification(false);
                    setCurrentView("breathing");
                  }}
                  className="w-full"
                >
                  Start Breathing Exercise
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNotification(false);
                    setCurrentView("stress");
                  }}
                  className="w-full text-xs"
                >
                  Skip to check-in
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Header - Only show when not in a flow */}
      {!showNotification &&
        !pendingEvent &&
        !isVoluntaryBreathing &&
        !showMeditationPlan && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="mb-1">Mindful</h1>
              <p className="text-muted-foreground">
                Cognitive wellness & thought transformation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDevice(device === "phone" ? "watch" : "phone")
                }
                className="flex items-center gap-2"
              >
                {device === "phone" ? (
                  <Watch className="w-4 h-4" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
                <span className="text-xs">
                  {device === "phone" ? "Watch" : "Phone"}
                </span>
              </Button>
              <NotificationTrigger onTrigger={handleTriggerNotification} />
            </div>
          </div>
        )}

      {/* Main Content */}
      <div className="space-y-4">{renderPhoneView()}</div>

      {/* Bottom Navigation - Only show when not in a flow */}
      {!showNotification &&
        !pendingEvent &&
        !isVoluntaryBreathing &&
        !showMeditationPlan && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
            <div className="max-w-md mx-auto">
              <Tabs value={currentView} onValueChange={setCurrentView}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger
                    value="home"
                    className="flex flex-col gap-1 py-2"
                  >
                    <HomeIcon className="w-4 h-4" />
                    <span className="text-xs">Home</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="stress"
                    className="flex flex-col gap-1 py-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="text-xs">Stress</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="cbti"
                    className="flex flex-col gap-1 py-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="text-xs">CBT</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="sleep"
                    className="flex flex-col gap-1 py-2"
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-xs">Sleep</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reports"
                    className="flex flex-col gap-1 py-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">Reports</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        )}
    </div>
  );
}

export default function App() {
  return (
    <DeviceProvider>
      <AppContent />
    </DeviceProvider>
  );
}
