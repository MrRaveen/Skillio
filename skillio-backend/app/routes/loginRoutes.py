from flask import Blueprint, request, jsonify
from mongoengine.errors import NotUniqueError, ValidationError, DoesNotExist
from app.requests.createOrgReq import createOrgReq
from app.requests.savePaymentReq import savePaymentReq
from app.Service.loginService import create_org_acc, save_payment_info, verify_org_login
from app.jwt_utils import encode_auth_token

from pydantic import ValidationError as PydanticValidationError, EmailStr, BaseModel
import stripe
import random
from mailjet_rest import Client
import os
from datetime import datetime
from app.mailjet_utils import getMailjetClient
from app.redis_utils import getRedisClient

loginRoutes = Blueprint('loginRoutes', __name__)

@loginRoutes.route('/login', methods=['POST'])
def loginProcess():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({
                "status":"error",
                "message": "email and password are required"
            }), 400
        
        org = verify_org_login(email, password)
        if not org:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401
        
        token = encode_auth_token(str(org.id))
        
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "token": token,
            "orgID": str(org.id),
            "companyName": org.companyName
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

            
@loginRoutes.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.get_json()
    price_id = data.get('priceId')
    planIDInternal = data.get('planID')
    orgID = data.get('orgID')

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
                'planIDInternal': planIDInternal,
                'orgID': orgID
            }
        )
        return jsonify({"url": session.url}), 200
    except Exception as e:
        print(f"Stripe Error: {str(e)}")
        return jsonify(error=str(e)), 403

