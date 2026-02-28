import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { testsAPI } from '../services/api';
import { getRandomQuestions } from '../data/questions';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import BehaviorTracker from '../components/BehaviorTracker';
import ActionFeedPanel from '../components/ActionFeedPanel';
import useBehaviourAI from '../hooks/useBehaviourAI';
import BehaviourInsightPanel from '../components/mentalheath/BehaviourInsightPanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHourglassHalf, faFrown, faTrophy, faHandsClapping,
  faDumbbell, faClipboardList, faCheck, faTimes
} from '@fortawesome/free-solid-svg-icons';
import FocusTileOverlay from '../components/FocusTileOverlay';
import AdhdDetectionModal from '../components/AdhdDetectionModal';
import { useAdhdMouseDetection } from '../hooks/useAdhdMouseDetection';

export default function TestPage() {
  const { user } = useAuth();
  const { setAdhdFocus } = useAccessibility();
  const navigate = useNavigate();

  const [stage, setStage] = useState('loading'); // loading | active | result | error
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]); // { questionId, selected, isCorrect, timeSpent }
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const TIME_ALLOTED = 600; // seconds

  // Tracker-ready gating
  const [trackerReady, setTrackerReady] = useState(false);
  const questionsReady = useRef(false);

  // ADHD detection
  const [showAdhdModal, setShowAdhdModal] = useState(false);
  const [adhdDismissed, setAdhdDismissed] = useState(false);

  // Action feed
  const { addAction, Panel: actionPanel } = ActionFeedPanel();

  // AIML behaviour tracking
  const { getScores, latched } = useBehaviourAI() || {};
  const scores = getScores ? getScores() : null;

  const handleAdhdDetected = useCallback(() => {
    if (!adhdDismissed && !showAdhdModal) {
      setShowAdhdModal(true);
    }
  }, [adhdDismissed, showAdhdModal]);

  useAdhdMouseDetection(handleAdhdDetected, stage === 'active' && !adhdDismissed);

  // ── Load local questions on mount ──
  useEffect(() => {
    if (!user) return;
    try {
      const qs = getRandomQuestions(10);
      if (qs.length === 0) {
        setError('No questions available');
        setStage('error');
        return;
      }
      setQuestions(qs);
      setTimeRemaining(TIME_ALLOTED);
      questionsReady.current = true;
      // If tracker is already ready, go active immediately
      if (trackerReady) {
        setStage('active');
      }
    } catch (err) {
      setError(err.message || 'Failed to load questions');
      setStage('error');
    }
  }, [user]);

  // ── When tracker becomes ready, start if questions are loaded ──
  useEffect(() => {
    if (trackerReady && questionsReady.current && stage === 'loading') {
      setStage('active');
    }
  }, [trackerReady, stage]);

  const handleTrackerReady = useCallback(() => {
    setTrackerReady(true);
  }, []);

  // ── Action callbacks from BehaviorTracker ──
  const handleAction = useCallback((type, detail) => {
    addAction(type, detail);
  }, [addAction]);

  const currentQuestion = questions[currentIndex] || null;

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
    if (window.__logRapidSkip) window.__logRapidSkip();

    const isCorrect = option === currentQuestion?.answer;

    // Record answer locally
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === currentQuestion._id);
      const entry = { questionId: currentQuestion._id, selected: option, isCorrect, timeSpent: 5 };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = entry;
        return updated;
      }
      return [...prev, entry];
    });
  };

  const handleNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      handleSubmit();
      return;
    }
    setCurrentIndex(nextIdx);
    setSelectedAnswer(null);
  };

  const handleSubmit = async () => {
    // Calculate results locally
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = questions.length;
    const score = Math.round((correct / total) * 100);

    const questionResults = questions.map((q) => {
      const ans = answers.find((a) => a.questionId === q._id);
      return {
        question: q.content,
        options: q.options,
        correct: q.answer,
        selected: ans ? ans.selected : "Not answered",
        isCorrect: ans ? ans.isCorrect : false,
        timeSpent: ans ? ans.timeSpent : 0,
      };
    });

    const resultData = {
      score,
      correct,
      total,
      results: questionResults,
      behaviorSummary: null, // behavior is tracked separately
    };

    setResult(resultData);
    setStage('result');

    // Save score to DB for dashboard stats (fire-and-forget)
    try {
      await testsAPI.saveResult({
        score,
        correct,
        total,
        timeAlloted: TIME_ALLOTED,
        timeRemaining,
      });
    } catch (err) {
      console.warn('Could not save test result to DB:', err.message);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  const handleTimerAdjustment = useCallback((newTime) => {
    setTimeRemaining(newTime);
  }, []);

  // --- LOADING ---
  if (stage === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#fdf6f0',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px', color: '#f4845f' }}>
            <FontAwesomeIcon icon={faHourglassHalf} className="fa-spin" />
          </div>
          <p style={{ color: '#7a5c4a', fontWeight: 600, fontSize: '1.1rem' }}>Preparing your test...</p>
          <p style={{ color: '#b5a08a', fontSize: '0.85rem', marginTop: '8px' }}>
            Loading AI models for gaze & behavior tracking...
          </p>
          <div style={{
            width: 200, height: 6, background: '#f0ddd0',
            borderRadius: 999, overflow: 'hidden', margin: '16px auto 0',
          }}>
            <div style={{
              height: '100%', width: '60%',
              background: 'linear-gradient(90deg, #f4845f, #f9b49a)',
              borderRadius: 999,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>

        {/* BehaviorTracker mounts during loading so the AI model starts loading */}
        {user && (
          <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 999 }}>
            <BehaviorTracker
              studentId={user.id || user._id}
              sessionId="loading"
              onTimerAdjustment={() => { }}
              onTrackerReady={handleTrackerReady}
              onAction={handleAction}
            />
          </div>
        )}
      </div>
    );
  }

  // --- ERROR ---
  if (stage === 'error') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#fdf6f0',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}><FontAwesomeIcon icon={faFrown} /></div>
          <h2 style={{ color: '#d9623f', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: '#7a5c4a', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #f4845f, #f9b49a)',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '12px 24px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- RESULT ---
  if (stage === 'result' && result) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fdf6f0', padding: '40px 20px',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
            {result.score >= 80 ? <FontAwesomeIcon icon={faTrophy} style={{ color: '#f9ca24' }} /> : result.score >= 50 ? <FontAwesomeIcon icon={faHandsClapping} style={{ color: '#f0932b' }} /> : <FontAwesomeIcon icon={faDumbbell} style={{ color: '#eb4d4b' }} />}
          </div>
          <h1 style={{ color: '#3d2c1e', fontSize: '2rem', marginBottom: '8px' }}>
            Test Complete!
          </h1>
          <div style={{
            fontSize: '3rem', fontWeight: '900', color: '#f4845f', marginBottom: '16px',
          }}>
            {result.score}%
          </div>
          <p style={{ color: '#7a5c4a', marginBottom: '16px' }}>
            You got {result.correct} out of {result.total} correct
          </p>

          {/* Question review */}
          <div style={{ textAlign: 'left' }}>
            {result.results?.map((r, i) => (
              <div key={i} style={{
                padding: '16px', marginBottom: '12px',
                borderRadius: '12px', background: 'white',
                border: `2px solid ${r.isCorrect ? '#5cb85c' : '#e74c3c'}`,
              }}>
                <p style={{ fontWeight: 600, marginBottom: '8px', color: '#3d2c1e' }}>
                  {i + 1}. {r.question}
                </p>
                <p style={{ fontSize: '0.9rem', color: r.isCorrect ? '#5cb85c' : '#e74c3c' }}>
                  Your answer: {r.selected} {r.isCorrect ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}
                </p>
                {!r.isCorrect && (
                  <p style={{ fontSize: '0.85rem', color: '#5cb85c' }}>
                    Correct answer: {r.correct}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '24px',
              background: 'linear-gradient(135deg, #f4845f, #f9b49a)',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '14px 32px', fontWeight: '700', fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE TEST ---
  return (
    <div style={{
      minHeight: '100vh', background: '#fdf6f0', padding: '24px 20px',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px',
        }}>
          <h2 style={{ color: '#3d2c1e', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
            <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Adaptive Test
          </h2>
          <Timer
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            onTimeUp={handleTimeUp}
          />
        </div>

        {/* Progress */}
        <ProgressBar current={currentIndex + 1} total={questions.length} />

        {/* Main content — question + side panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginTop: 20 }}>
          {/* Left — Question + Nav */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <QuestionCard
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                onAnswer={handleAnswer}
              />
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: '24px', gap: '12px',
            }}>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px 24px', borderRadius: '12px',
                  border: '2px solid #f0ddd0', background: 'white',
                  color: '#7a5c4a', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Submit Test
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                style={{
                  padding: '12px 32px', borderRadius: '12px',
                  border: 'none',
                  background: selectedAnswer
                    ? 'linear-gradient(135deg, #f4845f, #f9b49a)'
                    : '#e0d5cc',
                  color: 'white', fontWeight: 700, cursor: selectedAnswer ? 'pointer' : 'default',
                  opacity: selectedAnswer ? 1 : 0.6,
                }}
              >
                {currentIndex + 1 >= questions.length ? 'Finish' : 'Next →'}
              </button>
            </div>
          </div>

          {/* Right — Live Action Feed + AIML Insight */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {actionPanel}

            <div style={{
              background: 'rgba(255,255,255,0.95)', borderRadius: 14,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '14px 16px',
            }}>
              <BehaviourInsightPanel scores={scores} latched={latched} />
            </div>
          </div>
        </div>
      </div>

      {/* ADHD Focus Mode overlay */}
      <FocusTileOverlay />

      {/* AI-powered ADHD Detection Modal */}
      {showAdhdModal && (
        <AdhdDetectionModal
          onConfirm={() => {
            setAdhdFocus(true);
            setShowAdhdModal(false);
            setAdhdDismissed(true);
          }}
          onDismiss={() => {
            setShowAdhdModal(false);
            setAdhdDismissed(true);
          }}
        />
      )}

      {/* Behavior tracker (camera + AI gaze monitoring) */}
      {user && (
        <BehaviorTracker
          studentId={user.id || user._id}
          sessionId="local-test"
          onTimerAdjustment={handleTimerAdjustment}
          onTrackerReady={handleTrackerReady}
          onAction={handleAction}
        />
      )}
    </div>
  );
}