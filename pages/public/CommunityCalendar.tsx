
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import { Event, EventCategory } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, ListChecksIcon, ShieldCheckIcon } from '../../components/icons/Icons';

type ViewMode = 'month' | 'list';

// Helper function to generate calendar links
const generateCalendarLink = (service: 'google' | 'ics', event: Event): string => {
    const formatTime = (dateStr: string) => new Date(dateStr).toISOString().replace(/-|:|\.\d{3}/g, '');
    const startTime = formatTime(event.date);
    const endTime = event.endDate ? formatTime(event.endDate) : formatTime(new Date(new Date(event.date).getTime() + 60 * 60 * 1000).toISOString()); // Default to 1 hour

    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || '');

    if (service === 'google') {
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    }

    if (service === 'ics') {
        const icsBody = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `URL:${document.location.href}`,
            `DTSTART:${startTime}`,
            `DTEND:${endTime}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description || ''}`,
            `LOCATION:${event.location || ''}`,
            'END:VEVENT',
            'END:VCALENDAR',
        ].join('\n');
        return `data:text/calendar;charset=utf8,${encodeURIComponent(icsBody)}`;
    }

    return '#';
};

const MonthView: React.FC<{ currentDate: Date; events: Event[], onEventClick: (event: Event) => void }> = ({ currentDate, events, onEventClick }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getEventsForDay = (day: Date) => {
        return events.filter(event => new Date(event.date).toDateString() === day.toDateString());
    };

    return (
        <div className="bg-dark-bg rounded-lg">
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-dark-text-secondary border-b border-t border-dark-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {paddingDays.map(p => <div key={`pad-${p}`} className="h-28 md:h-32 border-r border-b border-dark-border bg-dark-card/30"></div>)}
                {days.map(day => {
                    const isToday = day.getTime() === today.getTime();
                    const dayEvents = getEventsForDay(day);

                    return (
                        <div key={day.toISOString()} className="h-28 md:h-32 p-2 border-r border-b border-dark-border relative flex flex-col overflow-hidden">
                            <span className={`font-semibold text-sm ${isToday ? 'bg-brand-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-dark-text'}`}>
                                {day.getDate()}
                            </span>
                            <div className="mt-1 space-y-1 overflow-y-auto flex-grow">
                                {dayEvents.map(event => (
                                    <button key={event.id} onClick={() => onEventClick(event)} className="w-full text-left group relative focus:outline-none">
                                        <div className="flex items-center bg-green-500/20 p-1 rounded-md">
                                            <span className="w-2 h-2 rounded-full mr-2 flex-shrink-0 bg-green-400"></span>
                                            <p className="text-xs text-green-300 truncate">{event.title}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
};

const ListView: React.FC<{ events: Event[], onEventClick: (event: Event) => void }> = ({ events, onEventClick }) => {
    const sortedEvents = [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return (
         <div className="space-y-3">
             {sortedEvents.length > 0 ? sortedEvents.map(event => (
                <button key={event.id} onClick={() => onEventClick(event)} className="w-full text-left block bg-dark-card border border-dark-border p-4 rounded-lg hover:bg-dark-border/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between">
                         <div>
                            <p className="font-bold text-dark-text">{event.title}</p>
                            <p className="text-sm text-dark-text-secondary">{event.location}</p>
                         </div>
                         <div className="text-left sm:text-right mt-2 sm:mt-0">
                            <p className="text-sm text-dark-text">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            <p className="text-sm text-dark-text-secondary">{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                    </div>
                </button>
             )) : (
                <p className="text-center text-dark-text-secondary py-8">No events scheduled for this month.</p>
             )}
         </div>
    )
};


const CommunityCalendar: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        setIsLoading(true);
        api.getPublicEvents()
            .then(setEvents)
            .finally(() => setIsLoading(false));
    }, []);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleEventClick = (event: Event) => setSelectedEvent(event);

    const monthlyEvents = useMemo(() => {
        return events.filter(e => new Date(e.date).getMonth() === currentDate.getMonth() && new Date(e.date).getFullYear() === currentDate.getFullYear());
    }, [events, currentDate]);
    
    const ViewSwitcherButton: React.FC<{ mode: ViewMode, icon: React.ReactNode }> = ({ mode, icon }) => (
        <button
            onClick={() => setViewMode(mode)}
            className={`p-2 rounded-md transition-colors ${viewMode === mode ? 'bg-brand-primary text-white' : 'bg-dark-card hover:bg-dark-border'}`}
            aria-label={`Switch to ${mode} view`}
        >
            {icon}
        </button>
    );

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b border-dark-border">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-dark-border"><ArrowLeftIcon className="h-6 w-6" /></button>
                        <h2 className="text-xl font-bold text-dark-text mx-4 w-48 text-center">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-dark-border"><ArrowRightIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="flex items-center space-x-2">
                       <ViewSwitcherButton mode="month" icon={<CalendarIcon className="h-5 w-5"/>}/>
                       <ViewSwitcherButton mode="list" icon={<ListChecksIcon className="h-5 w-5"/>}/>
                    </div>
                </div>
                 {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading events...</div> :
                    viewMode === 'month' ? <MonthView currentDate={currentDate} events={monthlyEvents} onEventClick={handleEventClick} /> :
                    <ListView events={monthlyEvents} onEventClick={handleEventClick} />
                 }
            </Card>

            {selectedEvent && (
                <Modal title={selectedEvent.title} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold text-dark-text">Date & Time</p>
                            <p className="text-dark-text-secondary">{new Date(selectedEvent.date).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-dark-text">Location</p>
                            <p className="text-dark-text-secondary">{selectedEvent.location || 'N/A'}</p>
                        </div>
                        {selectedEvent.description && (
                            <div>
                                <p className="font-semibold text-dark-text">Description</p>
                                <p className="text-dark-text-secondary">{selectedEvent.description}</p>
                            </div>
                        )}
                        <div className="pt-4 border-t border-dark-border">
                            <p className="font-semibold text-dark-text mb-2">Add to Your Calendar</p>
                            <div className="flex space-x-2">
                                <a href={generateCalendarLink('google', selectedEvent)} target="_blank" rel="noopener noreferrer" className="flex-1">
                                    <Button variant="secondary" className="w-full">Google Calendar</Button>
                                </a>
                                 <a href={generateCalendarLink('ics', selectedEvent)} download={`${selectedEvent.title}.ics`} className="flex-1">
                                    <Button variant="secondary" className="w-full">Outlook/iCal</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default CommunityCalendar;