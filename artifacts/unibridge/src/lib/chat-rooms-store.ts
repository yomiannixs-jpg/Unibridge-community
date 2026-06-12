export type ChatRoomMessage = {
  id: string;
  roomId: string;
  author: string;
  role: string;
  body: string;
  createdAt: string;
};

export type ChatRoom = {
  id: string;
  name: string;
  slug: string;
  category: "Academic" | "Scholarships" | "Study Abroad" | "Programming" | "Careers";
  description: string;
  members: number;
  online: number;
  icon: string;
  messages: ChatRoomMessage[];
  onlineUsers: string[];
};

const ROOMS_KEY = "collegediscourse-chat-rooms-v1";

const now = Date.now();

const seedRooms: ChatRoom[] = [
  {
    id: "room-research-help",
    name: "Research Help",
    slug: "research-help",
    category: "Academic",
    description: "Methods, writing, literature reviews, data, and publication questions.",
    members: 132,
    online: 28,
    icon: "📚",
    onlineUsers: ["ResearchGuru", "StatMaster", "FinanceMentor", "EconPhD", "MethodMentor"],
    messages: [
      {
        id: "rh1",
        roomId: "room-research-help",
        author: "ResearchGuru",
        role: "Research Mentor",
        body: "Anyone using panel data for their thesis this week?",
        createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
      },
      {
        id: "rh2",
        roomId: "room-research-help",
        author: "StatMaster",
        role: "Methods Contributor",
        body: "Fixed effects are a good starting point. PMG and ARDL also help depending on the structure.",
        createdAt: new Date(now - 1000 * 60 * 42).toISOString(),
      },
      {
        id: "rh3",
        roomId: "room-research-help",
        author: "FinanceMentor",
        role: "Mentor",
        body: "For cointegration, compare Johansen, Engle-Granger, and ARDL based on your sample size.",
        createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
      },
    ],
  },
  {
    id: "room-phd-admissions",
    name: "PhD Admissions",
    slug: "phd-admissions",
    category: "Academic",
    description: "Supervisor emails, SOPs, funding, applications, and interviews.",
    members: 84,
    online: 13,
    icon: "🎓",
    onlineUsers: ["GradCoach", "SOPMentor", "PhDApplicant", "ProfessorGuide"],
    messages: [
      {
        id: "pa1",
        roomId: "room-phd-admissions",
        author: "GradCoach",
        role: "Advisor",
        body: "A strong professor email should be short, specific, and connected to the professor's recent work.",
        createdAt: new Date(now - 1000 * 60 * 75).toISOString(),
      },
    ],
  },
  {
    id: "room-scholarships",
    name: "Scholarships",
    slug: "scholarships",
    category: "Scholarships",
    description: "Funding alerts, deadlines, essays, and verified scholarship opportunities.",
    members: 276,
    online: 41,
    icon: "💰",
    onlineUsers: ["ScholarshipWatch", "FundingHelper", "EssayMentor", "VisaGuide"],
    messages: [
      {
        id: "sc1",
        roomId: "room-scholarships",
        author: "ScholarshipWatch",
        role: "Moderator",
        body: "Reminder: always verify the official scholarship website before applying.",
        createdAt: new Date(now - 1000 * 60 * 65).toISOString(),
      },
    ],
  },
  {
    id: "room-study-abroad",
    name: "Study Abroad",
    slug: "study-abroad",
    category: "Study Abroad",
    description: "Country comparisons, visas, budgeting, housing, and international student life.",
    members: 158,
    online: 22,
    icon: "✈️",
    onlineUsers: ["VisaGuide", "AminaStudy", "GlobalStudent", "HousingHelper"],
    messages: [
      {
        id: "sa1",
        roomId: "room-study-abroad",
        author: "VisaGuide",
        role: "Study Abroad Mentor",
        body: "When comparing countries, check tuition, work rights, cost of living, and post-study options together.",
        createdAt: new Date(now - 1000 * 60 * 55).toISOString(),
      },
    ],
  },
  {
    id: "room-programming-ai",
    name: "Programming and AI",
    slug: "programming-ai",
    category: "Programming",
    description: "Coding, AI tools, data science, debugging, projects, and technical careers.",
    members: 95,
    online: 19,
    icon: "💻",
    onlineUsers: ["CodeMentor", "AIBuilder", "DataScientist", "DebugHelper"],
    messages: [
      {
        id: "ai1",
        roomId: "room-programming-ai",
        author: "AIBuilder",
        role: "AI Contributor",
        body: "For AI projects, start with a narrow use case and a clear evaluation metric.",
        createdAt: new Date(now - 1000 * 60 * 33).toISOString(),
      },
    ],
  },
  {
    id: "room-careers",
    name: "Career Launch",
    slug: "career-launch",
    category: "Careers",
    description: "CVs, internships, interviews, networking, and early-career guidance.",
    members: 121,
    online: 16,
    icon: "🚀",
    onlineUsers: ["CareerBridge", "InternshipGuide", "CVReviewer", "LinkedInMentor"],
    messages: [
      {
        id: "ca1",
        roomId: "room-careers",
        author: "CareerBridge",
        role: "Career Mentor",
        body: "If you lack work experience, lead with projects, research, volunteering, and measurable outcomes.",
        createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
      },
    ],
  },
];

export function loadChatRooms(): ChatRoom[] {
  if (typeof window === "undefined") return seedRooms;

  const raw = window.localStorage.getItem(ROOMS_KEY);
  if (!raw) {
    window.localStorage.setItem(ROOMS_KEY, JSON.stringify(seedRooms));
    return seedRooms;
  }

  try {
    const parsed = JSON.parse(raw) as ChatRoom[];
    return Array.isArray(parsed) ? parsed : seedRooms;
  } catch {
    return seedRooms;
  }
}

export function saveChatRooms(rooms: ChatRoom[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new Event("collegediscourse-rooms-updated"));
}

export function sendRoomMessage(roomId: string, body: string) {
  const cleanBody = body.trim();
  const rooms = loadChatRooms();
  if (!cleanBody) return rooms;

  const next = rooms.map((room) =>
    room.id === roomId
      ? {
          ...room,
          messages: [
            ...room.messages,
            {
              id: crypto.randomUUID?.() ?? String(Date.now()),
              roomId,
              author: "Demo Student",
              role: "Member",
              body: cleanBody,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      : room,
  );

  saveChatRooms(next);
  return next;
}

export function roomTimeAgo(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
