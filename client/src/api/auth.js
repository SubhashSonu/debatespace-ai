import api from './axios'


export const loginUser = (credentials) => api.post('/auth/login', credentials)

export const registerUser = (userData) => api.post('/auth/register', userData)

export const saveAuthSession = ({ token, user }) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  window.dispatchEvent(new Event('auth-changed'))
}

export const getAuthUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const getAuthToken = () => {
  return localStorage.getItem('token')
}

export const clearAuthSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('auth-changed'))
}

export const getApiErrorMessage = (error) => {
  return error.response?.data?.message || 'Something went wrong. Please try again.'
}
