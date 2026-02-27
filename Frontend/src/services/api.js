const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('token');

async function request(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-auth-token': token } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || 'Something went wrong');
  }

  return data;
}

export const authAPI = {
  register: (userData) =>
    request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request('/users/me'),
};

export const coursesAPI = {
  getAll: () => request('/courses'),

  getById: (id) => request(`/courses/${id}`),

  create: (courseData) =>
    request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),
};

export const testsAPI = {
  start: (studentId) =>
    request('/tests/start', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),

  nextQuestion: (sessionId, currentIndex) =>
    request(`/tests/next/${sessionId}?currentIndex=${currentIndex}`),

  answer: (data) =>
    request('/tests/answer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submit: (sessionId) =>
    request('/tests/submit', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),
};

export const behaviorAPI = {
  log: (data) =>
    request('/behavior/log', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};