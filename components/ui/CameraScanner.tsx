import React, { useRef, useEffect, useState } from 'react';
import Button from './Button';

interface CameraScannerProps {
    onScan: (scanResult: string) => void;
    onCancel: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    let streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const stopStream = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        const startCamera = async () => {
            stopStream();

            const constraintsToTry = [
                { video: { facingMode: { exact: 'environment' } } },
                { video: { facingMode: 'environment' } },
                { video: { facingMode: 'user' } },
                { video: true }
            ];

            let lastError: any = null;

            for (const constraints of constraintsToTry) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setError(null);
                        return; // Success!
                    }
                } catch (err) {
                    lastError = err;
                    console.warn(`Failed to get camera with constraints:`, constraints, err?.name);
                }
            }

            // If we get here, all attempts failed.
            console.error("All camera access attempts failed:", lastError);
            let errorMessage = "Could not access camera. Please check permissions and ensure you are on a secure (https) connection.";
            if (lastError instanceof DOMException) {
                if (lastError.name === "NotFoundError" || lastError.name === "DevicesNotFoundError") {
                    errorMessage = "No camera found on this device.";
                } else if (lastError.name === "NotAllowedError" || lastError.name === "PermissionDeniedError") {
                    errorMessage = "Camera access was denied. Please allow camera access in your browser settings.";
                } else if (lastError.name === "OverconstrainedError") {
                     errorMessage = "A suitable camera could not be found.";
                }
            }
            setError(errorMessage);
            stopStream();
        };

        startCamera();

        // Cleanup function when component unmounts
        return () => {
            stopStream();
        };
    }, []);

    const handleSimulatedScan = () => {
        // In a real app, this would use a library like ZXing to decode the video stream.
        // For this mock, we'll simulate finding a barcode.
        const mockAssetId = 'as-001';
        onScan(mockAssetId);
    };

    return (
        <div className="space-y-4">
            {error ? (
                <p className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</p>
            ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md bg-dark-bg border border-dark-border" />
            )}
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSimulatedScan} disabled={!!error}>Simulate Scan</Button>
            </div>
        </div>
    );
};

export default CameraScanner;
