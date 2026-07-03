import React, { useState, useEffect } from "react";
import { User, Opportunity } from "../types";
import { Briefcase, MapPin, Award, CheckCircle, Trophy, Sparkles, MessageSquare, ClipboardCheck, Plus, X, HelpCircle } from "lucide-react";

interface OpportunitiesTabProps {
  user: User;
  onApply: (oppId: string) => void;
  applications: string[]; // List of oppIds the user has applied to
}

export default function OpportunitiesTab({ user, onApply, applications }: OpportunitiesTabProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Opportunity Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"scholarship" | "trial" | "recruitment" | "sponsorship" | "coaching_job" | "vacancy">("trial");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [budget, setBudget] = useState("");

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/opportunities");
      const data = await res.json();
      if (res.ok) {
        setOpportunities(data);
      }
    } catch (e) {
      console.error("Failed to load opportunities", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sport || !location || !description) return;

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          org_id: user.id,
          type,
          sport,
          location,
          description,
          requirements,
          budget,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchOpportunities();
        // Reset states
        setTitle("");
        setSport("");
        setLocation("");
        setDescription("");
        setRequirements("");
        setBudget("");
      }
    } catch (e) {
      console.error("Create opportunity error:", e);
    }
  };

  const handleApplyClick = async (oppId: string) => {
    try {
      const res = await fetch(`/api/opportunities/${oppId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (res.ok) {
        onApply(oppId);
        fetchOpportunities();
      }
    } catch (e) {
      console.error("Application error:", e);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const canPublish = ["club", "academy", "sponsor", "coach", "admin"].includes(user.role);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Tab Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#1D4ED8]" />
            <span>Sports Careers & Opportunities</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Connect directly with active youth drafts, professional academy trials, and corporate sponsorships.</p>
        </div>

        {canPublish && (
          <button
            id="opp-publish-trigger-btn"
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer shadow-md shadow-blue-500/15"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Opportunity</span>
          </button>
        )}
      </div>

      {/* Main listings */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-2xl h-44 animate-pulse"></div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No career opportunities available</h3>
          <p className="text-xs text-slate-400 mt-1">Check back later or change your sport filter parameters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {opportunities.map((opp) => {
            const hasApplied = applications.includes(opp.id) || opp.applications.includes(user.id);
            const isMyOpp = opp.org_id === user.id;

            return (
              <div
                id={`opportunity-card-${opp.id}`}
                key={opp.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-all"
              >
                {/* Left block Info */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                      <img src={opp.org_avatar || null} alt={opp.organization} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base tracking-tight">{opp.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="text-[#1D4ED8] font-bold">{opp.organization}</span>
                        <span>•</span>
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full capitalize text-[10px] font-bold">
                          {opp.type}
                        </span>
                        <span>•</span>
                        <span className="font-bold">{opp.sport}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{opp.location}</span>
                    </div>
                    {opp.budget && (
                      <div className="flex items-center space-x-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold">{opp.budget}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{opp.description}</p>
                  </div>

                  {opp.requirements && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Requirements</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {opp.requirements}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right block Actions / Count of applicants */}
                <div className="md:w-48 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right space-y-1 mb-4 md:mb-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Applicant Pool</span>
                    <span className="text-xl font-black text-slate-900">{opp.applications.length} applied</span>
                  </div>

                  {isMyOpp ? (
                    <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-xl w-full text-center">
                      Author Profile
                    </div>
                  ) : hasApplied ? (
                    <button
                      id={`applied-label-${opp.id}`}
                      disabled
                      className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 w-full cursor-not-allowed"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Applied</span>
                    </button>
                  ) : (
                    <button
                      id={`apply-btn-${opp.id}`}
                      onClick={() => handleApplyClick(opp.id)}
                      className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all text-center w-full cursor-pointer shadow-xs"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowCreateModal(false)}></div>
          
          <div className="relative bg-white border border-slate-100 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Create Vacancy / Opportunity</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="create-opp-form" onSubmit={handleCreateOpportunity} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Opportunity Title</label>
                <input
                  id="opp-title-input"
                  type="text"
                  required
                  placeholder="e.g. Youth Academy Trial 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Category Type</label>
                  <select
                    id="opp-type-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    <option value="trial">Draft / Trial</option>
                    <option value="scholarship">School Scholarship</option>
                    <option value="sponsorship">Sponsorship Funding</option>
                    <option value="recruitment">Recruitment Drive</option>
                    <option value="coaching_job">Coaching Staff Job</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Sport discipline</label>
                  <input
                    id="opp-sport-input"
                    type="text"
                    required
                    placeholder="e.g. Football (Soccer)"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Location Region</label>
                  <input
                    id="opp-location-input"
                    type="text"
                    required
                    placeholder="e.g. Mumbai, India (or Remote)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Sponsorship Grant / Budget</label>
                  <input
                    id="opp-budget-input"
                    type="text"
                    placeholder="e.g. ₹2,00,000 / accommodation"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Description</label>
                <textarea
                  id="opp-description-input"
                  required
                  rows={3}
                  placeholder="Outline the scouting showcase, scholarship specs, or sponsorship funding criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Required Qualifications / Standards</label>
                <textarea
                  id="opp-requirements-input"
                  rows={2}
                  placeholder="State player ages, levels, certifications needed..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <button
                id="opp-submit-btn"
                type="submit"
                className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Publish Opportunity Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
