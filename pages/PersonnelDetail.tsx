
import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { 
    PlusIcon, EditIcon, UploadIcon, FileTextIcon, 
    MailIcon, ShieldAlertIcon, SaveIcon, PhoneIcon,
    CalendarIcon, ArchiveIcon, HeartPulseIcon, BanknoteIcon, DollarSignIcon, MessageSquareIcon, XIcon
} from '../components/icons/Icons';
import { Personnel, Role, Asset, EmergencyContact } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import Accordion from '../components/ui/Accordion';

// Helper component for displaying a detail item
const DetailItem: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <dt className="text-sm font-medium text-dark-text-secondary">{label}</dt>
        <dd className="mt-1 text-sm text-dark-text">{value || children || 'N/A'}</dd>
    </div>
);

// Helper for editable fields
const EditInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="text-sm font-medium text-dark-text-secondary">{label}</label>
        <input
            {...props}
            className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-1.5 px-2 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        />
    </div>
);

const EditSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
     <div>
        <label htmlFor={props.name} className="text-sm font-medium text-dark-text-secondary">{label}</label>
        <select
            {...props}
            className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-1.5 px-2 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        >
            {children}
        </select>
    </div>
);

// Helper component for a progress bar
const ProgressBar: React.FC<{ value: number; label?: string; color?: string }> = ({ value, label, color = 'bg-brand-secondary' }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label && <span className="text-sm font-medium text-dark-text-secondary">{label}</span>}
      <div className="w-full bg-dark-bg rounded-full h-2.5 mt-1 border border-dark-border">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${clampedValue}%` }}></div>
      </div>
    </div>
  );
};

// Simple markdown renderer
const SimpleMarkdown: React.FC<{ text: string }> = ({ text = "" }) => {
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc ml-5 space-y-1">
                    {listItems.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
            );
            listItems = [];
        }
    };

    text.split('\n').forEach((line, i) => {
        if (line.trim().startsWith('* ')) {
            const parts = line.trim().substring(2).split(/(\*\*.*?\*\*)/g);
             listItems.push(parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="text-dark-text">{part.slice(2, -2)}</strong>;
                }
                return part;
            }) as any);
        } else {
            flushList();
            const parts = line.split(/(\*\*.*?\*\*)/g);
            elements.push(
                <p key={`p-${i}`}>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-dark-text">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        }
    });

    flushList(); // Make sure to flush any remaining list items

    return (
        <div className="text-sm text-dark-text-secondary whitespace-pre-wrap space-y-2">
            {elements}
        </div>
    );
};


const PersonnelDetail: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const { user } = useInternalAuth();

    const [personnel, setPersonnel] = useState<Personnel | null>(null);
    const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Personnel>>({});

    const canEdit = user?.role === Role.ADMINISTRATOR || user?.role === Role.CHIEF;
    const canViewSensitive = user?.role === Role.ADMINISTRATOR || user?.role === Role.CHIEF;

    const fetchPersonnel = useCallback(() => {
        if (id) {
            setIsLoading(true);
            Promise.all([
                api.getPersonnelById(id),
                api.getAssets()
            ]).then(([personnelData, allAssets]) => {
                setPersonnel(personnelData);
                setFormData(personnelData || {});
                if (personnelData) {
                    const assetsForPerson = allAssets.filter(asset => asset.assignedToId === personnelData.id && asset.assignedToType === 'Personnel');
                    setAssignedAssets(assetsForPerson);
                }
            }).finally(() => setIsLoading(false));
        }
    }, [id]);

    useEffect(() => {
        fetchPersonnel();
    }, [fetchPersonnel]);

    const handleSave = async () => {
        if (!id || !user) return;
        setIsLoading(true);
        try {
            await api.updatePersonnel(id, formData, user);
            setIsEditing(false);
            fetchPersonnel();
        } catch(e) {
            alert("Failed to save personnel data.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCancel = () => {
        setFormData(personnel || {});
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateAge = (dob: string | undefined): number | string => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateLengthOfService = (hireDate: string | undefined): { text: string; months: number } => {
        if (!hireDate) return { text: 'N/A', months: 0 };
        const start = new Date(hireDate);
        const end = new Date();
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        if (end.getDate() < start.getDate()) {
            months--;
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        return { text: `${years} years, ${months} months`, months: years * 12 + months };
    };

    const getCertStatus = (expires: string): { text: string, className: string } => {
        const now = new Date();
        const expiryDate = new Date(expires);
        const daysUntil = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (daysUntil <= 0) return { text: `Expired`, className: 'text-red-400 border-red-500 bg-red-500/10' };
        if (daysUntil <= 90) return { text: `Expires in ${Math.floor(daysUntil)} days`, className: 'text-yellow-400 border-yellow-500 bg-yellow-500/10' };
        return { text: `Expires ${expiryDate.toLocaleDateString()}`, className: 'text-green-400 border-green-500 bg-green-500/10' };
    };

    const getFitForDutyStatusColor = (status?: string) => {
        switch(status) {
            case 'Fit for Full Duty': return 'bg-green-500';
            case 'Fit for Light Duty': return 'bg-yellow-500';
            case 'Not Cleared': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };


    if (isLoading || !personnel) {
        return <div className="text-center text-dark-text-secondary p-8">Loading personnel details...</div>;
    }

    const serviceInfo = calculateLengthOfService(personnel.hireDate);
    const serviceProgress = (serviceInfo.months / 360) * 100;

    return (
        <div className="space-y-6">
            <Card>
                 <div className="flex flex-col md:flex-row items-start md:items-center">
                    <img className="h-24 w-24 rounded-full object-cover border-4 border-dark-border" src={personnel.avatarUrl} alt="User avatar" />
                    <div className="flex-1 md:ml-6 mt-4 md:mt-0">
                        <h2 className="text-2xl font-bold text-dark-text">{personnel.name}</h2>
                        <p className="text-lg text-dark-text-secondary">{personnel.rank}</p>
                         <span className={`mt-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${personnel.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {personnel.status}
                        </span>
                    </div>
                     <div className="flex items-center space-x-1 mt-4 md:mt-0">
                        <Button variant="ghost" title="Send Message"><MessageSquareIcon className="h-5 w-5"/></Button>
                        <Button variant="ghost" title="View Schedule"><CalendarIcon className="h-5 w-5"/></Button>
                        <Button variant="ghost" title="Log Exposure" className="text-yellow-400 hover:bg-yellow-400/10"><ShieldAlertIcon className="h-5 w-5"/></Button>
                        <div className="border-l border-dark-border h-8 mx-2"></div>
                        {canEdit && (isEditing ? (
                            <>
                                <Button onClick={handleCancel} variant="ghost">Cancel</Button>
                                <Button onClick={handleSave} icon={<SaveIcon className="h-4 w-4 mr-2"/>}>Save</Button>
                            </>
                        ) : (
                             <Button onClick={() => setIsEditing(true)} icon={<EditIcon className="h-4 w-4 mr-2"/>}>Edit Profile</Button>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card title="Member Info">
                        <dl className="grid grid-cols-2 gap-y-4 gap-x-4">
                            {isEditing ? <EditInput label="NFIRS ID" name="nfirsId" value={formData.nfirsId || ''} onChange={handleInputChange} /> : <DetailItem label="NFIRS ID" value={personnel.nfirsId} />}
                            {isEditing ? <EditInput label="Badge Number" name="badgeNumber" value={formData.badgeNumber || ''} onChange={handleInputChange} /> : <DetailItem label="Badge Number" value={personnel.badgeNumber} />}
                            {isEditing ? <EditInput label="Assignment" name="assignment" value={formData.assignment || ''} onChange={handleInputChange} /> : <DetailItem label="Assignment" value={personnel.assignment} />}
                            {isEditing ? <EditInput label="Rank" name="rank" value={formData.rank || ''} onChange={handleInputChange} /> : <DetailItem label="Rank" value={personnel.rank} />}
                           <DetailItem label="Length of Service" value={serviceInfo.text} />
                           <DetailItem label="Age" value={calculateAge(personnel.dateOfBirth)} />
                           <div className="col-span-2">
                                <ProgressBar label="Service Progress (30 yrs)" value={serviceProgress} />
                           </div>
                        </dl>
                    </Card>

                     <Card title="Contact Information">
                        <dl className="space-y-4">
                            {isEditing ? (
                                <>
                                 <EditInput label="Work Email" name="emails" value={formData.emails?.[0]?.address || ''} onChange={(e) => setFormData(p => ({...p, emails: [{type: 'Work', address: e.target.value}]}))} />
                                 <EditInput label="Mobile Phone" name="phoneNumbers" value={formData.phoneNumbers?.[0]?.number || ''} onChange={(e) => setFormData(p => ({...p, phoneNumbers: [{type: 'Mobile', number: e.target.value}]}))} />
                                </>
                            ) : (
                                <>
                                 {(personnel.emails || []).map((email, i) => <DetailItem key={i} label={`${email.type} Email`} value={<a href={`mailto:${email.address}`} className="text-brand-secondary hover:underline">{email.address}</a>} />)}
                                 {(personnel.phoneNumbers || []).map((phone, i) => <DetailItem key={i} label={`${phone.type} Phone`} value={<a href={`tel:${phone.number}`} className="text-brand-secondary hover:underline">{phone.number}</a>} />)}
                                </>
                            )}
                        </dl>
                    </Card>
                    
                     <Card title="Emergency Contacts">
                        {(personnel.emergencyContacts || []).length > 0 ? (
                            <dl className="space-y-3">
                                {(personnel.emergencyContacts || []).map(c => <DetailItem key={c.id} label={c.relationship} value={`${c.name} - ${c.phone}`} />)}
                            </dl>
                        ): (
                            <div className="text-center py-4">
                                <p className="text-dark-text-secondary">No emergency contacts on file.</p>
                                {canEdit && <Button size="sm" className="mt-2" icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Add Contact</Button>}
                            </div>
                        )}
                    </Card>
                    
                    {canViewSensitive && (
                        <Card title="Payroll & Administrative">
                             <dl className="grid grid-cols-2 gap-4">
                                {isEditing ? <EditInput label="Payroll ID" name="payrollId" value={formData.payrollId || ''} onChange={handleInputChange} /> : <DetailItem label="Payroll ID" value={personnel.payrollId} />}
                                <DetailItem label="SSN" value={`***-**-${personnel.ssn?.slice(-4)}`} />
                                {isEditing ? <EditInput label="Gender" name="gender" value={formData.gender || ''} onChange={handleInputChange} /> : <DetailItem label="Gender" value={personnel.gender} />}
                                {isEditing ? <EditInput label="Citizenship" name="citizenship" value={formData.citizenship || ''} onChange={handleInputChange} /> : <DetailItem label="Citizenship" value={personnel.citizenship} />}
                             </dl>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card title="Qualifications">
                        <Accordion title={`Certifications (${(personnel.certifications || []).length})`}>
                            {(personnel.certifications || []).length > 0 ? (
                                <ul className="space-y-2">
                                    {(personnel.certifications || []).map(cert => {
                                        const status = getCertStatus(cert.expires);
                                        return (
                                        <li key={cert.id} className={`p-3 border rounded-md flex justify-between items-center group ${status.className}`}>
                                            <div>
                                                <p className="font-semibold text-dark-text">{cert.name}</p>
                                                <p className="text-sm">{status.text}</p>
                                            </div>
                                            {cert.documentUrl ? <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer"><FileTextIcon className="h-5 w-5 text-blue-400"/></a> : (isEditing && <label className="opacity-0 group-hover:opacity-100 transition-opacity"><UploadIcon className="h-5 w-5 cursor-pointer"/><input type="file" className="hidden" /></label>)}
                                        </li>
                                    )})}
                                </ul>
                            ) : <div className="text-center py-4">
                                <p className="text-dark-text-secondary">No certifications on file.</p>
                                {isEditing && <Button size="sm" className="mt-2" icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Add Certification</Button>}
                            </div>}
                        </Accordion>
                         <Accordion title={`Training History (${(personnel.trainingHistory || []).length})`}>
                             {(personnel.trainingHistory || []).length > 0 ? (
                                <ul className="divide-y divide-dark-border -m-4">
                                    {(personnel.trainingHistory || []).map(record => (
                                        <li key={record.courseId} className="p-3 flex justify-between items-center group">
                                            <div>
                                                <p className="font-medium text-dark-text">{record.courseName}</p>
                                                <p className="text-sm text-dark-text-secondary">Completed: {new Date(record.completedDate).toLocaleDateString()}</p>
                                            </div>
                                             {record.documentUrl ? <a href={record.documentUrl} target="_blank" rel="noopener noreferrer"><FileTextIcon className="h-5 w-5 text-blue-400"/></a> : (isEditing && <label className="opacity-0 group-hover:opacity-100 transition-opacity"><UploadIcon className="h-5 w-5 cursor-pointer"/><input type="file" className="hidden" /></label>)}
                                        </li>
                                    ))}
                                </ul>
                            ) : <div className="text-center py-4">
                                <p className="text-dark-text-secondary">No training history on file.</p>
                                {isEditing && <Button size="sm" className="mt-2" icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Add Record</Button>}
                                </div>
                            }
                        </Accordion>
                        <Accordion title={`Awards (${personnel.awards?.length || 0})`}>
                             {personnel.awards && personnel.awards.length > 0 ? (
                                <ul className="divide-y divide-dark-border -m-4">
                                    {personnel.awards.map(award => (
                                        <li key={award.id} className="p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-dark-text">{award.name}</p>
                                                    <p className="text-sm text-dark-text-secondary mt-1">{award.description}</p>
                                                </div>
                                                <p className="text-sm text-dark-text-secondary flex-shrink-0 ml-4">{new Date(award.dateReceived).toLocaleDateString()}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <div className="text-center py-4">
                                <p className="text-dark-text-secondary">No awards on record.</p>
                                 {isEditing && <Button size="sm" className="mt-2" icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Add Award</Button>}
                                </div>
                            }
                        </Accordion>
                    </Card>

                    {canViewSensitive && (
                        <Card title="Health & Safety Information" icon={<HeartPulseIcon className="h-6 w-6 text-red-400"/>}>
                           <dl className="grid grid-cols-2 gap-4">
                               {isEditing ? <EditInput label="Blood Type" name="bloodType" value={formData.bloodType || ''} onChange={handleInputChange} /> : <DetailItem label="Blood Type" value={personnel.bloodType} />}
                                {isEditing ? (
                                     <EditSelect label="Fit for Duty Status" name="fitForDutyStatus" value={formData.fitForDutyStatus || ''} onChange={handleInputChange}>
                                        <option>Fit for Full Duty</option>
                                        <option>Fit for Light Duty</option>
                                        <option>Not Cleared</option>
                                    </EditSelect>
                                ) : (
                                   <div>
                                        <dt className="text-sm font-medium text-dark-text-secondary">Fit for Duty Status</dt>
                                        <dd className="mt-1 text-sm text-dark-text flex items-center">
                                            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${getFitForDutyStatusColor(personnel.fitForDutyStatus)}`}></span>
                                            {personnel.fitForDutyStatus || 'N/A'}
                                        </dd>
                                   </div>
                                )}
                                {isEditing ? <EditInput label="Last Physical" name="lastPhysicalDate" type="date" value={formData.lastPhysicalDate?.split('T')[0] || ''} onChange={handleInputChange} /> : <DetailItem label="Last Physical" value={personnel.lastPhysicalDate ? new Date(personnel.lastPhysicalDate).toLocaleDateString() : 'N/A'} />}
                               {isEditing ? <EditInput label="Allergies" name="allergies" value={formData.allergies?.join(', ') || ''} onChange={(e) => setFormData(p => ({...p, allergies: e.target.value.split(',').map(s => s.trim())}))} /> : <DetailItem label="Allergies" value={personnel.allergies?.join(', ')} />}
                               <div className="col-span-2">
                               {isEditing ? <EditInput label="Medical Conditions" name="medicalConditions" value={formData.medicalConditions?.join(', ') || ''} onChange={(e) => setFormData(p => ({...p, medicalConditions: e.target.value.split(',').map(s => s.trim())}))} /> : <DetailItem label="Medical Conditions" value={personnel.medicalConditions?.join(', ')} />}
                               </div>
                           </dl>
                        </Card>
                    )}

                    <Card title="Assigned PPE & Equipment">
                         {assignedAssets.length > 0 ? (
                             <ul className="divide-y divide-dark-border -m-6">
                                {assignedAssets.map(asset => (
                                    <li key={asset.id} className="p-3 flex items-center justify-between hover:bg-dark-border/50">
                                        <div className="flex items-center">
                                            <ArchiveIcon className="h-5 w-5 mr-3 text-dark-text-secondary"/>
                                            <div>
                                                 <p className="font-medium text-dark-text">{asset.name}</p>
                                                 <p className="text-xs text-dark-text-secondary font-mono">{asset.serialNumber}</p>
                                            </div>
                                        </div>
                                        <ReactRouterDOM.Link to={`/app/assets?id=${asset.id}`} className="text-sm text-brand-secondary hover:underline">View</ReactRouterDOM.Link>
                                    </li>
                                ))}
                             </ul>
                         ) : (
                              <div className="text-center py-4">
                                <p className="text-dark-text-secondary">No equipment assigned directly to this member.</p>
                                {isEditing && <Button size="sm" className="mt-2" icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Assign Equipment</Button>}
                            </div>
                         )}
                    </Card>

                    <Card title="Notes">
                        {isEditing ? (
                             <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows={6} className="w-full bg-dark-bg border border-dark-border rounded-md p-2 text-dark-text-secondary" />
                        ) : (
                            <SimpleMarkdown text={personnel.notes || 'No notes for this member.'} />
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PersonnelDetail;
