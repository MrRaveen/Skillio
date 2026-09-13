import redis

redisClient = None

def getRedisClient():
    global redisClient
    try:
        if not redisClient:
            redisClient = redis.Redis(
            host='localhost', 
            port=6379, 
            db=0, 
            decode_responses=True
            )
        return redisClient
    except Exception as e:
        raise Exception(f'Error occured when creating redis client: {str(e)}')