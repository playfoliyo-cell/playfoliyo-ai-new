import React, { useState, useEffect, useRef } from "react";
import { User, Message } from "../types";
import { 
  Send, Search, CheckCircle, Award, Shield, User as UserIcon, 
  HelpCircle, Trash2, Paperclip, AlertTriangle, ShieldCheck, Flag, Slash, Lock, FileText, Play, Check, X
} from "lucide-react";
import ProfileCardView from "./ProfileCardView";

interface MessagesTabProps {
  user: User;
  onSelectRecipientId?: string | null;
}

interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export default function MessagesTab({ user, onSelectRecipientId }: MessagesTabProps) {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [recipientStatus, setRecipientStatus] = useState<{ status: string; privacy: string; last_seen?: string }>({ status: "offline", privacy: "hidden" });
  
  // Security Alert UI State
  const [securityAlert, setSecurityAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [attachedFileUrl, setAttachedFileUrl] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  // Target User Profile Modal state
  const [profileModalItem, setProfileModalItem] = useState<{ user: User; profile: any } | null>(null);
  const [isProfileModalLoading, setIsProfileModalLoading] = useState(false);

  const triggerAlert = (message: string, type: "success" | "error" | "info" = "success") => {
    setSecurityAlert({ message, type });
    setTimeout(() => setSecurityAlert(null), 5000);
  };

  const handleViewUserProfile = async (targetUserId: string) => {
    setIsProfileModalLoading(true);
    try {
      const res = await fetch(`/api/profiles/${targetUserId}`);
      const data = await res.json();
      if (res.ok) {
        setProfileModalItem(data);
      } else {
        triggerAlert("Failed to load profile details.", "error");
      }
    } catch (e) {
      triggerAlert("Failed to fetch profile.", "error");
    } finally {
      setIsProfileModalLoading(false);
    }
  };

  // Fetch blocked list and contacts
  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/profiles", {
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      const data = await res.json();
      if (res.ok) {
        const filtered: ChatContact[] = data
          .filter((item: any) => item.user.id !== user.id)
          .map((item: any) => ({
            id: item.user.id,
            name: item.user.name,
            role: item.user.role,
            avatar: item.profile.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
          }));
        setContacts(filtered);

        if (onSelectRecipientId) {
          const matching = filtered.find(c => c.id === onSelectRecipientId);
          if (matching) setSelectedContact(matching);
        } else if (filtered.length > 0 && !selectedContact) {
          setSelectedContact(filtered[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load contacts", e);
    }
  };

  // Fetch online status of selected recipient
  const fetchRecipientStatus = async () => {
    if (!selectedContact) return;
    try {
      const res = await fetch(`/api/users/${selectedContact.id}/status`, {
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRecipientStatus(data);
      }
    } catch (e) {
      setRecipientStatus({ status: "offline", privacy: "hidden" });
    }
  };

  // Fetch conversation messages
  const fetchMessages = async () => {
    if (!selectedContact) return;
    try {
      const res = await fetch(`/api/messages?sender_id=${user.id}&receiver_id=${selectedContact.id}`, {
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      } else if (res.status === 403) {
        // Blocked or unauthorized access
        setMessages([]);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachedFileUrl) return;
    if (!selectedContact) return;

    // Check offline/blocked state locally
    if (blockedUsers.includes(selectedContact.id)) {
      triggerAlert("You have blocked this user. Unblock them to communicate.", "error");
      return;
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({
          receiver_id: selectedContact.id,
          text: text.trim() || `Sent an attachment: ${attachedFileName}`,
          attachment_url: attachedFileUrl || undefined
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setText("");
        setAttachedFileUrl(null);
        setAttachedFileName(null);
        fetchMessages();
      } else {
        triggerAlert(data.error || "Message delivery failed.", "error");
      }
    } catch (e) {
      triggerAlert("Network failure sending message.", "error");
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Message deleted securely.", "success");
        fetchMessages();
      } else {
        triggerAlert(data.error || "Failed to delete message.", "error");
      }
    } catch (e) {
      triggerAlert("Network error trying to delete message.", "error");
    }
  };

  // Block user
  const handleBlockUser = async () => {
    if (!selectedContact) return;
    if (!window.confirm(`Are you sure you want to block ${selectedContact.name}? This will isolate all messaging between you two.`)) return;

    try {
      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ blocked_id: selectedContact.id })
      });
      const data = await res.json();
      if (res.ok) {
        setBlockedUsers(prev => [...prev, selectedContact.id]);
        triggerAlert(`${selectedContact.name} blocked successfully.`, "success");
        fetchMessages();
      } else {
        triggerAlert(data.error || "Failed to block user.", "error");
      }
    } catch (e) {
      triggerAlert("Network error trying to block user.", "error");
    }
  };

  // Submit report
  const handleReportUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !reportReason) return;

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({
          reported_id: selectedContact.id,
          reason: reportReason,
          details: reportDetails
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert(`Report filed securely for review.`, "success");
        setShowReportModal(false);
        setReportReason("");
        setReportDetails("");
      } else {
        triggerAlert(data.error || "Failed to file report.", "error");
      }
    } catch (e) {
      triggerAlert("Network error filing report.", "error");
    }
  };

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processUploadedFile = async (file: File) => {
    if (!file) return;

    // Client-side file size gate (25MB)
    if (file.size > 25 * 1024 * 1024) {
      triggerAlert("File exceeds 25MB maximum size restriction.", "error");
      return;
    }

    // Client-side extension validation
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".mp4"];
    if (!allowedExtensions.includes(ext)) {
      triggerAlert("Forbidden file type. Permitted: JPG, PNG, WEBP, PDF, MP4.", "error");
      return;
    }

    setIsUploading(true);
    triggerAlert("Scanning attachment for security vulnerabilities...", "info");

    try {
      // Read file to Base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = reader.result as string;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${user.id}`
            },
            body: JSON.stringify({
              filename: file.name,
              base64: base64Content
            })
          });
          const data = await res.json();
          setIsUploading(false);

          if (res.ok) {
            setAttachedFileUrl(data.url);
            setAttachedFileName(file.name);
            triggerAlert("Attachment approved and virus scan passed.", "success");
          } else {
            triggerAlert(data.error || "Security scan rejected this upload.", "error");
          }
        } catch (err) {
          setIsUploading(false);
          triggerAlert("Upload failed during backend transmission.", "error");
        }
      };
      reader.onerror = () => {
        setIsUploading(false);
        triggerAlert("Failed to read file payload.", "error");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploading(false);
      triggerAlert("Attachment system error.", "error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [onSelectRecipientId]);

  useEffect(() => {
    fetchMessages();
    fetchRecipientStatus();
    const interval = setInterval(() => {
      fetchMessages();
      fetchRecipientStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedContact?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-[78vh] flex flex-col relative text-slate-900">
      
      {/* Dynamic Security Banner / Flash Alerts */}
      {securityAlert && (
        <div 
          id="security-toast-banner"
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center space-x-3 text-xs font-semibold backdrop-blur-md transition-all duration-300 border ${
            securityAlert.type === "error" 
              ? "bg-rose-50 text-rose-800 border-rose-200" 
              : securityAlert.type === "info"
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{securityAlert.message}</span>
        </div>
      )}

      {/* Main Panel Content split */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left contacts list */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="message-contact-search"
                type="text"
                placeholder="Search direct channels..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 bg-white text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              const isBlocked = blockedUsers.includes(contact.id);
              return (
                <div
                  id={`chat-contact-row-${contact.id}`}
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50/75 border-l-4 border-blue-500" : "hover:bg-slate-100/50"
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0 relative border border-slate-100 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewUserProfile(contact.id);
                    }}
                    title="Click to view Athlete Profile"
                  >
                    <img src={contact.avatar || undefined} alt={contact.name} className="w-full h-full object-cover" />
                    {isBlocked && (
                      <div className="absolute inset-0 bg-red-100/80 flex items-center justify-center">
                        <Slash className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs truncate">{contact.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block capitalize">
                      {contact.role} {isBlocked && <span className="text-red-500 font-bold ml-1">(Blocked)</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Dialog Chat Feed */}
        <div className="flex-1 flex flex-col bg-slate-50/30 relative">
          {selectedContact ? (
            <>
              {/* Active Header bar with blocking, report, status */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs">
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => handleViewUserProfile(selectedContact.id)}
                  title="Click to view Athlete Profile"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200">
                    <img src={selectedContact.avatar || undefined} alt={selectedContact.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900 text-sm">{selectedContact.name}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                    </div>
                    
                    {/* Privacy respecting dynamic online indicator */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {recipientStatus.status === "online" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[10px] text-emerald-600 font-semibold uppercase">Online</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Last seen: {recipientStatus.last_seen || "Recently active"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Secure Actions panel */}
                <div className="flex items-center gap-2">
                  <button
                    id="secure-action-profile-btn"
                    onClick={() => handleViewUserProfile(selectedContact.id)}
                    className="p-2 hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-slate-200 rounded-xl transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View Profile</span>
                  </button>
                  <button
                    id="secure-action-report-btn"
                    onClick={() => setShowReportModal(true)}
                    className="p-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 rounded-xl transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Report</span>
                  </button>
                  <button
                    id="secure-action-block-btn"
                    onClick={handleBlockUser}
                    className="p-2 hover:bg-slate-105 text-slate-600 hover:text-slate-850 border border-slate-200 rounded-xl transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <Slash className="w-3.5 h-3.5 text-orange-500" /> <span className="hidden sm:inline">Block</span>
                  </button>
                </div>
              </div>

              {/* Chat messages dialogue scroll feed with Drag & Drop */}
              <div 
                className={`flex-1 p-4 overflow-y-auto space-y-4 relative ${dragActive ? "bg-blue-50/90 border-2 border-dashed border-blue-400" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {dragActive && (
                  <div className="absolute inset-0 bg-white/95 z-20 flex flex-col justify-center items-center text-center p-8 pointer-events-none">
                    <Paperclip className="w-12 h-12 mb-3 text-blue-500 animate-bounce" />
                    <h3 className="font-bold text-slate-800">Drag to Attach File Safely</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">Files will be automatically scanned by the PlayFoliyo Secure Vault before being public. JPG, PNG, WEBP, PDF, MP4 up to 25MB permitted.</p>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 text-slate-400">
                    <HelpCircle className="w-10 h-10 mb-2 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-500">No private dialogue recorded yet.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Send inquiries about portfolios, scouting spots, or athletic trials securely.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === user.id;
                    const attachmentUrl = (m as any).attachment_url;
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                        <div className="flex items-end space-x-2">
                          
                          {/* Trash bin to securely delete own message */}
                          {isMe && (
                            <button
                              id={`delete-message-btn-${m.id}`}
                              onClick={() => handleDeleteMessage(m.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                              title="Delete Message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <div
                            className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs border ${
                              isMe
                                ? "bg-blue-600 text-white rounded-br-none border-blue-500"
                                : "bg-white text-slate-800 rounded-bl-none border-slate-200"
                            }`}
                          >
                            <p className="leading-relaxed font-normal">{m.text}</p>
                            
                            {/* Inline Attachment Renderer */}
                            {attachmentUrl && (
                              <div className={`mt-3 p-2 rounded-xl border ${isMe ? "bg-blue-700/50 border-blue-600" : "bg-slate-50 border-slate-200"}`}>
                                {attachmentUrl.endsWith(".mp4") ? (
                                  <div className="relative rounded overflow-hidden">
                                    <video src={attachmentUrl} controls className="w-full max-h-48 rounded" />
                                  </div>
                                ) : attachmentUrl.endsWith(".pdf") ? (
                                  <a 
                                    href={attachmentUrl} 
                                    download 
                                    className={`flex items-center gap-2 font-semibold p-1 text-xs ${isMe ? "text-blue-100 hover:text-white" : "text-blue-600 hover:text-blue-700"}`}
                                    referrerPolicy="no-referrer"
                                  >
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span className="truncate">Download Attachment PDF</span>
                                  </a>
                                ) : (
                                  <div className="relative rounded overflow-hidden bg-black/5">
                                    <img 
                                      src={attachmentUrl} 
                                      alt="Attachment" 
                                      className="max-h-48 max-w-full object-contain rounded mx-auto cursor-pointer hover:scale-[1.01] transition-transform" 
                                      referrerPolicy="no-referrer"
                                      onClick={() => handleViewUserProfile(m.sender_id)}
                                      title="Sender Profile Portfolio"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            <span
                              className={`text-[8px] font-medium block mt-1.5 text-right ${
                                isMe ? "text-blue-200" : "text-slate-400"
                              }`}
                            >
                              {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Secure attachment preparation indicator */}
              {attachedFileUrl && (
                <div className="px-4 py-2 bg-blue-50 border-t border-slate-200 flex items-center justify-between text-xs text-blue-750">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" /> Attached: <strong>{attachedFileName}</strong> (Checked & Approved)
                  </span>
                  <button 
                    onClick={() => { setAttachedFileUrl(null); setAttachedFileName(null); }}
                    className="text-[10px] text-red-600 hover:text-red-700 font-semibold"
                  >
                    Cancel Attachment
                  </button>
                </div>
              )}

              {/* Message formulation form panel */}
              <form id="chat-send-form" onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center gap-2 bg-white">
                <button
                  id="chat-attach-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer bg-white"
                  title="Attach File (JPG, PNG, PDF, MP4)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelectChange}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4"
                />

                <input
                  id="chat-text-input"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Secure dialogue with ${selectedContact.name}...`}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50 text-slate-800 placeholder-slate-400"
                />
                
                <button
                  id="chat-send-submit-btn"
                  type="submit"
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/10 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 text-slate-400 bg-slate-50/20">
              <UserIcon className="w-12 h-12 mb-3 text-slate-350" />
              <h3 className="font-bold text-slate-700 text-sm">Select a Contact Channel</h3>
              <p className="text-xs mt-1 max-w-sm">Initiate private communication with coaches, talent scouts, and athletes securely.</p>
            </div>
          )}
        </div>
      </div>

      {/* REPORT SUBMISSION MODAL */}
      {showReportModal && selectedContact && (
        <div className="absolute inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full shadow-2xl relative">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Flag className="w-5 h-5 text-red-500" /> File Professional Security Report
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Your feedback is audited instantly. Report instances of harassment, scams, spamming, or inappropriate profiles.
            </p>

            <form onSubmit={handleReportUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reason for Report</label>
                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="spam">Spam or excessive automation</option>
                  <option value="harassment">Harassment or abusive speech</option>
                  <option value="impersonation">Impersonation / False athlete credentials</option>
                  <option value="phishing">Phishing / Suspicious links</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Detailed Information</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide logs or context to support this report..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  Submit Audit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISITING PROFILE MODAL */}
      {profileModalItem && (
        <div className="absolute inset-0 z-[1000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-150 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Reviewing {profileModalItem.user.role} Portfolio
                </span>
              </div>
              <button
                onClick={() => setProfileModalItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with custom scrolling */}
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin bg-slate-50/50">
              <ProfileCardView
                user={profileModalItem.user}
                profile={profileModalItem.profile}
                isSelf={profileModalItem.user.id === user.id}
                onSendMessage={() => setProfileModalItem(null)}
                onFollowToggle={async () => {
                  try {
                    const res = await fetch(`/api/profiles/${profileModalItem.user.id}/follow`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user.id }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setProfileModalItem(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          profile: {
                            ...prev.profile,
                            followers: data.followers
                          }
                        };
                      });
                      triggerAlert(
                        data.followers.includes(user.id)
                          ? `Now following ${profileModalItem.user.name}!`
                          : `Unfollowed ${profileModalItem.user.name}.`,
                        "success"
                      );
                    }
                  } catch (e) {
                    triggerAlert("Failed to complete follow action.", "error");
                  }
                }}
                isFollowing={profileModalItem.profile?.followers?.includes(user.id) || false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
