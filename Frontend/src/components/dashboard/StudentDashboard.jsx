import { useEffect, useState } from 'react';
import StatsWidget from './StatsWidget';
import ProgressCard from './ProgressCard';
import ActivityFeed from './ActivityFeed';
import Card from '../common/Card';
import { coursesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
export default function StudentDashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    coursesAPI.getAll()
      .then(data => setCourses(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsWidget
          label="Courses Available"
          value={loading ? '...' : courses.length}
          icon="📚"
          color="purple"
        />
        <StatsWidget label="Current Streak" value="7d" icon="🔥" color="orange" />
        <StatsWidget label="Quiz Score Avg" value="82%" icon="🎯" color="blue" />
        <StatsWidget label="Hours Learned" value="34" icon="⏱️" color="green" />
      </div>
      {/* Give Test Banner */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '2.5rem' }}>📝</span>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Adaptive Test Curator</h3>
              <p className="text-gray-500 text-sm">
                AI-powered adaptive test that adjusts to your learning pace and focus.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/test')}
            style={{
              background: 'linear-gradient(135deg, #f4845f, #f9b49a)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(244,132,95,0.3)',
              transition: 'all 0.2s'
            }}
          >
            Give Test 🚀
          </button>
        </div>
      </Card>
      {/* Accessibility Profile Card */}
      {user?.accessibilityProfile && (
        <Card>
          <h3 className="font-semibold text-gray-700 mb-3">
            Your Accessibility Profile
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full capitalize">
              {user.accessibilityProfile.disabilityType || 'none'} support
            </span>
            {Object.entries(user.accessibilityProfile.preferences || {}).map(([key, val]) =>
              val ? (
                <span
                  key={key}
                  className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full capitalize"
                >
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()} ✓
                </span>
              ) : null
            )}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Courses from real API */}
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Available Courses</h3>

          {loading && (
            <div className="flex items-center gap-3 py-6 justify-center">
              <div className="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading courses...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-500 text-sm font-medium">Failed to load courses</p>
              <p className="text-red-400 text-xs mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <span className="text-4xl">📭</span>
              <p className="text-gray-400 text-sm mt-3 font-medium">No courses yet</p>
              <p className="text-gray-300 text-xs mt-1">
                Ask your instructor to add some
              </p>
            </div>
          )}

          <div className="space-y-3">
            {courses.map(course => (
              <div
                key={course._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-700 text-sm">{course.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">by {course.instructor}</p>
                  {course.description && (
                    <p className="text-gray-300 text-xs mt-0.5 line-clamp-1">
                      {course.description}
                    </p>
                  )}
                </div>
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full whitespace-nowrap ml-3">
                  {course.modules?.length ?? 0} modules
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity — still static for now */}
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Recent Activity</h3>
          <ActivityFeed />
        </Card>
      </div>

      {/* Learning Progress */}
      <Card>
        <h3 className="font-semibold text-gray-700 mb-4">Learning Progress</h3>
        <div className="space-y-4">
          <ProgressCard subject="Braille" progress={75} color="purple" />
          <ProgressCard subject="Sign Language" progress={50} color="blue" />
          <ProgressCard subject="Communication Skills" progress={60} color="green" />
        </div>
      </Card>
    </div>
  );
}