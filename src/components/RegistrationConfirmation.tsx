'use client';

import { motion } from 'framer-motion';
import { FiCheck, FiMail, FiUser, FiHome, FiClock, FiBookOpen, FiUserCheck } from 'react-icons/fi';

interface RegistrationConfirmationProps {
  registration: {
    email: string;
    name?: string;
    organization?: string;
    selections: Array<{
      slot: string;
      topic: string;
      instructor: string;
    }>;
  };
}

export default function RegistrationConfirmation({ registration }: RegistrationConfirmationProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6"
        >
          <FiCheck className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-800 mb-3"
        >
          Registration Confirmed!
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600"
        >
          Your workshop registration has been successfully submitted.
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
          className="flex items-center space-x-3 mb-6"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <FiUserCheck className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Registration Details</h3>
        </motion.div>
        
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4"
            >
              <div className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                <FiMail className="w-4 h-4 mr-2" />
                Email Address
              </div>
              <p className="text-gray-900 font-medium">{registration.email}</p>
            </motion.div>
            
            {registration.name && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4"
              >
                <div className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                  <FiUser className="w-4 h-4 mr-2" />
                  Name
                </div>
                <p className="text-gray-900 font-medium">{registration.name}</p>
              </motion.div>
            )}
          </motion.div>
          
          {registration.organization && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4"
            >
              <div className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                <FiHome className="w-4 h-4 mr-2" />
                Organization
              </div>
              <p className="text-gray-900 font-medium">{registration.organization}</p>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <FiBookOpen className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Your Workshop Selections</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registration.selections.map((selection, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <FiClock className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{selection.slot}</span>
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2">{selection.topic}</h5>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <FiUser className="w-3 h-3" />
                    <span>Instructor: {selection.instructor}</span>
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
        transition={{ delay: 1.3 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-center space-x-2 mb-3">
            <FiCheck className="w-5 h-5 text-green-600" />
            <p className="text-sm font-semibold text-green-800">
              Confirmation email sent
            </p>
          </div>
          <p className="text-sm text-green-700">
            You will receive a confirmation email shortly. Please check your spam folder if you don&apos;t see it.
          </p>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-xs text-gray-500"
        >
          Your registration has been saved to our database. You can view your registration details in the admin panel.
        </motion.p>
      </motion.div>
    </motion.div>
  );
} 