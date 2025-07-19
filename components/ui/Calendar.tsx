
import React from 'react';
import { Event, EventCategory } from '../../types';

interface CalendarProps {
    currentDate: Date;
    events: Event[];
    categoryColors: Record<EventCategory, string>;
}

const CalendarComponent: React.FC<CalendarProps> = ({ currentDate, events, categoryColors }) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getEventsForDay = (day: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === day.getFullYear() &&
                   eventDate.getMonth() === day.getMonth() &&
                   eventDate.getDate() === day.getDate();
        });
    };

    return (
        <div className="bg-dark-bg rounded-lg">
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-dark-text-secondary border-b border-t border-dark-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {paddingDays.map(p => <div key={`pad-${p}`} className="h-32 border-r border-b border-dark-border bg-dark-card/30"></div>)}
                {days.map(day => {
                    const isToday = day.getTime() === today.getTime();
                    const dayEvents = getEventsForDay(day);

                    return (
                        <div key={day.toISOString()} className="h-32 p-2 border-r border-b border-dark-border relative flex flex-col overflow-hidden transition-colors hover:bg-dark-border/30">
                            <span className={`font-semibold text-sm ${isToday ? 'bg-brand-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-dark-text'}`}>
                                {day.getDate()}
                            </span>
                            <div className="mt-1 space-y-1 overflow-y-auto flex-grow">
                                {dayEvents.map(event => (
                                    <div key={event.id} className="group relative">
                                        <div className="flex items-center">
                                            <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${categoryColors[event.category]}`}></span>
                                            <p className="text-xs text-dark-text-secondary truncate">{event.title}</p>
                                        </div>
                                        <div className="absolute left-0 top-5 mb-2 w-max max-w-xs hidden group-hover:block bg-dark-bg text-white text-xs rounded py-1 px-2 border border-dark-border shadow-lg z-10">
                                            <p className="font-bold">{event.title}</p>
                                            {event.description && <p>{event.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarComponent;
