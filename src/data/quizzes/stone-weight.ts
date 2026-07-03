import type { QuizQuestion } from "../../components/Quiz";

export const STONE_WEIGHT_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the approximate density of granite?",
    options: [
      "130 lb/cu ft",
      "170 lb/cu ft",
      "190 lb/cu ft",
      "220 lb/cu ft",
    ],
    correctIndex: 1,
    explanation: "Granite has a density of approximately 170 lb/cu ft (2,700 kg/cu m). This makes it one of the heavier natural stones commonly used in construction.",
  },
  {
    question: "How do you calculate the weight of a stone slab?",
    options: [
      "Length × Width × Thickness",
      "Length × Width × Thickness × Material Density",
      "Length × Width ÷ Density",
      "(Length + Width) × Thickness × Density",
    ],
    correctIndex: 1,
    explanation: "Stone weight = Length × Width × Thickness × Material Density. First calculate volume (length × width × thickness), then multiply by the stone's density.",
  },
  {
    question: "Which of these natural stones is the heaviest per cubic foot?",
    options: [
      "Limestone",
      "Sandstone",
      "Marble",
      "Slate",
    ],
    correctIndex: 2,
    explanation: "Marble is the heaviest at about 170 lb/cu ft. Limestone is about 150 lb/cu ft, sandstone about 145 lb/cu ft, and slate about 167 lb/cu ft.",
  },
  {
    question: "What factor most significantly affects the weight of natural stone?",
    options: [
      "Color of the stone",
      "Porosity and mineral composition",
      "Where it was quarried",
      "Surface finish",
    ],
    correctIndex: 1,
    explanation: "Porosity and mineral composition most affect stone density. Stones with higher silica content and lower porosity are denser and heavier.",
  },
  {
    question: "How much does a typical granite countertop slab weigh per square foot at 3 cm (1.18\") thickness?",
    options: [
      "5-8 lbs per sq ft",
      "10-13 lbs per sq ft",
      "15-19 lbs per sq ft",
      "22-25 lbs per sq ft",
    ],
    correctIndex: 2,
    explanation: "A 3 cm (1.18\") granite slab weighs approximately 15-19 lbs per square foot. This is important for cabinet support requirements.",
  },
  {
    question: "What is the standard thickness range for natural stone countertops?",
    options: [
      "1 cm to 2 cm",
      "2 cm to 3 cm",
      "3 cm to 5 cm",
      "5 cm to 7 cm",
    ],
    correctIndex: 1,
    explanation: "Standard stone countertop thickness is 2 cm (3/4\") or 3 cm (1-1/4\"). The 3 cm thickness is more popular because it doesn't require plywood backing.",
  },
  {
    question: "Why does sandstone typically weigh less than granite?",
    options: [
      "Sandstone has a different color",
      "Sandstone is more porous, containing more air pockets",
      "Sandstone is mined differently",
      "Sandstone contains less quartz",
    ],
    correctIndex: 1,
    explanation: "Sandstone is more porous than granite, meaning it has more void space between sediment grains. These air pockets reduce its overall density and weight.",
  },
  {
    question: "If a stone countertop weighs 300 lbs, approximately how many people are needed to safely install it?",
    options: [
      "1 person",
      "2 people",
      "3-4 people",
      "5+ people",
    ],
    correctIndex: 2,
    explanation: "A 300 lb stone countertop requires 3-4 people for safe installation. Professional installers use suction cup lifters for better grip and control.",
  },
];
