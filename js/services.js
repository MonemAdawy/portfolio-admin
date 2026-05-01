const { useState, useEffect } = React;

// ── Services Component ────────────────────────────────────────────────
const Services = ({ showToast }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', features: '' });

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/services`);
            setServices(await res.json());
        } catch { showToast('Error fetching services', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            title: formData.title,
            description: formData.description,
            features: formData.features.split('\n').map(f => f.trim()).filter(Boolean)
        };
        try {
            const url = editingService ? `${API_BASE_URL}/services/${editingService._id}` : `${API_BASE_URL}/services`;
            const method = editingService ? 'PATCH' : 'POST';
            const res = await apiFetch(url, { method, body: data });
            if (res.ok) {
                showToast(editingService ? 'Service updated!' : 'Service created!', 'success');
                setIsModalOpen(false);
                fetchServices();
            } else {
                const err = await res.json();
                showToast(err.message || 'Error saving', 'error');
            }
        } catch (e) { showToast(e.message || 'Error', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this service?')) return;
        try {
            const res = await apiFetch(`${API_BASE_URL}/services/${id}`, { method: 'DELETE' });
            if (res.ok) { showToast('Service deleted!', 'success'); fetchServices(); }
        } catch (e) { showToast(e.message || 'Delete failed', 'error'); }
    };

    if (loading) return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl"></i></div>;

    return (
        <div>
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Services</h2>
                <button onClick={() => { setEditingService(null); setFormData({ title: '', description: '', features: '' }); setIsModalOpen(true); }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    <i className="fas fa-plus mr-2"></i>Add Service
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map(s => (
                    <div key={s._id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-xl">{s.title}</h3>
                            <div>
                                <button onClick={() => { setEditingService(s); setFormData({ title: s.title, description: s.description, features: s.features?.join('\n') || '' }); setIsModalOpen(true); }}
                                    className="text-blue-500 mr-2"><i className="fas fa-edit"></i></button>
                                <button onClick={() => handleDelete(s._id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <p className="text-gray-600 mt-2">{s.description}</p>
                        {s.features?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {s.features.map((f, i) => (
                                    <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                                        <i className="fas fa-check text-green-400 text-xs"></i>{f}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                   title={editingService ? 'Edit Service' : 'Add Service'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Title" value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full border rounded px-3 py-2" required/>
                    <textarea placeholder="Description" rows="3" value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full border rounded px-3 py-2" required/>
                    <textarea placeholder="Features (one per line)" rows="4" value={formData.features}
                        onChange={e => setFormData({...formData, features: e.target.value})}
                        className="w-full border rounded px-3 py-2"/>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};