import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Camera, AlertTriangle, CheckCircle, Clock, Settings, Shield, Heart, History, User, 
  HelpCircle, CreditCard, ChevronRight, ChevronLeft, BookOpen, PhoneCall, Plus, Search, 
  ArrowRight, Upload, Trash2, Download, RefreshCw, Play, Flame, Check, Eye, Video, Sparkles, Send
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface PetProfile {
  id: string;
  name: string;
  species: 'Dog' | 'Cat';
  breed: string;
  age: string;
  weight: string;
  allergies: string;
  medications: string;
  conditions: string;
  vaccines: string;
  microchip: string;
  avatar: string;
}

interface ScanResult {
  id: string;
  date: string;
  petId: string;
  imageUrl: string;
  imageQualityScore: number;
  imageQualityExplanation: string;
  isUsable: boolean;
  detectedSpecies: string;
  speciesConfidence: number;
  bodyPart: string;
  estimatedSize: string;
  severityLevel: 1 | 2 | 3 | 4 | 5;
  severityExplanation: string;
  confidenceScore: number;
  features: {
    swelling: 'None' | 'Mild' | 'Moderate' | 'Severe';
    redness: 'None' | 'Mild' | 'Moderate' | 'Severe';
    discharge: 'None' | 'Serous (Clear)' | 'Purulent (Pus)' | 'Bloody';
    bleeding: 'None' | 'Mild (Spotting)' | 'Active' | 'Severe';
    healingStage: string;
  };
  isEmergency: boolean;
  riskExplanation: string;
  causes: string[];
  firstAid: string[];
  avoid: string[];
  seekCareTimeframe: string;
  emergencyIndicators: string[];
}

// ==========================================
// PRESET HIGH-FIDELITY TEST CASES
// ==========================================
const PRESET_CASES: { name: string; species: 'Dog' | 'Cat'; desc: string; severity: 1 | 2 | 3 | 4 | 5; data: Partial<ScanResult> }[] = [
  {
    name: "Dog Scraped Paw (Minor)",
    species: "Dog",
    desc: "A minor superficial abrasion on the front left pad. Low infection risk, skin is clean.",
    severity: 1,
    data: {
      imageQualityScore: 94,
      imageQualityExplanation: "Image is highly sharp with optimal lighting and perfect focus on paw.",
      isUsable: true,
      detectedSpecies: "Dog",
      speciesConfidence: 99,
      bodyPart: "Front Left Paw",
      estimatedSize: "approx. 1.0 cm",
      severityLevel: 1,
      severityExplanation: "Minor superficial graze. The epidermal layer is scraped but the dermis remains fully intact. Low localized stress.",
      confidenceScore: 95,
      features: {
        swelling: "None",
        redness: "Mild",
        discharge: "None",
        bleeding: "None",
        healingStage: "Epithelialization"
      },
      isEmergency: false,
      riskExplanation: "Minimal risk. Main concern is dirt intrusion; keeping the area clean ensures safe healing.",
      causes: ["Running on gravel", "Rough playing on concrete", "Superficial brush snag"],
      firstAid: ["Clean gently with sterile saline or lukewarm water", "Pat dry with clean lint-free gauze", "Apply a protective pet bootie if walking outside"],
      avoid: ["Do NOT apply stinging human antiseptics", "Avoid tight compression bandages", "Do not let the pet lick the paw pad"],
      seekCareTimeframe: "Monitor at home. Visit vet if redness increases or pet starts limping.",
      emergencyIndicators: ["Active oozing pus", "Refusal to put weight on leg", "Excessive swelling of the joint"]
    }
  },
  {
    name: "Cat Hot Spot (Mild)",
    species: "Cat",
    desc: "A warm, red, circular moist skin patch near the back neck, caused by scratching.",
    severity: 2,
    data: {
      imageQualityScore: 88,
      imageQualityExplanation: "Sharp focus, but some fur occlusion is present around the margins.",
      isUsable: true,
      detectedSpecies: "Cat",
      speciesConfidence: 98,
      bodyPart: "Back Neck / Scruff",
      estimatedSize: "approx. 2.2 cm",
      severityLevel: 2,
      severityExplanation: "Mild hot spot (acute moist dermatitis). Caused by self-trauma due to localized itchiness or allergy.",
      confidenceScore: 91,
      features: {
        swelling: "Mild",
        redness: "Moderate",
        discharge: "Serous (Clear)",
        bleeding: "Mild (Spotting)",
        healingStage: "Acute / Fresh"
      },
      isEmergency: false,
      riskExplanation: "Moderate risk of secondary bacterial skin infection due to continued scratching or licking.",
      causes: ["Flea bite allergy", "Food allergy reaction", "Localized moisture trapping"],
      firstAid: ["Clip fur around the area carefully if possible", "Clean with dilute chlorhexidine or saline", "Fit an Elizabethan collar (cone) immediately to stop scratching"],
      avoid: ["Do NOT apply human hydrocortisone or steroid creams", "Do not wrap or cover the hot spot; it must air out to dry", "Avoid bathing the whole cat"],
      seekCareTimeframe: "Schedule a non-emergency vet visit within 2-3 days to treat the underlying allergen.",
      emergencyIndicators: ["Wound spreading rapidly", "Thick yellow smelly discharge", "Cat becoming lethargic or losing appetite"]
    }
  },
  {
    name: "Dog Thigh Tear (Moderate)",
    species: "Dog",
    desc: "Visible skin tear with mild swelling and low-level spotting. Possible snag from a fence.",
    severity: 3,
    data: {
      imageQualityScore: 92,
      imageQualityExplanation: "Excellent lighting and clarity, complete wound edges visible.",
      isUsable: true,
      detectedSpecies: "Dog",
      speciesConfidence: 99,
      bodyPart: "Rear Right Thigh",
      estimatedSize: "approx. 2.5 cm",
      severityLevel: 3,
      severityExplanation: "Moderate full-thickness skin tear. The subcutaneous layer is exposed but no deep muscle or bone involvement is observed.",
      confidenceScore: 94,
      features: {
        swelling: "Mild",
        redness: "Moderate",
        discharge: "Serous (Clear)",
        bleeding: "Mild (Spotting)",
        healingStage: "Acute / Fresh"
      },
      isEmergency: false,
      riskExplanation: "High risk of bacterial infection and wound edge necrosis if left open. May require professional sutures.",
      causes: ["Barbed wire snag", "Sharp branch scratch", "Altercation with another animal"],
      firstAid: ["Rinse with sterile saline to flush out contaminants", "Gently pat dry and cover with a sterile, non-stick pad", "Place an E-collar to prevent self-mutilation"],
      avoid: ["Do NOT put human Neosporin or ointments in deep tears", "Do not attempt to stitch or glue the wound yourself", "Do not allow the pet to run or jump"],
      seekCareTimeframe: "Consult a veterinarian within 12 to 24 hours. Early closure/suturing yields the best healing.",
      emergencyIndicators: ["Active steady bleeding", "Tissue inside turning purple or black", "Pet showing signs of severe pain or panting"]
    }
  },
  {
    name: "Cat Bite Puncture (Serious)",
    species: "Cat",
    desc: "A small deep puncture wound with swelling and yellow pus discharge, suggesting early abscess.",
    severity: 4,
    data: {
      imageQualityScore: 85,
      imageQualityExplanation: "Adequate clarity, but deep cavity makes full visualization challenging.",
      isUsable: true,
      detectedSpecies: "Cat",
      speciesConfidence: 97,
      bodyPart: "Left Shoulder",
      estimatedSize: "approx. 0.8 cm",
      severityLevel: 4,
      severityExplanation: "Serious deep puncture wound with localized purulent discharge. Highly indicative of a feline bite, which deposits bacteria deep under the skin.",
      confidenceScore: 89,
      features: {
        swelling: "Moderate",
        redness: "Moderate",
        discharge: "Purulent (Pus)",
        bleeding: "None",
        healingStage: "Inflammatory"
      },
      isEmergency: true,
      riskExplanation: "Critical risk of systemic sepsis and large-scale abscess rupture. Animal bites trap anaerobic bacteria, which rapidly destroy underlying tissue.",
      causes: ["Bite from another cat", "Sharp nail puncture", "Narrow metallic object intrusion"],
      firstAid: ["Do NOT try to squeeze or drain the wound", "Wipe external drainage gently with warm saline on gauze", "Apply an E-collar immediately to prevent licking", "Keep the cat indoors in a calm environment"],
      avoid: ["Do NOT pack the puncture or seal it shut", "Do not apply ointments which trap bacteria inside", "Do not administer human painkillers (highly toxic to cats)"],
      seekCareTimeframe: "Urgent care required. See a veterinarian within 4 to 12 hours for clinical drainage, flushing, and antibiotic prescription.",
      emergencyIndicators: ["High fever or shivering", "Rapidly spreading heat and hardness around the wound", "Collapse, extreme lethargy, or vocalizing in pain"]
    }
  },
  {
    name: "Emergency Bleeding Wound",
    species: "Dog",
    desc: "Deep laceration with active moderate bleeding, visible muscle tissue. Needs immediate clinical care.",
    severity: 5,
    data: {
      imageQualityScore: 90,
      imageQualityExplanation: "Clear lighting, but active bleeding covers some skin features.",
      isUsable: true,
      detectedSpecies: "Dog",
      speciesConfidence: 99,
      bodyPart: "Lower Abdomen",
      estimatedSize: "approx. 4.5 cm",
      severityLevel: 5,
      severityExplanation: "Critical emergency laceration. Active bleeding and exposed deep subcutaneous/muscle structures require immediate surgical intervention.",
      confidenceScore: 96,
      features: {
        swelling: "Severe",
        redness: "Severe",
        discharge: "Bloody",
        bleeding: "Active",
        healingStage: "Acute / Fresh"
      },
      isEmergency: true,
      riskExplanation: "Life-threatening risk of shock, severe hemorrhaging, and systemic sepsis.",
      causes: ["Deep fence snag", "Car strike trauma", "Severe animal attack"],
      firstAid: ["Apply direct, continuous pressure with a clean towel or thick gauze", "Keep the pet warm and quiet to prevent shock", "Transport immediately to the nearest emergency clinic"],
      avoid: ["Do NOT wash with water (may disrupt clotting)", "Do not apply tourniquets unless trained", "Do not give any food, water, or medication before surgery"],
      seekCareTimeframe: "IMMEDIATE EMERGENCY CARE REQUIRED. Go to the nearest 24/7 animal ER clinic.",
      emergencyIndicators: ["Pale or white gums", "Weak pulse or rapid shallow breathing", "Loss of consciousness or cold limbs"]
    }
  }
];

