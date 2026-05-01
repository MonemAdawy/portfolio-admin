const { useState, useEffect } = React;

// Get API URL from window config or use default
const API_BASE_URL = window.API_BASE_URL;

// ==================== FETCH WRAPPER ====================
const apiFetch = async (url, options = {}) => {
    let body = options.body;
    const headers = {
        ...(body && !(body instanceof FormData)
            ? { 'Content-Type': 'application/json' }
            : {}),
        ...options.headers,
    };

    if (body && typeof body === 'object' && !(body instanceof FormData)) {
        body = JSON.stringify(body);
    }

    const response = await fetch(url, {
        ...options,
        body,
        headers,
        credentials: 'include',
    });

    return response;
};

// ==================== UI COMPONENTS ====================

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const bgColor = type === 'success' ? 'bg-green-500'
                      : type === 'error'   ? 'bg-red-500'
                      :                      'bg-blue-500';
    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`}>
            <i className={`fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
            {message}
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children, size = 'max-w-md' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className={`bg-white rounded-lg p-6 ${size} w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const ImageGalleryModal = ({ isOpen, onClose, images, onDeleteImage, projectId, showToast }) => {
    const [deletingImages, setDeletingImages] = useState({});

    const handleDeleteImage = async (public_id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        setDeletingImages(prev => ({ ...prev, [public_id]: true }));
        try {
            const response = await apiFetch(
                `${API_BASE_URL}/projects/delete-image?public_id=${public_id}&project_id=${projectId}`,
                { method: 'DELETE' }
            );
            if (response.ok) {
                showToast('Image deleted!', 'success');
                await onDeleteImage(public_id, projectId);
            } else {
                const error = await response.json();
                showToast(error.message || 'Error deleting image', 'error');
            }
        } catch (error) {
            showToast(error.message || 'Error', 'error');
        } finally {
            setDeletingImages(prev => ({ ...prev, [public_id]: false }));
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
            <div className={`bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
                    <h2 className="text-2xl font-bold">Project Images</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <div key={image.public_id || index} className="relative group bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={image.url || image.secure_url || image}
                                alt={`Image ${index + 1}`}
                                className="w-full h-64 object-cover"
                                onError={e => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDeleteImage(image.public_id)}
                                    disabled={deletingImages[image.public_id]}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                    <i className={`fas ${deletingImages[image.public_id] ? 'fa-spinner fa-spin' : 'fa-trash'} mr-2`}></i>
                                    {deletingImages[image.public_id] ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};