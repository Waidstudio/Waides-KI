import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Award,
  Play,
  Check,
  Lock,
  Brain,
  Zap,
  Crown
} from 'lucide-react';

// Mock user ID for demo - in real app this would come from auth
const DEMO_USER_ID = "demo-user-123";
const DEMO_USERNAME = "TradingLearner";

interface UserProgress {
  userId: string;
  level: number;
  totalXP: number;
  currentXP: number;
  xpToNextLevel: number;
  completedModules: string[];
  currentModule?: string;
  streak: {
    current: number;
    longest: number;
    lastActivity: number;
  };
  achievements: Achievement[];
  stats: {
    totalLearningTime: number;
    modulesCompleted: number;
    averageScore: number;
    perfectScores: number;
    quizzesCompleted: number;
  };
  preferences: {
    dailyGoal: number;
    reminderTime?: string;
    difficulty: 'ADAPTIVE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  category: 'BASICS' | 'TECHNICAL_ANALYSIS' | 'RISK_MANAGEMENT' | 'PSYCHOLOGY' | 'STRATEGY' | 'ADVANCED';
  estimatedTime: number;
  prerequisites: string[];
  lessons: Lesson[];
  isCompleted: boolean;
  score: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'QUIZ' | 'SIMULATION' | 'VIDEO' | 'INTERACTIVE';
  questions?: QuizQuestion[];
  isCompleted: boolean;
  score: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'LEARNING' | 'TRADING' | 'STREAK' | 'MASTERY' | 'SPECIAL';
  requirement: {
    type: 'COMPLETE_MODULES' | 'QUIZ_STREAK' | 'PERFECT_SCORE' | 'TIME_SPENT' | 'TRADING_PERFORMANCE';
    value: number;
    target?: string;
  };
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  points: number;
  unlockedAt?: number;
  isUnlocked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
  category: string;
  requirement: {
    type: string;
    value: number;
    timeframe?: number;
  };
  reward: {
    xp: number;
    achievement?: string;
    badge?: string;
  };
  startDate: number;
  endDate: number;
  isActive: boolean;
  participants: number;
  completions: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'BEGINNER': return 'bg-green-500';
    case 'INTERMEDIATE': return 'bg-yellow-500';
    case 'ADVANCED': return 'bg-orange-500';
    case 'EXPERT': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'BASICS': return <BookOpen className="h-4 w-4" />;
    case 'TECHNICAL_ANALYSIS': return <TrendingUp className="h-4 w-4" />;
    case 'RISK_MANAGEMENT': return <Target className="h-4 w-4" />;
    case 'PSYCHOLOGY': return <Brain className="h-4 w-4" />;
    case 'STRATEGY': return <Zap className="h-4 w-4" />;
    case 'ADVANCED': return <Crown className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'COMMON': return 'text-gray-600';
    case 'RARE': return 'text-blue-600';
    case 'EPIC': return 'text-purple-600';
    case 'LEGENDARY': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

export default function LearningPage() {
  const [activeQuiz, setActiveQuiz] = useState<{ moduleId: string; lessonId: string; questionIndex: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const queryClient = useQueryClient();

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ['/api/learning/progress', DEMO_USER_ID],
    queryFn: () => apiRequest(`/api/learning/progress/${DEMO_USER_ID}`),
  });

  // Fetch learning modules
  const { data: modulesData } = useQuery({
    queryKey: ['/api/learning/modules'],
    queryFn: () => apiRequest('/api/learning/modules'),
  });

  // Fetch active challenges
  const { data: challengesData } = useQuery({
    queryKey: ['/api/learning/challenges'],
    queryFn: () => apiRequest('/api/learning/challenges'),
  });

  // Fetch leaderboard
  const { data: leaderboardData } = useQuery({
    queryKey: ['/api/learning/leaderboard'],
    queryFn: () => apiRequest('/api/learning/leaderboard?limit=10'),
  });

  // Start module mutation
  const startModuleMutation = useMutation({
    mutationFn: (moduleId: string) => 
      apiRequest(`/api/learning/modules/${moduleId}/start`, {
        method: 'POST',
        body: JSON.stringify({ userId: DEMO_USER_ID })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/modules'] });
    }
  });

  // Submit quiz answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: ({ moduleId, lessonId, questionId, answer }: {
      moduleId: string;
      lessonId: string;
      questionId: string;
      answer: number;
    }) => 
      apiRequest('/api/learning/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          moduleId,
          lessonId,
          questionId,
          answer
        })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning/progress'] });
    }
  });

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: (challengeId: string) => 
      apiRequest(`/api/learning/challenges/${challengeId}/join`, {
        method: 'POST',
        body: JSON.stringify({ userId: DEMO_USER_ID })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning/challenges'] });
    }
  });

  const progress: UserProgress | undefined = progressData?.progress;
  const modules: LearningModule[] = modulesData?.modules || [];
  const challenges: Challenge[] = challengesData?.challenges || [];
  const leaderboard = leaderboardData?.leaderboard || [];

  const filteredModules = modules.filter(module => 
    selectedCategory === 'ALL' || module.category === selectedCategory
  );

  const handleStartModule = (moduleId: string) => {
    startModuleMutation.mutate(moduleId);
  };

  const handleQuizAnswer = (answer: number) => {
    if (!activeQuiz) return;
    
    submitAnswerMutation.mutate({
      moduleId: activeQuiz.moduleId,
      lessonId: activeQuiz.lessonId,
      questionId: `question-${activeQuiz.questionIndex}`,
      answer
    });
    
    setActiveQuiz(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trading Academy</h1>
          <p className="text-gray-400 mt-1">Master the art of trading through interactive learning</p>
        </div>
        {progress && (
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">Level {progress.level}</div>
              <div className="text-sm text-gray-400">{progress.totalXP} XP</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-500">{progress.streak.current}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
          </div>
        )}
      </div>

      {progress && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Learning Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Level Progress</div>
                <Progress value={(progress.currentXP / progress.xpToNextLevel) * 100} className="h-2" />
                <div className="text-xs text-gray-500">{progress.currentXP}/{progress.xpToNextLevel} XP to next level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{progress.stats.modulesCompleted}</div>
                <div className="text-sm text-gray-400">Modules Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{progress.stats.averageScore}%</div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{progress.achievements.length}</div>
                <div className="text-sm text-gray-400">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="modules" className="text-white">Learning Modules</TabsTrigger>
          <TabsTrigger value="challenges" className="text-white">Challenges</TabsTrigger>
          <TabsTrigger value="achievements" className="text-white">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-white">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">Filter by category:</div>
            <div className="flex space-x-2">
              {['ALL', 'BASICS', 'TECHNICAL_ANALYSIS', 'RISK_MANAGEMENT', 'PSYCHOLOGY', 'STRATEGY', 'ADVANCED'].map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {category.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => {
              const isCompleted = progress?.completedModules.includes(module.id) || false;
              const canStart = module.prerequisites.every(prereq => 
                progress?.completedModules.includes(prereq) || false
              );
              
              return (
                <Card key={module.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(module.category)}
                        <CardTitle className="text-white text-lg">{module.title}</CardTitle>
                      </div>
                      {isCompleted && <Check className="h-5 w-5 text-green-500" />}
                      {!canStart && <Lock className="h-5 w-5 text-gray-500" />}
                    </div>
                    <CardDescription className="text-gray-400">{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={`${getDifficultyColor(module.difficulty)} text-white`}>
                          {module.difficulty}
                        </Badge>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{module.estimatedTime} min</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          {module.lessons.length} lessons
                        </div>
                        {isCompleted && (
                          <div className="text-sm text-green-500">
                            Score: {module.score}%
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleStartModule(module.id)}
                        disabled={!canStart || startModuleMutation.isPending}
                        className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {startModuleMutation.isPending ? (
                          'Starting...'
                        ) : isCompleted ? (
                          'Review Module'
                        ) : canStart ? (
                          <><Play className="h-4 w-4 mr-2" /> Start Module</>
                        ) : (
                          'Prerequisites Required'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>{challenge.title}</span>
                      </CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {challenge.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">{challenge.participants} participants</div>
                      <div className="text-sm text-green-500">{challenge.completions} completed</div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Reward: {challenge.reward.xp} XP
                      </div>
                      <div className="text-sm text-gray-400">
                        Ends: {new Date(challenge.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      onClick={() => joinChallengeMutation.mutate(challenge.id)}
                      disabled={joinChallengeMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {joinChallengeMutation.isPending ? 'Joining...' : 'Join Challenge'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress?.achievements.map((achievement) => (
              <Card key={achievement.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className={`text-white flex items-center space-x-2 ${getRarityColor(achievement.rarity)}`}>
                    <Trophy className="h-5 w-5" />
                    <span>{achievement.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${achievement.rarity === 'LEGENDARY' ? 'bg-yellow-600' : 
                      achievement.rarity === 'EPIC' ? 'bg-purple-600' : 
                      achievement.rarity === 'RARE' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      {achievement.rarity}
                    </Badge>
                    <span className="text-sm text-gray-400">{achievement.points} XP</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                    {achievement.unlockedAt && (
                      <div className="text-xs text-green-500">
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Learning Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {leaderboard.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-600' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.username}</div>
                          <div className="text-sm text-gray-400">Level {user.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{user.totalXP} XP</div>
                        {index < 3 && (
                          <Award className={`h-4 w-4 ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 'text-orange-500'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-white">Quiz Question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">Sample quiz question would appear here...</p>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start"
                      onClick={() => handleQuizAnswer(index)}
                    >
                      Option {index + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveQuiz(null)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}