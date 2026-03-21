import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Copy,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type QuestionType,
  type Quiz,
  type QuizAssignment,
  type QuizQuestion,
  type QuizSettings,
  deleteQuizAssignment,
  getQuizAssignments,
  saveQuiz,
  saveQuizAssignment,
  updateQuiz,
} from "../utils/quizStorage";
import { getStudentUsers } from "../utils/studentStorage";

type Props = {
  open: boolean;
  onClose: () => void;
  teacherName: string;
  editingQuiz?: Quiz | null;
  onSaved: (quiz: Quiz) => void;
};

const GRADE_LEVELS = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "University",
];

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True / False" },
  { value: "short-answer", label: "Short Answer" },
  { value: "fill-blank", label: "Fill in the Blank" },
];

function defaultSettings(): QuizSettings {
  return {
    timeLimit: 0,
    attemptsAllowed: 1,
    dueDate: "",
    shuffleQuestions: false,
    shuffleAnswers: false,
    showResultsToStudent: true,
    passMarkPercent: 50,
  };
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

type QuestionFormState = {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  explanation: string;
};

function defaultQForm(): QuestionFormState {
  return {
    id: genId(),
    type: "multiple-choice",
    text: "",
    options: ["", ""],
    correctAnswer: "0",
    points: 1,
    explanation: "",
  };
}

function qTypeBadgeClass(t: QuestionType): string {
  switch (t) {
    case "multiple-choice":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "true-false":
      return "bg-green-100 text-green-700 border-green-200";
    case "short-answer":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "fill-blank":
      return "bg-purple-100 text-purple-700 border-purple-200";
  }
}

function qTypeLabel(t: QuestionType): string {
  return QUESTION_TYPES.find((x) => x.value === t)?.label ?? t;
}

// ---------------------------------------------------------------------------
// AI Question Generation
// ---------------------------------------------------------------------------

type AIGeneratedQuestion = {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
};

type AITypeFilter =
  | "Mixed"
  | "Multiple Choice only"
  | "True / False only"
  | "Short Answer only";

function pickType(filter: AITypeFilter, index: number): QuestionType {
  if (filter === "Multiple Choice only") return "multiple-choice";
  if (filter === "True / False only") return "true-false";
  if (filter === "Short Answer only") return "short-answer";
  // Mixed: cycle through types with some variety
  const cycle: QuestionType[] = [
    "multiple-choice",
    "true-false",
    "multiple-choice",
    "short-answer",
    "fill-blank",
  ];
  return cycle[index % cycle.length];
}

function generateAIQuestions(
  subject: string,
  gradeLevel: string,
  topic: string,
  count: number,
  typeFilter: AITypeFilter,
): AIGeneratedQuestion[] {
  const subjectLower = subject.toLowerCase();
  const topicLower = topic.toLowerCase();

  // ------------------------------------------------------------------
  // Subject-specific question banks
  // ------------------------------------------------------------------

  type QTemplate = {
    type: QuestionType;
    text: string;
    options?: string[];
    correct: string;
    explanation?: string;
  };

  let bank: QTemplate[] = [];

  // MATHEMATICS
  if (
    subjectLower.includes("math") ||
    subjectLower.includes("algebra") ||
    subjectLower.includes("calculus") ||
    subjectLower.includes("geometry")
  ) {
    if (topicLower.includes("quadratic") || topicLower.includes("equation")) {
      bank = [
        {
          type: "multiple-choice",
          text: "What are the solutions of x² − 5x + 6 = 0?",
          options: [
            "x = 2, x = 3",
            "x = 1, x = 6",
            "x = −2, x = −3",
            "x = 2, x = −3",
          ],
          correct: "0",
          explanation: "Factorising: (x−2)(x−3) = 0",
        },
        {
          type: "multiple-choice",
          text: "Which formula is used to solve any quadratic equation ax² + bx + c = 0?",
          options: [
            "x = −b ± √(b²−4ac) / 2a",
            "x = b ± √(b²+4ac) / 2a",
            "x = −b / 2a",
            "x = c / a",
          ],
          correct: "0",
          explanation: "The quadratic formula",
        },
        {
          type: "true-false",
          text: "True or False: The discriminant b² − 4ac determines the number of real solutions of a quadratic equation.",
          correct: "true",
          explanation: "Positive = 2 solutions, zero = 1, negative = none",
        },
        {
          type: "true-false",
          text: "True or False: Every quadratic equation has exactly two real solutions.",
          correct: "false",
          explanation: "It depends on the discriminant",
        },
        {
          type: "short-answer",
          text: "What is the vertex form of a quadratic equation?",
          correct: "y = a(x − h)² + k",
          explanation: "Where (h, k) is the vertex",
        },
        {
          type: "fill-blank",
          text: "The graph of a quadratic function is called a ________.",
          correct: "parabola",
        },
        {
          type: "multiple-choice",
          text: "If the discriminant of a quadratic equation is negative, what type of solutions does it have?",
          options: [
            "Two real solutions",
            "One real solution",
            "No real solutions",
            "Infinitely many solutions",
          ],
          correct: "2",
        },
        {
          type: "short-answer",
          text: "Factorise x² − 9.",
          correct: "(x + 3)(x − 3)",
          explanation: "Difference of squares",
        },
      ];
    } else if (
      topicLower.includes("fraction") ||
      topicLower.includes("fraction")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "What is 3/4 + 1/4?",
          options: ["1", "2/4", "4/8", "1/2"],
          correct: "0",
        },
        {
          type: "true-false",
          text: "True or False: To add fractions with different denominators, you must first find a common denominator.",
          correct: "true",
        },
        {
          type: "short-answer",
          text: "Simplify 12/16 to its lowest terms.",
          correct: "3/4",
        },
        {
          type: "fill-blank",
          text: "The top number of a fraction is called the ________.",
          correct: "numerator",
        },
        {
          type: "multiple-choice",
          text: "What is 2/3 × 3/4?",
          options: ["1/2", "5/7", "6/12", "2/4"],
          correct: "0",
          explanation: "Multiply numerators and denominators: 6/12 = 1/2",
        },
      ];
    } else if (
      topicLower.includes("pythagoras") ||
      topicLower.includes("trigonometry") ||
      topicLower.includes("triangle")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "In a right-angled triangle with legs 3 and 4, what is the hypotenuse?",
          options: ["5", "6", "7", "√7"],
          correct: "0",
          explanation: "3² + 4² = 9 + 16 = 25, √25 = 5",
        },
        {
          type: "true-false",
          text: "True or False: The Pythagorean theorem states a² + b² = c², where c is the longest side.",
          correct: "true",
        },
        {
          type: "short-answer",
          text: "State the Pythagorean theorem.",
          correct: "a² + b² = c²",
        },
        { type: "fill-blank", text: "sin(30°) = ________.", correct: "0.5" },
        {
          type: "multiple-choice",
          text: "Which trigonometric ratio is defined as opposite/hypotenuse?",
          options: ["cosine", "tangent", "sine", "cotangent"],
          correct: "2",
        },
        {
          type: "multiple-choice",
          text: "What is cos(60°)?",
          options: ["0.5", "√3/2", "1", "0"],
          correct: "0",
        },
      ];
    } else {
      // Generic maths
      bank = [
        {
          type: "multiple-choice",
          text: `In the context of ${topic}, which statement best describes a prime number?`,
          options: [
            "Divisible by any integer",
            "Divisible only by 1 and itself",
            "Always an even number",
            "Has at least three factors",
          ],
          correct: "1",
        },
        {
          type: "true-false",
          text: `True or False: In ${topic}, the order of operations follows BODMAS/BIDMAS.`,
          correct: "true",
        },
        {
          type: "short-answer",
          text: `What is the value of the expression 2³ + 4 × 3 − 6? (${topic})`,
          correct: "14",
        },
        {
          type: "fill-blank",
          text: `The result of multiplying any number by zero is ________ (relevant to ${topic}).`,
          correct: "zero",
        },
        {
          type: "multiple-choice",
          text: `Which of the following is an example of an irrational number? (${topic})`,
          options: ["1/3", "√2", "0.25", "4/5"],
          correct: "1",
        },
        {
          type: "short-answer",
          text: `Define a variable in the context of ${topic}.`,
          correct: "A symbol that represents an unknown or changing quantity",
        },
      ];
    }
  }

  // PHYSICS
  else if (subjectLower.includes("physics")) {
    if (
      topicLower.includes("newton") ||
      topicLower.includes("force") ||
      topicLower.includes("motion")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "Which of Newton's laws states that F = ma?",
          options: [
            "First law",
            "Second law",
            "Third law",
            "Law of gravitation",
          ],
          correct: "1",
          explanation: "F = ma is Newton's Second Law",
        },
        {
          type: "true-false",
          text: "True or False: Newton's Third Law states that every action has an equal and opposite reaction.",
          correct: "true",
        },
        {
          type: "short-answer",
          text: "State Newton's First Law of Motion.",
          correct:
            "An object remains at rest or in uniform motion unless acted upon by an external force",
        },
        {
          type: "fill-blank",
          text: "The unit of force in SI units is the ________.",
          correct: "Newton (N)",
        },
        {
          type: "multiple-choice",
          text: "A 10 kg object is accelerated at 3 m/s². What is the net force acting on it?",
          options: ["30 N", "3 N", "13 N", "0.3 N"],
          correct: "0",
          explanation: "F = ma = 10 × 3 = 30 N",
        },
        {
          type: "multiple-choice",
          text: "What is the net force on an object moving at constant velocity?",
          options: [
            "Equal to its weight",
            "Greater than zero",
            "Zero",
            "Equal to its mass",
          ],
          correct: "2",
          explanation:
            "Constant velocity means zero acceleration, so net force = 0",
        },
        {
          type: "short-answer",
          text: "Define inertia.",
          correct:
            "The tendency of an object to resist changes in its state of motion",
        },
        {
          type: "true-false",
          text: "True or False: Mass and weight are the same quantity.",
          correct: "false",
          explanation:
            "Mass is amount of matter; weight is gravitational force on that mass",
        },
      ];
    } else if (topicLower.includes("energy") || topicLower.includes("work")) {
      bank = [
        {
          type: "multiple-choice",
          text: "The formula for kinetic energy is:",
          options: ["½mv²", "mgh", "mv", "½mv"],
          correct: "0",
        },
        {
          type: "true-false",
          text: "True or False: Energy can be created but not destroyed.",
          correct: "false",
          explanation:
            "Energy is conserved — it transforms, not created or destroyed",
        },
        {
          type: "fill-blank",
          text: "The unit of energy in SI units is the ________.",
          correct: "Joule (J)",
        },
        {
          type: "short-answer",
          text: "Define gravitational potential energy.",
          correct:
            "Energy stored in an object due to its height above a reference point; GPE = mgh",
        },
        {
          type: "multiple-choice",
          text: "A 2 kg ball moving at 4 m/s has kinetic energy of:",
          options: ["16 J", "8 J", "4 J", "32 J"],
          correct: "0",
          explanation: "KE = ½ × 2 × 4² = ½ × 2 × 16 = 16 J",
        },
      ];
    } else {
      bank = [
        {
          type: "multiple-choice",
          text: `Which quantity is measured in Joules? (${topic})`,
          options: ["Force", "Power", "Energy", "Momentum"],
          correct: "2",
        },
        {
          type: "true-false",
          text: `True or False: Speed is a vector quantity (${topic}).`,
          correct: "false",
          explanation: "Speed is scalar; velocity is the vector",
        },
        {
          type: "short-answer",
          text: `What is the difference between speed and velocity? (${topic})`,
          correct: "Speed is a scalar; velocity is speed with direction",
        },
        {
          type: "fill-blank",
          text: `The SI unit of electrical resistance is the ________ (${topic}).`,
          correct: "Ohm (Ω)",
        },
        {
          type: "multiple-choice",
          text: `In the context of ${topic}, which of the following is a scalar quantity?`,
          options: ["Velocity", "Displacement", "Mass", "Force"],
          correct: "2",
        },
        {
          type: "multiple-choice",
          text: `What does the gradient of a distance–time graph represent? (${topic})`,
          options: ["Acceleration", "Speed", "Force", "Energy"],
          correct: "1",
        },
      ];
    }
  }

  // CHEMISTRY
  else if (subjectLower.includes("chem")) {
    if (
      topicLower.includes("periodic") ||
      topicLower.includes("element") ||
      topicLower.includes("atom")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "What is the atomic number of Carbon?",
          options: ["6", "12", "4", "8"],
          correct: "0",
          explanation: "Carbon has 6 protons",
        },
        {
          type: "true-false",
          text: "True or False: The periodic table is arranged by increasing atomic number.",
          correct: "true",
        },
        {
          type: "short-answer",
          text: "What are the three subatomic particles in an atom?",
          correct: "Proton, neutron, electron",
        },
        {
          type: "fill-blank",
          text: "The chemical symbol for Gold is ________.",
          correct: "Au",
        },
        {
          type: "multiple-choice",
          text: "Which group in the periodic table contains the noble gases?",
          options: ["Group 1", "Group 7", "Group 0 / Group 18", "Group 2"],
          correct: "2",
        },
        {
          type: "multiple-choice",
          text: "What is an isotope?",
          options: [
            "Atoms of different elements with same mass",
            "Atoms of the same element with different numbers of neutrons",
            "Ions with extra electrons",
            "Molecules with double bonds",
          ],
          correct: "1",
        },
        {
          type: "true-false",
          text: "True or False: An electron has a positive charge.",
          correct: "false",
          explanation: "Electrons have negative charge",
        },
        {
          type: "short-answer",
          text: "Define the term 'atomic mass'.",
          correct:
            "The average mass of atoms of an element relative to 1/12 of a carbon-12 atom",
        },
      ];
    } else if (
      topicLower.includes("acid") ||
      topicLower.includes("base") ||
      topicLower.includes("ph")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "What pH value indicates a neutral solution?",
          options: ["0", "7", "14", "1"],
          correct: "1",
        },
        {
          type: "true-false",
          text: "True or False: Acids have a pH below 7.",
          correct: "true",
        },
        {
          type: "fill-blank",
          text: "The chemical formula for water is ________.",
          correct: "H₂O",
        },
        {
          type: "short-answer",
          text: "What happens when an acid and a base are mixed?",
          correct: "Neutralisation occurs, producing salt and water",
        },
        {
          type: "multiple-choice",
          text: "Which indicator turns red in acid and blue in alkali?",
          options: [
            "Phenolphthalein",
            "Litmus",
            "Universal indicator",
            "Bromothymol blue",
          ],
          correct: "1",
        },
      ];
    } else {
      bank = [
        {
          type: "multiple-choice",
          text: `What type of bond involves the sharing of electron pairs? (${topic})`,
          options: [
            "Ionic bond",
            "Metallic bond",
            "Covalent bond",
            "Hydrogen bond",
          ],
          correct: "2",
        },
        {
          type: "true-false",
          text: `True or False: A compound contains atoms of more than one element (${topic}).`,
          correct: "true",
        },
        {
          type: "short-answer",
          text: `Define a chemical reaction in the context of ${topic}.`,
          correct:
            "A process in which substances are converted into different substances through breaking and forming chemical bonds",
        },
        {
          type: "fill-blank",
          text: `In chemistry, the law of conservation of ________ states that matter cannot be created or destroyed (${topic}).`,
          correct: "mass",
        },
        {
          type: "multiple-choice",
          text: `Which state of matter has a definite volume but no definite shape? (${topic})`,
          options: ["Solid", "Gas", "Liquid", "Plasma"],
          correct: "2",
        },
      ];
    }
  }

  // BIOLOGY
  else if (subjectLower.includes("bio")) {
    if (topicLower.includes("photosynthesis")) {
      bank = [
        {
          type: "multiple-choice",
          text: "Which gas is released as a byproduct of photosynthesis?",
          options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
          correct: "2",
          explanation: "Oxygen is released when water is split",
        },
        {
          type: "true-false",
          text: "True or False: Photosynthesis converts light energy into chemical energy stored in glucose.",
          correct: "true",
        },
        {
          type: "fill-blank",
          text: "The green pigment in leaves used for photosynthesis is called ________.",
          correct: "chlorophyll",
        },
        {
          type: "short-answer",
          text: "Write the word equation for photosynthesis.",
          correct:
            "Carbon dioxide + water → glucose + oxygen (in the presence of light and chlorophyll)",
        },
        {
          type: "multiple-choice",
          text: "Where in the plant cell does photosynthesis take place?",
          options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
          correct: "2",
        },
        {
          type: "multiple-choice",
          text: "Which of the following is a raw material for photosynthesis?",
          options: ["Oxygen", "Glucose", "Carbon dioxide", "Nitrogen"],
          correct: "2",
        },
        {
          type: "true-false",
          text: "True or False: Photosynthesis can occur in the absence of light.",
          correct: "false",
        },
        {
          type: "short-answer",
          text: "What is the role of chlorophyll in photosynthesis?",
          correct:
            "Chlorophyll absorbs light energy (mainly red and blue wavelengths) to power the photosynthesis reaction",
        },
      ];
    } else if (
      topicLower.includes("cell") ||
      topicLower.includes("mitosis") ||
      topicLower.includes("division")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "Which organelle is known as the 'powerhouse of the cell'?",
          options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
          correct: "2",
        },
        {
          type: "true-false",
          text: "True or False: Plant cells have a cell wall, but animal cells do not.",
          correct: "true",
        },
        {
          type: "fill-blank",
          text: "The control centre of a cell is the ________.",
          correct: "nucleus",
        },
        {
          type: "short-answer",
          text: "What is the function of the cell membrane?",
          correct:
            "Controls what enters and exits the cell (selective permeability)",
        },
        {
          type: "multiple-choice",
          text: "How many chromosomes does a normal human body cell contain?",
          options: ["23", "46", "48", "92"],
          correct: "1",
        },
        {
          type: "multiple-choice",
          text: "What is the process of cell division that produces genetically identical daughter cells?",
          options: ["Meiosis", "Binary fission", "Mitosis", "Fertilisation"],
          correct: "2",
        },
      ];
    } else {
      bank = [
        {
          type: "multiple-choice",
          text: `Which level of organisation comes after cells in living organisms? (${topic})`,
          options: ["Organs", "Tissues", "Systems", "Organisms"],
          correct: "1",
        },
        {
          type: "true-false",
          text: `True or False: All living organisms are made of cells (${topic}).`,
          correct: "true",
        },
        {
          type: "short-answer",
          text: `Define the term 'homeostasis' in the context of ${topic}.`,
          correct:
            "The maintenance of a stable internal environment in the body",
        },
        {
          type: "fill-blank",
          text: `Deoxyribonucleic acid is commonly abbreviated as ________ (${topic}).`,
          correct: "DNA",
        },
        {
          type: "multiple-choice",
          text: `Which system in the human body is responsible for transporting oxygen? (${topic})`,
          options: [
            "Digestive system",
            "Nervous system",
            "Circulatory system",
            "Skeletal system",
          ],
          correct: "2",
        },
        {
          type: "multiple-choice",
          text: `What term describes organisms that make their own food through photosynthesis? (${topic})`,
          options: ["Heterotrophs", "Decomposers", "Autotrophs", "Consumers"],
          correct: "2",
        },
      ];
    }
  }

  // HISTORY
  else if (subjectLower.includes("history") || subjectLower.includes("hist")) {
    if (
      topicLower.includes("world war i") ||
      topicLower.includes("ww1") ||
      topicLower.includes("first world")
    ) {
      bank = [
        {
          type: "true-false",
          text: "True or False: The assassination of Archduke Franz Ferdinand is considered a trigger for World War I.",
          correct: "true",
        },
        {
          type: "multiple-choice",
          text: "In which city was Archduke Franz Ferdinand assassinated in 1914?",
          options: ["Vienna", "Belgrade", "Sarajevo", "Berlin"],
          correct: "2",
        },
        {
          type: "short-answer",
          text: "Name two main alliances that fought in World War I.",
          correct:
            "The Triple Entente (France, Britain, Russia) and the Triple Alliance (Germany, Austria-Hungary, Italy)",
        },
        {
          type: "fill-blank",
          text: "World War I ended with the signing of the Treaty of ________ in 1919.",
          correct: "Versailles",
        },
        {
          type: "multiple-choice",
          text: "Which of the following was NOT a cause of World War I (MAIN acronym)?', options: [",
          options: [
            "Militarism",
            "Alliances",
            "Industrialisation",
            "Nationalism",
          ],
          correct: "2",
        },
        {
          type: "true-false",
          text: "True or False: The United States entered World War I in 1917.",
          correct: "true",
        },
        {
          type: "short-answer",
          text: "What was the Schlieffen Plan?",
          correct:
            "Germany's military strategy to quickly defeat France in the west before turning to fight Russia in the east",
        },
        {
          type: "multiple-choice",
          text: "What type of warfare was characteristic of the Western Front in World War I?",
          options: [
            "Cavalry charges",
            "Naval warfare",
            "Trench warfare",
            "Air combat",
          ],
          correct: "2",
        },
      ];
    } else if (
      topicLower.includes("world war ii") ||
      topicLower.includes("ww2") ||
      topicLower.includes("second world")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "Who was the leader of Nazi Germany during World War II?",
          options: ["Mussolini", "Stalin", "Hitler", "Franco"],
          correct: "2",
        },
        {
          type: "true-false",
          text: "True or False: World War II began in 1939 when Germany invaded Poland.",
          correct: "true",
        },
        {
          type: "short-answer",
          text: "What event prompted the United States to enter World War II?",
          correct: "The Japanese attack on Pearl Harbor on December 7, 1941",
        },
        {
          type: "fill-blank",
          text: "The Allied invasion of Normandy in June 1944 is known as ________.",
          correct: "D-Day",
        },
        {
          type: "multiple-choice",
          text: "Which country dropped atomic bombs on Japan in 1945?",
          options: [
            "United Kingdom",
            "Soviet Union",
            "United States",
            "France",
          ],
          correct: "2",
        },
        {
          type: "true-false",
          text: "True or False: The Holocaust refers to the systematic genocide of six million Jews by the Nazi regime.",
          correct: "true",
        },
      ];
    } else {
      bank = [
        {
          type: "multiple-choice",
          text: `Which empire was the largest in history by land area? (${topic})`,
          options: [
            "Roman Empire",
            "British Empire",
            "Mongol Empire",
            "Ottoman Empire",
          ],
          correct: "2",
        },
        {
          type: "true-false",
          text: `True or False: Primary sources are original documents or artefacts from the time period being studied (${topic}).`,
          correct: "true",
        },
        {
          type: "short-answer",
          text: `Explain the term 'imperialism' in the context of ${topic}.`,
          correct:
            "The policy of extending a country's power through colonisation or military force",
        },
        {
          type: "fill-blank",
          text: `The French Revolution began in the year ________ (${topic}).`,
          correct: "1789",
        },
        {
          type: "multiple-choice",
          text: `Which of the following best describes a democracy? (${topic})`,
          options: [
            "Rule by a single monarch",
            "Rule by the military",
            "Rule by elected representatives",
            "Rule by religious leaders",
          ],
          correct: "2",
        },
      ];
    }
  }

  // GEOGRAPHY
  else if (subjectLower.includes("geog")) {
    bank = [
      {
        type: "multiple-choice",
        text: `Which of the following is a renewable energy source? (${topic})`,
        options: ["Coal", "Natural gas", "Solar power", "Nuclear energy"],
        correct: "2",
      },
      {
        type: "true-false",
        text: `True or False: The equator divides the Earth into Northern and Southern hemispheres (${topic}).`,
        correct: "true",
      },
      {
        type: "short-answer",
        text: `Define 'urbanisation' in the context of ${topic}.`,
        correct:
          "The increase in the proportion of people living in urban areas compared to rural areas",
      },
      {
        type: "fill-blank",
        text: `The world's largest ocean is the ________ Ocean (${topic}).`,
        correct: "Pacific",
      },
      {
        type: "multiple-choice",
        text: `What causes earthquakes? (${topic})`,
        options: [
          "Volcanic eruptions",
          "Heavy rainfall",
          "Movement of tectonic plates",
          "Changes in air pressure",
        ],
        correct: "2",
      },
      {
        type: "multiple-choice",
        text: `Which gas makes up the largest percentage of Earth's atmosphere? (${topic})`,
        options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
        correct: "2",
      },
      {
        type: "short-answer",
        text: `What is the difference between weather and climate? (${topic})`,
        correct:
          "Weather refers to short-term atmospheric conditions; climate refers to long-term average weather patterns",
      },
      {
        type: "true-false",
        text: `True or False: Deforestation can increase the risk of flooding (${topic}).`,
        correct: "true",
      },
    ];
  }

  // ENGLISH
  else if (
    subjectLower.includes("english") ||
    subjectLower.includes("literature") ||
    subjectLower.includes("language")
  ) {
    if (
      topicLower.includes("shakespear") ||
      topicLower.includes("hamlet") ||
      topicLower.includes("macbeth") ||
      topicLower.includes("romeo")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "Who wrote the play 'Hamlet'?",
          options: [
            "Christopher Marlowe",
            "William Shakespeare",
            "Ben Jonson",
            "John Webster",
          ],
          correct: "1",
        },
        {
          type: "true-false",
          text: "True or False: In 'Romeo and Juliet', both main characters die by the end of the play.",
          correct: "true",
        },
        {
          type: "short-answer",
          text: "What is the main theme of 'Macbeth'?",
          correct: "Ambition and its corrupting influence on power",
        },
        {
          type: "fill-blank",
          text: "'To be or not to be' is a soliloquy from Shakespeare's play ________.",
          correct: "Hamlet",
        },
        {
          type: "multiple-choice",
          text: "What literary device is used in 'All the world's a stage'?",
          options: [
            "Simile",
            "Personification",
            "Extended metaphor",
            "Alliteration",
          ],
          correct: "2",
        },
        {
          type: "true-false",
          text: "True or False: Shakespeare wrote his plays in Early Modern English.",
          correct: "true",
        },
      ];
    } else {
      bank = [
        {
          type: "multiple-choice",
          text: `Which literary device involves repeating consonant sounds at the beginning of words? (${topic})`,
          options: ["Assonance", "Alliteration", "Onomatopoeia", "Sibilance"],
          correct: "1",
        },
        {
          type: "true-false",
          text: `True or False: A metaphor directly compares two things without using 'like' or 'as' (${topic}).`,
          correct: "true",
        },
        {
          type: "short-answer",
          text: `What is the difference between a simile and a metaphor? (${topic})`,
          correct:
            "A simile uses 'like' or 'as' to compare; a metaphor states one thing IS another",
        },
        {
          type: "fill-blank",
          text: `A story told from the perspective of 'I' is written in ________ person (${topic}).`,
          correct: "first",
        },
        {
          type: "multiple-choice",
          text: `What is the term for a protagonist who has a mix of good and evil qualities? (${topic})`,
          options: ["Anti-hero", "Villain", "Round character", "Foil"],
          correct: "0",
        },
        {
          type: "multiple-choice",
          text: `Which narrative perspective gives the reader access to all characters' thoughts? (${topic})`,
          options: [
            "First person",
            "Second person",
            "Third person limited",
            "Third person omniscient",
          ],
          correct: "3",
        },
      ];
    }
  }

  // COMPUTER SCIENCE
  else if (
    subjectLower.includes("computer") ||
    subjectLower.includes("cs") ||
    subjectLower.includes("programming") ||
    subjectLower.includes("coding")
  ) {
    if (
      topicLower.includes("algorithm") ||
      topicLower.includes("sort") ||
      topicLower.includes("search")
    ) {
      bank = [
        {
          type: "multiple-choice",
          text: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
          correct: "1",
          explanation: "Binary search halves the search space each step",
        },
        {
          type: "true-false",
          text: "True or False: Bubble sort is one of the most efficient sorting algorithms for large datasets.",
          correct: "false",
          explanation:
            "Bubble sort is O(n²); quicksort/merge sort are much faster",
        },
        {
          type: "short-answer",
          text: "Define an algorithm.",
          correct:
            "A step-by-step set of instructions to solve a problem or perform a task",
        },
        {
          type: "fill-blank",
          text: "The process of breaking a problem into smaller sub-problems is called ________ and conquer.",
          correct: "divide",
        },
        {
          type: "multiple-choice",
          text: "Which sorting algorithm uses the 'pivot' concept?",
          options: ["Merge sort", "Bubble sort", "Quicksort", "Insertion sort"],
          correct: "2",
        },
        {
          type: "multiple-choice",
          text: "What is the worst-case time complexity of bubble sort?",
          options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
          correct: "3",
        },
      ];
    } else {
      bank = [
        {
          type: "multiple-choice",
          text: `What does CPU stand for in computing? (${topic})`,
          options: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Program Utility",
            "Core Processing Unit",
          ],
          correct: "0",
        },
        {
          type: "true-false",
          text: `True or False: RAM is a type of non-volatile memory (${topic}).`,
          correct: "false",
          explanation: "RAM is volatile — it loses data when power is off",
        },
        {
          type: "short-answer",
          text: `What is the difference between hardware and software? (${topic})`,
          correct:
            "Hardware is the physical components; software is the programs and operating information",
        },
        {
          type: "fill-blank",
          text: `In Python, a block of reusable code is defined using the keyword ________ (${topic}).`,
          correct: "def",
        },
        {
          type: "multiple-choice",
          text: `Which data structure operates on a LIFO (Last In, First Out) principle? (${topic})`,
          options: ["Queue", "Stack", "Array", "Linked list"],
          correct: "1",
        },
        {
          type: "multiple-choice",
          text: `What is the binary representation of the decimal number 10? (${topic})`,
          options: ["1010", "0101", "1100", "1001"],
          correct: "0",
        },
        {
          type: "short-answer",
          text: `Explain what a loop is in programming (${topic}).`,
          correct:
            "A control structure that repeats a block of code until a condition is met",
        },
        {
          type: "true-false",
          text: `True or False: An if-else statement is an example of selection in programming (${topic}).`,
          correct: "true",
        },
      ];
    }
  }

  // GENERIC FALLBACK
  else {
    bank = [
      {
        type: "multiple-choice",
        text: `Which of the following is the best definition related to ${topic}?`,
        options: [
          `A foundational concept in ${subject}`,
          "An unrelated concept",
          "A term from another subject",
          "A historical artefact",
        ],
        correct: "0",
      },
      {
        type: "true-false",
        text: `True or False: ${topic} is an important topic studied in ${gradeLevel} ${subject}.`,
        correct: "true",
      },
      {
        type: "short-answer",
        text: `In your own words, describe the key concept of ${topic} as studied in ${subject}.`,
        correct: `A key concept in ${subject} at ${gradeLevel}`,
      },
      {
        type: "fill-blank",
        text: `The study of ${topic} is part of the subject ________.`,
        correct: subject,
      },
      {
        type: "multiple-choice",
        text: `What skill does studying ${topic} in ${subject} primarily develop?`,
        options: [
          "Analytical thinking",
          "Physical strength",
          "Artistic talent",
          "Musical ability",
        ],
        correct: "0",
      },
      {
        type: "short-answer",
        text: `Give one real-world application of ${topic} studied in ${subject}.`,
        correct: `Practical application of ${topic}`,
      },
      {
        type: "true-false",
        text: `True or False: Understanding ${topic} requires knowledge of prior concepts in ${subject}.`,
        correct: "true",
      },
      {
        type: "fill-blank",
        text: `At ${gradeLevel}, students studying ${topic} in ${subject} are expected to develop ________ skills.`,
        correct: "critical thinking",
      },
    ];
  }

  // Select `count` items from bank, applying type filter
  const filtered =
    typeFilter === "Mixed"
      ? bank
      : bank.filter((q) => {
          if (typeFilter === "Multiple Choice only")
            return q.type === "multiple-choice";
          if (typeFilter === "True / False only")
            return q.type === "true-false";
          if (typeFilter === "Short Answer only")
            return q.type === "short-answer" || q.type === "fill-blank";
          return true;
        });

  // If filtered is empty fall back to bank
  const source = filtered.length > 0 ? filtered : bank;

  const results: AIGeneratedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const template = source[i % source.length];
    // Override type if filter specified
    let finalType = template.type;
    if (typeFilter !== "Mixed") {
      finalType = pickType(typeFilter, i);
    }
    results.push({
      id: genId(),
      type: finalType,
      text: template.text,
      options: template.options,
      correctAnswer: template.correct,
      explanation: template.explanation,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function QuizBuilder({
  open,
  onClose,
  teacherName,
  editingQuiz,
  onSaved,
}: Props) {
  const [step, setStep] = useState(1);

  // Step 1
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [quizType, setQuizType] = useState<"quiz" | "test">("quiz");

  // Step 2
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [qForm, setQForm] = useState<QuestionFormState>(defaultQForm);

  // AI panel state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiTypeFilter, setAiTypeFilter] = useState<AITypeFilter>("Mixed");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIGeneratedQuestion[]>([]);

  // Drag state
  const dragIdx = useRef<number | null>(null);

  // Step 3
  const [settings, setSettings] = useState<QuizSettings>(defaultSettings());

  // Step 4
  const [assignTo, setAssignTo] = useState<"all" | "class" | "individual">(
    "all",
  );
  const [classGroup, setClassGroup] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseTime, setReleaseTime] = useState("");
  const [existingAssignments, setExistingAssignments] = useState<
    QuizAssignment[]
  >([]);

  const allStudents = getStudentUsers();

  // Pre-fill when editing
  useEffect(() => {
    if (open) {
      if (editingQuiz) {
        setTitle(editingQuiz.title);
        setSubject(editingQuiz.subject);
        setGradeLevel(editingQuiz.gradeLevel);
        setQuizType(editingQuiz.type);
        setQuestions(editingQuiz.questions);
        setSettings(editingQuiz.settings);
        setExistingAssignments(
          getQuizAssignments().filter((a) => a.quizId === editingQuiz.id),
        );
      } else {
        setTitle("");
        setSubject("");
        setGradeLevel("");
        setQuizType("quiz");
        setQuestions([]);
        setSettings(defaultSettings());
        setExistingAssignments([]);
      }
      setStep(1);
      setAddingQuestion(false);
      setEditingQId(null);
      setQForm(defaultQForm());
      setAssignTo("all");
      setClassGroup("");
      setSelectedStudents([]);
      setReleaseDate("");
      setReleaseTime("");
      // Reset AI panel
      setAiPanelOpen(false);
      setAiTopic("");
      setAiCount(5);
      setAiTypeFilter("Mixed");
      setAiGenerating(false);
      setAiPreview([]);
    }
  }, [open, editingQuiz]);

  function buildQuiz(): Quiz {
    return {
      id: editingQuiz?.id ?? `quiz_${genId()}`,
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel,
      type: quizType,
      questions,
      settings,
      teacherName,
      createdAt: editingQuiz?.createdAt ?? Date.now(),
    };
  }

  function handleSaveDraft() {
    if (!title.trim()) {
      toast.error("Please enter a title first.");
      return;
    }
    const quiz = buildQuiz();
    if (editingQuiz) {
      updateQuiz(quiz);
    } else {
      saveQuiz(quiz);
    }
    toast.success("Draft saved!");
    onSaved(quiz);
    onClose();
  }

  function handleSaveAndAssign() {
    const quiz = buildQuiz();
    if (editingQuiz) {
      updateQuiz(quiz);
    } else {
      saveQuiz(quiz);
    }

    // Build assignment
    let releaseAt: number | null = null;
    if (releaseDate) {
      const dt = new Date(`${releaseDate}T${releaseTime || "00:00"}`);
      releaseAt = dt.getTime();
    }

    const assignment: QuizAssignment = {
      id: `qa_${genId()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      teacherName,
      assignedTo: assignTo,
      studentUsernames: assignTo === "individual" ? selectedStudents : [],
      classGroup: assignTo === "class" ? classGroup.trim() : "",
      releaseAt,
      assignedAt: Date.now(),
    };
    saveQuizAssignment(assignment);
    toast.success("Quiz assigned successfully!");
    onSaved(quiz);
    onClose();
  }

  // ---- Step navigation ----
  function nextStep() {
    if (step === 1) {
      if (!title.trim()) {
        toast.error("Title is required.");
        return;
      }
      if (!subject.trim()) {
        toast.error("Subject is required.");
        return;
      }
      if (!gradeLevel) {
        toast.error("Please select a grade level.");
        return;
      }
    }
    if (step === 2) {
      if (addingQuestion) {
        toast.error(
          "Please save or cancel your current question before continuing.",
        );
        return;
      }
      if (questions.length === 0) {
        toast.error("Add at least one question.");
        return;
      }
    }
    setStep((s) => s + 1);
  }

  // ---- Question form ----
  function openAddQuestion() {
    setQForm(defaultQForm());
    setEditingQId(null);
    setAddingQuestion(true);
  }

  function openEditQuestion(q: QuizQuestion) {
    setQForm({
      id: q.id,
      type: q.type,
      text: q.text,
      options: q.options ?? ["", ""],
      correctAnswer: q.correctAnswer,
      points: q.points,
      explanation: q.explanation ?? "",
    });
    setEditingQId(q.id);
    setAddingQuestion(true);
  }

  function cancelQForm() {
    setAddingQuestion(false);
    setEditingQId(null);
  }

  function saveQForm() {
    if (!qForm.text.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (qForm.type === "multiple-choice") {
      const filled = qForm.options.filter((o) => o.trim());
      if (filled.length < 2) {
        toast.error("Need at least 2 options.");
        return;
      }
    }
    const q: QuizQuestion = {
      id: qForm.id,
      type: qForm.type,
      text: qForm.text.trim(),
      options: qForm.type === "multiple-choice" ? qForm.options : undefined,
      correctAnswer: qForm.correctAnswer,
      points: qForm.points,
      explanation: qForm.explanation.trim() || undefined,
    };
    if (editingQId) {
      setQuestions((prev) => prev.map((x) => (x.id === editingQId ? q : x)));
    } else {
      setQuestions((prev) => [...prev, q]);
    }
    setAddingQuestion(false);
    setEditingQId(null);
  }

  function duplicateQuestion(q: QuizQuestion) {
    const copy: QuizQuestion = { ...q, id: genId() };
    setQuestions((prev) => {
      const idx = prev.findIndex((x) => x.id === q.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function deleteQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  // Drag and drop
  function onDragStart(idx: number) {
    dragIdx.current = idx;
  }

  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    const from = dragIdx.current;
    if (from === null || from === idx) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(idx, 0, item);
      dragIdx.current = idx;
      return next;
    });
  }

  function onDrop() {
    dragIdx.current = null;
  }

  // ---- Question form type change ----
  function handleQTypeChange(t: QuestionType) {
    setQForm((prev) => ({
      ...prev,
      type: t,
      options: t === "multiple-choice" ? ["", ""] : prev.options,
      correctAnswer:
        t === "true-false" ? "true" : t === "multiple-choice" ? "0" : "",
    }));
  }

  function handleOptionChange(idx: number, val: string) {
    setQForm((prev) => {
      const opts = [...prev.options];
      opts[idx] = val;
      return { ...prev, options: opts };
    });
  }

  function addOption() {
    if (qForm.options.length >= 6) return;
    setQForm((prev) => ({ ...prev, options: [...prev.options, ""] }));
  }

  function removeOption(idx: number) {
    if (qForm.options.length <= 2) return;
    setQForm((prev) => {
      const opts = prev.options.filter((_, i) => i !== idx);
      const correct = Number(prev.correctAnswer);
      const newCorrect =
        correct >= opts.length ? String(opts.length - 1) : prev.correctAnswer;
      return { ...prev, options: opts, correctAnswer: newCorrect };
    });
  }

  // ---- AI generation ----
  function handleAIGenerate() {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic or prompt.");
      return;
    }
    setAiGenerating(true);
    setAiPreview([]);
    setTimeout(() => {
      const generated = generateAIQuestions(
        subject || "General",
        gradeLevel || "Grade 10",
        aiTopic.trim(),
        aiCount,
        aiTypeFilter,
      );
      setAiPreview(generated);
      setAiGenerating(false);
    }, 1200);
  }

  function addAIQuestion(q: AIGeneratedQuestion) {
    const newQ: QuizQuestion = {
      id: genId(),
      type: q.type,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: 1,
      explanation: q.explanation,
    };
    setQuestions((prev) => [...prev, newQ]);
    setAiPreview((prev) => prev.filter((x) => x.id !== q.id));
    toast.success("Question added!");
  }

  function addAllAIQuestions() {
    const newQs: QuizQuestion[] = aiPreview.map((q) => ({
      id: genId(),
      type: q.type,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: 1,
      explanation: q.explanation,
    }));
    setQuestions((prev) => [...prev, ...newQs]);
    setAiPreview([]);
    toast.success(`${newQs.length} questions added!`);
  }

  function dismissAIQuestion(id: string) {
    setAiPreview((prev) => prev.filter((x) => x.id !== id));
  }

  function getCorrectAnswerDisplay(q: AIGeneratedQuestion): string {
    if (q.type === "multiple-choice" && q.options) {
      const idx = Number(q.correctAnswer);
      return q.options[idx] ?? q.correctAnswer;
    }
    if (q.type === "true-false") {
      return q.correctAnswer === "true" ? "True" : "False";
    }
    return q.correctAnswer;
  }

  const stepLabels = ["Details", "Questions", "Settings", "Assign"];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="quiz.builder.dialog"
        className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-teacher" />
              {editingQuiz ? "Edit Quiz / Test" : "Create Quiz / Test"}
            </DialogTitle>
            <Button
              data-ocid="quiz.builder.save_button"
              size="sm"
              variant="outline"
              className="text-xs border-teacher/30 text-teacher hover:bg-teacher-light"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-1 mt-4">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                    step === i + 1
                      ? "bg-teacher text-white"
                      : step > i + 1
                        ? "bg-teacher/20 text-teacher"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:block transition-colors ${
                    step === i + 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {i < 3 && <div className="flex-1 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Step 1 - Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="qb-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="qb-title"
                  data-ocid="quiz.title.input"
                  placeholder="e.g. Chapter 5 Vocabulary Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qb-subject">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="qb-subject"
                  data-ocid="quiz.subject.input"
                  placeholder="e.g. Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Grade Level <span className="text-destructive">*</span>
                </Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger data-ocid="quiz.grade.select">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    data-ocid="quiz.type.quiz.toggle"
                    onClick={() => setQuizType("quiz")}
                    className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                      quizType === "quiz"
                        ? "border-blue-400 bg-blue-50"
                        : "border-border hover:border-blue-200"
                    }`}
                  >
                    <p className="font-semibold text-sm text-blue-700">Quiz</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Low-stakes, auto-graded
                    </p>
                  </button>
                  <button
                    type="button"
                    data-ocid="quiz.type.test.toggle"
                    onClick={() => setQuizType("test")}
                    className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                      quizType === "test"
                        ? "border-purple-400 bg-purple-50"
                        : "border-border hover:border-purple-200"
                    }`}
                  >
                    <p className="font-semibold text-sm text-purple-700">
                      Test
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formal, scored, recorded
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Questions */}
          {step === 2 && (
            <div className="space-y-3">
              {/* AI Generate Panel Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  data-ocid="quiz.ai.generate.button"
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 font-semibold"
                  onClick={() => setAiPanelOpen((v) => !v)}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                  {aiPanelOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 ml-1" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 ml-1" />
                  )}
                </Button>
                {aiPreview.length > 0 && (
                  <span className="text-xs text-purple-600 font-medium">
                    {aiPreview.length} suggestion
                    {aiPreview.length !== 1 ? "s" : ""} ready
                  </span>
                )}
              </div>

              {/* AI Panel */}
              {aiPanelOpen && (
                <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-700">
                      AI Question Generator
                    </span>
                    <span className="text-xs text-purple-500 ml-1">
                      {subject
                        ? `for ${subject}${gradeLevel ? ` · ${gradeLevel}` : ""}`
                        : ""}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-purple-800 font-medium">
                      Topic or prompt
                    </Label>
                    <Input
                      data-ocid="quiz.ai.topic.input"
                      placeholder='e.g. "Photosynthesis", "World War II causes", "Quadratic equations"'
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="border-purple-200 focus-visible:ring-purple-400 bg-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-purple-800 font-medium">
                        Number of questions
                      </Label>
                      <Input
                        data-ocid="quiz.ai.count.input"
                        type="number"
                        min={1}
                        max={20}
                        value={aiCount}
                        onChange={(e) =>
                          setAiCount(
                            Math.min(20, Math.max(1, Number(e.target.value))),
                          )
                        }
                        className="border-purple-200 focus-visible:ring-purple-400 bg-white text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-purple-800 font-medium">
                        Question types
                      </Label>
                      <Select
                        value={aiTypeFilter}
                        onValueChange={(v) =>
                          setAiTypeFilter(v as AITypeFilter)
                        }
                      >
                        <SelectTrigger
                          data-ocid="quiz.ai.type.select"
                          className="border-purple-200 focus:ring-purple-400 bg-white text-sm h-9"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                          <SelectItem value="Multiple Choice only">
                            Multiple Choice only
                          </SelectItem>
                          <SelectItem value="True / False only">
                            True / False only
                          </SelectItem>
                          <SelectItem value="Short Answer only">
                            Short Answer only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    data-ocid="quiz.ai.submit.button"
                    type="button"
                    disabled={aiGenerating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 font-semibold"
                    onClick={handleAIGenerate}
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI is thinking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* AI Preview List */}
              {aiPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Suggestions
                    </span>
                    <Button
                      data-ocid="quiz.ai.add_all.button"
                      type="button"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3 gap-1"
                      onClick={addAllAIQuestions}
                    >
                      <Plus className="w-3 h-3" />
                      Add All ({aiPreview.length})
                    </Button>
                  </div>
                  {aiPreview.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white border border-purple-100 rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${qTypeBadgeClass(q.type)}`}
                            >
                              {qTypeLabel(q.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground leading-snug">
                            {q.text}
                          </p>
                          {q.type === "multiple-choice" && q.options && (
                            <ul className="text-xs text-muted-foreground space-y-0.5 pl-1">
                              {q.options.map((opt, oi) => (
                                <li
                                  key={`ai-opt-${q.id}-${String(oi)}`}
                                  className={`flex items-center gap-1 ${
                                    String(oi) === q.correctAnswer
                                      ? "text-green-700 font-medium"
                                      : ""
                                  }`}
                                >
                                  <span className="w-4 font-mono">
                                    {String.fromCharCode(65 + oi)})
                                  </span>
                                  {opt}
                                  {String(oi) === q.correctAnswer && (
                                    <span className="text-green-600 ml-1">
                                      ✓
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                          {q.type !== "multiple-choice" && (
                            <p className="text-xs text-green-700 font-medium">
                              Answer: {getCorrectAnswerDisplay(q)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 px-2.5 bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
                            onClick={() => addAIQuestion(q)}
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => dismissAIQuestion(q.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {questions.length === 0 &&
                !addingQuestion &&
                aiPreview.length === 0 && (
                  <div
                    data-ocid="quiz.questions.empty_state"
                    className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl"
                  >
                    No questions yet. Add your first question below or generate
                    with AI.
                  </div>
                )}

              {/* Question list */}
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  data-ocid={`quiz.question.item.${i + 1}`}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDrop={onDrop}
                  className="flex items-start gap-2 bg-card border border-border/60 rounded-xl p-3 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-muted-foreground">
                        Q{i + 1}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${qTypeBadgeClass(q.type)}`}
                      >
                        {qTypeLabel(q.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {q.points} pt{q.points !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1 line-clamp-2">
                      {q.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      data-ocid={`quiz.question.edit_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEditQuestion(q)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      data-ocid={`quiz.question.secondary_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => duplicateQuestion(q)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      data-ocid={`quiz.question.delete_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteQuestion(q.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Inline question form */}
              {addingQuestion && (
                <Card className="border-teacher/30 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label>Question Type</Label>
                      <Select
                        value={qForm.type}
                        onValueChange={(v) =>
                          handleQTypeChange(v as QuestionType)
                        }
                      >
                        <SelectTrigger data-ocid="quiz.question.type.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Question Text{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        data-ocid="quiz.question.textarea"
                        placeholder="Enter your question..."
                        value={qForm.text}
                        onChange={(e) =>
                          setQForm((p) => ({ ...p, text: e.target.value }))
                        }
                        rows={2}
                      />
                    </div>

                    {/* Multiple choice options */}
                    {qForm.type === "multiple-choice" && (
                      <div className="space-y-2">
                        <Label>Answer Options</Label>
                        {qForm.options.map((opt, idx) => (
                          <div
                            key={`option-entry-${String(idx)}-${opt.slice(0, 10)}`}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name="correct-option"
                              checked={qForm.correctAnswer === String(idx)}
                              onChange={() =>
                                setQForm((p) => ({
                                  ...p,
                                  correctAnswer: String(idx),
                                }))
                              }
                              className="accent-teacher"
                            />
                            <Input
                              placeholder={`Option ${idx + 1}`}
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(idx, e.target.value)
                              }
                              className="flex-1 h-8 text-sm"
                            />
                            {qForm.options.length > 2 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => removeOption(idx)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {qForm.options.length < 6 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7"
                            onClick={addOption}
                          >
                            <Plus className="w-3 h-3" />
                            Add Option
                          </Button>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Select the radio button next to the correct answer.
                        </p>
                      </div>
                    )}

                    {/* True/False */}
                    {qForm.type === "true-false" && (
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={qForm.correctAnswer === "true"}
                              onChange={() =>
                                setQForm((p) => ({
                                  ...p,
                                  correctAnswer: "true",
                                }))
                              }
                              className="accent-teacher"
                            />
                            <span className="text-sm">True</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={qForm.correctAnswer === "false"}
                              onChange={() =>
                                setQForm((p) => ({
                                  ...p,
                                  correctAnswer: "false",
                                }))
                              }
                              className="accent-teacher"
                            />
                            <span className="text-sm">False</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Short answer / fill blank */}
                    {(qForm.type === "short-answer" ||
                      qForm.type === "fill-blank") && (
                      <div className="space-y-1.5">
                        <Label>Expected Answer</Label>
                        <Input
                          data-ocid="quiz.question.answer.input"
                          placeholder="Expected answer (used for auto-grading)"
                          value={qForm.correctAnswer}
                          onChange={(e) =>
                            setQForm((p) => ({
                              ...p,
                              correctAnswer: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min={1}
                          value={qForm.points}
                          onChange={(e) =>
                            setQForm((p) => ({
                              ...p,
                              points: Math.max(1, Number(e.target.value)),
                            }))
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>
                          Explanation{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          placeholder="Why this answer?"
                          value={qForm.explanation}
                          onChange={(e) =>
                            setQForm((p) => ({
                              ...p,
                              explanation: e.target.value,
                            }))
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        data-ocid="quiz.question.save_button"
                        size="sm"
                        className="bg-teacher hover:bg-teacher/90 text-white"
                        onClick={saveQForm}
                      >
                        {editingQId ? "Update Question" : "Save Question"}
                      </Button>
                      <Button
                        data-ocid="quiz.question.cancel_button"
                        size="sm"
                        variant="outline"
                        onClick={cancelQForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!addingQuestion && (
                <Button
                  data-ocid="quiz.add.question.button"
                  variant="outline"
                  className="w-full gap-2 border-dashed border-teacher/40 text-teacher hover:bg-teacher-light"
                  onClick={openAddQuestion}
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              )}
            </div>
          )}

          {/* Step 3 - Settings */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    data-ocid="quiz.settings.timelimit.input"
                    type="number"
                    min={0}
                    placeholder="0 = no limit"
                    value={settings.timeLimit}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        timeLimit: Math.max(0, Number(e.target.value)),
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = no time limit
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Attempts Allowed</Label>
                  <Input
                    data-ocid="quiz.settings.attempts.input"
                    type="number"
                    min={0}
                    placeholder="0 = unlimited"
                    value={settings.attemptsAllowed}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        attemptsAllowed: Math.max(0, Number(e.target.value)),
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">0 = unlimited</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  data-ocid="quiz.settings.duedate.input"
                  type="date"
                  value={settings.dueDate}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pass Mark (%)</Label>
                <Input
                  data-ocid="quiz.settings.passmark.input"
                  type="number"
                  min={0}
                  max={100}
                  value={settings.passMarkPercent}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      passMarkPercent: Math.min(
                        100,
                        Math.max(0, Number(e.target.value)),
                      ),
                    }))
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Questions</Label>
                    <p className="text-xs text-muted-foreground">
                      Randomise question order for each student
                    </p>
                  </div>
                  <Switch
                    data-ocid="quiz.settings.shuffle.questions.switch"
                    checked={settings.shuffleQuestions}
                    onCheckedChange={(v) =>
                      setSettings((p) => ({ ...p, shuffleQuestions: v }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Answers</Label>
                    <p className="text-xs text-muted-foreground">
                      Randomise MC answer order
                    </p>
                  </div>
                  <Switch
                    data-ocid="quiz.settings.shuffle.answers.switch"
                    checked={settings.shuffleAnswers}
                    onCheckedChange={(v) =>
                      setSettings((p) => ({ ...p, shuffleAnswers: v }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Results to Student</Label>
                    <p className="text-xs text-muted-foreground">
                      Show score and correct answers after submission
                    </p>
                  </div>
                  <Switch
                    data-ocid="quiz.settings.show.results.switch"
                    checked={settings.showResultsToStudent}
                    onCheckedChange={(v) =>
                      setSettings((p) => ({ ...p, showResultsToStudent: v }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4 - Assign */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Existing assignments */}
              {existingAssignments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Existing Assignments
                  </Label>
                  {existingAssignments.map((ea) => (
                    <div
                      key={ea.id}
                      className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {ea.assignedTo === "all"
                            ? "All Students"
                            : ea.assignedTo === "class"
                              ? `Class: ${ea.classGroup}`
                              : `${ea.studentUsernames.length} individual(s)`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Assigned{" "}
                          {new Date(ea.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          deleteQuizAssignment(ea.id);
                          setExistingAssignments((prev) =>
                            prev.filter((x) => x.id !== ea.id),
                          );
                          toast.success("Assignment removed.");
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-sm font-semibold text-foreground">
                      Add New Assignment
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Assign To</Label>
                <div className="flex flex-col gap-2">
                  {(["all", "class", "individual"] as const).map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="assign-to"
                        checked={assignTo === opt}
                        onChange={() => setAssignTo(opt)}
                        className="accent-teacher"
                      />
                      <span className="text-sm capitalize">
                        {opt === "all"
                          ? "All Students"
                          : opt === "class"
                            ? "Class Group"
                            : "Individual Students"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {assignTo === "class" && (
                <div className="space-y-1.5">
                  <Label>Class Group Name</Label>
                  <Input
                    data-ocid="quiz.assign.class.input"
                    placeholder="e.g. 10A"
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                  />
                </div>
              )}

              {assignTo === "individual" && (
                <div className="space-y-2">
                  <Label>Select Students</Label>
                  {allStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No registered students found.
                    </p>
                  ) : (
                    <div className="border border-border rounded-xl divide-y divide-border/60 max-h-48 overflow-y-auto">
                      {allStudents.map((s) => (
                        <label
                          key={s.username}
                          htmlFor={`student-${s.username}`}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30"
                        >
                          <Checkbox
                            id={`student-${s.username}`}
                            checked={selectedStudents.includes(
                              s.username.toLowerCase(),
                            )}
                            onCheckedChange={(checked) => {
                              const lower = s.username.toLowerCase();
                              setSelectedStudents((prev) =>
                                checked
                                  ? [...prev, lower]
                                  : prev.filter((x) => x !== lower),
                              );
                            }}
                          />
                          <span className="text-sm">
                            {s.name}{" "}
                            <span className="text-muted-foreground">
                              (@{s.username})
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>
                  Scheduled Release{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    data-ocid="quiz.assign.release.date.input"
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                  />
                  <Input
                    data-ocid="quiz.assign.release.time.input"
                    type="time"
                    value={releaseTime}
                    onChange={(e) => setReleaseTime(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave blank to release immediately.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 flex-shrink-0">
          <Button
            data-ocid="quiz.builder.prev.button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="gap-1.5"
          >
            <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
            Back
          </Button>
          <span className="text-xs text-muted-foreground">{step} of 4</span>
          {step < 4 ? (
            <Button
              data-ocid="quiz.builder.next.button"
              onClick={nextStep}
              className="bg-teacher hover:bg-teacher/90 text-white gap-1.5"
            >
              Next
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Button>
          ) : (
            <Button
              data-ocid="quiz.builder.assign.button"
              onClick={handleSaveAndAssign}
              className="bg-teacher hover:bg-teacher/90 text-white"
            >
              Save &amp; Assign
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
