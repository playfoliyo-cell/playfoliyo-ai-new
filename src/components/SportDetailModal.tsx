import React, { useState, useEffect } from "react";
import { Sliders, X, Trophy, Plus, Check, Award, Sparkles, Trash2, Save } from "lucide-react";

export interface SportSegmentDefinition {
  segments: string[];
  subfields?: Record<string, string[]>;
  defaultSubfields?: string[];
}

export const SPORT_SEGMENTS_MAP: Record<string, SportSegmentDefinition> = {
  "gymnastics": {
    segments: [
      "Artistic Gymnastics (Male)",
      "Artistic Gymnastics (Female)",
      "Acrobatic Gymnastics",
      "Trampoline Gymnastics",
      "Rhythmic Gymnastics",
      "Aerobic Gymnastics",
      "Floor Exercise",
      "Vault",
      "Uneven Bars",
      "Balance Beam"
    ],
    subfields: {
      "Artistic Gymnastics (Male)": [
        "Floor Exercise Max Score",
        "Pommel Horse Max Score",
        "Still Rings Max Score",
        "Vault (Male) Max Score",
        "Parallel Bars Max Score",
        "Horizontal Bar Max Score"
      ],
      "Artistic Gymnastics (Female)": [
        "Vault (Female) Max Score",
        "Uneven Bars Max Score",
        "Balance Beam Max Score",
        "Floor Exercise (Female) Max Score"
      ],
      "Rhythmic Gymnastics": [
        "Hoop Routine Personal Best",
        "Ball Routine Personal Best",
        "Clubs Routine Personal Best",
        "Ribbon Routine Personal Best"
      ],
      "Trampoline Gymnastics": [
        "Individual Trampoline Score",
        "Synchro Trampoline Score",
        "Double Mini Trampoline Score",
        "Tumbling Score"
      ]
    }
  },
  "athletics (track & field)": {
    segments: [
      "Sprints (100m, 200m, 400m)",
      "Hurdles & Relays",
      "Middle Distance (800m, 1500m)",
      "Long Distance & Marathons",
      "Jumps (Long Jump, High Jump, Triple, Pole Vault)",
      "Throws (Javelin, Shot Put, Discus, Hammer Throw)",
      "Decathlon / Heptathlon"
    ],
    defaultSubfields: [
      "Personal Best (PB) Record",
      "Season Best (SB) Record",
      "Club / Academy Affiliation",
      "Primary Spike Shoes Brand"
    ]
  },
  "cricket": {
    segments: [
      "Twenty20 (T20)",
      "One Day International (ODI)",
      "Test Cricket",
      "Indoor / Box Cricket",
      "Street / Gulli Cricket"
    ],
    defaultSubfields: [
      "Batting Style / Position",
      "Bowling Style / Arm",
      "Wicketkeeping Style",
      "Highest Score In A Single Innings",
      "Best Bowling Figure (Wickets/Runs)",
      "Catches & Stumping Count"
    ]
  },
  "kabaddi": {
    segments: [
      "Standard Style (Indoor Mat)",
      "Circle Style (Outdoor Clay)",
      "Beach Kabaddi"
    ],
    defaultSubfields: [
      "Primary Role (Raider / Defender / All-Rounder)",
      "Signature Move (e.g. Dubki, Toe Touch, Ankle Hold)",
      "Successful Raids %",
      "Super Tackles / High-5s Count",
      "Pro Kabaddi Trial Experience"
    ]
  },
  "badminton": {
    segments: [
      "Men's Singles",
      "Women's Singles",
      "Men's Doubles",
      "Women's Doubles",
      "Mixed Doubles"
    ],
    defaultSubfields: [
      "Dominant Hand (Left / Right)",
      "Racket Model & Tension (lbs)",
      "Footwear Brand & Size",
      "Preferred Court Type (Synthetic / Wooden)",
      "State / National Ranking"
    ]
  },
  "field hockey": {
    segments: [
      "Standard 11-a-side Field Turf",
      "5-a-side Hockey (Hockey 5s)",
      "Indoor Hockey"
    ],
    defaultSubfields: [
      "Position Detail (Forward / Midfielder / Defender / GK)",
      "Hockey Stick Brand & Composition",
      "Total Goals Scored This Year",
      "Penalty Corner Specialist Type (Dragflicker / Pusher)"
    ]
  },
  "chess": {
    segments: [
      "Classical / Standard Chess",
      "Rapid Chess",
      "Blitz Chess",
      "Bullet / Hyperbullet Chess",
      "Chess960 (Fischer Random)"
    ],
    defaultSubfields: [
      "Current FIDE Classical Rating",
      "FIDE ID / Chess Title (GM / IM / FM / Candidate Master)",
      "Chess.com / Lichess Profile Link & Rating",
      "Opening Repertoire with White",
      "Opening Repertoire with Black"
    ]
  },
  "football (soccer)": {
    segments: [
      "11-a-side Standard Grass/Turf",
      "Futsal (Indoor 5-a-side)",
      "7-a-side Turf / Small Sided",
      "Beach Football"
    ],
    defaultSubfields: [
      "Specific Position (Winger, Centerback, Playmaker, Striker)",
      "Preferred Football Boot Model",
      "Matches Played & Goal Involvement Ratio",
      "Dominant Foot (Right / Left / Both)"
    ]
  }
};

