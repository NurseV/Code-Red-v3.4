
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Shift, Personnel, Role } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { PlusIcon, ChevronDownIcon } from '../components/icons/Icons';

const shiftColors: Record<Shift['shiftType'], string> = {
    'A Shift': 'bg-blue-500',
    'B Shift': 'bg-green-500',
    'C Shift': 'bg-purple-500',
    'Off': 'bg-gray-500',
};

const DayCell: React.FC<{ day: Date; shifts: Shift[]; onAddShift: (date: Date) => void }> = ({ day, shifts, onAddShift }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = day.getTime() === today.getTime();

    return (
        <div className="h-32 p-2 border-r border-b border-dark-border relative flex flex-col overflow-hidden transition-colors hover:bg-dark-border/30">
            <span className={`font-semibold text-sm ${isToday ? 'bg-brand-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-dark-text'}`}>
                {day.getDate()}
            </span>
            <div className="mt-1 space-y-1 overflow-y-auto flex-grow">
                {shifts.map(shift => (
                    <div key={shift.id} className="flex items-center text-xs p-1 rounded-md" style={{backgroundColor: `${shiftColors[shift.shiftType]}20`}}>
                        <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${shiftColors[shift.shiftType]}`}></span>
                        <p className="truncate" style={{color: `${shiftColors[shift.shiftType].replace('bg-','text-').replace('-500', '-300')}`}}>{shift.personnelName}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => onAddShift(day)} className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                <PlusIcon className="h-4 w-4 text-dark-text-secondary"/>
            </button>
        </div>
    );
};

const CalendarGrid: React.FC<{ currentDate: Date; shifts: Shift[]; onAddShift: (date: Date) => void }> = ({ currentDate, shifts, onAddShift }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getShiftsForDay = (day: Date) => {
        return shifts.filter(shift => new Date(shift.date).toDateString() === day.toDateString());
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
                {days.map(day => (
                    <DayCell key={day.toISOString()} day={day} shifts={getShiftsForDay(day)} onAddShift={onAddShift} />
                ))}
            </div>
        </div>
    );
};


const Scheduling: React.FC = () => {
    const { user } = useInternalAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newShift, setNewShift] = useState({ personnelId: '', date: '', shiftType: 'A Shift' as Shift['shiftType'] });

    const fetchScheduleData = () => {
        setIsLoading(true);
        Promise.all([
            api.getShifts(),
            api.getPersonnelList()
        ]).then(([shiftData, personnelData]) => {
            setShifts(shiftData);
            setPersonnel(personnelData);
            if (personnelData.length > 0) {
                setNewShift(prev => ({...prev, personnelId: personnelData[0].id}));
            }
        }).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchScheduleData();
    }, []);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleOpenAddModal = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        setNewShift(prev => ({ ...prev, date: dateString }));
        setIsModalOpen(true);
    };
    
    const handleAddShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShift.personnelId || !newShift.date) return;
        
        try {
            await api.createShift(newShift);
            setIsModalOpen(false);
            fetchScheduleData();
        } catch(e) {
            alert('Failed to add shift.');
        }
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-dark-border"><ChevronDownIcon className="h-6 w-6 transform -rotate-90" /></button>
                        <h2 className="text-xl font-bold text-dark-text mx-4 w-48 text-center">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-dark-border"><ChevronDownIcon className="h-6 w-6 transform rotate-90" /></button>
                    </div>
                </div>
                {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading schedule...</div> :
                    <CalendarGrid currentDate={currentDate} shifts={shifts} onAddShift={handleOpenAddModal} />
                }
            </Card>

            <Modal title={`Add Shift for ${newShift.date}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleAddShift} className="space-y-4">
                     <div>
                        <label htmlFor="personnelId" className="block text-sm font-medium text-dark-text-secondary mb-1">Personnel</label>
                        <select id="personnelId" value={newShift.personnelId} onChange={e => setNewShift({...newShift, personnelId: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                           {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="shiftType" className="block text-sm font-medium text-dark-text-secondary mb-1">Shift Type</label>
                         <select id="shiftType" value={newShift.shiftType} onChange={e => setNewShift({...newShift, shiftType: e.target.value as Shift['shiftType']})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                           {Object.keys(shiftColors).map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Shift</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Scheduling;
