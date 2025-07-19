
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import * as api from '../../services/api';
import { PhotoAlbum } from '../../types';
import { CameraIcon } from '../../components/icons/Icons';

const AlbumCard: React.FC<{ album: PhotoAlbum }> = ({ album }) => (
    <ReactRouterDOM.Link to={`/photo-gallery/${album.id}`} className="group block bg-dark-card border border-dark-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-primary">
        <div className="relative overflow-hidden">
            <img src={album.coverPhotoUrl} alt={album.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
        <div className="p-4">
            <h3 className="text-lg font-bold text-dark-text group-hover:text-brand-primary transition-colors">{album.title}</h3>
            <p className="text-sm text-dark-text-secondary mt-1">{album.description}</p>
        </div>
    </ReactRouterDOM.Link>
);


const PhotoGallery: React.FC = () => {
    const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getPhotoAlbums()
            .then(setAlbums)
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <div className="text-center">
                 <CameraIcon className="mx-auto h-16 w-16 text-brand-secondary" />
                <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">Photo Gallery</h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-dark-text-secondary">
                    A look into our department's activities, training, and community engagement.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center text-dark-text-secondary py-12">Loading albums...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {albums.map(album => (
                        <AlbumCard key={album.id} album={album} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhotoGallery;
