
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg text-dark-text">
            <h1 className="text-6xl font-bold text-brand-primary">404</h1>
            <h2 className="text-2xl mt-4 mb-2 font-semibold">Page Not Found</h2>
            <p className="text-dark-text-secondary mb-6">
                Sorry, the page you are looking for does not exist.
            </p>
            <ReactRouterDOM.Link to="/">
                <Button variant="primary">Go to Dashboard</Button>
            </ReactRouterDOM.Link>
        </div>
    );
};

export default NotFound;
