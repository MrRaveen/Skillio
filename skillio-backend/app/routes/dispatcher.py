from flask import Blueprint, request, jsonify, Response
from app.redis_utils import getRedisClient
from app.decorators import token_required
import json

dispatcher = Blueprint('dispatcher', __name__)

redisClient = getRedisClient()

def sse_event_stream(orgID):
    """Subscribes to a user-specific Redis channel and yields SSE data."""
    pubsub = redisClient.pubsub()
    channel_name = f"org:{orgID}"
    pubsub.subscribe(channel_name)
    
    # Send immediate heartbeat to flush headers and confirm connection
    yield "data: {\"status\": \"connected\", \"message\": \"SSE connection established\"}\n\n"
    
    try:
        # Listen blocks and waits for new messages
        for message in pubsub.listen():
            if message['type'] == 'message':
                data = message['data']
                print(f"DEBUG: [SSE] Yielding data to Org {orgID} | Channel: {channel_name} | Data: {data[:100]}...", flush=True)
                yield f"data: {data}\n\n"
            else:
                print(f"DEBUG: [SSE] Received non-message type {message['type']} for Org {orgID}", flush=True)
    finally:
        pubsub.unsubscribe(channel_name)
        pubsub.close()

@dispatcher.route('/stream', methods=['GET'])
@token_required
def stream(decorated_data):
    try:
        org_id = decorated_data.get('id')
        print(f"DEBUG: New SSE connection request from Org ID: {org_id}", flush=True)
        return Response(sse_event_stream(org_id), mimetype='text/event-stream')
    except Exception as e:
        print(f"CRITICAL: Unknown error occurred when creating an sse connection: {str(e)}", flush=True)
        return jsonify({
            "status":"error",
            "message":f"Unknown error occurred when creating an sse connection: {str(e)}"
        }), 500

def push_to_org(orgID, data):
    """Publishes data to a specific organization's Redis channel."""
    try:
        channel_name = f"org:{orgID}"
        print(f"DEBUG: [PUSH] Publishing to channel {channel_name} | Data keys: {list(data.keys()) if isinstance(data, dict) else 'non-dict'}", flush=True)
        redisClient.publish(channel_name, json.dumps(data))
        return True
    except Exception as e:
        print(f"ERROR: [PUSH] Failed for org {orgID}: {str(e)}", flush=True)
        return False

@dispatcher.route('/publish-test/<string:orgID>', methods=['POST'])
def publish(orgID: str):
    try:
        message_data = request.get_json()
        if push_to_org(orgID, message_data):
            return jsonify({"status": "success", "message": "Event published successfully"}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to publish event to Redis"}), 500
    except Exception as e:
        print(f"Unknown error occured in publish route: {str(e)}", flush=True)
        return jsonify({
            "status":"error",
            "message":f"Unknown error occured in publish route: {str(e)}"
        }), 500
