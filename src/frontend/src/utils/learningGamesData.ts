export interface MCQQuestion {
  question: string;
  options: [string, string, string, string];
  answer: number;
  explanation?: string;
}

export interface TrueFalseQuestion {
  statement: string;
  answer: boolean;
  explanation?: string;
}

export interface ScrambleWord {
  word: string;
  hint: string;
}

export interface MemoryPair {
  term: string;
  definition: string;
}

export interface SubjectGameData {
  mcq: MCQQuestion[];
  trueOrFalse: TrueFalseQuestion[];
  wordScramble: ScrambleWord[];
  memoryPairs: MemoryPair[];
}

export interface SubjectCategory {
  id: string;
  name: string;
  emoji: string;
  subjects: string[];
}

export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  {
    id: "core",
    name: "Core Academic",
    emoji: "🧠",
    subjects: [
      "English / Primary Language",
      "Mathematics",
      "Environmental Studies (EVS)",
      "General Science",
      "Social Studies",
      "English Literature",
      "Algebra",
      "Geometry",
      "Physics",
      "Chemistry",
      "Biology",
      "History",
      "Geography",
      "Civics",
      "Economics",
    ],
  },
  {
    id: "tech",
    name: "Technology & Digital Skills",
    emoji: "💻",
    subjects: [
      "Computer Basics",
      "Typing Skills",
      "Coding",
      "Robotics",
      "Internet Safety",
      "Office Tools",
      "Web Design Basics",
      "AI Basics",
    ],
  },
  {
    id: "arts",
    name: "Arts & Creativity",
    emoji: "🎨",
    subjects: [
      "Drawing",
      "Music",
      "Drama / Theatre",
      "Design Thinking",
      "Digital Art",
      "Animation",
      "Creative Writing",
    ],
  },
  {
    id: "languages",
    name: "Languages",
    emoji: "🌍",
    subjects: ["Hindi", "French", "Spanish", "German", "Sanskrit"],
  },
  {
    id: "lifeskills",
    name: "Life Skills & Personal Development",
    emoji: "🧬",
    subjects: [
      "Communication Skills",
      "Critical Thinking",
      "Problem Solving",
      "Financial Literacy",
      "Time Management",
      "Mindfulness & Well-being",
    ],
  },
  {
    id: "environment",
    name: "Environmental & Social Awareness",
    emoji: "🌱",
    subjects: [
      "Environmental Studies",
      "Sustainability",
      "Climate Change Basics",
      "Global Citizenship",
    ],
  },
  {
    id: "practical",
    name: "Practical & Applied Subjects",
    emoji: "🔬",
    subjects: [
      "STEM Projects",
      "Astronomy for Kids",
      "Home Science",
      "Gardening",
      "Simple Engineering Concepts",
    ],
  },
  {
    id: "modern",
    name: "Modern & Enrichment Subjects",
    emoji: "🎮",
    subjects: [
      "Game Design",
      "Media Literacy",
      "Entrepreneurship for Kids",
      "Debate & Speech",
      "Coding Challenges",
    ],
  },
];

const fallbackData: SubjectGameData = {
  mcq: [
    {
      question: "Which of these is a primary color?",
      options: ["Green", "Orange", "Red", "Purple"],
      answer: 2,
    },
    {
      question: "How many hours are in a day?",
      options: ["12", "24", "48", "36"],
      answer: 1,
    },
    {
      question: "What is the boiling point of water in Celsius?",
      options: ["50°C", "75°C", "100°C", "120°C"],
      answer: 2,
    },
    {
      question: "Which shape has 4 equal sides?",
      options: ["Rectangle", "Triangle", "Square", "Pentagon"],
      answer: 2,
    },
    {
      question: "What is 7 x 8?",
      options: ["54", "56", "58", "60"],
      answer: 1,
    },
  ],
  trueOrFalse: [
    { statement: "The sun rises in the East.", answer: true },
    {
      statement: "The Earth is flat.",
      answer: false,
      explanation: "The Earth is a sphere (oblate spheroid).",
    },
    { statement: "There are 60 seconds in a minute.", answer: true },
    {
      statement: "Fish are mammals.",
      answer: false,
      explanation: "Fish are cold-blooded vertebrates, not mammals.",
    },
    { statement: "Oxygen is needed for breathing.", answer: true },
  ],
  wordScramble: [
    { word: "SCHOOL", hint: "A place where you learn" },
    { word: "PENCIL", hint: "Used for writing" },
    { word: "FRIEND", hint: "Someone you like to spend time with" },
    { word: "GARDEN", hint: "A place where plants grow" },
    { word: "BRIDGE", hint: "You cross this over water" },
  ],
  memoryPairs: [
    { term: "Sun", definition: "The star at the center of our solar system" },
    { term: "Moon", definition: "Earth's natural satellite" },
    { term: "Ocean", definition: "Large body of salt water" },
    { term: "Volcano", definition: "Mountain that can erupt lava" },
    { term: "Desert", definition: "Dry land with very little rainfall" },
    { term: "River", definition: "Flowing body of fresh water" },
    { term: "Forest", definition: "Large area covered with trees" },
    { term: "Island", definition: "Land surrounded by water" },
  ],
};

