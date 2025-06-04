import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.full_name
      );
      
      if (error) {
        throw error;
      }
      
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      setFormError(error.message || 'Failed to create account. Please try again.');
      toast.error('Registration failed');
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
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create an account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Join FieldSync to manage your field service operations</p>
        </div>
        
        {formError && (
          <div className="bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400 p-3 rounded-lg text-sm">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="text"
              id="full_name"
              name="full_name"
              label="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              leftIcon={<User size={18} className="text-gray-500" />}
              fullWidth
              required
              autoComplete="name"
            />
            
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
              autoComplete="new-password"
            />
            
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              leftIcon={<Lock size={18} className="text-gray-500" />}
              showPasswordToggle
              fullWidth
              required
              autoComplete="new-password"
            />
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              fullWidth
            >
              Create Account
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
            </span>
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;