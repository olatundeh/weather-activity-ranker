import { useState } from 'react';
import { MapPin } from 'lucide-react';
import DayCard from './DayCard.jsx';

export default function ActivityRankings({ rankings }) {
  const [expandedDay, setExpandedDay] = useState(0);

  const { location, days } = rankings;

  const toggleDay = (index) => {
    setExpandedDay(expandedDay === index ? -1 : index);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <MapPin size={16} className="text-blue-600" />
          <span className="font-semibold text-slate-800">{location.name}</span>
          {location.country && (
            <span className="text-slate-500">{location.country}</span>
          )}
          <span className="text-xs text-slate-400">
            ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {days.map((day, index) => (
          <DayCard
            key={day.date}
            day={day}
            isExpanded={expandedDay === index}
            onToggle={() => toggleDay(index)}
            isToday={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
