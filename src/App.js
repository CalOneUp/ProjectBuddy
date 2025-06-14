import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp, query, orderBy, getDocs, where, getDoc } from 'firebase/firestore';

// --- Helper Components & Icons ---
const ChevronDown = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6" /></svg>);
const UserIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const AlertTriangleIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>);
const PlusCircleIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const Trash2Icon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);
const ExternalLinkIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>);
const SearchIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const ShareIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>);
const ClipboardIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>);
const MessageSquareIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>);
const EyeIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const ZapIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
const FileTextIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>);
const UsersIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);

// --- App Data & Config ---
const STATUS_OPTIONS = { 'Pending': { label: 'Pending', color: 'bg-yellow-400/20', textColor: 'text-yellow-300' }, 'In Progress': { label: 'In Progress', color: 'bg-blue-400/20', textColor: 'text-blue-300' }, 'Done': { label: 'Done', color: 'bg-green-400/20', textColor: 'text-green-300' },};
const DEMO_PROJECT_ID = 'demo-project-123';

// --- Utility Functions ---
const getDeadlineStatus = (dueDate) => {
    if (!dueDate) return 'none';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dueDate + 'T00:00:00');
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'dueSoon';
    return 'none';
};
const getDaysRemaining = (deadline) => {
    if(!deadline) return 0;
    const today = new Date();
    const diffTime = new Date(deadline + 'T00:00:00').getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
const formatTimestamp = (firebaseTimestamp) => { if (!firebaseTimestamp?.toDate) return 'Just now'; return firebaseTimestamp.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }); };

// --- Meta Tag Management Functions ---
const defaultTitle = "Meet & Tackle | Turn Meetings into Actionable Projects";
const defaultDescription = "Stop letting action items get lost. Meet & Tackle uses AI to analyze your meeting transcripts and instantly create a collaborative project plan. Paste a transcript to get started.";

const updateMetaTags = (title, description) => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="twitter:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="twitter:description"]')?.setAttribute("content", description);
};

const resetMetaTags = () => {
    document.title = defaultTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", defaultDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", defaultTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", defaultDescription);
    document.querySelector('meta[property="twitter:title"]')?.setAttribute("content", defaultTitle);
    document.querySelector('meta[property="twitter:description"]')?.setAttribute("content", defaultDescription);
};

