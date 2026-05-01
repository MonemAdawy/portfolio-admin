const { useState, useEffect } = React;

// ── Projects Component ────────────────────────────────────────────────
const Projects = ({ showToast }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', techStack: '', github: '', live: '' });
    const [selectedImages, setSelectedImages] = useState([]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/projects`);
            if (!response.ok) throw new Error('Failed to fetch');
            setProjects(await response.json());
        } catch { showToast('Error fetching projects', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProjects(); }, []);

    const resetForm = () => {
        setFormData({ title: '', description: '', techStack: '', github: '', live: '' });
        setSelectedImages([]);
        setEditingProject(null);
    };

    const openModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                title: project.title || '',
                description: project.description || '',
                techStack: project.techStack?.join(', ') || '',
                github: project.links?.github || '',
                live: project.links?.live || ''
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) { showToast('Title and description required', 'error'); return; }
        if (!editingProject && selectedImages.length === 0) { showToast('Please select at least one image', 'error'); return; }
        if (!formData.github) { showToast('GitHub URL is required', 'error'); return; }

        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('description', formData.description);
        fd.append('techStack', JSON.stringify(formData.techStack.split(',').map(s => s.trim()).filter(Boolean)));
        fd.append('links', JSON.stringify({ github: formData.github, live: formData.live || '' }));
        selectedImages.forEach(img => fd.append('images', img));

        try {
            const url = editingProject ? `${API_BASE_URL}/projects/${editingProject._id}` : `${API_BASE_URL}/projects`;
            const method = editingProject ? 'PATCH' : 'POST';
            const response = await apiFetch(url, { method, body: fd });
            if (response.ok) {
                showToast(editingProject ? 'Project updated!' : 'Project created!', 'success');
                setIsModalOpen(false);
                resetForm();
                fetchProjects();
            } else {
                const data = await response.json();
                showToast(data.message || 'Error saving project', 'error');
            }
        } catch (error) {
            showToast(error.message || 'Error', 'error');
        }
    };

    const handleDeleteImage = async (public_id, project_id) => {
        try {
            const response = await apiFetch(
                `${API_BASE_URL}/projects/delete-image?public_id=${public_id}&project_id=${project_id}`,
                { method: 'DELETE' }
            );
            if (response.ok) { await fetchProjects(); return true; }
            return false;
        } catch { return false; }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this project?')) return;
        try {
            const response = await apiFetch(`${API_BASE_URL}/projects/delete-project/${id}`, { method: 'DELETE' });
            if (response.ok) { showToast('Project deleted!', 'success'); fetchProjects(); }
        } catch (error) {
            showToast(error.message || 'Delete failed', 'error');
        }
    };

    const getImageUrl = img => img?.url || img?.secure_url || img;

    if (loading) return (
        <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p>Loading projects...</p>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Projects</h2>
                    <p className="text-gray-600 text-sm">Manage your portfolio projects</p>
                </div>
                <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    <i className="fas fa-plus mr-2"></i>Add Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                    <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                    <p>No projects found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl">
                            <div className="relative h-48 bg-gray-200 cursor-pointer"
                                 onClick={() => { setSelectedProject(project); setIsGalleryOpen(true); }}>
                                {project.images?.[0]
                                    ? <img src={getImageUrl(project.images[0])} alt={project.title} className="w-full h-full object-cover"/>
                                    : <div className="w-full h-full flex items-center justify-center"><i className="fas fa-image text-4xl text-gray-400"></i></div>
                                }
                                {project.images?.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                        <i className="fas fa-images mr-1"></i>{project.images.length}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-xl mb-2">{project.title}</h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description?.substring(0, 100)}</p>
                                <div className="flex justify-between pt-3 border-t">
                                    <div>
                                        <button onClick={() => openModal(project)} className="text-blue-500 hover:text-blue-700 mr-3">
                                            <i className="fas fa-edit mr-1"></i>Edit
                                        </button>
                                        <button onClick={() => { setSelectedProject(project); setIsGalleryOpen(true); }} className="text-green-500 hover:text-green-700">
                                            <i className="fas fa-images mr-1"></i>{project.images?.length || 0} images
                                        </button>
                                    </div>
                                    <button onClick={() => handleDelete(project._id)} className="text-red-500 hover:text-red-700">
                                        <i className="fas fa-trash mr-1"></i>Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}
                   title={editingProject ? 'Edit Project' : 'Add Project'} size="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description *</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                            rows="4" className="w-full border rounded-lg px-3 py-2" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tech Stack (comma separated)</label>
                        <input type="text" value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2" placeholder="React, Node.js, MongoDB"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">GitHub URL *</label>
                        <input type="url" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2" placeholder="https://github.com/username/repo" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Live URL</label>
                        <input type="url" value={formData.live} onChange={e => setFormData({...formData, live: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2" placeholder="https://yourproject.com"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Images {editingProject ? '(Optional — appends new images)' : '* Required'}
                        </label>
                        <input type="file" multiple accept="image/*"
                            onChange={e => setSelectedImages(Array.from(e.target.files))}
                            className="w-full border rounded-lg px-3 py-2"
                            required={!editingProject}/>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}
                            className="px-4 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </Modal>

            {selectedProject && (
                <ImageGalleryModal
                    isOpen={isGalleryOpen}
                    onClose={() => { setIsGalleryOpen(false); setSelectedProject(null); }}
                    images={selectedProject.images || []}
                    onDeleteImage={handleDeleteImage}
                    projectId={selectedProject._id}
                    showToast={showToast}
                />
            )}
        </div>
    );
};