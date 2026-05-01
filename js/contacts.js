const { useState, useEffect } = React;

// ── Contacts Component ────────────────────────────────────────────────
const Contacts = ({ showToast }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchContacts = async () => {
        console.log('[Contacts] Fetching contacts...');
        try {
            const response = await apiFetch(`${API_BASE_URL}/contact`);
            console.log('[Contacts] Response status:', response.status);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            console.log('[Contacts] Fetched contacts:', data);
            setContacts(data);
        } catch (e) {
            console.error('[Contacts] Error:', e);
            showToast('Error fetching contacts', 'error');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchContacts(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this message?')) return;
        try {
            const response = await apiFetch(`${API_BASE_URL}/contact/${id}`, { method: 'DELETE' });
            if (response.ok) { showToast('Message deleted!', 'success'); fetchContacts(); }
        } catch (e) {
            showToast(e.message || 'Delete failed', 'error');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Delete ALL contact messages?')) return;
        try {
            const response = await apiFetch(`${API_BASE_URL}/contact`, { method: 'DELETE' });
            if (response.ok) {
                showToast('All messages deleted!', 'success');
                fetchContacts();
            } else {
                await Promise.all(contacts.map(c =>
                    apiFetch(`${API_BASE_URL}/contact/${c._id}`, { method: 'DELETE' })
                ));
                showToast('All messages deleted!', 'success');
                fetchContacts();
            }
        } catch (e) {
            showToast('Delete all failed', 'error');
        }
    };

    const handleUpdate = async (contact) => {
        const newMessage = prompt('Edit message:', contact.message);
        if (!newMessage || newMessage === contact.message) return;
        try {
            const response = await apiFetch(`${API_BASE_URL}/contact/${contact._id}`, {
                method: 'PATCH',
                body: { message: newMessage }
            });
            if (response.ok) { showToast('Message updated!', 'success'); fetchContacts(); }
            else showToast('Update failed', 'error');
        } catch (e) { showToast(e.message || 'Update error', 'error'); }
    };

    if (loading) return (
        <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p>Loading contacts...</p>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Contact Messages</h2>
                    <p className="text-gray-600 text-sm">Total: {contacts.length} message{contacts.length !== 1 ? 's' : ''}</p>
                </div>
                {contacts.length > 0 && (
                    <button onClick={handleDeleteAll} className="bg-red-600 text-white px-4 py-2 rounded-lg">
                        <i className="fas fa-trash-alt mr-2"></i>Delete All
                    </button>
                )}
            </div>
            {contacts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                    <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <p>No messages</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contacts.map(contact => (
                        <div key={contact._id} className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div><span className="font-semibold">Name:</span> {contact.name}</div>
                                        <div><span className="font-semibold">Email:</span>{' '}
                                            <a href={`mailto:${contact.email}`} className="text-blue-500 hover:underline">{contact.email}</a>
                                        </div>
                                        {contact.phone && <div><span className="font-semibold">Phone:</span> {contact.phone}</div>}
                                        <div><span className="font-semibold">Received:</span>{' '}
                                            {new Date(contact.createdAt || Date.now()).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Message:</span>
                                        <p className="text-gray-600 mt-2 bg-gray-50 p-3 rounded">{contact.message}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button onClick={() => handleUpdate(contact)} className="text-blue-500 hover:text-blue-700 p-2">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => handleDelete(contact._id)} className="text-red-500 hover:text-red-700 p-2">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};