'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiActivity, FiLoader } from 'react-icons/fi';
import EmailInput from '@/components/EmailInput';
import RegistrationForm from '@/components/RegistrationForm';
import RegistrationConfirmation from '@/components/RegistrationConfirmation';
import ExistingRegistration from '@/components/ExistingRegistration';

interface Event {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  isActive: boolean;
  slots: Slot[];
}

interface Slot {
  id: string;
  name: string;
  date: string;
  time: string;
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
    event: {
      id: string;
      name: string;
    };
  };
  topic: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    maxParticipants: number;
  };
}

type AppState = 'loading' | 'error' | 'email-input' | 'registration-form' | 'confirmation' | 'existing-registration';

export default function EventRegistrationPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const [currentState, setCurrentState] = useState<AppState>('loading');
  const [email, setEmail] = useState('');
  const [registration, setRegistration] = useState<Registration[]>([]);
  const [confirmationData, setConfirmationData] = useState<{
    email: string;
    name?: string;
    organization?: string;
    selections: Array<{
      slot: string;
      topic: string;
      instructor: string;
    }>;
  } | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/event-hub/api/events/${uuid}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Event not found');
        } else {
          setError('Failed to load event');
        }
        setCurrentState('error');
        return;
      }
      
      const eventData = await response.json();
      setEvent(eventData);
      setCurrentState('email-input');
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event');
      setCurrentState('error');
    }
  };

  const handleEmailSubmit = async (submittedEmail: string) => {
    setEmail(submittedEmail);
    setCurrentState('loading');
    
    try {
      // Check if user already has registrations for this event
      const response = await fetch(`/event-hub/api/registrations?email=${encodeURIComponent(submittedEmail)}&eventId=${event?.id}`);
      const existingRegistrations = await response.json();
      
      if (existingRegistrations.length > 0) {
        setRegistration(existingRegistrations);
        setCurrentState('existing-registration');
      } else {
        setCurrentState('registration-form');
      }
    } catch (error) {
      console.error('Error checking existing registrations:', error);
      setCurrentState('registration-form');
    }
  };

  const handleRegistrationComplete = (newRegistration: {
    email: string;
    name?: string;
    organization?: string;
    selections: Array<{
      slot: string;
      topic: string;
      instructor: string;
    }>;
  }) => {
    setConfirmationData(newRegistration);
    setCurrentState('confirmation');
  };



  const renderCurrentState = () => {
    if (currentState === 'loading') {
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
              Loading event...
            </motion.p>
          </div>
        </motion.div>
      );
    }

    if (currentState === 'error') {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-red-100 rounded-full">
              <FiLoader className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">Event Not Found</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      );
    }

    if (!event) return null;

    switch (currentState) {
      case 'email-input':
        return <EmailInput onEmailSubmit={handleEmailSubmit} />;
      
      case 'registration-form':
        return (
          <RegistrationForm 
            email={email} 
            eventId={event.id}
            onRegistrationComplete={handleRegistrationComplete} 
          />
        );
      
      case 'confirmation':
        return confirmationData ? (
          <RegistrationConfirmation registration={confirmationData} />
        ) : null;
      
      case 'existing-registration':
        return registration.length > 0 ? (
          <ExistingRegistration registrations={registration} email={email} />
        ) : null;
      
      default:
        return <EmailInput onEmailSubmit={handleEmailSubmit} />;
    }
  };

  if (!event && currentState !== 'loading' && currentState !== 'error') {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-3 mb-4"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <FiHeart className="w-8 h-8 text-white" />
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
              <FiActivity className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2"
          >
            {event?.name || 'Event Registration'}
          </motion.h1>
          {event?.description && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              {event.description}
            </motion.p>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentState}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentState()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
      </div>
    </div>
  );
}
