import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import {
  DisruptionEvent,
  InventoryItem,
  Supplier,
  PurchaseOrder,
  ProductionOrder,
  DecisionRecord,
  HumanApproval,
  AuditEvent,
  AgentStatus,
} from './types';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DisruptionCenter } from './components/DisruptionCenter';
import { AgentVisualizer } from './components/AgentVisualizer';
import { DecisionComparator } from './components/DecisionComparator';
import { ApprovalModal } from './components/ApprovalModal';
import { SupplyChainExplorer } from './components/SupplyChainExplorer';
import { AuditLogView } from './components/AuditLogView';
import { ScenarioSandbox } from './components/ScenarioSandbox';
import { CustomDisruptionModal } from './components/CustomDisruptionModal';
import { AddSupplierModal } from './components/AddSupplierModal';
import { CreatePurchaseOrderModal } from './components/CreatePurchaseOrderModal';
import { PredictiveForecastingView } from './components/PredictiveForecastingView';
import { ExternalSignals, SupplierRiskPrediction, ProactiveScanResult } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // State
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>([]);
  const [selectedDisruptionId, setSelectedDisruptionId] = useState<number | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [approvals, setApprovals] = useState<HumanApproval[]>([]);
  const [audits, setAudits] = useState<AuditEvent[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);

  // Predictive Intelligence State
  const [externalSignals, setExternalSignals] = useState<ExternalSignals | null>(null);
  const [riskPredictions, setRiskPredictions] = useState<SupplierRiskPrediction[]>([]);
  const [proactiveScanResult, setProactiveScanResult] = useState<ProactiveScanResult | null>(null);

  // Baseline Initial Snapshots for Real-Time Delta Highlighting
  const [initialInventory, setInitialInventory] = useState<InventoryItem[]>([]);
  const [initialPurchaseOrders, setInitialPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [initialSuppliers, setInitialSuppliers] = useState<Supplier[]>([]);
  const isInitialSnapshotSet = useRef<boolean>(false);

  // User-added custom suppliers in state
  const [customSuppliers, setCustomSuppliers] = useState<Supplier[]>(() => {
    try {
      const stored = localStorage.getItem('vyapar_custom_suppliers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // User-created custom POs in state
  const [customPurchaseOrders, setCustomPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const stored = localStorage.getItem('vyapar_custom_pos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState<boolean>(false);
  const [isCreatePoModalOpen, setIsCreatePoModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load state from backend
  const loadData = async (isReset: boolean = false) => {
    try {
      setLoading(true);
      const [disList, invList, supList, poList, prdList, decList, appList, audList, extSig, riskPreds] = await Promise.all([
        api.getDisruptions(),
        api.getInventory(),
        api.getSuppliers(),
        api.getPurchaseOrders(),
        api.getProductionOrders(),
        api.getDecisions(),
        api.getApprovals(),
        api.getAuditLogs(),
        api.getExternalSignals().catch(() => null),
        api.getSupplierRiskPredictions().catch(() => []),
      ]);

      setExternalSignals(extSig);
      setRiskPredictions(riskPreds);

      // Merge backend suppliers with user-added custom suppliers
      const mergedSuppliers = [
        ...supList,
        ...customSuppliers.filter((c) => !supList.some((s) => s.id === c.id || s.code === c.code)),
      ];

      // Merge backend POs with user-created custom POs
      const mergedPos = [
        ...poList,
        ...customPurchaseOrders.filter((c) => !poList.some((p) => p.id === c.id || p.po_number === c.po_number)),
      ];

      setDisruptions(disList);
      setInventory(invList);
      setSuppliers(mergedSuppliers);
      setPurchaseOrders(mergedPos);
      setProductionOrders(prdList);
      setDecisions(decList);
      setApprovals(appList);
      setAudits(audList);

      // Set initial baseline snapshots on first load or upon reset
      if (!isInitialSnapshotSet.current || isReset) {
        setInitialInventory(JSON.parse(JSON.stringify(invList)));
        setInitialPurchaseOrders(JSON.parse(JSON.stringify(poList)));
        setInitialSuppliers(JSON.parse(JSON.stringify(supList)));
        isInitialSnapshotSet.current = true;
      }

      if (disList.length > 0 && !selectedDisruptionId) {
        setSelectedDisruptionId(disList[0].id);
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentStatus = async (disruptionId: number) => {
    try {
      const status = await api.getAgentStatus(disruptionId);
      setAgentStatus(status);
    } catch (err) {
      console.error('Error fetching agent status:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDisruptionId) {
      loadAgentStatus(selectedDisruptionId);
    }
  }, [selectedDisruptionId]);

  // Actions
  const handleRunAgent = async (disruptionId: number) => {
    await api.runAgent(disruptionId);
    await loadData();
    if (selectedDisruptionId) loadAgentStatus(selectedDisruptionId);
  };

  const handleStepAgent = async (disruptionId: number) => {
    await api.stepAgent(disruptionId);
    await loadData();
    if (selectedDisruptionId) loadAgentStatus(selectedDisruptionId);
  };

  const handleApproveDecision = async (approvalId: number, comments: string) => {
    await api.approveDecision(approvalId, comments);
    await loadData();
    if (selectedDisruptionId) loadAgentStatus(selectedDisruptionId);
  };

  const handleRejectDecision = async (approvalId: number, comments: string) => {
    await api.rejectDecision(approvalId, comments);
    await loadData();
    if (selectedDisruptionId) loadAgentStatus(selectedDisruptionId);
  };

  const handleResetSimulation = async () => {
    await api.resetSimulation();
    setSelectedDisruptionId(null);
    setCustomSuppliers([]);
    setCustomPurchaseOrders([]);
    localStorage.removeItem('vyapar_custom_suppliers');
    localStorage.removeItem('vyapar_custom_pos');
    await loadData(true);
  };

  const handleTriggerScenario = async (scenario: string) => {
    const res = await api.triggerDisruption(scenario);
    if (res.disruption) {
      setSelectedDisruptionId(res.disruption.id);
    }
    await loadData();
    setActiveTab('disruptions');
  };

  const handleCreateCustomDisruption = async (payload: any) => {
    const created = await api.createDisruption(payload);
    if (created && created.id) {
      setSelectedDisruptionId(created.id);
    }
    await loadData();
    setActiveTab('disruptions');
  };

  const handleAddSupplier = (newSupplier: Supplier) => {
    const updated = [...customSuppliers, newSupplier];
    setCustomSuppliers(updated);
    try {
      localStorage.setItem('vyapar_custom_suppliers', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const handleCreatePurchaseOrder = (newPo: PurchaseOrder) => {
    const updated = [...customPurchaseOrders, newPo];
    setCustomPurchaseOrders(updated);
    try {
      localStorage.setItem('vyapar_custom_pos', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
    setPurchaseOrders((prev) => [...prev, newPo]);
  };

  const handleRunProactiveScan = async () => {
    const scanRes = await api.runProactiveScan();
    setProactiveScanResult(scanRes);
    await loadData();
  };

  const activeDisruptionsCount = disruptions.filter((d) => d.status !== 'RESOLVED' && (d.status as string) !== 'COMPLETE').length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        activeDisruptionsCount={activeDisruptionsCount}
        onResetSimulation={handleResetSimulation}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !disruptions.length ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewDashboard
                disruptions={disruptions}
                inventory={inventory}
                suppliers={suppliers}
                approvals={approvals}
                onSelectDisruption={(id) => setSelectedDisruptionId(id)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />
            )}

            {activeTab === 'predictive' && (
              <PredictiveForecastingView
                externalSignals={externalSignals}
                riskPredictions={riskPredictions}
                onRunProactiveScan={handleRunProactiveScan}
                onSelectDisruption={(id) => setSelectedDisruptionId(id)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                proactiveScanResult={proactiveScanResult}
              />
            )}

            {activeTab === 'disruptions' && (
              <DisruptionCenter
                disruptions={disruptions}
                selectedDisruptionId={selectedDisruptionId}
                onSelectDisruption={(id) => setSelectedDisruptionId(id)}
                agentStatus={agentStatus}
                decisions={decisions}
                onRunAgent={handleRunAgent}
                onStepAgent={handleStepAgent}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />
            )}

            {activeTab === 'agent' && <AgentVisualizer agentStatus={agentStatus} />}

            {activeTab === 'approvals' && (
              <ApprovalModal
                approvals={approvals}
                onApprove={handleApproveDecision}
                onReject={handleRejectDecision}
              />
            )}

            {activeTab === 'explorer' && (
              <SupplyChainExplorer
                inventory={inventory}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                productionOrders={productionOrders}
                initialInventory={initialInventory}
                initialPurchaseOrders={initialPurchaseOrders}
                initialSuppliers={initialSuppliers}
                onOpenAddSupplierModal={() => setIsAddSupplierModalOpen(true)}
                onOpenCreatePoModal={() => setIsCreatePoModalOpen(true)}
              />
            )}

            {activeTab === 'audit' && <AuditLogView audits={audits} />}

            {activeTab === 'sandbox' && (
              <ScenarioSandbox
                onTriggerScenario={handleTriggerScenario}
                onResetSimulation={handleResetSimulation}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Custom Disruption Injection Modal */}
      <CustomDisruptionModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleCreateCustomDisruption}
        purchaseOrders={purchaseOrders}
        inventory={inventory}
        suppliers={suppliers}
      />

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddSupplierModalOpen}
        onClose={() => setIsAddSupplierModalOpen(false)}
        onAddSupplier={handleAddSupplier}
        existingCount={suppliers.length}
      />

      {/* Create Purchase Order Modal with AI Supplier Matching */}
      <CreatePurchaseOrderModal
        isOpen={isCreatePoModalOpen}
        onClose={() => setIsCreatePoModalOpen(false)}
        onCreatePo={handleCreatePurchaseOrder}
        suppliers={suppliers}
        inventory={inventory}
        productionOrders={productionOrders}
        existingPoCount={purchaseOrders.length}
      />
    </div>
  );
}

export default App;
