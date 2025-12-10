import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { PageRenderer } from './components/PageRenderer';
import { generateLandingPageContent } from './services/geminiService';
import { LandingPage, Section, SectionType } from './types';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });
const useAuth = () => useContext(AuthContext);

// --- Layout Components ---
const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">LanderAI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2">Dashboard</Link>
                <button onClick={handleLogout} className="text-slate-600 hover:text-red-600 font-medium px-3 py-2">Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Get Started</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Pages ---

// 1. Home Page
const Home = () => (
  <div className="bg-white">
    <Navbar />
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Build Landing Pages</span>{' '}
                <span className="block text-indigo-600 xl:inline">Powered by AI</span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Generate high-converting landing pages in seconds. Just describe your product, and our Gemini AI agent builds the structure, copy, and layout for you.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link to="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                    Start Building Free
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-indigo-50 flex items-center justify-center">
         <div className="text-9xl">🚀</div>
      </div>
    </div>
  </div>
);

// 2. Auth Page (Login/Signup)
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create Authentication User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store User Data in Firestore
        // Note: Rules require request.auth.uid == userId
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: Date.now(),
          displayName: user.email ? user.email.split('@')[0] : 'User'
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please sign in instead.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Invalid password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {isLogin ? 'Create a new account' : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Dashboard
const Dashboard = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchPages = async () => {
      try {
        // Query scoped to userId to match 'allow read' rule for owners
        const q = query(collection(db, "pages"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedPages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandingPage));
        setPages(fetchedPages);
      } catch (e) {
        console.error("Error fetching pages:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPageName || !newPageSlug) return;
    setCreating(true);
    try {
      const slug = newPageSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // CRITICAL FIX: The query must be scoped to userId.
      // Checking for global uniqueness requires public read access to all pages or a dedicated slugs collection.
      // To satisfy the security rule "allow read if userId == auth.uid", we only check for OUR OWN duplicates here.
      // For a demo, we accept that two different users might claim the same slug (first one to publish "wins" or they coexist).
      const q = query(collection(db, "pages"), where("userId", "==", user.uid), where("slug", "==", slug));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        alert("You already have a page with this slug.");
        setCreating(false);
        return;
      }

      const newPage: LandingPage = {
        userId: user.uid,
        name: newPageName,
        slug: slug,
        isPublished: false,
        sections: [],
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, "pages"), newPage);
      navigate(`/editor/${docRef.id}`);
    } catch (error: any) {
      console.error("Error creating page:", error);
      alert(`Failed to create page: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const deletePage = async (id: string) => {
      if(!confirm("Are you sure you want to delete this page?")) return;
      try {
        await deleteDoc(doc(db, "pages", id));
        setPages(pages.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting page", error);
        alert("Failed to delete page.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">My Landing Pages</h2>
          </div>
        </div>

        {/* Create New Page Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Create New Page</h3>
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Page Name (e.g. Summer Sale)"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
                <input
                    type="text"
                    placeholder="URL Slug (e.g. summer-sale)"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
                <button
                    type="submit"
                    disabled={creating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {creating ? 'Creating...' : 'Create Page'}
                </button>
            </form>
        </div>

        {/* Page List */}
        {loading ? (
           <div className="text-center py-10 text-slate-500">Loading your pages...</div>
        ) : pages.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white shadow rounded-lg">
             You haven't created any landing pages yet.
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-slate-200">
              {pages.map((page) => (
                <li key={page.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                        <div className="flex items-center">
                            <h3 className="text-lg font-medium text-indigo-600 truncate">{page.name}</h3>
                            <span className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {page.isPublished ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                             Slug: <span className="font-mono">/{page.slug}</span>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        {page.isPublished && (
                            <Link to={`/p/${page.slug}`} target="_blank" className="text-slate-600 hover:text-indigo-600 text-sm font-medium">View Live</Link>
                        )}
                        <Link to={`/editor/${page.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</Link>
                        <button onClick={() => deletePage(page.id!)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                    </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Editor
const Editor = () => {
  const { pageId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId) return;
    const fetchPage = async () => {
      try {
        const docRef = doc(db, "pages", pageId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const data = snap.data() as LandingPage;
            // Rule check happens on server, but good to check here too
            if (data.userId !== user?.uid) {
                navigate('/dashboard'); // Unauthorized
                return;
            }
            setPage({ ...data, id: snap.id });
        } else {
            navigate('/dashboard');
        }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
    };
    fetchPage();
  }, [pageId, user, navigate]);

  const handleSave = async () => {
    if (!page || !page.id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "pages", page.id), {
        sections: page.sections,
        isPublished: page.isPublished
      });
    } catch (error) {
      console.error("Save error", error);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
      if(!page) return;
      const newStatus = !page.isPublished;
      setPage({...page, isPublished: newStatus});
      // Auto save on publish toggle
      await updateDoc(doc(db, "pages", page.id!), { isPublished: newStatus });
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setGenerating(true);
    try {
      const generatedSections = await generateLandingPageContent(aiPrompt);
      if (page) {
        setPage({ ...page, sections: generatedSections });
      }
    } catch (error) {
      console.error(error);
      alert("AI Generation failed. Check API limits or try again.");
    } finally {
      setGenerating(false);
    }
  };

  const addSection = (type: SectionType) => {
      if(!page) return;
      const newSection: Section = {
          id: crypto.randomUUID(),
          type,
          content: { title: 'New Section' }
      };
      setPage({...page, sections: [...page.sections, newSection]});
  };

  const removeSection = (id: string) => {
      if(!page) return;
      setPage({...page, sections: page.sections.filter(s => s.id !== id)});
      if (selectedSectionId === id) setSelectedSectionId(null);
  };

  const updateSectionContent = (id: string, field: string, value: any) => {
      if(!page) return;
      const updatedSections = page.sections.map(s => {
          if(s.id === id) {
              return { ...s, content: { ...s.content, [field]: value } };
          }
          return s;
      });
      setPage({...page, sections: updatedSections});
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Editor...</div>;
  if (!page) return <div className="flex h-screen items-center justify-center">Page not found</div>;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 bg-white z-10">
         <div className="flex items-center">
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 mr-4">← Back</Link>
            <h1 className="text-lg font-bold text-slate-800">{page.name}</h1>
            <span className="ml-3 text-xs text-slate-400 font-mono">/{page.slug}</span>
         </div>
         <div className="flex items-center space-x-3">
             <span className={`text-sm ${page.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                 {page.isPublished ? 'Published' : 'Draft Mode'}
             </span>
             <button
                onClick={handlePublishToggle}
                className="px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50"
             >
                 {page.isPublished ? 'Unpublish' : 'Publish'}
             </button>
             <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
             >
                 {saving ? 'Saving...' : 'Save Changes'}
             </button>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto custom-scrollbar flex flex-col">
            {/* AI Generator */}
            <div className="p-4 border-b border-slate-200 bg-white">
                <h3 className="text-sm font-semibold text-indigo-600 mb-2 flex items-center">
                    ✨ AI Magic Builder
                </h3>
                <textarea
                    className="w-full text-sm p-2 border border-slate-300 rounded mb-2 h-20 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. A landing page for a vegan dog food subscription service..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button
                    onClick={handleAiGenerate}
                    disabled={generating || !aiPrompt}
                    className="w-full bg-indigo-100 text-indigo-700 py-2 rounded text-sm font-medium hover:bg-indigo-200 disabled:opacity-50"
                >
                    {generating ? 'Generating...' : 'Generate with Gemini'}
                </button>
            </div>

            {/* Sections List */}
            <div className="p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Sections</h3>
                <div className="space-y-2 mb-6">
                    {page.sections.map((section, idx) => (
                        <div key={section.id} className={`group flex items-center justify-between p-2 border rounded cursor-pointer ${selectedSectionId === section.id ? 'border-indigo-500 bg-indigo-50' : 'bg-white border-slate-200 hover:border-indigo-400'}`} onClick={() => setSelectedSectionId(section.id)}>
                            <span className="text-sm font-medium text-slate-700 truncate w-32">{section.type} - {idx + 1}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="text-slate-400 hover:text-red-500">×</button>
                        </div>
                    ))}
                </div>

                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add Section</h3>
                <div className="grid grid-cols-2 gap-2">
                    {['hero', 'features', 'testimonials', 'cta', 'footer'].map(type => (
                        <button
                            key={type}
                            onClick={() => addSection(type as SectionType)}
                            className="p-2 text-xs bg-white border border-slate-200 rounded hover:bg-slate-50 capitalize"
                        >
                            + {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Section Editor */}
            {selectedSectionId && (
                <div className="border-t border-slate-200 p-4 bg-white">
                     <h3 className="text-sm font-semibold mb-3">Edit Section Content</h3>
                     {(() => {
                         const section = page.sections.find(s => s.id === selectedSectionId);
                         if(!section) return null;
                         return (
                             <div className="space-y-3">
                                 <div>
                                     <label className="text-xs text-slate-500 block mb-1">Title</label>
                                     <input
                                        type="text"
                                        className="w-full text-sm border p-1 rounded"
                                        value={section.content.title || ''}
                                        onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                                     />
                                 </div>
                                 {(section.type === 'hero' || section.type === 'features') && (
                                     <div>
                                         <label className="text-xs text-slate-500 block mb-1">Subtitle</label>
                                         <textarea
                                            className="w-full text-sm border p-1 rounded"
                                            value={section.content.subtitle || ''}
                                            onChange={(e) => updateSectionContent(section.id, 'subtitle', e.target.value)}
                                         />
                                     </div>
                                 )}
                                 {(section.type === 'hero' || section.type === 'cta') && (
                                     <div>
                                         <label className="text-xs text-slate-500 block mb-1">Button Text</label>
                                         <input
                                            type="text"
                                            className="w-full text-sm border p-1 rounded"
                                            value={section.content.buttonText || ''}
                                            onChange={(e) => updateSectionContent(section.id, 'buttonText', e.target.value)}
                                         />
                                     </div>
                                 )}
                             </div>
                         );
                     })()}
                </div>
            )}
        </div>

        {/* Canvas / Preview Area */}
        <div className="flex-1 bg-slate-100 overflow-y-auto custom-scrollbar p-8">
             <div className="max-w-5xl mx-auto bg-white shadow-xl min-h-[800px] rounded-lg overflow-hidden border border-slate-200 transform transition-all">
                  <PageRenderer sections={page.sections} preview={true} />
             </div>
        </div>
      </div>
    </div>
  );
};

// 5. Public View
const PublicView = () => {
    const { slug } = useParams();
    const [page, setPage] = useState<LandingPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                // CRITICAL FIX: The query must contain 'isPublished == true' to match the security rule.
                // Rule: allow read: if resource.data.isPublished == true ...
                const q = query(collection(db, "pages"), where("slug", "==", slug), where("isPublished", "==", true));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setPage(snap.docs[0].data() as LandingPage);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if(loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if(error || !page) return (
      <div className="flex flex-col h-screen items-center justify-center text-slate-500">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg">Page not found or not published.</p>
        <Link to="/" className="mt-6 text-indigo-600 hover:text-indigo-800">Go Home</Link>
      </div>
    );

    return <PageRenderer sections={page.sections} />;
};


// --- Auth Provider and Protected Route ---
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// --- Main App Component ---
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/editor/:pageId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          {/* Public Page Route */}
          <Route path="/p/:slug" element={<PublicView />} />
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}