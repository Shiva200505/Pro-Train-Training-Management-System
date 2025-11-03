// Mock data for training dashboard
export const mockTrainings = [
  {
    id: 1,
    title: "Introduction to Leadership",
    category: "Leadership",
    duration: "2 days",
    status: "Completed",
    participants: 15,
    completionRate: 100
  },
  {
    id: 2,
    title: "Advanced Project Management",
    category: "Project Management",
    duration: "3 days",
    status: "In Progress",
    participants: 12,
    completionRate: 65
  },
  {
    id: 3,
    title: "Communication Skills Workshop",
    category: "Soft Skills",
    duration: "1 day",
    status: "Upcoming",
    participants: 20,
    completionRate: 0
  },
  {
    id: 4,
    title: "Technical Writing Fundamentals",
    category: "Communication",
    duration: "2 days",
    status: "Upcoming",
    participants: 8,
    completionRate: 0
  },
  {
    id: 5,
    title: "Data Analysis Essentials",
    category: "Technical",
    duration: "4 days",
    status: "Completed",
    participants: 10,
    completionRate: 90
  }
];

export const trainingCategories = [
  { name: "Leadership", count: 5 },
  { name: "Technical", count: 8 },
  { name: "Soft Skills", count: 6 },
  { name: "Project Management", count: 4 },
  { name: "Communication", count: 3 }
];

export const trainingProgress = [
  { status: "Completed", count: 12 },
  { status: "In Progress", count: 5 },
  { status: "Upcoming", count: 8 }
];