'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiDownload, FiLogOut, FiCalendar, FiClock, FiUser, FiMail, FiEye, FiSettings } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface Slot {
  id: string;
  name: string;
  date: string;
  time: string;
  topics: Topic[];
  _count: {
    registrations: number;
  };
  eventId: string;
  event?: {
    id: string;
    name: string;
  };
}

interface Topic {
  id: string;
  title: string;
  description: string;
  instructor: string;
  maxParticipants: number;
  slotId: string;
  _count: {
    registrations: number;
  };
  slot?: Slot;
  eventId: string;
}

interface Registration {
  id: string;
  email: string;
  name?: string;
  organization?: string;
  slotId: string;
  topicId: string;
  createdAt: string;
  slot: Slot;
  topic: Topic;
}

interface EmailGroup {
  email: string;
  registrations: Registration[];
  totalRegistrations: number;
  uniqueSlots: number;
  uniqueTopics: number;
}

interface Event {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'slots' | 'topics' | 'registrations' | 'emailGroups'>('overview');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Form states
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Form data
  const [slotForm, setSlotForm] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    eventId: ''
  });

  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    instructor: '',
    maxParticipants: 15,
    slotId: '',
    eventId: ''
  });

  // Group registrations by email
  const emailGroups: EmailGroup[] = Array.isArray(registrations) 
    ? Object.values(registrations.reduce((groups: { [key: string]: EmailGroup }, registration) => {
        const email = registration.email;
        if (!groups[email]) {
          groups[email] = {
            email,
            registrations: [],
            totalRegistrations: 0,
            uniqueSlots: 0,
            uniqueTopics: 0
          };
        }
        groups[email].registrations.push(registration);
        groups[email].totalRegistrations++;
        return groups;
      }, {}))
    : [];

  // Calculate unique slots and topics for each email group
  emailGroups.forEach(group => {
    const uniqueSlots = new Set(group.registrations.map(r => r.slotId));
    const uniqueTopics = new Set(group.registrations.map(r => r.topicId));
    group.uniqueSlots = uniqueSlots.size;
    group.uniqueTopics = uniqueTopics.size;
  });

  // Sort email groups by total registrations (descending)
  emailGroups.sort((a, b) => b.totalRegistrations - a.totalRegistrations);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotsRes, topicsRes, registrationsRes, eventsRes] = await Promise.all([
        fetch('/event-hub/api/slots'),
        fetch('/event-hub/api/topics'),
        fetch('/event-hub/api/registrations'),
        fetch('/event-hub/api/events')
      ]);

      const slotsData = await slotsRes.json();
      const topicsData = await topicsRes.json();
      const registrationsData = await registrationsRes.json();
      const eventsData = await eventsRes.json();

      // Ensure we have arrays even if the API returns errors
      setSlots(Array.isArray(slotsData) ? slotsData : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error
      setSlots([]);
      setTopics([]);
      setRegistrations([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSlot ? `/event-hub/api/slots/${editingSlot.id}` : '/event-hub/api/slots';
      const method = editingSlot ? 'PUT' : 'POST';

      // Format the time string from start and end times
      const timeString = `${slotForm.startTime} - ${slotForm.endTime}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: slotForm.name,
          date: slotForm.date,
          time: timeString,
          eventId: slotForm.eventId
        })
      });

      if (response.ok) {
        toast.success(editingSlot ? 'Slot updated successfully!' : 'Slot created successfully!');
        setShowSlotForm(false);
        setEditingSlot(null);
        setSlotForm({ name: '', date: '', startTime: '', endTime: '', eventId: '' });
        fetchData();
      } else {
        toast.error('Failed to save slot. Please try again.');
      }
    } catch (error) {
      console.error('Error saving slot:', error);
      toast.error('An error occurred while saving the slot.');
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTopic ? `/event-hub/api/topics/${editingTopic.id}` : '/event-hub/api/topics';
      const method = editingTopic ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm)
      });

      if (response.ok) {
        toast.success(editingTopic ? 'Topic updated successfully!' : 'Topic created successfully!');
        setShowTopicForm(false);
        setEditingTopic(null);
        setTopicForm({ title: '', description: '', instructor: '', maxParticipants: 15, slotId: '', eventId: '' });
        fetchData();
      } else {
        toast.error('Failed to save topic. Please try again.');
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      toast.error('An error occurred while saving the topic.');
    }
  };

  const handleEditSlot = (slot: Slot) => {
    setEditingSlot(slot);
    // Parse the time string to extract start and end times
    const timeParts = slot.time.split(' - ');
    setSlotForm({ 
      name: slot.name,
      date: slot.date,
      startTime: timeParts[0] || '', 
      endTime: timeParts[1] || '',
      eventId: slot.eventId || ''
    });
    setShowSlotForm(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description,
      instructor: topic.instructor,
      maxParticipants: topic.maxParticipants,
      slotId: topic.slotId,
      eventId: topic.slot?.eventId || ''
    });
    setShowTopicForm(true);
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slot? This will also delete all associated topics and registrations.')) {
      return;
    }

    try {
      const response = await fetch(`/event-hub/api/slots/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Slot deleted successfully!');
        fetchData();
      } else {
        toast.error('Failed to delete slot. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('An error occurred while deleting the slot.');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all associated registrations.')) {
      return;
    }

    try {
      const response = await fetch(`/event-hub/api/topics/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Topic deleted successfully!');
        fetchData();
      } else {
        toast.error('Failed to delete topic. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('An error occurred while deleting the topic.');
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) {
      return;
    }
    try {
      const response = await fetch(`/event-hub/api/registrations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Registration deleted successfully!');
        fetchData();
      } else {
        toast.error('Failed to delete registration. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast.error('An error occurred while deleting the registration.');
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['Email', 'Name', 'Organization', 'Slot Name', 'Slot Date', 'Slot Time', 'Topic', 'Instructor'];
      const csvContent = [
        headers.join(','),
        ...(Array.isArray(registrations) ? registrations.map(reg => [
          reg.email,
          reg.name,
          reg.organization || '',
          reg.slot?.name || '',
          reg.slot?.date || '',
          reg.slot?.time || '',
          reg.topic?.title || '',
          reg.topic?.instructor || ''
        ].join(',')) : [])
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workshop-registrations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV file.');
    }
  };

  const handleViewEmailDetails = (email: string) => {
    setSelectedEmail(email);
  };

  const handleBackToEmailGroups = () => {
    setSelectedEmail(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Workshop Management System</p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/event-hub/admin/events/manage"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <FiSettings className="w-4 h-4" />
              <span>Manage Events</span>
            </Link>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <FiDownload className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Registrations</h3>
            <p className="text-3xl font-bold text-blue-600">{registrations.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Slots</h3>
            <p className="text-3xl font-bold text-green-600">{slots.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Topics</h3>
            <p className="text-3xl font-bold text-purple-600">{topics.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Unique Emails</h3>
            <p className="text-3xl font-bold text-orange-600">{emailGroups.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'slots', label: 'Time Slots' },
                { id: 'topics', label: 'Topics' },
                { id: 'registrations', label: 'Registrations' },
                { id: 'emailGroups', label: 'Email Groups' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'slots' | 'topics' | 'registrations' | 'emailGroups')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <a
                        href="/event-hub/admin/events"
                        className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        Manage Events
                      </a>
                      <button
                        onClick={() => setActiveTab('slots')}
                        className="block w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Manage Time Slots
                      </button>
                      <button
                        onClick={() => setActiveTab('topics')}
                        className="block w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Manage Topics
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Latest Registration</span>
                        <span className="text-sm font-medium">
                          {registrations.length > 0 
                            ? new Date(registrations[0]?.createdAt).toLocaleDateString()
                            : 'No registrations yet'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Events</span>
                        <span className="text-sm font-medium">View in Events Management</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">System Status</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'slots' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Time Slots</h2>
                  <button
                    onClick={() => {
                      setShowSlotForm(true);
                      setEditingSlot(null);
                      setSlotForm({ name: '', date: '', startTime: '', endTime: '', eventId: '' });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Slot</span>
                  </button>
                </div>

                {showSlotForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">
                      {editingSlot ? 'Edit Slot' : 'Add New Slot'}
                    </h3>
                    <form onSubmit={handleSlotSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiUser className="inline w-4 h-4 mr-2" />
                          Slot Name
                        </label>
                        <input
                          type="text"
                          value={slotForm.name}
                          onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
                          placeholder="e.g., Morning Session, Afternoon Workshop"
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiCalendar className="inline w-4 h-4 mr-2" />
                            Date
                          </label>
                          <input
                            type="date"
                            value={slotForm.date}
                            onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event
                          </label>
                          <select
                            value={slotForm.eventId}
                            onChange={(e) => setSlotForm({ ...slotForm, eventId: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select an event</option>
                            {events.map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiClock className="inline w-4 h-4 mr-2" />
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={slotForm.startTime}
                            onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiClock className="inline w-4 h-4 mr-2" />
                            End Time
                          </label>
                          <input
                            type="time"
                            value={slotForm.endTime}
                            onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          {editingSlot ? 'Update' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSlotForm(false);
                            setEditingSlot(null);
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topics
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registrations
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(slots) && slots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <FiUser className="w-4 h-4 mr-2 text-blue-500" />
                              {slot.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 mr-2 text-purple-500" />
                              {slot.event?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 mr-2 text-green-500" />
                              {slot.date}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <FiClock className="w-4 h-4 mr-2 text-purple-500" />
                              <div>
                                <div>{slot.time}</div>
                                {slot.date && (
                                  <div className="text-xs text-gray-500">{slot.date}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {slot.topics?.length || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {slot._count?.registrations || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditSlot(slot)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'topics' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Topics</h2>
                  <button
                    onClick={() => {
                      setShowTopicForm(true);
                      setEditingTopic(null);
                      setTopicForm({ title: '', description: '', instructor: '', maxParticipants: 15, slotId: '', eventId: '' });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Topic</span>
                  </button>
                </div>

                {showTopicForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">
                      {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                    </h3>
                    <form onSubmit={handleTopicSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            value={topicForm.title}
                            onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Instructor</label>
                          <input
                            type="text"
                            value={topicForm.instructor}
                            onChange={(e) => setTopicForm({ ...topicForm, instructor: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={topicForm.description}
                          onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Event</label>
                          <select
                            value={topicForm.eventId}
                            onChange={(e) => setTopicForm({ ...topicForm, eventId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select an event</option>
                            {events.map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Slot</label>
                          <select
                            value={topicForm.slotId}
                            onChange={(e) => setTopicForm({ ...topicForm, slotId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select a slot</option>
                            {Array.isArray(slots) && slots.map((slot) => (
                              <option key={slot.id} value={slot.id}>
                                {slot.name} - {slot.date} ({slot.time})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Max Participants</label>
                          <input
                            type="number"
                            value={topicForm.maxParticipants}
                            onChange={(e) => setTopicForm({ ...topicForm, maxParticipants: parseInt(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          {editingTopic ? 'Update' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTopicForm(false);
                            setEditingTopic(null);
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instructor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Max Participants
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registrations
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(topics) && topics.map((topic) => {
                        const slot = Array.isArray(slots) ? slots.find(s => s.id === topic.slotId) : null;
                        return (
                          <tr key={topic.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{topic.title}</div>
                                <div className="text-sm text-gray-500">{topic.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {topic.instructor}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <FiCalendar className="w-4 h-4 mr-2 text-purple-500" />
                                {topic.slot?.event?.name || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div className="font-medium">{slot?.name}</div>
                                <div className="text-gray-500">{slot?.date} - {slot?.time}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {topic.maxParticipants}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {topic._count?.registrations || 0}/{topic.maxParticipants}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditTopic(topic)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTopic(topic.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'registrations' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Registrations</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(registrations) && registrations.map((registration) => (
                        <tr key={registration.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {registration.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {registration.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {registration.organization || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{registration.slot?.name}</div>
                              <div className="text-gray-500">{registration.slot?.date} - {registration.slot?.time}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {registration.topic?.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(registration.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteRegistration(registration.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete registration"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'emailGroups' && (
              <div>
                {selectedEmail ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleBackToEmailGroups}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                        >
                          <FiEye className="w-4 h-4" />
                          <span>← Back to Email Groups</span>
                        </button>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Registrations for: {selectedEmail}
                        </h2>
                      </div>
                    </div>

                    {/* Email Details Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Organization
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Slot
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Topic
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Instructor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Registration Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {emailGroups
                            .find(group => group.email === selectedEmail)
                            ?.registrations.map((registration) => (
                              <tr key={registration.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {registration.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {registration.organization || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div>
                                    <div className="font-medium">{registration.slot?.name}</div>
                                    <div className="text-gray-500">{registration.slot?.date} - {registration.slot?.time}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {registration.topic?.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {registration.topic?.instructor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(registration.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleDeleteRegistration(registration.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete registration"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Groups</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Registrations
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unique Slots
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unique Topics
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {emailGroups.map((group) => (
                            <tr key={group.email} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <div className="flex items-center">
                                  <FiMail className="w-4 h-4 mr-2 text-blue-500" />
                                  {group.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {group.totalRegistrations}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {group.uniqueSlots}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {group.uniqueTopics}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewEmailDetails(group.email)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center space-x-2"
                                >
                                  <FiEye className="w-4 h-4" />
                                  <span>View Details</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 