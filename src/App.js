import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp, query, orderBy, getDocs, where } from 'firebase/firestore';

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
    
    // FIX: Wrap addToast in useCallback to ensure it has a stable reference, preventing re-render loops.
    const addToast = useCallback((message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []); // Empty dependency array ensures the function is created only once.

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2">
                {toasts.map((toast) => (
                    <div key={toast.id} className="max-w-sm w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 flex items-center space-x-4 animate-fade-in-up">
                        <span className="text-indigo-400">📣</span>
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

    // Simplified state-based navigation
    const navigate = (page, projectId = null) => {
        setRoute({ page, projectId });
    };

    // This hook prevents the backspace key from triggering browser navigation
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

    // This hook runs once on initial load to check for a shared project ID in the URL
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sharedProjectId = queryParams.get('id');
        if (sharedProjectId) {
            navigate('project', sharedProjectId);
        }
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
        return <div className="min-h-screen bg-slate-900 flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>;
    }

    return (
        <ToastProvider>
            <div className="min-h-screen bg-slate-900 font-sans text-white">
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
            code.push(listToUse[Math.floor(Math.random() * listToUse.length)]);
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
        const formattedDate = `<span class="math-inline">\{today\.getFullYear\(\)\}\-</span>{String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
        const projectsRef = collection(db, 'artifacts', appId, 'public', 'data', 'projects');
        const q = query(projectsRef, where("code", "==", searchQuery.trim().toLowerCase()));
        
        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const projectDoc = querySnapshot.docs[0];
                navigate('project', projectDoc.id);
            } else {
                setError("Project not found. Please check the code and try again.");
            }
        } catch(err) {
            console.error("Search failed:", err);
            setError("An error occurred during search.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-12">
                <div className="flex justify-center items-center gap-4">
                    <img src="/mascot-worm.png" alt="Meet & Tackle Mascot" className="w-16 h-16" />
                    <h1 className="text-5xl font-poppins font-bold text-white tracking-tight">Meet & Tackle</h1>
                </div>
                <p className="text-indigo-300 text-lg mt-4">Turn your planning meetings into projects.</p>
            </header>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-2xl mb-6">
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste your meeting transcript here to get started...&#10;&#10;Optional: Start with an 'Attendees:' list for better owner assignment.&#10;Attendees:&#10;Sarah Chen (SC)&#10;Mark Davies (MD)" className="w-full h-64 bg-slate-900 border border-slate-600 rounded-md p-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 placeholder-slate-500" disabled={isGenerating}/>
                <div className="mt-4 flex justify-end items-center">
                    {error && <div className="text-sm text-red-400 mr-4 overflow-y-auto max-h-20"><p>{error}</p></div>}
                    <button onClick={handleGenerateProject} className="flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isGenerating}>
                        {isGenerating ? (<><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Generating...</>) : (<><span className="text-lg">✨</span> Generate Project</>)}
                    </button>
                </div>
            </div>

            <div className="text-center mb-12">
                <p className="text-slate-400">
                    Or{" "}
                    <button
                        onClick={() => navigate('project', DEMO_PROJECT_ID)}
                        className="text-indigo-400 hover:text-indigo-300 underline font-semibold"
                    >
                        view an example project
                    </button>
                    {" "}to see how it works.
                </p>
            </div>


            <div className="text-center">
                 <h2 className="text-2xl font-bold text-white mb-4">Already working on a project?</h2>
                <div className="max-w-lg mx-auto bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-2xl">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input type="text" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setError('')}} placeholder="Enter project code (e.g. purple.monkey.dishwasher)" className="flex-1 bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500" />
                        <button type="submit" className="px-4 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center w-14" disabled={!searchQuery.trim() || isSearching}>
                            {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <SearchIcon className="w-5 h-5" />}
                        </button>
                    </form>
                     {error && !isGenerating && <p className="text-sm text-red-400 mt-4">{error}</p>}
                </div>
            </div>


            {recentProjects.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Recently Viewed Projects</h2>
                    <div className="max-w-lg mx-auto space-y-3">
                        {recentProjects.map(proj => (
                            <div key={proj.id} onClick={() => navigate('project', proj.id)} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-indigo-500 flex justify-between items-center cursor-pointer transition-colors">
                                <span className="font-semibold text-slate-200">{proj.name}</span>
                                <ExternalLinkIcon className="w-5 h-5 text-slate-400" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
                { id: 'demo-6', title: 'Review and approve final designs', owner:
