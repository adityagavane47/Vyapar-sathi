import datetime
from sqlalchemy.orm import Session
from backend.database.models import (
    Supplier, Component, SupplierCatalog, Warehouse, InventoryItem,
    PurchaseOrder, ProductionOrder, ShipmentTracking, SupplierMessage
)

def seed_database(db: Session):
    # Clear existing data in reverse dependency order
    for table in [ShipmentTracking, SupplierMessage, PurchaseOrder, ProductionOrder, 
                  InventoryItem, SupplierCatalog, Warehouse, Component, Supplier]:
        db.query(table).delete()
    db.commit()

    now = datetime.datetime.utcnow()

    # 1. Seed Suppliers
    s1 = Supplier(
        code="SUP-001",
        name="TechComponents Global",
        contact_email="orders@techcomponents.com",
        reliability_score=92.5,
        quality_rating=4.8,
        certifications=["ISO9001", "AS9100"],
        max_capacity=5000,
        lead_time_days=5,
        status="Active"
    )
    s2 = Supplier(
        code="SUP-002",
        name="Apex Micro Systems",
        contact_email="sales@apexmicro.com",
        reliability_score=88.0,
        quality_rating=4.5,
        certifications=["ISO9001"],
        max_capacity=3000,
        lead_time_days=3,
        status="Active"
    )
    s3 = Supplier(
        code="SUP-003",
        name="Global Semi Corp",
        contact_email="supply@globalsemi.com",
        reliability_score=75.0,
        quality_rating=4.1,
        certifications=["ISO9001", "AS9100"],
        max_capacity=10000,
        lead_time_days=12,
        status="Active"
    )
    s4 = Supplier(
        code="SUP-004",
        name="ElectroParts India",
        contact_email="info@electroparts.in",
        reliability_score=95.0,
        quality_rating=4.9,
        certifications=["ISO9001"],
        max_capacity=8000,
        lead_time_days=4,
        status="Active"
    )
    s5 = Supplier(
        code="SUP-005",
        name="Vanguard Assemblies",
        contact_email="orders@vanguard.com",
        reliability_score=90.0,
        quality_rating=4.7,
        certifications=["AS9100"],
        max_capacity=2000,
        lead_time_days=8,
        status="Active"
    )
    db.add_all([s1, s2, s3, s4, s5])
    db.commit()

    # 2. Seed Components
    c1 = Component(
        code="COMP-101",
        name="Microcontroller Unit MCU-32",
        description="32-bit ARM Cortex Automotive Grade Microcontroller",
        unit_of_measure="Units",
        unit_cost=45.0,
        criticality="High",
        safety_stock=100,
        current_stock=40,
        substitute_component_ids=[]
    )
    c2 = Component(
        code="COMP-102",
        name="Microcontroller Unit MCU-32A",
        description="Pin-compatible high performance Microcontroller",
        unit_of_measure="Units",
        unit_cost=52.0,
        criticality="High",
        safety_stock=100,
        current_stock=150,
        substitute_component_ids=[]
    )
    c3 = Component(
        code="COMP-201",
        name="Precision Optical Sensor POS-5",
        description="Industrial infrared optical position sensor",
        unit_of_measure="Units",
        unit_cost=15.0,
        criticality="Medium",
        safety_stock=200,
        current_stock=350,
        substitute_component_ids=[]
    )
    c4 = Component(
        code="COMP-301",
        name="Heavy-Duty Power Board PB-800",
        description="High power industrial motor controller drive board",
        unit_of_measure="Units",
        unit_cost=120.0,
        criticality="High",
        safety_stock=50,
        current_stock=60,
        substitute_component_ids=[]
    )
    db.add_all([c1, c2, c3, c4])
    db.commit()

    # Set substitutes
    c1.substitute_component_ids = [c2.id]
    c2.substitute_component_ids = [c1.id]
    db.commit()

    # 3. Seed Supplier Catalogs
    cat1 = SupplierCatalog(supplier_id=s1.id, component_id=c1.id, unit_price=45.0, lead_time_days=5, moq=100, quality_certifications=["ISO9001", "AS9100"], capacity_per_week=2000)
    cat2 = SupplierCatalog(supplier_id=s2.id, component_id=c1.id, unit_price=52.0, lead_time_days=3, moq=50, quality_certifications=["ISO9001"], capacity_per_week=1500)
    cat3 = SupplierCatalog(supplier_id=s3.id, component_id=c1.id, unit_price=40.0, lead_time_days=12, moq=500, quality_certifications=["ISO9001", "AS9100"], capacity_per_week=5000)
    cat4 = SupplierCatalog(supplier_id=s4.id, component_id=c3.id, unit_price=15.0, lead_time_days=4, moq=200, quality_certifications=["ISO9001"], capacity_per_week=4000)
    cat5 = SupplierCatalog(supplier_id=s5.id, component_id=c4.id, unit_price=120.0, lead_time_days=8, moq=25, quality_certifications=["ISO9001", "AS9100"], capacity_per_week=800)
    cat6 = SupplierCatalog(supplier_id=s2.id, component_id=c4.id, unit_price=135.0, lead_time_days=4, moq=20, quality_certifications=["ISO9001"], capacity_per_week=500)
    db.add_all([cat1, cat2, cat3, cat4, cat5, cat6])

    # 4. Seed Warehouses & Inventory
    w1 = Warehouse(code="WH-01", name="Central Hub Bengaluru", location="Bengaluru, Karnataka", capacity=15000)
    w2 = Warehouse(code="WH-02", name="Northern Facility Pune", location="Pune, Maharashtra", capacity=10000)
    db.add_all([w1, w2])
    db.commit()

    inv1 = InventoryItem(warehouse_id=w1.id, component_id=c1.id, quantity=40, allocated_quantity=30, safety_stock_level=100)
    inv2 = InventoryItem(warehouse_id=w1.id, component_id=c2.id, quantity=150, allocated_quantity=50, safety_stock_level=100)
    inv3 = InventoryItem(warehouse_id=w1.id, component_id=c3.id, quantity=350, allocated_quantity=100, safety_stock_level=200)
    inv4 = InventoryItem(warehouse_id=w2.id, component_id=c4.id, quantity=60, allocated_quantity=40, safety_stock_level=50)
    db.add_all([inv1, inv2, inv3, inv4])

    # 5. Seed Purchase Orders
    po1 = PurchaseOrder(
        po_number="PO-7001",
        supplier_id=s1.id,
        component_id=c1.id,
        quantity=500,
        unit_price=45.0,
        total_amount=22500.0,
        status="Sent",
        expected_delivery_date=now + datetime.timedelta(days=4),
        expedited=False
    )
    po2 = PurchaseOrder(
        po_number="PO-7002",
        supplier_id=s4.id,
        component_id=c3.id,
        quantity=1000,
        unit_price=15.0,
        total_amount=15000.0,
        status="Confirmed",
        expected_delivery_date=now + datetime.timedelta(days=5),
        expedited=False
    )
    po3 = PurchaseOrder(
        po_number="PO-7003",
        supplier_id=s5.id,
        component_id=c4.id,
        quantity=500,
        unit_price=120.0,
        total_amount=60000.0,
        status="Sent",
        expected_delivery_date=now + datetime.timedelta(days=6),
        expedited=False
    )
    db.add_all([po1, po2, po3])
    db.commit()

    # 6. Seed Production Orders
    prd1 = ProductionOrder(
        order_number="PRD-9001",
        product_name="Medical Diagnostic Controller",
        customer_name="Healthcare Systems Ltd",
        customer_priority="Tier 1",
        quantity=500,
        start_date=now,
        due_date=now + datetime.timedelta(days=10),
        status="Scheduled",
        required_component_id=c1.id,
        required_quantity=500
    )
    prd2 = ProductionOrder(
        order_number="PRD-9002",
        product_name="Smart Grid Meter Unit",
        customer_name="National Power Corp",
        customer_priority="Tier 2",
        quantity=1000,
        start_date=now,
        due_date=now + datetime.timedelta(days=15),
        status="Scheduled",
        required_component_id=c3.id,
        required_quantity=1000
    )
    prd3 = ProductionOrder(
        order_number="PRD-9003",
        product_name="Industrial Automation Hub",
        customer_name="AutoTech India",
        customer_priority="Tier 1",
        quantity=200,
        start_date=now,
        due_date=now + datetime.timedelta(days=8),
        status="Scheduled",
        required_component_id=c4.id,
        required_quantity=200
    )
    db.add_all([prd1, prd2, prd3])

    # 7. Seed Tracking & Messages
    t1 = ShipmentTracking(
        tracking_number="TRK-990182",
        po_id=po1.id,
        carrier="LogiCorp Express",
        origin="Shenzhen Port",
        destination="Bengaluru Port",
        current_location="Transit Hub Singapore",
        status="In_Transit",
        estimated_delivery=now + datetime.timedelta(days=4),
        delays_reported=0
    )
    msg1 = SupplierMessage(
        supplier_id=s1.id,
        po_id=po1.id,
        direction="incoming",
        message_text="Notice: Production line maintenance at our primary wafer fab may cause potential schedule shifts for PO-7001.",
        timestamp=now - datetime.timedelta(hours=2),
        status="Received"
    )
    db.add_all([t1, msg1])

    db.commit()
    print("[Vyapar Saathi Simulation] Database successfully seeded.")
