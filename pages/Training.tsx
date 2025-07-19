
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { TrainingCourse, ScheduledTraining, Personnel } from '../types';
import { PlusIcon, PrinterIcon, EditIcon, XIcon } from '../components/icons/Icons';

const CourseCatalogTab: React.FC = () => {
    const [courses, setCourses] = useState<TrainingCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);
    const [modalData, setModalData] = useState({ name: '', description: '', durationHours: '', isRequired: false });

    const fetchCourses = () => {
        setIsLoading(true);
        api.getTrainingCourses().then(setCourses).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const openAddModal = () => {
        setEditingCourse(null);
        setModalData({ name: '', description: '', durationHours: '', isRequired: false });
        setIsModalOpen(true);
    };

    const openEditModal = (course: TrainingCourse) => {
        setEditingCourse(course);
        setModalData({ name: course.name, description: course.description, durationHours: String(course.durationHours), isRequired: course.isRequired || false });
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const courseData = {
            ...modalData,
            durationHours: parseInt(modalData.durationHours, 10) || 0,
        };
        try {
            if (editingCourse) {
                await api.updateTrainingCourse(editingCourse.id, courseData);
            } else {
                await api.createTrainingCourse(courseData);
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (error) {
            alert(`Failed to ${editingCourse ? 'update' : 'create'} course.`);
        }
    };
    
    const handleDeleteCourse = async (courseId: string) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                await api.deleteTrainingCourse(courseId);
                fetchCourses();
            } catch (error) {
                alert("Failed to delete course.");
            }
        }
    };

    const columns = [
        { header: 'Course Name', accessor: (item: TrainingCourse) => item.name },
        { header: 'Description', accessor: (item: TrainingCourse) => <p className="text-sm whitespace-normal max-w-md">{item.description}</p> },
        { header: 'Duration (Hours)', accessor: (item: TrainingCourse) => item.durationHours },
        { header: 'Required', accessor: (item: TrainingCourse) => item.isRequired ? 'Yes' : 'No' },
        {
            header: 'Actions',
            accessor: (item: TrainingCourse) => (
                <div className="flex space-x-2">
                    <Button onClick={() => openEditModal(item)} variant="ghost" className="p-1 h-7 w-7"><EditIcon className="h-4 w-4" /></Button>
                    <Button onClick={() => handleDeleteCourse(item.id)} variant="ghost" className="p-1 h-7 w-7"><XIcon className="h-4 w-4 text-red-500" /></Button>
                </div>
            )
        }
    ];

    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading course catalog...</div>;

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={openAddModal} icon={<PlusIcon className="h-4 w-4 mr-2" />}>New Course</Button>
            </div>
            <Table columns={columns} data={courses} />

            <Modal title={editingCourse ? "Edit Training Course" : "Create New Training Course"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-dark-text-secondary mb-1">Course Name</label>
                        <input id="name" type="text" value={modalData.name} onChange={e => setModalData({...modalData, name: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-dark-text-secondary mb-1">Description</label>
                        <textarea id="description" rows={3} value={modalData.description} onChange={e => setModalData({...modalData, description: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="durationHours" className="block text-sm font-medium text-dark-text-secondary mb-1">Duration (Hours)</label>
                        <input id="durationHours" type="number" value={modalData.durationHours} onChange={e => setModalData({...modalData, durationHours: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div className="flex items-center">
                        <input id="isRequired" type="checkbox" checked={modalData.isRequired} onChange={e => setModalData({...modalData, isRequired: e.target.checked})} className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-brand-primary" />
                        <label htmlFor="isRequired" className="ml-2 block text-sm text-dark-text">This is a required course</label>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Course</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

const ScheduledTrainingTab: React.FC = () => {
    const [trainings, setTrainings] = useState<ScheduledTraining[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [courses, setCourses] = useState<TrainingCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<ScheduledTraining | null>(null);
    const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [selectedTrainingForSheet, setSelectedTrainingForSheet] = useState<ScheduledTraining | null>(null);

    const fetchData = () => {
        setIsLoading(true);
        Promise.all([
            api.getScheduledTrainings(),
            api.getPersonnelList(),
            api.getTrainingCourses()
        ]).then(([trainingsData, personnelData, coursesData]) => {
            setTrainings(trainingsData);
            setPersonnel(personnelData);
            setCourses(coursesData);
        }).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (training: ScheduledTraining) => {
        setSelectedTraining(training);
        setSelectedPersonnel(training.attendeeIds);
        setIsModalOpen(true);
    };
    
    const handleTogglePersonnel = (personnelId: string) => {
        setSelectedPersonnel(prev => 
            prev.includes(personnelId) ? prev.filter(id => id !== personnelId) : [...prev, personnelId]
        );
    };

    const handleLogAttendance = async () => {
        if (!selectedTraining) return;

        try {
            await api.logTrainingAttendance(selectedTraining.id, selectedPersonnel);
            alert('Attendance logged successfully!');
            setIsModalOpen(false);
            fetchData(); // Refresh data
        } catch (error) {
            alert('Failed to log attendance.');
        }
    };
    
    const handleOpenSignInSheet = (training: ScheduledTraining) => {
        setSelectedTrainingForSheet(training);
        setIsSignInModalOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'Unknown Course';

    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading scheduled trainings...</div>;

    return (
        <>
            <div className="space-y-4">
                {trainings.map(training => (
                    <div key={training.id} className="bg-dark-card border border-dark-border p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-dark-text">{getCourseName(training.courseId)}</h3>
                            <p className="text-dark-text-secondary">Date: {new Date(training.date).toLocaleDateString()}</p>
                            <p className="text-sm text-dark-text-secondary">Instructor: {training.instructor}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <p className="text-sm text-dark-text-secondary mr-2">{training.attendeeIds.length} / {personnel.length} Attended</p>
                             <Button onClick={() => handleOpenSignInSheet(training)} variant="ghost" icon={<PrinterIcon className="h-4 w-4 mr-2" />}>
                                Sign-in Sheet
                             </Button>
                             <Button onClick={() => handleOpenModal(training)}>Log Attendance</Button>
                        </div>
                    </div>
                ))}
            </div>
            {selectedTraining && (
                 <Modal title={`Log Attendance: ${getCourseName(selectedTraining.courseId)}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {personnel.map(p => (
                             <div key={p.id} className="flex items-center p-2 rounded-md hover:bg-dark-border">
                                <input
                                    id={`p-${p.id}`}
                                    type="checkbox"
                                    checked={selectedPersonnel.includes(p.id)}
                                    onChange={() => handleTogglePersonnel(p.id)}
                                    className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-brand-primary"
                                />
                                <label htmlFor={`p-${p.id}`} className="ml-3 block text-sm text-dark-text">{p.name} <span className="text-dark-text-secondary">({p.rank})</span></label>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="button" variant="primary" onClick={handleLogAttendance}>Save Attendance</Button>
                    </div>
                 </Modal>
            )}
            
            {/* Sign-in Sheet Modal */}
            {selectedTrainingForSheet && (
                <Modal 
                    title="Sign-in Sheet" 
                    isOpen={isSignInModalOpen} 
                    onClose={() => setIsSignInModalOpen(false)}
                    containerClassName="printable-content"
                >
                    <div>
                        <div className="text-center mb-6">
                             <h2 className="text-2xl font-bold text-dark-text">{getCourseName(selectedTrainingForSheet.courseId)}</h2>
                             <p className="text-dark-text-secondary">Date: {new Date(selectedTrainingForSheet.date).toLocaleDateString()}</p>
                             <p className="text-dark-text-secondary">Instructor: {selectedTrainingForSheet.instructor}</p>
                        </div>
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-dark-border">
                                <tr>
                                    <th className="py-2 pr-4 text-dark-text-secondary">Name</th>
                                    <th className="py-2 px-4 text-dark-text-secondary">Rank</th>
                                    <th className="py-2 pl-4 text-dark-text-secondary w-2/5">Signature</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {personnel.map(p => (
                                    <tr key={p.id}>
                                        <td className="py-4 pr-4 text-dark-text">{p.name}</td>
                                        <td className="py-4 px-4 text-dark-text">{p.rank}</td>
                                        <td className="py-4 pl-4 border-b-2 border-dotted border-gray-500"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3 no-print">
                        <Button type="button" variant="ghost" onClick={() => setIsSignInModalOpen(false)}>Cancel</Button>
                        <Button type="button" variant="primary" onClick={handlePrint} icon={<PrinterIcon className="h-4 w-4 mr-2" />}>Print</Button>
                    </div>
                </Modal>
            )}
        </>
    )
};


const Training: React.FC = () => {
    const TABS = [
        { label: 'Scheduled Training', content: <ScheduledTrainingTab /> },
        { label: 'Course Catalog', content: <CourseCatalogTab /> },
    ];

    return (
        <Card title="Training Management">
            <Tabs tabs={TABS} />
        </Card>
    );
};

export default Training;
