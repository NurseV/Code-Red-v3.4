
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useInternalAuth } from '../hooks/useInternalAuth';
import * as api from '../services/api';
import { InternalMessage } from '../types';

const InternalComms: React.FC = () => {
    const { user } = useInternalAuth();
    const [messages, setMessages] = useState<InternalMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMessages = () => {
        setIsLoading(true);
        api.getInternalMessages().then(setMessages).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        setIsSubmitting(true);
        try {
            await api.createInternalMessage(user.id, newMessage);
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            alert("Failed to post message.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card title="Internal Communications Board">
            <div className="space-y-6">
                {/* New Message Form */}
                <form onSubmit={handleSubmit} className="flex items-start space-x-4">
                    <img src={user?.avatarUrl} alt="Your avatar" className="h-10 w-10 rounded-full" />
                    <div className="flex-grow">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Post a shift note or message..."
                            rows={3}
                            className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            required
                        />
                         <div className="mt-2 flex justify-end">
                             <Button type="submit" isLoading={isSubmitting}>Post Message</Button>
                        </div>
                    </div>
                </form>

                <div className="border-t border-dark-border"></div>

                {/* Message Feed */}
                {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading messages...</div> : (
                    <div className="space-y-4">
                        {messages.map(message => (
                            <div key={message.id} className="flex items-start space-x-4 p-4 bg-dark-bg rounded-lg">
                                <img src={message.authorAvatar} alt={`${message.authorName}'s avatar`} className="h-10 w-10 rounded-full" />
                                <div className="flex-grow">
                                    <div className="flex items-baseline space-x-2">
                                        <p className="font-bold text-dark-text">{message.authorName}</p>
                                        <p className="text-xs text-dark-text-secondary">{new Date(message.timestamp).toLocaleString()}</p>
                                    </div>
                                    <p className="mt-1 text-dark-text-secondary whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default InternalComms;
