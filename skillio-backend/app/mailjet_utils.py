import os
from mailjet_rest import Client

mailjetClient = None

def getMailjetClient():
    global mailjetClient
    try:
        api_key = os.environ.get('MAILJET_API_KEY')
        api_secret = os.environ.get('MAILJET_SECRET')
        if not api_key or not api_secret:
                raise ValueError("Mailjet API credentials are missing from environment variables.")
        if not mailjetClient:
            mailjetClient = Client(auth=(api_key, api_secret), version='v3.1')    
        return mailjetClient
    except Exception as e:
        raise Exception(f'Error occurred when creating the mailjet client: {str(e)}')