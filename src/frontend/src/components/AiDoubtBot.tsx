import { Button } from "@/components/ui/button";
import { Bot, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

function generateAIResponse(question: string): string {
  const q = question.toLowerCase();

  // Math
  if (
    /algebra|equation|fraction|geometry|calculus|trigonometry|statistics|probability|percentage|percentages?|ratio|proportion|vector|matrix|complex.*number|set.*theory|proof|inequality|sequence|series|number|digit|polynomial|linear|quadratic|integral|derivative|sine|cosine|tangent|mean|median|mode|variance/.test(
      q,
    )
  ) {
    if (/fraction|ratio/.test(q))
      return "Fractions represent parts of a whole — the numerator is the top number and the denominator is the bottom. To add or subtract fractions, you need a common denominator first. For multiplication, simply multiply numerators together and denominators together. Practice simplifying fractions by finding the greatest common divisor (GCD) of both numbers!";
    if (/algebra|equation|variable|polynomial|linear|quadratic/.test(q))
      return "Algebra uses letters (variables) to represent unknown values in equations. A linear equation like 2x + 3 = 7 is solved by isolating x — subtract 3 from both sides to get 2x = 4, then divide by 2 to find x = 2. Quadratic equations (ax² + bx + c = 0) can be solved using factoring, completing the square, or the quadratic formula. Remember: whatever you do to one side of an equation, you must do to the other!";
    if (/calculus|derivative|integral|differentiat/.test(q))
      return "Calculus studies rates of change (differentiation) and accumulation (integration). The derivative of a function tells you its slope at any point — for example, d/dx(x²) = 2x. Integration is the reverse process; ∫x² dx = x³/3 + C. The Fundamental Theorem of Calculus beautifully connects these two concepts. Start by mastering limits before diving into derivatives!";
    if (/trigonometry|sine|cosine|tangent|angle/.test(q))
      return "Trigonometry studies the relationships between angles and sides of triangles. The three primary ratios are: sin(θ) = opposite/hypotenuse, cos(θ) = adjacent/hypotenuse, and tan(θ) = opposite/adjacent — remember them with SOH-CAH-TOA. These ratios are used widely in physics, engineering, and architecture. The unit circle extends these concepts beyond triangles to all angles!";
    if (/statistic|probability|mean|median|mode|variance|distribution/.test(q))
      return "Statistics helps us understand data by summarizing and interpreting it. The mean (average) is found by adding all values and dividing by the count. The median is the middle value when data is sorted, and the mode is the most frequent value. Probability measures likelihood — an event with probability 0.5 has a 50% chance of occurring. These tools are essential for analyzing real-world data!";
    return "Mathematics is the language of the universe! Whether it's arithmetic, algebra, geometry, or calculus, each branch builds on foundational ideas. Make sure you understand the basics of numbers, operations, and properties before tackling advanced topics. Practice daily problems, draw diagrams where possible, and don't hesitate to ask 'why' — that curiosity is what makes great mathematicians!";
  }

  // Physics
  if (
    /force|motion|newton|gravity|energy|work|power|wave|light|electricity|magnetism|thermodynamic|velocity|acceleration|momentum|friction|pressure|fluid|optic|nuclear|relativity|quantum|temperature|heat|entropy/.test(
      q,
    )
  ) {
    if (/newton|force|motion|friction|momentum/.test(q))
      return "Newton's Three Laws of Motion are foundational to physics: (1) An object stays at rest or in uniform motion unless acted upon by a net force — inertia! (2) Force equals mass times acceleration (F = ma). (3) Every action has an equal and opposite reaction. These laws explain everything from why we wear seatbelts to how rockets launch. Always draw a free-body diagram to identify all the forces acting on an object!";
    if (/energy|work|power/.test(q))
      return "Energy is the capacity to do work. Work is calculated as W = F × d × cos(θ), where F is force, d is displacement, and θ is the angle between them. Power is the rate of doing work: P = W/t. The Law of Conservation of Energy states that energy cannot be created or destroyed — only transformed from one form (kinetic, potential, thermal, etc.) to another. This principle is one of the most powerful tools in physics!";
    if (/wave|light|optic|electromagnetic/.test(q))
      return "Waves transfer energy without transferring matter. There are two types: transverse waves (like light, where oscillation is perpendicular to propagation) and longitudinal waves (like sound, where oscillation is parallel). Light is an electromagnetic wave that travels at ~3×10⁸ m/s in a vacuum. It exhibits both wave properties (diffraction, interference) and particle properties (photoelectric effect) — this is wave-particle duality!";
    if (/electricity|magnet|current|voltage|resistance|circuit/.test(q))
      return "Electricity involves the flow of electric charges. Ohm's Law (V = IR) relates voltage (V), current (I), and resistance (R). In a series circuit, current is the same everywhere but voltage divides; in a parallel circuit, voltage is the same but current divides. Electricity and magnetism are deeply connected — a changing electric field creates a magnetic field, and vice versa. This is the basis of electromagnetic induction!";
    return "Physics seeks to understand the fundamental laws governing the universe — from tiny subatomic particles to vast galaxies. Key areas include mechanics (motion and forces), thermodynamics (heat and energy), electromagnetism, and quantum physics. Always approach problems by identifying knowns and unknowns, choosing the right equation, and checking units. Physics is everywhere — from the phone in your pocket to the stars above!";
  }

  // Chemistry
  if (
    /atom|molecule|element|compound|reaction|acid|base|periodic|bond|oxidation|electron|proton|neutron|ion|covalent|ionic|mole|stoichiometry|organic|polymer|solution|concentration|ph|catalyst|enzyme/.test(
      q,
    )
  ) {
    if (/atom|electron|proton|neutron|nucleus|orbital/.test(q))
      return "Atoms are the building blocks of matter. Every atom has a nucleus containing protons (positive charge) and neutrons (neutral), surrounded by electrons (negative charge) in energy levels or orbitals. The number of protons determines the element (atomic number). Atoms are incredibly tiny — a single strand of hair is about a million atoms wide! Electron configuration determines how atoms bond with each other.";
    if (/periodic|element|group|period|metal|nonmetal/.test(q))
      return "The Periodic Table organizes all known elements by atomic number and groups them by similar properties. Elements in the same column (group) share similar chemical behavior because they have the same number of valence electrons. Metals (left side) tend to lose electrons, nonmetals (right side) tend to gain electrons, and metalloids have intermediate properties. The table has 118 confirmed elements, each with unique properties!";
    if (/acid|base|ph|neutralization/.test(q))
      return "Acids donate protons (H⁺ ions) while bases accept them. The pH scale measures acidity — below 7 is acidic, 7 is neutral, and above 7 is basic (alkaline). Each unit on the pH scale represents a 10× change in concentration. When acids and bases combine, they undergo neutralization to form a salt and water. Common examples: HCl (stomach acid, pH ~2) and NaOH (drain cleaner, pH ~14).";
    if (/reaction|bond|oxidation|covalent|ionic|reduction/.test(q))
      return "Chemical reactions involve breaking and forming bonds between atoms. Covalent bonds share electrons between nonmetals (like H₂O), while ionic bonds transfer electrons from metals to nonmetals (like NaCl). Oxidation-Reduction (redox) reactions involve transfer of electrons — oxidation loses electrons (OIL), reduction gains electrons (RIG). Balancing chemical equations ensures the Law of Conservation of Mass is satisfied!";
    return "Chemistry explores matter and its transformations. It bridges physics (atomic structure) and biology (biochemistry). Key topics include atomic theory, chemical bonding, stoichiometry (quantitative relationships in reactions), thermochemistry, and organic chemistry. Always pay attention to units and significant figures in calculations, and remember that understanding 'why' reactions happen is more important than memorizing them!";
  }

  // Biology
  if (
    /cell|photosynthesis|dna|evolution|respiration|ecosystem|organism|genetics|protein|chromosome|mitosis|meiosis|natural selection|adaptation|biodiversity|tissue|organ|nervous|immune|blood|digestion|hormone|bacteria|virus|ecology|population|food.*chain|food.*web|habitat|decomposer|producer|consumer/.test(
      q,
    )
  ) {
    if (/cell|organelle|membrane|mitochondria|nucleus/.test(q))
      return "Cells are the basic unit of life. Prokaryotic cells (like bacteria) have no membrane-bound nucleus, while eukaryotic cells (plants, animals, fungi) do. Key organelles include: the nucleus (stores DNA), mitochondria (energy production via cellular respiration), ribosomes (protein synthesis), and in plants — chloroplasts (photosynthesis) and a cell wall. The cell membrane controls what enters and exits every cell!";
    if (/photosynthesis|chlorophyll|glucose|solar|plant/.test(q))
      return "Photosynthesis is how plants convert sunlight into food! The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ (glucose) + 6O₂. It occurs in the chloroplasts, specifically in the grana (light reactions) and stroma (Calvin cycle/dark reactions). Chlorophyll pigments absorb mostly red and blue light (reflecting green, which is why plants look green). Photosynthesis is the foundation of almost all food chains on Earth!";
    if (/dna|gene|chromosome|genetics|heredity|mutation|allele/.test(q))
      return "DNA (deoxyribonucleic acid) is the molecule that carries genetic information in a double helix structure made of base pairs: Adenine pairs with Thymine, and Cytosine pairs with Guanine. Genes are segments of DNA that code for specific proteins. Chromosomes are tightly coiled DNA — humans have 46 (23 pairs). Genetics studies how traits are inherited; Mendel's laws of dominance and segregation are the foundation. Mutations are changes in DNA sequence that can affect protein function.";
    if (/evolution|natural selection|adaptation|darwin|species/.test(q))
      return "Evolution is the change in heritable traits in populations over successive generations. Charles Darwin's theory of Natural Selection explains the mechanism: organisms with traits better suited to their environment survive and reproduce more successfully, passing those traits to offspring. Over millions of years, this leads to new species. Evidence for evolution comes from fossils, genetics, comparative anatomy, and observed speciation events.";
    return "Biology is the study of life in all its forms! From the tiniest microorganisms to the largest ecosystems, biology explores how living things are structured, function, grow, reproduce, and interact. Key branches include cell biology, genetics, ecology, evolution, and physiology. A great approach to studying biology is to understand concepts hierarchically — from atoms and molecules, to cells, tissues, organs, organisms, populations, and ecosystems.";
  }

  // History
  if (
    /war|revolution|empire|civilization|independence|colonial|dynasty|monarchy|democracy|republic|world war|ancient|medieval|renaissance|industrial|cold war|constitution|treaty|rebellion|uprising|historical/.test(
      q,
    )
  ) {
    if (/world war|ww1|ww2|first world|second world/.test(q))
      return "World War I (1914–1918) began after the assassination of Archduke Franz Ferdinand and involved the Allied Powers vs. the Central Powers. It introduced trench warfare, chemical weapons, and caused ~20 million deaths. World War II (1939–1945) was triggered by Nazi Germany's aggression, leading to the Holocaust and ~70-85 million deaths — the deadliest conflict in history. Both wars reshaped national borders, political systems, and led to international organizations like the League of Nations and the United Nations.";
    if (/independence|colonial|freedom|nation/.test(q))
      return "Independence movements emerged worldwide as colonized nations sought self-determination. India gained independence from Britain in 1947 through Gandhi's nonviolent resistance. The American colonies declared independence from Britain in 1776, establishing democratic principles that influenced revolutions globally. African independence movements peaked in the 1950s-60s. These movements show how political, economic, and social pressures combine to reshape nations.";
    if (/revolution|revolt|uprising|rebellion/.test(q))
      return "Revolutions are fundamental transformations of political, social, or economic systems. The French Revolution (1789-1799) overthrew the monarchy, established democratic ideals of liberty, equality, and fraternity, and led to Napoleon's rise. The Industrial Revolution (1760s-1840s) transformed manufacturing and society. The Russian Revolution (1917) established the world's first communist state. Revolutions are usually driven by a combination of economic inequality, political oppression, and new ideas.";
    return "History helps us understand how the present came to be and learn from the past. Key analytical skills include identifying cause and effect, understanding multiple perspectives, evaluating primary and secondary sources, and recognizing historical patterns. When studying history, always consider the economic, political, social, and cultural factors that shaped events. Remember: history is not just dates and names, but the stories of human experience!";
  }

  // Geography
  if (
    /continent|country|capital|climate|population|river|mountain|ocean|latitude|longitude|ecosystem|biome|earthquake|volcano|weather|atmosphere|erosion|map|compass|urban|rural|migration/.test(
      q,
    )
  ) {
    if (/continent|country|capital/.test(q))
      return "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia/Oceania. Asia is the largest by both area and population. Each continent has diverse countries, cultures, and physical features. Capital cities are the governmental centers of countries — for example, Washington D.C. (USA), New Delhi (India), and Beijing (China). Studying political maps helps you understand geopolitical relationships and borders.";
    if (/climate|weather|atmosphere|biome/.test(q))
      return "Climate is the long-term pattern of weather in an area, while weather is day-to-day atmospheric conditions. Key climate factors include latitude (distance from equator), altitude, ocean currents, and prevailing winds. Climate zones range from tropical (hot and wet) near the equator to polar (cold and dry) near the poles. Human activities, especially burning fossil fuels, are changing global climate patterns — causing global warming and extreme weather events.";
    if (/river|mountain|ocean|earthquake|volcano/.test(q))
      return "Earth's physical features are shaped by tectonic forces. Mountains form where tectonic plates collide (like the Himalayas). Volcanoes and earthquakes occur along plate boundaries, especially the Pacific 'Ring of Fire.' Rivers are shaped by rainfall, gradient, and the rock they flow through — the Amazon River discharges more water than any other. Oceans cover ~71% of Earth's surface and regulate climate through heat absorption and ocean currents.";
    return "Geography studies Earth's landscapes, environments, and the relationships between people and their environments. Physical geography examines natural features (landforms, climate, vegetation), while human geography examines populations, cultures, economies, and political systems. Understanding geography is crucial for addressing global challenges like climate change, resource distribution, and urbanization. Maps are geographers' primary tool — learn to read them carefully!";
  }

  // English/Grammar
  if (
    /grammar|noun|verb|adjective|tense|sentence|punctuation|essay|adverb|pronoun|preposition|conjunction|clause|phrase|paragraph|writing|vocabulary|comprehension|metaphor|simile|literature|poetry|author/.test(
      q,
    )
  ) {
    if (/grammar|noun|verb|adjective|adverb|tense|pronoun|preposition/.test(q))
      return "Grammar is the set of rules that govern how words are combined to form sentences. Parts of speech include: nouns (people, places, things), verbs (actions or states), adjectives (describe nouns), adverbs (modify verbs, adjectives, or other adverbs), pronouns (replace nouns), prepositions (show relationships), and conjunctions (connect clauses). Verb tenses tell us WHEN an action happens — past, present, or future. Strong grammar skills make your writing clearer and more persuasive!";
    if (/essay|writing|paragraph|sentence/.test(q))
      return "A well-structured essay has three parts: Introduction (hook + thesis statement), Body Paragraphs (each with a topic sentence, evidence, and analysis), and Conclusion (restate thesis + broader significance). Each body paragraph should focus on ONE main idea. Use transition words (however, furthermore, consequently) to connect ideas. Strong essays don't just summarize — they analyze, argue, and engage with evidence critically.";
    if (/metaphor|simile|figurative|literary|poetry/.test(q))
      return "Figurative language makes writing more vivid and expressive. A simile compares two things using 'like' or 'as' (e.g., 'brave as a lion'). A metaphor states one thing IS another (e.g., 'time is a thief'). Personification gives human qualities to non-human things. Hyperbole is deliberate exaggeration. These devices create imagery, emphasize ideas, and evoke emotions. When analyzing literature, always ask: why did the author choose this language?";
    return "English language skills — reading, writing, listening, and speaking — are fundamental across all subjects. For writing, practice the five-paragraph essay structure. For reading comprehension, focus on identifying main ideas, inferring meaning from context, and analyzing author's purpose. Expand your vocabulary by reading diverse texts and noting unfamiliar words. Remember: writing improves with practice and feedback, so write often and embrace revision!";
  }

  // Computer Science
  if (
    /algorithm|loop|variable|function|array|recursion|data structure|programming|code|software|hardware|binary|boolean|class|object|inheritance|sorting|searching|complexity|database|network|internet|cpu|memory/.test(
      q,
    )
  ) {
    if (/algorithm|complexity|sorting|searching/.test(q))
      return "An algorithm is a step-by-step procedure to solve a problem. Algorithm efficiency is measured by time complexity (how long it takes) and space complexity (how much memory it uses) using Big O notation. Common sorting algorithms: Bubble Sort (O(n²)), Merge Sort (O(n log n)), Quick Sort (O(n log n) average). Binary Search (O(log n)) is much faster than Linear Search (O(n)) but requires sorted data. Choosing the right algorithm greatly impacts program performance!";
    if (/loop|variable|function|array|recursion/.test(q))
      return "Variables store data values; arrays store multiple values of the same type in sequential memory. Loops (for, while) repeat code blocks — be careful to avoid infinite loops! Functions (also called methods or procedures) encapsulate reusable code blocks, improving readability and reducing repetition. Recursion is when a function calls itself — it needs a base case to stop. These are the building blocks of every program, regardless of programming language!";
    if (/class|object|inheritance|oop/.test(q))
      return "Object-Oriented Programming (OOP) organizes code around objects — instances of classes. A class is like a blueprint defining attributes (data) and methods (functions). Inheritance allows a child class to inherit properties from a parent class, promoting code reuse. Other OOP principles include Encapsulation (hiding internal details), Polymorphism (same interface, different implementations), and Abstraction (simplifying complex systems). OOP is used in Java, Python, C++, and many other languages.";
    if (/binary|boolean|logic|bit|byte/.test(q))
      return "Computers operate using binary — a number system with only two digits: 0 and 1. Each binary digit is called a bit; 8 bits make a byte. Boolean logic uses true/false values with AND, OR, and NOT operations — these correspond directly to logic gates in computer hardware. Understanding binary helps you grasp how computers represent numbers, text (ASCII/Unicode), images, and all digital data at the lowest level!";
    return "Computer Science is the study of computation, algorithms, data structures, and the principles underlying software and hardware systems. Key areas include programming, algorithms & data structures, computer architecture, operating systems, networking, databases, and artificial intelligence. Learning to code is best done by building real projects — start with Python or JavaScript, understand fundamentals before frameworks, and always practice problem-solving on platforms like LeetCode or HackerRank!";
  }

  // Economics / Business Studies
  if (
    /economics|supply.*demand|inflation|gdp|market|trade|budget|currency|recession|investment|fiscal|monetary|entrepreneur|business.*plan|profit|revenue|cost|elasticity|capitalism|socialism/.test(
      q,
    )
  ) {
    if (/supply.*demand|market|price|elasticity/.test(q))
      return "Supply and demand is the core model in economics. When demand rises (more buyers want a product) and supply stays the same, prices tend to rise. When supply rises (more sellers) and demand stays the same, prices tend to fall. The equilibrium price is where supply equals demand — the 'clearing price' in the market. Price elasticity measures how much demand changes when prices change: necessities (food, medicine) are inelastic (demand barely changes), while luxuries are elastic (demand drops sharply with price increases).";
    if (/inflation|gdp|recession|economic.*cycle/.test(q))
      return "Inflation is the general rise in the price level over time, eroding purchasing power. GDP (Gross Domestic Product) measures the total value of goods and services produced in a country — it's the main indicator of economic size and health. A recession occurs when GDP shrinks for two consecutive quarters. The economic cycle moves through expansion (growth), peak, recession, and recovery. Central banks use interest rates to manage inflation — raising rates cools spending, lowering rates stimulates it.";
    if (/entrepreneur|business.*plan|profit|revenue|cost/.test(q))
      return "An entrepreneur identifies opportunities, takes risks, and starts businesses. A business plan covers: (1) Business idea and unique value proposition, (2) Target market and competitors, (3) Revenue model (how you make money), (4) Costs (fixed costs like rent, variable costs like materials), (5) Financial projections. Profit = Revenue − Total Costs. A business must cover its costs (break even) before it becomes profitable. Cash flow (when money comes in vs. goes out) is often what determines if a business survives!";
    return "Economics studies how individuals, businesses, and governments make decisions about allocating scarce resources. Microeconomics looks at individual markets and decisions; macroeconomics looks at entire economies (inflation, unemployment, growth). Key concepts: supply and demand, opportunity cost, elasticity, market structures (perfect competition, monopoly), fiscal policy (government spending/taxes), and monetary policy (interest rates). Understanding economics helps you make sense of prices, wages, business decisions, and global events!";
  }

  // Psychology
  if (
    /psychology|behaviour|cognitive|memory|learning.*theory|pavlov|classical.*condition|operant|piaget|freud|maslow|emotion|perception|consciousness|mental.*health|anxiety|therapy|nature.*nurture/.test(
      q,
    )
  ) {
    if (/memory|forget|recall|encoding|storage|retrieval/.test(q))
      return "Memory works in three stages: Encoding (converting information into a storable form), Storage (holding it in short-term or long-term memory), and Retrieval (recalling it when needed). Short-term memory (STM) holds about 7 items for 15–30 seconds. Long-term memory (LTM) has virtually unlimited capacity. Forgetting occurs when memories decay, are displaced, or retrieval cues are absent. Effective learning strategies — spacing, retrieval practice, elaboration — all work by strengthening memory encoding and retrieval!";
    if (
      /pavlov|classical.*condition|operant.*condition|skinner|behaviour/.test(q)
    )
      return "Behaviourism focuses on observable behaviour rather than internal thoughts. Classical conditioning (Pavlov): a neutral stimulus becomes associated with an unconditioned stimulus to produce a response (e.g., Pavlov's dogs salivating at a bell). Operant conditioning (Skinner): behaviour is shaped by consequences — reinforcement (positive: rewarding the behaviour; negative: removing something unpleasant) increases behaviour, while punishment decreases it. These principles are used in education, therapy, and animal training every day!";
    if (/piaget|cognitive.*development|stage|development/.test(q))
      return "Piaget's theory of cognitive development describes four stages: (1) Sensorimotor (0–2 years): understanding through senses and actions, (2) Preoperational (2–7 years): symbolic thinking but egocentric, (3) Concrete Operational (7–11 years): logical thinking about concrete objects, (4) Formal Operational (12+): abstract and hypothetical reasoning. Each stage builds on the last. Piaget believed children are 'little scientists' who actively construct understanding — not just passive recipients of information.";
    if (/maslow|hierarchy.*need|motivation|self.*actualiz/.test(q))
      return "Maslow's Hierarchy of Needs arranges human motivations in a pyramid: (1) Physiological needs (food, water, shelter), (2) Safety needs (security, stability), (3) Love/Belonging needs (relationships, community), (4) Esteem needs (achievement, recognition), (5) Self-Actualisation (reaching full potential). The idea is that lower needs must be met before higher ones motivate behaviour. This model is widely applied in education, management, and therapy, though modern research suggests the hierarchy is more fluid than originally proposed.";
    return "Psychology is the scientific study of mind and behaviour. Key approaches include: Biological (brain, genetics), Behaviourist (observable behaviour, conditioning), Cognitive (thinking, memory, perception), Humanistic (personal growth, self-concept), and Psychodynamic (unconscious mind, Freud). When studying psychology, always consider research methods (experiments, case studies, surveys), ethical guidelines, and the nature vs. nurture debate. Psychology is both scientific and deeply relevant to everyday life!";
  }

  // Art / Design / Music
  if (
    / art |drawing|painting|sculpture|design|colour.*theory|composition|perspective|music|rhythm|melody|harmony|chord|note|instrument|tempo|dynamics|genre|portrait|abstract|impressionism/.test(
      q,
    )
  ) {
    if (/colour|color|primary|secondary|hue|shade|tint|tone/.test(q))
      return "Colour theory is the foundation of visual art and design. Primary colours (red, blue, yellow) cannot be mixed from others; combining them makes secondary colours (orange, green, purple). Complementary colours sit opposite each other on the colour wheel (red/green, blue/orange) and create strong contrast. Analogous colours sit next to each other and create harmony. In art, value (lightness/darkness) is just as important as hue — many great paintings work in black and white because the tonal relationships are strong!";
    if (
      /composition|rule.*third|balance|perspective|foreground|background/.test(
        q,
      )
    )
      return "Composition is how you arrange elements within an artwork or design. The Rule of Thirds divides the image into a 3×3 grid — placing key subjects on the intersections creates more dynamic compositions than centring everything. Balance can be symmetrical (mirror image) or asymmetrical (different elements that 'feel' equal in visual weight). Perspective creates the illusion of depth: one-point perspective (one vanishing point) is great for corridors and roads; two-point perspective adds realism to buildings and outdoor scenes.";
    if (/music|rhythm|melody|harmony|chord|note|beat|tempo|dynamics/.test(q))
      return "Music theory is the language of music. Rhythm is the pattern of sounds over time (beats, notes, rests). Melody is a sequence of notes that form a recognisable tune — the part you hum. Harmony occurs when two or more notes are played together; chords are the building blocks of harmony. Tempo is the speed of the music (adagio = slow, allegro = fast). Dynamics describe volume (piano = soft, forte = loud). Understanding these elements lets you read, write, and analyse music at a deeper level!";
    return "Art and Design are about communicating ideas visually through skill, creativity, and intention. Key elements of art: line, shape, colour, value, texture, space, and form. Key principles of design: balance, contrast, emphasis, movement, rhythm, and unity. In music, the elements are rhythm, melody, harmony, timbre, texture, form, and dynamics. When analysing any artwork or piece of music, ask: what choices did the creator make, and why? Great artists make intentional decisions — everything in the work has a reason.";
  }

  // Physical Education / Sports Science
  if (
    /physical.*education|fitness|exercise|sport|muscle|cardiovascular|endurance|strength|flexibility|nutrition|health|body.*system|aerobic|anaerobic|training|injury|hydration/.test(
      q,
    )
  ) {
    if (
      /fitness.*component|endurance|strength|flexibility|speed|agility/.test(q)
    )
      return "The key components of physical fitness are: Cardiovascular Endurance (ability to sustain aerobic exercise — e.g. running, swimming), Muscular Strength (maximum force a muscle can exert — e.g. lifting), Muscular Endurance (ability to sustain repeated contractions — e.g. press-ups), Flexibility (range of movement at a joint), Speed (rate of movement), Agility (quick change of direction), Balance (maintaining stability), and Coordination (combining movements smoothly). Different sports require different fitness components — a marathon runner prioritises endurance, a gymnast prioritises flexibility!";
    if (/aerobic|anaerobic|energy.*system|atp/.test(q))
      return "The body uses three energy systems depending on the intensity and duration of exercise: (1) ATP-PC system (phosphocreatine): very short, explosive bursts (0–10 seconds) — 100m sprint, (2) Lactic acid / glycolytic system: moderate to high intensity (10 seconds – 2 minutes) — 400m run, (3) Aerobic system: low to moderate intensity for longer durations (2+ minutes) — distance running. Understanding energy systems helps athletes and coaches design training programmes that target the right system for their sport!";
    if (/nutrition|diet|protein|carbohydrate|hydration|vitamin/.test(q))
      return "Sports nutrition fuels performance and recovery. Carbohydrates are the primary energy source — especially important before endurance events (carb-loading). Proteins repair and build muscle — athletes need more protein than sedentary individuals (1.2–2.0g per kg of body weight daily). Fats provide energy for low-intensity, long-duration activity. Hydration is critical — even mild dehydration reduces performance significantly. Micronutrients (vitamins and minerals) support immune function, bone health, and energy metabolism. Timing meals around training (eating carbs/protein shortly after exercise) aids recovery!";
    return "Physical Education develops physical literacy — the skills, knowledge, and motivation to be active for life. Key topics include: anatomy and physiology (how the body works), components of fitness, training principles (FITT: Frequency, Intensity, Time, Type), energy systems, nutrition, injury prevention, and sport psychology. Understanding the science behind physical activity helps you train smarter, not just harder. Regular physical activity improves cognitive function, mental health, and academic performance — it's not just about sport!";
  }

  // Environmental Science / Sustainability
  if (
    /environment|climate.*change|global.*warming|carbon|pollution|renewable|fossil.*fuel|sustainability|biodiversity.*loss|deforestation|ecosystem.*service|greenhouse|ozone|recycling|conservation|habitat/.test(
      q,
    )
  ) {
    if (/climate.*change|global.*warming|greenhouse|carbon.*dioxide/.test(q))
      return "Climate change refers to long-term shifts in global temperatures and weather patterns. While natural factors play a role, since the Industrial Revolution, human activities — primarily burning fossil fuels (coal, oil, gas) — have dramatically increased atmospheric CO₂ and other greenhouse gases. These gases trap heat (the greenhouse effect), causing global temperatures to rise. Consequences include: rising sea levels, more frequent extreme weather, melting ice caps, and biodiversity loss. The Paris Agreement (2015) set a target to limit warming to 1.5°C above pre-industrial levels.";
    if (/renewable|solar|wind|fossil.*fuel|energy.*source/.test(q))
      return "Energy sources are classified as renewable (replenished naturally — solar, wind, hydro, geothermal, tidal) or non-renewable (finite supply — coal, oil, natural gas, nuclear). Fossil fuels currently supply ~80% of global energy but emit CO₂ when burned. Renewable energy is growing rapidly: solar panel costs have dropped 90% since 2010. Transitioning to renewables is essential for reducing greenhouse gas emissions. Each source has trade-offs: solar needs sun, wind needs wind, hydro needs rivers — a diverse energy mix is most reliable.";
    if (/biodiversity|habitat|extinction|conservation|ecosystem/.test(q))
      return "Biodiversity refers to the variety of life on Earth — across species, genetic variation within species, and ecosystem diversity. It is declining at an unprecedented rate, with scientists estimating up to 1 million species at risk of extinction. Main drivers: habitat destruction (deforestation, urbanisation), climate change, pollution, overexploitation, and invasive species. Biodiversity loss weakens ecosystems and the services they provide: clean air and water, crop pollination, disease regulation, and carbon storage. Conservation strategies include protected areas, habitat restoration, captive breeding, and international agreements like the Convention on Biological Diversity.";
    return "Environmental science studies the interactions between living organisms and their physical environment, with particular focus on human impact. Key issues include climate change, biodiversity loss, pollution, deforestation, water scarcity, and sustainable development. The concept of sustainability means meeting present needs without compromising the ability of future generations to meet theirs. Solutions require interdisciplinary thinking — combining biology, chemistry, physics, economics, and politics. Every action, from individual consumption choices to national policy, shapes environmental outcomes!";
  }

  // Philosophy / Ethics
  if (
    /philosophy|ethics|morality|justice|rights|utilitarianism|kant|aristotle|plato|socrates|deontology|virtue.*ethics|consequentialist|free.*will|consciousness|existence|truth|logic|argument|fallacy/.test(
      q,
    )
  ) {
    if (/ethics|morality|right.*wrong|utilitarianism|deontology|virtue/.test(q))
      return "Ethics is the branch of philosophy that studies morality — what is right, wrong, good, and bad. Three major ethical theories: (1) Utilitarianism (Bentham, Mill): the right action maximises happiness/utility for the greatest number — outcomes matter. (2) Deontology (Kant): some actions are intrinsically right or wrong regardless of consequences — duties and rules matter. (3) Virtue Ethics (Aristotle): focus on developing good character traits (courage, honesty, compassion) rather than following rules or calculating outcomes. Each theory offers powerful insights and faces serious objections — real moral situations often require using all three!";
    if (/free.*will|determinism|consciousness|mind.*body/.test(q))
      return "Free will is the philosophical question of whether humans genuinely choose their actions or whether all choices are determined by prior causes (genetics, environment, brain states). Determinists argue every event — including human decisions — is caused by prior events following natural laws. Libertarians (in the philosophical sense) argue genuine free will exists. Compatibilists argue free will and determinism can coexist — what matters is acting from your own desires without external coercion. The debate connects to questions about moral responsibility: can we blame someone if their actions were determined?";
    if (/plato|socrates|aristotle|republic|allegory|cave/.test(q))
      return "The ancient Greeks laid the foundations of Western philosophy. Socrates (469–399 BC) developed the Socratic Method — questioning assumptions to reveal truth. His student Plato argued reality consists of perfect, eternal 'Forms' — physical objects are imperfect copies. The Allegory of the Cave illustrates this: prisoners in a cave mistake shadows for reality; the philosopher escapes to see true Forms. Aristotle (Plato's student) disagreed — he believed knowledge comes from observing the physical world. His work on logic, ethics, politics, and biology shaped Western thought for two millennia.";
    return "Philosophy asks the most fundamental questions: What exists? (Metaphysics), How do we know? (Epistemology), How should we act? (Ethics), What is beautiful? (Aesthetics), How should society be organised? (Political Philosophy), and What counts as a valid argument? (Logic). Studying philosophy develops critical thinking, clear argumentation, and the ability to evaluate ideas rigorously — skills valuable in every field. When studying philosophy, always try to steelman arguments (present them in their strongest form) before criticising them.";
  }

  // Study Skills / Learning Strategies
  if (
    /study.*skill|how to study|revision.*technique|pomodoro|mind map|flashcard|spaced.*repetition|active.*recall|note.*taking|time.*management|exam.*technique|concentration|focus|memory.*technique/.test(
      q,
    )
  ) {
    if (/spaced.*repetition|forgetting.*curve|flashcard|anki/.test(q))
      return "Spaced repetition is one of the most evidence-based study techniques. Instead of cramming, you review material at increasing intervals — right before you're about to forget it. Flashcard apps like Anki use algorithms to schedule reviews optimally. The Forgetting Curve (Ebbinghaus) shows memory decays rapidly without review: you might forget 50% within a day and 80% within a week. But each review resets the curve and makes the memory stronger. Even 10–15 minutes of spaced review daily beats hours of last-minute cramming!";
    if (/active.*recall|retrieval.*practice|self.*test|past.*paper/.test(q))
      return "Active recall (retrieval practice) is the most powerful study technique. Instead of re-reading notes, force your brain to recall information: use flashcards, write everything you know from memory, answer practice questions, or try the 'Feynman Technique' — explain the topic as if teaching a 10-year-old. If you can't explain it simply, you don't understand it yet. Studies show retrieval practice produces 50–80% better long-term retention than passive re-reading. Past exam papers are the best form of retrieval practice available!";
    if (/pomodoro|time.*management|schedule|plan.*study/.test(q))
      return "The Pomodoro Technique: work for 25 minutes with full focus, then take a 5-minute break. After 4 Pomodoros, take a longer 20–30 minute break. This prevents mental fatigue and creates a sense of urgency that combats procrastination. For a study schedule: (1) Identify all your subjects and topics, (2) Estimate hours needed per topic, (3) Work backwards from exam dates, (4) Build in review sessions (not just first-time learning), (5) Schedule your hardest subjects when your energy is highest (usually morning). A written plan reduces decision fatigue and keeps you accountable!";
    return "Effective studying is about working smarter, not just longer. The most evidence-backed techniques: (1) Active Recall — test yourself instead of re-reading, (2) Spaced Repetition — review material at increasing intervals, (3) Interleaving — mix subjects/topics rather than blocking one subject for hours, (4) Elaborative Interrogation — ask 'why?' and 'how?' about everything you learn, (5) Concrete Examples — connect abstract concepts to specific real-world examples. Avoid the illusion of learning from highlighting and re-reading — they feel productive but produce weak long-term memory!";
  }

  // Greetings and casual conversation
  if (
    /^(hello|hi|hey|good morning|good afternoon|good evening|hiya|howdy)/i.test(
      q,
    )
  )
    return "Hi there! 👋 I'm your AI Doubt Solver — here to help you with any academic question. Ask me about Maths, Science, History, Geography, English, Computer Science, Economics, Psychology, Music, Art, and more. What subject are you working on today?";

  if (/how are you|how r u|what's up|wassup/.test(q))
    return "I'm ready and powered up to help you learn! 🤖 What subject or topic do you need help with today? I cover Maths, Sciences, Humanities, Languages, and more — just ask!";

  if (/thank you|thanks|cheers|appreciate/.test(q))
    return "You're welcome! 😊 Learning is a journey — keep asking questions, stay curious, and don't be afraid to get things wrong. That's how understanding builds. Is there anything else you'd like to explore?";

  if (/can you help|what can you do|what subjects/.test(q))
    return "I can help with a wide range of subjects: 📐 Maths (algebra, calculus, statistics), 🔬 Sciences (Physics, Chemistry, Biology), 🌍 Humanities (History, Geography), 📖 English (grammar, writing, literature), 💻 Computer Science, 📊 Economics, 🧠 Psychology, 🎨 Art & Music, and more! Just ask me a question and I'll do my best to explain it clearly.";

  // Generic fallback
  return "That's a great question! While I specialize in school subjects like Math, Science, History, English, and Computer Science, I'd suggest breaking your question into smaller parts and looking up each concept separately. Try asking me something more specific — for example, 'What is photosynthesis?' or 'Explain Newton's second law.' Feel free to ask me anything academic!";
}

export function AiDoubtBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      // Clear messages on close
      setMessages([]);
      setInput("");
      setIsThinking(false);
    }
  }, [isOpen]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on data change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  function sendMessage() {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: `a_${Date.now()}`,
        role: "ai",
        text: generateAIResponse(text),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 800);
  }

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        data-ocid="ai_bot.open_modal_button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-student text-white shadow-lg hover:shadow-xl font-display font-bold text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <Bot className="w-5 h-5" />
        Ask AI
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-ocid="ai_bot.panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] flex flex-col bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 bg-student text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm leading-tight">
                    AI Doubt Solver
                  </p>
                  <p className="text-[11px] text-white/70 leading-tight">
                    Ask me any academic question
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-ocid="ai_bot.close_button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && !isThinking && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-student-light flex items-center justify-center">
                    <Bot className="w-6 h-6 text-student" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground">
                      Hi! I'm your AI tutor 👋
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Ask me about Math, Science, History,
                      <br />
                      English, CS, and more!
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="w-6 h-6 rounded-full bg-student-light flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Bot className="w-3 h-3 text-student" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed text-black ${
                      msg.role === "user"
                        ? "bg-student text-white rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}
                    style={
                      msg.role === "user"
                        ? { color: "white" }
                        : { color: "black" }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isThinking && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-student-light flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-student" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-student block"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.18,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-border/60 flex-shrink-0 bg-background">
              <input
                data-ocid="ai_bot.input"
                ref={inputRef}
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isThinking}
                className="flex-1 text-sm px-3 py-2 rounded-xl border border-border/60 bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-student/30 focus:border-student/50 disabled:opacity-50 transition-all"
              />
              <Button
                data-ocid="ai_bot.submit_button"
                size="sm"
                onClick={sendMessage}
                disabled={!input.trim() || isThinking}
                className="bg-student text-white hover:bg-student/90 rounded-xl px-3 flex-shrink-0 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
