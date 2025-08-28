'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiCopy, FiEye, FiCalendar, FiUsers, FiChevronDown, FiChevronRight, FiMail, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface Event {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  slotId: string; // Added for grouping
  topicId: string; // Added for grouping
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [registrations, setRegistrations] = useState<{ [eventId: string]: Registration[] }>({});
  const [loadingRegistrations, setLoadingRegistrations] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/event-hub/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    if (registrations[eventId]) return; // Already loaded
    
    setLoadingRegistrations(prev => new Set(prev).add(eventId));
    try {
      const response = await fetch(`/event-hub/api/registrations?eventId=${eventId}`);
      const data = await response.json();
      setRegistrations(prev => ({ ...prev, [eventId]: data }));
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to fetch registrations');
    } finally {
      setLoadingRegistrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
      fetchRegistrations(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/event-hub/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      setEvents(prev => [newEvent, ...prev]);
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
      toast.success('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent) return;

    try {
      const response = await fetch(`/event-hub/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isActive: editingEvent.isActive
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      ));
      setEditingEvent(null);
      setFormData({ name: '', description: '' });
      toast.success('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/event-hub/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const copyEventUrl = (uuid: string) => {
    const url = `${window.location.origin}/event-hub/event/${uuid}`;
    navigator.clipboard.writeText(url);
    toast.success('Event URL copied to clipboard!');
  };

  const getTotalRegistrations = (event: Event) => {
    return (event.slots || []).reduce((total, slot) => {
      return total + (slot.topics || []).reduce((slotTotal, topic) => {
        return slotTotal + (topic._count?.registrations || 0);
      }, 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600 mt-2">Create and manage events for registration</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Event</span>
          </motion.button>
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {(showCreateForm || editingEvent) && (
            <motion.div
              key={editingEvent ? 'edit' : 'create'}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter event name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter event description"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingEvent(null);
                      setFormData({ name: '', description: '' });
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyEventUrl(event.uuid)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Copy registration URL"
                    >
                      <FiCopy className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingEvent(event);
                        setFormData({
                          name: event.name,
                          description: event.description || ''
                        });
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit event"
                    >
                      <FiEdit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete event"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4" />
                    <span>Created: {new Date(event.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiUsers className="w-4 h-4" />
                    <span>{event.slots.length} slots, {getTotalRegistrations(event)} registrations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <a
                    href={`/event-hub/event/${event.uuid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View Registration Page</span>
                  </a>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleEventExpansion(event.id)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <span>{expandedEvents.has(event.id) ? 'Hide Details' : 'Show Details'}</span>
                    {expandedEvents.has(event.id) ? (
                      <FiChevronDown className="w-4 h-4" />
                    ) : (
                      <FiChevronRight className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Expandable Details */}
              <AnimatePresence>
                {expandedEvents.has(event.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 bg-gray-50"
                  >
                    <div className="p-6">
                      {/* Topics Section */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                          <FiUsers className="w-4 h-4 mr-2" />
                          Topics & Registrations
                        </h4>
                        <div className="space-y-3">
                          {event.slots.map((slot) => (
                            <div key={slot.id} className="bg-white rounded-lg p-4 border border-gray-200">
                              <h5 className="font-medium text-gray-800 mb-2">
                                {slot.name} - {slot.time}
                              </h5>
                              <div className="space-y-3">
                                {slot.topics.map((topic) => {
                                  // Filter registrations for this specific topic
                                  const topicRegistrations = registrations[event.id]?.filter(
                                    (reg) => reg.slotId === slot.id && reg.topicId === topic.id
                                  ) || [];
                                  
                                  return (
                                    <div key={topic.id} className="border border-gray-100 rounded-lg p-3">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-700">{topic.title}</div>
                                          <div className="text-gray-500 text-xs">{topic.instructor}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-gray-500">
                                            {topicRegistrations.length}/{topic.maxParticipants}
                                          </span>
                                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                            <div 
                                              className="bg-blue-500 h-1.5 rounded-full"
                                              style={{ width: `${(topicRegistrations.length / topic.maxParticipants) * 100}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      {topicRegistrations.length > 0 ? (
                                        <div className="mt-2">
                                          <div className="text-xs text-gray-600 mb-1">Registered Participants:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {topicRegistrations.map((registration) => (
                                              <span
                                                key={registration.id}
                                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                              >
                                                {registration.email}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-400 italic mt-2">No registrations yet</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <FiCalendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600">Create your first event to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
