from flask import Blueprint, request, jsonify
from mongoengine.errors import NotUniqueError, ValidationError, DoesNotExist
from app.requests.createOrgReq import createOrgReq
from app.requests.savePaymentReq import savePaymentReq
from app.Service.loginService import create_org_acc, save_payment_info
from pydantic import ValidationError as PydanticValidationError
import stripe
import os
from datetime import datetime

loginRoutes = Blueprint('loginRoutes', __name__)

@loginRoutes.route('/login', methods=['POST'])
def loginProcess():
    pass
@loginRoutes.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.get_json()
    price_id = data.get('priceId')
    planIDInternal = data.get('planID')

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{os.getenv('FRONTEND_URL')}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.getenv('FRONTEND_URL')}/cancel",
            metadata={
                'planIDInternal': planIDInternal
            }
        )
        return jsonify({"url": session.url}), 200
    except Exception as e:
        return jsonify(error=str(e)), 403

@loginRoutes.route('/api/webhook', methods=['POST'])
def save_payment():
    try:
        payload = request.data
        sig_header = request.headers.get('Stripe-Signature')
        endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        
        try:
            # Verify the event came from Stripe
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            return 'Invalid payload', 400
        except stripe.error.SignatureVerificationError as e:
            return 'Invalid signature', 400
            
        # Only process this specific event type
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            session_metadata = session.get('metadata', {})
            stripe_subscription_id = session.get('subscription')
            
            # Retrieve the full subscription to get the price ID and dates
            subscription = stripe.Subscription.retrieve(stripe_subscription_id)
            stripe_price_id = subscription['items']['data'][0]['price']['id']
            
            savePaymentData = savePaymentReq(
                planIDInternal=session_metadata.get('planIDInternal'),
                stripe_customer_id=session.get('customer'),
                stripe_subscription_id=stripe_subscription_id,
                stripe_price_id=stripe_price_id,
                stripe_subscription_status=subscription['status'],
                current_period_end=datetime.fromtimestamp(subscription['current_period_end']),
                current_period_start=datetime.fromtimestamp(subscription['current_period_start'])
            ) 
            
            # MOVED INSIDE THE IF BLOCK
            new_org = save_payment_info(savePaymentData)
            
            # Log it if needed, but returning data to Stripe is unnecessary
            print(f"Payment information saved for Org ID: {new_org.id}")

        # ALWAYS return a 200 to Stripe at the end to stop retries for unhandled events
        return jsonify({"success": True}), 200

    except ValidationError as e:
        return jsonify({"error": "Database validation failed", "details": str(e)}), 400
    except Exception as e:
        print(f"Webhook error: {str(e)}") # Add logging here to see the actual error in console
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@loginRoutes.route('/create-org-acc', methods=['POST'])
def create_org():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        try:
            req_data = createOrgReq.model_validate(data)
        except PydanticValidationError as e:
            return jsonify({"error": "Validation failed", "details": e.errors()}), 400

        updated_org = create_org_acc(req_data)

        return jsonify({
            "message": "Organization account created successfully",
            "orgID": str(updated_org.id)
        }), 200

    except DoesNotExist:
        return jsonify({"error": "Organization account not found for provided ID"}), 404
    except NotUniqueError:
        return jsonify({"error": "Organization already exists"}), 409
    except ValidationError as e:
        return jsonify({"error": "Database validation failed", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
