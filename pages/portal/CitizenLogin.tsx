
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCitizenAuth } from '../../hooks/useCitizenAuth';
import Button from '../../components/ui/Button';
import { UserIcon } from '../../components/icons/Icons';

const CitizenLogin: React.FC = () => {
    const [email, setEmail] = useState('alice@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useCitizenAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/portal/dashboard';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const errorMessage = await login(email, password);

        if (errorMessage === null) {
            navigate(from, { replace: true });
        } else {
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="max-w-md w-full space-y-8 bg-dark-card border border-dark-border p-8 rounded-lg">
                <div>
                    <UserIcon className="mx-auto h-12 w-auto text-brand-secondary" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-text">
                        Citizen Portal Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-dark-text-secondary">
                        Access your property information and services.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-border bg-dark-bg placeholder-gray-500 text-dark-text rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-border bg-dark-bg placeholder-gray-500 text-dark-text rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign in
                        </Button>
                    </div>
                     <div className="text-sm text-center">
                        <Link to="/register" className="font-medium text-brand-secondary hover:text-orange-400">
                            Don't have an account? Register here.
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CitizenLogin;
