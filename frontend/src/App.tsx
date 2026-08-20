import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Network, Building2, Cpu, BrainCircuit, Fingerprint, 
  Archive, ShieldAlert, Activity, FileClock, Terminal, Settings, 
  Play, RefreshCw, AlertTriangle, CheckCircle2, Lock, 
  Server, TrendingUp, Check, ChevronRight, Search, ChevronDown,
  Bell, Shield, CreditCard, Smartphone, UserCheck
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ReferenceLine, ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';

// --- CONFIG & UTILS ---
const API_BASE = '/api';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('overview');
  
  // User Mode (Admin vs Bank User)
  const [userRole, setUserRole] = useState<'admin' | 'bank'>('admin');
  const [selectedBankId, setSelectedBankId] = useState<string>('bank_a');

  // Backend States
  const [fedStatus, setFedStatus] = useState<any>({ current_round: 28, global_model_version: 'v28', status: 'idle' });
  const [banks, setBanks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [fraudPatterns, setFraudPatterns] = useState<any[]>([]);
  const [modelVersions, setModelVersions] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any[]>([]);
  const [driftData, setDriftData] = useState<any>({ drift_score: 0.12, status: 'STABLE', threshold: 0.20 });

  // UI Local Loading & Input States
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');
  
  // Prediction Form State
  const [predInput, setPredInput] = useState({
    amount: 120.0,
    tx_type: 'card_payment',
    merchant_category: 'retail',
    device_age: 180.0,
    new_device: false,
    new_beneficiary: false,
    location_changed: false,
    transaction_velocity: 1.0,
    account_age: 450.0,
    previous_fraud_history: false,
    time_of_transaction: 12
  });
  const [predResult, setPredResult] = useState<any>(null);
  
  // Demo Mode Simulation State
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simActiveClient, setSimActiveClient] = useState<string | null>(null);

  // Security Toggles
  const [dpNoise, setDpNoise] = useState(0.005);
  const [dpEnabled, setDpEnabled] = useState(true);
  const [secAggEnabled, setSecAggEnabled] = useState(true);

  // API Explorer Active Endpoints
  const [apiTryResult, setApiTryResult] = useState<any>(null);
  const [activeApiCard, setActiveApiCard] = useState<string | null>(null);

  // Additional UI states for Redesign
  const [profileOpen, setProfileOpen] = useState(false);
  const [compareModelA, setCompareModelA] = useState<string>('v27');
  const [compareModelB, setCompareModelB] = useState<string>('v28');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [hoveredBankId, setHoveredBankId] = useState<string | null>(null);
  const [hoveredTrustBankId, setHoveredTrustBankId] = useState<string | null>(null);

  // References
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Fetch Data Function
  const fetchData = async () => {
    try {
      const [fedRes, banksRes, , versionsRes, alertsRes, logsRes, patternsRes, driftRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE}/federation/status`).then(r => r.json()),
        fetch(`${API_BASE}/banks`).then(r => r.json()),
        fetch(`${API_BASE}/rounds`).then(r => r.json()),
        fetch(`${API_BASE}/models/versions`).then(r => r.json()),
        fetch(`${API_BASE}/security/alerts`).then(r => r.json()),
        fetch(`${API_BASE}/audit-logs`).then(r => r.json()),
        fetch(`${API_BASE}/fraud/patterns`).then(r => r.json()),
        fetch(`${API_BASE}/drift`).then(r => r.json()),
        fetch(`${API_BASE}/monitoring/metrics`).then(r => r.json())
      ]);

      setFedStatus(fedRes);
      setBanks(banksRes);
      setModelVersions(versionsRes);
      setSecurityAlerts(alertsRes);
      setAuditLogs(logsRes);
      setFraudPatterns(patternsRes);
      setDriftData(driftRes);
      setSystemMetrics(metricsRes.reverse());
    } catch (e) {
      console.error("Failed fetching federated statistics", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll metrics and status
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simLogs]);

  // Model comparison trigger logic
  useEffect(() => {
    const modelA = modelVersions.find(v => v.version === compareModelA);
    const modelB = modelVersions.find(v => v.version === compareModelB);
    if (modelA && modelB) {
      setCompareResult({
        accuracyA: modelA.accuracy,
        accuracyB: modelB.accuracy,
        recallA: modelA.recall,
        recallB: modelB.recall,
        precisionA: modelA.precision,
        precisionB: modelB.precision,
        f1A: modelA.f1,
        f1B: modelB.f1
      });
    } else {
      setCompareResult({
        accuracyA: 0.962,
        accuracyB: 0.989,
        recallA: 0.917,
        recallB: 0.934,
        precisionA: 0.948,
        precisionB: 0.961,
        f1A: 0.934,
        f1B: 0.947
      });
    }
  }, [compareModelA, compareModelB, modelVersions]);

  // --- API HANDLERS ---
  
  // Trigger regular training round
  const handleStartRound = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/federation/start-round`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Training round ${data.round_number} completed. Global model accuracy: ${(data.metrics.accuracy * 100).toFixed(1)}%`);
        fetchData();
      } else {
        alert(`Error starting round: ${data.detail}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Rollback model version
  const handleRollback = async (version: string) => {
    if (!confirm(`Are you sure you want to rollback the active global model to version ${version}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/models/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.detail);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run Fraud Prediction Analysis
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predInput)
      });
      const data = await res.json();
      setPredResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Run Demo Mode Stream
  const runFullDemo = () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimStep(1);
    setSimLogs(["[SYSTEM] Federation simulation initiated.", "[SYSTEM] Initializing secure socket tunnels configuration..."]);
    setSimActiveClient(null);
    setActiveTab('training');

    const eventSource = new EventSource(`${API_BASE}/demo/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        setSimLogs(prev => [...prev, `[LOG] ${data.message}`]);
      }
      
      if (data.step) {
        setSimStep(data.step);
      }

      if (data.client) {
        setSimActiveClient(data.client);
      } else {
        setSimActiveClient(null);
      }

      if (data.status === 'complete' || data.status === 'failed') {
        eventSource.close();
        setSimRunning(false);
        setSimActiveClient(null);
        fetchData(); // reload updated states
        setSimLogs(prev => [...prev, "[SYSTEM] Simulation complete. Connections closed."]);
      }
    };

    eventSource.onerror = (e) => {
      console.error("SSE stream error", e);
      eventSource.close();
      setSimRunning(false);
      setSimActiveClient(null);
    };
  };

  // Helper Stats
  const activeModel = modelVersions.find(v => v.status === 'active') || modelVersions[0] || {};
  
  // Custom filter for logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.resource && log.resource.toLowerCase().includes(searchTerm.toLowerCase()));
    if (logFilter === 'ALL') return matchesSearch;
    if (logFilter === 'WARNING') return matchesSearch && log.status === 'WARNING';
    if (logFilter === 'SUCCESS') return matchesSearch && log.status === 'SUCCESS';
    if (logFilter === 'SECURITY') return matchesSearch && (log.status === 'WARNING' || log.event.includes('ANOMALY') || log.event.includes('REJECT'));
    if (logFilter === 'FEDERATION') return matchesSearch && (log.event.includes('ROUND') || log.event.includes('SYNC'));
    if (logFilter === 'MODEL') return matchesSearch && (log.event.includes('MODEL') || log.event.includes('ROLLBACK') || log.event.includes('PREDICTION'));
    if (logFilter === 'BANK') return matchesSearch && log.event.includes('BANK');
    return matchesSearch;
  });

  // KPI constants
  const accuracyVal = activeModel.accuracy ? `${(activeModel.accuracy * 100).toFixed(1)}%` : '98.9%';
  const precisionVal = activeModel.precision ? `${(activeModel.precision * 100).toFixed(1)}%` : '96.1%';
  const recallVal = activeModel.recall ? `${(activeModel.recall * 100).toFixed(1)}%` : '93.4%';

  // Realistic historical rounds data curve mapping a security drop/recovery story
  const performanceData = [
    { round_number: 10, global_accuracy: 0.85, global_precision: 0.82, global_recall: 0.79 },
    { round_number: 15, global_accuracy: 0.91, global_precision: 0.89, global_recall: 0.86 },
    { round_number: 20, global_accuracy: 0.94, global_precision: 0.92, global_recall: 0.89 },
    { round_number: 24, global_accuracy: 0.974, global_precision: 0.952, global_recall: 0.918 },
    { round_number: 25, global_accuracy: 0.978, global_precision: 0.958, global_recall: 0.925 },
    { round_number: 26, global_accuracy: 0.807, global_precision: 0.821, global_recall: 0.764, event: "⚠ Suspicious update" },
    { round_number: 27, global_accuracy: 0.965, global_precision: 0.949, global_recall: 0.912, event: "Update quarantined" },
    { round_number: 28, global_accuracy: 0.989, global_precision: 0.961, global_recall: 0.934, event: "Model recovered" }
  ];

  // Restrained chart lines mapping
  const chartLines = [
    { key: 'global_accuracy', color: '#2457D6', name: 'Accuracy' }, 
    { key: 'global_precision', color: '#7357D9', name: 'Precision' }, 
    { key: 'global_recall', color: '#159A68', name: 'Recall' } 
  ];

  // Custom Tooltip showing details + story events
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#D9E2EE] rounded-xl p-4 shadow-md font-sans text-xs">
          <div className="font-bold text-[#14213D] mb-1.5 font-sans">Round {label}</div>
          <div className="space-y-1 font-sans">
            {payload.map((pld: any) => (
              <div key={pld.dataKey} className="flex justify-between gap-6">
                <span className="flex items-center gap-1.5 text-[#607089]"><span className="h-2 w-2 rounded-full block" style={{ backgroundColor: pld.color }} />{pld.name}:</span>
                <span className="font-bold text-[#14213D] font-mono">{(pld.value * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
          {data.event && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 text-brandRed font-bold flex items-center gap-1 font-sans">
              <AlertTriangle className="h-3.5 w-3.5 text-brandRed shrink-0" />
              {data.event}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Navigation Sidebar items
  const navGroups = [
    {
      title: 'Operations',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'federation', label: 'Federation', icon: Network },
        { id: 'training', label: 'Training', icon: Cpu },
        { id: 'banks', label: 'Banks', icon: Building2 },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'intelligence', label: 'Fraud Intelligence', icon: BrainCircuit },
        { id: 'predictions', label: 'Predictions', icon: Fingerprint },
      ]
    },
    {
      title: 'Models',
      items: [
        { id: 'registry', label: 'Model Registry', icon: Archive },
      ]
    },
    {
      title: 'Security',
      items: [
        { id: 'security', label: 'Security', icon: ShieldAlert },
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
        { id: 'audit', label: 'Audit Logs', icon: FileClock },
      ]
    },
    {
      title: 'Developer',
      items: [
        { id: 'api', label: 'API Explorer', icon: Terminal },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  // Simplified Activity feed list showing less text
  const activityEvents = [
    { id: 1, type: 'SECURITY', title: 'MODEL POISONING ATTEMPT', actor: 'Bank F', status: 'BLOCKED', time: '6 min ago', desc: 'Deviation: 8.7σ' },
    { id: 2, type: 'WARNING', title: 'MODEL DRIFT DETECTED', actor: 'Global Model', status: 'ACTION REQUIRED', time: '18 min ago', desc: 'Drift index: 0.12' },
    { id: 3, type: 'SUCCESS', title: 'CONVERGENCE COMPLETED', actor: 'Aggregator', status: 'SUCCESS', time: '42 min ago', desc: 'Gradients successfully aggregated' },
    { id: 4, type: 'BANK', title: 'CLIENT REGISTRATION', actor: 'Bank E', status: 'CONNECTED', time: '1 hour ago', desc: 'Keys exchange complete' },
    { id: 5, type: 'SYSTEM', title: 'MODEL VERSION DEPLOYED', actor: 'Aggregator', status: 'COMPLETED', time: '2 hours ago', desc: 'Model updated to v28' },
  ];

  return (
    <div className="flex h-screen bg-bgLight text-textDark overflow-hidden font-sans text-sm select-none">
      
      {/* --- DEEP NAVY SIDEBAR --- */}
      <aside className="w-56 bg-[#0F2342] flex flex-col shrink-0">
        
        {/* LOGO */}
        <div className="h-16 px-6 border-b border-[#1A345C] flex items-center gap-3">
          <div className="h-8 w-8 bg-[#2457D6] rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-wider text-white font-sans uppercase">
              Intella
            </h1>
            <p className="text-[10px] tracking-widest text-[#90A3BF] font-extrabold uppercase font-sans">
              Security Ops Center
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <span className="text-[11px] font-bold text-[#5D7290] uppercase tracking-wider px-3 block font-sans">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full px-3 py-2.5 rounded-lg text-[14px] font-semibold flex items-center gap-3.5 transition-all relative cursor-pointer ${
                        active 
                          ? 'bg-[#2457D6] text-white shadow-sm' 
                          : 'text-[#90A3BF] hover:text-white hover:bg-[#18315B]'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* SIMULATION TRIGGER BUTTON */}
        <div className="p-4 border-t border-[#1A345C] bg-[#0A1A33]">
          <button
            onClick={runFullDemo}
            disabled={simRunning}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold font-sans border flex items-center justify-center gap-2 transition-all ${
              simRunning 
                ? 'bg-blue-950 border-brandBlue/35 text-white animate-pulse cursor-not-allowed font-semibold' 
                : 'bg-transparent hover:bg-[#18315B] border-slate-700 text-[#90A3BF] hover:text-white shadow-sm cursor-pointer'
            }`}
          >
            <Play className={`h-3.5 w-3.5 ${simRunning ? 'animate-spin' : ''}`} />
            {simRunning ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </div>

      </aside>

      {/* --- MAIN PAGE AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* --- TOP HEADER --- */}
        <header className="h-16 border-b border-borderLight bg-white px-8 flex items-center justify-between shrink-0">
          
          {/* Left/Center: Operational Metadata */}
          <div className="flex items-center gap-5 text-[13px] text-textMuted font-sans">
            <div className="flex items-center gap-1.5 font-sans">
              <span>Federation:</span>
              <span className="text-textDark font-bold font-mono">GLOBAL_FRAUD_DB_V1</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 font-sans">
              <span>Global Model:</span>
              <span className="text-brandBlue font-bold font-mono">{fedStatus.global_model_version || 'v28'}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 font-sans">
              <span>Status:</span>
              <span className="h-2 w-2 rounded-full bg-brandGreen block animate-pulse" />
              <span className="text-brandGreen font-bold uppercase font-sans text-xs">● Operational</span>
              <span className="text-[11px] text-[#607089] font-sans font-semibold">(6/6 nodes online)</span>
            </div>
          </div>

          {/* Right: Environment & Administrator Profile */}
          <div className="flex items-center gap-5">
            
            <div className="px-2.5 py-1 bg-amber-50 border border-brandOrange/25 text-[#D99520] rounded text-xs font-mono font-bold tracking-wider uppercase select-none">
              ● Simulation
            </div>

            <button className="h-8 w-8 rounded-full bg-slate-50 border border-borderLight flex items-center justify-center text-textMuted hover:text-textDark relative transition-all cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brandRed" />
            </button>

            <div className="h-4 w-px bg-slate-200" />

            {/* User Profile Avatar with dropdown selector */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 rounded-lg transition-all text-left cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-brandNavy text-white text-xs font-bold flex items-center justify-center">
                  AD
                </div>
                <div className="text-left leading-none hidden md:block">
                  <div className="text-xs font-bold text-textDark font-sans">Administrator</div>
                  <div className="text-[11px] text-textMuted font-sans mt-0.5 uppercase">Super Admin</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-borderLight rounded-lg shadow-lg py-1.5 z-50 font-sans">
                  <div className="px-4 py-2 border-b border-borderLight mb-1.5">
                    <p className="text-[9px] text-[#607089] font-bold uppercase tracking-wider font-sans">Portal Access</p>
                    <button 
                      onClick={() => {
                        setUserRole(userRole === 'admin' ? 'bank' : 'admin');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left py-1 text-xs font-bold text-brandBlue hover:underline mt-1 block"
                    >
                      Switch to {userRole === 'admin' ? 'Bank Portal' : 'Administrator'}
                    </button>
                  </div>
                  <button onClick={() => setProfileOpen(false)} className="w-full text-left px-4 py-1.5 text-xs text-textDark hover:bg-slate-50 font-medium">Profile</button>
                  <button onClick={() => setProfileOpen(false)} className="w-full text-left px-4 py-1.5 text-xs text-textDark hover:bg-slate-50 font-medium">Preferences</button>
                  <button onClick={() => setProfileOpen(false)} className="w-full text-left px-4 py-1.5 text-xs text-brandRed hover:bg-slate-50 font-medium border-t border-slate-100 mt-1">Sign Out</button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* --- PAGE CONTENTS --- */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-bgLight">
          
          {/* ========================================================================= */}
          {/* OVERVIEW TAB */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Title Greeting Area with larger fonts */}
              <div className="flex justify-between items-center bg-transparent">
                <div className="space-y-1">
                  <h2 className="text-[32px] font-bold font-sans text-[#14213D] tracking-tight leading-tight">
                    Hello, Administrator 👋
                  </h2>
                  <p className="text-[#607089] text-[15px] font-medium font-sans">
                    Global Fraud Federation · Model {fedStatus.global_model_version || 'v28'} · Round {fedStatus.current_round || 28}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('federation')}
                    className="h-[46px] px-5 border border-brandBlue hover:bg-[#F3F7FF] text-brandBlue font-sans text-[15px] font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Network className="h-4.5 w-4.5" />
                    VIEW FEDERATION
                  </button>
                  {userRole === 'admin' && (
                    <button
                      onClick={handleStartRound}
                      disabled={loading || simRunning}
                      className="h-[46px] px-6 bg-brandBlue hover:bg-[#173A91] disabled:bg-slate-200 disabled:text-slate-400 text-white font-sans text-[15px] font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
                      START TRAINING ROUND
                    </button>
                  )}
                </div>
              </div>

              {/* 3x2 Grid of 6 KPI Cards with large values & semantic colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* CARD 1: PARTICIPATING BANKS */}
                <div 
                  onClick={() => setActiveTab('banks')}
                  className="group kpi-card kpi-card-blue p-6 flex flex-col justify-between cursor-pointer border-t-[3px] border-t-brandBlue border border-borderLight bg-white shadow-[0_2px_8px_rgba(20,40,80,0.03)]"
                >
                  <div className="flex items-center justify-between text-textMuted">
                    <span className="text-[13px] font-bold tracking-wider uppercase font-sans text-[#607089]">Participating Banks</span>
                    <div className="h-9 w-9 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0">
                      <Building2 className="h-5 w-5 text-brandBlue" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[36px] font-bold font-sans tracking-tight text-[#14213D]">
                      {banks.length || 6}
                    </h3>
                    <div className="flex items-center justify-between mt-2.5 pt-3.5 border-t border-slate-100 text-[13px] text-[#607089] font-sans">
                      <span className="text-[#159A68] font-bold">● 6/6 online & active</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brandBlue font-semibold flex items-center gap-0.5">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: TRAINING ROUND */}
                <div 
                  onClick={() => setActiveTab('training')}
                  className="group kpi-card kpi-card-violet p-6 flex flex-col justify-between cursor-pointer border-t-[3px] border-t-brandViolet border border-borderLight bg-white shadow-[0_2px_8px_rgba(20,40,80,0.03)]"
                >
                  <div className="flex items-center justify-between text-textMuted">
                    <span className="text-[13px] font-bold tracking-wider uppercase font-sans text-[#607089]">Training Round</span>
                    <div className="h-9 w-9 rounded-lg bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors shrink-0">
                      <Cpu className="h-5 w-5 text-brandViolet" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[36px] font-bold font-sans tracking-tight text-[#14213D]">
                      Round {fedStatus.current_round || 28}
                    </h3>
                    <div className="flex items-center justify-between mt-2.5 pt-3.5 border-t border-slate-100 text-[13px] text-[#607089] font-sans">
                      <span className="text-brandViolet font-bold">FedAvg · Active</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brandViolet font-semibold flex items-center gap-0.5">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: GLOBAL ACCURACY */}
                <div 
                  onClick={() => setActiveTab('registry')}
                  className="group kpi-card kpi-card-green p-6 flex flex-col justify-between cursor-pointer border-t-[3px] border-t-brandGreen border border-borderLight bg-white shadow-[0_2px_8px_rgba(20,40,80,0.03)]"
                >
                  <div className="flex items-center justify-between text-textMuted">
                    <span className="text-[13px] font-bold tracking-wider uppercase font-sans text-[#607089]">Global Accuracy</span>
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors shrink-0">
                      <TrendingUp className="h-5 w-5 text-brandGreen" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[36px] font-bold font-sans tracking-tight text-[#14213D]">
                      {accuracyVal}
                    </h3>
                    <div className="flex items-center justify-between mt-2.5 pt-3.5 border-t border-slate-100 text-[13px] text-[#607089] font-sans">
                      <span className="text-[#159A68] font-bold flex items-center gap-0.5">↑ 1.9% vs v27</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brandGreen font-semibold flex items-center gap-0.5">
                        View details (P: {precisionVal}) →
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 4: DETECTION RECALL */}
                <div 
                  onClick={() => setActiveTab('registry')}
                  className="group kpi-card kpi-card-blue p-6 flex flex-col justify-between cursor-pointer border-t-[3px] border-t-brandBlue border border-borderLight bg-white shadow-[0_2px_8px_rgba(20,40,80,0.03)]"
                >
                  <div className="flex items-center justify-between text-textMuted">
                    <span className="text-[13px] font-bold tracking-wider uppercase font-sans text-[#607089]">Detection Recall</span>
                    <div className="h-9 w-9 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0">
                      <BrainCircuit className="h-5 w-5 text-brandBlue" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[36px] font-bold font-sans tracking-tight text-[#14213D]">
                      {recallVal}
                    </h3>
                    <div className="flex items-center justify-between mt-2.5 pt-3.5 border-t border-slate-100 text-[13px] text-[#607089] font-sans">
                      <span className="text-brandViolet font-bold">Collaborative gain: +3.6 pts</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brandBlue font-semibold flex items-center gap-0.5">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 5: FRAUD CASES */}
                <div 
                  onClick={() => setActiveTab('intelligence')}
                  className="group kpi-card kpi-card-amber p-6 flex flex-col justify-between cursor-pointer border-t-[3px] border-t-brandOrange border border-borderLight bg-white shadow-[0_2px_8px_rgba(20,40,80,0.03)]"
                >
                  <div className="flex items-center justify-between text-textMuted">
                    <span className="text-[13px] font-bold tracking-wider uppercase font-sans text-[#607089]">Fraud Cases Detected</span>
                    <div className="h-9 w-9 rounded-lg bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors shrink-0">
                      <AlertTriangle className="h-5 w-5 text-brandOrange" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[36px] font-bold font-sans tracking-tight text-[#14213D]">
                      12,483
                    </h3>
                    <div className="flex items-center justify-between mt-2.5 pt-3.5 border-t border-slate-100 text-[13px] text-[#607089] font-sans">
                      <span>12,483 flagged · last 30 days</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brandOrange font-semibold flex items-center gap-0.5">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 6: BLOCKED UPDATES */}
                <div 
                  onClick={() => setActiveTab('security')}
                  className="group kpi-card kpi-card-red p-6 flex flex-col justify-between cursor-pointer border-t-[3px] border-t-brandRed border border-borderLight bg-white shadow-[0_2px_8px_rgba(20,40,80,0.03)]"
                >
                  <div className="flex items-center justify-between text-textMuted">
                    <span className="text-[13px] font-bold tracking-wider uppercase font-sans text-[#607089]">Blocked Updates</span>
                    <div className="h-9 w-9 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors shrink-0">
                      <ShieldAlert className="h-5 w-5 text-brandRed" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[36px] font-bold font-sans tracking-tight text-[#14213D]">
                      {simRunning && simStep >= 4 ? '6' : '5'}
                    </h3>
                    <div className="flex items-center justify-between mt-2.5 pt-3.5 border-t border-slate-100 text-[13px] text-[#607089] font-sans">
                      <span className="text-brandRed font-bold">1 active warning</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brandRed font-semibold flex items-center gap-0.5">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Side-by-side Chart + Activity Feed Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Large Training History Chart (Left) */}
                <div className="glass-panel lg:col-span-2 p-8 flex flex-col h-[520px] bg-white">
                  <div className="border-b border-slate-100 pb-4 mb-6">
                    <h3 className="text-[18px] font-bold font-sans text-textDark uppercase tracking-wide">
                      Model performance across federation rounds
                    </h3>
                  </div>
                  
                  {/* Line Chart */}
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid stroke="#EFF6FF" strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="round_number" 
                          stroke="#94A3B8" 
                          fontSize={12} 
                          tickLine={false} 
                          label={{ value: 'Aggregation Rounds', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#607089', fontFamily: 'Inter' }} 
                        />
                        <YAxis 
                          stroke="#94A3B8" 
                          fontSize={12} 
                          tickLine={false} 
                          domain={[0.7, 1.0]} 
                          tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '13px', fontFamily: 'Inter', color: '#14213D' }} />
                        
                        {/* Highlight current round with vertical reference line */}
                        <ReferenceLine x={28} stroke="#2457D6" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: 'Round 28 Active', position: 'top', fill: '#2457D6', fontSize: 10, fontFamily: 'Inter', fontWeight: 'bold' }} />

                        {chartLines.map((line) => (
                          <Line 
                            key={line.key}
                            type="monotone" 
                            dataKey={line.key} 
                            stroke={line.color} 
                            strokeWidth={2} 
                            activeDot={{ r: 5 }} 
                            name={line.name} 
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Visual narrative timelines annotation under the chart */}
                  <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 text-xs text-textMuted font-sans gap-4">
                    <div className="leading-relaxed">
                      Round 26: <span className="font-bold text-brandRed block mt-0.5">⚠ Suspicious client update</span>
                    </div>
                    <div className="leading-relaxed">
                      Round 27: <span className="font-bold text-brandOrange block mt-0.5">Update quarantined</span>
                    </div>
                    <div className="leading-relaxed">
                      Round 28: <span className="font-bold text-brandGreen block mt-0.5">Model recovered</span>
                    </div>
                  </div>
                </div>

                {/* Activity Feed (Right) */}
                <div className="glass-panel p-8 flex flex-col h-[520px] bg-white">
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-[18px] font-bold font-sans text-textDark uppercase tracking-wide">
                      Federation Activity Feed
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {activityEvents.map((evt) => {
                      let Icon = Cpu;
                      let iconColorClass = "bg-blue-50 text-brandBlue";
                      if (evt.type === 'SECURITY' || evt.type === 'BLOCKED') {
                        Icon = ShieldAlert;
                        iconColorClass = "bg-red-50 text-brandRed";
                      } else if (evt.type === 'WARNING') {
                        Icon = AlertTriangle;
                        iconColorClass = "bg-amber-50 text-[#D99520]";
                      } else if (evt.type === 'SUCCESS') {
                        Icon = CheckCircle2;
                        iconColorClass = "bg-emerald-50 text-brandGreen";
                      } else if (evt.type === 'BANK') {
                        Icon = Building2;
                        iconColorClass = "bg-blue-50 text-[#2457D6]";
                      }

                      return (
                        <div 
                          key={evt.id} 
                          className="group border border-borderLight rounded-lg p-3.5 bg-white hover:bg-[#F3F7FF] transition-all duration-150 flex items-start gap-3 relative cursor-pointer"
                        >
                          <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center transition-colors ${iconColorClass}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          
                          <div className="flex-1 font-sans text-[13px] space-y-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <span className="font-bold text-textDark text-[14px]">{evt.title}</span>
                              <span className="text-[12px] text-textSubtle shrink-0 font-mono">{evt.time}</span>
                            </div>
                            
                            {/* Succinct text logs layout */}
                            <div className="flex justify-between items-center text-xs text-textMuted pt-1.5 font-sans">
                              <span>Actor: {evt.actor}</span>
                              <span>{evt.desc}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-[11px] font-sans pt-2 border-t border-slate-50 mt-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                evt.status === 'BLOCKED' || evt.status === 'ACTION REQUIRED' ? 'bg-red-50 text-brandRed' : 'bg-green-50 text-brandGreen'
                              }`}>
                                {evt.status}
                              </span>
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2457D6] font-semibold">
                                View details →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Participating Banks Table (Bottom) */}
              <div className="glass-panel p-8 bg-white">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-[18px] font-bold font-sans text-textDark uppercase tracking-wide">Participating Network Nodes</h3>
                    <p className="text-[#607089] text-[13px] font-sans mt-0.5">Active institutional nodes with local accuracy and trust indexes.</p>
                  </div>
                  <button onClick={() => setActiveTab('banks')} className="text-xs font-semibold text-[#2457D6] hover:underline font-sans cursor-pointer">
                    Manage Nodes
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[#607089] uppercase text-[12px] font-bold">
                        <th className="pb-3 pl-4 font-bold">Bank Name</th>
                        <th className="pb-3 font-bold">Node Address</th>
                        <th className="pb-3 font-bold">Connection</th>
                        <th className="pb-3 font-bold">Trust Index</th>
                        <th className="pb-3 font-bold">Local Accuracy</th>
                        <th className="pb-3 font-bold">Transactions</th>
                        <th className="pb-3 font-bold text-right">Aggregated Contribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[14px]">
                      {banks.map((bank, index) => {
                        const isF = bank.id === 'bank_f';
                        const isQuarantined = isF && simStep >= 4;

                        // Trust index score calculation
                        const trustScoreVal = isQuarantined ? 10 : (bank.trust_score * 100 || 98);
                        
                        let trustColor = "bg-brandGreen";
                        let trustText = "text-brandGreen";
                        if (trustScoreVal < 60) {
                          trustColor = "bg-brandRed";
                          trustText = "text-brandRed";
                        } else if (trustScoreVal < 90) {
                          trustColor = "bg-brandOrange";
                          trustText = "text-brandOrange";
                        }

                        return (
                          <tr 
                            key={index} 
                            className="group hover:bg-[#F3F7FF] transition-all duration-150 cursor-pointer h-[52px]"
                            onClick={() => { setSelectedBankId(bank.id); setActiveTab('banks'); }}
                          >
                            {/* Blue 3px indicator first cell */}
                            <td className="py-3 pl-4 border-l-[3px] border-transparent group-hover:border-brandBlue transition-all flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded bg-slate-50 border border-slate-100 group-hover:bg-[#EFF6FF] group-hover:border-blue-100 flex items-center justify-center transition-colors shrink-0">
                                <Building2 className="h-4.5 w-4.5 text-slate-400 group-hover:text-brandBlue" />
                              </div>
                              <span className="font-semibold text-textDark text-[14px]">{bank.name}</span>
                            </td>
                            
                            <td className="py-3 font-mono text-[12px] text-textMuted">
                              {bank.id.toUpperCase()}_NODE_IP
                            </td>
                            
                            <td className="py-3 font-sans text-xs">
                              {isQuarantined ? (
                                <span className="text-brandRed font-bold flex items-center gap-1.5">● BLOCKED</span>
                              ) : (
                                <span className="text-brandGreen font-bold flex items-center gap-1.5">● CONNECTED</span>
                              )}
                            </td>
                            
                            {/* Hoverable Trust cells detailing reasons */}
                            <td 
                              className="py-3 relative"
                              onMouseEnter={() => setHoveredTrustBankId(bank.id)}
                              onMouseLeave={() => setHoveredTrustBankId(null)}
                            >
                              <div className="space-y-1 w-28 cursor-help">
                                <div className="flex justify-between text-[11px] font-sans">
                                  <span className={`font-bold ${trustText}`}>{trustScoreVal}% {isQuarantined ? 'QUARANTINED' : ''}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${trustColor}`} 
                                    style={{ width: `${trustScoreVal}%` }}
                                  />
                                </div>
                              </div>
                              
                              {hoveredTrustBankId === bank.id && (
                                <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-borderLight rounded-lg shadow-lg p-3.5 z-30 font-sans text-[11px] text-textMuted leading-relaxed">
                                  {isQuarantined ? (
                                    <div className="space-y-1 font-sans">
                                      <span className="font-bold text-brandRed block font-sans">Trust Score: 10%</span>
                                      <p className="font-sans font-bold text-textDark">Deductions Audit Reasons:</p>
                                      <p className="font-sans">• Anomalous weight updates deviation (8.7σ)</p>
                                      <p className="font-sans">• Model divergence checks rejected</p>
                                      <p className="font-sans">• Security policy outliers quarantine validation</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 font-sans">
                                      <span className="font-bold text-brandGreen block font-sans">Trust Score: {trustScoreVal.toFixed(0)}%</span>
                                      <p className="font-sans font-bold text-textDark">Trust Indicators:</p>
                                      <p className="font-sans">• Consistently aligned weight updates</p>
                                      <p className="font-sans">• Centroid deviation verification accepted</p>
                                      <p className="font-sans">• Active contribution validation loops pass</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-3 text-textDark font-semibold">
                              {(bank.local_accuracy * 100 || 94.2).toFixed(1)}%
                            </td>

                            <td className="py-3 text-textMuted font-mono">
                              {bank.total_transactions?.toLocaleString() || '120,400'}
                            </td>

                            <td className="py-3 text-right pr-4">
                              {isQuarantined ? (
                                <span className="px-2.5 py-0.5 border border-brandRed/20 bg-red-50 text-brandRed text-[10px] font-sans font-bold uppercase rounded-lg">
                                  EXCLUDED
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 border border-brandGreen/25 bg-green-50 text-brandGreen text-[10px] font-sans font-bold uppercase rounded-lg">
                                  CONTRIBUTING
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* FEDERATION TAB */}
          {/* ========================================================================= */}
          {activeTab === 'federation' && (
            <div className="space-y-8">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">Federation Topology</h2>
                <p className="text-[#607089] text-[15px] mt-0.5 font-sans">Structural design of privacy-preserving decentralized model routing.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* SVG diagram representation */}
                <div className="lg:col-span-2 glass-panel p-8 flex flex-col justify-center items-center h-[520px] bg-white relative">
                  
                  <div className="absolute top-6 left-6 font-sans text-[11px] text-[#607089] space-y-1.5 bg-[#F8FAFC] p-4 rounded-lg border border-borderLight shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2457D6] block animate-pulse" />
                      <span>Encrypted client local weights submission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brandGreen block" />
                      <span>Online Active Nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brandRed block animate-pulse" />
                      <span>Quarantined Outlier Nodes</span>
                    </div>
                  </div>

                  {hoveredBankId && (
                    <div className="absolute top-6 right-6 w-60 bg-white border border-borderLight rounded-xl shadow-lg p-4 z-20 font-sans text-xs transition-all">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span className="font-bold text-textDark">{banks.find(b => b.id === hoveredBankId)?.name || hoveredBankId}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-sans ${
                          hoveredBankId === 'bank_f' && simStep >= 4 ? 'bg-red-50 text-brandRed border border-brandRed/20' : 'bg-emerald-50 text-brandGreen border border-brandGreen/20'
                        }`}>
                          {hoveredBankId === 'bank_f' && simStep >= 4 ? 'QUARANTINED' : 'HEALTHY'}
                        </span>
                      </div>
                      <div className="space-y-1 text-[#607089] font-sans">
                        <div className="flex justify-between">
                          <span>Local Model:</span>
                          <span className="font-mono text-textDark font-semibold">v28</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trust Score:</span>
                          <span className="font-mono font-semibold text-textDark">
                            {hoveredBankId === 'bank_f' && simStep >= 4 ? '10%' : `${(banks.find(b => b.id === hoveredBankId)?.trust_score * 100 || 98).toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sync Latency:</span>
                          <span className="text-textDark font-semibold font-sans">18 ms</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <svg viewBox="0 0 600 360" className="w-full max-w-[500px] h-auto">
                    {[
                      { id: 'bank_a', x: 100, y: 70, isF: false },
                      { id: 'bank_b', x: 100, y: 180, isF: false },
                      { id: 'bank_c', x: 100, y: 290, isF: false },
                      { id: 'bank_d', x: 500, y: 70, isF: false },
                      { id: 'bank_e', x: 500, y: 180, isF: false },
                      { id: 'bank_f', x: 500, y: 290, isF: true },
                    ].map((node, i) => {
                      const isLeft = node.x < 300;
                      const isQuarantined = node.isF && simStep >= 4;
                      return (
                        <g key={i}>
                          <path
                            d={`M ${node.x} ${node.y} Q ${isLeft ? (node.x + 80) : (node.x - 80)} ${(node.y + 180)/2} 300 180`}
                            fill="none"
                            stroke={isQuarantined ? '#D94A4A' : '#94A3B8'}
                            strokeWidth={isQuarantined ? 2 : 1}
                            style={{ 
                              strokeDasharray: '6, 4'
                            }}
                          />
                        </g>
                      );
                    })}

                    {/* Dotted flows */}
                    {simRunning && simStep === 3 && [
                      { path: 'M 100 70 Q 180 125 300 180', dur: '1.2s' },
                      { path: 'M 100 180 Q 180 180 300 180', dur: '1.0s' },
                      { path: 'M 100 290 Q 180 235 300 180', dur: '1.4s' },
                      { path: 'M 500 70 Q 420 125 300 180', dur: '1.1s' },
                      { path: 'M 500 180 Q 420 180 300 180', dur: '0.9s' },
                      { path: 'M 500 290 Q 420 235 300 180', dur: '1.3s' },
                    ].map((particle, idx) => (
                      <circle key={idx} cx="0" cy="0" r="3" fill="#2457D6">
                        <animateMotion 
                          path={particle.path} 
                          begin="0s" 
                          dur={particle.dur} 
                          repeatCount="indefinite" 
                        />
                      </circle>
                    ))}

                    {/* Locks midpoints */}
                    {[
                      { id: 'bank_a', x: 200, y: 125 },
                      { id: 'bank_b', x: 200, y: 180 },
                      { id: 'bank_c', x: 200, y: 235 },
                      { id: 'bank_d', x: 400, y: 125 },
                      { id: 'bank_e', x: 400, y: 180 },
                      { id: 'bank_f', x: 400, y: 235 },
                    ].map((lock, i) => (
                      <foreignObject key={i} x={lock.x - 7} y={lock.y - 7} width="14" height="14">
                        <div className="h-full w-full bg-white border border-borderLight rounded-full flex items-center justify-center text-textMuted shadow-sm select-none">
                          <Lock className="h-2.5 w-2.5 text-slate-400" />
                        </div>
                      </foreignObject>
                    ))}

                    <circle cx="300" cy="180" r="36" fill="#FFFFFF" stroke="#173A91" strokeWidth={2.5} className="shadow-sm" />
                    <foreignObject x="275" y="155" width="50" height="50">
                      <div className="h-full w-full flex flex-col items-center justify-center text-brandNavy leading-none">
                        <Server className="h-5.5 w-5.5" />
                        <span className="text-[7.5px] font-sans font-bold tracking-widest text-center mt-1">AGGREGATOR</span>
                      </div>
                    </foreignObject>

                    {[
                      { id: 'bank_a', x: 100, y: 70, name: 'Bank A', desc: 'Retail CNP' },
                      { id: 'bank_b', x: 100, y: 180, name: 'Bank B', desc: 'UPI Instant' },
                      { id: 'bank_c', x: 100, y: 290, name: 'Bank C', desc: 'Commercial' },
                      { id: 'bank_d', x: 500, y: 70, name: 'Bank D', desc: 'Delta Wealth' },
                      { id: 'bank_e', x: 500, y: 180, name: 'Bank E', desc: 'Elysian Pay' },
                      { id: 'bank_f', x: 500, y: 290, name: 'Bank F', desc: 'Offshore', isF: true },
                    ].map((node, i) => {
                      const isQuarantined = node.isF && simStep >= 4;
                      return (
                        <g 
                          key={i} 
                          className="cursor-pointer" 
                          onClick={() => { setSelectedBankId(node.id); setActiveTab('banks'); }}
                          onMouseEnter={() => setHoveredBankId(node.id)}
                          onMouseLeave={() => setHoveredBankId(null)}
                        >
                          <circle cx={node.x} cy={node.y} r="25" fill="#FFFFFF" stroke={isQuarantined ? '#D94A4A' : '#D9E2EE'} strokeWidth={2} />
                          <foreignObject x={node.x - 18} y={node.y - 18} width="36" height="36">
                            <div className="h-full w-full flex flex-col items-center justify-center">
                              <Building2 className={`h-4.5 w-4.5 ${isQuarantined ? 'text-brandRed' : 'text-slate-500'}`} />
                            </div>
                          </foreignObject>
                          <text x={node.x} y={node.y + 38} textAnchor="middle" fill="#607089" fontSize="9" fontWeight="600" className="font-sans">{node.desc}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Topology Sidebar */}
                <div className="glass-panel p-8 flex flex-col justify-between bg-white">
                  <div className="space-y-6 font-sans">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-bold font-sans text-textDark uppercase tracking-wider">Network Nodes Integrity</h3>
                      <p className="text-[#607089] text-xs mt-0.5 font-sans">Distributed security layer parameters.</p>
                    </div>

                    <div className="space-y-4 font-sans text-xs leading-relaxed text-[#607089]">
                      <div className="p-4 bg-[#F8FAFC] border border-slate-100 rounded-lg">
                        <span className="font-bold text-textDark block font-sans mb-1 uppercase tracking-wide text-[9px] text-[#2457D6]">Non-IID Distribution</span>
                        <span>Fraud patterns vary between nodes depending on client demographic features. Local nodes isolate unique models locally before updates.</span>
                      </div>
                      
                      <div className="p-4 bg-[#F8FAFC] border border-slate-100 rounded-lg">
                        <span className="font-bold text-textDark block font-sans mb-1 uppercase tracking-wide text-[9px] text-[#2457D6]">Homomorphic Signatures</span>
                        <span>Cryptographic security guarantees that gradients cannot be intercepted to reconstruct private transaction details during routing.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-brandOrange/25 text-[#D99520] rounded-lg text-xs leading-normal font-sans">
                    <strong>Interactive Node:</strong> Select any institution node in the diagram to inspect local aggregated parameters and deviation audits.
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* BANKS DETAILS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'banks' && (() => {
            const activeBank = banks.find(b => b.id === selectedBankId) || banks[0] || {};
            const isF = activeBank.id === 'bank_f';
            const isQuarantined = isF && simStep >= 4;

            return (
              <div className="space-y-8">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">{activeBank.name} Details</h2>
                    <p className="text-[#607089] text-sm mt-0.5 font-sans">Isolated node validation details & training updates history.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 select-none font-sans">
                    {banks.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBankId(b.id)}
                        className={`px-3 py-1.5 border text-xs font-mono rounded-lg transition-all font-semibold cursor-pointer ${
                          selectedBankId === b.id 
                            ? 'bg-[#EFF6FF] border-brandBlue text-brandBlue shadow-sm font-bold' 
                            : 'bg-white border-borderLight text-textMuted hover:text-textDark'
                        }`}
                      >
                        {b.id.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Node Metadata */}
                  <div className="glass-panel p-8 space-y-6 bg-white font-sans">
                    <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase">
                      Node Overview
                    </h3>

                    <div className="space-y-3 font-sans text-xs">
                      {[
                        { label: 'NODE ID', value: activeBank.id?.toUpperCase(), isMono: true },
                        { label: 'STATUS', value: isQuarantined ? 'QUARANTINED' : 'ONLINE', color: isQuarantined ? 'text-brandRed' : 'text-brandGreen' },
                        { label: 'TRUST SCORE', value: isQuarantined ? '10%' : `${((activeBank.trust_score || 0.98) * 100).toFixed(0)}%`, isMono: true },
                        { label: 'LAST INTEGRATION', value: activeBank.last_sync ? new Date(activeBank.last_sync).toLocaleTimeString() : 'N/A', isMono: true },
                        { label: 'MODEL DEPLOYMENT', value: fedStatus.global_model_version || 'v28', isMono: true },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between border-b border-slate-50 pb-2.5 font-sans">
                          <span className="text-textMuted">{item.label}</span>
                          <span className={`font-semibold ${item.isMono ? 'font-mono' : ''} ${item.color || 'text-textDark'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-emerald-50/20 border border-brandGreen/25 rounded-lg flex items-start gap-3">
                      <Lock className="h-4.5 w-4.5 text-brandGreen shrink-0 mt-0.5" />
                      <div className="text-xs font-sans text-brandGreen">
                        <span className="font-bold block">Privacy Protection Enabled</span>
                        <span>Raw database logs remain fully isolated behind local node boundaries. Only gradients are shared.</span>
                      </div>
                    </div>
                  </div>

                  {/* Private Local Data Statistics */}
                  <div className="glass-panel p-8 space-y-6 bg-white font-sans">
                    <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase">
                      Local Aggregated Statistics
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Total Volume', value: activeBank.total_transactions?.toLocaleString(), sub: 'Transactions' },
                        { label: 'Fraud Incidents', value: activeBank.fraud_cases?.toLocaleString(), sub: 'Cases flagged' },
                        { label: 'Fraud Density', value: activeBank.total_transactions ? `${((activeBank.fraud_cases / activeBank.total_transactions) * 100).toFixed(3)}%` : '0.0%', sub: 'Ratio' },
                        { label: 'Avg Tx Value', value: activeBank.avg_tx_value ? `$${activeBank.avg_tx_value.toFixed(1)}` : 'N/A', sub: 'USD Value' },
                      ].map((card, i) => (
                        <div key={i} className="p-3 bg-[#F8FAFC] border border-slate-100 rounded-lg">
                          <span className="text-[10px] text-textSubtle font-sans uppercase block">{card.label}</span>
                          <span className="text-base font-bold text-textDark mt-1 block font-mono">{card.value}</span>
                          <span className="text-[9px] text-textMuted font-sans mt-0.5 block">{card.sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Local Model & Gradient Audits */}
                  <div className="glass-panel p-8 space-y-6 bg-white font-sans">
                    <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase">
                      Gradient Audit Trails
                    </h3>

                    <div className="space-y-4 font-sans text-xs">
                      <div>
                        <div className="flex justify-between text-xs font-sans text-textMuted mb-1.5 font-sans">
                          <span>Local Validation Accuracy</span>
                          <span className="font-bold text-textDark">{(activeBank.local_accuracy * 100 || 94.2).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-brandBlue h-full rounded-full" 
                            style={{ width: `${(activeBank.local_accuracy || 0.942) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-[#F8FAFC] border border-slate-100 rounded-lg space-y-2 font-sans">
                        <div className="flex justify-between">
                          <span className="text-[#607089]">L2 Gradient Deviation:</span>
                          <span className={isQuarantined ? 'text-brandRed font-bold font-mono' : 'text-textDark font-semibold font-mono'}>
                            {isQuarantined ? '8.7σ (Critical)' : '0.14σ (Normal)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#607089]">Audit Verdict:</span>
                          <span className={isQuarantined ? 'text-brandRed font-bold font-sans' : 'text-brandGreen font-bold font-sans'}>
                            {isQuarantined ? 'REJECTED / QUARANTINED' : 'ACCEPTED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TRAINING TAB */}
          {/* ========================================================================= */}
          {activeTab === 'training' && (
            <div className="space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">Federated Retraining Loop</h2>
                  <p className="text-[#607089] text-sm mt-0.5 font-sans">Initiate retraining iterations and monitor pipeline stages.</p>
                </div>
              </div>

              {/* Active Pipeline Stepper */}
              <div className="glass-panel p-8 bg-white font-sans">
                <h3 className="text-xs font-bold tracking-wider text-textSubtle mb-6 uppercase font-sans">
                  Active Federated Learning Stepper
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 relative font-sans">
                  {[
                    { step: 1, label: '01', title: 'Global Model distributed', activeCheck: simRunning && simStep === 2, completedCheck: simRunning && simStep > 2, blockedCheck: false },
                    { step: 2, label: '02', title: 'Local Node training', activeCheck: simRunning && simStep === 3, completedCheck: simRunning && simStep > 3, blockedCheck: false },
                    { step: 3, label: '03', title: 'Updates collected', activeCheck: simRunning && simStep === 4, completedCheck: simRunning && simStep > 4, blockedCheck: false },
                    { step: 4, label: '04', title: 'Privacy pertubation', activeCheck: simRunning && simStep === 5, completedCheck: simRunning && simStep > 5, blockedCheck: false },
                    { step: 5, label: '05', title: 'Security audits check', activeCheck: simRunning && simStep === 6, completedCheck: simRunning && simStep > 6, blockedCheck: simRunning && simStep === 6 && securityAlerts.length > 0 },
                    { step: 6, label: '06', title: 'FedAvg Aggregation', activeCheck: simRunning && (simStep === 7 || simStep === 8), completedCheck: simRunning && simStep > 8, blockedCheck: false },
                    { step: 7, label: '07', title: 'Global Model published', activeCheck: simRunning && (simStep === 9 || simStep === 10), completedCheck: simRunning && simStep >= 10, blockedCheck: false },
                  ].map((node) => {
                    const isPassed = !simRunning ? fedStatus.status === 'idle' : node.completedCheck;
                    const isActive = simRunning && node.activeCheck;
                    const isBlocked = node.blockedCheck;

                    let stepColor = "bg-white border-slate-200 text-slate-400";
                    if (isBlocked) {
                      stepColor = "bg-red-50 border-brandRed text-brandRed animate-pulse";
                    } else if (isActive) {
                      stepColor = "bg-blue-50 border-brandBlue text-brandBlue font-bold scale-105 shadow-sm";
                    } else if (isPassed) {
                      stepColor = "bg-green-50 border-brandGreen text-brandGreen";
                    }

                    return (
                      <div key={node.step} className="flex flex-col items-center text-center relative z-10 font-sans">
                        <div className={`h-11 w-11 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all ${stepColor}`}>
                          {isPassed && !isActive ? <Check className="h-4.5 w-4.5" /> : node.label}
                        </div>
                        <h4 className={`text-[11px] font-bold mt-2.5 uppercase font-sans tracking-wide ${isActive ? 'text-brandBlue' : (isPassed ? 'text-[#172033]' : 'text-slate-400')}`}>
                          {node.title}
                        </h4>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulation Status & Progress Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Node Training Progress Widget */}
                <div className="glass-panel p-8 space-y-6 bg-white flex flex-col justify-between font-sans">
                  <div>
                    <h3 className="text-base font-bold font-sans text-textDark border-b border-slate-100 pb-3">Node Aggregation Status</h3>
                    <p className="text-[#607089] text-xs mt-0.5 font-sans">Verification of individual local gradients.</p>
                  </div>

                  <div className="space-y-4 font-sans">
                    {banks.map((bank, index) => {
                      const isF = bank.id === 'bank_f';
                      const isTraining = simRunning && simStep === 3 && simActiveClient === bank.id;
                      const isDone = simRunning ? (simStep > 3 || (simStep === 3 && clientsOrderPassed(simActiveClient, bank.id))) : true;
                      const isQuarantined = isF && simRunning && simStep >= 4;

                      return (
                        <div key={index} className="space-y-1.5 font-sans">
                          <div className="flex justify-between text-xs font-sans">
                            <span className="flex items-center gap-1.5 text-textDark font-semibold">
                              <span className={`h-1.5 w-1.5 rounded-full ${isQuarantined ? 'bg-brandRed' : 'bg-brandGreen'}`} />
                              {bank.name}
                            </span>
                            <span className={`font-mono text-[10px] font-semibold uppercase ${
                              isQuarantined 
                                ? 'text-brandRed' 
                                : (isTraining ? 'text-brandOrange animate-pulse' : (isDone ? 'text-brandGreen' : 'text-slate-400'))
                            }`}>
                              {isQuarantined 
                                ? '⚠️ Quarantined' 
                                : (isTraining ? 'SGD Training...' : (isDone ? '✓ Complete' : 'Waiting'))}
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isQuarantined 
                                  ? 'bg-brandRed' 
                                  : (isTraining ? 'bg-brandOrange animate-pulse' : (isDone ? 'bg-brandGreen' : 'bg-slate-200'))
                              }`} 
                              style={{ 
                                width: isQuarantined 
                                  ? '100%' 
                                  : (isTraining ? '65%' : (isDone ? '100%' : '0%')) 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Console Logs */}
                <div className="glass-panel p-8 lg:col-span-2 flex flex-col h-[460px] bg-white font-sans">
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-base font-bold font-sans text-textDark">Secure Aggregation Console</h3>
                    <p className="text-[#607089] text-xs mt-0.5 font-sans">Secure aggregator node operations updates stream.</p>
                  </div>

                  <div className="flex-1 bg-[#0A101C] border border-slate-800 p-4 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1.5 rounded-lg leading-normal shadow-inner">
                    {simLogs.map((log, index) => (
                      <div key={index} className="flex gap-2 text-slate-400">
                        <span className="text-slate-600 font-semibold">{index + 1}.</span>
                        <span className={log.includes('SECURITY') || log.includes('REJECTED') ? 'text-brandRed font-bold' : (log.includes('published') ? 'text-brandGreen font-semibold' : '')}>
                          {log}
                        </span>
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* FRAUD INTELLIGENCE TAB */}
          {/* ========================================================================= */}
          {activeTab === 'intelligence' && (
            <div className="space-y-8 font-sans">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">Global Fraud Intelligence</h2>
                <p className="text-[#607089] text-sm mt-0.5 font-sans">Emerging global fraud threat vectors detected collaboratively.</p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                {fraudPatterns.map((pat, idx) => {
                  let PatternIcon = Smartphone;
                  if (pat.pattern_name.includes('UPI') || pat.pattern_name.includes('device')) PatternIcon = Smartphone;
                  else if (pat.pattern_name.includes('velocity')) PatternIcon = CreditCard;
                  else if (pat.pattern_name.includes('takeover') || pat.pattern_name.includes('Account')) PatternIcon = UserCheck;

                  return (
                    <div key={idx} className="glass-panel p-6 flex flex-col justify-between space-y-6 bg-white font-sans">
                      <div className="space-y-3 font-sans">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                              <PatternIcon className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold font-sans text-textDark leading-snug">{pat.pattern_name}</h3>
                              <span className="text-textSubtle text-[10px] block font-mono">ID: FP-0{idx+1}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 border text-[9px] font-sans font-bold uppercase rounded ${
                            pat.risk_weight > 0.85 
                              ? 'border-brandRed/20 bg-red-50 text-brandRed' 
                              : 'border-brandOrange/25 bg-amber-50 text-brandOrange'
                          }`}>
                            {pat.risk_weight > 0.85 ? 'High Risk' : 'Evaluating'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-sans border-t border-b border-slate-100 py-3">
                          <div>
                            <span className="text-[#607089] block text-[10px] uppercase font-semibold">Trend</span>
                            <span className={`font-bold block mt-0.5 font-mono ${pat.growth_rate > 0 ? 'text-brandRed' : 'text-brandGreen'}`}>
                              {pat.growth_rate > 0 ? `+${pat.growth_rate}%` : `${pat.growth_rate}%`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#607089] block text-[10px] uppercase font-semibold">Contributing</span>
                            <span className="text-textDark font-bold block mt-0.5 font-mono">{pat.contributing_banks} / 6 banks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Area chart */}
              <div className="glass-panel p-8 h-[440px] flex flex-col bg-white">
                <h3 className="text-base font-bold font-sans text-textDark mb-6 border-b border-slate-100 pb-4 uppercase font-sans">
                  Fraud Pattern Volume Trends
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { week: 'Week 1', skimming: 400, ato: 120, upi: 50 },
                      { week: 'Week 2', skimming: 390, ato: 180, upi: 120 },
                      { week: 'Week 3', skimming: 350, ato: 310, upi: 240 },
                      { week: 'Week 4', skimming: 280, ato: 540, upi: 480 },
                      { week: 'Week 5', skimming: 210, ato: 890, upi: 1100 }
                    ]}>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="skimming" stackId="1" stroke="#356AE6" fill="#356AE6" fillOpacity={0.06} name="Card Skimming" />
                      <Area type="monotone" dataKey="ato" stackId="1" stroke="#D99017" fill="#D99017" fillOpacity={0.06} name="Account Takeover" />
                      <Area type="monotone" dataKey="upi" stackId="1" stroke="#D64545" fill="#D64545" fillOpacity={0.06} name="UPI Instant Micro Splitting" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* FRAUD PREDICTIONS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'predictions' && (
            <div className="space-y-8">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide font-sans">Explainable Risk Analysis</h2>
                <p className="text-[#607089] text-sm mt-0.5 font-sans">Evaluate transaction profiles against federated global model parameters.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form */}
                <form onSubmit={handlePredict} className="glass-panel p-8 space-y-6 lg:col-span-2 bg-white font-sans">
                  <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase">
                    Transaction Variable Inputs
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-textMuted uppercase font-sans">Amount (USD)</label>
                      <input 
                        type="number"
                        value={predInput.amount}
                        onChange={(e) => setPredInput(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-white border border-borderLight rounded-lg px-3 py-2 text-sm text-textDark outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-textMuted uppercase font-sans">Transaction Type</label>
                      <select 
                        value={predInput.tx_type}
                        onChange={(e) => setPredInput(prev => ({ ...prev, tx_type: e.target.value }))}
                        className="w-full bg-white border border-borderLight rounded-lg px-3 py-2 text-sm text-textDark outline-none focus:border-brandBlue font-sans"
                      >
                        <option value="card_payment">Card Payment (CNP)</option>
                        <option value="bank_transfer">ACH/Bank Transfer</option>
                        <option value="upi_transfer">UPI instant mobile transfer</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-textMuted uppercase font-sans">Merchant Category</label>
                      <select 
                        value={predInput.merchant_category}
                        onChange={(e) => setPredInput(prev => ({ ...prev, merchant_category: e.target.value }))}
                        className="w-full bg-white border border-borderLight rounded-lg px-3 py-2 text-sm text-textDark outline-none focus:border-brandBlue font-sans"
                      >
                        <option value="retail">Retail POS Shopping</option>
                        <option value="travel">Travel/Airlines Portal</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="gambling">High-Risk Gaming/Cryptocurrency Exchange</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-textMuted uppercase font-sans">Tx Velocity (1 hr window)</label>
                      <input 
                        type="number"
                        value={predInput.transaction_velocity}
                        onChange={(e) => setPredInput(prev => ({ ...prev, transaction_velocity: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-white border border-borderLight rounded-lg px-3 py-2 text-sm text-textDark outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue font-mono"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-brandBlue hover:bg-[#173A91] font-bold text-white rounded-lg shadow-sm flex items-center gap-2 cursor-pointer font-sans"
                    >
                      <Fingerprint className="h-4.5 w-4.5" />
                      Evaluate Risk Score
                    </button>
                  </div>
                </form>

                {/* Score Attributions Panel */}
                <div className="glass-panel p-8 flex flex-col justify-between bg-white font-sans">
                  <div className="space-y-6 font-sans">
                    <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase">
                      Inference Result
                    </h3>

                    {predResult ? (
                      <div className="space-y-6 font-sans">
                        
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className={`text-4xl font-bold font-sans ${
                            predResult.risk_level === 'HIGH' 
                              ? 'text-brandRed' 
                              : (predResult.risk_level === 'MEDIUM' ? 'text-brandOrange' : 'text-brandGreen')
                          }`}>
                            {predResult.risk_score}%
                          </div>
                          <span className={`text-xs font-bold tracking-widest mt-2 px-2.5 py-0.5 border uppercase rounded-md font-sans ${
                            predResult.risk_level === 'HIGH' 
                              ? 'border-brandRed/20 bg-red-50 text-brandRed' 
                              : (predResult.risk_level === 'MEDIUM' ? 'border-brandOrange/25 bg-amber-50 text-brandOrange' : 'border-brandGreen/20 bg-green-50 text-brandGreen')
                          }`}>
                            {predResult.risk_level} Risk Level
                          </span>
                        </div>

                        {/* Explainable Contributions */}
                        <div className="space-y-3 font-sans">
                          <h4 className="text-[10px] text-textSubtle uppercase tracking-wider font-bold block font-sans">Explainability breakdown</h4>
                          
                          <div className="space-y-3 font-sans">
                            {Object.entries(predResult.explanations).map(([feature, weight]: any, i) => (
                              <div key={i} className="space-y-1 font-sans">
                                <div className="flex justify-between text-xs font-sans text-[#607089]">
                                  <span>{feature}</span>
                                  <span className="font-bold text-textDark font-mono text-xs">+{weight}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-brandBlue h-full rounded-full" 
                                    style={{ width: `${(weight / predResult.risk_score) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-textSubtle font-sans text-xs">
                        <Fingerprint className="h-8 w-8 text-slate-300 mb-3" />
                        <span>Submit values on the left to initialize explainable neural inference.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* MODEL REGISTRY TAB */}
          {/* ========================================================================= */}
          {activeTab === 'registry' && (
            <div className="space-y-8">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide font-sans">Model Registry</h2>
                <p className="text-[#607089] text-sm mt-0.5 font-sans">Inspect training audit histories, compare versions, and roll back models.</p>
              </div>

              {/* Version Comparison Widget */}
              <div className="glass-panel p-8 bg-white space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold font-sans text-textDark">Compare Model Versions</h3>
                  <p className="text-[#607089] text-xs font-sans mt-0.5">Evaluate key classification shifts between rounds.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                  <div className="space-y-1.5 font-sans">
                    <span className="text-xs font-semibold text-textMuted font-sans block uppercase">Baseline Model (A)</span>
                    <select 
                      value={compareModelA} 
                      onChange={(e) => setCompareModelA(e.target.value)}
                      className="bg-white border border-borderLight rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-brandBlue cursor-pointer"
                    >
                      {modelVersions.map(v => (
                        <option key={v.version} value={v.version}>{v.version}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-textSubtle text-xs pb-2 font-bold font-mono">→</div>
                  <div className="space-y-1.5 font-sans">
                    <span className="text-xs font-semibold text-textMuted font-sans block uppercase">Target Model (B)</span>
                    <select 
                      value={compareModelB} 
                      onChange={(e) => setCompareModelB(e.target.value)}
                      className="bg-white border border-borderLight rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-brandBlue cursor-pointer"
                    >
                      {modelVersions.map(v => (
                        <option key={v.version} value={v.version}>{v.version}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {compareResult && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-100 font-sans text-xs">
                    {[
                      { label: 'Accuracy', valA: compareResult.accuracyA, valB: compareResult.accuracyB },
                      { label: 'Precision', valA: compareResult.precisionA, valB: compareResult.precisionB },
                      { label: 'Recall', valA: compareResult.recallA, valB: compareResult.recallB },
                      { label: 'F1 Score', valA: compareResult.f1A, valB: compareResult.f1B },
                    ].map((row, i) => {
                      const change = row.valB - row.valA;
                      const isUp = change >= 0;
                      return (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-lg font-sans">
                          <span className="text-[10px] text-textSubtle uppercase tracking-wider font-bold block mb-1 font-sans">{row.label}</span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-textMuted font-mono text-xs font-semibold">{(row.valA * 100).toFixed(1)}%</span>
                            <span className="text-textSubtle font-mono text-[10px]">→</span>
                            <span className="text-textDark font-bold font-mono text-sm">{(row.valB * 100).toFixed(1)}%</span>
                          </div>
                          <span className={`text-[10px] font-semibold mt-1 block font-mono ${isUp ? 'text-brandGreen' : 'text-brandRed'}`}>
                            {isUp ? `+${(change * 100).toFixed(1)}%` : `${(change * 100).toFixed(1)}%`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Version History Table */}
              <div className="glass-panel p-8 bg-white">
                <h3 className="text-sm font-bold font-sans text-textDark mb-6 border-b border-slate-100 pb-4 uppercase">
                  Version Lineage Ledger
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-sans">
                    <thead>
                      <tr className="border-b border-slate-200 text-textMuted uppercase text-xs font-bold">
                        <th className="pb-3 font-bold font-sans">Version tag</th>
                        <th className="pb-3 font-bold font-sans">Round</th>
                        <th className="pb-3 font-bold font-sans">Published Date</th>
                        <th className="pb-3 font-bold text-right font-sans">Accuracy</th>
                        <th className="pb-3 font-bold text-right font-sans">Precision</th>
                        <th className="pb-3 font-bold text-right font-sans">Recall</th>
                        <th className="pb-3 font-bold text-right font-sans">F1</th>
                        <th className="pb-3 font-bold text-center font-sans">Status</th>
                        <th className="pb-3 font-bold text-right font-sans">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-mono text-xs">
                      {modelVersions.map((model, index) => {
                        const isActive = model.status === 'active';
                        return (
                          <tr key={index} className="hover:bg-slate-50/40">
                            <td className="py-4 font-sans font-bold flex items-center gap-2">
                              <Archive className="h-4.5 w-4.5 text-slate-400" />
                              <span className="text-[#2457D6] text-sm font-mono">{model.version}</span>
                            </td>
                            <td className="py-4 text-textDark font-sans font-semibold">Round {model.round_number}</td>
                            <td className="py-4 text-[#607089] font-sans">{new Date(model.created_at).toLocaleDateString()}</td>
                            <td className="py-4 text-right text-textDark font-bold font-mono">{(model.accuracy * 100).toFixed(1)}%</td>
                            <td className="py-4 text-right text-textMuted font-mono">{(model.precision * 100).toFixed(1)}%</td>
                            <td className="py-4 text-right text-textMuted font-mono">{(model.recall * 100).toFixed(1)}%</td>
                            <td className="py-4 text-right text-textMuted font-mono">{(model.f1 * 100).toFixed(1)}%</td>
                            <td className="py-4 text-center font-sans">
                              <span className={`px-2.5 py-0.5 border text-[9px] uppercase font-bold rounded-lg ${
                                isActive 
                                  ? 'border-brandGreen/25 bg-green-50 text-brandGreen' 
                                  : 'border-slate-200 bg-slate-100 text-slate-500'
                              }`}>
                                {model.status}
                              </span>
                            </td>
                            <td className="py-4 text-right font-sans">
                              {!isActive && (
                                <button
                                  onClick={() => handleRollback(model.version)}
                                  className="px-2.5 py-1 border border-borderLight hover:border-brandBlue text-textMuted hover:text-brandBlue text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer bg-white font-sans"
                                >
                                  Rollback
                                </button>
                              )}
                              {isActive && (
                                <span className="text-textSubtle text-[10px] select-none font-bold pr-2 font-sans">ACTIVE</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SECURITY TAB */}
          {/* ========================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-8 font-sans">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">Security Settings & Safeguards</h2>
                <p className="text-[#607089] text-sm mt-0.5">Parameters for differential privacy perturbation and client audit trails.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Privacy Safeguards control panel */}
                <div className="glass-panel p-8 space-y-6 bg-white flex flex-col justify-between font-sans">
                  <div className="space-y-6 font-sans">
                    <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase">
                      Privacy Parameters
                    </h3>

                    {/* DP noise control */}
                    <div className="space-y-3 font-sans">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-textDark font-semibold uppercase">Differential Privacy (DP)</label>
                        <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase rounded-md ${
                          dpEnabled ? 'border-brandGreen/20 bg-green-50 text-brandGreen' : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}>
                          {dpEnabled ? 'Active' : 'Bypassed'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-textMuted leading-relaxed">
                        Gaussian noise addition acts on client weight packets prior to central aggregation, mathematically isolating private transaction profiles.
                      </p>
                      
                      <div className="flex items-center gap-3 pt-1">
                        <input 
                          type="range"
                          min="0.001"
                          max="0.05"
                          step="0.001"
                          value={dpNoise}
                          disabled={!dpEnabled}
                          onChange={(e) => setDpNoise(parseFloat(e.target.value))}
                          className="w-full accent-brandBlue cursor-pointer bg-slate-200 h-1 rounded-full"
                        />
                        <span className="text-xs font-mono text-textDark w-12 text-right font-bold">
                          {(dpNoise * 1000).toFixed(1)}k
                        </span>
                      </div>
                      <span className="text-[10px] text-[#607089] block">Gaussian perturbation factor setting</span>
                      
                      <label className="flex items-center gap-2.5 text-xs text-textMuted cursor-pointer pt-2 select-none font-semibold">
                        <input 
                          type="checkbox"
                          checked={dpEnabled}
                          onChange={(e) => setDpEnabled(e.target.checked)}
                          className="bg-white border border-slate-300 rounded accent-brandBlue h-4 w-4 outline-none focus:ring-brandBlue cursor-pointer"
                        />
                        Gaussian perturbation noise active
                      </label>
                    </div>

                    {/* S-Agg Toggle */}
                    <div className="space-y-3 border-t border-slate-100 pt-5 font-sans">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-textDark font-semibold uppercase">Secure Aggregation (S-Agg)</label>
                        <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase rounded-md ${
                          secAggEnabled ? 'border-brandGreen/20 bg-green-50 text-brandGreen' : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}>
                          {secAggEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-textMuted leading-relaxed">
                        Encrypts local model parameters prior to central Aggregator uploads. Multi-party keys ensure details cannot be read individually.
                      </p>
                      
                      <label className="flex items-center gap-2.5 text-xs text-textMuted cursor-pointer pt-2 select-none font-semibold">
                        <input 
                          type="checkbox"
                          checked={secAggEnabled}
                          onChange={(e) => setSecAggEnabled(e.target.checked)}
                          className="bg-white border border-slate-300 rounded accent-brandBlue h-4 w-4 outline-none focus:ring-brandBlue cursor-pointer"
                        />
                        Secure Aggregation active
                      </label>
                    </div>
                  </div>
                </div>

                {/* Threat Detection quarantine alert logs */}
                <div className="glass-panel lg:col-span-2 p-8 flex flex-col justify-between bg-white font-sans">
                  <div>
                    <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 mb-6 uppercase">
                      MALICIOUS UPDATES QUARANTINE LEDGER
                    </h3>

                    <div className="space-y-4 font-sans">
                      {securityAlerts.map((alert, index) => (
                        <div key={index} className="border border-brandRed/20 bg-red-50/20 rounded-xl p-4 flex gap-4">
                          <AlertTriangle className="h-5.5 w-5.5 text-brandRed shrink-0 mt-0.5" />
                          <div className="space-y-1 font-sans text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-brandRed font-bold uppercase">{alert.alert_type} Attempt Detected</span>
                              <span className="text-slate-300">|</span>
                              <span className="text-textDark font-semibold">Node: {alert.bank_id.toUpperCase()}</span>
                              <span className="text-slate-300">|</span>
                              <span className="text-textSubtle font-mono text-[10px]">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-textMuted leading-relaxed text-[11px] pt-1">
                              {alert.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* MONITORING TAB */}
          {/* ========================================================================= */}
          {activeTab === 'monitoring' && (
            <div className="space-y-8 font-sans">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">Node Telemetry</h2>
                <p className="text-[#607089] text-sm mt-0.5 font-sans">CPU, memory, and sync latency metrics across participating nodes.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                
                {/* CPU RAM usage */}
                <div className="glass-panel p-8 h-[440px] flex flex-col bg-white">
                  <h3 className="text-sm font-bold font-sans text-textDark mb-6 border-b border-slate-100 pb-4 uppercase">
                    Average node resource utilization
                  </h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={systemMetrics}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                        <Legend />
                        <Area type="monotone" dataKey="cpu_usage" stroke="#D99520" fill="#D99520" fillOpacity={0.04} name="CPU Usage (%)" />
                        <Area type="monotone" dataKey="memory_usage" stroke="#2457D6" fill="#2457D6" fillOpacity={0.04} name="Memory Usage (%)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Network latency */}
                <div className="glass-panel p-8 h-[440px] flex flex-col bg-white">
                  <h3 className="text-sm font-bold font-sans text-textDark mb-6 border-b border-slate-100 pb-4 uppercase">
                    Client Gradient Upload Latency
                  </h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={systemMetrics}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="network_latency" fill="#159A68" fillOpacity={0.8} name="Network Latency (ms)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* AUDIT LOGS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="space-y-8 font-sans">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">Operations Ledger</h2>
                <p className="text-[#607089] text-sm mt-0.5 font-sans">Audit log tracks model aggregates, registration updates, and client actions.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-borderLight rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-textDark outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue"
                  />
                </div>

                <div className="flex bg-slate-100 border border-borderLight rounded-lg p-0.5 flex-wrap">
                  {['ALL', 'SECURITY', 'FEDERATION', 'MODEL', 'BANK', 'WARNING'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLogFilter(filter)}
                      className={`px-3 py-1 text-[10px] font-sans font-bold uppercase rounded-md transition-all cursor-pointer ${
                        logFilter === filter 
                          ? 'bg-white text-brandNavy shadow-sm' 
                          : 'text-[#607089] hover:text-textDark'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logs Ledger */}
              <div className="glass-panel p-8 bg-white font-sans">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 text-[#607089] uppercase text-[10px] font-bold font-sans">
                        <th className="pb-3 font-bold font-sans">Timestamp</th>
                        <th className="pb-3 font-bold font-sans">Actor</th>
                        <th className="pb-3 font-bold font-sans">Event Action</th>
                        <th className="pb-3 font-bold font-sans">Resource details</th>
                        <th className="pb-3 font-bold text-center font-sans">Status</th>
                        <th className="pb-3 font-bold text-right font-sans">Request ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredLogs.map((log, index) => {
                        const isWarning = log.status === 'WARNING' || log.event.includes('ANOMALY') || log.event.includes('REJECT');
                        return (
                          <tr key={index} className="hover:bg-slate-50/40">
                            <td className="py-4 text-[#607089]">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className={`py-4 font-semibold font-sans ${isWarning ? 'text-brandRed' : 'text-textDark'}`}>
                              {log.actor.toUpperCase()}
                            </td>
                            <td className="py-4 text-textDark font-bold font-sans">{log.event}</td>
                            <td className="py-4 text-[#607089] font-sans">{log.resource}</td>
                            <td className="py-4 text-center font-sans">
                              <span className={`px-2 py-0.5 border text-[9px] uppercase font-bold rounded-lg ${
                                isWarning 
                                  ? 'border-brandRed/20 bg-red-50 text-brandRed' 
                                  : 'border-brandGreen/20 bg-green-50 text-brandGreen'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-4 text-right text-[#607089] font-mono text-xs">{log.request_id}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* API EXPLORER TAB */}
          {/* ========================================================================= */}
          {activeTab === 'api' && (
            <div className="space-y-8 font-sans">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">API Explorer</h2>
                <p className="text-[#607089] text-sm mt-0.5">Swagger sandbox for federated fraud models interaction.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
                
                {/* Endpoints */}
                <div className="lg:col-span-2 space-y-4 font-sans">
                  {[
                    {
                      method: 'GET',
                      path: '/api/federation/status',
                      desc: 'Fetches active metadata including current round execution state.',
                      sampleRes: { id: 1, name: 'Global Federation', status: 'idle', current_round: 28, global_model_version: 'v28' }
                    },
                    {
                      method: 'GET',
                      path: '/api/banks',
                      desc: 'Lists all connected banks, total transaction statistics, and local validation metrics.',
                      sampleRes: [
                        { id: 'bank_a', name: 'Aegis Retail Bank', status: 'online', trust_score: 0.98, local_accuracy: 0.942 }
                      ]
                    },
                    {
                      method: 'POST',
                      path: '/api/predict',
                      desc: 'Executes transaction fraud probability validation and returns driving factors explanations.',
                      sampleReq: { amount: 150.0, tx_type: 'card_payment', merchant_category: 'retail', device_age: 180.0, new_device: false, new_beneficiary: false, location_changed: false, transaction_velocity: 1.0, account_age: 450.0, previous_fraud_history: false, time_of_transaction: 12 },
                      sampleRes: { risk_score: 14.2, risk_level: 'LOW', is_fraud: false, explanations: { 'Location anomaly': 10.2 } }
                    }
                  ].map((endpoint, index) => {
                    const isPost = endpoint.method === 'POST';
                    const key = `${endpoint.method}-${endpoint.path}`;
                    const isOpen = activeApiCard === key;
                    return (
                      <div key={index} className="glass-panel overflow-hidden bg-white">
                        <div 
                          onClick={() => setActiveApiCard(isOpen ? null : key)}
                          className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-all select-none"
                        >
                          <div className="flex items-center gap-4 font-mono text-xs">
                            <span className={`px-2 py-0.5 font-bold rounded text-[9px] border ${isPost ? 'bg-blue-50 text-brandBlue border-blue-200' : 'bg-green-50 text-brandGreen border-green-200'}`}>
                              {endpoint.method}
                            </span>
                            <span className="font-bold text-textDark font-mono">{endpoint.path}</span>
                            <span className="text-slate-300 hidden sm:inline">|</span>
                            <span className="text-textMuted truncate max-w-[280px] hidden sm:inline font-sans">{endpoint.desc}</span>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-slate-400 transition-all ${isOpen ? 'rotate-90 text-brandBlue' : ''}`} />
                        </div>

                        {isOpen && (
                          <div className="p-6 border-t border-slate-100 bg-slate-50/20 font-mono text-[11px] space-y-4">
                            {endpoint.sampleReq && (
                              <div className="space-y-1.5">
                                <span className="text-textSubtle text-[9px] uppercase font-bold font-sans">Request Body</span>
                                <pre className="p-3 bg-slate-900 text-slate-300 border border-slate-800 rounded-lg overflow-x-auto shadow-inner font-mono">
                                  {JSON.stringify(endpoint.sampleReq, null, 2)}
                                </pre>
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <span className="text-textSubtle text-[9px] uppercase font-bold font-sans">Response Payload</span>
                              <pre className="p-3 bg-slate-900 text-slate-300 border border-slate-800 rounded-lg overflow-x-auto shadow-inner font-mono">
                                {JSON.stringify(endpoint.sampleRes, null, 2)}
                              </pre>
                            </div>

                            <div className="flex justify-end pt-2">
                              <button
                                onClick={async () => {
                                  try {
                                    const options: any = { method: endpoint.method };
                                    if (isPost) {
                                      options.headers = { 'Content-Type': 'application/json' };
                                      options.body = JSON.stringify(endpoint.sampleReq);
                                    }
                                    const res = await fetch(endpoint.path, options);
                                    const data = await res.json();
                                    setApiTryResult(data);
                                  } catch (e) {
                                    setApiTryResult({ error: 'Endpoint call failed' });
                                  }
                                }}
                                className="px-3 py-1.5 border border-brandBlue/20 bg-blue-50/50 hover:bg-blue-50 text-brandBlue font-bold uppercase rounded-lg text-[9px] tracking-wider transition-all cursor-pointer font-sans"
                              >
                                Try Call
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Sandbox Response */}
                <div className="glass-panel p-8 flex flex-col justify-between h-[480px] bg-white font-sans">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase">
                      Sandbox Output
                    </h3>
                    
                    {apiTryResult ? (
                      <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[10px] text-brandGreen overflow-y-auto max-h-[280px] shadow-inner font-mono">
                        {JSON.stringify(apiTryResult, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-textSubtle font-sans text-xs">
                        <Terminal className="h-8 w-8 text-slate-300 mb-3" />
                        <span>Sandbox console is idle.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SETTINGS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-8 font-sans">
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-textDark uppercase tracking-wide">Settings</h2>
                <p className="text-[#607089] text-sm mt-0.5">Decentralized protocols configurations and system controls.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                
                {/* General config */}
                <div className="glass-panel p-8 space-y-6 bg-white font-sans">
                  <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase font-sans">
                    Decentralized parameters
                  </h3>

                  <div className="space-y-4 font-sans text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-textSubtle font-bold uppercase font-sans">AGGREGATION STRATEGY</label>
                      <select className="bg-white border border-borderLight rounded-lg px-3 py-2 text-textDark outline-none focus:border-brandBlue font-sans">
                        <option value="fedavg">Federated Averaging (FedAvg)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Retraining */}
                <div className="glass-panel p-8 space-y-6 bg-white flex flex-col justify-between font-sans">
                  <div>
                    <h3 className="text-sm font-bold font-sans text-textDark border-b border-slate-100 pb-3 uppercase">
                      Forced training trigger
                    </h3>
                    
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs text-textMuted font-sans leading-relaxed">
                      Drift index operates at <strong className="font-mono">{driftData.drift_score}</strong> (Threshold limit: <strong className="font-mono">{driftData.threshold}</strong>). Retraining updates weights from client nodes.
                    </div>
                  </div>

                  <button
                    onClick={handleStartRound}
                    disabled={loading || simRunning}
                    className="w-full py-3 bg-brandBlue hover:bg-[#173A91] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
                    Trigger Retraining Round
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* --- FOOTER / METADATA --- */}
        <footer className="h-10 border-t border-borderLight bg-white px-8 flex items-center justify-between text-[10px] font-mono text-textSubtle shrink-0 select-none">
          <span>© 2026 Intella Security Ops Center · Banking Security Framework v2.8</span>
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-brandGreen font-sans">
            <Lock className="h-3.5 w-3.5" />
            Integrity check: pass
          </span>
        </footer>

      </main>

    </div>
  );

  // Helper function to check progress bar index
  function clientsOrderPassed(active: string | null, target: string): boolean {
    const clients = ["bank_a", "bank_b", "bank_c", "bank_d", "bank_e", "bank_f"];
    if (!active) return true;
    return clients.indexOf(target) < clients.indexOf(active);
  }
}
