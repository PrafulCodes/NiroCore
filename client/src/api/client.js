import axios from 'axios'
import toast from 'react-hot-toast'

const client = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

// Global error interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Connection error. Is the server running?')
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // Let the component handle 422 validations directly
    if (status === 422) {
      return Promise.reject(error)
    }

    if (status === 404) {
      toast.error('Subscription not found.')
      if (window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard'
      }
      return Promise.reject(error)
    }

    if (status === 429) {
      toast.error('Too many requests. Please wait.')
      return Promise.reject(error)
    }

    if (status >= 500) {
      toast.error('Something went wrong on our end.')
      return Promise.reject(error)
    }

    if (data && data.error && typeof data.error === 'string') {
      toast.error(data.error)
    }

    return Promise.reject(error)
  }
)

export default client
