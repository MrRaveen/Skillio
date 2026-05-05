import pytest
import json
from datetime import datetime

def test_save_payment_and_create_org_success(client, clean_db):
    # Step 1: Save Payment Info
    payment_payload = {
        "planIDInternal": "premium_monthly",
        "stripe_customer_id": "cus_123",
        "stripe_subscription_id": "sub_123",
        "stripe_price_id": "price_123",
        "stripe_subscription_status": "active",
        "current_period_end": datetime.now().isoformat(),
        "current_period_start": datetime.now().isoformat()
    }
    
    payment_response = client.post('/save-payment-info', 
                           data=json.dumps(payment_payload),
                           content_type='application/json')
    
    assert payment_response.status_code == 201
    payment_data = payment_response.get_json()
    assert payment_data['message'] == "Payment information saved successfully"
    org_id = payment_data['orgID']
    assert org_id is not None
    
    # Step 2: Update Org Info
    org_payload = {
        "orgID": org_id,
        "companyName": "Test Org",
        "companySize": "10-50",
        "companyIndustry": "IT",
        "companyEmail": "test@org.com",
        "contactNumber": "1234567890",
        "ownerEmail": "owner@org.com",
        "personalNumber": "0987654321",
        "password": "password123",
        "address": "123 Test St",
        "city": "Test City",
        "state": "Test State",
        "zipCode": "12345",
        "country": "Test Country",
        "companyWebsiteUrl": "https://test.com",
        "companyLogoUrl": "https://test.com/logo.png",
        "companyBannerUrl": "https://test.com/banner.png"
    }
    
    org_response = client.post('/create-org-acc', 
                           data=json.dumps(org_payload),
                           content_type='application/json')
    
    assert org_response.status_code == 200
    org_data = org_response.get_json()
    assert org_data['message'] == "Organization account created successfully"
    assert org_data['orgID'] == org_id

def test_save_payment_validation_failed(client):
    payload = {
        "stripe_customer_id": "cus_123"
        # Missing other required fields
    }
    
    response = client.post('/save-payment-info', 
                           data=json.dumps(payload),
                           content_type='application/json')
    
    assert response.status_code == 400
    data = response.get_json()
    assert data['error'] == "Validation failed"

def test_create_org_invalid_id(client):
    org_payload = {
        "orgID": "60d5ecb8b392d4f29a000000", # Fake ID
        "companyName": "Test Org",
        "companySize": "10-50",
        "companyIndustry": "IT",
        "companyEmail": "test@org.com",
        "contactNumber": "1234567890",
        "ownerEmail": "owner@org.com",
        "personalNumber": "0987654321",
        "password": "password123",
        "address": "123 Test St",
        "city": "Test City",
        "state": "Test State",
        "zipCode": "12345",
        "country": "Test Country",
        "companyWebsiteUrl": "https://test.com",
        "companyLogoUrl": "https://test.com/logo.png",
        "companyBannerUrl": "https://test.com/banner.png"
    }
    
    org_response = client.post('/create-org-acc', 
                           data=json.dumps(org_payload),
                           content_type='application/json')
    
    assert org_response.status_code == 404
    org_data = org_response.get_json()
    assert org_data['error'] == "Organization account not found for provided ID"

