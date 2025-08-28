"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

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
}

export default function SimpleViewAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({ name: "", description: "" });
  const [showEventForm, setShowEventForm] = useState(false);
  const [slotForm, setSlotForm] = useState({ name: "", date: "", time: "" });
  const [showSlotForm, setShowSlotForm] = useState<string | null>(null);
  const [topicForm, setTopicForm] = useState({ title: "", description: "", instructor: "", maxParticipants: 0 });
  const [showTopicForm, setShowTopicForm] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/event-hub/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editingEvent) {
        response = await fetch(`/event-hub/api/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...eventForm, isActive: editingEvent.isActive }),
        });
      } else {
        response = await fetch("/event-hub/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventForm),
        });
      }
      if (!response.ok) throw new Error();
      fetchEvents();
      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({ name: "", description: "" });
      toast.success(editingEvent ? "Event updated!" : "Event created!");
    } catch {
      toast.error("Failed to save event");
    }
  };

  const handleSlotFormSubmit = async (e: React.FormEvent, eventId: string) => {
    e.preventDefault();
    try {
      const response = await fetch(`/event-hub/api/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...slotForm, eventId }),
      });
      if (!response.ok) throw new Error();
      fetchEvents();
      setShowSlotForm(null);
      setSlotForm({ name: "", date: "", time: "" });
      toast.success("Slot added!");
    } catch {
      toast.error("Failed to add slot");
    }
  };

  const handleTopicFormSubmit = async (e: React.FormEvent, slotId: string) => {
    e.preventDefault();
    try {
      const response = await fetch(`/event-hub/api/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...topicForm, slotId }),
      });
      if (!response.ok) throw new Error();
      fetchEvents();
      setShowTopicForm(null);
      setTopicForm({ title: "", description: "", instructor: "", maxParticipants: 0 });
      toast.success("Topic added!");
    } catch {
      toast.error("Failed to add topic");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-lg tracking-tight">Event Management</h1>
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setShowEventForm(true);
              setEditingEvent(null);
              setEventForm({ name: "", description: "" });
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <FiPlus className="animate-pulse" /> <span>Add Event</span>
          </motion.button>
        </motion.div>

        {/* Event Form */}
        <AnimatePresence>
          {showEventForm && (
            <motion.div
              key={editingEvent ? 'edit' : 'create'}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-blue-100"
            >
              <h2 className="text-xl font-bold mb-4 text-blue-700">{editingEvent ? "Edit Event" : "Create Event"}</h2>
              <form onSubmit={handleEventFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.name}
                    onChange={e => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={eventForm.description}
                    onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event description"
                  />
                </div>
                <div className="flex space-x-3">
                  <motion.button type="submit" whileHover={{ scale: 1.04 }} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-indigo-700">{editingEvent ? "Update" : "Create"}</motion.button>
                  <motion.button type="button" whileHover={{ scale: 1.04 }} onClick={() => { setShowEventForm(false); setEditingEvent(null); }} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events List */}
        <div className="space-y-8">
          <AnimatePresence>
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></span>
                      {event.name}
                    </h3>
                    {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => { setEditingEvent(event); setEventForm({ name: event.name, description: event.description || "" }); setShowEventForm(true); }}
                    className="p-2 text-gray-500 hover:text-blue-600"
                  >
                    <FiEdit />
                  </motion.button>
                </div>
                <div className="mt-4">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                    className="flex items-center text-blue-600 hover:underline text-sm font-medium"
                  >
                    {expandedEvent === event.id ? <FiChevronUp className="transition-transform rotate-180" /> : <FiChevronDown />} Time Slots
                  </motion.button>
                  <AnimatePresence>
                    {expandedEvent === event.id && (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 space-y-4"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setShowSlotForm(event.id)}
                          className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-3 py-1 rounded flex items-center space-x-1 text-xs mb-2 shadow hover:from-green-500 hover:to-blue-500"
                        >
                          <FiPlus /> <span>Add Slot</span>
                        </motion.button>
                        <AnimatePresence>
                          {showSlotForm === event.id && (
                            <motion.form
                              key={event.id}
                              initial={{ opacity: 0, scale: 0.97 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.97 }}
                              onSubmit={e => handleSlotFormSubmit(e, event.id)}
                              className="bg-gray-50 p-3 rounded mb-2 space-y-2 border border-blue-100"
                            >
                              <input type="text" required placeholder="Slot Name" value={slotForm.name} onChange={e => setSlotForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-2 py-1 border rounded" />
                              <input type="date" required value={slotForm.date} onChange={e => setSlotForm(prev => ({ ...prev, date: e.target.value }))} className="w-full px-2 py-1 border rounded" />
                              <input type="time" required value={slotForm.time} onChange={e => setSlotForm(prev => ({ ...prev, time: e.target.value }))} className="w-full px-2 py-1 border rounded" />
                              <div className="flex space-x-2">
                                <motion.button type="submit" whileHover={{ scale: 1.04 }} className="bg-blue-600 text-white px-4 py-1 rounded">Add</motion.button>
                                <motion.button type="button" whileHover={{ scale: 1.04 }} onClick={() => setShowSlotForm(null)} className="bg-gray-300 text-gray-700 px-4 py-1 rounded">Cancel</motion.button>
                              </div>
                            </motion.form>
                          )}
                        </AnimatePresence>
                        <div className="space-y-2">
                          {event.slots.map((slot, sidx) => (
                            <motion.div
                              key={slot.id}
                              initial={{ opacity: 0, x: 30 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 30 }}
                              transition={{ delay: sidx * 0.05, duration: 0.3 }}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded p-3 border border-blue-100 shadow"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-blue-900">{slot.name}</span> <span className="text-xs text-gray-500">({slot.date} {slot.time})</span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  onClick={() => setExpandedSlot(expandedSlot === slot.id ? null : slot.id)}
                                  className="text-blue-600 text-xs flex items-center"
                                >
                                  {expandedSlot === slot.id ? <FiChevronUp className="transition-transform rotate-180" /> : <FiChevronDown />} Topics
                                </motion.button>
                              </div>
                              <AnimatePresence>
                                {expandedSlot === slot.id && (
                                  <motion.div
                                    key={slot.id}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className="mt-2 space-y-2"
                                  >
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      onClick={() => setShowTopicForm(slot.id)}
                                      className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-2 py-1 rounded flex items-center space-x-1 text-xs mb-2 shadow hover:from-blue-500 hover:to-indigo-500"
                                    >
                                      <FiPlus /> <span>Add Topic</span>
                                    </motion.button>
                                    <AnimatePresence>
                                      {showTopicForm === slot.id && (
                                        <motion.form
                                          key={slot.id}
                                          initial={{ opacity: 0, scale: 0.97 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.97 }}
                                          onSubmit={e => handleTopicFormSubmit(e, slot.id)}
                                          className="bg-white p-2 rounded mb-2 space-y-1 border border-blue-100"
                                        >
                                          <input type="text" required placeholder="Title" value={topicForm.title} onChange={e => setTopicForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-2 py-1 border rounded" />
                                          <input type="text" required placeholder="Description" value={topicForm.description} onChange={e => setTopicForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-2 py-1 border rounded" />
                                          <input type="text" required placeholder="Instructor" value={topicForm.instructor} onChange={e => setTopicForm(prev => ({ ...prev, instructor: e.target.value }))} className="w-full px-2 py-1 border rounded" />
                                          <input type="number" required placeholder="Max Participants" value={topicForm.maxParticipants} onChange={e => setTopicForm(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))} className="w-full px-2 py-1 border rounded" />
                                          <div className="flex space-x-2">
                                            <motion.button type="submit" whileHover={{ scale: 1.04 }} className="bg-blue-600 text-white px-4 py-1 rounded">Add</motion.button>
                                            <motion.button type="button" whileHover={{ scale: 1.04 }} onClick={() => setShowTopicForm(null)} className="bg-gray-300 text-gray-700 px-4 py-1 rounded">Cancel</motion.button>
                                          </div>
                                        </motion.form>
                                      )}
                                    </AnimatePresence>
                                    <div className="space-y-1">
                                      {slot.topics.map((topic, tidx) => (
                                        <motion.div
                                          key={topic.id}
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: 20 }}
                                          transition={{ delay: tidx * 0.03, duration: 0.2 }}
                                          className="bg-blue-50 rounded p-2 flex flex-col border border-blue-100"
                                        >
                                          <span className="font-medium text-blue-800">{topic.title}</span>
                                          <span className="text-xs text-gray-500">{topic.instructor}</span>
                                          <span className="text-xs text-gray-500">Max: {topic.maxParticipants}</span>
                                          <span className="text-xs text-gray-400">{topic.description}</span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