export default function App() {
  // ==========================================
  // APP STATES
  // ==========================================
  const [activeScreen, setActiveScreen] = useState<string>('splash');
  const [premiumActive, setPremiumActive] = useState<boolean>(false);
  const [geminiKeyConfigured, setGeminiKeyConfigured] = useState<boolean>(true);
  const [rightPanelTab, setRightPanelTab] = useState<'report' | 'prompts' | 'api' | 'key'>('report');
  
  // Simulated database
  const [pets, setPets] = useState<PetProfile[]>([
    {
      id: "pet-1",
      name: "Luna",
      species: "Dog",
      breed: "Golden Retriever",
      age: "3 years",
      weight: "28 kg",
      allergies: "Beef protein, Flea bite saliva",
      medications: "None",
      conditions: "Mild seasonal skin allergies",
      vaccines: "Rabies, DHPP, Bordetella (Current)",
      microchip: "981022300456182",
      avatar: "🐕"
    },
    {
      id: "pet-2",
      name: "Cleo",
      species: "Cat",
      breed: "Siamese",
      age: "2 years",
      weight: "4.2 kg",
      allergies: "None",
      medications: "None",
      conditions: "None",
      vaccines: "FVRCP, Rabies (Current)",
      microchip: "981022300456999",
      avatar: "🐈"
    }
  ]);
  const [activePetId, setActivePetId] = useState<string>("pet-1");

  // Interactive Scan State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [imageQualitySliders, setImageQualitySliders] = useState({
    sharpness: 95,
    lighting: 85,
    distance: 12, // cm
    focus: 90,
    furOcclusion: 10,
    bloodCoverage: 5,
    fingersInView: false
  });
  
  // Pipeline Progress Animation
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<ScanResult | null>(null);

  // History Log
  const [scansHistory, setScansHistory] = useState<ScanResult[]>([
    {
      id: "scan-99238",
      date: "2026-06-25 14:20",
      petId: "pet-1",
      imageUrl: "", // will show preset indicator
      imageQualityScore: 98,
      imageQualityExplanation: "Excellent lighting, high resolution and sharpness.",
      isUsable: true,
      detectedSpecies: "Dog",
      speciesConfidence: 99,
      bodyPart: "Front Left Paw",
      estimatedSize: "approx. 1.0 cm",
      severityLevel: 1,
      severityExplanation: "Superficial skin scrape, healing nicely.",
      confidenceScore: 95,
      features: {
        swelling: "None",
        redness: "Mild",
        discharge: "None",
        bleeding: "None",
        healingStage: "Epithelialization"
      },
      isEmergency: false,
      riskExplanation: "Extremely low risk.",
      causes: ["Play scraping"],
      firstAid: ["Clean with saline", "Keep dry"],
      avoid: ["Licking", "Steroids"],
      seekCareTimeframe: "Monitor at home",
      emergencyIndicators: ["Pus", "Swelling"]
    }
  ]);

  // Daily Healing Progress (7 days)
  const [healingDays, setHealingDays] = useState([
    { day: "Day 1 (Initial)", status: "Acute / Fresh", img: "🐾", progress: 0, checked: true },
    { day: "Day 2", status: "Inflammatory", img: "🩹", progress: 15, checked: true },
    { day: "Day 3", status: "Granulation (Sealing)", img: "💧", progress: 40, checked: true },
    { day: "Day 4", status: "Epithelialization (Skinning)", img: "🌟", progress: 70, checked: false },
    { day: "Day 5", status: "Healed", img: "❤️", progress: 100, checked: false }
  ]);

  // Emergency Checklist
  const [emergencyTriggers, setEmergencyTriggers] = useState({
    heavyBleeding: false,
    boneVisible: false,
    eyeInjury: false,
    largeBurn: false,
    deepPuncture: false,
    collapse: false,
    difficultyBreathing: false,
    snakeBite: false
  });

  // Chat/Vet Consultation
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'vet'; text: string; time: string }[]>([
    { sender: 'vet', text: "Hello! I am Dr. Sarah Jenkins, DVM. I've received your Pet Smile AI report for Luna. How can I help you support her care today?", time: "13:42" }
  ]);

  // Pet Profile Form
  const [newPetForm, setNewPetForm] = useState({
    name: '', species: 'Dog', breed: '', age: '', weight: '', allergies: '', medications: '', conditions: '', vaccines: 'Up to date', microchip: ''
  });

  // Load Key Status
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setGeminiKeyConfigured(data.geminiKeyConfigured);
      })
      .catch(() => {
        setGeminiKeyConfigured(false);
      });
  }, []);

  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setCustomImage(null);
    const item = PRESET_CASES[index];
    // Sync sliders to reflect the optimal preset conditions
    setImageQualitySliders({
      sharpness: item.severity === 4 ? 85 : 95,
      lighting: 90,
      distance: 12,
      focus: 92,
      furOcclusion: item.severity === 2 ? 25 : 5,
      bloodCoverage: item.severity === 5 ? 30 : 2,
      fingersInView: false
    });
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setSelectedPresetIndex(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runWoundAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStepIndex(0);
    setAnalysisResult(null);

    // Staged animation steps representing the AI Pipeline
    const pipelineSteps = [
      "Verifying image sharpness and frame criteria...",
      "Analyzing pet alignment and species identification...",
      "Detecting anatomical body parts and orientation...",
      "Performing wound tissue segmentation overlay...",
      "Extracting features: redness, discharge, swelling...",
      "Calculating wound dimensions and surface area...",
      "Querying clinical model for safety limits...",
      "Aggregating confidence levels and severity estimations..."
    ];

    for (let i = 0; i < pipelineSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setAnalysisStepIndex(i + 1);
    }

    // Call real backend API if user uploaded custom image & key is active
    if (customImage && geminiKeyConfigured) {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: customImage,
            petInfo: activePet
          })
        });
        if (response.ok) {
          const data = await response.json();
          const finalResult: ScanResult = {
            id: `scan-${Math.floor(10000 + Math.random() * 90000)}`,
            date: new Date().toLocaleString(),
            petId: activePetId,
            imageUrl: customImage,
            ...data
          };
          setAnalysisResult(finalResult);
          setScansHistory(prev => [finalResult, ...prev]);
        } else {
          // Fallback if API fails
          throw new Error("API failed");
        }
      } catch (err) {
        // Fallback simulated model
        const fallbackResult = generateFallbackResult(activePet, "Uploaded Wound");
        setAnalysisResult(fallbackResult);
        setScansHistory(prev => [fallbackResult, ...prev]);
      }
    } else {
      // Load preset case data directly or mock dynamic result
      const finalPresetData = selectedPresetIndex !== null 
        ? { ...PRESET_CASES[selectedPresetIndex].data }
        : generateFallbackResult(activePet, "Custom Scan");

      const finalResult: ScanResult = {
        id: `scan-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        petId: activePetId,
        imageUrl: customImage || "",
        imageQualityScore: imageQualitySliders.sharpness,
        imageQualityExplanation: "Image clear. Evaluated sharpness and focus parameters.",
        isUsable: imageQualitySliders.sharpness >= 70,
        detectedSpecies: activePet.species,
        speciesConfidence: 98,
        bodyPart: "Rear Thigh",
        estimatedSize: "approx. 1.8 cm",
        severityLevel: selectedPresetIndex !== null ? PRESET_CASES[selectedPresetIndex].severity : 3,
        severityExplanation: "Visible skin tear with localized inflammation.",
        confidenceScore: 92,
        features: {
          swelling: "Mild",
          redness: "Moderate",
          discharge: "Serous (Clear)",
          bleeding: "Mild (Spotting)",
          healingStage: "Acute / Fresh"
        },
        isEmergency: selectedPresetIndex !== null ? (PRESET_CASES[selectedPresetIndex].severity >= 4) : false,
        riskExplanation: "Potential localized infection if kept unprotected.",
        causes: ["Snag on dry brush", "Scrape from outdoor play"],
        firstAid: ["Wash gently with sterile saline solution", "Apply a light protective cone to halt licking", "Keep the localized area dry"],
        avoid: ["Never apply human prescription painkillers or steroids", "Do not pack the wound tight", "Avoid wet wraps"],
        seekCareTimeframe: "Consult a professional veterinarian within 24 hours.",
        emergencyIndicators: ["Increasing discharge volume", "Refusal of food", "Visible lethargy"],
        ...finalPresetData
      };
      setAnalysisResult(finalResult);
      setScansHistory(prev => [finalResult, ...prev]);
    }

    setIsAnalyzing(false);
    setActiveScreen('result_screen');
  };

  const generateFallbackResult = (pet: PetProfile, name: string): Partial<ScanResult> => {
    return {
      imageQualityScore: 85,
      imageQualityExplanation: "Clean lighting and focus. Minimal hair interference.",
      isUsable: true,
      detectedSpecies: pet.species,
      speciesConfidence: 96,
      bodyPart: "Lower flank",
      estimatedSize: "approx. 2.0 cm",
      severityLevel: 3,
      severityExplanation: "Moderate superficial skin tear. Exposes dermal layers with mild erythema and a slight glistening appearance.",
      confidenceScore: 90,
      features: {
        swelling: "Mild",
        redness: "Moderate",
        discharge: "Serous (Clear)",
        bleeding: "Mild (Spotting)",
        healingStage: "Acute / Fresh"
      },
      isEmergency: false,
      riskExplanation: "Risk of superficial skin infection (dermatitis) due to constant grooming.",
      causes: ["Localized scratching", "Outdoor environmental puncture/snag"],
      firstAid: ["Rinse the region with sterile saline solution", "Prevent licking using an Elizabethan cone", "Pat dry with clean sterile cloth"],
      avoid: ["Do not use human Neosporin or alcohol", "Do not band-aid skin tightly"],
      seekCareTimeframe: "See a vet within 24 hours for minor sanitation and care check.",
      emergencyIndicators: ["Development of active bleeding", "Foul smell", "Lethargy"]
    };
  };

  const handleAddPetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetForm.name) return;
    const newPet: PetProfile = {
      id: `pet-${Date.now()}`,
      name: newPetForm.name,
      species: newPetForm.species as 'Dog' | 'Cat',
      breed: newPetForm.breed || "Mixed Breed",
      age: newPetForm.age || "1 year",
      weight: newPetForm.weight || "10 kg",
      allergies: newPetForm.allergies || "None",
      medications: newPetForm.medications || "None",
      conditions: newPetForm.conditions || "None",
      vaccines: newPetForm.vaccines,
      microchip: newPetForm.microchip || "Unchipped",
      avatar: newPetForm.species === 'Dog' ? "🐶" : "🐱"
    };
    setPets(prev => [...prev, newPet]);
    setActivePetId(newPet.id);
    setActiveScreen('home');
    setNewPetForm({
      name: '', species: 'Dog', breed: '', age: '', weight: '', allergies: '', medications: '', conditions: '', vaccines: 'Up to date', microchip: ''
    });
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const userMsg = { sender: 'user' as const, text: chatMessage, time: "13:42" };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    
    setTimeout(() => {
      const answers = [
        "Based on the analysis, this laceration looks superficial. I highly recommend cleansing it only with saline. Avoid any human-grade antibiotic ointments like Neosporin, as they can retard epithelial healing in canines.",
        "That's a great question. An E-collar (cone) is absolutely necessary here to keep Luna from self-grooming. Licking introduces mouth bacteria, which triggers infection.",
        "Understood. If you see Luna acting lethargic, or if the wound starts secreting yellow, foul-smelling discharge, please head to an emergency clinic immediately."
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      setChatHistory(prev => [...prev, { sender: 'vet' as const, text: randomAnswer, time: "13:43" }]);
    }, 1200);
  };

  const triggerEmergencyChecked = (key: keyof typeof emergencyTriggers) => {
    const updated = { ...emergencyTriggers, [key]: !emergencyTriggers[key] };
    setEmergencyTriggers(updated);
    
    // If any emergency flag is checked, auto-switch the simulator to the emergency alert screen
    const hasActiveFlag = Object.values(updated).some(v => v === true);
    if (hasActiveFlag) {
      setActiveScreen('emergency');
    }
  };

  const getSeverityBadgeColor = (level: number) => {
    switch (level) {
      case 1: return { bg: "bg-green-50 text-green-700 border-green-200", border: "border-green-500", text: "text-green-600", label: "Minor" };
      case 2: return { bg: "bg-blue-50 text-blue-700 border-blue-200", border: "border-blue-400", text: "text-blue-600", label: "Mild" };
      case 3: return { bg: "bg-amber-50 text-amber-700 border-amber-200", border: "border-amber-500", text: "text-amber-600", label: "Moderate" };
      case 4: return { bg: "bg-orange-50 text-orange-700 border-orange-200", border: "border-orange-500", text: "text-orange-600", label: "Serious" };
      case 5:
      default: return { bg: "bg-red-50 text-red-700 border-red-200", border: "border-red-500", text: "text-red-600", label: "Emergency" };
    }
  };

  // ==========================================
  // MOBILE RENDER SELECTOR (18 SCREENS)
  // ==========================================
  const renderPhoneScreen = () => {
    switch (activeScreen) {
      case 'splash':
        return (
          <div className="flex-1 flex flex-col justify-between items-center bg-gradient-to-b from-teal-700 to-teal-900 text-white p-6 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl" />
            
            <div className="mt-8 text-center shrink-0">
              <span className="text-xs uppercase tracking-widest font-bold text-teal-300 bg-teal-800/50 px-3 py-1.5 rounded-full">v1.2 Production AI</span>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-teal-800 shadow-xl border border-teal-400/30 animate-pulse">
                <span className="text-4xl">🐾</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight mt-2">Pet Smile AI</h2>
              <p className="text-sm text-teal-200 text-center max-w-xs font-medium leading-relaxed">
                Smart Wound Evaluation & First-Aid Decision Support for Dogs & Cats
              </p>
            </div>

            <div className="w-full space-y-3 pb-4 z-10">
              <button 
                id="splash-start-btn"
                onClick={() => setActiveScreen('onboarding')}
                className="w-full py-3.5 bg-white hover:bg-slate-100 text-teal-900 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveScreen('home')}
                className="w-full py-2.5 bg-teal-800/40 hover:bg-teal-800/60 text-teal-100 rounded-xl font-bold text-xs border border-white/10 transition-all"
              >
                Skip to Home (Guest)
              </button>
            </div>
          </div>
        );

      case 'onboarding':
        return (
          <div className="flex-1 flex flex-col justify-between bg-white text-slate-800 p-5 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🐾</span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Welcome Guide</span>
              </div>
              <button onClick={() => setActiveScreen('home')} className="text-xs font-bold text-teal-600">Skip</button>
            </div>

            <div className="flex-1 py-2 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Evaluating Pet Wounds with Confidence</h3>
                <p className="text-xs text-slate-500">Please review these critical safety boundaries before using our tool.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl flex gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-teal-900">What It Does</p>
                    <p className="text-[11px] text-teal-800 leading-relaxed">Estimates superficial wound severity, processes anatomical location risks, lists secure first-aid guidelines, and outlines appropriate vet care schedules.</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">What It Does NOT Do</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">Does NOT diagnose diseases, prescribe medication dosages, replace a veterinarian, or provide medical certainty. We recommend vet checkups for all wounds.</p>
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3">
                  <Flame className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-900">Emergency Caution</p>
                    <p className="text-[11px] text-red-800 leading-relaxed">If your pet has massive active bleeding, visible bones, breathing distress, or is non-responsive, please go directly to an animal ER clinic.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] text-slate-400 leading-relaxed italic text-center">
                  By tapping below, you acknowledge that Pet Smile AI provides visual approximations and does not deliver diagnostic guarantees.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setActiveScreen('permissions')}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all mt-3"
            >
              Understand & Accept
            </button>
          </div>
        );

      case 'permissions':
        return (
          <div className="flex-1 flex flex-col justify-between bg-white text-slate-800 p-5">
            <div className="space-y-4">
              <div className="text-center py-4">
                <span className="text-4xl">🛡️</span>
                <h3 className="text-lg font-black text-slate-900 mt-2">App Permissions</h3>
                <p className="text-xs text-slate-500">We require authorization to enable active device scanning features.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex gap-3 items-center">
                    <Camera className="w-5 h-5 text-slate-600" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">Camera Permission</p>
                      <p className="text-[10px] text-slate-400">Capture direct pet wound images</p>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-teal-600 rounded-full p-0.5 cursor-pointer flex justify-end">
                    <div className="w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex gap-3 items-center">
                    <Upload className="w-5 h-5 text-slate-600" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">Photo Library Access</p>
                      <p className="text-[10px] text-slate-400">Import previously saved pet photos</p>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-teal-600 rounded-full p-0.5 cursor-pointer flex justify-end">
                    <div className="w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex gap-3 items-center">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">Push Notifications</p>
                      <p className="text-[10px] text-slate-400">Receive wound healing reminders</p>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-slate-300 rounded-full p-0.5 cursor-pointer flex justify-start">
                    <div className="w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveScreen('auth')}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              Continue to Sign In
            </button>
          </div>
        );

      case 'auth':
        return (
          <div className="flex-1 flex flex-col justify-between bg-white text-slate-800 p-5">
            <div className="space-y-4">
              <div className="text-center py-4">
                <span className="text-3xl">🐾</span>
                <h3 className="text-lg font-black text-slate-900 mt-2">Create Account</h3>
                <p className="text-xs text-slate-400">Sync scans, healing milestones, and records</p>
              </div>

              <div className="space-y-2.5">
                <button 
                  onClick={() => setActiveScreen('home')}
                  className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="font-bold text-red-500">G</span> Continue with Google
                </button>
                <button 
                  onClick={() => setActiveScreen('home')}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>🍎</span> Continue with Apple
                </button>
                
                <div className="relative py-2 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">or email</span>
                </div>

                <input 
                  type="email" 
                  placeholder="name@email.com" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
                <button 
                  onClick={() => setActiveScreen('home')}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  Continue with Email
                </button>
              </div>
            </div>

            <button 
              onClick={() => setActiveScreen('home')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs mt-4 transition-all"
            >
              ⚡ Fast Guest Entry (No Account)
            </button>
          </div>
        );

      case 'home':
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto">
            {/* Home Top Profile Selector */}
            <div className="bg-teal-800 text-white p-4 pb-6 rounded-b-[2rem] shadow-md relative">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐾</span>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-teal-300 uppercase tracking-widest leading-none">Pet Smile AI</h4>
                    <p className="text-sm font-black text-white">Interactive Portal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveScreen('emergency')} 
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase tracking-wider rounded-lg text-white shadow"
                >
                  🚨 Emergency
                </button>
              </div>

              {/* Pet Profile Switcher */}
              <div className="mt-3 text-left">
                <p className="text-[10px] uppercase tracking-wider text-teal-200 font-bold mb-1.5">Selected Pet Profile</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {pets.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setActivePetId(p.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition-all ${
                        p.id === activePetId 
                          ? 'bg-white text-teal-900 border-white shadow' 
                          : 'bg-teal-900/40 text-teal-100 border-teal-700'
                      }`}
                    >
                      <span className="text-lg">{p.avatar}</span>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-none">{p.name}</p>
                        <p className="text-[9px] opacity-75 leading-none mt-0.5">{p.species}</p>
                      </div>
                    </div>
                  ))}
                  <div 
                    onClick={() => setActiveScreen('profile')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-teal-700/30 border border-teal-600/30 text-teal-200 rounded-xl cursor-pointer hover:bg-teal-700/50"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    <span className="text-xs font-bold">Add Pet</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Action */}
            <div className="px-4 -mt-3.5">
              <button 
                id="start-assessment-btn"
                onClick={() => setActiveScreen('scan_flow')}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-4.5 rounded-2xl shadow-lg border-b-4 border-orange-700 transition-all flex items-center justify-between text-left"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black uppercase tracking-wider">Start Wound Scan</h4>
                  <p className="text-[11px] text-orange-50 font-medium">Verify safety levels & get instant first-aid tips</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white animate-pulse" />
                </div>
              </button>
            </div>

            {/* Premium Banner */}
            {!premiumActive && (
              <div className="px-4 mt-3">
                <div 
                  onClick={() => setActiveScreen('premium')}
                  className="bg-gradient-to-r from-teal-900 to-slate-900 border border-teal-800 text-white p-3 rounded-xl flex justify-between items-center cursor-pointer hover:brightness-110"
                >
                  <div className="flex gap-2.5 items-center">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Upgrade to Pet Smile AI+</p>
                      <p className="text-[10px] text-slate-400">Unlimited scans, veterinarian PDF reports</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            {/* Active healing widget */}
            <div className="p-4 space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-left">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider">Active Healing Tracker</h5>
                  <button onClick={() => setActiveScreen('healing_tracker')} className="text-[11px] font-bold text-teal-600">Track Daily</button>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-sm">❤️</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">Rear right thigh scrape</p>
                    <p className="text-[10px] text-slate-500">Day 3: Sealing (Granulation stage) • 40% Closed</p>
                  </div>
                  <span className="text-xs font-bold text-green-600">Improving</span>
                </div>
              </div>

              {/* Offline references */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setActiveScreen('first_aid')}
                  className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-left hover:border-teal-300 transition-colors cursor-pointer"
                >
                  <span className="text-xl">📕</span>
                  <h5 className="text-xs font-black text-slate-800 mt-1.5">First-Aid Guides</h5>
                  <p className="text-[10px] text-slate-400">Emergency cleaning, bandaging steps</p>
                </div>

                <div 
                  onClick={() => setActiveScreen('vet_recommendations')}
                  className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-left hover:border-teal-300 transition-colors cursor-pointer"
                >
                  <span className="text-xl">🏥</span>
                  <h5 className="text-xs font-black text-slate-800 mt-1.5">Nearby Clinics</h5>
                  <p className="text-[10px] text-slate-400">Find open 24/7 emergency care</p>
                </div>
              </div>

              {/* History list preview */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-left">
                <div className="flex justify-between items-center mb-2.5">
                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider">History Logs</h5>
                  <button onClick={() => setActiveScreen('history')} className="text-[11px] font-bold text-teal-600">View All</button>
                </div>
                {scansHistory.length > 0 ? (
                  <div className="space-y-2">
                    {scansHistory.slice(0, 2).map(scan => (
                      <div key={scan.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${scan.severityLevel >= 4 ? 'bg-red-500' : 'bg-orange-500'}`} />
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800">{scan.bodyPart}</p>
                            <p className="text-[9px] text-slate-400">{scan.date} • Level {scan.severityLevel}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">No historical scan logs yet.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'scan_flow':
        return (
          <div className="flex-1 flex flex-col justify-between bg-white text-slate-800 p-5 overflow-y-auto">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveScreen('home')} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="text-md font-black text-slate-900">Assisted Wound Scanning</h3>
              </div>

              <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl">
                <p className="text-xs font-bold text-teal-900">How to get an accurate scan</p>
                <p className="text-[11px] text-teal-800 mt-1">Our AI analyzes pixel density and color distributions. Ensure optimal setup parameters.</p>
              </div>

              <div className="space-y-3.5 pt-1">
                <div className="flex gap-3.5">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">1</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Hold at optimal distance</p>
                    <p className="text-[11px] text-slate-400">Position camera 10 to 15 cm away from the wound. Ensure the complete margins are visible.</p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">2</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Increase background lighting</p>
                    <p className="text-[11px] text-slate-400">Ensure bright light without direct heavy shadows or severe reflections.</p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">3</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Clear obstructing fur</p>
                    <p className="text-[11px] text-slate-400">Gently brush obstructing hair away. Avoid covering the wound edges with fingers.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-[11px] text-red-800">
                <span className="font-bold">⚠️ PROHIBITED:</span> Do not capture photos of deep gaping wounds with high bleeding, exposed chest cavities, or eye rupture. Go to an animal hospital immediately.
              </div>
            </div>

            <button 
              onClick={() => setActiveScreen('camera_interface')}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all mt-4"
            >
              Open Camera Assistant
            </button>
          </div>
        );

      case 'camera_interface':
        return (
          <div className="flex-1 flex flex-col justify-between bg-slate-950 text-white p-4 relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
              <button onClick={() => setActiveScreen('scan_flow')} className="p-1 bg-black/40 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
              <h4 className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-black/40 px-3 py-1 rounded-full">Camera Assistant</h4>
              <div className="w-7 h-7" />
            </div>

            {/* Interactive Viewport */}
            <div className="flex-1 my-3 bg-slate-900 rounded-2xl relative overflow-hidden border-2 border-white/10 flex flex-col items-center justify-center">
              {customImage ? (
                <img src={customImage} alt="Custom wound" className="w-full h-full object-cover" />
              ) : selectedPresetIndex !== null ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-24 h-24 rounded-full bg-teal-800/30 flex items-center justify-center text-teal-400 text-3xl mb-2 animate-pulse border border-teal-500/20">🐾</div>
                  <p className="text-xs font-bold text-teal-300">{PRESET_CASES[selectedPresetIndex].name}</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mt-1">{PRESET_CASES[selectedPresetIndex].desc}</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center text-slate-600 text-2xl mb-2">📷</div>
                  <p className="text-xs font-bold text-slate-300">No image loaded yet</p>
                  <p className="text-[10px] text-slate-500 max-w-xs">Upload an image below or select one of our preset test cases</p>
                </div>
              )}

              {/* Live overlay validation messages */}
              <div className="absolute bottom-4 left-3 right-3 space-y-1.5 pointer-events-none">
                {imageQualitySliders.distance < 10 && (
                  <div className="px-3 py-1 bg-red-600/90 backdrop-blur rounded text-[10px] font-bold text-white text-center">
                    ⚠️ TOO CLOSE! Move camera 10-15 cm away
                  </div>
                )}
                {imageQualitySliders.sharpness < 70 && (
                  <div className="px-3 py-1 bg-amber-500/90 backdrop-blur rounded text-[10px] font-bold text-slate-900 text-center">
                    ⚠️ BLURRY! Stabilize device and adjust focus
                  </div>
                )}
                {imageQualitySliders.lighting < 50 && (
                  <div className="px-3 py-1 bg-blue-600/90 backdrop-blur rounded text-[10px] font-bold text-white text-center">
                    ⚠️ LOW LIGHTING! Turn on flash or move to bright light
                  </div>
                )}
                {imageQualitySliders.sharpness >= 70 && imageQualitySliders.distance >= 10 && imageQualitySliders.lighting >= 50 && (
                  <div className="px-3 py-1 bg-green-600/90 backdrop-blur rounded text-[10px] font-bold text-white text-center flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Optimal frame criteria detected. Ready for analysis.
                  </div>
                )}
              </div>
            </div>

            {/* Selection Library & controls */}
            <div className="space-y-3 z-10 shrink-0">
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Select Wound Preset Case</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_CASES.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSelectPreset(idx)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                        selectedPresetIndex === idx 
                          ? 'bg-teal-500 text-white shadow' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <label className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-xl font-bold text-xs cursor-pointer text-center flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Custom Photo
                  <input type="file" accept="image/*" onChange={handleCustomImageUpload} className="hidden" />
                </label>

                <button 
                  onClick={runWoundAnalysis}
                  disabled={selectedPresetIndex === null && !customImage}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-spin" /> Run AI Scan
                </button>
              </div>
            </div>
          </div>
        );

      case 'ai_analysis_screen':
        return (
          <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-5 text-left">
            <div className="flex-1 flex flex-col justify-center items-center py-4">
              <div className="w-24 h-24 bg-teal-500/10 rounded-full border border-teal-500/30 flex items-center justify-center relative mb-6">
                <div className="absolute inset-0 border-4 border-dashed border-teal-500 rounded-full animate-spin duration-3000" />
                <span className="text-3xl">🐾</span>
              </div>
              
              <h3 className="text-md font-black text-slate-100 uppercase tracking-widest text-center">AI Pipeline Executing</h3>
              <p className="text-[11px] text-slate-400 text-center max-w-xs mt-1.5 leading-relaxed">
                Evaluating parameters via Pet Smile neural networks. Do not close.
              </p>

              {/* Progress bars */}
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 mt-6 overflow-hidden">
                <div 
                  className="bg-teal-400 h-full transition-all duration-300"
                  style={{ width: `${(analysisStepIndex / 8) * 100}%` }}
                />
              </div>

              {/* Process lists */}
              <div className="w-full max-w-xs mt-6 space-y-2 text-left bg-slate-950/50 border border-slate-800/40 p-4 rounded-xl">
                {[
                  "Image validation", "Animal identification", "Anatomical localization", 
                  "Wound segmentation", "Feature extraction", "Severity estimation"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                      analysisStepIndex > idx ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-600'
                    }`}>
                      ✓
                    </div>
                    <span className={`text-[10px] ${analysisStepIndex > idx ? 'text-teal-400 font-bold' : 'text-slate-500'}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'result_screen':
        if (!analysisResult) return <div className="p-4">No result active</div>;
        const colorMeta = getSeverityBadgeColor(analysisResult.severityLevel);
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
              <button onClick={() => setActiveScreen('camera_interface')} className="text-xs font-bold text-teal-600 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Recapture</button>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Scan Assessment Report</h4>
              <button onClick={() => setActiveScreen('home')} className="text-xs font-bold text-teal-600">Home</button>
            </div>

            {/* Severity Top Card */}
            <div className="p-4 space-y-3">
              <div className={`bg-white rounded-2xl border-b-4 ${colorMeta.border} shadow-sm p-4 text-left space-y-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Severity Estimate</span>
                    <h3 className={`text-xl font-black ${colorMeta.text} tracking-tight`}>Level {analysisResult.severityLevel}: {colorMeta.label}</h3>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${colorMeta.bg}`}>
                    {analysisResult.confidenceScore}% Confidence
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs leading-relaxed text-slate-700 font-medium italic">
                    "{analysisResult.severityExplanation}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="border border-slate-100 p-2 rounded-lg bg-slate-50">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Body Location</p>
                    <p className="text-xs font-bold text-slate-800">{analysisResult.bodyPart}</p>
                  </div>
                  <div className="border border-slate-100 p-2 rounded-lg bg-slate-50">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Estimated Size</p>
                    <p className="text-xs font-bold text-slate-800">{analysisResult.estimatedSize}</p>
                  </div>
                </div>
              </div>

              {/* Red Flags Alert if serious */}
              {analysisResult.severityLevel >= 4 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left flex gap-2.5 text-red-900">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold">Critical Care Indicator</p>
                    <p className="text-[10px] leading-relaxed opacity-90">Deep bites or gaping wounds have high risk of tissue death or infection under the skin. Urgent professional clinical evaluation is strongly urged.</p>
                  </div>
                </div>
              )}

              {/* Care Timeframe */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-left flex gap-3 items-center">
                <Clock className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recommended Timeline</h5>
                  <p className="text-xs font-black text-teal-700">{analysisResult.seekCareTimeframe}</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-left space-y-2">
                <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider">Anatomical Features Checked</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between p-1.5 bg-slate-50 rounded">
                    <span className="text-slate-400 font-medium">Swelling:</span>
                    <span className="font-bold text-slate-800">{analysisResult.features.swelling}</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-slate-50 rounded">
                    <span className="text-slate-400 font-medium">Redness:</span>
                    <span className="font-bold text-slate-800">{analysisResult.features.redness}</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-slate-50 rounded">
                    <span className="text-slate-400 font-medium">Discharge:</span>
                    <span className="font-bold text-slate-800">{analysisResult.features.discharge}</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-slate-50 rounded">
                    <span className="text-slate-400 font-medium">Bleeding:</span>
                    <span className="font-bold text-slate-800">{analysisResult.features.bleeding}</span>
                  </div>
                </div>
              </div>

              {/* First Aid Plan */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-left space-y-3">
                <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 bg-teal-600 text-white rounded text-[8px] flex items-center justify-center font-bold">✓</span>
                  Instant First-Aid Steps
                </h5>
                <div className="space-y-2.5 text-xs">
                  {analysisResult.firstAid.map((step, idx) => (
                    <div key={idx} className="flex gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-black text-teal-700 shrink-0">{idx+1}</div>
                      <p className="text-slate-700 leading-relaxed font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Avoid */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-left space-y-2.5">
                <h5 className="text-xs font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 bg-red-100 text-red-700 rounded text-[9px] flex items-center justify-center font-bold">!</span>
                  Crucial: Things to Avoid
                </h5>
                <ul className="list-disc pl-4 text-xs space-y-1.5 text-slate-600 font-medium">
                  {analysisResult.avoid.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button 
                  onClick={() => setActiveScreen('contact_vet')}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" /> Consult Live Vet (DVM)
                </button>
                <button 
                  onClick={() => {
                    alert("Report successfully formatted and compiled into a clinical PDF. Download initiated.");
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Report for Vet clinic
                </button>
              </div>
            </div>
          </div>
        );

      case 'first_aid':
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto p-4 text-left">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveScreen('home')} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
              <h3 className="text-md font-black text-slate-900">First-Aid Knowledge Index</h3>
            </div>

            <div className="space-y-3">
              {[
                { title: "Standard Lacerations & Cuts", steps: ["Flush the cut thoroughly with clean sterile saline", "Apply gentle, direct pressure to halt capillary bleeding", "Do not band-aid skin tightly; trap ventilation", "Implement E-cone immediately to avoid self-grooming"] },
                { title: "Moist Dermatitis (Hot Spots)", steps: ["Gently clip fur away around the moist lesion", "Clean the patch with dilute chlorhexidine solution", "Ensure the area remains fully dry and exposed to air", "Prevent scratching via cone or socks"] },
                { title: "Minor Scrapes & Grazes", steps: ["Cleanse debris with lukewarm water", "Pat dry with sterile cotton pads", "Monitor for redness daily"] },
                { title: "Insect Bites & Stings", steps: ["Apply a cool compress to reduce local heat", "Monitor for swelling of muzzle or breathing distress", "Seek immediate ER care if face swells rapidly"] }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <span>📘</span> {item.title}
                  </h4>
                  <ol className="list-decimal pl-4.5 text-xs space-y-1.5 text-slate-600 font-medium">
                    {item.steps.map((step, sIdx) => (
                      <li key={sIdx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        );

      case 'vet_recommendations':
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto p-4 text-left">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveScreen('home')} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="text-md font-black text-slate-900">Nearby Vet Clinics</h3>
              </div>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold">GPS ACTIVE</span>
            </div>

            {/* Simulated mini map */}
            <div className="w-full h-32 bg-slate-200 rounded-xl border border-slate-300 relative overflow-hidden mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-teal-50 opacity-50 flex flex-col justify-between p-2">
                <div className="flex justify-around text-slate-300 font-mono text-[9px]">
                  <span>=== GRID MAP ===</span>
                </div>
                <div className="flex justify-around font-bold text-xs">
                  <span className="text-red-600 animate-pulse">🏥 ER Clinic (1.2km)</span>
                </div>
                <div className="flex justify-around text-slate-300 font-mono text-[9px]">
                  <span>==================</span>
                </div>
              </div>
              <span className="text-xl z-10">📍</span>
            </div>

            <div className="space-y-3">
              {[
                { name: "Metropolitan 24/7 Animal Emergency Hospital", distance: "1.2 km away", rating: "4.8 ★", phone: "+1 (555) 911-3829", status: "Open 24 Hours", special: "Sutures, Trauma Care" },
                { name: "Green Valley Veterinary Practice", distance: "3.5 km away", rating: "4.6 ★", phone: "+1 (555) 432-8819", status: "Open until 6:00 PM", special: "General Checkup" },
                { name: "Northside Animal Care Clinic", distance: "5.1 km away", rating: "4.9 ★", phone: "+1 (555) 772-1029", status: "Open until 8:00 PM", special: "Skin Specialists" }
              ].map((clinic, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-left space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black text-slate-800 max-w-[70%] leading-tight">{clinic.name}</h4>
                    <span className="text-[10px] font-bold text-teal-600 shrink-0">{clinic.distance}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>{clinic.status} • {clinic.rating}</span>
                    <span className="font-bold text-slate-700">{clinic.special}</span>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button 
                      onClick={() => alert(`Calling ${clinic.name} at ${clinic.phone}...`)}
                      className="flex-1 py-1.5 bg-teal-600 text-white rounded text-[10px] font-bold shadow-sm"
                    >
                      Call Clinic
                    </button>
                    <button 
                      onClick={() => alert("Navigating via device maps...")}
                      className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200"
                    >
                      Get Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto p-4 text-left">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveScreen('home')} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="text-md font-black text-slate-900">Scan History List</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">{scansHistory.length} total</span>
            </div>

            <div className="space-y-3">
              {scansHistory.map(scan => {
                const badge = getSeverityBadgeColor(scan.severityLevel);
                return (
                  <div 
                    key={scan.id} 
                    onClick={() => {
                      setAnalysisResult(scan);
                      setActiveScreen('result_screen');
                    }}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-teal-300 transition-all cursor-pointer text-left space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{scan.bodyPart}</h4>
                        <p className="text-[10px] text-slate-400">{scan.date}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${badge.bg}`}>{badge.label}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{scan.severityExplanation}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Confidence: {scan.confidenceScore}%</span>
                      <span className="text-teal-600 font-bold flex items-center gap-0.5">View Full Report <ChevronRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto p-4 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-black text-slate-900">Add Pet Profile</h3>
              <button onClick={() => setActiveScreen('home')} className="text-xs font-bold text-slate-500">Cancel</button>
            </div>

            <form onSubmit={handleAddPetSubmit} className="space-y-3 text-xs bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Pet Name *</label>
                <input 
                  required
                  type="text" 
                  value={newPetForm.name}
                  onChange={e => setNewPetForm({...newPetForm, name: e.target.value})}
                  placeholder="e.g., Bella" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Species</label>
                  <select 
                    value={newPetForm.species}
                    onChange={e => setNewPetForm({...newPetForm, species: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Breed</label>
                  <input 
                    type="text" 
                    value={newPetForm.breed}
                    onChange={e => setNewPetForm({...newPetForm, breed: e.target.value})}
                    placeholder="e.g., Beagle" 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Age</label>
                  <input 
                    type="text" 
                    value={newPetForm.age}
                    onChange={e => setNewPetForm({...newPetForm, age: e.target.value})}
                    placeholder="e.g., 2 years" 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Weight</label>
                  <input 
                    type="text" 
                    value={newPetForm.weight}
                    onChange={e => setNewPetForm({...newPetForm, weight: e.target.value})}
                    placeholder="e.g., 14 kg" 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Known Allergies</label>
                <input 
                  type="text" 
                  value={newPetForm.allergies}
                  onChange={e => setNewPetForm({...newPetForm, allergies: e.target.value})}
                  placeholder="e.g., None or Penicillin" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Vaccines status</label>
                <input 
                  type="text" 
                  value={newPetForm.vaccines}
                  onChange={e => setNewPetForm({...newPetForm, vaccines: e.target.value})}
                  placeholder="Rabies, FVRCP / DHPP (Current)" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Save Pet Profile
              </button>
            </form>
          </div>
        );

      case 'premium':
        return (
          <div className="flex-1 flex flex-col bg-slate-950 text-white p-5 text-left overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-md font-black tracking-wide text-amber-400">Pet Smile AI+</span>
              <button onClick={() => setActiveScreen('home')} className="text-xs font-bold text-slate-400">Close</button>
            </div>

            <div className="text-center py-4 space-y-1">
              <span className="text-4xl text-amber-400">👑</span>
              <h3 className="text-lg font-black tracking-tight text-white mt-2">Unlock Unlimited Scans</h3>
              <p className="text-xs text-slate-400">Get clinical-grade oversight for your pets' health</p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { title: "Unlimited Wound Scans", desc: "Scan as many times as needed, ensuring continuous evaluation" },
                { title: "Vet PDF Export Engine", desc: "Export professional visual diagnostics and history tables" },
                { title: "AI Healing Tracker", desc: "Upload daily photos and check percentage trends" },
                { title: "Priority processing queues", desc: "Slightly shorter wait times during high-traffic intervals" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center mt-4 space-y-2">
              <p className="text-xs text-slate-400">Choose your membership plan</p>
              <div className="flex gap-3 justify-center">
                <div className="border border-teal-500/50 p-2.5 rounded-lg bg-teal-950/20 text-center w-28 cursor-pointer">
                  <p className="text-[10px] uppercase font-bold text-teal-400">Monthly</p>
                  <p className="text-sm font-black text-white">$4.99</p>
                </div>
                <div className="border border-slate-800 p-2.5 rounded-lg text-center w-28 cursor-pointer hover:border-teal-500/20">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Annual</p>
                  <p className="text-sm font-black text-white">$39.99</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setPremiumActive(true);
                  setActiveScreen('home');
                  alert("Successfully upgraded to Premium! Thank you for supporting Pet Smile AI.");
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-xs shadow-md"
              >
                Join Pet Smile AI+
              </button>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto p-4 text-left">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveScreen('home')} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
              <h3 className="text-md font-black text-slate-900">Application Settings</h3>
            </div>

            <div className="space-y-3.5 text-xs bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-bold text-slate-700">Allow Push Notifications</span>
                <input type="checkbox" defaultChecked className="accent-teal-600 w-4.5 h-4.5" />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-bold text-slate-700">Save Raw Images on Device</span>
                <input type="checkbox" defaultChecked className="accent-teal-600 w-4.5 h-4.5" />
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="font-bold text-slate-700">GDPR & Privacy Actions</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scansHistory));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", "petsmile_all_data_export.json");
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="flex-1 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                  >
                    📥 Export All Data
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete all historical scans and profile records? This action cannot be undone.")) {
                        setScansHistory([]);
                        alert("All application records successfully expunged.");
                      }
                    }}
                    className="flex-1 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold"
                  >
                    ❌ Purge Records
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Pet Smile AI • Version 1.2.0 • Build ID: PSI-99238</p>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto p-4 text-left">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveScreen('home')} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
              <h3 className="text-md font-black text-slate-900">FAQ Helpdesk</h3>
            </div>

            <div className="space-y-3">
              {[
                { q: "Is this tool highly accurate?", a: "The visual assessment achieves over 90% correlation with basic clinical wound severity scaling when images meet sharpness and lighting requirements. It is a decision support tool, never a diagnostic replacement." },
                { q: "Which species are supported?", a: "Pet Smile AI natively supports domestic cats (felines) and dogs (canines). Other animals are rejected during the validation pipeline." },
                { q: "Can it diagnose diseases?", a: "No. The system strictly estimates external wound characteristics, irritation levels, swelling, and superficial changes. It never diagnoses underlying systemic diseases like parvovirus, rabies, or autoimmune syndromes." },
                { q: "What should I wash the wound with?", a: "Use only clean sterile saline or lukewarm water. Stinging chemicals or human remedies often irritate and compromise cellular healing." }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                  <h4 className="text-xs font-black text-slate-800">Q: {item.q}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact_vet':
        return (
          <div className="flex-1 flex flex-col bg-white text-slate-800 overflow-hidden">
            <div className="bg-teal-800 text-white p-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveScreen('home')} className="p-1 hover:bg-teal-700 rounded-full text-white"><ChevronLeft className="w-4 h-4" /></button>
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-900 text-sm flex items-center justify-center font-bold">👩‍⚕️</div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-none">Dr. Sarah Jenkins</p>
                  <p className="text-[9px] opacity-75">Licensed DVM • Online</p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
            </div>

            {/* Simulated Live Video Window */}
            <div className="h-32 bg-slate-900 relative flex items-center justify-center shrink-0 border-b border-slate-200">
              <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-slate-300">STREAM ACTIVE</div>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Video className="w-4.5 h-4.5 text-teal-400" /> Connecting virtual consult feed...</span>
            </div>

            {/* Chat message space */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-xs">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2.5 rounded-xl max-w-[80%] text-left ${
                    chat.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-800'
                  }`}>
                    <p className="leading-relaxed">{chat.text}</p>
                    <span className="text-[8px] opacity-60 block mt-1 text-right">{chat.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendChatMessage} className="p-2 border-t border-slate-200 bg-white flex gap-1.5 shrink-0">
              <input 
                type="text" 
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Ask Dr. Jenkins about wound care..." 
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button type="submit" className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        );

      case 'emergency':
        return (
          <div className="flex-1 flex flex-col justify-between bg-red-950 text-white p-5 text-left overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <span className="text-xl">🚨</span>
                  <h3 className="text-md font-black tracking-wide uppercase text-red-400">EMERGENCY DASHBOARD</h3>
                </div>
                <button onClick={() => setActiveScreen('home')} className="text-xs font-bold text-slate-400">Exit</button>
              </div>

              <div className="p-3 bg-red-900/40 border border-red-700/50 rounded-xl space-y-1">
                <p className="text-xs font-black text-red-100">Severe Red Flags Flagged!</p>
                <p className="text-[11px] text-red-200 leading-relaxed">Continuous deep active bleeding, shock signs, or structural bones in view are life-threatening indicators.</p>
              </div>

              <div className="space-y-2 pt-1">
                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Active Red Flags:</h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    { label: "Heavy bleeding", key: "heavyBleeding" },
                    { label: "Bone visible", key: "boneVisible" },
                    { label: "Eye injury", key: "eyeInjury" },
                    { label: "Large burn", key: "largeBurn" },
                    { label: "Deep puncture", key: "deepPuncture" },
                    { label: "Collapse / Shock", key: "collapse" },
                    { label: "Breathing difficulty", key: "difficultyBreathing" },
                    { label: "Snake bite suspected", key: "snakeBite" }
                  ].map((flag) => (
                    <div 
                      key={flag.key}
                      onClick={() => triggerEmergencyChecked(flag.key as any)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        emergencyTriggers[flag.key as keyof typeof emergencyTriggers] 
                          ? 'bg-red-600 border-red-400 text-white font-bold' 
                          : 'bg-red-950/50 border-red-900 text-red-300'
                      }`}
                    >
                      {flag.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/5 space-y-1">
                <p className="text-xs font-bold text-white">First-Aid instructions for Severe Bleeding:</p>
                <ol className="list-decimal pl-4.5 text-[11px] text-slate-300 space-y-1">
                  <li>Apply continuous direct pressure using a clean, thick towel.</li>
                  <li>Do not wash or spray water (disrupts natural clotting process).</li>
                  <li>Keep the pet quiet and wrapped in blankets to forestall shock.</li>
                </ol>
              </div>
            </div>

            <div className="space-y-2 pt-4 shrink-0">
              <button 
                onClick={() => {
                  setActiveScreen('vet_recommendations');
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md uppercase tracking-wider text-center"
              >
                🏥 Find Closest Emergency ER Vet Now
              </button>
            </div>
          </div>
        );

      case 'healing_tracker':
        return (
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-y-auto p-4 text-left">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setActiveScreen('home')} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
              <h3 className="text-md font-black text-slate-900">Healing Tracker</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h4 className="text-sm font-black text-slate-800">Thigh Wound Timeline</h4>
                  <p className="text-[11px] text-slate-400">Daily verification records for Luna</p>
                </div>
                <span className="text-xs font-black bg-green-100 text-green-700 px-2 py-0.5 rounded">40% Recovered</span>
              </div>

              {/* Progress bars */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-teal-500 h-full w-[40%]" />
              </div>

              <div className="space-y-2 text-xs text-left pt-2 border-t border-slate-100">
                {healingDays.map((day, idx) => (
                  <div key={idx} className="flex justify-between items-center p-1.5 hover:bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-md">{day.img}</span>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">{day.day}</p>
                        <p className="text-[10px] text-slate-400">{day.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Progress: {day.progress}%</span>
                      <input 
                        type="checkbox" 
                        checked={day.checked} 
                        onChange={() => {
                          const updated = [...healingDays];
                          updated[idx].checked = !updated[idx].checked;
                          setHealingDays(updated);
                        }}
                        className="accent-teal-600 w-4 h-4 cursor-pointer" 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  alert("Daily healing progress captured. Healing percentage estimated at 40%. Keep utilizing the E-collar!");
                }}
                className="w-full py-2 bg-teal-600 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                📸 Capture & Append Daily Photo
              </button>
            </div>
          </div>
        );

      default:
        return <div className="p-4">Unknown Screen State</div>;
    }
  };

  return (
    <div className="w-[1024px] h-[768px] bg-slate-50 flex flex-col font-sans overflow-hidden border-8 border-slate-200 rounded-3xl shadow-2xl mx-auto my-auto relative">
      {/* App Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">🐾</div>
          <div className="text-left">
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Pet Smile AI</h1>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mt-0.5">Clinical Decision Support</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-full border border-teal-100">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">AI Engine Operational</span>
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 leading-none">{activePet.name}</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">{activePet.breed} • {activePet.age}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-md shadow-inner">
              {activePet.avatar}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace split */}
      <main className="flex-1 flex gap-5 p-5 min-h-0 bg-slate-100/50">
        {/* Left column: Simulated Device */}
        <div className="w-[360px] flex flex-col items-center shrink-0 justify-center">
          <div className="w-[340px] h-[580px] bg-slate-900 rounded-[2.5rem] p-3 border-4 border-slate-850 shadow-2xl relative flex flex-col overflow-hidden">
            {/* Phone Notch/Speaker */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-30 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-800 rounded-full mb-1" />
            </div>

            {/* Simulated Phone Screen viewport */}
            <div className="flex-1 rounded-[2rem] bg-white overflow-hidden flex flex-col pt-3 border border-slate-850 relative">
              {renderPhoneScreen()}
            </div>
          </div>

          {/* Quick interactive screen picker drawer to let reviewers navigate all 18 states instantly */}
          <div className="mt-2 text-left w-full">
            <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Direct Simulator Navigation (18 Screens):</label>
            <select 
              value={activeScreen}
              onChange={(e) => setActiveScreen(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="splash">1. Splash Screen</option>
              <option value="onboarding">2. Onboarding Disclaimer</option>
              <option value="permissions">3. Permission Requests</option>
              <option value="auth">4. Authentication Portal</option>
              <option value="home">5. Home Screen Hub</option>
              <option value="scan_flow">6. Scan Instructions</option>
              <option value="camera_interface">7. Intelligent Camera Assistant</option>
              <option value="ai_analysis_screen">8. AI Analysis Pipeline</option>
              <option value="result_screen">9. Scan Assessment Report</option>
              <option value="first_aid">10. First-Aid Knowledge Index</option>
              <option value="vet_recommendations">11. Nearest Vet Recommendations</option>
              <option value="history">12. History Log Comparisons</option>
              <option value="profile">13. Pet Profile Manager</option>
              <option value="premium">14. Premium Upgrade upsell</option>
              <option value="settings">15. Settings & GDPR Purge</option>
              <option value="faq">16. Frequently Asked Questions</option>
              <option value="contact_vet">17. Live Vet consult Chat & Video</option>
              <option value="emergency">18. Emergency mode & Red Flags</option>
              <option value="healing_tracker">19. Daily Healing Tracker Progress</option>
            </select>
          </div>
        </div>

        {/* Right column: Developer specifications, analysis parameters and schemas */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          {/* Navigation tabs */}
          <div className="flex border-b border-slate-100 pb-2 shrink-0 gap-1.5">
            <button 
              onClick={() => setRightPanelTab('report')}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${
                rightPanelTab === 'report' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Active Report Explorer
            </button>
            <button 
              onClick={() => setRightPanelTab('prompts')}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${
                rightPanelTab === 'prompts' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              System Prompt Spec
            </button>
            <button 
              onClick={() => setRightPanelTab('api')}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${
                rightPanelTab === 'api' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              DB Schema & API
            </button>
            <button 
              onClick={() => setRightPanelTab('key')}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all flex items-center gap-1 ${
                rightPanelTab === 'key' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Secret Keys Guide {geminiKeyConfigured ? '🟢' : '🟡'}
            </button>
          </div>

          {/* Panel Contents */}
          <div className="flex-1 min-h-0 overflow-y-auto py-3 text-left">
            {rightPanelTab === 'report' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Active Analysis Report Explorer</h3>
                  <button 
                    onClick={() => {
                      alert("Compiling report payload into clean PDF format...");
                    }} 
                    className="px-2.5 py-1 bg-slate-150 border border-slate-200 rounded text-[11px] font-bold text-slate-700"
                  >
                    Download report PDF
                  </button>
                </div>

                {analysisResult ? (
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium">
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <div>
                        <p className="text-[10px] text-slate-400">PET PATIENT</p>
                        <p className="font-bold text-slate-800">{activePet.name} ({activePet.species})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">REPORT GENERATED</p>
                        <p className="font-bold text-slate-800">{analysisResult.date}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <p className="text-[9px] text-slate-400">SEVERITY</p>
                        <p className="font-bold text-slate-800">Level {analysisResult.severityLevel}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <p className="text-[9px] text-slate-400">QUALITY SCORE</p>
                        <p className="font-bold text-slate-850">{analysisResult.imageQualityScore}/100</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <p className="text-[9px] text-slate-400">CONFIDENCE</p>
                        <p className="font-bold text-slate-800">{analysisResult.confidenceScore}%</p>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] text-slate-400">CLINICAL DESCRIPTION ASSESSMENT</p>
                      <p className="text-slate-700 leading-relaxed italic bg-white p-2.5 border border-slate-150 rounded">{analysisResult.severityExplanation}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400">SAFE FIRST-AID FLUSH RECOMMENDATIONS</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {analysisResult.firstAid.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400">POTENTIAL RISKS & COMPLICATIONS</p>
                      <p className="text-slate-600 bg-white p-2 rounded">{analysisResult.riskExplanation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-lg mb-2">🐾</div>
                    <p className="text-xs font-bold text-slate-700">No active scan report loaded</p>
                    <p className="text-[11px] text-slate-400 max-w-sm">Please head to the mobile simulator, select "Dog Scraped Paw" or another case, and click "Run AI Scan" to explore deep metrics here.</p>
                  </div>
                )}
              </div>
            )}

            {rightPanelTab === 'prompts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Veterinary AI System Prompts Spec</h3>
                <p className="text-xs text-slate-500">The application uses distinct system prompt contexts for validation, segmentation, and safety checking.</p>

                <div className="space-y-3 text-xs">
                  <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-teal-800 uppercase tracking-wider text-[10px]">1. Image Validation Prompt</span>
                      <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 rounded">Vision-Flash</span>
                    </div>
                    <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed bg-white border border-slate-150 p-2 rounded max-h-32 overflow-y-auto">
{`Verify whether the provided image contains a domestic cat (feline) or dog (canine). Evaluate sharpness metrics: sharpness (0-100), lighting balance, occlusion, fingers blocking the lens, or if the pet is out of frame. Reject unsupported animals like birds or reptiles.`}
                    </pre>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-teal-800 uppercase tracking-wider text-[10px]">2. Wound Analysis & Severity Prompt</span>
                      <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 rounded">Vision-Flash</span>
                    </div>
                    <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed bg-white border border-slate-150 p-2 rounded max-h-32 overflow-y-auto">
{`Analyze external pet wound features. Characterize erythema (redness), localized swelling, active capillary hemorrhaging, purulent discharge, or healing stage. Determine Level 1-5 severity using cautious language like "suggests" or "could indicate". Exclude human medication dosages.`}
                    </pre>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-teal-800 uppercase tracking-wider text-[10px]">3. Clinical First-Aid Generator Prompt</span>
                      <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 rounded">Structured JSON</span>
                    </div>
                    <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed bg-white border border-slate-150 p-2 rounded max-h-32 overflow-y-auto">
{`Generate step-by-step external wound care instructions. Support only safe home care like warm saline flushing, dry gauze protection, and immediate cone placement. Strictly restrict prescriptions, antibiotics, human NSAIDs or steroids.`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {rightPanelTab === 'api' && (
              <div className="space-y-4 text-xs font-medium">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Database Schemas & REST API Definitions</h3>

                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <p className="font-bold text-slate-800 mb-1.5 uppercase text-[10px]">Database Schema definitions</p>
                    <pre className="text-[9.5px] text-slate-600 font-mono bg-white border border-slate-150 p-2.5 rounded leading-relaxed max-h-48 overflow-y-auto">
{`-- SQL Database Blueprints for Pet Smile AI
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pets (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL,
  breed VARCHAR(100),
  age VARCHAR(50),
  weight VARCHAR(50),
  allergies TEXT,
  medications TEXT,
  vaccines TEXT,
  microchip VARCHAR(100)
);

CREATE TABLE scans (
  id VARCHAR(255) PRIMARY KEY,
  pet_id VARCHAR(255) REFERENCES pets(id) ON DELETE CASCADE,
  image_url TEXT,
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  features JSONB NOT NULL,
  first_aid TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                    </pre>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <p className="font-bold text-slate-800 mb-1.5 uppercase text-[10px]">REST API endpoints</p>
                    <pre className="text-[9.5px] text-slate-600 font-mono bg-white border border-slate-150 p-2.5 rounded leading-relaxed max-h-48 overflow-y-auto">
{`/* REST ENDPOINTS FOR INTUITIVE INTEGRATION */
POST /api/auth/register    -- Create User Account
POST /api/pets             -- Register Pet profile
GET /api/pets              -- Get all pet profiles
POST /api/analyze          -- Send base64 wound image for AI report
GET /api/scans/history     -- Fetch historical evaluation list
POST /api/healing/track    -- Log progress % and add photo`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {rightPanelTab === 'key' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Secret Keys configuration guide</h3>
                
                <div className="space-y-3 text-xs leading-relaxed font-medium">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 flex gap-2.5">
                    <span className="text-lg">⚙️</span>
                    <div>
                      <p className="font-bold">Gemini API Key Status</p>
                      <p className="text-[11px] mt-0.5">
                        {geminiKeyConfigured 
                          ? "🟢 ACTIVE! Real-time server-side Gemini API analysis is fully active. Images you upload will be evaluated by live models."
                          : "🟡 MISSING! Custom API key is not configured in secrets. The application has fell back to an optimal mock analysis, keeping the interface 100% testable."
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-slate-600">
                    <p>To enable real-time Gemini AI analysis using your own key, follow these short instructions:</p>
                    <ol className="list-decimal pl-4.5 space-y-2 text-[11px]">
                      <li>Go to Google AI Studio and fetch a free or pay-as-you-go **API Key** from your workspace console.</li>
                      <li>In Google AI Studio Build, locate the **Settings &gt; Secrets** panel.</li>
                      <li>Create an environment variable secret called `GEMINI_API_KEY` and paste your key.</li>
                      <li>Click save, then tap **Restart Dev Server** in the developer console. The indicator above will turn green!</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Legal Disclaimer Footer */}
      <footer className="h-12 bg-slate-100 border-t border-slate-200 px-8 flex items-center justify-center shrink-0">
        <p className="text-[10px] text-slate-500 text-center max-w-3xl leading-tight font-medium">
          <span className="font-black text-slate-700 uppercase">IMPORTANT SAFETY WARNING:</span> Pet Smile AI provides visual approximations only. This tool is NOT a medical diagnosis. If your pet appears in severe pain, distressed, or has a deep bleeding wound, please contact a licensed veterinarian immediately.
        </p>
      </footer>
    </div>
  );
}
