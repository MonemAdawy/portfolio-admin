const { useState, useEffect } = React;

// ── Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('projects');
    const [toast, setToast] = useState(null);
    const [contactsCount, setContactsCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    const showToast = (message, type) => setToast({ message, type });

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await apiFetch(`${API_BASE_URL}/auth/me`);
                setIsLoggedIn(res.ok);
            } catch (_) {
                setIsLoggedIn(false);
            } finally {
                setCheckingSession(false);
            }
        };
        checkSession();
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;
        const fetchCount = async () => {
            try {
                const res = await apiFetch(`${API_BASE_URL}/contact`);
                if (res.ok) {
                    const data = await res.json();
                    setContactsCount(data.length);
                }
            } catch (_) {}
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    const handleLogout = async () => {
        try {
            const res = await apiFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
            if (res.ok) {
                showToast('Logged out successfully', 'success');
            }
        } catch (error) {
            showToast(error.message || 'Logout failed', 'error');
        } finally {
            setIsLoggedIn(false);
        }
    };

    if (checkingSession) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
        </div>
    );

    if (!isLoggedIn) return (
        <>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            <Login onLogin={() => setIsLoggedIn(true)} showToast={showToast} />
        </>
    );

    const tabs = [
        { id: 'projects', label: 'Projects', icon: 'fa-folder-open' },
        { id: 'services', label: 'Services', icon: 'fa-cogs' },
        { id: 'skills', label: 'Skills', icon: 'fa-code' },
        { id: 'contacts', label: 'Contacts', icon: 'fa-envelope' }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">
                            <i className="fas fa-tachometer-alt mr-3"></i>Admin Dashboard
                        </h1>
                        <p className="text-blue-100 text-sm">Authenticated admin panel</p>
                    </div>
                    <button onClick={handleLogout}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                        <i className="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
            </header>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="border-b bg-gray-50 flex flex-wrap">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-medium transition ${
                                    activeTab === tab.id
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}>
                                <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
                                {tab.id === 'contacts' && contactsCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                        {contactsCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="p-6">
                        {activeTab === 'projects' && <Projects showToast={showToast} />}
                        {activeTab === 'services' && <Services showToast={showToast} />}
                        {activeTab === 'skills'   && <Skills   showToast={showToast} />}
                        {activeTab === 'contacts' && <Contacts showToast={showToast} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Login = ({ onLogin, showToast }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!username || !password) {
            showToast('Username and password are required', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                body: { username, password }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showToast('Login successful', 'success');
                onLogin();
            } else {
                showToast(data.message || 'Invalid credentials', 'error');
            }
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 text-white px-10 py-8">
                    <h2 className="text-3xl font-bold mb-2">Admin Login</h2>
                    <p className="text-blue-100">Enter credentials to access the dashboard</p>
                </div>
                <form onSubmit={handleSubmit} className="px-8 py-10 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};