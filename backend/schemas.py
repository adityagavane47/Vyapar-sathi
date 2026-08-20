from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TransactionPredictionInput(BaseModel):
    amount: float = Field(..., example=250.0, description="Transaction amount in USD")
    tx_type: str = Field(..., example="bank_transfer", description="Type of transaction: card_payment, bank_transfer, upi_transfer")
    merchant_category: str = Field(..., example="gambling", description="Merchant category: retail, travel, entertainment, gambling, utilities")
    device_age: float = Field(..., example=30.0, description="Age of current device in days")
    new_device: bool = Field(..., example=False, description="Flag indicating if transaction is on a new device")
    new_beneficiary: bool = Field(..., example=True, description="Flag indicating if the recipient account is new")
    location_changed: bool = Field(..., example=True, description="Flag indicating if transaction location has changed significantly")
    transaction_velocity: float = Field(..., example=4.0, description="Number of transactions executed in the last hour")
    account_age: float = Field(..., example=120.0, description="Age of the sender account in days")
    previous_fraud_history: bool = Field(..., example=False, description="Flag indicating if there is prior fraud history on account")
    time_of_transaction: int = Field(..., ge=0, le=23, example=14, description="Hour of the transaction (0-23)")

class TransactionPredictionResponse(BaseModel):
    risk_score: float = Field(..., description="Calculated fraud probability score (0 to 100)")
    risk_level: str = Field(..., description="HIGH, MEDIUM, or LOW risk classification")
    is_fraud: bool = Field(..., description="Boolean classification outcome")
    explanations: Dict[str, float] = Field(..., description="Impact scores of each driving factor")

class BankRegisterInput(BaseModel):
    id: str = Field(..., min_length=3, max_length=20, example="bank_g")
    name: str = Field(..., min_length=3, max_length=50, example="Goliath National Bank")
    total_transactions: Optional[int] = 0
    fraud_cases: Optional[int] = 0
    avg_tx_value: Optional[float] = 0.0

class ModelRollbackInput(BaseModel):
    version: str = Field(..., example="v23")

class StatusResponse(BaseModel):
    status: str
    message: str
