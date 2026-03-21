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
    /algebra|equation|fraction|geometry|calculus|trigonometry|statistics|probability|percentage|number|digit|polynomial|linear|quadratic|integral|derivative|sine|cosine|tangent|mean|median|mode|variance/.test(
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
    /cell|photosynthesis|dna|evolution|respiration|ecosystem|organism|genetics|protein|chromosome|mitosis|meiosis|natural selection|adaptation|biodiversity|tissue|organ|nervous|immune|blood|digestion|hormone|bacteria|virus/.test(
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
