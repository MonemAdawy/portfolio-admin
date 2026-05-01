const { useState, useEffect } = React;

// ── Skills Component ──────────────────────────────────────────────────
const Skills = ({ showToast }) => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', subSkills: '' });

    const fetchSkills = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/skill`);
            setSkills(await res.json());
        } catch { showToast('Error fetching skills', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSkills(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: formData.name,
            subSkills: formData.subSkills.split('\n').map(s => s.trim()).filter(Boolean).map(s => ({ name: s }))
        };
        try {
            const res = await apiFetch(`${API_BASE_URL}/skill`, { method: 'POST', body: data });
            if (res.ok) {
                showToast('Skill created!', 'success');
                setIsModalOpen(false);
                fetchSkills();
            } else {
                const err = await res.json();
                showToast(err.message || 'Error creating skill', 'error');
            }
        } catch (e) { showToast(e.message || 'Error', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete skill?')) return;
        try {
            const res = await apiFetch(`${API_BASE_URL}/skill/${id}`, { method: 'DELETE' });
            if (res.ok) { showToast('Skill deleted!', 'success'); fetchSkills(); }
        } catch (e) { showToast(e.message || 'Delete failed', 'error'); }
    };

    if (loading) return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl"></i></div>;

    return (
        <div>
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Skills</h2>
                <button onClick={() => { setFormData({ name: '', subSkills: '' }); setIsModalOpen(true); }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    <i className="fas fa-plus mr-2"></i>Add Skill
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map(s => (
                    <div key={s._id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-xl">{s.name}</h3>
                            <button onClick={() => handleDelete(s._id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {s.subSkills?.map((sub, i) => (
                                <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{sub.name}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Skill">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Skill Name (e.g. Frontend)" value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full border rounded px-3 py-2" required/>
                    <textarea placeholder="Sub-skills (one per line)" rows="4" value={formData.subSkills}
                        onChange={e => setFormData({...formData, subSkills: e.target.value})}
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