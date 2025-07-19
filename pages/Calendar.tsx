

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Card from '../components/ui/Card';
import * as api from '../services/api';
import { Event, EventCategory, EventStatus, Role, Shift, Personnel, Apparatus } from '../types';
import Button from '../components/ui/Button';
import { useInternalAuth } from '../hooks/useInternalAuth';
import Modal from '../components/ui/Modal';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, FileDownIcon, PrinterIcon } from '../components/icons/Icons';
import { createPortal } from 'react-dom';

// --- UTILS & HELPERS ---
const categoryColors: Record<EventCategory, string> = {
    [EventCategory.TRAINING]: 'bg-blue-500',
    [EventCategory.MAINTENANCE]: 'bg-yellow-500',
    [EventCategory.PUBLIC_EVENT]: 'bg-green-500',
    [EventCategory.MANUAL]: 'bg-purple-500',
    [EventCategory.SHIFT]: 'bg-gray-700',
};
type ViewMode = 'month' | 'week' | 'day' | 'agenda';

// --- SUB-COMPONENTS ---
const MoreEventsPopover: React.FC<{
    anchorEl: HTMLElement | null;
    events: Event[];
    date: Date;
    onClose: () => void;
}> = ({ anchorEl, events, date, onClose }) => {
    if (!anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'fixed',
        top: `${rect.bottom + 5}px`,
        left: `${rect.left}px`,
        zIndex: 50,
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/30" onClick={onClose}>
            <div
                style={style}
                className="bg-dark-card border border-dark-border rounded-lg shadow-2xl w-64 p-2"
                onClick={(e) => e.stopPropagation()}
            >
                <h4 className="font-bold text-dark-text text-sm mb-2 px-2">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                    {events.map(event => <CalendarEventItem key={event.id} event={event} />)}
                </div>
            </div>
        </div>,
        document.body
    );
};

