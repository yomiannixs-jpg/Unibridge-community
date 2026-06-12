import { loadSocialStore, type SocialPerson } from "@/lib/social-store";
import { loadPresenceUsers } from "@/lib/presence-store";

export type PublicUserProfile = SocialPerson & {
  slug: string;
  country: string;
  institution: string;
  field: string;
  bio: string;
  interests: string[];
  skills: string[];
  joinedRooms: string[];
  posts: number;
  comments: number;
};

const profileExtras: Record<string, Omit<PublicUserProfile, keyof SocialPerson | "slug">> = {
  ResearchNerd: {
    country: "Nigeria",
    institution: "CollegeDiscourse Research Network",
    field: "Research Methods",
    bio: "Helps students turn broad topics into focused, testable research questions.",
    interests: ["Research Design", "Academic Writing", "Literature Reviews"],
    skills: ["Problem Statements", "Methodology", "Feedback"],
    joinedRooms: ["Research Help", "Programming and AI"],
    posts: 24,
    comments: 168,
  },
  GradCoach: {
    country: "United Kingdom",
    institution: "Graduate Admissions Network",
    field: "PhD Admissions",
    bio: "Advises applicants on supervisor emails, statements of purpose, interviews, and funding strategy.",
    interests: ["PhD Admissions", "SOPs", "Funding"],
    skills: ["Supervisor Outreach", "Application Strategy", "Interview Prep"],
    joinedRooms: ["PhD Admissions", "Scholarships"],
    posts: 19,
    comments: 142,
  },
  MethodMentor: {
    country: "Ghana",
    institution: "Methods Lab",
    field: "Econometrics and Data Analysis",
    bio: "Answers questions on regression, panel data, causal inference, and empirical project design.",
    interests: ["Econometrics", "Panel Data", "Causal Inference"],
    skills: ["STATA", "R", "Research Design"],
    joinedRooms: ["Research Help", "Programming and AI"],
    posts: 31,
    comments: 211,
  },
  LinaStudy: {
    country: "Kenya",
    institution: "Student Applicant Community",
    field: "Study Abroad",
    bio: "Exploring study-abroad routes, scholarships, and application timelines.",
    interests: ["Study Abroad", "Scholarships", "Visa Planning"],
    skills: ["Applications", "Budgeting", "Country Comparison"],
    joinedRooms: ["Study Abroad", "Scholarships"],
    posts: 7,
    comments: 34,
  },
  FinanceGuru: {
    country: "United States",
    institution: "Finance Research Circle",
    field: "Finance",
    bio: "Mentors students interested in finance research, markets, and graduate study.",
    interests: ["Finance", "Markets", "Graduate Study"],
    skills: ["Asset Pricing", "Research Feedback", "Career Advice"],
    joinedRooms: ["Research Help", "Career Launch"],
    posts: 27,
    comments: 190,
  },
  CareerBridge: {
    country: "Canada",
    institution: "Career Launch Network",
    field: "Careers",
    bio: "Reviews CVs, internship strategies, interview preparation, and early-career planning.",
    interests: ["CVs", "Internships", "Career Strategy"],
    skills: ["CV Review", "Interview Prep", "Networking"],
    joinedRooms: ["Career Launch"],
    posts: 22,
    comments: 133,
  },
  AminaStudy: {
    country: "Nigeria",
    institution: "Graduate Applicant",
    field: "International Education",
    bio: "Graduate applicant sharing scholarship and country-comparison notes.",
    interests: ["Scholarships", "Study Abroad", "Admissions"],
    skills: ["Essays", "Applications", "Planning"],
    joinedRooms: ["Study Abroad", "Scholarships"],
    posts: 11,
    comments: 59,
  },
  VisaGuide: {
    country: "Germany",
    institution: "International Student Support",
    field: "Study Abroad",
    bio: "Explains visa timelines, post-study work options, budgeting, and country selection.",
    interests: ["Visas", "Country Choice", "Post-study Work"],
    skills: ["Visa Planning", "Budgeting", "International Education"],
    joinedRooms: ["Study Abroad"],
    posts: 28,
    comments: 176,
  },
};

export function slugifyUser(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function loadPublicProfiles(): PublicUserProfile[] {
  const social = loadSocialStore();
  const people = [...social.followers, ...social.following].filter(
    (person, index, self) => index === self.findIndex((p) => p.id === person.id),
  );

  return people.map((person) => {
    const extra = profileExtras[person.name] ?? {
      country: "Global",
      institution: "CollegeDiscourse",
      field: "Student Community",
      bio: "A CollegeDiscourse member participating in academic and career discussions.",
      interests: ["Education", "Community", "Mentorship"],
      skills: ["Discussion", "Peer Support"],
      joinedRooms: ["Research Help"],
      posts: 3,
      comments: 12,
    };

    return {
      ...person,
      slug: slugifyUser(person.name),
      ...extra,
    };
  });
}

export function getPublicProfile(slug: string) {
  return loadPublicProfiles().find((profile) => profile.slug === slug);
}

export function getPublicProfilePresence(name: string) {
  return loadPresenceUsers().find((user) => user.name === name);
}
