'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiCheck } from 'react-icons/fi';

interface EmailInputProps {
  onEmailSubmit: (email: string) => void;
}

export default function EmailInput({ onEmailSubmit }: EmailInputProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
    
    if (value.trim()) {
      setIsValid(validateEmail(value));
    } else {
      setIsValid(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    onEmailSubmit(email.trim().toLowerCase());
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4"
        >
          <FiMail className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-gray-800 mb-2"
        >
          Welcome Back
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600"
        >
          Enter your email to get started with registration
        </motion.p>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="relative">
          <motion.label 
            htmlFor="email" 
            className="block text-sm font-semibold text-gray-700 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Email Address
          </motion.label>
          <div className="relative">
            <motion.input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-4 pl-12 pr-12 border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-200 ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : isValid 
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder="Enter your email address"
              required
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <FiMail className="w-5 h-5" />
            </motion.div>
            {isValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500"
              >
                <FiCheck className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 flex items-center"
            >
              <span className="mr-1">⚠</span>
              {error}
            </motion.p>
          )}
        </div>
        
        <motion.button
          type="submit"
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
            isValid 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <span>Continue</span>
          <motion.div
            animate={isValid ? { x: [0, 5, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <FiArrowRight className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </motion.form>
    </motion.div>
  );
} 