
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import * as api from '../../services/api';
import { PhotoAlbum, Photo } from '../../types';
import { ArrowLeftIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons/Icons';
import Card from '../../components/ui/Card';

const Lightbox: React.FC<{
    photos: Photo[];
    startIndex: number;
    onClose: () => void;
}> = ({ photos, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    const showNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    };

    const showPrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
    };

    const currentPhoto = photos[currentIndex];

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center" onClick={onClose}>
            {/* Close Button */}
            <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={onClose}>
                <XIcon className="h-10 w-10" />
            </button>

            {/* Main Content */}
            <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                {/* Prev Button */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/20" onClick={showPrev}>
                    <ChevronLeftIcon className="h-8 w-8" />
                </button>

                {/* Image and Caption */}
                <div className="text-center max-w-screen-lg max-h-screen flex flex-col items-center justify-center">
                    <img src={currentPhoto.url} alt={currentPhoto.caption} className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg" />
                    <div className="mt-4 text-white text-center p-2 rounded-md bg-black/50">
                       <p>{currentPhoto.caption}</p>
                       <p className="text-sm text-white/70">{new Date(currentPhoto.dateTaken).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Next Button */}
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/20" onClick={showNext}>
                    <ChevronRightIcon className="h-8 w-8" />
                </button>
            </div>
            {/* Counter */}
             <div className="absolute bottom-4 text-white/70 text-sm">
                {currentIndex + 1} / {photos.length}
            </div>
        </div>
    );
};


const AlbumDetail: React.FC = () => {
    const { albumId } = ReactRouterDOM.useParams<{ albumId: string }>();
    const [album, setAlbum] = useState<PhotoAlbum | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!albumId) return;

        api.getAlbumWithPhotos(albumId)
            .then(data => {
                if (data) {
                    setAlbum(data.album);
                    setPhotos(data.photos);
                }
            })
            .finally(() => setIsLoading(false));
    }, [albumId]);
    
    if (isLoading) {
        return <div className="text-center py-12 text-dark-text-secondary">Loading album...</div>;
    }

    if (!album) {
        return <div className="text-center py-12 text-red-500">Album not found.</div>;
    }

    return (
        <>
            <div className="mb-6">
                <ReactRouterDOM.Link to="/photo-gallery" className="inline-flex items-center text-dark-text-secondary hover:text-dark-text transition-colors">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to All Albums
                </ReactRouterDOM.Link>
            </div>

            <Card>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-dark-text">{album.title}</h1>
                    <p className="text-lg text-dark-text-secondary mt-1">{album.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <div key={photo.id} className="group relative cursor-pointer overflow-hidden rounded-lg aspect-square" onClick={() => setLightboxIndex(index)}>
                            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <p className="text-white text-center text-sm">{photo.caption}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {lightboxIndex !== null && (
                <Lightbox
                    photos={photos}
                    startIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    );
};

export default AlbumDetail;
