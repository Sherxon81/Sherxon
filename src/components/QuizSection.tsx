import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, AlertCircle, Award, ChevronRight, Loader2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  min_score: number;
}

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizSectionProps {
  userId: number;
  onQuizPassed?: () => void;
}

export default function QuizSection({ userId, onQuizPassed }: QuizSectionProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; certificate?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => {
        setQuizzes(data);
        setIsLoading(false);
      });
  }, []);

  const startQuiz = async (quiz: Quiz) => {
    setIsLoading(true);
    const res = await fetch(`/api/quizzes/${quiz.id}/questions`);
    const data = await res.json();
    setQuestions(data);
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setIsLoading(false);
  };

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [questions[currentQuestionIndex].id]: optionIndex });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, quizId: selectedQuiz?.id, answers })
      });
      const data = await res.json();
      setResult(data);
      if (data.passed) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });
        if (onQuizPassed) onQuizPassed();
      }
    } catch (error) {
      console.error("Quiz submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !selectedQuiz) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-cyber-blue animate-spin" />
      </div>
    );
  }

  return (
    <section id="quizzes" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
          🎓 TESTLAR VA <span className="text-cyber-purple">SERTIFIKATLAR</span>
        </h2>
        <p className="text-slate-400">Bilimingizni sinab ko'ring va xalqaro darajadagi sertifikatlarga ega bo'ling.</p>
      </div>

      {!selectedQuiz ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-cyber-purple/50 transition-all group">
              <div className="w-12 h-12 bg-cyber-purple/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="text-cyber-purple w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">{quiz.title}</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">{quiz.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20 uppercase tracking-widest">
                  {quiz.category}
                </span>
                <button 
                  onClick={() => startQuiz(quiz)}
                  className="text-cyber-purple text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Boshlash <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="quiz-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                    Savol {currentQuestionIndex + 1} / {questions.length}
                  </div>
                  <button 
                    onClick={() => setSelectedQuiz(null)}
                    className="text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Chiqish
                  </button>
                </div>

                <h3 className="text-2xl font-display font-bold text-white mb-8">
                  {questions[currentQuestionIndex].question}
                </h3>

                <div className="space-y-4 mb-12">
                  {questions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full p-5 rounded-xl border text-left transition-all ${
                        answers[questions[currentQuestionIndex].id] === idx
                          ? 'border-cyber-purple bg-cyber-purple/10 text-white shadow-[0_0_15px_rgba(188,19,254,0.1)]'
                          : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                          answers[questions[currentQuestionIndex].id] === idx
                            ? 'border-cyber-purple text-cyber-purple'
                            : 'border-slate-600 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        {option}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="h-1 flex-1 bg-white/5 rounded-full mr-8 overflow-hidden">
                    <div 
                      className="h-full bg-cyber-purple transition-all duration-500"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      disabled={answers[questions[currentQuestionIndex].id] === undefined}
                      className="cyber-button cyber-button-primary px-8 py-3 disabled:opacity-50"
                    >
                      Keyingisi
                    </button>
                  ) : (
                    <button
                      onClick={submitQuiz}
                      disabled={answers[questions[currentQuestionIndex].id] === undefined || isSubmitting}
                      className="cyber-button cyber-button-primary px-8 py-3 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Yakunlash
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="quiz-result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-12 rounded-3xl border border-white/10 text-center"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${
                  result.passed ? 'bg-cyber-green/10 text-cyber-green' : 'bg-cyber-red/10 text-cyber-red'
                }`}>
                  {result.passed ? <Trophy className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
                </div>

                <h3 className="text-3xl font-display font-black mb-2 uppercase">
                  {result.passed ? 'Tabriklaymiz!' : 'Yana bir bor urunib ko\'ring'}
                </h3>
                <p className="text-slate-400 mb-8">
                  Sizning natijangiz: <span className={`font-bold ${result.passed ? 'text-cyber-green' : 'text-cyber-red'}`}>{result.score}%</span>
                </p>

                {result.passed && result.certificate && (
                  <div className="bg-white/5 border border-cyber-purple/30 rounded-2xl p-8 mb-8">
                    <Award className="w-12 h-12 text-cyber-purple mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">Sertifikat Tayyor!</h4>
                    <p className="text-xs text-slate-500 font-mono mb-6">ID: {result.certificate.id}</p>
                    <button className="cyber-button cyber-button-primary w-full py-3">
                      Sertifikatni Yuklab Olish
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => setSelectedQuiz(null)}
                  className="text-slate-500 hover:text-white transition-colors font-mono text-sm uppercase tracking-widest"
                >
                  Asosiy sahifaga qaytish
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
