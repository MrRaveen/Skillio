from flask import Blueprint, request, jsonify, Response
from app.redis_utils import getRedisClient
from app.decorators.token_required import token_required_employees
import json

dispatcherEm = Blueprint('dispatcherEm', __name__)

redisClient = getRedisClient()

def sse_event_stream(emID):
    """Subscribes to a user-specific Redis channel and yields SSE data."""
    pubsub = redisClient.pubsub()
    channel_name = f"em:{emID}"
    pubsub.subscribe(channel_name)
    
    # Send immediate heartbeat to flush headers and confirm connection
    yield "data: {\"status\": \"connected\", \"message\": \"SSE connection established\"}\n\n"
    
    try:
        # Listen blocks and waits for new messages
        for message in pubsub.listen():
            if message['type'] == 'message':
                raw_data = message['data']
                # Decode bytes to string to prevent b'...' formatting
                data_str = raw_data.decode('utf-8') if isinstance(raw_data, bytes) else raw_data
                print(f"DEBUG: [SSE] Yielding data to Em {emID} | Channel: {channel_name} | Data: {data_str[:100]}...", flush=True)
                yield f"data: {data_str}\n\n"
            else:
                print(f"DEBUG: [SSE] Received non-message type {message['type']} for Em {emID}", flush=True)
    finally:
        pubsub.unsubscribe(channel_name)
        pubsub.close()

@dispatcherEm.route('/stream-em', methods=['GET'])
@token_required_employees
def stream(decorated_data):
    try:
        emID = decorated_data.get('id')
        print(f"DEBUG: New SSE connection request from em ID: {emID}", flush=True)
        response = Response(sse_event_stream(emID), mimetype='text/event-stream')
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['X-Accel-Buffering'] = 'no'
        response.headers['Connection'] = 'keep-alive'
        return response
    except Exception as e:
        print(f"CRITICAL: Unknown error occurred when creating an sse connection: {str(e)}", flush=True)
        return jsonify({
            "status":"error",
            "message":f"Unknown error occurred when creating an sse connection: {str(e)}"
        }), 500

def push_to_em(emID, data):
    """Publishes data to a specific employee's Redis channel."""
    try:
        channel_name = f"em:{emID}"
        print(f"DEBUG: [PUSH] Publishing to channel {channel_name} | Data keys: {list(data.keys()) if isinstance(data, dict) else 'non-dict'}", flush=True)
        redisClient.publish(channel_name, json.dumps(data))
        return True
    except Exception as e:
        print(f"ERROR: [PUSH] Failed for em {emID}: {str(e)}", flush=True)
        return False

@dispatcherEm.route('/publish-test-em/<string:emID>', methods=['POST'])
def publish(emID: str):
    try:
        message_data = request.get_json()
        if push_to_em(emID, message_data):
            return jsonify({"status": "success", "message": "Event published successfully"}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to publish event to Redis"}), 500
    except Exception as e:
        print(f"Unknown error occured in publish route: {str(e)}", flush=True)
        return jsonify({
            "status":"error",
            "message":f"Unknown error occured in publish route: {str(e)}"
        }), 500