// --- Toast Notification System ---
const ToastContext = React.createContext();
const useToast = () => React.useContext(ToastContext);

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    
    const addToast = useCallback((message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2">
                {toasts.map((toast) => (
                    <div key={toast.id} className="max-w-sm w-full bg-brand-surface border border-slate-700 rounded-lg shadow-lg p-4 flex items-center space-x-4 animate-fade-in-up">
                        <span className="text-brand-primary">📣</span>
                        <p className="text-sm text-slate-200">{toast.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};


// --- Main App Component ---
export default function App() {
    const [route, setRoute] = useState({ page: 'home', projectId: null });
    const [db, setDb] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // This effect handles URL changes and browser navigation (back/forward)
    useEffect(() => {
        const handlePopState = (event) => {
            if (event.state) {
                setRoute(event.state);
            } else {
                // This handles going back to the initial state
                const queryParams = new URLSearchParams(window.location.search);
                const projectId = queryParams.get('id');
                if (projectId) {
                    setRoute({ page: 'project', projectId });
                } else {
                    setRoute({ page: 'home', projectId: null });
                }
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Set initial route based on the URL when the app first loads
        const queryParams = new URLSearchParams(window.location.search);
        const initialProjectId = queryParams.get('id');
        if (initialProjectId) {
            setRoute({ page: 'project', projectId: initialProjectId });
        } else {
             setRoute({ page: 'home', projectId: null });
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);


    // This effect syncs the app's route state to the browser's URL and history
    useEffect(() => {
        const { page, projectId } = route;
        const url = page === 'project' && projectId ? `?id=${projectId}` : '/';
        
        // Prevent pushing the same state to history
        if (window.location.search !== url && url.startsWith('?')) {
            window.history.pushState(route, '', url);
        } else if (window.location.pathname !== url && url === '/') {
             window.history.pushState(route, '', url);
        }

    }, [route]);
    
    const navigate = (page, projectId = null) => {
        setRoute({ page, projectId });
    };

    // This hook prevents the backspace key from triggering browser navigation outside of inputs
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Backspace') {
                const target = e.target;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    return;
                }
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Initialize Firebase
    useEffect(() => {
        const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            setDb(firestore);
        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
        setIsLoading(false);
    }, []);


    if (isLoading) {
        return <div className="min-h-screen bg-brand-dark flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div></div>;
    }

    return (
        <ToastProvider>
            <div className="min-h-screen bg-brand-dark font-sans text-white">
                 <style>
                    {`
                        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
                        .font-poppins {
                            font-family: 'Poppins', sans-serif;
                        }
                        @keyframes fade-in-up {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fade-in-up {
                            animation: fade-in-up 0.5s ease-out forwards;
                        }
                    `}
                </style>
                { route.page === 'home' && <HomePage db={db} appId="meetandtackle-app" navigate={navigate} setNotification={setNotification} /> }
                { route.page === 'project' && <ProjectPage db={db} appId="meetandtackle-app" projectId={route.projectId} navigate={navigate} notification={notification} setNotification={setNotification} /> }
            </div>
        </ToastProvider>
    );
}

// --- Local Storage Manager for Recent Projects ---
const recentProjectsManager = {
    get: () => {
        try {
            const projects = localStorage.getItem('meetandtackle_recentProjects');
            return projects ? JSON.parse(projects) : [];
        } catch (e) {
            console.error("Failed to parse recent projects from localStorage", e);
            return [];
        }
    },
    add: (project) => {
        if (!project || !project.id || !project.name || project.id === DEMO_PROJECT_ID) return; // Don't save demo project
        let projects = recentProjectsManager.get();
        projects = projects.filter(p => p.id !== project.id);
        projects.unshift(project);
        projects = projects.slice(0, 5);
        try {
            localStorage.setItem('meetandtackle_recentProjects', JSON.stringify(projects));
        } catch (e) {
            console.error("Failed to save recent projects to localStorage", e);
        }
    }
};

// --- Home Page ---
const HomePage = ({ db, appId, navigate, setNotification }) => {
    const [transcript, setTranscript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [recentProjects, setRecentProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    // --- NEW: State and fetching for the expanded word list ---
    const [wordList, setWordList] = useState([]);
    const fallbackWords = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'ugli', 'watermelon', 'zucchini', 'purple', 'monkey', 'dishwasher', 'rocket', 'planet', 'star', 'galaxy', 'comet', 'nebula', 'orbit', 'lunar', 'solar', 'astral'];

    useEffect(() => {
        // Fetch the large word list from an external source
        fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(text => {
                // Split the text into an array of words and filter them for quality.
                // We'll keep words between 4 and 7 letters to ensure they are memorable.
                const words = text.split('\n').filter(word => word.length >= 4 && word.length <= 7);
                setWordList(words);
            })
            .catch(error => {
                console.error("Failed to fetch word list, using fallback:", error);
                // If fetching fails, we'll just use the original list
                setWordList([]); 
            });
    }, []); // The empty dependency array ensures this runs only once on mount.
    
    // --- MODIFIED: Project code generation now uses the new list ---
    const generateProjectCode = () => {
        // Use the fetched word list if available, otherwise use the smaller fallback list.
        const listToUse = wordList.length > 0 ? wordList : fallbackWords;
        const code = [];
        for (let i = 0; i < 3; i++) {
            code.push(listToUse[Math.floor(Math.random() * listToUse.length)].toLowerCase());
        }
        return code.join('.');
    };

    useEffect(() => {
        setRecentProjects(recentProjectsManager.get());
        resetMetaTags(); // Reset meta tags when returning to home page
    }, []);

    const handleGenerateProject = async () => {
        if (!transcript.trim()) {
            setError('Please paste a transcript first.');
            return;
        }
        setIsGenerating(true);
        setError('');
        
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

        // Smartly extract attendees from the transcript
        let attendees = [];
        const transcriptLines = transcript.split('\n');
        const attendeesRegex = /attendees:([\s\S]*?)(?=\n\n|\n[A-Z\s]+:|$)/i;
        const attendeesMatch = transcript.match(attendeesRegex);
        if (attendeesMatch) {
            attendees = attendeesMatch[1].split('\n').map(name => name.trim().replace(/ \(.*/, '')).filter(Boolean);
        } else {
            const speakerRegex = /^([A-Za-z\s]+)\s*(?:\(.*\))?:/gm;
            let match;
            while ((match = speakerRegex.exec(transcript)) !== null) {
                attendees.push(match[1].trim());
            }
            attendees = [...new Set(attendees)]; // Get unique names
        }
        const attendeesListString = attendees.length > 0 ? attendees.join(', ') : 'Not specified';

        const prompt = `
        You are a project management expert. Your task is to analyze a meeting transcript and convert it into a structured JSON object of actionable tasks.

        **Primary Goal:** Create a comprehensive list of all action items, decisions, and commitments from the transcript. Do not miss any.

        **Critical Rules:**
        1.  **JSON Output Only**: Your entire response MUST be a single, raw JSON object. Do not include any text before or after it.
        2.  **Deduplicate Tasks**: If the same action is discussed multiple times, create only ONE task. Combine the context. For example, if "Mark needs to check the budget" and "Mark will get back to us on the budget numbers" are mentioned, create a single task: "Check budget and report back".
        3.  **Create Concise Titles**: Task titles must be short, clear action items. Start with a verb.
        4.  **Identify Owners**: A task owner is the person responsible for the action. Review the conversation to determine who this is. Use the provided "Meeting Attendees" list as a reference. If a speaker commits to an action (e.g., "I'll handle that"), they are the owner.
        
        **Context:**
        - Today's Date: ${dayOfWeek}, ${formattedDate}.
        - Meeting Attendees: ${attendeesListString}.

        **JSON Structure:**
        {
          "projectName": "A short, descriptive name for the overall project.",
          "projectDeadline": "YYYY-MM-DD or empty string",
          "tasks": [
            {
              "title": "Concise, verb-first action item.",
              "owner": ["Name"],
              "category": "Logical category (e.g., Marketing, Development, Design, Operations).",
              "status": "Pending",
              "dueDate": "YYYY-MM-DD or empty string"
            }
          ]
        }

        **Analyze the following transcript:**
        ---
        ${transcript}
        ---
        `;
        const generationConfig = { responseMimeType: "application/json", responseSchema: { type: 'OBJECT', properties: { projectName: { type: 'STRING' }, projectDeadline: { type: 'STRING', description: 'A date in `YYYY-MM-DD` format.' }, tasks: { type: 'ARRAY', items: { type: 'OBJECT', properties: { title: { type: 'STRING' }, owner: { type: 'ARRAY', items: { type: 'STRING' } }, category: { type: 'STRING' }, status: { type: 'STRING', enum: ['Pending', 'In Progress', 'Done'] }, dueDate: { type: 'STRING', description: 'A date in `YYYY-MM-DD` format. Can be an empty string.' } } } } } } };
        
        let geminiText = ''; // Declare geminiText here to access it in the catch block
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig };
            
            const apiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                throw new Error(`API call failed with status ${apiResponse.status}: ${errorText}`);
            }

            const result = await apiResponse.json();
            geminiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!geminiText) {
                throw new Error('The AI response was empty or in an unexpected format. Please try again.');
            }
            
            const projectData = JSON.parse(geminiText);

            if (!projectData.projectName || !Array.isArray(projectData.tasks)) {
                 throw new Error('The AI response was missing key project information.');
            }

            const projectsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'projects');
            
            const newProjectRef = await addDoc(projectsCollectionRef, { 
                name: projectData.projectName || 'Untitled Project', 
                deadline: projectData.projectDeadline || null, 
                createdAt: serverTimestamp(), 
                code: generateProjectCode() 
            });

            const tasksCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'projects', newProjectRef.id, 'tasks');
            
            const tasksToAdd = projectData.tasks.map(task => ({
                title: task.title || 'Untitled Task',
                owner: Array.isArray(task.owner) && task.owner.length > 0 ? task.owner : ['Unassigned'],
                category: task.category || 'General',
                status: task.status || 'Pending',
                dueDate: task.dueDate || ''
            }));
            const uniqueOwners = new Set(tasksToAdd.flatMap(t => t.owner).filter(o => o !== 'Unassigned'));

            await Promise.all(tasksToAdd.map(task => addDoc(tasksCollectionRef, task)));
            
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'projects', newProjectRef.id, 'activityLog'), { 
                log: `Project created by ✨ Meet & Tackle AI`, 
                timestamp: serverTimestamp() 
            });
            
            const summary = `Project "${projectData.projectName}" created with ${tasksToAdd.length} tasks and ${uniqueOwners.size} owner(s) assigned.`;
            setNotification(summary);
            navigate('project', newProjectRef.id);

        } catch (e) {
            console.error("GENERATION FAILED:", e);
            if (e instanceof SyntaxError) {
                // If JSON parsing fails, show a more descriptive error with the raw text.
                setError(`Error: The AI's response was not valid. This can happen with complex transcripts. Please try simplifying the transcript. Raw AI response: "${geminiText}"`);
            } else {
                setError(`An error occurred: ${e.message}`);
            }
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        if (!searchQuery.trim()) return;
        setIsSearching(true);
    
        const oldAppId = 'project-buddy-app';
        const currentAppId = appId; // 'meetandtackle-app'
        const searchTerm = searchQuery.trim().toLowerCase();
    
        const oldProjectsRef = collection(db, 'artifacts', oldAppId, 'public', 'data', 'projects');
        const currentProjectsRef = collection(db, 'artifacts', currentAppId, 'public', 'data', 'projects');
    
        const qOld = query(oldProjectsRef, where("code", "==", searchTerm));
        const qCurrent = query(currentProjectsRef, where("code", "==", searchTerm));
    
        try {
            const [oldSnapshot, currentSnapshot] = await Promise.all([
                getDocs(qOld),
                getDocs(qCurrent)
            ]);
    
            if (!oldSnapshot.empty) {
                const projectDoc = oldSnapshot.docs[0];
                navigate('project', projectDoc.id);
            } else if (!currentSnapshot.empty) {
                const projectDoc = currentSnapshot.docs[0];
                navigate('project', projectDoc.id);
            } else {
                setError("Project not found. Please check the code and try again.");
            }
        } catch (err) {
            console.error("Search failed:", err);
            setError("An error occurred during search.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-12">
                <img src="/mt-logo.png" alt="Meet & Tackle Logo" className="mx-auto mb-4 max-w-sm" />
                <p className="text-brand-light text-lg mt-4">Hook into your action items. The best AI tool to tackle your meeting notes.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:items-start">
                <div className="lg:col-span-3">
                    <div className="bg-brand-surface p-6 rounded-lg border border-slate-700 shadow-2xl">
                        <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste your meeting transcript here to get started...&#10;&#10;Optional: Start with an 'Attendees:' list for better owner assignment.&#10;Attendees:&#10;Sarah Chen (SC)&#10;Mark Davies (MD)" className="w-full h-96 bg-brand-dark border border-slate-600 rounded-md p-4 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary placeholder-slate-500" disabled={isGenerating}/>
                        <div className="mt-4 flex justify-between items-center">
                             <p className="text-slate-400 text-sm">
                                Or{" "}
                                <button
                                    onClick={() => navigate('project', DEMO_PROJECT_ID)}
                                    className="text-brand-light hover:text-brand-primary underline font-semibold"
                                >
                                    view an example project
                                </button>
                            </p>
                            <div className="flex items-center">
                                {error && <div className="text-sm text-red-400 mr-4 overflow-y-auto max-h-20"><p>{error}</p></div>}
                                <button onClick={handleGenerateProject} className="flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-brand-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" disabled={isGenerating}>
                                    {isGenerating ? (<><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Generating...</>) : (<><span className="text-lg">✨</span> Generate Project</>)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Already working on a project?</h2>
                        <div className="max-w-lg mx-auto bg-brand-surface p-6 rounded-lg border border-slate-700 shadow-2xl">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input type="text" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setError('')}} placeholder="Enter project code (e.g. purple.monkey.dishwasher)" className="flex-1 bg-brand-dark border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary" />
                                <button type="submit" className="px-4 text-sm font-semibold text-white bg-brand-primary rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center w-14" disabled={!searchQuery.trim() || isSearching}>
                                    {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <SearchIcon className="w-5 h-5" />}
                                </button>
                            </form>
                            {error && !isGenerating && <p className="text-sm text-red-400 mt-4">{error}</p>}
                        </div>
                    </div>

                    {recentProjects.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4 text-center">Recently Viewed Projects</h2>
                            <div className="max-w-lg mx-auto space-y-3">
                                {recentProjects.map(proj => (
                                    <div key={proj.id} onClick={() => navigate('project', proj.id)} className="bg-brand-surface p-4 rounded-lg border border-slate-700 hover:border-brand-primary flex justify-between items-center cursor-pointer transition-colors">
                                        <span className="font-semibold text-slate-200">{proj.name}</span>
                                        <ExternalLinkIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="my-24 py-16 bg-brand-surface rounded-2xl">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Stop Drowning in Meeting Notes. Start Tackling Your Projects.</h2>
                    <p className="text-brand-light mb-12 max-w-3xl mx-auto">Tired of action items getting lost at sea? Meet & Tackle is the AI-powered tool that analyzes your meeting transcripts, hooks every task, and organizes them into a clear, collaborative project plan. Stop just meeting; start tackling.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-brand-dark p-6 rounded-lg border border-slate-700">
                            <FileTextIcon className="w-8 h-8 mx-auto mb-4 text-brand-primary"/>
                            <h3 className="text-xl font-semibold text-white mb-2">AI Project Creation</h3>
                            <p className="text-brand-light">Paste any meeting transcript and our AI will instantly generate a complete project plan, complete with tasks, owners, and categories.</p>
                        </div>
                        <div className="bg-brand-dark p-6 rounded-lg border border-slate-700">
                             <ZapIcon className="w-8 h-8 mx-auto mb-4 text-brand-primary"/>
                            <h3 className="text-xl font-semibold text-white mb-2">Automatic Project Updates</h3>
                            <p className="text-brand-light">Got a follow-up meeting? Just paste the new transcript. Our AI will intelligently update existing tasks and add new ones.</p>
                        </div>
                        <div className="bg-brand-dark p-6 rounded-lg border border-slate-700">
                           <UsersIcon className="w-8 h-8 mx-auto mb-4 text-brand-primary"/>
                            <h3 className="text-xl font-semibold text-white mb-2">Collaborative Dashboard</h3>
                            <p className="text-brand-light">Share your project with a unique code. Everyone can see the real-time status, add comments, and update tasks together.</p>
                        </div>
                        <div className="bg-brand-dark p-6 rounded-lg border border-slate-700">
                           <MessageSquareIcon className="w-8 h-8 mx-auto mb-4 text-brand-primary"/>
                            <h3 className="text-xl font-semibold text-white mb-2">Instant Slack Updates</h3>
                            <p className="text-brand-light">With one click, generate a perfectly formatted Slack message to keep your team in the loop on project progress and at-risk tasks.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="my-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">No Transcript? No Problem.</h2>
                    <p className="text-brand-light mb-12 max-w-2xl mx-auto">Getting a transcript is easier than you think. Most meeting platforms have built-in transcription, or you can use a dedicated service. Once you have the text, just paste it in to see the magic happen.</p>
                     <div className="flex justify-center gap-8">
                        <a href="https://support.zoom.us/hc/en-us/articles/115004794983-Using-audio-transcription-for-cloud-recordings" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Zoom</a>
                        <a href="https://support.google.com/meet/answer/13286392?hl=en" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google Meet</a>
                        <a href="https://support.microsoft.com/en-us/office/view-live-transcription-in-a-teams-meeting-dc1a8f23-2e20-4684-885e-2152e06a4a8b" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Microsoft Teams</a>
                        <a href="https://otter.ai/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Otter.ai</a>
                        <a href="https://fireflies.ai/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Fireflies.ai</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Project Page ---
const ProjectPage = ({ db, appId, projectId, navigate, notification, setNotification }) => {
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gsapReady, setGsapReady] = useState(false);
    const [filterOwner, setFilterOwner] = useState('All');
    const [showAddTaskForm, setShowAddTaskForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [updateFeedback, setUpdateFeedback] = useState('');
    const [copyFeedback, setCopyFeedback] = useState('');
    const [slackUpdate, setSlackUpdate] = useState(null);
    const [isGeneratingUpdate, setIsGeneratingUpdate] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [projectDeadline, setProjectDeadline] = useState('');
    const [userName, setUserName] = useState(null);
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [actionToRun, setActionToRun] = useState(null);
    const [activeAppId, setActiveAppId] = useState(appId); // --- FIX: State to hold the correct appId

    const isDemo = projectId === DEMO_PROJECT_ID;

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 7000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    useEffect(() => {
        const storedName = localStorage.getItem('meetandtackle_userName');
        if (storedName) {
            setUserName(storedName);
        } else if (!isDemo) { // Don't prompt for name in demo mode
            setShowNamePrompt(true);
        } else {
            setUserName('Guest'); // Set a default name for demo
        }
    }, [isDemo]);

    const requireName = (action) => {
        if (userName) {
            action(userName);
        } else if (!isDemo) { // Only prompt for name if not in demo mode
            setActionToRun(() => action);
            setShowNamePrompt(true);
        } else {
             alert("This feature is disabled in the demo project.");
        }
    };

    useEffect(() => { if (window.gsap && window.Flip) { if (!gsapReady) setGsapReady(true); return; } const gsapScript = document.createElement('script'); gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'; gsapScript.async = true; gsapScript.onload = () => { const flipScript = document.createElement('script'); flipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js'; flipScript.async = true; flipScript.onload = () => { window.gsap.registerPlugin(window.Flip); setGsapReady(true); }; document.body.appendChild(flipScript); }; document.body.appendChild(gsapScript); }, [gsapReady]);

    useEffect(() => {
        if (isDemo) {
            setActiveAppId(appId); // For demo, use the default appId
            const today = new Date();
            const demoDeadline = new Date(today.getFullYear(), today.getMonth() + 2, 15); // Deadline in 2 months
            const demoProject = {
                id: DEMO_PROJECT_ID,
                name: 'Website Redesign (Demo)',
                deadline: demoDeadline.toISOString().split('T')[0],
                code: 'view.example.only',
                isDemo: true,
            };
            setProject(demoProject);
            updateMetaTags(`Project: ${demoProject.name}`, `View the project plan for ${demoProject.name} on Meet & Tackle.`);
            
            const demoTasks = [
                { id: 'demo-1', title: 'Draft initial design mockups', owner: ['Alice'], category: 'Design', status: 'In Progress', dueDate: new Date(new Date().setDate(today.getDate() + 7)).toISOString().split('T')[0] },
                { id: 'demo-2', title: 'Set up staging server environment', owner: ['Bob'], category: 'Development', status: 'In Progress', dueDate: new Date(new Date().setDate(today.getDate() + 10)).toISOString().split('T')[0] },
                { id: 'demo-3', title: 'Finalize branding and color palette', owner: ['Alice'], category: 'Design', status: 'Done', dueDate: new Date(new Date().setDate(today.getDate() - 5)).toISOString().split('T')[0] },
                { id: 'demo-4', title: 'Develop user authentication flow', owner: ['Charlie'], category: 'Development', status: 'Pending', dueDate: new Date(new Date().setDate(today.getDate() + 21)).toISOString().split('T')[0] },
                { id: 'demo-5', title: 'Write copy for the new homepage', owner: ['Unassigned'], category: 'Marketing', status: 'Pending', dueDate: '' },
                { id: 'demo-6', title: 'Review and approve final designs', owner: ['David'], category: 'Design', status: 'Pending', dueDate: new Date(new Date().setDate(today.getDate() + 14)).toISOString().split('T')[0] },
            ];
            setTasks(demoTasks);
            setIsLoading(false);
            
            return () => {
                resetMetaTags();
            };
        }

        if (!db || !projectId) return;
        setIsLoading(true);

        const fetchAndSubscribe = async () => {
            const currentAppId = appId; // The default, new app id
            const oldAppId = 'project-buddy-app';
            let finalProjectRef;
            let finalAppId = currentAppId;

            // Check current appId first
            const currentProjectRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'projects', projectId);
            const currentDocSnap = await getDoc(currentProjectRef);

            if (currentDocSnap.exists()) {
                finalProjectRef = currentProjectRef;
            } else {
                // If not found, check old appId
                const oldProjectRef = doc(db, 'artifacts', oldAppId, 'public', 'data', 'projects', projectId);
                const oldDocSnap = await getDoc(oldProjectRef);
                if (oldDocSnap.exists()) {
                    finalProjectRef = oldProjectRef;
                    finalAppId = oldAppId; // Set the correct appId for task fetching
                }
            }
            
            // --- FIX: Set the activeAppId for all other functions to use ---
            setActiveAppId(finalAppId); 

            if (finalProjectRef) {
                const unsubProject = onSnapshot(finalProjectRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const projectData = { id: docSnap.id, ...docSnap.data() };
                        setProject(projectData);
                        setProjectName(projectData.name);
                        setProjectDeadline(projectData.deadline || '');
                        recentProjectsManager.add({ id: projectData.id, name: projectData.name });
                        updateMetaTags(`Project: ${projectData.name}`, `View the project plan for ${projectData.name} on Meet & Tackle.`);
                    }
                });

                const tasksCollectionRef = collection(db, 'artifacts', finalAppId, 'public', 'data', 'projects', projectId, 'tasks');
                const q = query(tasksCollectionRef); // No ordering here, sort client-side
                const unsubTasks = onSnapshot(q, (snapshot) => {
                    const statusOrder = { 'In Progress': 1, 'Pending': 2, 'Done': 3 };
                    const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    fetchedTasks.sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));
                    setTasks(fetchedTasks);
                    setIsLoading(false);
                });

                return () => {
                    unsubProject();
                    unsubTasks();
                    resetMetaTags();
                };
            } else {
                console.error("Project not found in any location!");
                setProject(null);
                setIsLoading(false);
                resetMetaTags();
            }
        };

        fetchAndSubscribe();
    }, [db, appId, projectId, isDemo]);

    const handleProjectUpdate = (updates, actor) => {
        if (isDemo || !db || !projectId) return;
        // --- FIX: Use activeAppId from state ---
        const projectRef = doc(db, 'artifacts', activeAppId, 'public', 'data', 'projects', projectId);
        try {
            updateDoc(projectRef, updates);
            const field = Object.keys(updates)[0];
            logActivity(`${actor} updated the project ${field} to "${updates[field]}"`);
        } catch (e) {
            console.error("Error updating project details: ", e);
        }
    };

    const handleSaveName = () => requireName((name) => {
        if (projectName.trim() && projectName !== project.name) {
            handleProjectUpdate({ name: projectName.trim() }, name);
        }
        setIsEditingName(false);
    });

    const handleNameKeydown = (e) => {
        if (e.key === 'Enter') handleSaveName();
        else if (e.key === 'Escape') {
            setProjectName(project.name);
            setIsEditingName(false);
        }
    };

    const handleSaveDeadline = () => requireName((name) => {
        if (projectDeadline !== (project.deadline || '')) {
            handleProjectUpdate({ deadline: projectDeadline }, name);
        }
        setIsEditingDeadline(false);
    });

    const handleDeadlineKeydown = (e) => {
        if (e.key === 'Enter') handleSaveDeadline();
        else if (e.key === 'Escape') {
            setProjectDeadline(project.deadline || '');
            setIsEditingDeadline(false);
        }
    };

    // --- FIX: Use activeAppId from state ---
    const logActivity = async (logMessage) => { if(isDemo || !db) return; const logRef = collection(db, 'artifacts', activeAppId, 'public', 'data', 'projects', projectId, 'activityLog'); await addDoc(logRef, { log: logMessage, author: userName, timestamp: serverTimestamp() }); };
    // --- FIX: Use activeAppId from state ---
    const handleUpdateTask = (taskId, updates) => requireName((name) => { if (isDemo || !db) return; const taskRef = doc(db, 'artifacts', activeAppId, 'public', 'data', 'projects', projectId, 'tasks', taskId); const originalTask = tasks.find(t => t.id === taskId); if(updates.status && originalTask.status !== updates.status){ logActivity(`${name} updated status of '${originalTask.title}' to ${updates.status}`); } try { updateDoc(taskRef, updates); } catch (e) { console.error("Error updating task: ", e); } });
    // --- FIX: Use activeAppId from state ---
    const handleAddTask = (newTask) => requireName((name) => { if (isDemo || !db) return; const tasksRef = collection(db, 'artifacts', activeAppId, 'public', 'data', 'projects', projectId, 'tasks'); try { addDoc(tasksRef, { ...newTask, owner: Array.isArray(newTask.owner) ? newTask.owner : [newTask.owner] }); logActivity(`${name} added new task: "${newTask.title}"`); } catch (e) { console.error("Error adding task: ", e); } });
    // --- FIX: Use activeAppId from state ---
    const handleDeleteTask = (taskId, taskTitle) => requireName((name) => { if (isDemo || !db) return; if (window.confirm("Are you sure? This action cannot be undone.")) { const taskRef = doc(db, 'artifacts', activeAppId, 'public', 'data', 'projects', projectId, 'tasks', taskId); try { deleteDoc(taskRef); logActivity(`${name} deleted task: "${taskTitle}"`); } catch (e) { console.error("Error deleting task: ", e); } } });

    const handleShareProject = () => {
        const url = `${window.location.origin}?id=${projectId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopyFeedback('Link Copied!');
            setTimeout(() => setCopyFeedback(''), 2000);
        });
    };

    const handleUpdateWithTranscript = (newTranscript) => requireName(async (name) => {
        if (isDemo) return;
        const existingTasksString = tasks.map(t => t.title).join(', ');
        const prompt = `You are an intelligent project management assistant. Analyze the provided "New Transcript" in the context of the "Existing Task List". Your goal is to identify both brand new tasks and updates to existing tasks. IMPORTANT: In all generated text content (like task titles or comments), do not use double quotes ("). Use single quotes (') or other symbols instead.\n\n**Existing Task List:**\n${existingTasksString}\n\n**New Transcript:**\n---\n${newTranscript}\n---\n\nBased on your analysis, return a single JSON object with two keys: "newTasks" and "taskUpdates".\n\n1.  **newTasks**: An array of task objects for action items mentioned in the transcript that are NOT on the existing list. Each owner property should be an array of strings.\n2.  **taskUpdates**: An array of objects for existing tasks that have updates mentioned in the transcript. Each object should contain the 'title' of the existing task to update, a 'comment' summarizing the update, and a new 'status' if the transcript implies a change (e.g., from 'Pending' to 'In Progress').\n\nIf no new tasks are found, "newTasks" should be an empty array.\nIf no updates are found, "taskUpdates" should be an empty array.`;
        const generationConfig = { responseMimeType: "application/json", responseSchema: { type: 'OBJECT', properties: { newTasks: { type: 'ARRAY', items: { type: 'OBJECT', properties: { title: { type: 'STRING' }, owner: { type: 'ARRAY', items: { type: 'STRING' } }, category: { type: 'STRING' }, status: { type: 'STRING', enum: ['Pending', 'In Progress', 'Done'] }, dueDate: { type: 'STRING' } } } }, taskUpdates: { type: 'ARRAY', items: { type: 'OBJECT', properties: { title: { type: 'STRING' }, comment: { type: 'STRING' }, status: { type: 'STRING', enum: ['Pending', 'In Progress', 'Done'] } } } } } } };
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                const { newTasks, taskUpdates } = JSON.parse(result.candidates[0].content.parts[0].text);
                let summaryParts = [];
                if (newTasks?.length > 0) {
                    // --- FIX: Use activeAppId from state ---
                    const tasksRef = collection(db, 'artifacts', activeAppId, 'public', 'data', 'projects', projectId, 'tasks');
                    const sanitizedNewTasks = newTasks.map(task => ({
                        title: task.title || 'Untitled Task',
                        owner: Array.isArray(task.owner) && task.owner.length > 0 ? task.owner : ['Unassigned'],
                        category: task.category || 'General',
                        status: task.status || 'Pending',
                        dueDate: task.dueDate || ''
                    }));
                    await Promise.all(sanitizedNewTasks.map(task => addDoc(tasksRef, task)));
                    logActivity(`Project updated with ${newTasks.length} new task(s) from transcript by ✨ Meet & Tackle AI`);
                    summaryParts.push(`Added ${newTasks.length} new task(s).`);
                }
                if (taskUpdates?.length > 0) {
                    for (const update of taskUpdates) {
                        const originalTask = tasks.find(t => t.title.toLowerCase() === update.title.toLowerCase());
                        if (originalTask) {
                            // --- FIX: Use activeAppId from state ---
                            const taskRef = doc(db, 'artifacts', activeAppId, 'public', 'data', 'projects', projectId, 'tasks', originalTask.id);
                            await updateDoc(taskRef, { status: update.status });
                            // --- FIX: Use activeAppId from state ---
                            const commentsRef = collection(db, 'artifacts', activeAppId, 'public', 'data', 'projects', projectId, 'tasks', originalTask.id, 'comments');
                            await addDoc(commentsRef, { text: `**Update detected:**\n${update.comment}`, author: '✨ Meet & Tackle AI', timestamp: serverTimestamp() });
                        }
                    }
                    logActivity(`AI applied ${taskUpdates.length} update(s) from the transcript.`);
                    summaryParts.push(`Updated ${taskUpdates.length} existing task(s).`);
                }
                if (summaryParts.length > 0) {
                    setUpdateFeedback(summaryParts.join(' '));
                } else {
                    setUpdateFeedback('AI analyzed the transcript but found no new tasks or updates to apply.');
                    logActivity(`AI analyzed transcript but found no new tasks or updates.`);
                }
                setTimeout(()=>setUpdateFeedback(''), 7000);
            } else {
                throw new Error('Unexpected response format from AI.');
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update project with transcript.");
        }
    });

    const handleGenerateSlackUpdate = async () => {
        setIsGeneratingUpdate(true);
        setSlackUpdate(null);
    
        const tasksDone = tasks.filter(t => t.status === 'Done');
        const tasksInProgress = tasks.filter(t => t.status === 'In Progress');
        const tasksPending = tasks.filter(t => t.status === 'Pending');
        const tasksAtRisk = tasks.filter(t => t.status !== 'Done' && getDeadlineStatus(t.dueDate) !== 'none');
        const progress = tasks.length > 0 ? Math.round((tasksDone.length / tasks.length) * 100) : 0;
    
        const prompt = `
            You are a Project Manager providing a status update for Slack. Your tone should be clear, concise, and professional, but friendly. Use Slack's markdown formatting (e.g., *bold*, \`code\`, and lists).
    
            **Context for the update:**
            - Project Name: *${project.name}*
            - Overall Progress: ${progress}% complete.
            - Project Deadline: ${project.deadline ? new Date(project.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}
    
            **Task Data:**
            - Recently Completed: ${JSON.stringify(tasksDone.map(t => t.title))}
            - In Progress: ${JSON.stringify(tasksInProgress.map(t => t.title))}
            - Pending & Blocked: ${JSON.stringify(tasksPending.map(t => t.title))}
            - At Risk (Overdue or Due Soon): ${JSON.stringify(tasksAtRisk.map(t => ({ title: t.title, dueDate: t.dueDate, status: getDeadlineStatus(t.dueDate) })))}
    
            **Instructions:**
            Generate a project status update with the following sections. Start with a friendly greeting like "Hi Team, here's the latest update on our project!".
    
            1.  *Quick Summary*: A brief, one-sentence overview of the project's health based on the data provided.
            2.  *What We've Done ✅*: List the recently completed tasks. If none, say "No new tasks completed recently, but we're pushing forward!"
            3.  *What We're Doing 👨‍💻*: List the tasks currently in progress.
            4.  *What's Next / Blocked ⏳*: List the pending tasks.
            5.  *Risks & Red Flags 🚩*: This is the most important section. Explicitly list the tasks from the "At Risk" data. For each, mention its title, its due date, and whether it is 'overdue' or 'dueSoon'. If there are no at-risk tasks, state that the project is currently on track with no immediate risks.
    
            Keep the update scannable and easy to read.
        `;
    
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("Failed to generate update.");
            const result = await response.json();
            const updateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (updateText) {
                setSlackUpdate(updateText);
            }
        } catch (error) {
            console.error("Slack Update Generation Failed:", error);
            setSlackUpdate("Sorry, I couldn't generate an update right now.");
        } finally {
            setIsGeneratingUpdate(false);
        }
    };

    const dynamicCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))].sort();
    const dynamicTeam = [...new Set(tasks.flatMap(t => t.owner || []))].filter((v, i, a) => a.indexOf(v) === i).sort();
    const filteredTasks = filterOwner === 'All' ? tasks : tasks.filter(task => task.owner?.includes(filterOwner));
    const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) : 0;
    const projectDeadlineDate = projectDeadline ? new Date(projectDeadline) : null;
    const daysRemaining = projectDeadline ? getDaysRemaining(projectDeadline) : 0;


    if (isLoading) {
        return <div className="min-h-screen bg-brand-dark flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div></div>;
    }

    if (!project) {
        return <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center text-white"><h1 className="text-4xl font-bold mb-4">Project Not Found</h1><p className="text-brand-light mb-8">The project you are looking for does not exist or has been deleted.</p><button onClick={() => navigate('home')} className="px-6 py-2 bg-brand-primary rounded-lg hover:opacity-90">Go Home</button></div>
    }

    return (
        <>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <UserPromptModal
                    isOpen={showNamePrompt}
                    onSubmit={(name) => {
                        setUserName(name);
                        localStorage.setItem('meetandtackle_userName', name);
                        if(actionToRun) {
                            actionToRun(name);
                        }
                        setShowNamePrompt(false);
                        setActionToRun(null);
                    }}
                    onCancel={() => setShowNamePrompt(false)}
                />
                <SlackUpdateModal isOpen={!!slackUpdate} onClose={() => setSlackUpdate(null)} updateText={slackUpdate} />
                {notification && (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg relative mb-4 flex justify-between items-center">
                        <span>{notification}</span>
                        <button onClick={() => setNotification(null)} className="font-bold text-xl ml-4">&times;</button>
                    </div>
                )}
                <header className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-poppins font-bold text-white tracking-tight mb-2">
                                <span
                                    onClick={() => navigate('home')}
                                    className="cursor-pointer hover:text-brand-light transition-colors duration-200"
                                >
                                    Meet & Tackle
                                </span>
                                <span className="text-slate-500 mx-2">/</span>
                                {isEditingName ? (
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        onBlur={handleSaveName}
                                        onKeyDown={handleNameKeydown}
                                        className="text-4xl font-poppins font-bold bg-transparent text-brand-light tracking-tight focus:outline-none focus:bg-brand-surface rounded-md"
                                        style={{ width: `${projectName.length + 2}ch`}} // Dynamically size input
                                        autoFocus
                                        disabled={isDemo}
                                    />
                                ) : (
                                    <span
                                        className={`text-brand-primary ${!isDemo && 'cursor-pointer hover:underline'}`}
                                        onClick={() => { if (!isDemo) requireName(() => setIsEditingName(true)) }}
                                    >
                                        {project.name}
                                    </span>
                                )}
                            </h1>
                            <p className="text-slate-300 mt-2">A real-time dashboard to track project progress.</p>
                        </div>
                        <div className="text-right">
                            {project.code &&
                                <div className="flex items-center gap-2 justify-end mb-2">
                                    <span className="text-sm text-brand-light">Project Code: <span className="font-mono text-brand-primary">{project.code}</span></span>
                                    {!isDemo &&
                                        <button onClick={handleShareProject} className="p-1.5 bg-brand-surface rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="Copy Share Link">
                                            <ShareIcon className="w-4 h-4" />
                                        </button>
                                    }
                                    {copyFeedback && <span className="text-xs text-green-400">{copyFeedback}</span>}
                                </div>
                            }
                            {isEditingDeadline ? (
                                 <input
                                    type="date"
                                    value={projectDeadline}
                                    onChange={(e) => setProjectDeadline(e.target.value)}
                                    onBlur={handleSaveDeadline}
                                    onKeyDown={handleDeadlineKeydown}
                                    className="bg-brand-surface text-white rounded-md p-1"
                                    autoFocus
                                    disabled={isDemo}
                                 />
                            ) : (
                                <div className={`${!isDemo && 'cursor-pointer'} hover:bg-brand-surface p-1 rounded-md`} onClick={() => { if (!isDemo) requireName(() => setIsEditingDeadline(true)) } }>
                                    <div className="text-sm text-brand-light">Project Deadline</div>
                                    {project.deadline ? (
                                        <>
                                            <div className="text-2xl font-bold text-white">{new Date(project.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                            <div className={`text-sm font-semibold ${daysRemaining < 0 ? 'text-red-400' : 'text-slate-300'}`}>{daysRemaining >= 0 ? `${daysRemaining} days remaining` : `${Math.abs(daysRemaining)} days overdue`}</div>
                                        </>
                                    ) : (
                                        <div className="text-lg text-brand-light">Set Deadline</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {isDemo &&
                        <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 rounded-lg text-sm flex items-center gap-3">
                            <EyeIcon className="w-5 h-5"/>
                            You are viewing a read-only demo project. To create your own, please go back to the homepage.
                        </div>
                    }
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2 p-4 bg-brand-surface rounded-lg border border-slate-700">
                        <div className="flex justify-between items-center mb-2"><span className="font-bold text-slate-200">Overall Progress</span><span className="text-brand-primary font-semibold">{progress}%</span></div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div></div>
                    </div>
                    <div className="p-4 bg-brand-surface rounded-lg border border-slate-700 flex items-center"><label htmlFor="ownerFilter" className="text-sm font-bold text-slate-200 mr-4 whitespace-nowrap">Filter by Owner:</label><select id="ownerFilter" value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary"><option value="All">All Owners</option>{dynamicTeam.map(member => (<option key={member} value={member}>{member}</option>))}</select></div>
                </div>
                 {updateFeedback && (<div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg relative mb-4 flex justify-between items-center"><span>{updateFeedback}</span><button onClick={() => setUpdateFeedback('')} className="font-bold text-xl ml-4">&times;</button></div>)}
                <div className="mb-8 flex gap-4">
                    <button onClick={() => requireName(() => setShowAddTaskForm(true))} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-brand-primary bg-transparent border border-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isDemo}><PlusCircleIcon className="w-5 h-5" /> Add New Task</button>
                    <button onClick={() => requireName(() => setShowUpdateForm(true))} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-brand-primary bg-transparent border border-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isDemo}><span className="text-lg">✨</span> Update with Transcript</button>
                    <button onClick={handleGenerateSlackUpdate} disabled={isGeneratingUpdate || isDemo} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-brand-primary bg-transparent border border-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isGeneratingUpdate ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <MessageSquareIcon className="w-5 h-5" /> }
                        Generate Slack Update
                    </button>
                </div>
                {showAddTaskForm && <AddTaskForm onAddTask={(task) => handleAddTask(task)} categories={dynamicCategories} team={dynamicTeam} onCancel={() => setShowAddTaskForm(false)} />}
                {showUpdateForm && <UpdateProjectForm onUpdate={(transcript) => handleUpdateWithTranscript(transcript)} onCancel={() => setShowUpdateForm(false)} />}
                {!gsapReady ? (<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div></div>) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">{dynamicCategories.map(category => (<CategorySection key={category} category={category} tasks={filteredTasks.filter(t => t.category === category)} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} db={db} appId={activeAppId} projectId={projectId} logActivity={logActivity} userName={userName} isDemo={isDemo} />))}</div>
                        <div className="lg:col-span-1"><ActivityLog db={db} appId={activeAppId} projectId={projectId} isDemo={isDemo} userName={userName} /></div>
                    </div>
                )}
            </div>
            {!isDemo && (
                <footer className="mt-24 py-12 bg-brand-surface rounded-2xl">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                         <img src="/mt-logo.png" alt="Meet & Tackle Logo" className="mx-auto mb-6 h-16" />
                        <h2 className="text-3xl font-bold text-white mb-4">Turn Your Own Meetings into Actionable Plans</h2>
                        <p className="text-brand-light mb-8 max-w-2xl mx-auto">Stop letting action items get lost in the shuffle. Click below to use our AI-powered tool for your own projects, absolutely free.</p>
                        <button onClick={() => navigate('home')} className="px-8 py-4 text-lg font-semibold text-white bg-brand-primary rounded-lg hover:opacity-90 transition-colors">Create Your Free Project Plan</button>
                    </div>
                </footer>
            )}
        </>
    );
};

// --- Sub-Components for Project Page ---
const UserPromptModal = ({ isOpen, onSubmit, onCancel }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-brand-surface rounded-lg border border-slate-700 p-6 shadow-2xl max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold text-white mb-2">What's your name?</h3>
                <p className="text-brand-light text-sm mb-6">Please enter your name to attribute your changes.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-brand-dark border border-slate-600 rounded-md focus:ring-2 focus:ring-brand-primary"
                        placeholder="Your Name"
                        autoFocus
                    />
                    <div className="flex justify-end gap-4 mt-6">
                         <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700">Cancel</button>
                         <button type="submit" disabled={!name.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:opacity-90 disabled:opacity-50">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SlackUpdateModal = ({ isOpen, onClose, updateText }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = () => {
        if (updateText) {
            navigator.clipboard.writeText(updateText).then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-brand-surface rounded-lg border border-slate-700 p-6 shadow-2xl max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-2">Slack Project Update</h3>
                <div className="bg-brand-dark/50 rounded-md p-4 my-4 max-h-[60vh] overflow-y-auto">
                    <pre className="text-slate-200 whitespace-pre-wrap font-sans text-sm">{updateText}</pre>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={handleCopy} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:opacity-90 flex items-center gap-2">
                        <ClipboardIcon className="w-4 h-4"/>
                        {copySuccess || 'Copy Update'}
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700">Close</button>
                </div>
            </div>
        </div>
    );
};
const UpdateProjectForm = ({ onUpdate, onCancel }) => { const [transcript, setTranscript] = useState(''); const [isUpdating, setIsUpdating] = useState(false); const handleSubmit = async (e) => { e.preventDefault(); setIsUpdating(true); await onUpdate(transcript); setIsUpdating(false); onCancel(); }; return (<div className="bg-brand-surface/80 border border-brand-primary/50 rounded-lg p-6 mb-8 backdrop-blur-sm"><h3 className="text-lg font-bold text-white mb-2">Update Project with Transcript</h3><p className="text-sm text-brand-light mb-4">Paste in a follow-up transcript. Meet & Tackle will find updates to existing tasks and add any new tasks it discovers.</p><form onSubmit={handleSubmit}><textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste your follow-up meeting transcript here..." className="w-full h-48 bg-brand-dark border border-slate-600 rounded-md p-4 text-sm text-white focus:ring-2 focus:ring-brand-primary" disabled={isUpdating} /><div className="flex justify-end gap-4 mt-4"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700">Cancel</button><button type="submit" className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:opacity-90 disabled:opacity-50" disabled={isUpdating || !transcript.trim()}>{isUpdating ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>Updating...</> : <><span className="text-lg">✨</span> Update Project</>}</button></div></form></div>);};
const ActivityLog = ({ db, appId, projectId, isDemo, userName }) => {
    const { addToast } = useToast();
    const isInitialLoad = useRef(true);

    useEffect(() => {
        if (isDemo || !db || !appId) return;

        // --- FIX: This now uses the correct appId passed down as a prop ---
        const logCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'projects', projectId, 'activityLog');
        const q = query(logCollectionRef, orderBy('timestamp', 'desc'));
        
        const unsub = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" && !isInitialLoad.current) {
                    const newLog = change.doc.data();
                    if (newLog.author !== userName) { // Don't show toast for your own actions
                        addToast(newLog.log);
                    }
                }
            });
            isInitialLoad.current = false;
        }); 

        return () => unsub();
    }, [db, appId, projectId, isDemo, addToast, userName]);

    const [activities, setActivities] = useState([]);
    useEffect(() => {
        if (isDemo) {
            setActivities([
                { id: 1, log: '✨ Meet & Tackle AI created this demo project.', timestamp: { toDate: () => new Date() } },
            ]);
            return;
        }
        if (!db || !appId) return;
        // --- FIX: This now uses the correct appId passed down as a prop ---
        const logCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'projects', projectId, 'activityLog');
        const q = query(logCollectionRef, orderBy('timestamp', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const fetchedActivities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setActivities(fetchedActivities);
        });
        return () => unsub();
    }, [db, appId, projectId, isDemo]);

    return (
        <div className="bg-brand-surface/80 border border-brand-primary/50 rounded-lg p-6 my-8 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">Project Activity</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {activities.map(act => (
                    <div key={act.id} className="text-sm border-l-2 border-slate-700 pl-3">
                        <p className="text-slate-200 whitespace-pre-wrap">{act.log}</p>
                        <p className="text-xs text-brand-light mt-1">{formatTimestamp(act.timestamp)}</p>
                    </div>
                ))}
                {isDemo && <div className="text-sm text-slate-400 pl-3 pt-2 border-t border-slate-700 mt-3">Activity is disabled for demo projects.</div>}
            </div>
        </div>
    );
};
const CategorySection = ({ category, tasks, onUpdate, onDelete, db, appId, projectId, userName, logActivity, isDemo }) => { const sectionRef = useRef(null); useLayoutEffect(() => { if (tasks.length > 0 && window.gsap) { window.gsap.fromTo(sectionRef.current.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }); } }, [tasks]); if (tasks.length === 0) return null; return (<div className="mb-8"><h2 className="text-xl font-bold text-slate-200 mb-4 pb-2 border-b-2 border-brand-primary/50">{category}</h2><div ref={sectionRef}>{tasks.map(task => (<TaskCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} db={db} appId={appId} projectId={projectId} taskId={task.id} tasks={tasks} userName={userName} logActivity={logActivity} isDemo={isDemo} />))}</div></div>);};
const TaskCard = ({ task, onUpdate, onDelete, db, appId, projectId, taskId, tasks, userName, logActivity, isDemo }) => { const [isExpanded, setIsExpanded] = useState(false); const cardRef = useRef(null); const toggleExpand = () => { if (!window.Flip) return; const state = window.Flip.getState(cardRef.current); setIsExpanded(!isExpanded); window.Flip.from(state, { duration: 0.3, ease: "power1.inOut" }); }; const status = STATUS_OPTIONS[task.status] || STATUS_OPTIONS['Pending']; const deadlineStatus = task.dueDate ? getDeadlineStatus(task.dueDate) : 'none'; const teamMembers = [...new Set([...tasks.flatMap(t => t.owner || []), ... (task.owner || [])])].sort(); return (<div ref={cardRef} className={`bg-brand-surface border rounded-lg mb-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${deadlineStatus === 'overdue' && task.status !== 'Done' ? 'border-red-500/50' : deadlineStatus === 'dueSoon' && task.status !== 'Done' ? 'border-yellow-500/50' : 'border-slate-700'}`}><div className="p-4 cursor-pointer" onClick={toggleExpand}><div className="flex justify-between items-center gap-4"><div className="flex items-center flex-1 min-w-0">{deadlineStatus !== 'none' && task.status !== 'Done' && (<AlertTriangleIcon className={`w-5 h-5 mr-3 shrink-0 ${deadlineStatus === 'overdue' ? 'text-red-500' : 'text-yellow-500'}`} />)}<p className="text-slate-100 truncate">{task.title}</p></div><div className="flex items-center space-x-2 sm:space-x-4 shrink-0">{task.dueDate && <span className="text-xs text-brand-light hidden sm:block">{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-CA')}</span>}<span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.color} ${status.textColor}`}>{status.label}</span><div className="w-24 text-sm text-brand-light flex items-center gap-2 hidden md:flex"><UserIcon className="w-4 h-4" /><span>{(task.owner || []).join(', ')}</span></div><ChevronDown className={`w-6 h-6 text-brand-light transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} /></div></div></div>{isExpanded && (<div className="px-4 pb-4 border-t border-slate-700"><div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"><div><label className="block text-xs text-brand-light mb-1">Status</label><select value={task.status} onChange={(e) => onUpdate(task.id, {status: e.target.value})} className="w-full bg-brand-dark border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed" disabled={isDemo}>{Object.keys(STATUS_OPTIONS).map(key => (<option key={key} value={key}>{STATUS_OPTIONS[key].label}</option>))}</select></div><MultiSelectOwner owners={task.owner || []} allOwners={teamMembers} onUpdate={(newOwners) => onUpdate(taskId, { owner: newOwners })} isDemo={isDemo} /><div><label className="block text-xs text-brand-light mb-1">Due Date</label><input type="date" value={task.dueDate || ''} onChange={(e) => onUpdate(task.id, {dueDate: e.target.value})} className="w-full bg-brand-dark border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed" disabled={isDemo} /></div></div><CommentSection db={db} appId={appId} projectId={projectId} taskId={taskId} currentUser={userName} logActivity={logActivity} taskTitle={task.title} isDemo={isDemo} /><div className="flex justify-end mt-4"><button onClick={() => onDelete(task.id, task.title)} className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isDemo}><Trash2Icon className="w-4 h-4 mr-2" /> Delete Task</button></div></div>)}</div>);};
const AddTaskForm = ({ onAddTask, categories, team, onCancel }) => { const [title, setTitle] = useState(''); const [category, setCategory] = useState(categories[0] || 'Uncategorized'); const [owners, setOwners] = useState(team[0] ? [team[0]] : []); const [dueDate, setDueDate] = useState(''); const [newCategory, setNewCategory] = useState(''); const [newOwner, setNewOwner] = useState(''); const handleSubmit = (e) => { e.preventDefault(); if (!title.trim()) return; const finalCategory = category === '---new---' ? newCategory.trim() : category; let finalOwners = owners; if (newOwner.trim()) { finalOwners = [...finalOwners, newOwner.trim()]; } if (!finalCategory || finalOwners.length === 0) { alert("Please ensure category and owner are set."); return; } onAddTask({ title: title.trim(), category: finalCategory, owner: finalOwners, dueDate, status: 'Pending' }); onCancel(); }; return (<div className="bg-brand-surface/80 border border-brand-primary/50 rounded-lg p-6 mb-8 backdrop-blur-sm relative z-20"><h3 className="text-lg font-bold text-white mb-4">Add New Task</h3><form onSubmit={handleSubmit}><div className="mb-4"><label htmlFor="title" className="block text-sm font-medium text-brand-light mb-1">Task Title</label><input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-brand-dark border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary" /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"><div><label className="block text-sm font-medium text-brand-light mb-1">Category / Section</label><select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full bg-brand-dark border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary">{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)} <option value="---new---">-- Add New Category --</option></select>{category === '---new---' && (<input type="text" placeholder="New category name" value={newCategory} onChange={e => setNewCategory(e.target.value)} required className="mt-2 w-full bg-brand-dark border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary" />)}</div><MultiSelectOwner owners={owners} allOwners={[...team, newOwner.trim()].filter(Boolean)} onUpdate={setOwners} isNewTask={true} newOwner={newOwner} setNewOwner={setNewOwner} /><div><label className="block text-sm font-medium text-brand-light mb-1">Due Date</label><input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-brand-dark border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary"/></div></div><div className="flex justify-end gap-4"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:opacity-90">Add Task</button></div></form></div>);};
const CommentSection = ({ db, appId, projectId, taskId, currentUser, logActivity, taskTitle, isDemo }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    useEffect(() => {
        if (isDemo) {
            setComments([
                { id: 1, text: 'This is a comment on a task in the demo project.', author: 'Alice', timestamp: { toDate: () => new Date() } },
            ]);
            return;
        }
        if (!db || !appId || !taskId || !projectId) return; // --- FIX: check for appId
        // --- FIX: Use correct appId passed as a prop ---
        const commentsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'projects', projectId, 'tasks', taskId, 'comments'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => { setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
        return () => unsubscribe();
    }, [db, appId, projectId, taskId, isDemo]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        const trimmedComment = newComment.trim();
        if (isDemo || !trimmedComment || !db) return;
        // --- FIX: Use correct appId passed as a prop ---
        const commentsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'projects', projectId, 'tasks', taskId, 'comments');
        await addDoc(commentsCollectionRef, { text: trimmedComment, author: currentUser || 'Guest', timestamp: serverTimestamp() });
        if (logActivity) {
            logActivity(`${currentUser || 'Guest'} commented on '${taskTitle}': "${trimmedComment}"`);
        }
        setNewComment('');
    };

    return (
        <div className="pt-4 mt-4 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-brand-light mb-2">Comments</h4>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                {comments.map(comment => (
                    <div key={comment.id} className="text-sm bg-brand-dark/50 p-2 rounded-md">
                        <p className="text-slate-200 whitespace-pre-wrap">{comment.text}</p>
                        <p className="text-xs text-brand-light mt-1"><strong>{comment.author}</strong> - {formatTimestamp(comment.timestamp)}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={isDemo ? "Commenting is disabled in demo mode" : "Add a comment..."} className="flex-1 bg-brand-dark border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed" disabled={isDemo || !currentUser} />
                <button type="submit" className="px-4 text-sm font-semibold text-white bg-brand-primary rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isDemo || !newComment.trim() || !currentUser}>Send</button>
            </form>
        </div>
    );
};
const MultiSelectOwner = ({ owners, allOwners, onUpdate, isNewTask, newOwner, setNewOwner, isDemo }) => { const [isOpen, setIsOpen] = useState(false); const wrapperRef = useRef(null); useEffect(() => { function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) { setIsOpen(false); } } document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, [wrapperRef]); const handleOwnerChange = (owner, checked) => { const newOwners = checked ? [...owners, owner] : owners.filter(o => o !== owner); onUpdate(newOwners); }; return (<div><label className="block text-xs text-brand-light mb-1">Owner(s)</label><div ref={wrapperRef} className="relative"><button type="button" onClick={() => !isDemo && setIsOpen(!isOpen)} className="w-full bg-brand-dark border border-slate-700 rounded-md p-2 text-sm text-white text-left flex justify-between items-center disabled:cursor-not-allowed" disabled={isDemo}>
  <span className="truncate">{owners.join(', ') || 'Select Owner(s)'}</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && (<div className="absolute z-10 w-full mt-1 bg-brand-surface border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
  {allOwners.map(owner => (<label key={owner} className="flex items-center p-2 hover:bg-brand-dark cursor-pointer"><input type="checkbox" checked={owners.includes(owner)} onChange={(e) => handleOwnerChange(owner, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
    <span className="ml-3 text-sm text-slate-200">{owner}</span></label>))} {isNewTask && (<div className="p-2 border-t border-slate-700"><input type="text" placeholder="Add new owner..." value={newOwner} onChange={e => setNewOwner(e.target.value)} className="w-full bg-brand-dark border-none rounded-md p-1 text-sm text-white focus:ring-1 focus:ring-brand-primary"/></div>)}</div>)}</div></div>);};
