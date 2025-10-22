import requests
import time

BASE_URL = "http://localhost:5001"
AUTH_USERNAME = "admin@test.com"
AUTH_PASSWORD = "123456"
TIMEOUT = 30

def get_jwt_token(username, password):
    login_url = f"{BASE_URL}/auth/login"
    payload = {
        "email": username,
        "password": password
    }
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    response = requests.post(login_url, json=payload, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Login failed with status code {response.status_code}"
    data = response.json()
    assert "token" in data, "Login response missing token"
    return data["token"]

def test_TC008_product_request_creation_and_notification():
    token = get_jwt_token(AUTH_USERNAME, AUTH_PASSWORD)
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    product_request_url = f"{BASE_URL}/product-requests"
    notifications_url = f"{BASE_URL}/notifications"

    # Create a sample product request payload
    product_request_payload = {
        "productName": "Test Product XYZ",
        "quantity": 10,
        "description": "Requesting 10 units of Test Product XYZ with specifications.",
        "buyerId": None,  # will fetch from auth info if possible
        "preferredPrice": 100.0
    }

    try:
        response_create = requests.post(
            product_request_url,
            json=product_request_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_create.status_code == 201, f"Expected 201 Created, got {response_create.status_code}"
        product_request = response_create.json()
        assert "id" in product_request or "_id" in product_request, "Response must contain product request ID"

        request_id = product_request.get("id") or product_request.get("_id")
        assert request_id, "Created product request must have an ID"

        max_attempts = 6
        found_notification = False
        for _ in range(max_attempts):
            resp_notifications = requests.get(
                notifications_url,
                headers=headers,
                timeout=TIMEOUT
            )
            if resp_notifications.status_code != 200:
                time.sleep(1)
                continue
            notifications = resp_notifications.json()
            if isinstance(notifications, dict) and "notifications" in notifications:
                notifications_list = notifications["notifications"]
            elif isinstance(notifications, list):
                notifications_list = notifications
            else:
                notifications_list = []

            for notification in notifications_list:
                if (
                    ("productRequestId" in notification and notification["productRequestId"] == request_id)
                    or ("title" in notification and "product request" in notification["title"].lower())
                    or ("message" in notification and product_request_payload["productName"].lower() in notification["message"].lower())
                ):
                    found_notification = True
                    break

            if found_notification:
                break
            time.sleep(2)

        assert found_notification, "Notification for product request was not found or delivered in time"

    finally:
        if 'request_id' in locals() and request_id:
            try:
                resp_delete = requests.delete(
                    f"{product_request_url}/{request_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                assert resp_delete.status_code in [200, 204], f"Failed to delete product request with id {request_id}"
            except Exception:
                pass

test_TC008_product_request_creation_and_notification()
