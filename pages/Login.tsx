
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInternalAuth } from '../hooks/useInternalAuth';
import Button from '../components/ui/Button';
import { FireExtinguisherIcon } from '../components/icons/Icons';

const InternalLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useInternalAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/app/dashboard';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const success = await login(username);

        if (success) {
            navigate(from, { replace: true });
        } else {
            setError('Invalid username. Try "chief" or "firefighter".');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <FireExtinguisherIcon className="mx-auto h-16 w-auto text-brand-primary" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-text">
                        Fire Dept. Internal OMS
                    </h2>
                    <p className="mt-2 text-center text-sm text-dark-text-secondary">
                        Sign in to your account
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-border bg-dark-card placeholder-gray-500 text-dark-text rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                                placeholder="Username (try 'chief' or 'firefighter')"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-border bg-dark-card placeholder-gray-500 text-dark-text rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                                placeholder="Password (any password will work)"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign in
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InternalLogin;
