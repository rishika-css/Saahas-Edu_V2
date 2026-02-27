import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { testsAPI } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import BehaviorTracker from '../components/BehaviorTracker';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faMoon, faEye, faShuffle, faClock, faHourglassHalf, faFrown, faTrophy, faHandsClapping, faDumbbell, faClipboardList, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import FocusTileOverlay from '../components/FocusTileOverlay';
import AdhdDetectionModal from '../components/AdhdDetectionModal';
import { useAdhdMouseDetection } from '../hooks/useAdhdMouseDetection';

export default function TestPage() {
  const { user } = useAuth();
  const { setAdhdFocus } = useAccessibility();
  const navigate = useNavigate();

  const [stage, setStage] = useState('loading'); // loading | active | result | error
  const [sessionId, setSessionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // ADHD detection
  const [showAdhdModal, setShowAdhdModal] = useState(false);
  const [adhdDismissed, setAdhdDismissed] = useState(false);

  const handleAdhdDetected = useCallback(() => {
    if (!adhdDismissed && !showAdhdModal) {
      setShowAdhdModal(true);
    }
  }, [adhdDismissed, showAdhdModal]);

  useAdhdMouseDetection(handleAdhdDetected, stage === 'active' && !adhdDismissed);

  // Start test on mount
  useEffect(() => {
    if (!user) return;

    const studentId = user.id || user._id;
    testsAPI.start(studentId)
      .then((data) => {
        setSessionId(data.sessionId);
        setTotalQuestions(data.totalQuestions);
        setTimeRemaining(data.timeAlloted);
        setCurrentQuestion(data.firstQuestion);
        setCurrentIndex(0);
        setStage('active');
      })
      .catch((err) => {
        setError(err.message || 'Failed to start test');
        setStage('error');
      });
  }, [user]);

  const handleAnswer = async (option) => {
    setSelectedAnswer(option);

    // Log rapid skip
    if (window.__logRapidSkip) window.__logRapidSkip();

    try {
      await testsAPI.answer({
        sessionId,
        questionId: currentQuestion._id,
        selected: option,
        timeSpent: 5,
      });
    } catch (err) {
      console.warn('Answer submission failed:', err.message);
    }
  };

  const handleNext = async () => {
    const nextIdx = currentIndex + 1;

    if (nextIdx >= totalQuestions) {
      handleSubmit();
      return;
    }

    try {
      const data = await testsAPI.nextQuestion(sessionId, nextIdx);
      if (data.done) {
        handleSubmit();
        return;
      }
      setCurrentQuestion(data.question);
      setCurrentIndex(data.questionIndex);
      setSelectedAnswer(null);
      if (data.timeRemaining !== undefined) {
        setTimeRemaining(data.timeRemaining);
      }
    } catch (err) {
      console.warn('Next question failed:', err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = await testsAPI.submit(sessionId);
      setResult(data);
      setStage('result');
    } catch (err) {
      setError(err.message || 'Failed to submit test');
      setStage('error');
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
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}><FontAwesomeIcon icon={faHourglassHalf} /></div>
          <p style={{ color: '#7a5c4a', fontWeight: 600 }}>Preparing your test...</p>
          <p style={{ color: '#b5a08a', fontSize: '0.85rem', marginTop: '8px' }}>
            Loading AI models for gaze & behavior tracking...
          </p>
        </div>
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

          {/* Behavior summary */}
          {result.behaviorSummary && (
            <div style={{
              background: '#fff8f0', borderRadius: '12px', padding: '16px',
              marginBottom: '24px', textAlign: 'left',
              border: '1px solid #f0ddd0',
            }}>
              <p style={{ fontWeight: 700, color: '#d9623f', marginBottom: '8px' }}>
                <FontAwesomeIcon icon={faBrain} className="mr-1" /> Behavior Analysis
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: '#7a5c4a' }}>
                {result.behaviorSummary.idleCount > 0 && (
                  <span><FontAwesomeIcon icon={faMoon} className="mr-1" /> Idle moments: {result.behaviorSummary.idleCount}</span>
                )}
                {result.behaviorSummary.gazeAwayCount > 0 && (
                  <span><FontAwesomeIcon icon={faEye} className="mr-1" /> Gaze away: {result.behaviorSummary.gazeAwayCount}</span>
                )}
                {result.behaviorSummary.tabSwitchCount > 0 && (
                  <span><FontAwesomeIcon icon={faShuffle} className="mr-1" /> Tab switches: {result.behaviorSummary.tabSwitchCount}</span>
                )}
                {result.behaviorSummary.timerAdjustments > 0 && (
                  <span><FontAwesomeIcon icon={faClock} className="mr-1" /> Time extensions: {result.behaviorSummary.timerAdjustments}</span>
                )}
              </div>
            </div>
          )}

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
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
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
        <ProgressBar current={currentIndex + 1} total={totalQuestions} />

        {/* Question */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswer={handleAnswer}
          />
        </div>

        {/* Navigation */}
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
            {currentIndex + 1 >= totalQuestions ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Accessibility toolbar (side panel with toggles) */}
      <AccessibilityToolbar />

      {/* ADHD Focus Mode overlay (blurs non-hovered elements) */}
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
      {sessionId && user && (
        <BehaviorTracker
          studentId={user.id || user._id}
          sessionId={sessionId}
          onTimerAdjustment={handleTimerAdjustment}
        />
      )}
    </div>
  );
}