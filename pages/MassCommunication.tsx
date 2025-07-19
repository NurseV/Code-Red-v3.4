

import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { MailIcon, MessageSquareIcon } from '../components/icons/Icons';

type TargetAudience = 'Emergency Alerts' | 'General Announcements' | 'Event Reminders';
type DeliveryChannel = 'Email' | 'SMS/Text Message';

const MassCommunication: React.FC = () => {
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [targetAudience, setTargetAudience] = useState<TargetAudience[]>([
        'Emergency Alerts',
        'General Announcements',
        'Event Reminders'
    ]);
    const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannel[]>(['Email', 'SMS/Text Message']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleAudienceChange = (audience: TargetAudience) => {
        setTargetAudience(prev =>
            prev.includes(audience) ? prev.filter(a => a !== audience) : [...prev, audience]
        );
    };

    const handleChannelChange = (channel: DeliveryChannel) => {
        setDeliveryChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsSuccess(false);

        const notificationData = {
            subject,
            message,
            targetAudience,
            deliveryChannels
        };
        try {
            await api.sendMassNotification(notificationData);
            setIsSuccess(true);
            // Reset form
            setMessage('');
            setSubject('');
        } catch (error) {
            alert('Failed to send notification.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <p className="text-dark-text-secondary mb-6">
                Compose and send targeted notifications to subscribed community members.
            </p>

            {isSuccess && (
                <div className="p-4 mb-4 text-green-100 bg-green-600/50 border border-green-500 rounded-md">
                    Notification sent successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Target Audience */}
                <div>
                    <h3 className="font-semibold text-lg text-dark-text mb-2">1. Select Target Audience</h3>
                    <div className="flex flex-wrap gap-4">
                        {(['Emergency Alerts', 'General Announcements', 'Event Reminders'] as TargetAudience[]).map(audience => (
                            <label key={audience} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={targetAudience.includes(audience)}
                                    onChange={() => handleAudienceChange(audience)}
                                    className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-transparent"
                                />
                                <span className="text-dark-text">{audience}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Step 2: Compose Message */}
                <div>
                    <h3 className="font-semibold text-lg text-dark-text mb-2">2. Compose Message</h3>
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-dark-text-secondary mb-1">Subject (for Email)</label>
                            <input
                                id="subject"
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text"
                                placeholder="e.g., County-Wide Burn Ban"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-dark-text-secondary mb-1">Message Content</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={6}
                                required
                                className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text"
                                placeholder="Type your notification here..."
                            />
                            <p className="text-xs text-dark-text-secondary mt-1">Note: For SMS, the message will be truncated if it is too long.</p>
                        </div>
                    </div>
                </div>

                {/* Step 3: Delivery Channels */}
                <div>
                    <h3 className="font-semibold text-lg text-dark-text mb-2">3. Select Delivery Channels</h3>
                    <div className="flex flex-wrap gap-4">
                        {(['Email', 'SMS/Text Message'] as DeliveryChannel[]).map(channel => (
                             <label key={channel} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={deliveryChannels.includes(channel)}
                                    onChange={() => handleChannelChange(channel)}
                                    className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-transparent"
                                />
                                <span className="text-dark-text flex items-center">
                                    {channel === 'Email' ? <MailIcon className="h-5 w-5 mr-1" /> : <MessageSquareIcon className="h-5 w-5 mr-1" />}
                                    {channel}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-5 border-t border-dark-border">
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            disabled={!message || targetAudience.length === 0 || deliveryChannels.length === 0}
                        >
                            Send Notification
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MassCommunication;