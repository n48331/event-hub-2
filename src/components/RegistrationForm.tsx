'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiClock, FiUsers, FiUser, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface Slot {
  id: string;
  time: string;
  date?: string;
  maxParticipants: number;
  topics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  description: string;
  instructor: string;
  maxParticipants: number;
  _count: {
    registrations: number;
  };
}

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

interface RegistrationFormProps {
  email: string;
  eventId?: string;
  onRegistrationComplete: (registration: {
    email: string;
    name?: string;
    organization?: string;
    selections: Array<{
      slot: string;
      topic: string;
      instructor: string;
    }>;
  }) => void;
  existingRegistrations?: Registration[];
}

export default function RegistrationForm({ email, eventId, onRegistrationComplete, existingRegistrations = [] }: RegistrationFormProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<{ [slotId: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkshopData = useCallback(async () => {
    try {
      const timestamp = Date.now();
      const url = eventId ? `/event-hub/api/slots?eventId=${eventId}&t=${timestamp}` : `/event-hub/api/workshop-data?t=${timestamp}`;
      const response = await fetch(url);
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching workshop data:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchWorkshopData();
  }, [fetchWorkshopData]);

  useEffect(() => {
    // Pre-select existing registrations
    if (existingRegistrations.length > 0) {
      const initialSelections: { [slotId: string]: string } = {};
      existingRegistrations.forEach(reg => {
        initialSelections[reg.slotId] = reg.topicId;
      });
      setSelectedTopics(initialSelections);
    }
  }, [existingRegistrations]);

  const handleTopicSelection = (slotId: string, topicId: string) => {
    setSelectedTopics(prev => {
      const current = prev[slotId];
      
      // If clicking on the same topic that's already selected, remove it
      if (current === topicId) {
        const newSelections = { ...prev };
        delete newSelections[slotId];
        return newSelections;
      }
      
      // Otherwise, select the new topic
      return {
        ...prev,
        [slotId]: topicId
      };
    });

    // Clear error for this slot
    if (errors[slotId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[slotId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Check if at least one topic is selected
    const hasSelection = Object.keys(selectedTopics).length > 0;
    if (!hasSelection) {
      newErrors.general = 'Please select at least one workshop';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // If we have existing registrations, delete them first
      if (existingRegistrations.length > 0) {
        const deletePromises = existingRegistrations.map(reg => 
          fetch(`/event-hub/api/registrations/${reg.id}`, { method: 'DELETE' })
        );
        await Promise.all(deletePromises);
      }

      // Create registrations for each selected topic
      const registrationPromises = Object.entries(selectedTopics).map(([slotId, topicId]) =>
        fetch('/event-hub/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            slotId,
            topicId
          })
        })
      );

      const responses = await Promise.all(registrationPromises);
      const results = await Promise.all(responses.map(r => r.json()));
      
      const hasError = responses.some(response => !response.ok);
      const errorMessages = results
        .filter((result, index) => !responses[index].ok)
        .map(result => result.error)
        .join(', ');

      if (hasError) {
        throw new Error(errorMessages || 'Some registrations failed');
      }

      // Get the created registrations
      const createdRegistrations = results.filter((result, index) => responses[index].ok);

      // Prepare summary for email
      const summary = createdRegistrations.map((reg) => ({
        event: reg.slot?.event?.name || '',
        slot: reg.slot?.name || reg.slot?.time || '',
        topic: reg.topic?.title || '',
        date: reg.slot?.date || '',
        time: reg.slot?.time || '',
      }));

      // Send summary email (single email)
      try {
        await fetch('/event-hub/api/registrations/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: createdRegistrations[0]?.name || '',
            registrations: summary,
            isUpdate: existingRegistrations.length > 0,
          }),
        });
      } catch (e) {
        // Optionally handle email error
        console.error('Error sending summary email:', e);
      }

      // Refresh workshop data to update registration counts
      await fetchWorkshopData();

      // Create a summary registration object for the confirmation page
      const registration = {
        email,
        registrations: Array.isArray(createdRegistrations) ? createdRegistrations : [],
        selections: Object.entries(selectedTopics).map(([slotId, topicId]) => {
          const slot = slots.find(s => s.id === slotId);
          const topic = slot?.topics.find(t => t.id === topicId);
          const slotDisplay = slot?.date && slot?.time 
            ? `${slot.date} - ${slot.time}`
            : slot?.time || '';
          return {
            slot: slotDisplay,
            topic: topic?.title || '',
            instructor: topic?.instructor || ''
          };
        }).filter(selection => selection.slot && selection.topic && selection.instructor)
      };

      toast.success('Registration submitted successfully!');
      onRegistrationComplete(registration);
    } catch (error) {
      console.error('Error submitting registration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="flex flex-col items-center space-y-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-lg"
          >
            Loading workshop data...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (slots.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mb-4"
        >
          <FiAlertCircle className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          No Workshops Available
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600"
        >
          There are currently no workshops available for registration.
        </motion.p>
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
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4"
        >
          <FiClock className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-800 mb-2"
        >
          {existingRegistrations.length > 0 ? 'Edit Workshop Registration' : 'Workshop Registration'}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center space-x-2 text-gray-600"
        >
          <FiMail className="w-4 h-4" />
          <span>{email}</span>
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {existingRegistrations.length > 0 && (
          <motion.div 
            key="existing-registration"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-800 mb-1">Editing Existing Registration</h3>
                <p className="text-sm text-blue-700">
                  Click on a selected workshop to remove it, or click on a different workshop to change your selection.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Workshop Selections */}
        <div className="space-y-6">
          {slots.map((slot, index) => (
            <motion.div 
              key={slot.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{slot.time}</h3>
                  {slot.date && (
                    <p className="text-sm text-gray-600">{slot.date}</p>
                  )}
                </div>
              </div>
              
              <AnimatePresence>
                {errors[slot.id] && (
                  <motion.p 
                    key={slot.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-sm mb-4 flex items-center"
                  >
                    <FiAlertCircle className="w-4 h-4 mr-2" />
                    {errors[slot.id]}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slot.topics.map((topic, topicIndex) => {
                  const isSelected = selectedTopics[slot.id] === topic.id;
                  const isFull = topic._count?.registrations >= topic.maxParticipants;
                  const count = topic._count?.registrations || 0;
                  const percentage = (count / topic.maxParticipants) * 100;

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 + topicIndex * 0.05 }}
                      whileHover={!isFull ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!isFull ? { scale: 0.98 } : {}}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                          : isFull
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                      }`}
                      onClick={() => {
                        if (!isFull) {
                          handleTopicSelection(slot.id, topic.id);
                        }
                      }}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <FiCheck className="w-3 h-3 text-white" />
                        </motion.div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-800 text-sm leading-tight">{topic.title}</h4>
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-3 h-3 text-gray-500" />
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isFull
                              ? 'bg-red-100 text-red-800'
                              : percentage >= 80
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {count}/{topic.maxParticipants}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{topic.description}</p>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <FiUser className="w-3 h-3" />
                        <span>{topic.instructor}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.5 + topicIndex * 0.1 }}
                            className={`h-1.5 rounded-full ${
                              isFull
                                ? 'bg-red-500'
                                : percentage >= 80
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.p 
                            key="selected"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="text-xs text-blue-600 font-medium mt-2 flex items-center"
                          >
                            <FiCheck className="w-3 h-3 mr-1" />
                            Selected
                          </motion.p>
                        )}
                        {isFull && (
                          <motion.p 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="text-xs text-red-600 font-medium mt-2 flex items-center"
                          >
                            <FiAlertCircle className="w-3 h-3 mr-1" />
                            Full
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {errors.general && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-center space-x-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FiLoader className="w-5 h-5" />
                </motion.div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>{existingRegistrations.length > 0 ? 'Update Registration' : 'Submit Registration'}</span>
                <FiCheck className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
} 