import type { QuizQuestion } from "../../components/Quiz";

export const PIPE_WEIGHT_QUESTIONS: QuizQuestion[] = [
  {
    question: "What formula is used to calculate the weight of a steel pipe?",
    options: [
      "Weight = Length × Diameter × Wall Thickness",
      "Weight = Volume × Material Density",
      "Weight = π × (OD² − ID²) × Length × Density",
      "Weight = (OD − WT) × WT × 10.69 × Length",
    ],
    correctIndex: 3,
    explanation: "The standard pipe weight formula is: Weight = (OD − WT) × WT × 10.69 × Length (in feet). The 10.69 is derived from π × steel density (490 lb/cu ft) converted to pipe geometry units.",
  },
  {
    question: "What is the density of standard carbon steel (A36)?",
    options: [
      "490 lb/cu ft",
      "168 lb/cu ft",
      "561 lb/cu ft",
      "300 lb/cu ft",
    ],
    correctIndex: 0,
    explanation: "Carbon steel (A36, 1018, 4140) has a density of 490 lb/cu ft. This is the standard value used in pipe weight calculations.",
  },
  {
    question: "How do you calculate the inner diameter (ID) of a pipe?",
    options: [
      "ID = OD + (2 × WT)",
      "ID = OD − (2 × WT)",
      "ID = OD − WT",
      "ID = OD × WT",
    ],
    correctIndex: 1,
    explanation: "Inner diameter = Outer diameter minus twice the wall thickness (ID = OD − 2 × WT). This accounts for the wall on both sides of the cross-section.",
  },
  {
    question: "What unit is pipe weight typically measured in for material specs?",
    options: [
      "Pounds per linear foot (lb/ft)",
      "Pounds per cubic inch",
      "Kilograms per meter",
      "Tons per foot",
    ],
    correctIndex: 0,
    explanation: "Pipe weight is most commonly specified as pounds per linear foot (lb/ft) in US standard measurements. This allows easy multiplication by total length.",
  },
  {
    question: "What schedule pipe has the thickest wall for a given nominal diameter?",
    options: [
      "Schedule 40",
      "Schedule 80",
      "Schedule 160",
      "Schedule 10",
    ],
    correctIndex: 2,
    explanation: "Schedule 160 has the thickest wall of these options. Higher schedule numbers indicate thicker walls and higher pressure ratings.",
  },
  {
    question: "Why does a 2-inch Schedule 40 pipe weigh less than a 2-inch Schedule 80 pipe?",
    options: [
      "Schedule 40 uses a lighter material",
      "Schedule 80 has thicker walls, so more material per foot",
      "Schedule 40 has a smaller outer diameter",
      "Schedule 80 is measured differently",
    ],
    correctIndex: 1,
    explanation: "Schedule 80 has thicker walls than Schedule 40 for the same nominal pipe size. More material means more weight per linear foot, even though the outer diameter is the same.",
  },
  {
    question: "Approximately how much does a 6-inch Schedule 40 steel pipe weigh per foot?",
    options: [
      "10.76 lb/ft",
      "18.97 lb/ft",
      "28.57 lb/ft",
      "5.5 lb/ft",
    ],
    correctIndex: 1,
    explanation: "A 6-inch Schedule 40 steel pipe has an OD of 6.625\" and a wall thickness of 0.280\", giving approximately 18.97 lb/ft. (6.625 − 0.280) × 0.280 × 10.69 = 18.97 lb/ft.",
  },
  {
    question: "What is the conversion factor from pipe weight per foot to weight per meter?",
    options: [
      "Multiply by 3.281",
      "Multiply by 1.5",
      "Divide by 3.281",
      "Multiply by 2.205",
    ],
    correctIndex: 0,
    explanation: "Multiply pounds per foot by 3.281 to get kilograms per meter (since 1 ft = 0.3048 m and 1 lb = 0.4536 kg: 1 lb/ft = 1.488 kg/m).",
  },
];