export const GAME_QUESTIONS: Record<string, SubjectGameData> = {
  Mathematics: {
    mcq: [
      {
        question: "What is 15 × 4?",
        options: ["50", "55", "60", "65"],
        answer: 2,
      },
      {
        question: "What is the square root of 144?",
        options: ["10", "11", "12", "13"],
        answer: 2,
        explanation: "12 × 12 = 144",
      },
      {
        question: "What is 3/4 as a decimal?",
        options: ["0.25", "0.50", "0.75", "1.00"],
        answer: 2,
      },
      {
        question: "What is the perimeter of a square with side 5cm?",
        options: ["10cm", "15cm", "20cm", "25cm"],
        answer: 2,
      },
      {
        question: "What is 25% of 200?",
        options: ["25", "50", "75", "100"],
        answer: 1,
      },
      {
        question: "If x + 7 = 15, what is x?",
        options: ["6", "7", "8", "9"],
        answer: 2,
      },
      {
        question: "What is 2³?",
        options: ["4", "6", "8", "9"],
        answer: 2,
        explanation: "2³ = 2 × 2 × 2 = 8",
      },
      {
        question: "What is the area of a rectangle 6cm × 4cm?",
        options: ["20 cm²", "24 cm²", "28 cm²", "32 cm²"],
        answer: 1,
      },
      {
        question: "What comes next: 2, 4, 8, 16, __?",
        options: ["24", "28", "30", "32"],
        answer: 3,
      },
      {
        question: "What is -3 + 7?",
        options: ["4", "-4", "10", "-10"],
        answer: 0,
      },
    ],
    trueOrFalse: [
      {
        statement: "A prime number has exactly two factors.",
        answer: true,
        explanation: "1 and itself.",
      },
      { statement: "0 is an even number.", answer: true },
      {
        statement: "A triangle can have two right angles.",
        answer: false,
        explanation:
          "Angles in a triangle sum to 180°, so only one can be 90°.",
      },
      { statement: "The sum of angles in a triangle is 180°.", answer: true },
      {
        statement: "Every square is a rectangle.",
        answer: true,
        explanation: "A square has all properties of a rectangle.",
      },
      {
        statement: "Pi (π) is exactly 3.14.",
        answer: false,
        explanation: "Pi is approximately 3.14159..., it's irrational.",
      },
      { statement: "Negative numbers are less than zero.", answer: true },
      {
        statement: "8 is a prime number.",
        answer: false,
        explanation: "8 = 2 × 4, so it has factors other than 1 and itself.",
      },
    ],
    wordScramble: [
      { word: "ADDITION", hint: "Adding numbers together" },
      { word: "FRACTION", hint: "Part of a whole number" },
      { word: "POLYGON", hint: "A closed shape with straight sides" },
      { word: "ALGEBRA", hint: "Math with letters representing numbers" },
      { word: "DECIMAL", hint: "Numbers with a point (like 3.14)" },
      { word: "MULTIPLY", hint: "Repeated addition" },
      { word: "TRIANGLE", hint: "3-sided polygon" },
      { word: "DIAMETER", hint: "Width through center of a circle" },
    ],
    memoryPairs: [
      { term: "Square", definition: "All 4 sides equal, all angles 90°" },
      { term: "Prime Number", definition: "Divisible only by 1 and itself" },
      { term: "Perimeter", definition: "Total distance around a shape" },
      { term: "Area", definition: "Space inside a 2D shape" },
      { term: "Fraction", definition: "Part of a whole (e.g. 1/2)" },
      { term: "Percentage", definition: "Number out of 100" },
      { term: "Equation", definition: "Statement showing two equal values" },
      { term: "Radius", definition: "Distance from center to edge of circle" },
    ],
  },

  "General Science": {
    mcq: [
      {
        question: "What gas do plants absorb during photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        answer: 2,
      },
      {
        question: "What is the closest planet to the Sun?",
        options: ["Venus", "Earth", "Mars", "Mercury"],
        answer: 3,
      },
      {
        question: "What state of matter has no fixed shape or volume?",
        options: ["Solid", "Liquid", "Gas", "Plasma"],
        answer: 2,
      },
      {
        question: "Which organ pumps blood in the human body?",
        options: ["Lungs", "Liver", "Heart", "Kidney"],
        answer: 2,
      },
      {
        question: "What force keeps us on the ground?",
        options: ["Magnetism", "Friction", "Gravity", "Tension"],
        answer: 2,
      },
      {
        question: "What is H₂O?",
        options: ["Carbon dioxide", "Oxygen", "Water", "Hydrogen gas"],
        answer: 2,
      },
      {
        question: "How many bones does an adult human have?",
        options: ["186", "206", "226", "246"],
        answer: 1,
      },
      {
        question: "Which is the largest organ of the human body?",
        options: ["Heart", "Liver", "Brain", "Skin"],
        answer: 3,
      },
      {
        question: "What energy does the Sun provide?",
        options: ["Chemical", "Mechanical", "Solar/Light", "Nuclear"],
        answer: 2,
      },
      {
        question: "What is the process by which water turns to vapor?",
        options: ["Condensation", "Evaporation", "Precipitation", "Filtration"],
        answer: 1,
      },
    ],
    trueOrFalse: [
      {
        statement: "Plants make their own food using sunlight.",
        answer: true,
        explanation: "This process is called photosynthesis.",
      },
      {
        statement: "Sound can travel through a vacuum.",
        answer: false,
        explanation: "Sound needs a medium (like air) to travel.",
      },
      {
        statement: "The Moon produces its own light.",
        answer: false,
        explanation: "The Moon reflects sunlight.",
      },
      { statement: "Water expands when it freezes.", answer: true },
      {
        statement: "All metals are magnetic.",
        answer: false,
        explanation: "Only iron, nickel, and cobalt are naturally magnetic.",
      },
      { statement: "The human body is made mostly of water.", answer: true },
      { statement: "Photosynthesis releases oxygen.", answer: true },
      { statement: "Bacteria are visible to the naked eye.", answer: false },
    ],
    wordScramble: [
      { word: "GRAVITY", hint: "Force that pulls things down" },
      { word: "MAGNET", hint: "It attracts iron objects" },
      { word: "OXYGEN", hint: "Gas we breathe" },
      { word: "NUCLEUS", hint: "Center of an atom or cell" },
      { word: "ENERGY", hint: "Ability to do work" },
      { word: "CIRCUIT", hint: "Path for electricity to flow" },
      { word: "VOLCANO", hint: "Mountain that erupts lava" },
      { word: "EROSION", hint: "Wearing away of land by water or wind" },
    ],
    memoryPairs: [
      {
        term: "Photosynthesis",
        definition: "Plants making food from sunlight",
      },
      { term: "Gravity", definition: "Force of attraction between masses" },
      { term: "Evaporation", definition: "Liquid turning into gas" },
      { term: "Condensation", definition: "Gas turning into liquid" },
      { term: "Friction", definition: "Resistance between two surfaces" },
      {
        term: "Ecosystem",
        definition: "Community of living and non-living things",
      },
      { term: "Atom", definition: "Smallest unit of an element" },
      { term: "Orbit", definition: "Path of a planet around a star" },
    ],
  },

  Biology: {
    mcq: [
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"],
        answer: 2,
        explanation: "Mitochondria produce ATP energy.",
      },
      {
        question: "What is the basic unit of life?",
        options: ["Tissue", "Organ", "Cell", "Atom"],
        answer: 2,
      },
      {
        question: "Which blood type is the universal donor?",
        options: ["A", "B", "AB", "O"],
        answer: 3,
      },
      {
        question: "How many chambers does the human heart have?",
        options: ["2", "3", "4", "5"],
        answer: 2,
      },
      {
        question: "What carries oxygen in red blood cells?",
        options: ["Insulin", "Hemoglobin", "Plasma", "Keratin"],
        answer: 1,
      },
      {
        question: "What is the process of cell division called?",
        options: ["Osmosis", "Diffusion", "Mitosis", "Digestion"],
        answer: 2,
      },
      {
        question: "Which organ produces insulin?",
        options: ["Liver", "Kidney", "Heart", "Pancreas"],
        answer: 3,
      },
      {
        question: "DNA stands for?",
        options: [
          "Deoxyribonucleic Acid",
          "Dynamic Nucleic Acid",
          "Double Nucleus Amino",
          "Deoxyribose Nitrogen Acid",
        ],
        answer: 0,
      },
      {
        question: "What do herbivores eat?",
        options: [
          "Only meat",
          "Only plants",
          "Both plants and meat",
          "Only insects",
        ],
        answer: 1,
      },
      {
        question: "What is the scientific study of plants called?",
        options: ["Zoology", "Botany", "Ecology", "Anatomy"],
        answer: 1,
      },
    ],
    trueOrFalse: [
      {
        statement: "Viruses are living organisms.",
        answer: false,
        explanation:
          "Viruses are not considered fully alive as they can't reproduce on their own.",
      },
      {
        statement: "Humans share about 98% DNA with chimpanzees.",
        answer: true,
      },
      {
        statement: "All bacteria are harmful.",
        answer: false,
        explanation: "Many bacteria are helpful, like gut bacteria.",
      },
      { statement: "The heart pumps blood to the lungs.", answer: true },
      {
        statement: "Plants breathe in oxygen and release CO₂.",
        answer: false,
        explanation:
          "During photosynthesis, plants absorb CO₂ and release oxygen.",
      },
      { statement: "Bones are living tissue.", answer: true },
      { statement: "The human brain is about 75% water.", answer: true },
      {
        statement: "All animals have a backbone.",
        answer: false,
        explanation: "Invertebrates have no backbone.",
      },
    ],
    wordScramble: [
      { word: "HABITAT", hint: "Natural home of an animal" },
      { word: "PROTEIN", hint: "Building block of the body" },
      { word: "SPECIES", hint: "Group of organisms that can breed" },
      { word: "MAMMAL", hint: "Warm-blooded animal that nurses young" },
      { word: "CHLOROPHYLL", hint: "Green pigment in plants" },
      { word: "SKELETON", hint: "Framework of bones in the body" },
      { word: "DIGESTION", hint: "Breaking down food in the body" },
      { word: "MUTATION", hint: "Change in DNA" },
    ],
    memoryPairs: [
      { term: "Mitochondria", definition: "Powerhouse of the cell" },
      { term: "Nucleus", definition: "Control center of the cell" },
      { term: "Photosynthesis", definition: "Making food from sunlight" },
      { term: "Osmosis", definition: "Movement of water across a membrane" },
      { term: "Chromosome", definition: "Carries genetic information" },
      { term: "Enzyme", definition: "Biological catalyst" },
      { term: "Ecosystem", definition: "All organisms in an environment" },
      { term: "Evolution", definition: "Change in species over time" },
    ],
  },

  Chemistry: {
    mcq: [
      {
        question: "What is the chemical symbol for Gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        answer: 2,
        explanation: "Au comes from Latin 'Aurum'.",
      },
      {
        question: "What is the atomic number of Carbon?",
        options: ["4", "6", "8", "12"],
        answer: 1,
      },
      {
        question: "What is the most abundant gas in Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
        answer: 2,
      },
      {
        question: "What is the pH of pure water?",
        options: ["5", "6", "7", "8"],
        answer: 2,
      },
      {
        question:
          "Which element is liquid at room temperature (besides mercury)?",
        options: ["Chlorine", "Bromine", "Fluorine", "Iodine"],
        answer: 1,
      },
      {
        question: "What is the formula for table salt?",
        options: ["KCl", "NaCl", "MgCl₂", "CaCl₂"],
        answer: 1,
      },
      {
        question: "What does a catalyst do in a reaction?",
        options: ["Slows it down", "Stops it", "Speeds it up", "Reverses it"],
        answer: 2,
      },
      {
        question: "How many elements are in the periodic table?",
        options: ["108", "112", "118", "124"],
        answer: 2,
      },
      {
        question: "What is the lightest element?",
        options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
        answer: 1,
      },
      {
        question: "Acids have a pH value that is?",
        options: ["Greater than 7", "Equal to 7", "Less than 7", "Equal to 14"],
        answer: 2,
      },
    ],
    trueOrFalse: [
      {
        statement: "Water is a compound.",
        answer: true,
        explanation: "H₂O has two elements: hydrogen and oxygen.",
      },
      {
        statement: "All metals are solids at room temperature.",
        answer: false,
        explanation: "Mercury is a liquid metal at room temperature.",
      },
      { statement: "Burning is a chemical change.", answer: true },
      {
        statement: "Salt dissolving in water is a chemical change.",
        answer: false,
        explanation: "It's a physical change because salt can be recovered.",
      },
      { statement: "Diamond is made of carbon.", answer: true },
      {
        statement: "Oxygen is the most abundant element in Earth's atmosphere.",
        answer: false,
        explanation: "Nitrogen (78%) is most abundant.",
      },
      { statement: "Acids turn blue litmus paper red.", answer: true },
      {
        statement: "Noble gases are very reactive.",
        answer: false,
        explanation: "Noble gases are very stable and rarely react.",
      },
    ],
    wordScramble: [
      { word: "ELEMENT", hint: "Pure substance that can't be broken down" },
      { word: "MOLECULE", hint: "Two or more atoms bonded together" },
      { word: "REACTION", hint: "Process that changes substances" },
      { word: "PERIODIC", hint: "Table that organizes elements" },
      { word: "SOLVENT", hint: "Liquid that dissolves substances" },
      { word: "ISOTOPE", hint: "Same element, different neutron count" },
      { word: "VALENCE", hint: "Outer electrons of an atom" },
      { word: "POLYMER", hint: "Long chain of repeating molecules" },
    ],
    memoryPairs: [
      { term: "H₂O", definition: "Water" },
      { term: "CO₂", definition: "Carbon dioxide" },
      { term: "NaCl", definition: "Table salt" },
      { term: "O₂", definition: "Oxygen gas" },
      { term: "Acid", definition: "pH below 7" },
      { term: "Base", definition: "pH above 7" },
      { term: "Neutron", definition: "Neutral particle in nucleus" },
      { term: "Electron", definition: "Negative particle orbiting nucleus" },
    ],
  },

  Physics: {
    mcq: [
      {
        question: "What is the unit of force?",
        options: ["Watt", "Joule", "Newton", "Pascal"],
        answer: 2,
      },
      {
        question: "What is the speed of light in vacuum?",
        options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁵ m/s"],
        answer: 1,
      },
      {
        question:
          "Which law says every action has an equal and opposite reaction?",
        options: ["First Law", "Second Law", "Third Law", "Law of Gravity"],
        answer: 2,
      },
      {
        question: "What is the unit of electrical resistance?",
        options: ["Volt", "Ampere", "Watt", "Ohm"],
        answer: 3,
      },
      {
        question: "Which type of wave does not require a medium?",
        options: ["Sound", "Water waves", "Electromagnetic", "Seismic"],
        answer: 2,
      },
      {
        question: "What is kinetic energy?",
        options: [
          "Energy of position",
          "Energy of motion",
          "Chemical energy",
          "Thermal energy",
        ],
        answer: 1,
      },
      {
        question: "What is the formula for speed?",
        options: [
          "Speed = Distance × Time",
          "Speed = Time / Distance",
          "Speed = Distance / Time",
          "Speed = Mass × Velocity",
        ],
        answer: 2,
      },
      {
        question: "Refraction occurs when light?",
        options: [
          "Bounces back",
          "Is absorbed",
          "Changes medium",
          "Disappears",
        ],
        answer: 2,
      },
      {
        question: "What is the SI unit of mass?",
        options: ["Pound", "Gram", "Kilogram", "Newton"],
        answer: 2,
      },
      {
        question: "Which color of light has the highest frequency?",
        options: ["Red", "Orange", "Green", "Violet"],
        answer: 3,
      },
    ],
    trueOrFalse: [
      { statement: "Light travels faster than sound.", answer: true },
      {
        statement: "Objects in space have no mass.",
        answer: false,
        explanation:
          "Objects have mass everywhere; they are just weightless in orbit.",
      },
      {
        statement: "Gravity is stronger on the Moon than on Earth.",
        answer: false,
        explanation: "Moon's gravity is about 1/6 of Earth's.",
      },
      {
        statement: "Electric current flows from positive to negative terminal.",
        answer: true,
        explanation: "Conventional current direction.",
      },
      { statement: "Friction always opposes motion.", answer: true },
      {
        statement: "Sound travels faster in air than in water.",
        answer: false,
        explanation: "Sound is faster in denser media like water.",
      },
      {
        statement: "Energy can be created from nothing.",
        answer: false,
        explanation: "Law of conservation of energy.",
      },
      { statement: "A mirror reflects light.", answer: true },
    ],
    wordScramble: [
      { word: "FRICTION", hint: "Resistance to motion between surfaces" },
      { word: "VELOCITY", hint: "Speed in a given direction" },
      { word: "MOMENTUM", hint: "Mass times velocity" },
      { word: "WAVELENGTH", hint: "Distance between wave peaks" },
      { word: "GRAVITY", hint: "Force pulling masses together" },
      { word: "REFRACTION", hint: "Bending of light" },
      { word: "CONDUCTOR", hint: "Material that allows electricity to flow" },
      { word: "PRESSURE", hint: "Force per unit area" },
    ],
    memoryPairs: [
      { term: "Newton", definition: "Unit of force" },
      { term: "Joule", definition: "Unit of energy" },
      { term: "Watt", definition: "Unit of power" },
      { term: "Ohm", definition: "Unit of resistance" },
      { term: "Amplitude", definition: "Height of a wave" },
      { term: "Frequency", definition: "Number of waves per second" },
      { term: "Inertia", definition: "Resistance to change in motion" },
      { term: "Density", definition: "Mass per unit volume" },
    ],
  },

  History: {
    mcq: [
      {
        question: "In what year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        answer: 2,
      },
      {
        question: "Who was the first President of the United States?",
        options: [
          "Abraham Lincoln",
          "Thomas Jefferson",
          "George Washington",
          "John Adams",
        ],
        answer: 2,
      },
      {
        question: "Which ancient wonder of the world still exists?",
        options: [
          "Hanging Gardens of Babylon",
          "The Great Pyramid of Giza",
          "The Colossus of Rhodes",
          "Lighthouse of Alexandria",
        ],
        answer: 1,
      },
      {
        question: "Who invented the telephone?",
        options: [
          "Thomas Edison",
          "Nikola Tesla",
          "Alexander Graham Bell",
          "Guglielmo Marconi",
        ],
        answer: 2,
      },
      {
        question: "Which empire built the Colosseum?",
        options: ["Greek", "Egyptian", "Ottoman", "Roman"],
        answer: 3,
      },
      {
        question: "In which country did the French Revolution take place?",
        options: ["England", "Germany", "France", "Italy"],
        answer: 2,
      },
      {
        question: "Who led the Indian independence movement?",
        options: [
          "Jawaharlal Nehru",
          "Bhagat Singh",
          "Mahatma Gandhi",
          "Subhas Chandra Bose",
        ],
        answer: 2,
      },
      {
        question: "When was the Berlin Wall built?",
        options: ["1951", "1956", "1961", "1966"],
        answer: 2,
      },
      {
        question: "Which civilization built Machu Picchu?",
        options: ["Aztec", "Maya", "Inca", "Olmec"],
        answer: 2,
      },
      {
        question: "What was the name of the ship that sank in 1912?",
        options: ["Olympic", "Britannic", "Titanic", "Lusitania"],
        answer: 2,
      },
    ],
    trueOrFalse: [
      {
        statement:
          "The Great Wall of China was built to keep out Mongol invaders.",
        answer: true,
      },
      {
        statement: "Cleopatra was Greek by ancestry.",
        answer: true,
        explanation: "She was Macedonian Greek but ruled Egypt.",
      },
      {
        statement: "Napoleon Bonaparte was born in France.",
        answer: false,
        explanation: "He was born in Corsica.",
      },
      {
        statement: "India gained independence from Britain in 1947.",
        answer: true,
      },
      {
        statement: "The first human on the Moon was Neil Armstrong.",
        answer: true,
      },
      { statement: "World War I started in 1914.", answer: true },
      {
        statement: "The Renaissance began in Germany.",
        answer: false,
        explanation: "The Renaissance began in Italy.",
      },
      {
        statement: "Christopher Columbus was born in Spain.",
        answer: false,
        explanation: "He was born in Genoa, Italy.",
      },
    ],
    wordScramble: [
      { word: "EMPEROR", hint: "Ruler of an empire" },
      { word: "PYRAMID", hint: "Ancient Egyptian monument" },
      { word: "REVOLUTION", hint: "Dramatic overthrow of a system" },
      { word: "CONQUEST", hint: "Taking control by force" },
      { word: "DYNASTY", hint: "Ruling family across generations" },
      { word: "REPUBLIC", hint: "Government where people elect leaders" },
      { word: "MEDIEVAL", hint: "Relating to the Middle Ages" },
      { word: "MONARCHY", hint: "Government with a king or queen" },
    ],
    memoryPairs: [
      { term: "1776", definition: "American Declaration of Independence" },
      { term: "1789", definition: "French Revolution began" },
      { term: "1945", definition: "End of World War II" },
      { term: "1947", definition: "Indian Independence" },
      { term: "1969", definition: "Moon landing" },
      { term: "1989", definition: "Fall of the Berlin Wall" },
      {
        term: "Renaissance",
        definition: "Rebirth of art and learning in Europe",
      },
      {
        term: "Industrial Revolution",
        definition: "Shift to machine-based manufacturing",
      },
    ],
  },

  Geography: {
    mcq: [
      {
        question: "What is the largest continent by area?",
        options: ["Africa", "North America", "Asia", "Europe"],
        answer: 2,
      },
      {
        question: "Which is the longest river in the world?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        answer: 1,
      },
      {
        question: "How many continents are there on Earth?",
        options: ["5", "6", "7", "8"],
        answer: 2,
      },
      {
        question: "Which country has the largest population?",
        options: ["USA", "India", "China", "Indonesia"],
        answer: 1,
        explanation: "India overtook China in 2023.",
      },
      {
        question: "Where is the Sahara Desert located?",
        options: ["Asia", "South America", "Australia", "Africa"],
        answer: 3,
      },
      {
        question: "What is the capital of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        answer: 2,
      },
      {
        question: "Which ocean is the largest?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        answer: 3,
      },
      {
        question:
          "What imaginary line divides Earth into Northern and Southern hemispheres?",
        options: [
          "Prime Meridian",
          "Equator",
          "Tropic of Cancer",
          "Arctic Circle",
        ],
        answer: 1,
      },
      {
        question: "Which country is both a continent and a country?",
        options: ["Brazil", "Russia", "Australia", "Greenland"],
        answer: 2,
      },
      {
        question: "Mount Everest is located in which mountain range?",
        options: ["Alps", "Andes", "Rockies", "Himalayas"],
        answer: 3,
      },
    ],
    trueOrFalse: [
      { statement: "The Amazon River flows through Brazil.", answer: true },
      {
        statement: "Africa is the smallest continent.",
        answer: false,
        explanation: "Australia is the smallest continent.",
      },
      {
        statement: "Japan is an archipelago (group of islands).",
        answer: true,
      },
      {
        statement: "The North Pole is a continent.",
        answer: false,
        explanation:
          "The North Pole is ocean covered in ice. Antarctica is the continent at the South Pole.",
      },
      {
        statement: "Russia is the largest country in the world by area.",
        answer: true,
      },
      {
        statement: "The Eiffel Tower is in London.",
        answer: false,
        explanation: "It's in Paris, France.",
      },
      {
        statement: "The Great Barrier Reef is off the coast of Australia.",
        answer: true,
      },
      {
        statement:
          "The Amazon Rainforest produces about 20% of the world's oxygen.",
        answer: true,
      },
    ],
    wordScramble: [
      { word: "CONTINENT", hint: "One of 7 large landmasses on Earth" },
      { word: "LATITUDE", hint: "Distance north or south of Equator" },
      { word: "MONSOON", hint: "Seasonal wind that brings heavy rain" },
      { word: "GLACIER", hint: "Slow-moving river of ice" },
      { word: "PENINSULA", hint: "Land surrounded by water on 3 sides" },
      { word: "PLATEAU", hint: "Flat-topped elevated land" },
      { word: "ESTUARY", hint: "Where river meets the sea" },
      { word: "CLIMATE", hint: "Typical weather in a region" },
    ],
    memoryPairs: [
      { term: "Equator", definition: "0° latitude line around Earth's middle" },
      {
        term: "Prime Meridian",
        definition: "0° longitude, passes through Greenwich",
      },
      { term: "Monsoon", definition: "Seasonal wind bringing heavy rainfall" },
      { term: "Tundra", definition: "Cold, treeless biome" },
      { term: "Delta", definition: "Landform at a river's mouth" },
      { term: "Tributary", definition: "River that flows into a larger river" },
      { term: "Archipelago", definition: "Group or chain of islands" },
      { term: "Atmosphere", definition: "Layers of gas surrounding Earth" },
    ],
  },

  "English / Primary Language": {
    mcq: [
      {
        question: "What is a noun?",
        options: [
          "An action word",
          "A describing word",
          "A person, place, or thing",
          "A joining word",
        ],
        answer: 2,
      },
      {
        question: "Which word is a synonym for 'happy'?",
        options: ["Sad", "Angry", "Joyful", "Tired"],
        answer: 2,
      },
      {
        question: "What punctuation ends a question?",
        options: ["Full stop", "Question mark", "Exclamation mark", "Comma"],
        answer: 1,
      },
      {
        question: "What is the plural of 'child'?",
        options: ["Childs", "Childes", "Children", "Childrens"],
        answer: 2,
      },
      {
        question: "Which sentence is correct?",
        options: [
          "She don't like apples",
          "She doesn't likes apples",
          "She doesn't like apples",
          "She not like apples",
        ],
        answer: 2,
      },
      {
        question: "What is an antonym of 'ancient'?",
        options: ["Old", "Modern", "Historic", "Past"],
        answer: 1,
      },
      {
        question: "Which is a compound word?",
        options: ["Beautiful", "Sunshine", "Running", "Quickly"],
        answer: 1,
      },
      {
        question: "What does the prefix 'un-' mean?",
        options: ["Again", "Before", "Not/opposite", "After"],
        answer: 2,
      },
      {
        question: "What type of word is 'quickly'?",
        options: ["Noun", "Verb", "Adjective", "Adverb"],
        answer: 3,
      },
      {
        question: "Which genre tells a made-up story?",
        options: ["Biography", "Fiction", "News article", "Dictionary"],
        answer: 1,
      },
    ],
    trueOrFalse: [
      { statement: "A verb is an action or state word.", answer: true },
      {
        statement: "'Their' and 'there' are spelled the same way.",
        answer: false,
      },
      { statement: "A sentence must have a subject and a verb.", answer: true },
      { statement: "An adjective describes a noun.", answer: true },
      {
        statement: "'Quickly' is an adjective.",
        answer: false,
        explanation: "'Quickly' is an adverb (it describes the verb).",
      },
      { statement: "Every paragraph should have a main idea.", answer: true },
      {
        statement: "A metaphor uses 'like' or 'as' to compare.",
        answer: false,
        explanation:
          "A simile uses 'like' or 'as'. A metaphor says something IS something else.",
      },
      { statement: "Proper nouns begin with a capital letter.", answer: true },
    ],
    wordScramble: [
      { word: "SYNONYM", hint: "Word with the same meaning" },
      { word: "GRAMMAR", hint: "Rules of a language" },
      { word: "VOWEL", hint: "Letters: A, E, I, O, U" },
      {
        word: "METAPHOR",
        hint: "Comparing two unlike things without using like/as",
      },
      { word: "NARRATIVE", hint: "A story told by a narrator" },
      { word: "ALPHABET", hint: "Set of letters in a language" },
      { word: "ADJECTIVE", hint: "Word that describes a noun" },
      { word: "PRONOUN", hint: "Word that replaces a noun (he, she, it)" },
    ],
    memoryPairs: [
      { term: "Noun", definition: "Person, place, or thing" },
      { term: "Verb", definition: "Action or state word" },
      { term: "Adjective", definition: "Describes a noun" },
      { term: "Adverb", definition: "Describes a verb, adjective, or adverb" },
      { term: "Simile", definition: "Comparison using 'like' or 'as'" },
      { term: "Metaphor", definition: "Says something IS something else" },
      { term: "Synonym", definition: "Words with similar meanings" },
      { term: "Antonym", definition: "Words with opposite meanings" },
    ],
  },

  "Computer Basics": {
    mcq: [
      {
        question: "What does CPU stand for?",
        options: [
          "Central Power Unit",
          "Central Processing Unit",
          "Computer Processing Unit",
          "Core Processing Unit",
        ],
        answer: 1,
      },
      {
        question: "Which device is used to input data into a computer?",
        options: ["Monitor", "Printer", "Keyboard", "Speaker"],
        answer: 2,
      },
      {
        question: "What does 'RAM' stand for?",
        options: [
          "Random Access Memory",
          "Read Any Memory",
          "Rapid Access Module",
          "Remote Access Memory",
        ],
        answer: 0,
      },
      {
        question: "What is the brain of the computer?",
        options: ["Hard Drive", "RAM", "CPU", "GPU"],
        answer: 2,
      },
      {
        question: "Which of these is an operating system?",
        options: ["Microsoft Word", "Google Chrome", "Windows", "Facebook"],
        answer: 2,
      },
      {
        question: "What is a file extension for an image?",
        options: [".doc", ".mp3", ".jpg", ".exe"],
        answer: 2,
      },
      {
        question: "What does 'www' stand for?",
        options: [
          "World Wide Website",
          "World Wide Web",
          "Wide World Web",
          "Web World Wide",
        ],
        answer: 1,
      },
      {
        question: "Which key is used to delete characters before the cursor?",
        options: ["Delete", "Backspace", "Escape", "End"],
        answer: 1,
      },
      {
        question: "What is the shortcut to copy text?",
        options: ["Ctrl+X", "Ctrl+V", "Ctrl+C", "Ctrl+Z"],
        answer: 2,
      },
      {
        question: "Which of these is a storage device?",
        options: ["Monitor", "USB Drive", "Mouse", "Keyboard"],
        answer: 1,
      },
    ],
    trueOrFalse: [
      {
        statement: "RAM is permanent storage.",
        answer: false,
        explanation:
          "RAM is temporary; it loses data when power is off. Hard drives are permanent.",
      },
      { statement: "A monitor is an output device.", answer: true },
      {
        statement: "The internet and the World Wide Web are the same thing.",
        answer: false,
        explanation:
          "The internet is the network; the Web is a service on the internet.",
      },
      { statement: "Ctrl+Z is the undo shortcut.", answer: true },
      {
        statement: "A router is used to connect a computer to the internet.",
        answer: true,
      },
      {
        statement: "1 gigabyte = 1000 kilobytes.",
        answer: false,
        explanation: "1 GB = 1,024 MB = 1,048,576 KB.",
      },
      { statement: "An email can carry attachments.", answer: true },
      {
        statement: "Software is the physical part of a computer.",
        answer: false,
        explanation: "Hardware is physical; software is programs and data.",
      },
    ],
    wordScramble: [
      { word: "BROWSER", hint: "Software to access websites" },
      { word: "HARDWARE", hint: "Physical parts of a computer" },
      { word: "SOFTWARE", hint: "Programs and apps" },
      { word: "NETWORK", hint: "Computers connected together" },
      { word: "KEYBOARD", hint: "Input device for typing" },
      { word: "PASSWORD", hint: "Secret code to log in" },
      { word: "DOWNLOAD", hint: "Getting data from the internet" },
      { word: "DESKTOP", hint: "Main screen of a computer" },
    ],
    memoryPairs: [
      {
        term: "CPU",
        definition: "Central Processing Unit — brain of the computer",
      },
      { term: "RAM", definition: "Temporary working memory" },
      { term: "Hard Drive", definition: "Permanent storage device" },
      {
        term: "Operating System",
        definition: "Software that manages computer resources",
      },
      { term: "Browser", definition: "Software to access websites" },
      {
        term: "Input Device",
        definition: "Used to enter data (keyboard, mouse)",
      },
      { term: "Output Device", definition: "Shows results (monitor, printer)" },
      { term: "Virus", definition: "Malicious program that harms computers" },
    ],
  },

  "Financial Literacy": {
    mcq: [
      {
        question: "What is a budget?",
        options: [
          "A type of bank",
          "A plan for spending and saving money",
          "A loan from a bank",
          "A tax form",
        ],
        answer: 1,
      },
      {
        question: "What is interest on a savings account?",
        options: [
          "Money you pay to the bank",
          "Money the bank pays you",
          "A penalty fee",
          "A type of tax",
        ],
        answer: 1,
      },
      {
        question: "What does it mean to 'save' money?",
        options: [
          "Spend it immediately",
          "Give it away",
          "Keep it for future use",
          "Borrow more",
        ],
        answer: 2,
      },
      {
        question: "What is a debit card?",
        options: [
          "A card that borrows money",
          "A card linked to your bank account",
          "A gift card",
          "A reward card",
        ],
        answer: 1,
      },
      {
        question: "What is inflation?",
        options: [
          "Prices going down over time",
          "Prices going up over time",
          "Money printing slowing down",
          "A type of investment",
        ],
        answer: 1,
      },
      {
        question: "What should you do before making a big purchase?",
        options: [
          "Buy it immediately",
          "Ask everyone",
          "Compare prices and budget",
          "Take a loan first",
        ],
        answer: 2,
      },
      {
        question: "What is an expense?",
        options: [
          "Money you earn",
          "Money you save",
          "Money you spend",
          "Money you invest",
        ],
        answer: 2,
      },
      {
        question: "What is the best use of pocket money?",
        options: [
          "Spend it all",
          "Save some and spend some wisely",
          "Lend it to friends",
          "Ignore it",
        ],
        answer: 1,
      },
    ],
    trueOrFalse: [
      {
        statement: "Saving money helps you prepare for emergencies.",
        answer: true,
      },
      {
        statement: "A credit card lets you spend money you have saved.",
        answer: false,
        explanation:
          "A credit card lets you borrow money that you must repay later.",
      },
      { statement: "Needs are more important than wants.", answer: true },
      {
        statement: "Spending less than you earn is a good financial habit.",
        answer: true,
      },
      {
        statement: "Interest on a loan means the bank pays you.",
        answer: false,
        explanation: "You pay interest on a loan to the bank.",
      },
      {
        statement: "Comparing prices before buying is a smart habit.",
        answer: true,
      },
      {
        statement: "A budget only tracks money you spend.",
        answer: false,
        explanation: "A budget tracks both income and spending.",
      },
      { statement: "Investing can help money grow over time.", answer: true },
    ],
    wordScramble: [
      { word: "SAVINGS", hint: "Money kept for the future" },
      { word: "BUDGET", hint: "Plan for your money" },
      { word: "INCOME", hint: "Money you earn" },
      { word: "EXPENSE", hint: "Money you spend" },
      { word: "INTEREST", hint: "Extra money earned or paid on savings/loans" },
      { word: "INVEST", hint: "Put money into something to grow it" },
      { word: "BORROW", hint: "Take money you must repay" },
      { word: "DONATE", hint: "Give money to help others" },
    ],
    memoryPairs: [
      { term: "Budget", definition: "Plan for income and spending" },
      { term: "Savings", definition: "Money set aside for later" },
      { term: "Interest", definition: "Extra money on savings or loans" },
      { term: "Inflation", definition: "Rise in general price levels" },
      { term: "Need", definition: "Something essential to live" },
      { term: "Want", definition: "Something desired but not essential" },
      { term: "Expense", definition: "Money spent" },
      { term: "Income", definition: "Money earned" },
    ],
  },

  "Astronomy for Kids": {
    mcq: [
      {
        question: "What is the closest star to Earth?",
        options: ["Sirius", "Alpha Centauri", "The Sun", "Betelgeuse"],
        answer: 2,
      },
      {
        question: "How many planets are in our solar system?",
        options: ["7", "8", "9", "10"],
        answer: 1,
        explanation: "Pluto was reclassified as a dwarf planet in 2006.",
      },
      {
        question: "What is a galaxy?",
        options: [
          "A type of star",
          "A large system of stars and gas",
          "A moon",
          "A comet",
        ],
        answer: 1,
      },
      {
        question: "What is the name of our galaxy?",
        options: ["Andromeda", "Sombrero", "Milky Way", "Whirlpool"],
        answer: 2,
      },
      {
        question: "Which planet has rings?",
        options: ["Jupiter", "Mars", "Saturn", "Uranus"],
        answer: 2,
        explanation:
          "Saturn has the most visible rings, though others have them too.",
      },
      {
        question: "What causes day and night on Earth?",
        options: [
          "Earth revolving around the Sun",
          "Earth rotating on its axis",
          "The Moon blocking sunlight",
          "Clouds covering the Sun",
        ],
        answer: 1,
      },
      {
        question: "What is a light-year?",
        options: [
          "A year with more sunlight",
          "Distance light travels in a year",
          "Time taken for a star to form",
          "Speed of the Earth",
        ],
        answer: 1,
      },
      {
        question: "What is the largest planet in our solar system?",
        options: ["Saturn", "Neptune", "Jupiter", "Uranus"],
        answer: 2,
      },
      {
        question: "What type of object is the Sun?",
        options: ["Planet", "Moon", "Star", "Asteroid"],
        answer: 2,
      },
      {
        question: "What causes a solar eclipse?",
        options: [
          "Earth blocking Moon's light",
          "Moon blocking Sun's light",
          "Sun moving behind Earth",
          "Clouds blocking the Sun",
        ],
        answer: 1,
      },
    ],
    trueOrFalse: [
      { statement: "The Sun is a star.", answer: true },
      { statement: "Mars is called the Red Planet.", answer: true },
      {
        statement: "The Moon has its own light.",
        answer: false,
        explanation: "The Moon reflects sunlight.",
      },
      {
        statement: "Jupiter is smaller than Earth.",
        answer: false,
        explanation:
          "Jupiter is the largest planet — over 1,300 Earths could fit inside.",
      },
      {
        statement: "There is no gravity in space.",
        answer: false,
        explanation:
          "Gravity exists everywhere; astronauts float because they're in free fall.",
      },
      { statement: "Comets are made of ice and rock.", answer: true },
      { statement: "A year on Earth is about 365 days.", answer: true },
      {
        statement: "Stars are made mostly of water.",
        answer: false,
        explanation: "Stars are mostly hydrogen and helium gas.",
      },
    ],
    wordScramble: [
      { word: "PLANET", hint: "Large body orbiting a star" },
      { word: "ASTEROID", hint: "Rocky object orbiting the Sun" },
      { word: "ECLIPSE", hint: "When one body blocks another's light" },
      { word: "COMET", hint: "Icy body with a tail" },
      { word: "GALAXY", hint: "Huge collection of stars" },
      { word: "NEBULA", hint: "Cloud of gas and dust in space" },
      { word: "ORBIT", hint: "Path around a planet or star" },
      { word: "CRATER", hint: "Bowl-shaped hole from impact" },
    ],
    memoryPairs: [
      { term: "Mercury", definition: "Closest planet to the Sun" },
      { term: "Venus", definition: "Hottest planet" },
      { term: "Mars", definition: "The Red Planet" },
      { term: "Jupiter", definition: "Largest planet" },
      { term: "Saturn", definition: "Planet with prominent rings" },
      { term: "Milky Way", definition: "Our home galaxy" },
      {
        term: "Black Hole",
        definition: "Region with gravity so strong nothing escapes",
      },
      {
        term: "Constellation",
        definition: "Pattern of stars forming a picture",
      },
    ],
  },

  French: {
    mcq: [
      {
        question: "How do you say 'Hello' in French?",
        options: ["Gracias", "Bonjour", "Hola", "Ciao"],
        answer: 1,
      },
      {
        question: "What does 'Merci' mean?",
        options: ["Please", "Sorry", "Thank you", "Goodbye"],
        answer: 2,
      },
      {
        question: "What is 'apple' in French?",
        options: ["Orange", "Pomme", "Poire", "Citron"],
        answer: 1,
      },
      {
        question: "How do you say 'I love you' in French?",
        options: ["Je mange", "Je suis", "Je t'aime", "Je parle"],
        answer: 2,
      },
      {
        question: "What is the French word for 'water'?",
        options: ["Lait", "Jus", "Eau", "Vin"],
        answer: 2,
      },
      {
        question: "How do you say 'Good night' in French?",
        options: ["Bonne nuit", "Bonne journée", "Bonsoir", "À bientôt"],
        answer: 0,
      },
      {
        question: "What is 'cat' in French?",
        options: ["Chien", "Chat", "Lapin", "Souris"],
        answer: 1,
      },
      {
        question: "What does 'S'il vous plaît' mean?",
        options: ["Thank you", "Goodbye", "Please", "Excuse me"],
        answer: 2,
      },
    ],
    trueOrFalse: [
      {
        statement: "French is spoken in France, Belgium, and Canada.",
        answer: true,
      },
      {
        statement: "'Oui' means 'No' in French.",
        answer: false,
        explanation: "'Oui' means Yes, 'Non' means No.",
      },
      { statement: "French uses accents like é, è, and ê.", answer: true },
      {
        statement: "The French word for 'dog' is 'chat'.",
        answer: false,
        explanation: "'Chat' means cat; 'chien' means dog.",
      },
      {
        statement: "French is a Romance language.",
        answer: true,
        explanation: "It descended from Latin.",
      },
      {
        statement: "'Au revoir' means 'Good morning'.",
        answer: false,
        explanation: "'Au revoir' means Goodbye; 'Bonjour' means Good morning.",
      },
    ],
    wordScramble: [
      { word: "BONJOUR", hint: "Hello/Good day in French" },
      { word: "MERCI", hint: "Thank you in French" },
      { word: "MAISON", hint: "House in French" },
      { word: "ÉCOLE", hint: "School in French" },
      { word: "LIVRE", hint: "Book in French" },
      { word: "FAMILLE", hint: "Family in French" },
    ],
    memoryPairs: [
      { term: "Bonjour", definition: "Hello / Good day" },
      { term: "Merci", definition: "Thank you" },
      { term: "Au revoir", definition: "Goodbye" },
      { term: "S'il vous plaît", definition: "Please" },
      { term: "Oui", definition: "Yes" },
      { term: "Non", definition: "No" },
      { term: "Eau", definition: "Water" },
      { term: "Ami", definition: "Friend" },
    ],
  },

  Civics: {
    mcq: [
      {
        question: "What is democracy?",
        options: [
          "Rule by one person",
          "Rule by the military",
          "Government by the people",
          "Rule by religious leaders",
        ],
        answer: 2,
      },
      {
        question: "What is a constitution?",
        options: [
          "A type of election",
          "A country's fundamental law",
          "A political party",
          "A type of government building",
        ],
        answer: 1,
      },
      {
        question: "What does a legislature do?",
        options: [
          "Makes laws",
          "Enforces laws",
          "Interprets laws",
          "Elects judges",
        ],
        answer: 0,
      },
      {
        question: "What is the right to vote called?",
        options: ["Liberty", "Suffrage", "Equality", "Justice"],
        answer: 1,
      },
      {
        question: "Who is the head of government in a parliamentary system?",
        options: ["President", "King", "Prime Minister", "Emperor"],
        answer: 2,
      },
      {
        question: "What does 'freedom of speech' mean?",
        options: [
          "Right to speak any language",
          "Right to express opinions freely",
          "Right to learn public speaking",
          "Right to silence",
        ],
        answer: 1,
      },
      {
        question: "What are the three branches of government?",
        options: [
          "Police, Army, Navy",
          "Executive, Legislative, Judicial",
          "Local, State, National",
          "Democratic, Republican, Independent",
        ],
        answer: 1,
      },
      {
        question: "What is taxation?",
        options: [
          "A type of election",
          "Fees paid by citizens to fund government",
          "A government loan",
          "A type of law",
        ],
        answer: 1,
      },
    ],
    trueOrFalse: [
      {
        statement: "Citizens have both rights and responsibilities.",
        answer: true,
      },
      { statement: "A dictatorship is a form of democracy.", answer: false },
      {
        statement: "In a democracy, citizens can vote for their leaders.",
        answer: true,
      },
      {
        statement: "The United Nations is a global organization.",
        answer: true,
      },
      {
        statement: "All countries have the same type of government.",
        answer: false,
      },
      {
        statement:
          "Freedom of the press is a fundamental right in many democracies.",
        answer: true,
      },
      {
        statement: "The judiciary's job is to make laws.",
        answer: false,
        explanation:
          "The judiciary interprets laws; the legislature makes them.",
      },
      {
        statement: "Every citizen has the responsibility to obey laws.",
        answer: true,
      },
    ],
    wordScramble: [
      { word: "DEMOCRACY", hint: "Government by the people" },
      { word: "ELECTION", hint: "Process of voting for leaders" },
      { word: "CITIZEN", hint: "Member of a country" },
      { word: "PARLIAMENT", hint: "Law-making body" },
      { word: "JUSTICE", hint: "Fairness in law" },
      { word: "FREEDOM", hint: "Right to act without restriction" },
      { word: "REPUBLIC", hint: "State led by elected representatives" },
      { word: "EQUALITY", hint: "Same rights for everyone" },
    ],
    memoryPairs: [
      { term: "Legislature", definition: "Branch that makes laws" },
      { term: "Executive", definition: "Branch that carries out laws" },
      { term: "Judiciary", definition: "Branch that interprets laws" },
      { term: "Constitution", definition: "Fundamental law of a country" },
      { term: "Democracy", definition: "Government by the people" },
      { term: "Suffrage", definition: "The right to vote" },
      {
        term: "Taxation",
        definition: "Citizens paying money to fund government",
      },
      {
        term: "Federalism",
        definition: "Power shared between central and state governments",
      },
    ],
  },

  Coding: {
    mcq: [
      {
        question: "What does an 'if' statement do in programming?",
        options: [
          "Repeats code",
          "Defines a function",
          "Makes a decision",
          "Stores data",
        ],
        answer: 2,
      },
      {
        question: "What is a 'loop' in coding?",
        options: [
          "A variable",
          "Repeated execution of code",
          "A function call",
          "An error",
        ],
        answer: 1,
      },
      {
        question: "What is a variable in programming?",
        options: [
          "A type of error",
          "A named storage for data",
          "A programming language",
          "A code comment",
        ],
        answer: 1,
      },
      {
        question:
          "Which programming language is known for being beginner-friendly?",
        options: ["Assembly", "C++", "Python", "Fortran"],
        answer: 2,
      },
      {
        question: "What does 'debugging' mean?",
        options: [
          "Writing new code",
          "Finding and fixing errors",
          "Deleting code",
          "Running a program",
        ],
        answer: 1,
      },
      {
        question: "What is an algorithm?",
        options: [
          "A type of computer",
          "Step-by-step instructions to solve a problem",
          "A programming language",
          "A computer chip",
        ],
        answer: 1,
      },
      {
        question: "In Scratch, blocks represent?",
        options: ["Variables", "Images", "Code instructions", "Loops only"],
        answer: 2,
      },
      {
        question: "What is a function in coding?",
        options: [
          "A type of loop",
          "A reusable block of code",
          "A variable",
          "An error",
        ],
        answer: 1,
      },
    ],
    trueOrFalse: [
      { statement: "Python uses indentation to structure code.", answer: true },
      {
        statement: "A bug in code always crashes the program.",
        answer: false,
        explanation: "Some bugs cause wrong output without crashing.",
      },
      {
        statement: "HTML is a programming language.",
        answer: false,
        explanation: "HTML is a markup language, not a programming language.",
      },
      {
        statement: "Comments in code are executed by the computer.",
        answer: false,
        explanation:
          "Comments are ignored by the computer; they're for humans to read.",
      },
      {
        statement: "A loop can run code indefinitely if not stopped.",
        answer: true,
      },
      {
        statement: "Scratch is a text-based programming language.",
        answer: false,
        explanation: "Scratch is block-based.",
      },
      { statement: "Programming requires logical thinking.", answer: true },
      {
        statement: "Variables can store different types of data.",
        answer: true,
      },
    ],
    wordScramble: [
      { word: "FUNCTION", hint: "Reusable block of code" },
      { word: "VARIABLE", hint: "Named container for data" },
      { word: "DEBUGGING", hint: "Finding and fixing errors" },
      { word: "ALGORITHM", hint: "Step-by-step solution" },
      { word: "BOOLEAN", hint: "True or False value" },
      { word: "SYNTAX", hint: "Rules for writing code" },
      { word: "COMPILE", hint: "Convert code to machine language" },
      { word: "OUTPUT", hint: "Result produced by a program" },
    ],
    memoryPairs: [
      { term: "Variable", definition: "Named storage for data" },
      { term: "Loop", definition: "Repeats code multiple times" },
      { term: "Function", definition: "Reusable block of code" },
      { term: "Bug", definition: "Error in code" },
      { term: "Algorithm", definition: "Step-by-step instructions" },
      { term: "Boolean", definition: "True or False value" },
      { term: "String", definition: "Sequence of text characters" },
      { term: "Integer", definition: "Whole number" },
    ],
  },

  "Environmental Studies": {
    mcq: [
      {
        question: "What are the three R's of environmental care?",
        options: [
          "Read, Run, Rest",
          "Reduce, Reuse, Recycle",
          "Remove, Replace, Restock",
          "Repair, Restore, Refresh",
        ],
        answer: 1,
      },
      {
        question: "What is deforestation?",
        options: [
          "Planting trees",
          "Clearing forests",
          "Watering plants",
          "Studying trees",
        ],
        answer: 1,
      },
      {
        question: "Which gas is mainly responsible for global warming?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        answer: 2,
      },
      {
        question: "What is a renewable energy source?",
        options: ["Coal", "Natural gas", "Petroleum", "Solar power"],
        answer: 3,
      },
      {
        question: "What is biodiversity?",
        options: [
          "Pollution variety",
          "Variety of life on Earth",
          "Types of rocks",
          "Different climates",
        ],
        answer: 1,
      },
      {
        question: "What is the water cycle?",
        options: [
          "Flow of water in rivers",
          "Continuous movement of water through environment",
          "Ocean currents",
          "Rainfall patterns",
        ],
        answer: 1,
      },
      {
        question: "Which action reduces your carbon footprint?",
        options: [
          "Burning waste",
          "Using plastic bags",
          "Cycling instead of driving",
          "Leaving electronics on",
        ],
        answer: 2,
      },
      {
        question: "What is an endangered species?",
        options: [
          "A species that is thriving",
          "A species at risk of extinction",
          "A species found everywhere",
          "A domesticated animal",
        ],
        answer: 1,
      },
    ],
    trueOrFalse: [
      {
        statement: "Burning fossil fuels contributes to air pollution.",
        answer: true,
      },
      { statement: "Oceans absorb CO₂ from the atmosphere.", answer: true },
      {
        statement: "Plastic takes only a few years to decompose.",
        answer: false,
        explanation: "Some plastic takes hundreds of years to decompose.",
      },
      {
        statement: "Solar energy is a non-renewable resource.",
        answer: false,
        explanation: "Solar energy is renewable — sunlight is unlimited.",
      },
      { statement: "Trees help clean the air by absorbing CO₂.", answer: true },
      {
        statement: "Deforestation increases rainfall.",
        answer: false,
        explanation:
          "Deforestation reduces rainfall and disrupts the water cycle.",
      },
      { statement: "Recycling helps reduce landfill waste.", answer: true },
      {
        statement: "Climate change only affects polar regions.",
        answer: false,
      },
    ],
    wordScramble: [
      { word: "RECYCLE", hint: "Convert waste into reusable material" },
      { word: "POLLUTION", hint: "Contamination of environment" },
      {
        word: "ECOSYSTEM",
        hint: "Community of living things and their environment",
      },
      { word: "RENEWABLE", hint: "Energy source that doesn't run out" },
      { word: "COMPOST", hint: "Decayed organic matter used as fertilizer" },
      { word: "HABITAT", hint: "Natural home of an animal" },
      { word: "EROSION", hint: "Wearing away of land" },
      { word: "FOSSIL", hint: "Preserved remains of ancient life" },
    ],
    memoryPairs: [
      {
        term: "Photosynthesis",
        definition: "Plants converting sunlight to food",
      },
      {
        term: "Carbon Footprint",
        definition: "Total CO₂ released by activities",
      },
      { term: "Biodiversity", definition: "Variety of life on Earth" },
      { term: "Deforestation", definition: "Clearing of forests" },
      {
        term: "Renewable Energy",
        definition: "Energy from inexhaustible sources",
      },
      {
        term: "Water Cycle",
        definition: "Evaporation, condensation, precipitation",
      },
      { term: "Greenhouse Effect", definition: "Warming due to trapped heat" },
      { term: "Extinct", definition: "No longer exists on Earth" },
    ],
  },
};

export function getGameData(subject: string): SubjectGameData {
  return GAME_QUESTIONS[subject] ?? fallbackData;
}

export function scrambleWord(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const scrambled = arr.join("");
  return scrambled === word ? scrambleWord(word) : scrambled;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
