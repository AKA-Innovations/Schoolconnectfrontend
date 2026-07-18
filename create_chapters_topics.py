import requests

# API Configuration
BASE_URL = "https://skoolconnectbackend.onrender.com"

# Teacher Login Details
USERNAME = "lps.admin"
PASSWORD = "Admin@123"

# Academic Session
SESSION = "2026-27"

# Mapped list of subjects and their IDs
SUBJECT_MAP = {
    5: "Chemistry",
    1: "English I",
    9: "Geography",
    2: "Hindi",
    8: "History & Civics",
    3: "Maths",
    4: "Physics",
    16: "testing subject"
}

# Already created chapters with their IDs (provided from DB)
CREATED_CHAPTERS = [
    # Chemistry (subject_id: 5)
    {"id": 12, "subject_id": 5, "chapter_name": "Periodic Properties and Variations of Physical Properties"},
    {"id": 13, "subject_id": 5, "chapter_name": "Chemical Bonding"},
    {"id": 14, "subject_id": 5, "chapter_name": "Acids, Bases and Salts"},
    {"id": 15, "subject_id": 5, "chapter_name": "Analytical Chemistry"},
    {"id": 16, "subject_id": 5, "chapter_name": "Mole Concept and Stoichiometry"},
    {"id": 17, "subject_id": 5, "chapter_name": "Electrolysis"},
    {"id": 18, "subject_id": 5, "chapter_name": "Metallurgy"},
    {"id": 19, "subject_id": 5, "chapter_name": "Study of Compounds: Hydrogen Chloride"},
    {"id": 20, "subject_id": 5, "chapter_name": "Study of Compounds: Ammonia"},
    {"id": 21, "subject_id": 5, "chapter_name": "Organic Chemistry"},

    # English I (subject_id: 1)
    {"id": 23, "subject_id": 1, "chapter_name": "Composition"},
    {"id": 24, "subject_id": 1, "chapter_name": "Letter Writing"},
    {"id": 25, "subject_id": 1, "chapter_name": "Notice and Email Writing"},
    {"id": 26, "subject_id": 1, "chapter_name": "Comprehension"},
    {"id": 27, "subject_id": 1, "chapter_name": "Applied Grammar: Tenses"},
    {"id": 28, "subject_id": 1, "chapter_name": "Applied Grammar: Prepositions"},
    {"id": 29, "subject_id": 1, "chapter_name": "Applied Grammar: Voice and Speech"},
    {"id": 30, "subject_id": 1, "chapter_name": "Applied Grammar: Synthesis of Sentences"},
    {"id": 31, "subject_id": 1, "chapter_name": "Applied Grammar: Transformation of Sentences"},
    {"id": 32, "subject_id": 1, "chapter_name": "Applied Grammar: Subject-Verb Agreement"},

    # Geography (subject_id: 9)
    {"id": 33, "subject_id": 9, "chapter_name": "Interpretation of Topographical Sheets"},
    {"id": 34, "subject_id": 9, "chapter_name": "Map of India Study"},
    {"id": 35, "subject_id": 9, "chapter_name": "Climate of India"},
    {"id": 36, "subject_id": 9, "chapter_name": "Soils of India"},
    {"id": 37, "subject_id": 9, "chapter_name": "Natural Vegetation of India"},
    {"id": 38, "subject_id": 9, "chapter_name": "Water Resources"},
    {"id": 39, "subject_id": 9, "chapter_name": "Mineral and Energy Resources"},
    {"id": 40, "subject_id": 9, "chapter_name": "Agriculture in India"},
    {"id": 41, "subject_id": 9, "chapter_name": "Manufacturing Industries in India"},
    {"id": 42, "subject_id": 9, "chapter_name": "Transport and Waste Management"},

    # Hindi (subject_id: 2)
    {"id": 43, "subject_id": 2, "chapter_name": "Sahitya Sagar: Short Stories"},
    {"id": 44, "subject_id": 2, "chapter_name": "Sahitya Sagar: Poems"},
    {"id": 45, "subject_id": 2, "chapter_name": "Naya Rasta: Novel Studies"},
    {"id": 46, "subject_id": 2, "chapter_name": "Ekanki Sanchay: One-Act Plays"},
    {"id": 47, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Essay Writing"},
    {"id": 48, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Letter Writing"},
    {"id": 49, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Comprehension (Apathit Gadyansh)"},
    {"id": 50, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Grammar Rules"},
    {"id": 51, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Vocabulary and Idioms"},
    {"id": 52, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Abstract and Applied Syntax"},

    # History & Civics (subject_id: 8)
    {"id": 53, "subject_id": 8, "chapter_name": "The Union Legislature"},
    {"id": 54, "subject_id": 8, "chapter_name": "The Union Executive"},
    {"id": 55, "subject_id": 8, "chapter_name": "The Judiciary"},
    {"id": 56, "subject_id": 8, "chapter_name": "The First War of Independence, 1857"},
    {"id": 57, "subject_id": 8, "chapter_name": "Growth of Nationalism and Early Nationalists"},
    {"id": 58, "subject_id": 8, "chapter_name": "Assertive Nationalism and Partition of Bengal"},
    {"id": 59, "subject_id": 8, "chapter_name": "Mass Phase of the National Movement (1915-1947)"},
    {"id": 60, "subject_id": 8, "chapter_name": "First World War and Rise of Dictatorships"},
    {"id": 61, "subject_id": 8, "chapter_name": "Second World War and United Nations"},
    {"id": 62, "subject_id": 8, "chapter_name": "UN Agencies and Non-Aligned Movement"},

    # Maths (subject_id: 3)
    {"id": 63, "subject_id": 3, "chapter_name": "Goods and Services Tax (GST)"},
    {"id": 64, "subject_id": 3, "chapter_name": "Banking (Recurring Deposit Accounts)"},
    {"id": 65, "subject_id": 3, "chapter_name": "Linear Inequations"},
    {"id": 66, "subject_id": 3, "chapter_name": "Quadratic Equations"},
    {"id": 67, "subject_id": 3, "chapter_name": "Ratio and Proportion"},
    {"id": 68, "subject_id": 3, "chapter_name": "Remainder and Factor Theorems"},
    {"id": 69, "subject_id": 3, "chapter_name": "Matrices"},
    {"id": 70, "subject_id": 3, "chapter_name": "Arithmetic and Geometric Progressions"},
    {"id": 71, "subject_id": 3, "chapter_name": "Reflection and Coordinate Geometry"},
    {"id": 72, "subject_id": 3, "chapter_name": "Trigonometry"},

    # Physics (subject_id: 4)
    {"id": 73, "subject_id": 4, "chapter_name": "Force, Work, Power and Energy"},
    {"id": 74, "subject_id": 4, "chapter_name": "Light: Refraction at Plane Surfaces"},
    {"id": 75, "subject_id": 4, "chapter_name": "Light: Refraction through Lenses"},
    {"id": 76, "subject_id": 4, "chapter_name": "Light: Spectrum"},
    {"id": 77, "subject_id": 4, "chapter_name": "Sound"},
    {"id": 78, "subject_id": 4, "chapter_name": "Current Electricity"},
    {"id": 79, "subject_id": 4, "chapter_name": "Household Circuits"},
    {"id": 80, "subject_id": 4, "chapter_name": "Electromagnetism"},
    {"id": 81, "subject_id": 4, "chapter_name": "Calorimetry"},
    {"id": 82, "subject_id": 4, "chapter_name": "Radioactivity"},

    # testing subject (subject_id: 16)
    {"id": 83, "subject_id": 16, "chapter_name": "Test Chapter 1: Introduction to Testing"},
    {"id": 84, "subject_id": 16, "chapter_name": "Test Chapter 2: Test Methodologies"},
    {"id": 85, "subject_id": 16, "chapter_name": "Test Chapter 3: Automated Testing"},
    {"id": 86, "subject_id": 16, "chapter_name": "Test Chapter 4: Performance Metrics"},
    {"id": 87, "subject_id": 16, "chapter_name": "Test Chapter 5: Integration Testing"},
    {"id": 88, "subject_id": 16, "chapter_name": "Test Chapter 6: User Acceptance"},
    {"id": 89, "subject_id": 16, "chapter_name": "Test Chapter 7: Security Protocols"},
    {"id": 90, "subject_id": 16, "chapter_name": "Test Chapter 8: Data Validation"},
    {"id": 91, "subject_id": 16, "chapter_name": "Test Chapter 9: API Validation"},
    {"id": 92, "subject_id": 16, "chapter_name": "Test Chapter 10: Final Deployment Verification"},
]

# Real Chapters and Topics Mapping for Class 10
ACADEMIC_DATA = {
    "Biology": [
        {
            "chapter": "Cell Cycle, Cell Division and Structure of Chromosome",
            "topics": ["Cell cycle phases", "Mitosis process", "Meiosis and its significance", "Structure of chromosome", "Centromere and Chromatids", "DNA structure overview", "Genes and chromatin", "Karyotypes", "Cell division checkpoints", "Spindle fiber formation"]
        },
        {
            "chapter": "Genetics and Laws of Inheritance",
            "topics": ["Mendel's experiments", "Monohybrid cross", "Dihybrid cross", "Law of Dominance", "Law of Segregation", "Law of Independent Assortment", "Sex determination in humans", "Sex-linked inheritance", "Genetic disorders overview", "Genotype vs Phenotype"]
        },
        {
            "chapter": "Absorption by Roots",
            "topics": ["Imbibition", "Diffusion", "Osmosis concept", "Active transport", "Turgidity and Flaccidity", "Plasmolysis", "Root hair structure", "Ascent of sap", "Root pressure", "Cohesion-tension theory"]
        },
        {
            "chapter": "Transpiration",
            "topics": ["Process of transpiration", "Stomatal transpiration", "Cuticular transpiration", "Lenticular transpiration", "Factors affecting transpiration", "Stomatal mechanism", "Guttation", "Bleeding in plants", "Potometer experiment", "Significance of transpiration"]
        },
        {
            "chapter": "Photosynthesis",
            "topics": ["Chloroplast structure", "Light-dependent phase", "Light-independent phase", "Photolysis of water", "Polymerisation", "Factors affecting photosynthesis", "Carbon cycle", "Destarching experiment", "Light screen experiment", "Importance of photosynthesis"]
        },
        {
            "chapter": "Chemical Coordination in Plants",
            "topics": ["Plant hormones overview", "Auxins and their functions", "Gibberellins", "Cytokinins", "Ethylene role", "Abscisic Acid (ABA)", "Phototropism", "Geotropism", "Hydrotropism", "Thigmotropism"]
        },
        {
            "chapter": "Circulatory System",
            "topics": ["Composition of blood", "Structure of human heart", "Double circulation", "Blood vessels comparison", "Cardiac cycle", "Systole and Diastole", "Hepatic portal system", "Lymphatic system", "Blood groups and Rh factor", "Electrocardiogram (ECG) basics"]
        },
        {
            "chapter": "Excretory System",
            "topics": ["Structure of kidney", "Nephron structure", "Ultrafiltration", "Selective reabsorption", "Tubular secretion", "Composition of urine", "Osmoregulation", "Artificial kidney (Dialysis)", "Excretory organs overview", "Micturition"]
        },
        {
            "chapter": "Nervous System",
            "topics": ["Structure of neuron", "Synapse and neurotransmitters", "Central Nervous System (Brain)", "Central Nervous System (Spinal cord)", "Reflex action", "Reflex arc pathway", "Peripheral Nervous System", "Autonomic Nervous System", "Sense organ: Eye structure", "Sense organ: Ear structure"]
        },
        {
            "chapter": "Endocrine System",
            "topics": ["Endocrine vs Exocrine", "Adrenal gland hormones", "Thyroid gland and Thyroxine", "Pituitary gland (Master gland)", "Pancreas as dual gland", "Feedback mechanism", "Gigantism and Dwarfism", "Goitre and Cretinism", "Diabetes mellitus vs insipidus", "Adrenaline response"]
        }
    ],
    "Chemistry": [
        {
            "chapter": "Periodic Properties and Variations of Physical Properties",
            "topics": ["Modern Periodic Law", "Periodic table layout", "Atomic size trends", "Metallic character trends", "Non-metallic character", "Ionisation Potential", "Electron Affinity", "Electronegativity", "Group 1, 17, and 18 properties", "Periodicity reasons"]
        },
        {
            "chapter": "Chemical Bonding",
            "topics": ["Octet rule", "Electrovalent bonding", "Covalent bonding", "Coordinate bonding", "Properties of electrovalent compounds", "Properties of covalent compounds", "Structure of NaCl", "Structure of H2O and NH3", "Structure of Ammonium ion", "Structure of Hydronium ion"]
        },
        {
            "chapter": "Acids, Bases and Salts",
            "topics": ["Definition of acids and bases", "Classification of acids", "Classification of bases", "pH scale concept", "Neutralisation reaction", "Preparation of normal salts", "Preparation of acid salts", "Properties of salts", "Action of heat on salts", "Water of crystallization"]
        },
        {
            "chapter": "Analytical Chemistry",
            "topics": ["Action of Ammonium Hydroxide on salt solutions", "Action of Sodium Hydroxide on salt solutions", "Precipitation reactions", "Colours of metal salts", "Amphoteric hydroxides", "Action of alkalis on metals", "Action of alkalis on metal oxides", "Detection of cations", "Detection of anions", "Analytical reagent applications"]
        },
        {
            "chapter": "Mole Concept and Stoichiometry",
            "topics": ["Gay-Lussac's Law", "Avogadro's Law", "Relative atomic mass", "Relative molecular mass", "Mole definition", "Molar volume of gas", "Empirical formula", "Molecular formula derivation", "Percentage composition", "Stoichiometric calculations"]
        },
        {
            "chapter": "Electrolysis",
            "topics": ["Electrolytes vs Non-electrolytes", "Mechanism of electrolysis", "Faraday's Laws overview", "Electrolysis of molten Lead Bromide", "Electrolysis of acidified water", "Electrolysis of Copper Sulphate", "Electroplating process", "Electro-refining of copper", "Extraction of Aluminium basics", "Applications of electrolysis"]
        },
        {
            "chapter": "Metallurgy",
            "topics": ["Occurrence of metals", "Ores and minerals", "Crushing and concentration", "Froth floatation", "Magnetic separation", "Gravity separation", "Roasting and Calcination", "Reduction methods", "Refining of metals", "Alloys definition and uses"]
        },
        {
            "chapter": "Study of Compounds: Hydrogen Chloride",
            "topics": ["Laboratory preparation of HCl", "Physical properties of HCl", "Chemical properties of HCl", "Fountain experiment", "Acidic nature of HCl gas", "Reaction with Ammonia", "Preparation of Hydrochloric acid", "Properties of Hydrochloric acid", "Precipitation of chlorides", "Uses of Hydrogen Chloride"]
        },
        {
            "chapter": "Study of Compounds: Ammonia",
            "topics": ["Laboratory preparation of NH3", "Haber's Process", "Physical properties of Ammonia", "Fountain experiment for Ammonia", "Basic nature of Ammonia", "Burning of Ammonia in Oxygen", "Catalytic oxidation of Ammonia", "Reaction with acids", "Ammonia as reducing agent", "Uses of Ammonia"]
        },
        {
            "chapter": "Organic Chemistry",
            "topics": ["Unique nature of carbon", "Homologous series", "Isomerism", "IUPAC nomenclature rules", "Alkanes properties", "Preparation of Methane", "Preparation of Ethane", "Alkenes properties", "Alkynes properties", "Alcohols and Carboxylic acids overview"]
        }
    ],
    "Computer Applications": [
        {
            "chapter": "Revision of Class IX Syllabus",
            "topics": ["Introduction to Java", "Data types and variables", "Operators in Java", "Conditional statements", "Iterative constructs", "Nested loops", "Switch case statements", "Basic input/output", "Wrapper classes", "Debugging code"]
        },
        {
            "chapter": "Class as the Basis of all Computation",
            "topics": ["Objects and classes relationship", "State and behavior", "Class definition syntax", "Object creation using new", "Message passing", "Instance variables", "Class variables (static)", "Access specifiers", "Encapsulation concept", "Creating custom classes"]
        },
        {
            "chapter": "User-defined Methods",
            "topics": ["Method definition syntax", "Method arguments", "Return types", "Call by value", "Call by reference", "Method overloading", "Recursion basic concept", "Pure vs Impure methods", "Static methods", "Local vs Instance scope"]
        },
        {
            "chapter": "Constructors",
            "topics": ["Constructor definition", "Default constructor", "Parameterized constructor", "Constructor overloading", "this keyword use", "Differences: Method vs Constructor", "Initialization block", "Memory allocation for objects", "Garbage collection basics", "Destructors concept"]
        },
        {
            "chapter": "Library Classes",
            "topics": ["Java package structure", "Importing packages", "java.lang package classes", "String class methods", "Math class methods", "Character class methods", "Boolean class", "Integer class methods", "Double class methods", "Autoboxing and Unboxing"]
        },
        {
            "chapter": "Encapsulation",
            "topics": ["Data hiding concept", "Private variables usage", "Getter and Setter methods", "Access control levels", "Packages and access modifiers", "Inheritance basic interface", "Polymorphism relationship", "Abstraction introduction", "Modular programming", "Security benefits"]
        },
        {
            "chapter": "Arrays",
            "topics": ["Defining 1D arrays", "Initializing arrays", "Array indexing", "Memory allocation for arrays", "Linear search", "Binary search", "Bubble sort", "Selection sort", "Length property", "Array bound exceptions"]
        },
        {
            "chapter": "String Handling",
            "topics": ["String declaration and init", "String immutability", "String comparison methods", "String extraction methods", "String modification methods", "String search methods", "String to char array conversion", "StringBuffer overview", "StringBuilder differences", "Common string programming patterns"]
        },
        {
            "chapter": "Double Dimensional Arrays",
            "topics": ["Defining 2D arrays", "Initializing 2D arrays", "Matrix representation", "Accessing 2D elements", "Row-wise processing", "Column-wise processing", "Diagonal elements operation", "Sum of matrix elements", "Transposing matrices", "Common 2D array programs"]
        },
        {
            "chapter": "Exception Handling",
            "topics": ["Errors vs Exceptions", "Checked vs Unchecked", "try-catch block syntax", "finally block", "throw vs throws", "ArithmeticException", "ArrayIndexOutOfBoundsException", "NullPointerException", "NumberFormatException", "Custom exceptions overview"]
        }
    ],
    "English I": [
        {
            "chapter": "Composition",
            "topics": ["Descriptive writing techniques", "Narrative writing elements", "Argumentative composition rules", "Short story writing", "Picture composition tips", "Structuring introductions", "Developing paragraphs", "Effective conclusions", "Vocabulary enrichment", "Common essay topics"]
        },
        {
            "chapter": "Letter Writing",
            "topics": ["Formal letter format", "Informal letter format", "Business correspondence", "Letters of complaint", "Letters to the Editor", "Letters of application", "Salutations and subscriptions", "Tone and style variations", "Body paragraph structure", "Standard endings"]
        },
        {
            "chapter": "Notice and Email Writing",
            "topics": ["Notice layout requirements", "Drafting catchy headings", "Including key details (Date/Time/Venue)", "Notice word limits", "Email format guidelines", "Email subject lines", "Formal email opening/closing", "Email body structure", "Notice vs Email link", "Sample notice-email pairs"]
        },
        {
            "chapter": "Comprehension",
            "topics": ["Skimming and scanning", "Locating specific answers", "Expressing ideas in own words", "Vocabulary in context", "Summarizing passages", "Word limit compliance", "Draft grid utilization", "Main ideas extraction", "Inference questions", "Direct factual questions"]
        },
        {
            "chapter": "Applied Grammar: Tenses",
            "topics": ["Simple present vs progressive", "Past tense varieties", "Future tense usage", "Present perfect continuous", "Past perfect active", "Future perfect active", "Sequence of tenses", "Time markers", "Common tense errors", "Verb conjugation patterns"]
        },
        {
            "chapter": "Applied Grammar: Prepositions",
            "topics": ["Prepositions of place", "Prepositions of time", "Prepositions of direction", "Phrasal verbs basics", "Adjective + Preposition combinations", "Noun + Preposition combinations", "Verb + Preposition combinations", "Preposition omission rules", "Common preposition mistakes", "Prepositional phrases"]
        },
        {
            "chapter": "Applied Grammar: Voice and Speech",
            "topics": ["Active to passive rules", "Passive to active rules", "Passive of modal verbs", "Passive of commands", "Direct to indirect speech rules", "Reporting verbs selection", "Tense shifts in indirect speech", "Pronoun changes in speech", "Time and place word shifts", "Assertive and interrogative indirect speech"]
        },
        {
            "chapter": "Applied Grammar: Synthesis of Sentences",
            "topics": ["Using participles", "Using infinitives", "Using nouns in apposition", "Using conjunctions", "Creating simple sentences", "Creating compound sentences", "Creating complex sentences", "Relative clauses usage", "Noun clauses usage", "Adverbial clauses usage"]
        },
        {
            "chapter": "Applied Grammar: Transformation of Sentences",
            "topics": ["Interchanging Degrees of Comparison", "Interchanging Active/Passive Voice", "Interchanging Direct/Indirect Speech", "Using 'Too/Enough'", "Using 'No sooner... than'", "Using 'Hardly... when'", "Using 'Unless/If'", "Interchanging Affirmative/Negative", "Interchanging Exclamatory/Assertive", "Interchanging As soon as"]
        },
        {
            "chapter": "Applied Grammar: Subject-Verb Agreement",
            "topics": ["Singular and plural subjects", "Compound subjects joined by 'and'", "Subjects joined by 'or/nor'", "Collective nouns agreement", "Indefinite pronouns agreement", "Nouns plural in form but singular in meaning", "Phrases between subject and verb", "Here and there sentences", "Relative pronoun as subject", "Measurement and amount agreement"]
        }
    ],
    "Geography": [
        {
            "chapter": "Interpretation of Topographical Sheets",
            "topics": ["Four-figure grid reference", "Six-figure grid reference", "Scale conversion", "Directions and Bearings", "Calculating Area", "Interpreting Contour patterns", "Identifying Drainage patterns", "Identifying Settlement patterns", "Identifying Land use", "Conventional signs and symbols"]
        },
        {
            "chapter": "Map of India Study",
            "topics": ["Mountain ranges location", "Major rivers location", "Plains and Plateaus", "Water bodies location", "Passes and Gulfs", "Latitude and Longitude lines", "Wind directions mapping", "Soil distribution mapping", "Mineral distribution mapping", "Populated cities location"]
        },
        {
            "chapter": "Climate of India",
            "topics": ["Factors affecting India's climate", "South-West Monsoon season", "North-East Monsoon season", "Western Disturbances", "Tropical Cyclones", "Jet Streams impact", "Continental vs Equable climate", "Rain shadow effect", "El Nino and La Nina", "Climate variation case studies"]
        },
        {
            "chapter": "Soils of India",
            "topics": ["Alluvial soil properties", "Black (Regur) soil properties", "Red soil properties", "Laterite soil properties", "In-situ vs Ex-situ soil", "Soil erosion causes", "Soil conservation methods", "Afforestation impact", "Terrace farming benefits", "Shelter belts usage"]
        },
        {
            "chapter": "Natural Vegetation of India",
            "topics": ["Tropical Evergreen forests", "Tropical Deciduous (Monsoon) forests", "Tropical Desert vegetation", "Littoral (Mangrove) forests", "Montane (Mountain) vegetation", "Importance of forests", "Forest conservation policies", "Social Forestry concept", "Agroforestry concept", "Afforestation initiatives"]
        },
        {
            "chapter": "Water Resources",
            "topics": ["Importance of irrigation", "Canal irrigation details", "Well and Tube-well irrigation", "Tank irrigation", "Drip irrigation advantages", "Sprinkler irrigation advantages", "Rainwater harvesting methods", "Watershed management", "Dams and multi-purpose projects", "Water conservation practices"]
        },
        {
            "chapter": "Mineral and Energy Resources",
            "topics": ["Iron Ore mining and uses", "Coal types and distribution", "Petroleum refining and uses", "Natural Gas resources", "Solar energy potential", "Wind energy potential", "Hydel power projects", "Biogas production", "Nuclear energy resources", "Conservation of energy resources"]
        },
        {
            "chapter": "Agriculture in India",
            "topics": ["Salient features of Indian agriculture", "Subsistence farming vs Commercial", "Rice cultivation conditions", "Wheat cultivation conditions", "Millets and Pulses", "Sugarcane and Cotton", "Tea and Coffee cultivation", "Problems of Indian agriculture", "Green Revolution details", "Agricultural reforms"]
        },
        {
            "chapter": "Manufacturing Industries in India",
            "topics": ["Agro-based vs Mineral-based", "Tata Iron and Steel Company (TISCO)", "Sugar industry distribution", "Cotton textile industry factors", "Silk and Woolen industries", "Petrochemical industries", "Information Technology hubs", "Role of manufacturing in economy", "Industrial pollution", "Industrial corridors"]
        },
        {
            "chapter": "Transport and Waste Management",
            "topics": ["Roadways advantages and classes", "Railways network growth", "Waterways coastal and inland", "Airways national and international", "Impact of waste accumulation", "Methods of safe waste disposal", "Composting and Vermicomposting", "3 Rs: Reduce, Reuse, Recycle", "Segregation of waste", "E-waste management"]
        }
    ],
    "Hindi": [
        {
            "chapter": "Sahitya Sagar: Short Stories",
            "topics": ["Baat Athanni Ki summary", "Kaki character study", "Maha Yajna Ka Puraskar theme", "Netaji Ka Chashma overview", "Apna Apna Bhagya analysis", "Bade Ghar Ki Beti analysis", "Sandehi context", "Bheed Mein Khoya Aadmi summary", "Doi Bahtareen Kahaniyan", "Character analysis of key protagonists"]
        },
        {
            "chapter": "Sahitya Sagar: Poems",
            "topics": ["Sakhi analysis", "Giridhar Ki Kundaliyan theme", "Swarg Bana Sakte Hain summary", "Wah Todti Patthar overview", "Surdas Ke Pad explanation", "Vinay Ke Pad explanation", "Bhichhuk context", "Chalna Hamara Kaam Hai summary", "Matri Mandir Ki Or theme", "Poetic devices and rhyme schemes"]
        },
        {
            "chapter": "Naya Rasta: Novel Studies",
            "topics": ["Character study of Sushma", "Social issues depicted", "Dowry system reflection", "Women empowerment themes", "Summary of initial chapters", "Summary of middle chapters", "Climax and ending analysis", "Moral and educational value", "Plot structure description", "Important dialogues interpretation"]
        },
        {
            "chapter": "Ekanki Sanchay: One-Act Plays",
            "topics": ["Sanskar Aur Bhavna analysis", "Bahu Ki Vida summary", "Matri Bhumi Ka Maan theme", "Sukhi Dali overview", "Deepdan dramatic elements", "Character analysis of Panna Dhai", "Moral values in plays", "Stage setup and dialogues", "Conflict resolution in plays", "Historical relevance of themes"]
        },
        {
            "chapter": "Hindi Vyakaran: Essay Writing",
            "topics": ["Descriptive essay topics", "Narrative essay topics", "Reflective essay guidelines", "Story writing from outlines", "Structuring Hindi essays", "Paragraph transition words", "Enriching Hindi vocabulary", "Common grammatical errors", "Use of idioms (Muhavare)", "Sample essay writing practice"]
        },
        {
            "chapter": "Hindi Vyakaran: Letter Writing",
            "topics": ["Formal letter format (Aupcharik)", "Informal letter format (Anaupcharik)", "Letters to Municipal Corporation", "Letters to Newspaper Editors", "Business and school applications", "Standard Hindi salutations", "Closing phrases in letters", "Body content organization", "Tone and register rules", "Sample letter writing drills"]
        },
        {
            "chapter": "Hindi Vyakaran: Comprehension (Apathit Gadyansh)",
            "topics": ["Reading comprehension strategies", "Answering directly from text", "Identifying main themes", "Finding synonyms and antonyms", "Writing titles for passages", "Summarization techniques", "Sentence structure in answers", "Factual vs inferential questions", "Time management during exam", "Mock practice comprehension"]
        },
        {
            "chapter": "Hindi Vyakaran: Grammar Rules",
            "topics": ["Noun (Sangya) classification", "Pronoun (Sarvanam) types", "Adjective (Visheshan) changes", "Verb (Kriya) conjugation", "Tense (Kaal) transformations", "Gender (Ling) changing rules", "Number (Vachan) changing rules", "Case markers (Karak)", "Prefix and Suffix (Upsarg-Pratyay)", "Conjunctions (Avyay) usage"]
        },
        {
            "chapter": "Hindi Vyakaran: Vocabulary and Idioms",
            "topics": ["Synonyms (Paryayvachi)", "Antonyms (Vilom Shabd)", "Homophones (Shrutisambhinnarthak)", "One word substitution (Anek ke liye ek)", "Idioms (Muhavare) meanings", "Proverbs (Lokoktiyan) usage", "Correcting spelling errors", "Correcting sentence syntax", "Foreign words in Hindi", "Technical term translations"]
        },
        {
            "chapter": "Hindi Vyakaran: Abstract and Applied Syntax",
            "topics": ["Simple to compound sentence", "Compound to complex sentence", "Direct to indirect quotes", "Changing voice (Krit to Karma)", "Identifying parts of speech", "Punctuation marks (Viram Chihna)", "Syntactic transformation drills", "Common writing mistakes", "Abstract noun formation", "Adjective formation from nouns"]
        }
    ],
    "History & Civics": [
        {
            "chapter": "The Union Legislature",
            "topics": ["Lok Sabha composition", "Rajya Sabha composition", "Qualifications for membership", "Term of the Houses", "Powers of Speaker", "Legislative procedures (Bills)", "Financial powers of Parliament", "Control over Executive", "Sessions of Parliament", "Judicial and Electoral powers"]
        },
        {
            "chapter": "The Union Executive",
            "topics": ["President: Qualification & Election", "President: Legislative powers", "President: Executive & Financial powers", "President: Emergency powers", "Vice-President role", "Prime Minister appointment", "Council of Ministers", "Collective responsibility", "Individual responsibility", "Cabinet vs Council of Ministers"]
        },
        {
            "chapter": "The Judiciary",
            "topics": ["Supreme Court composition", "Supreme Court qualifications", "Supreme Court jurisdiction", "High Court composition", "High Court jurisdiction", "Subordinate Courts structure", "Lok Adalats concept", "Judicial Review", "Court of Record", "Independence of Judiciary"]
        },
        {
            "chapter": "The First War of Independence, 1857",
            "topics": ["Political causes", "Economic causes", "Social and Religious causes", "Military causes", "Immediate cause (Greased cartridges)", "Main events summary", "Causes of failure", "Results of the War", "Queen's Proclamation 1858", "Rise of nationalism aftermath"]
        },
        {
            "chapter": "Growth of Nationalism and Early Nationalists",
            "topics": ["Factors promoting nationalism", "Role of vernacular press", "Socio-religious reform movements", "Founding of Indian National Congress", "Objectives of early INC", "Early Nationalists beliefs", "Methods of early Nationalists", "Dadabhai Naoroji contribution", "Surendranath Banerjee role", "Gopal Krishna Gokhale role"]
        },
        {
            "chapter": "Assertive Nationalism and Partition of Bengal",
            "topics": ["Assertive Nationalists beliefs", "Methods of Assertive Nationalists", "Causes of Bengal Partition", "Swadeshi and Boycott movements", "Founding of Muslim League", "Surat Split of 1907", "Bal Gangadhar Tilak", "Bipin Chandra Pal", "Lala Lajpat Rai", "Impact of Partition reversal"]
        },
        {
            "chapter": "Mass Phase of the National Movement (1915-1947)",
            "topics": ["Mahatma Gandhi's entry", "Non-Cooperation Movement", "Civil Disobedience Movement", "Quit India Movement", "Rowlatt Act and Jallianwala Bagh", "Simon Commission protests", "Dandi March details", "Subhas Chandra Bose and INA", "Cabinet Mission Plan", "Mountbatten Plan and Partition"]
        },
        {
            "chapter": "First World War and Rise of Dictatorships",
            "topics": ["Causes of First World War", "Sarajevo crisis", "Treaty of Versailles conditions", "League of Nations formation", "Rise of Fascism in Italy", "Mussolini's policies", "Rise of Nazism in Germany", "Hitler's expansionist policies", "Impact of dictatorship on Europe", "Failure of League of Nations"]
        },
        {
            "chapter": "Second World War and United Nations",
            "topics": ["Causes of Second World War", "Invasion of Poland", "Major events and fronts", "Bombing of Hiroshima & Nagasaki", "Consequences of the War", "Establishment of United Nations", "UN Charter objectives", "General Assembly details", "Security Council functions", "International Court of Justice"]
        },
        {
            "chapter": "UN Agencies and Non-Aligned Movement",
            "topics": ["UNESCO objectives and work", "UNICEF objectives and work", "WHO objectives and work", "Non-Aligned Movement definition", "Panchsheel principles", "Founding leaders of NAM", "NAM summits summary", "NAM role during Cold War", "UN peace-keeping operations", "Relevance of NAM today"]
        }
    ],
    "Maths": [
        {
            "chapter": "Goods and Services Tax (GST)",
            "topics": ["Concept of CGST, SGST, IGST", "Intra-state transactions", "Inter-state transactions", "Input Tax Credit (ITC)", "Computing tax liability", "GST billing format", "Exempted goods and services", "GST rate structures", "Consumer price calculation", "Multi-stage taxation problems"]
        },
        {
            "chapter": "Banking (Recurring Deposit Accounts)",
            "topics": ["Recurring Deposit concept", "Formula for Interest", "Formula for Maturity Value", "Calculating monthly installment", "Calculating rate of interest", "Calculating time period (months)", "Bank passbook entries", "Maturity calculation problems", "Tax deduction on interest", "Compound interest comparison"]
        },
        {
            "chapter": "Linear Inequations",
            "topics": ["Linear inequations definition", "Properties of inequations", "Solving inequations in R", "Solving inequations in N", "Solving inequations in Z", "Representing solution on Number Line", "Combining two inequations", "Real numbers interval notation", "Word problems on inequations", "Graphical representations"]
        },
        {
            "chapter": "Quadratic Equations",
            "topics": ["Quadratic equation standard form", "Solving by Factorisation", "Solving by Quadratic Formula", "Nature of roots (Discriminant)", "Real and equal roots condition", "Imaginary roots concept", "Word problems on numbers", "Word problems on speed and time", "Word problems on area and dimensions", "Solving equations reducible to quadratic"]
        },
        {
            "chapter": "Ratio and Proportion",
            "topics": ["Ratio definition and properties", "Proportion definition", "Continued proportion", "Mean proportional", "Componendo and Dividendo", "Invertendo and Alternando", "Direct applications of properties", "Word problems on ratio", "K-method for proportion", "Solving algebraic equations using proportion properties"]
        },
        {
            "chapter": "Remainder and Factor Theorems",
            "topics": ["Polynomial division concept", "Remainder Theorem statement", "Factor Theorem statement", "Finding remainders", "Factoring cubic polynomials", "Finding unknown constants", "Common factor problems", "Synthesized division method", "Solving polynomial equations", "Multiple root conditions"]
        },
        {
            "chapter": "Matrices",
            "topics": ["Order of a matrix", "Types of matrices", "Addition of matrices", "Subtraction of matrices", "Scalar multiplication", "Multiplication of two matrices", "Identity matrix concept", "Transpose of matrix", "Solving matrix equations", "Properties of matrix multiplication"]
        },
        {
            "chapter": "Arithmetic and Geometric Progressions",
            "topics": ["AP general term (nth term)", "AP sum of n terms", "Word problems on AP", "Arithmetic Mean", "GP general term (nth term)", "GP sum of n terms", "Geometric Mean", "Word problems on GP", "GP sum to infinity basic", "Mixed AP and GP problems"]
        },
        {
            "chapter": "Reflection and Coordinate Geometry",
            "topics": ["Reflection in x-axis", "Reflection in y-axis", "Reflection in origin", "Invariant points", "Section formula", "Midpoint formula", "Slope of a line", "Equation of a line: Point-Slope form", "Equation of a line: Slope-Intercept form", "Conditions for parallel and perpendicular lines"]
        },
        {
            "chapter": "Trigonometry",
            "topics": ["Trigonometric identities proof", "Complementary angles relations", "Heights and Distances concept", "Angle of Elevation", "Angle of Depression", "Double observation problems", "Three-dimensional basic heights", "Trigonometric tables usage", "Speed and distance application", "Solving basic trigonometric equations"]
        }
    ],
    "Physics": [
        {
            "chapter": "Force, Work, Power and Energy",
            "topics": ["Moment of force", "Conditions for equilibrium", "Center of gravity", "Uniform circular motion", "Centripetal vs Centrifugal force", "Work done formula", "Power and its units", "Kinetic and Potential Energy", "Law of Conservation of Energy", "Levers and pulleys basics"]
        },
        {
            "chapter": "Light: Refraction at Plane Surfaces",
            "topics": ["Refraction concept", "Laws of refraction", "Refractive Index formula", "Principle of reversibility", "Lateral displacement", "Refraction through prism", "Critical Angle", "Total Internal Reflection", "Mirage and optical fibers", "Real and Apparent depth"]
        },
        {
            "chapter": "Light: Refraction through Lenses",
            "topics": ["Convex and Concave lenses", "Principal focus and focal length", "Ray diagrams for convex lens", "Ray diagrams for concave lens", "Lens Formula", "Magnification formula", "Sign convention rules", "Power of a lens", "Simple microscope basics", "Corrective lenses for eye defects"]
        },
        {
            "chapter": "Light: Spectrum",
            "topics": ["Dispersion of white light", "Recombination of spectrum", "Electromagnetic spectrum bands", "Properties of Infrared rays", "Properties of Ultraviolet rays", "Scattering of light", "Why sky is blue", "Red colour for danger signals", "Spectrometer introduction", "Prism spectrum vs rainbow"]
        },
        {
            "chapter": "Sound",
            "topics": ["Reflexion of sound (Echoes)", "Determining speed of sound", "Sonar applications", "Natural vibrations", "Damped vibrations", "Forced vibrations", "Resonance condition", "Characteristics of sound (Loudness)", "Characteristics of sound (Pitch)", "Characteristics of sound (Quality/Timbre)"]
        },
        {
            "chapter": "Current Electricity",
            "topics": ["Electric current and charge", "Ohm's Law verification", "Factors affecting resistance", "Specific resistance (Resistivity)", "Resistors in series", "Resistors in parallel", "Electromotive Force (EMF)", "Terminal voltage", "Internal resistance of cell", "Electrical energy and power calculations"]
        },
        {
            "chapter": "Household Circuits",
            "topics": ["Transmission of power", "Three-wire system", "Live, Neutral, and Earth wires", "Function of a fuse", "Miniature Circuit Breaker (MCB)", "Earthing of appliances", "Three-pin plug configuration", "Two-way switch circuit", "Safety precautions", "Calculating electricity bill (kWh)"]
        },
        {
            "chapter": "Electromagnetism",
            "topics": ["Magnetic field of straight wire", "Magnetic field of a loop", "Electromagnet vs Permanent magnet", "Force on conductor in magnetic field", "Fleming's Left Hand Rule", "Simple DC Motor construction", "Electromagnetic Induction", "Fleming's Right Hand Rule", "Simple AC Generator construction", "Transformer step-up and step-down"]
        },
        {
            "chapter": "Calorimetry",
            "topics": ["Heat capacity vs Specific heat", "Principle of Method of Mixtures", "Calorimeter construction", "Latent heat concept", "Specific latent heat of fusion", "Specific latent heat of vaporization", "Heating curve of water", "Regelation", "Greenhouse effect details", "Numerical problems on heat exchange"]
        },
        {
            "chapter": "Radioactivity",
            "topics": ["Structure of atom and nucleus", "Radioactive decay concept", "Alpha particle properties", "Beta particle properties", "Gamma radiation properties", "Nuclear changes during decay", "Nuclear Fission reaction", "Nuclear Fusion reaction", "Background radiation", "Safety precautions and uses of isotopes"]
        }
    ],
    "testing subject": [
        {
            "chapter": "Test Chapter 1: Introduction to Testing",
            "topics": ["Test Topic 1.1", "Test Topic 1.2", "Test Topic 1.3", "Test Topic 1.4", "Test Topic 1.5", "Test Topic 1.6", "Test Topic 1.7", "Test Topic 1.8", "Test Topic 1.9", "Test Topic 1.10"]
        },
        {
            "chapter": "Test Chapter 2: Test Methodologies",
            "topics": ["Test Topic 2.1", "Test Topic 2.2", "Test Topic 2.3", "Test Topic 2.4", "Test Topic 2.5", "Test Topic 2.6", "Test Topic 2.7", "Test Topic 2.8", "Test Topic 2.9", "Test Topic 2.10"]
        },
        {
            "chapter": "Test Chapter 3: Automated Testing",
            "topics": ["Test Topic 3.1", "Test Topic 3.2", "Test Topic 3.3", "Test Topic 3.4", "Test Topic 3.5", "Test Topic 3.6", "Test Topic 3.7", "Test Topic 3.8", "Test Topic 3.9", "Test Topic 3.10"]
        },
        {
            "chapter": "Test Chapter 4: Performance Metrics",
            "topics": ["Test Topic 4.1", "Test Topic 4.2", "Test Topic 4.3", "Test Topic 4.4", "Test Topic 4.5", "Test Topic 4.6", "Test Topic 4.7", "Test Topic 4.8", "Test Topic 4.9", "Test Topic 4.10"]
        },
        {
            "chapter": "Test Chapter 5: Integration Testing",
            "topics": ["Test Topic 5.1", "Test Topic 5.2", "Test Topic 5.3", "Test Topic 5.4", "Test Topic 5.5", "Test Topic 5.6", "Test Topic 5.7", "Test Topic 5.8", "Test Topic 5.9", "Test Topic 5.10"]
        },
        {
            "chapter": "Test Chapter 6: User Acceptance",
            "topics": ["Test Topic 6.1", "Test Topic 6.2", "Test Topic 6.3", "Test Topic 6.4", "Test Topic 6.5", "Test Topic 6.6", "Test Topic 6.7", "Test Topic 6.8", "Test Topic 6.9", "Test Topic 6.10"]
        },
        {
            "chapter": "Test Chapter 7: Security Protocols",
            "topics": ["Test Topic 7.1", "Test Topic 7.2", "Test Topic 7.3", "Test Topic 7.4", "Test Topic 7.5", "Test Topic 7.6", "Test Topic 7.7", "Test Topic 7.8", "Test Topic 7.9", "Test Topic 7.10"]
        },
        {
            "chapter": "Test Chapter 8: Data Validation",
            "topics": ["Test Topic 8.1", "Test Topic 8.2", "Test Topic 8.3", "Test Topic 8.4", "Test Topic 8.5", "Test Topic 8.6", "Test Topic 8.7", "Test Topic 8.8", "Test Topic 8.9", "Test Topic 8.10"]
        },
        {
            "chapter": "Test Chapter 9: API Validation",
            "topics": ["Test Topic 9.1", "Test Topic 9.2", "Test Topic 9.3", "Test Topic 9.4", "Test Topic 9.5", "Test Topic 9.6", "Test Topic 9.7", "Test Topic 9.8", "Test Topic 9.9", "Test Topic 9.10"]
        },
        {
            "chapter": "Test Chapter 10: Final Deployment Verification",
            "topics": ["Test Topic 10.1", "Test Topic 10.2", "Test Topic 10.3", "Test Topic 10.4", "Test Topic 10.5", "Test Topic 10.6", "Test Topic 10.7", "Test Topic 10.8", "Test Topic 10.9", "Test Topic 10.10"]
        }
    ]
}

# Mapped list of subjects and their IDs
SUBJECT_MAP = {
    5: "Chemistry",
    1: "English I",
    9: "Geography",
    2: "Hindi",
    8: "History & Civics",
    3: "Maths",
    4: "Physics",
    16: "testing subject"
}

# Already created chapters with their IDs (provided from DB)
CREATED_CHAPTERS = [
    # Chemistry (subject_id: 5)
    {"id": 12, "subject_id": 5, "chapter_name": "Periodic Properties and Variations of Physical Properties"},
    {"id": 13, "subject_id": 5, "chapter_name": "Chemical Bonding"},
    {"id": 14, "subject_id": 5, "chapter_name": "Acids, Bases and Salts"},
    {"id": 15, "subject_id": 5, "chapter_name": "Analytical Chemistry"},
    {"id": 16, "subject_id": 5, "chapter_name": "Mole Concept and Stoichiometry"},
    {"id": 17, "subject_id": 5, "chapter_name": "Electrolysis"},
    {"id": 18, "subject_id": 5, "chapter_name": "Metallurgy"},
    {"id": 19, "subject_id": 5, "chapter_name": "Study of Compounds: Hydrogen Chloride"},
    {"id": 20, "subject_id": 5, "chapter_name": "Study of Compounds: Ammonia"},
    {"id": 21, "subject_id": 5, "chapter_name": "Organic Chemistry"},

    # English I (subject_id: 1)
    {"id": 23, "subject_id": 1, "chapter_name": "Composition"},
    {"id": 24, "subject_id": 1, "chapter_name": "Letter Writing"},
    {"id": 25, "subject_id": 1, "chapter_name": "Notice and Email Writing"},
    {"id": 26, "subject_id": 1, "chapter_name": "Comprehension"},
    {"id": 27, "subject_id": 1, "chapter_name": "Applied Grammar: Tenses"},
    {"id": 28, "subject_id": 1, "chapter_name": "Applied Grammar: Prepositions"},
    {"id": 29, "subject_id": 1, "chapter_name": "Applied Grammar: Voice and Speech"},
    {"id": 30, "subject_id": 1, "chapter_name": "Applied Grammar: Synthesis of Sentences"},
    {"id": 31, "subject_id": 1, "chapter_name": "Applied Grammar: Transformation of Sentences"},
    {"id": 32, "subject_id": 1, "chapter_name": "Applied Grammar: Subject-Verb Agreement"},

    # Geography (subject_id: 9)
    {"id": 33, "subject_id": 9, "chapter_name": "Interpretation of Topographical Sheets"},
    {"id": 34, "subject_id": 9, "chapter_name": "Map of India Study"},
    {"id": 35, "subject_id": 9, "chapter_name": "Climate of India"},
    {"id": 36, "subject_id": 9, "chapter_name": "Soils of India"},
    {"id": 37, "subject_id": 9, "chapter_name": "Natural Vegetation of India"},
    {"id": 38, "subject_id": 9, "chapter_name": "Water Resources"},
    {"id": 39, "subject_id": 9, "chapter_name": "Mineral and Energy Resources"},
    {"id": 40, "subject_id": 9, "chapter_name": "Agriculture in India"},
    {"id": 41, "subject_id": 9, "chapter_name": "Manufacturing Industries in India"},
    {"id": 42, "subject_id": 9, "chapter_name": "Transport and Waste Management"},

    # Hindi (subject_id: 2)
    {"id": 43, "subject_id": 2, "chapter_name": "Sahitya Sagar: Short Stories"},
    {"id": 44, "subject_id": 2, "chapter_name": "Sahitya Sagar: Poems"},
    {"id": 45, "subject_id": 2, "chapter_name": "Naya Rasta: Novel Studies"},
    {"id": 46, "subject_id": 2, "chapter_name": "Ekanki Sanchay: One-Act Plays"},
    {"id": 47, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Essay Writing"},
    {"id": 48, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Letter Writing"},
    {"id": 49, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Comprehension (Apathit Gadyansh)"},
    {"id": 50, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Grammar Rules"},
    {"id": 51, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Vocabulary and Idioms"},
    {"id": 52, "subject_id": 2, "chapter_name": "Hindi Vyakaran: Abstract and Applied Syntax"},

    # History & Civics (subject_id: 8)
    {"id": 53, "subject_id": 8, "chapter_name": "The Union Legislature"},
    {"id": 54, "subject_id": 8, "chapter_name": "The Union Executive"},
    {"id": 55, "subject_id": 8, "chapter_name": "The Judiciary"},
    {"id": 56, "subject_id": 8, "chapter_name": "The First War of Independence, 1857"},
    {"id": 57, "subject_id": 8, "chapter_name": "Growth of Nationalism and Early Nationalists"},
    {"id": 58, "subject_id": 8, "chapter_name": "Assertive Nationalism and Partition of Bengal"},
    {"id": 59, "subject_id": 8, "chapter_name": "Mass Phase of the National Movement (1915-1947)"},
    {"id": 60, "subject_id": 8, "chapter_name": "First World War and Rise of Dictatorships"},
    {"id": 61, "subject_id": 8, "chapter_name": "Second World War and United Nations"},
    {"id": 62, "subject_id": 8, "chapter_name": "UN Agencies and Non-Aligned Movement"},

    # Maths (subject_id: 3)
    {"id": 63, "subject_id": 3, "chapter_name": "Goods and Services Tax (GST)"},
    {"id": 64, "subject_id": 3, "chapter_name": "Banking (Recurring Deposit Accounts)"},
    {"id": 65, "subject_id": 3, "chapter_name": "Linear Inequations"},
    {"id": 66, "subject_id": 3, "chapter_name": "Quadratic Equations"},
    {"id": 67, "subject_id": 3, "chapter_name": "Ratio and Proportion"},
    {"id": 68, "subject_id": 3, "chapter_name": "Remainder and Factor Theorems"},
    {"id": 69, "subject_id": 3, "chapter_name": "Matrices"},
    {"id": 70, "subject_id": 3, "chapter_name": "Arithmetic and Geometric Progressions"},
    {"id": 71, "subject_id": 3, "chapter_name": "Reflection and Coordinate Geometry"},
    {"id": 72, "subject_id": 3, "chapter_name": "Trigonometry"},

    # Physics (subject_id: 4)
    {"id": 73, "subject_id": 4, "chapter_name": "Force, Work, Power and Energy"},
    {"id": 74, "subject_id": 4, "chapter_name": "Light: Refraction at Plane Surfaces"},
    {"id": 75, "subject_id": 4, "chapter_name": "Light: Refraction through Lenses"},
    {"id": 76, "subject_id": 4, "chapter_name": "Light: Spectrum"},
    {"id": 77, "subject_id": 4, "chapter_name": "Sound"},
    {"id": 78, "subject_id": 4, "chapter_name": "Current Electricity"},
    {"id": 79, "subject_id": 4, "chapter_name": "Household Circuits"},
    {"id": 80, "subject_id": 4, "chapter_name": "Electromagnetism"},
    {"id": 81, "subject_id": 4, "chapter_name": "Calorimetry"},
    {"id": 82, "subject_id": 4, "chapter_name": "Radioactivity"},

    # testing subject (subject_id: 16)
    {"id": 83, "subject_id": 16, "chapter_name": "Test Chapter 1: Introduction to Testing"},
    {"id": 84, "subject_id": 16, "chapter_name": "Test Chapter 2: Test Methodologies"},
    {"id": 85, "subject_id": 16, "chapter_name": "Test Chapter 3: Automated Testing"},
    {"id": 86, "subject_id": 16, "chapter_name": "Test Chapter 4: Performance Metrics"},
    {"id": 87, "subject_id": 16, "chapter_name": "Test Chapter 5: Integration Testing"},
    {"id": 88, "subject_id": 16, "chapter_name": "Test Chapter 6: User Acceptance"},
    {"id": 89, "subject_id": 16, "chapter_name": "Test Chapter 7: Security Protocols"},
    {"id": 90, "subject_id": 16, "chapter_name": "Test Chapter 8: Data Validation"},
    {"id": 91, "subject_id": 16, "chapter_name": "Test Chapter 9: API Validation"},
    {"id": 92, "subject_id": 16, "chapter_name": "Test Chapter 10: Final Deployment Verification"},
]

def authenticate(username, password):
    url = f"{BASE_URL}/auth/login"
    print(f"Authenticating user '{username}' at {url}...")

    try:
        response = requests.post(url, json={"username": username, "password": password})
        if response.status_code in [200, 201]:
            data = response.json()
            token = data.get("accessToken")
            print("Authentication successful!")
            return token

        print(f"Authentication failed (Status code: {response.status_code}): {response.text}")
        return None
    except Exception as e:
        print(f"Authentication error: {e}")
        return None


def add_topics(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Group created chapters by subject_id to align with ACADEMIC_DATA arrays
    grouped_by_subject = {}
    for ch in CREATED_CHAPTERS:
        s_id = ch["subject_id"]
        grouped_by_subject.setdefault(s_id, []).append(ch)

    # For each subject, sort chapters by id/sequence to align indices
    for s_id, chapters in grouped_by_subject.items():
        subject_name = SUBJECT_MAP.get(s_id)
        if not subject_name:
            continue
            
        subj_data = ACADEMIC_DATA.get(subject_name)
        if not subj_data:
            print(f"No topics configuration found for {subject_name}. Skipping.")
            continue

        print(f"\n==================================================")
        print(f"Adding Topics for Subject: {subject_name} (ID: {s_id})")
        print(f"==================================================")

        # Sort by chapter ID to keep index alignment consistent
        chapters.sort(key=lambda x: x["id"])

        for index, ch in enumerate(chapters):
            chapter_id = ch["id"]
            chapter_name = ch["chapter_name"]
            
            # Match current chapter to mapped topics array
            if index >= len(subj_data):
                print(f"  -> No topics mapped for index {index} in {subject_name}. Skipping.")
                continue

            mapped_topics = subj_data[index]["topics"]
            topics_payload = []
            for tp_idx, tp_name in enumerate(mapped_topics, start=1):
                topics_payload.append({
                    "topicName": tp_name,
                    "sequenceNo": tp_idx
                })

            payload = {
                "session": SESSION,
                "subjectId": s_id,
                "chapterId": chapter_id,
                "topics": topics_payload
            }

            url = f"{BASE_URL}/academic/subject-topic"
            try:
                response = requests.post(url, json=payload, headers=headers)
                if response.status_code in [200, 201]:
                    print(f"  [OK] Added {len(topics_payload)} topics to: {chapter_name} (ID: {chapter_id})")
                else:
                    print(f"  [FAIL] Chapter: {chapter_name} (ID: {chapter_id}) - Status: {response.status_code}: {response.text}")
            except Exception as e:
                print(f"  [ERROR] Request failed for chapter ID {chapter_id}: {e}")


def main():
    # Prompt confirmation safeguard before execution
    print("Safety Check: This script will add topics to already created chapters.")
    confirmation = input("Do you want to proceed? (yes/no): ").strip().lower()
    if confirmation != "yes":
        print("Execution cancelled.")
        return

    token = authenticate(USERNAME, PASSWORD)
    if not token:
        print("Exiting due to authentication failure.")
        return

    add_topics(token)
    print("\nTopics addition process finished.")


if __name__ == "__main__":
    main()
