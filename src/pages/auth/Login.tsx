import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        throw error;
      }
      
      toast.success('Successfully logged in');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setFormError(error.message || 'Failed to sign in. Please check your credentials and try again.');
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-600 text-white flex items-center justify-center rounded-lg mb-4">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sign in to FieldSync</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your field service operations</p>
        </div>
        
        {formError && (
          <div className="bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400 p-3 rounded-lg text-sm">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              id="email"
              name="email"
              label="Email address"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail size={18} className="text-gray-500" />}
              fullWidth
              required
              autoComplete="email"
            />
            
            <Input
              type="password"
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock size={18} className="text-gray-500" />}
              showPasswordToggle
              fullWidth
              required
              autoComplete="current-password"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Forgot your password?
              </a>
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              fullWidth
            >
              Sign in
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
            </span>
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Create one now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;