const CalendarEventItem: React.FC<{ event: Event, showTime?: boolean, onDragStart?: (e: React.DragEvent<HTMLDivElement>, eventId: string) => void }> = React.memo(({ event, showTime = true, onDragStart }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (onDragStart) onDragStart(e, event.id);
    };

    const printClasses = `event-print-item event-print-${event.category.toLowerCase().replace(' ', '-')}`;

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className={`group/item relative cursor-pointer ${printClasses}`}
        >
            <div className={`flex items-center text-xs p-1 rounded-md`} style={{ backgroundColor: `${categoryColors[event.category]}20` }}>
                <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${categoryColors[event.category]}`}></span>
                <p className="truncate" style={{ color: `${categoryColors[event.category].replace('bg-','text-').replace('-500', '-300').replace('-700', '-400')}` }}>
                    {showTime && !event.isAllDay && `${new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} `}{event.title}
                </p>
            </div>
            {event.description && <div className="absolute left-0 bottom-full mb-2 w-max max-w-xs hidden group-hover/item:block bg-dark-bg text-white text-xs rounded py-1 px-2 border border-dark-border shadow-lg z-10">{event.description}</div>}
        </div>
    );
});


// --- MAIN CALENDAR COMPONENT ---
const Calendar: React.FC = () => {
    const { user } = useInternalAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
    const [allApparatus, setAllApparatus] = useState<Apparatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Record<EventCategory, boolean>>(Object.values(EventCategory).reduce((acc, cat) => ({...acc, [cat]: true}), {} as any));
    const [popoverState, setPopoverState] = useState<{ anchorEl: HTMLElement | null, date: Date, events: Event[] }>({ anchorEl: null, date: new Date(), events: [] });
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);

    // Data Fetching
    const fetchCombinedData = useCallback(() => {
        setIsLoading(true);
        Promise.all([
            api.getEvents(),
            api.getShifts(),
            api.getPersonnelList(),
            api.getApparatusList(),
        ]).then(([eventsData, shiftsData, personnelData, apparatusData]) => {
            const shiftEvents: Event[] = shiftsData.map((shift: Shift) => ({
                id: `shift-${shift.id}`,
                title: `${shift.personnelName} (${shift.shiftType})`,
                date: shift.date,
                isAllDay: true,
                category: EventCategory.SHIFT,
            }));
            setAllEvents([...eventsData, ...shiftEvents]);
            setAllPersonnel(personnelData);
            setAllApparatus(apparatusData);
        }).finally(() => setIsLoading(false));
    }, []);

    useEffect(() => { fetchCombinedData(); }, [fetchCombinedData]);

    // Memos for derived state
    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const filterMatch = filters[event.category];
            const searchMatch = searchTerm ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return filterMatch && searchMatch;
        });
    }, [allEvents, filters, searchTerm]);
    
    // Handlers
    const handleNavigate = (direction: 'next' | 'prev' | 'today') => {
        if (direction === 'today') {
            setCurrentDate(new Date());
            return;
        }
        const newDate = new Date(currentDate);
        const increment = direction === 'next' ? 1 : -1;
        
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + increment);
        if (viewMode === 'week') newDate.setDate(newDate.getDate() + (7 * increment));
        if (viewMode === 'day') newDate.setDate(newDate.getDate() + increment);
        
        setCurrentDate(newDate);
    };

    const handleToggleFilter = (category: EventCategory) => setFilters(prev => ({ ...prev, [category]: !prev[category] }));

    const handleOpenEventModal = (date: Date, event?: Partial<Event>) => {
        setEditingEvent(event || {
            date: date.toISOString(),
            isAllDay: true,
            category: EventCategory.MANUAL,
            assignedPersonnelIds: [],
            assignedApparatusIds: [],
        });
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = async (eventToSave: Partial<Event>) => {
        try {
            if (eventToSave.id && !eventToSave.id.startsWith('shift-')) {
                await api.updateEvent(eventToSave.id, eventToSave);
            } else {
                await api.createEvent(eventToSave as any);
            }
            fetchCombinedData();
            setIsEventModalOpen(false);
            setEditingEvent(null);
        } catch (e) {
            alert('Failed to save event.');
        }
    };
    
    const handleDragDrop = async (eventId: string, newDate: Date) => {
        const eventToUpdate = allEvents.find(e => e.id === eventId);
        if (!eventToUpdate || eventToUpdate.id.startsWith('shift-')) {
            alert("Shift schedules cannot be rescheduled from the calendar.");
            return;
        };
        
        const originalDate = new Date(eventToUpdate.date);
        const updatedDate = new Date(newDate);
        updatedDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());

        const updatedEvent = { ...eventToUpdate, date: updatedDate.toISOString() };
        if(eventToUpdate.endDate) {
            const duration = new Date(eventToUpdate.endDate).getTime() - originalDate.getTime();
            updatedEvent.endDate = new Date(updatedDate.getTime() + duration).toISOString();
        }

        setAllEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
        
        try {
            await api.updateEvent(eventId, { date: updatedEvent.date, endDate: updatedEvent.endDate });
        } catch (e) {
            alert("Failed to update event. Reverting.");
            setAllEvents(prev => prev.map(e => e.id === eventId ? eventToUpdate : e));
        }
    };
    
    const handleSubscribe = (eventsToExport: Event[]) => {
        generateIcsFile(eventsToExport);
    };

    const renderView = () => {
        switch (viewMode) {
            case 'month': return <MonthView currentDate={currentDate} events={filteredEvents} onOpenModal={handleOpenEventModal} onShowMore={setPopoverState} onDrop={handleDragDrop} />;
            case 'week': return <WeekView currentDate={currentDate} events={filteredEvents} onOpenModal={handleOpenEventModal} />;
            case 'day': return <DayView currentDate={currentDate} events={filteredEvents} onOpenModal={handleOpenEventModal} />;
            case 'agenda': return <AgendaView events={filteredEvents} onOpenModal={handleOpenEventModal} />;
            default: return <MonthView currentDate={currentDate} events={filteredEvents} onOpenModal={handleOpenEventModal} onShowMore={setPopoverState} onDrop={handleDragDrop} />;
        }
    };
    
    return (
      <div className="printable-content h-full flex flex-col bg-dark-card rounded-lg">
        <div className="flex h-full">
            <div className="w-56 pr-6 flex-shrink-0 no-print">
                <Card title="Event Filters" className="!p-4 bg-dark-card border-none shadow-none">
                    <div className="space-y-2">
                        {Object.values(EventCategory).map(category => (
                            <label key={category} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-dark-border">
                                <input type="checkbox" checked={filters[category]} onChange={() => handleToggleFilter(category)} className={`h-4 w-4 rounded border-gray-500 focus:ring-transparent ${categoryColors[category]}`} />
                                <span className="text-dark-text text-sm">{category}</span>
                            </label>
                        ))}
                    </div>
                </Card>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="no-print p-4">
                    <CalendarHeader viewMode={viewMode} setViewMode={setViewMode} currentDate={currentDate} onNavigate={handleNavigate} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAddEvent={() => handleOpenEventModal(new Date())} onPrint={() => window.print()} onSubscribe={() => handleSubscribe(filteredEvents)} canAdd={user?.role !== Role.FIREFIGHTER} />
                </div>
                {isLoading ? <div className="text-center p-8">Loading...</div> : <div className="flex-grow flex flex-col">{renderView()}</div>}
            </div>

            <MoreEventsPopover {...popoverState} onClose={() => setPopoverState({ anchorEl: null, date: new Date(), events: [] })} />
            {isEventModalOpen && <EventModal event={editingEvent} allEvents={allEvents} personnel={allPersonnel} apparatus={allApparatus} onSave={handleSaveEvent} onClose={() => setIsEventModalOpen(false)} />}
        </div>
      </div>
    );
};


// --- HEADER ---
const CalendarHeader: React.FC<{
    viewMode: ViewMode;
    setViewMode: (v: ViewMode) => void;
    currentDate: Date;
    onNavigate: (dir: 'next' | 'prev' | 'today') => void;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    onAddEvent: () => void;
    onPrint: () => void;
    onSubscribe: () => void;
    canAdd: boolean;
}> = ({ viewMode, setViewMode, currentDate, onNavigate, searchTerm, setSearchTerm, onAddEvent, onPrint, onSubscribe, canAdd }) => (
    <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => onNavigate('prev')}><ChevronLeftIcon className="h-5 w-5" /></Button>
            <Button variant="ghost" onClick={() => onNavigate('today')} className="text-sm px-4">Today</Button>
            <Button variant="ghost" onClick={() => onNavigate('next')}><ChevronRightIcon className="h-5 w-5" /></Button>
            <h2 className="text-xl font-bold text-dark-text ml-4 w-48 text-left">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div className="relative flex-grow max-w-xs mt-4 md:mt-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
            <input type="text" placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text" />
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <div className="p-1 bg-dark-bg border border-dark-border rounded-lg flex items-center">
                {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(v => (
                    <Button key={v} size="sm" variant={viewMode === v ? 'primary' : 'ghost'} onClick={() => setViewMode(v)} className="capitalize !px-3">{v}</Button>
                ))}
            </div>
            {canAdd && <Button onClick={onAddEvent} icon={<PlusIcon className="h-4 w-4 mr-2" />}>Add Event</Button>}
            <Button variant="secondary" onClick={onSubscribe} icon={<FileDownIcon className="h-4 w-4 mr-2" />}>Subscribe</Button>
            <Button variant="secondary" onClick={onPrint} icon={<PrinterIcon className="h-4 w-4 mr-2"/>}>Print</Button>
        </div>
    </div>
);

// --- VIEWS ---
const MonthView: React.FC<{ currentDate: Date, events: Event[], onOpenModal: (d: Date) => void, onShowMore: any, onDrop: any }> = ({ currentDate, events, onOpenModal, onShowMore, onDrop }) => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1));
    const handleDragStart = (e: React.DragEvent, eventId: string) => { e.dataTransfer.setData("eventId", eventId); };
    
    return (
        <div className="flex-grow grid grid-cols-7 border-t border-l border-dark-border calendar-month-grid calendar-print-bg">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-dark-text-secondary border-r border-b border-dark-border calendar-print-header calendar-print-text-secondary calendar-print-border">{day}</div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`pad-${i}`} className="border-r border-b border-dark-border bg-dark-bg/30 calendar-print-grid-cell"></div>)}
            {days.map(day => {
                const dayEvents = events.filter(e => new Date(e.date).toDateString() === day.toDateString()).sort((a,b) => (a.isAllDay ? -1 : 1));
                const isToday = new Date().toDateString() === day.toDateString();
                return (
                    <div key={day.toISOString()} onDragOver={e => e.preventDefault()} onDrop={(e) => onDrop(e.dataTransfer.getData("eventId"), day)} onClick={() => onOpenModal(day)} className="min-h-[8rem] p-1 border-r border-b border-dark-border relative flex flex-col overflow-hidden transition-colors hover:bg-dark-border/30 group calendar-print-border">
                        <span className={`font-semibold text-sm self-end ${isToday ? 'bg-brand-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-dark-text'}`}>{day.getDate()}</span>
                        <div className="mt-1 space-y-1 overflow-y-auto flex-grow">
                            {dayEvents.slice(0, 3).map(event => <CalendarEventItem key={event.id} event={event} onDragStart={handleDragStart} />)}
                            {dayEvents.length > 3 && (
                                <button onClick={(e) => { e.stopPropagation(); onShowMore({ anchorEl: e.currentTarget, date: day, events: dayEvents }) }} className="text-xs text-blue-400 hover:underline text-left w-full px-1">
                                    + {dayEvents.length - 3} more
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const WeekView: React.FC<{ currentDate: Date, events: Event[], onOpenModal: (d: Date) => void }> = ({ currentDate, events, onOpenModal }) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = Array.from({ length: 7 }).map((_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });

    const hours = Array.from({ length: 24 }).map((_, i) => i);
    const dayHeight = 24 * 60; // Total minutes in a day for height calculation

    return (
        <div className="flex-grow flex flex-col time-grid-print">
            {/* Header */}
            <div className="flex">
                <div className="w-16 flex-shrink-0"></div>
                {days.map(day => (
                    <div key={day.toISOString()} className="flex-1 text-center p-2 border-b border-l border-dark-border">
                        <p className="text-sm font-semibold">{day.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                        <p className={`text-xl font-bold ${new Date().toDateString() === day.toDateString() ? 'text-brand-primary' : ''}`}>{day.getDate()}</p>
                    </div>
                ))}
            </div>
            {/* Body */}
            <div className="flex flex-grow overflow-y-auto">
                <div className="w-16 flex-shrink-0">
                    {hours.map(hour => (
                        <div key={hour} className="h-16 text-right pr-2 border-r border-dark-border time-slot-print">
                            <span className="text-xs text-dark-text-secondary relative -top-2 time-label-print">{hour === 0 ? '' : `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'am' : 'pm'}`}</span>
                        </div>
                    ))}
                </div>
                {days.map(day => {
                    const dayEvents = events.filter(e => new Date(e.date).toDateString() === day.toDateString());
                    const allDayEvents = dayEvents.filter(e => e.isAllDay);
                    const timedEvents = dayEvents.filter(e => !e.isAllDay);
                    return (
                        <div key={day.toISOString()} className="flex-1 border-l border-dark-border day-column-print">
                            <div className="border-b border-dark-border p-1 space-y-1 min-h-8">
                                {allDayEvents.map(event => <CalendarEventItem key={event.id} event={event} showTime={false}/>)}
                            </div>
                            <div className="relative">
                                {hours.map(hour => <div key={hour} className="h-16 border-b border-dashed border-dark-border/50 time-slot-print"></div>)}
                                {timedEvents.map(event => {
                                    const start = new Date(event.date);
                                    const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000);
                                    const top = (start.getHours() * 60 + start.getMinutes()) / dayHeight * 100;
                                    const height = Math.max(20, (end.getTime() - start.getTime()) / (1000 * 60)) / dayHeight * 100;
                                    
                                    return (
                                        <div key={event.id} className="absolute w-full px-1 timed-event-print" style={{ top: `${top}%`, height: `${height}%` }}>
                                             <CalendarEventItem event={event} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
};


const DayView: React.FC<{ currentDate: Date, events: Event[], onOpenModal: (d: Date) => void }> = ({ currentDate, events, onOpenModal }) => {
    const hours = Array.from({ length: 24 }).map((_, i) => i);
    const dayHeight = 24 * 60;
    const dayEvents = events.filter(e => new Date(e.date).toDateString() === currentDate.toDateString());
    const allDayEvents = dayEvents.filter(e => e.isAllDay);
    const timedEvents = dayEvents.filter(e => !e.isAllDay);

    return (
         <div className="flex-grow flex flex-col time-grid-print">
            <div className="flex-shrink-0 border-b border-dark-border p-2 min-h-8">
                {allDayEvents.map(event => <CalendarEventItem key={event.id} event={event} showTime={false}/>)}
            </div>
            <div className="flex flex-grow overflow-y-auto">
                 <div className="w-16 flex-shrink-0">
                    {hours.map(hour => (
                        <div key={hour} className="h-16 text-right pr-2 border-r border-dark-border time-slot-print">
                             <span className="text-xs text-dark-text-secondary relative -top-2 time-label-print">{hour === 0 ? '' : `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'am' : 'pm'}`}</span>
                        </div>
                    ))}
                </div>
                <div className="relative flex-1">
                    {hours.map(hour => <div key={hour} className="h-16 border-b border-dashed border-dark-border/50 time-slot-print"></div>)}
                    {timedEvents.map(event => {
                        const start = new Date(event.date);
                        const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000);
                        const top = (start.getHours() * 60 + start.getMinutes()) / dayHeight * 100;
                        const height = Math.max(20, (end.getTime() - start.getTime()) / (1000 * 60)) / dayHeight * 100;
                        return (
                            <div key={event.id} className="absolute w-full px-1 timed-event-print" style={{ top: `${top}%`, height: `${height}%` }}>
                                <CalendarEventItem event={event} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}


const AgendaView: React.FC<{ events: Event[], onOpenModal: (d:Date, e: Partial<Event>) => void }> = ({ events, onOpenModal }) => {
    const groupedEvents = useMemo(() => {
        const groups = events.reduce((acc, event) => {
            const date = new Date(event.date).toDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(event);
            return acc;
        }, {} as Record<string, Event[]>);
        return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
    }, [events]);

    return (
        <div className="p-4 space-y-4">
            {groupedEvents.map(([date, dayEvents]) => (
                <div key={date}>
                    <h3 className="font-bold text-dark-text border-b border-dark-border pb-1 mb-2">
                        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="space-y-2">
                        {dayEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                            <button key={event.id} onClick={() => onOpenModal(new Date(event.date), event)} className="w-full text-left">
                                <CalendarEventItem event={event} />
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            {groupedEvents.length === 0 && <p className="text-center text-dark-text-secondary py-8">No events to show.</p>}
        </div>
    )
}

// --- MODAL ---
const EventModal: React.FC<{ event: Partial<Event> | null; allEvents: Event[]; personnel: Personnel[]; apparatus: Apparatus[]; onSave: (event: Partial<Event>) => void; onClose: () => void }> = ({ event, allEvents, personnel, apparatus, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Event>>(event || {});
    
    useEffect(() => { setFormData(event || {}); }, [event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    };

    const handleMultiSelectChange = (name: 'assignedPersonnelIds' | 'assignedApparatusIds', id: string) => {
        const currentIds = formData[name] || [];
        const newIds = currentIds.includes(id) ? currentIds.filter(i => i !== id) : [...currentIds, id];
        setFormData(prev => ({...prev, [name]: newIds}));
    };
    
    return (
        <Modal title={event?.id ? 'Edit Event' : 'Add New Event'} isOpen={true} onClose={onClose} containerClassName="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Input label="Title" name="title" value={formData.title || ''} onChange={handleChange} />
                    <Select label="Category" name="category" value={formData.category} onChange={handleChange}>
                        {Object.values(EventCategory).filter(c => c !== EventCategory.SHIFT).map(cat => <option key={cat}>{cat}</option>)}
                    </Select>
                    <label className="flex items-center"><input type="checkbox" name="isAllDay" checked={formData.isAllDay} onChange={handleChange} className="mr-2"/> All-day event</label>
                    <Input label="Start" name="date" type={formData.isAllDay ? 'date' : 'datetime-local'} value={(formData.isAllDay ? formData.date?.split('T')[0] : formData.date?.substring(0,16)) || ''} onChange={handleChange} />
                    {!formData.isAllDay && <Input label="End" name="endDate" type="datetime-local" value={formData.endDate?.substring(0,16) || ''} onChange={handleChange} />}
                    <Input label="Location" name="location" value={formData.location || ''} onChange={handleChange} />
                    <Textarea label="Description" name="description" value={formData.description || ''} onChange={handleChange} />
                </div>
                <div className="space-y-4">
                    <MultiSelect title="Assigned Personnel" items={personnel} selectedIds={formData.assignedPersonnelIds || []} onToggle={(id) => handleMultiSelectChange('assignedPersonnelIds', id)} />
                    <MultiSelect title="Assigned Apparatus" items={apparatus.map(a => ({id: a.id, name: a.unitId}))} selectedIds={formData.assignedApparatusIds || []} onToggle={(id) => handleMultiSelectChange('assignedApparatusIds', id)} />
                </div>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-dark-border space-x-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={() => onSave(formData)}>Save Event</Button>
            </div>
        </Modal>
    );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div><label className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label><input {...props} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm" /></div>
);
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div><label className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label><select {...props} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm">{children}</select></div>
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div><label className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label><textarea {...props} rows={3} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm" /></div>
);
const MultiSelect: React.FC<{ title: string, items: {id: string, name: string}[], selectedIds: string[], onToggle: (id: string) => void }> = ({ title, items, selectedIds, onToggle }) => (
    <div>
        <h4 className="font-medium text-dark-text-secondary mb-1">{title}</h4>
        <div className="p-2 border border-dark-border rounded-md bg-dark-bg max-h-40 overflow-y-auto space-y-1">
            {items.map(item => (
                <label key={item.id} className="flex items-center space-x-2 p-1 rounded hover:bg-dark-border cursor-pointer">
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onToggle(item.id)} />
                    <span className="text-sm">{item.name}</span>
                </label>
            ))}
        </div>
    </div>
);

const generateIcsFile = (events: Event[]) => {
    const formatTime = (dateStr: string) => new Date(dateStr).toISOString().replace(/-|:|\.\d{3}/g, '');
    let icsBody = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//FireOMS//NONSGML v1.0//EN',
    ];

    events.forEach(event => {
        icsBody.push('BEGIN:VEVENT');
        icsBody.push(`UID:${event.id}@fire-oms.com`);
        icsBody.push(`DTSTAMP:${formatTime(new Date().toISOString())}`);
        icsBody.push(`DTSTART:${formatTime(event.date)}`);
        if (event.endDate) {
            icsBody.push(`DTEND:${formatTime(event.endDate)}`);
        }
        icsBody.push(`SUMMARY:${event.title}`);
        if(event.description) icsBody.push(`DESCRIPTION:${event.description}`);
        if(event.location) icsBody.push(`LOCATION:${event.location}`);
        icsBody.push('END:VEVENT');
    });

    icsBody.push('END:VCALENDAR');

    const blob = new Blob([icsBody.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'fire_department_calendar.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default Calendar;
