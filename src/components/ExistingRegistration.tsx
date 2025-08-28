'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiCheck, FiX, FiUser, FiMail, FiClock, FiBookOpen, FiAlertCircle } from 'react-icons/fi';
import RegistrationForm from './RegistrationForm';
import RegistrationConfirmation from './RegistrationConfirmation';

interface Registration {
  id: string;
  email: string;
  name?: string;
  organization?: string;
  slotId: string;
  topicId: string;
  createdAt: string;
  slot: {
    id: string;
    time: string;
    name?: string;
    date?: string;
  };
  topic: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    maxParticipants: number;
  };
}

interface ExistingRegistrationProps {
  registrations: Registration[];
  email: string;
}

export default function ExistingRegistration({ registrations, email }: ExistingRegistrationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [updatedRegistration, setUpdatedRegistration] = useState<{
    email: string;
    name?: string;
    organization?: string;
    selections: Array<{
      slot: string;
      topic: string;
      instructor: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const handleRegistrationComplete = async (newRegistration: {
    email: string;
    name?: string;
    organization?: string;
    selections: Array<{
      slot: string;
      topic: string;
      instructor: string;
    }>;
  }) => {
    setLoading(true);
    setError('');

    try {
      // The RegistrationForm has already handled deleting old registrations and creating new ones
      // Show confirmation message
      setUpdatedRegistration(newRegistration);
      setShowConfirmation(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating registration:', error);
      setError('Failed to update registration');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation && updatedRegistration) {
    return <RegistrationConfirmation registration={updatedRegistration} />;
  }

  if (isEditing) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <FiEdit2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Registration</h2>
          </div>
          <motion.button
            onClick={handleCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            <FiX className="w-4 h-4 mr-2" />
            Cancel
          </motion.button>
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8"
            >
              <div className="flex items-center space-x-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <RegistrationForm 
          email={email} 
          onRegistrationComplete={handleRegistrationComplete}
          existingRegistrations={registrations}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          key="registration-found"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6"
        >
          <FiUser className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-800 mb-3"
        >
          Registration Found
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600"
        >
          You have already registered for workshops with this email address.
        </motion.p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl mb-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-between items-center mb-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <FiCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Your Registration</h3>
          </div>
          <motion.button
            onClick={handleEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            Edit Registration
          </motion.button>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4"
          >
            <div className="flex items-center text-sm font-semibold text-gray-600 mb-2">
              <FiMail className="w-4 h-4 mr-2" />
              Email Address
            </div>
            <p className="text-gray-900 font-medium">{email}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <FiBookOpen className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Your Workshop Selections</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrations.map((registration, index) => (
                <motion.div
                  key={registration.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <FiClock className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700">{registration.slot.time}</span>
                      {registration.slot.date && (
                        <span className="text-xs text-gray-500">{registration.slot.date}</span>
                      )}
                    </div>
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2">{registration.topic.title}</h5>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <FiUser className="w-3 h-3" />
                    <span>Instructor: {registration.topic.instructor}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-center space-x-2 mb-3">
            <FiEdit2 className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">
              Ready to make changes?
            </p>
          </div>
          <p className="text-sm text-blue-700">
            You can edit your registration to change your workshop selections.
          </p>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-xs text-gray-500"
        >
          Note: This application stores data in a database. Your registration information is securely stored.
        </motion.p>
      </motion.div>
    </motion.div>
  );
} 