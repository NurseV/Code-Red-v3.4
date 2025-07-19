import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCitizenAuth } from '../../hooks/useCitizenAuth';
import Button from '../../components/ui/Button';
import { UserIcon } from '../../components/icons/Icons';

const CitizenRegister: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { register } = useCitizenAuth();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { success, error: registerError } = await register(name, email, password);

        setIsLoading(false);
        if (success) {
            setIsSuccess(true);
        } else {
            setError(registerError || 'An unknown error occurred.');
        }
    };

    if (isSuccess) {
        return (
             <div className="flex items-center justify-center py-12">
                <div className="max-w-md w-full space-y-8 bg-dark-card border border-dark-border p-8 rounded-lg text-center">
                    <UserIcon className="mx-auto h-12 w-auto text-green-500" />
                    <h2 className="mt-6 text-center text-2xl font-bold text-dark-text">
                        Registration Submitted
                    </h2>
                    <p className="mt-2 text-center text-md text-dark-text-secondary">
                        Thank you for registering. Your account is now pending approval from a department administrator. You will be notified via email once your account is active.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => navigate('/')}>Return to Home</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center py-12">
            <div className="max-w-md w-full space-y-8 bg-dark-card border border-dark-border p-8 rounded-lg">
                <div>
                    <UserIcon className="mx-auto h-12 w-auto text-brand-secondary" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-text">
                        Create a Citizen Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-dark-text-secondary">
                        Register to manage your properties and services.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="rounded-md shadow-sm -space-y-px">
                         <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-border bg-dark-bg placeholder-gray-500 text-dark-text rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm" placeholder="Full Name"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-border bg-dark-bg placeholder-gray-500 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm" placeholder="Email address" />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-border bg-dark-bg placeholder-gray-500 text-dark-text rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm" placeholder="Password"/>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Register
                        </Button>
                    </div>
                    <div className="text-sm text-center">
                        <Link to="/login" className="font-medium text-brand-secondary hover:text-orange-400">
                           Already have an account? Sign in.
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CitizenRegister;