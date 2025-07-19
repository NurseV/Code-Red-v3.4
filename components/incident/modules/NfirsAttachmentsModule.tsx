
import React, { useState } from 'react';
import { Attachment } from '../../../types';
import Button from '../../ui/Button';
import { UploadIcon, XIcon, FileTextIcon } from '../../icons/Icons';
import * as api from '../../../services/api';

interface Props {
    incidentId: string;
    attachments: Attachment[];
    onUpdate: (data: Attachment[]) => void;
    isLocked: boolean;
}

const NfirsAttachmentsModule: React.FC<Props> = ({ incidentId, attachments, onUpdate, isLocked }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                const newAttachment = await api.uploadAttachment(incidentId, file);
                onUpdate([...attachments, newAttachment]);
            } catch (error) {
                alert("Failed to upload file.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    
    const handleDelete = async (attachmentId: string) => {
        if (window.confirm("Are you sure you want to delete this attachment?")) {
            try {
                await api.deleteAttachment(incidentId, attachmentId);
                onUpdate(attachments.filter(a => a.id !== attachmentId));
            } catch (error) {
                alert("Failed to delete attachment.");
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-dark-text">Attachments</h2>
                 {!isLocked && (
                    <Button
                        onClick={() => document.getElementById('file-upload-input')?.click()}
                        icon={<UploadIcon className="h-4 w-4 mr-2" />}
                        isLoading={isUploading}
                    >
                        Upload File
                    </Button>
                 )}
                 <input
                    type="file"
                    id="file-upload-input"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isLocked || isUploading}
                />
            </div>

            {attachments.length === 0 ? (
                <p className="text-center text-dark-text-secondary py-8">No attachments for this incident.</p>
            ) : (
                <div className="bg-dark-bg p-3 rounded-md border border-dark-border">
                    <ul className="divide-y divide-dark-border">
                        {attachments.map(att => (
                            <li key={att.id} className="py-2 flex items-center justify-between group">
                                <div className="flex items-center">
                                    <FileTextIcon className="h-6 w-6 mr-3 text-dark-text-secondary" />
                                    <div>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="font-medium text-dark-text hover:underline">{att.fileName}</a>
                                        <p className="text-sm text-dark-text-secondary">{att.fileType} - {att.size}</p>
                                    </div>
                                </div>
                                 {!isLocked && (
                                    <Button
                                        variant="danger"
                                        className="p-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(att.id)}
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                 )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NfirsAttachmentsModule;