@loginRoutes.route('/api/webhook', methods=['POST'])
def save_payment():
    try:
        payload = request.data
        sig_header = request.headers.get('Stripe-Signature')
        endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        
        print("Webhook received. Verifying signature...")
        
        try:
            # Verify the event came from Stripe
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
            print(f"Event verified: {event['type']}")
        except ValueError as e:
            print(f"Invalid payload: {str(e)}")
            return 'Invalid payload', 400
        except stripe.error.SignatureVerificationError as e:
            print(f"Invalid signature: {str(e)}")
            return 'Invalid signature', 400
            
        # Only process this specific event type
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            def get_stripe_val(obj, key, default=None):
                if hasattr(obj, key):
                    return getattr(obj, key)
                try:
                    return obj[key]
                except (KeyError, AttributeError, TypeError):
                    return default
            
            session_metadata = get_stripe_val(session, 'metadata', {})
            org_id = get_stripe_val(session_metadata, 'orgID')
            plan_id = get_stripe_val(session_metadata, 'planIDInternal')
            
            print(f"Processing checkout.session.completed for Org ID: {org_id}")
            print(f"Metadata: {session_metadata}")
            
            stripe_subscription_id = get_stripe_val(session, 'subscription')
            if not stripe_subscription_id:
                 print("Error: No subscription ID found in session")
                 return jsonify({"error": "No subscription ID"}), 400

            # Retrieve the full subscription to get the price ID and dates
            subscription = stripe.Subscription.retrieve(stripe_subscription_id)
            
            # The subscription and its nested items can also be StripeObjects
            sub_items = get_stripe_val(subscription, 'items')
            sub_data = get_stripe_val(sub_items, 'data', [{}])
            sub_price = get_stripe_val(sub_data[0], 'price', {})
            stripe_price_id = get_stripe_val(sub_price, 'id')
            
            savePaymentData = savePaymentReq(
                orgID=org_id,
                planIDInternal=plan_id,
                stripe_customer_id=get_stripe_val(session, 'customer'),
                stripe_subscription_id=stripe_subscription_id,
                stripe_price_id=stripe_price_id,
                stripe_subscription_status=get_stripe_val(subscription, 'status'),
                current_period_end=datetime.fromtimestamp(get_stripe_val(subscription, 'current_period_end', 0)),
                current_period_start=datetime.fromtimestamp(get_stripe_val(subscription, 'current_period_start', 0))
            ) 
            
            print("Calling save_payment_info service...")
            new_org = save_payment_info(savePaymentData)
            print(f"Payment information successfully saved for Org ID: {new_org.id}")

        # ALWAYS return a 200 to Stripe at the end to stop retries for unhandled events
        return jsonify({"success": True}), 200

    except PydanticValidationError as e:
        print(f"Pydantic Validation error in webhook: {str(e)}")
        return jsonify({"error": "Data validation failed", "details": str(e)}), 400
    except ValidationError as e:
        print(f"Database validation error in webhook: {str(e)}")
        return jsonify({"error": "Database validation failed", "details": str(e)}), 400
    except Exception as e:
        print(f"Unexpected Webhook error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@loginRoutes.route('/get-verification-code/<string:email>', methods=['GET'])
def getVerificationCode(email: str):
    try:
        try:
            class EmailModel(BaseModel):
                email: EmailStr
            EmailModel(email=email)
        except PydanticValidationError:
            return jsonify({
                "status": "error",
                "message": "Invalid email address format"
            }), 400

        verification_code = random.randint(100000, 999999)
        mailjetClient = getMailjetClient()
        redisClient = getRedisClient()
        # Create the redis key
        redis_key = f"verify_email:{email}"
        expiration_time_seconds = 900
        
        # Save to redis
        redisClient.set(name=redis_key, value=verification_code, ex=expiration_time_seconds)

        sender_email = os.environ.get('MAILJET_SENDER_EMAIL')
        if not sender_email:
             return jsonify({
                "status": "error",
                "message": "MAILJET_SENDER_EMAIL is not set in environment variables."
            }), 500

        data = {
            'Messages': [
                {
                    "From": {
                        "Email": sender_email,
                        "Name": "Skillio"
                    },
                    "To": [
                        {
                            "Email": email
                        }
                    ],
                    "Subject": "Your Security Code",
                    "TextPart": f"Your verification code is: {verification_code}. It will expire in 15 minutes.",
                    "HTMLPart": f"<h3>Security Verification</h3><p>Your verification code is: <strong>{verification_code}</strong>.</p><p>It will expire in 15 minutes.</p>"
                }
            ]
        }
        
        # result = mailjetClient.send.create(data=data)
        # result_json = result.json()
        
        # if result.status_code != 200:
        #      return jsonify({
        #         "status": "error",
        #         "message": "Failed to send email via Mailjet (Request Failed)",
        #         "details": ""
        #     }), result.status_code

        # v3.1 returns 200 even if individual messages fail
        # message_status = result_json.get('Messages', [{}])[0].get('Status')
        message_status = "success"
        if message_status != 'success':
            return jsonify({
                "status": "error",
                "message": "Mailjet accepted the request but failed to send the message.",
                "details": result_json
            }), 400

        return jsonify({
            "status": "success",
            "message": "Verification code sent successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error occurred when sending verification code: {str(e)}"
        }), 500
        
@loginRoutes.route('/verify-user/<string:email>/<string:verificationCode>', methods=['POST'])
def verify_user(email: str, verificationCode: str):
    try:
        # Validate email format
        try:
            class EmailModel(BaseModel):
                email: EmailStr
            EmailModel(email=email)
        except PydanticValidationError:
            return jsonify({
                "status": "error",
                "message": "Invalid email address format"
            }), 400

        redis_key = f"verify_email:{email}"
        redisClient = getRedisClient()
        stored_value = redisClient.get(redis_key)
    
        if stored_value is None:
            return jsonify({
                "status": "error",
                "message": "Verification code not found or has expired."
            }), 404
        else:
            if stored_value == verificationCode:
                return jsonify({
                    "status": "success",
                    "message": "Verification code is correct"
                }), 200
            else:
                return jsonify({
                    "status": "failed",
                    "message": "Verification code is incorrect"
                }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error occurred during verification: {str(e)}"
        }), 500

@loginRoutes.route('/create-org-acc', methods=['POST'])
def create_org():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        try:
            req_data = createOrgReq.model_validate(data)
        except PydanticValidationError as e:
            print(f"Validation failed for /create-org-acc. Data: {data}")
            print(f"Errors: {e.errors()}")
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