export const safeParseJson = (str: string | undefined, defaultVal: any) => {
  if (!str) return defaultVal;
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultVal;
  }
};

export interface SportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sportName: string;
  sportMetrics: Record<string, string>;
  isEditing: boolean;
  onSave: (updatedMetricsForSport: {
    segments: string[];
    customSegments: string[];
    customStats: { key: string; value: string }[];
    subfields: Record<string, string>;
    nestedObject: Record<string, any>;
  }) => void;
}

export default function SportDetailModal({
  isOpen,
  onClose,
  sportName,
  sportMetrics,
  isEditing,
  onSave
}: SportDetailModalProps) {
  const [activeSegments, setActiveSegments] = useState<string[]>([]);
  const [customSegments, setCustomSegments] = useState<string[]>([]);
  const [customStats, setCustomStats] = useState<{ key: string; value: string }[]>([]);
  const [subfieldValues, setSubfieldValues] = useState<Record<string, string>>({});
  
  const [newSegmentText, setNewSegmentText] = useState("");
  const [newStatKey, setNewStatKey] = useState("");
  const [newStatValue, setNewStatValue] = useState("");

  useEffect(() => {
    if (isOpen && sportName) {
      // Load existing flat metrics or try to extract from nested pref if available
      const nestedPrefRaw = sportMetrics[`preferences_${sportName}`];
      if (nestedPrefRaw) {
        const nested = safeParseJson(nestedPrefRaw, null);
        if (nested) {
          setActiveSegments(nested.segments || []);
          setCustomSegments(nested.customSegments || []);
          setCustomStats(nested.customStats || []);
          setSubfieldValues(nested.subfields || {});
          setNewSegmentText("");
          setNewStatKey("");
          setNewStatValue("");
          return;
        }
      }

      // Fallback/Initial load from flatter keys
      const actSegs = safeParseJson(sportMetrics[`segments_${sportName}`], []);
      const custSegs = safeParseJson(sportMetrics[`custom_segments_${sportName}`], []);
      const custStats = safeParseJson(sportMetrics[`custom_stats_${sportName}`], []);
      
      setActiveSegments(actSegs);
      setCustomSegments(custSegs);
      setCustomStats(custStats);
      
      const subfields: Record<string, string> = {};
      Object.keys(sportMetrics).forEach(key => {
        if (key.startsWith(`subfield_${sportName}_`)) {
          subfields[key] = sportMetrics[key];
        }
      });
      setSubfieldValues(subfields);
      
      setNewSegmentText("");
      setNewStatKey("");
      setNewStatValue("");
    }
  }, [isOpen, sportName, sportMetrics]);

  if (!isOpen) return null;

  const lowerSport = sportName.toLowerCase().trim();
  const segmentDef = SPORT_SEGMENTS_MAP[lowerSport];

  // Calculate sub-fields to render
  let subfieldsToRender: string[] = [];
  if (segmentDef) {
    if (segmentDef.subfields) {
      activeSegments.forEach(seg => {
        if (segmentDef.subfields?.[seg]) {
          subfieldsToRender.push(...segmentDef.subfields[seg]);
        }
      });
    }
    if (segmentDef.defaultSubfields) {
      subfieldsToRender.push(...segmentDef.defaultSubfields);
    }
  }
  subfieldsToRender = Array.from(new Set(subfieldsToRender));

  const handleApply = () => {
    // Build nested object
    const nestedObject = {
      sport: sportName,
      segments: activeSegments,
      customSegments,
      customStats,
      subfields: subfieldValues,
      updatedAt: new Date().toISOString()
    };

    onSave({
      segments: activeSegments,
      customSegments,
      customStats,
      subfields: subfieldValues,
      nestedObject
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="sport-detail-modal-root">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-2xl border border-slate-100 flex flex-col max-h-[85vh]">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
            <div className="flex items-center space-x-2.5">
              <div className="bg-blue-100 text-blue-700 p-2 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Configure {sportName} Details
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Manage sub-categories, disciplines, apparatuses, and performance KPIs
                </p>
              </div>
            </div>
            <button
              id="close-sport-detail-modal-btn"
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            
            {/* 1. Predefined disciplines/segments */}
            {segmentDef && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-blue-600" />
                    1. Standard Specialties / Disciplines
                  </h4>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">Select all that apply</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {segmentDef.segments.map(seg => {
                      const isSelected = activeSegments.includes(seg);
                      return (
                        <button
                          key={seg}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setActiveSegments(activeSegments.filter(s => s !== seg));
                            } else {
                              setActiveSegments([...activeSegments, seg]);
                            }
                          }}
                          className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                          {seg}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Custom sub-disciplines/specialties */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Custom Sub-Categories (e.g., Gymnastics: Floor, Vault)
              </h4>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                {customSegments.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {customSegments.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-200 font-extrabold flex items-center gap-1.5 shadow-2xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setCustomSegments(customSegments.filter(t => t !== tag))}
                          className="text-slate-400 hover:text-slate-700 font-extrabold ml-1 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No custom sub-categories added yet.</p>
                )}

                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    placeholder="Enter custom sub-category (e.g., Floor, Vault, Sprint, Marathon)..."
                    value={newSegmentText}
                    onChange={(e) => setNewSegmentText(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] focus:outline-hidden focus:border-blue-500 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = newSegmentText.trim();
                        if (val && !customSegments.includes(val)) {
                          setCustomSegments([...customSegments, val]);
                          setNewSegmentText("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newSegmentText.trim();
                      if (val && !customSegments.includes(val)) {
                        setCustomSegments([...customSegments, val]);
                        setNewSegmentText("");
                      }
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Predefined apparatuses / subfield value inputs */}
            {subfieldsToRender.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  Performance Scores & Apparatus Metrics
                </h4>
                
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subfieldsToRender.map(subName => {
                    const subFieldId = `subfield_${sportName}_${subName}`;
                    return (
                      <div key={subName} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">{subName}</label>
                        <input
                          type="text"
                          placeholder="Enter score or status..."
                          value={subfieldValues[subFieldId] || ""}
                          onChange={(e) => setSubfieldValues({
                            ...subfieldValues,
                            [subFieldId]: e.target.value
                          })}
                          className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Custom Performance Metrics (key-value) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Custom Performance Metrics & Personal Bests
              </h4>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4">
                {customStats.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customStats.map(item => (
                      <div key={item.key} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-2xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">{item.key}</span>
                          <span className="text-xs text-slate-800 font-black font-mono">{item.value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomStats(customStats.filter(i => i.key !== item.key))}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No custom metrics/scores added. Create some below!</p>
                )}

                <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Add Custom Metric / Personal Best</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Metric Name (e.g., Vault PB, 100m Time)"
                      value={newStatKey}
                      onChange={(e) => setNewStatKey(e.target.value)}
                      className="w-full border border-slate-200 px-3 py-2 rounded-lg text-[10px] focus:outline-hidden focus:border-blue-500 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g., 14.5, 10.45s)"
                      value={newStatValue}
                      onChange={(e) => setNewStatValue(e.target.value)}
                      className="w-full border border-slate-200 px-3 py-2 rounded-lg text-[10px] focus:outline-hidden focus:border-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const key = newStatKey.trim();
                        const val = newStatValue.trim();
                        if (key && val) {
                          const filtered = customStats.filter(i => i.key.toLowerCase() !== key.toLowerCase());
                          setCustomStats([...filtered, { key, value: val }]);
                          setNewStatKey("");
                          setNewStatValue("");
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 gap-3">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {!isEditing && "⚡ Saved directly to your live sports CV!"}
            </span>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <button
                id="cancel-sport-detail-modal"
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                id="save-sport-detail-modal-btn"
                type="button"
                onClick={handleApply}
                className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Apply & Save</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
