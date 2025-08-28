'use client';

import { useState, useEffect } from 'react';

interface Slot {
  id: string;
  time: string;
  date?: string;
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

export default function OccupancyTable() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkshopData();
    
    // Update data every 5 seconds for live updates
    const interval = setInterval(fetchWorkshopData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWorkshopData = async () => {
    try {
      const response = await fetch('/event-hub/api/workshop-data');
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching workshop data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Live Workshop Occupancy</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading occupancy data...</p>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Live Workshop Occupancy</h3>
        <div className="text-center py-8 text-gray-600">
          No workshops available
        </div>
      </div>
    );
  }

  // Find the maximum number of topics across all slots
  const maxTopics = Math.max(...slots.map(slot => slot.topics.length));

  return (
    <div className="max-w-6xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Live Workshop Occupancy</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Slot
              </th>
              {Array.from({ length: maxTopics }, (_, index) => (
                <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workshop {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {slots.map((slot) => (
              <tr key={slot.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <div>
                    <div>{slot.time}</div>
                    {slot.date && (
                      <div className="text-xs text-gray-500">{slot.date}</div>
                    )}
                  </div>
                </td>
                {Array.from({ length: maxTopics }, (_, index) => {
                  const topic = slot.topics[index];
                  if (!topic) {
                    return <td key={index} className="px-4 py-3 text-sm text-gray-400">-</td>;
                  }

                  const count = topic._count.registrations;
                  const isFull = count >= topic.maxParticipants;
                  
                  return (
                    <td key={index} className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{topic.title}</div>
                        <div className="text-xs text-gray-600">{topic.instructor}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isFull
                              ? 'bg-red-100 text-red-800'
                              : count >= topic.maxParticipants * 0.8
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {count}/{topic.maxParticipants}
                          </span>
                          {isFull && (
                            <span className="text-xs text-red-600 font-medium">Full</span>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 