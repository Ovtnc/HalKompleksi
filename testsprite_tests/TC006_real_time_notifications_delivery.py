import requests
import time

BASE_URL = "http://localhost:5001"
AUTH_CREDENTIALS = ("admin@test.com", "123456")
TIMEOUT = 30

def test_real_time_notifications_delivery():
    # Authenticate and get token
    auth_url = f"{BASE_URL}/auth/login"
    auth_response = requests.post(auth_url, json={
        "email": AUTH_CREDENTIALS[0],
        "password": AUTH_CREDENTIALS[1]
    }, timeout=TIMEOUT)
    assert auth_response.status_code == 200, f"Login failed with status {auth_response.status_code}"
    auth_data = auth_response.json()
    assert "token" in auth_data and auth_data["token"], "Token not found in login response"
    token = auth_data["token"]

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Create a product request to trigger notification for product requests
    product_request_payload = {
        "productName": "Test Notification Product",
        "quantity": 10,
        "details": "Requesting test product for notification delivery test"
    }
    pr_response = requests.post(f"{BASE_URL}/product-requests", headers=headers, json=product_request_payload, timeout=TIMEOUT)
    assert pr_response.status_code == 201, f"Product request creation failed with status {pr_response.status_code}"
    product_request = pr_response.json()
    product_request_id = product_request.get("id") or product_request.get("_id")
    assert product_request_id, "Product request ID missing after creation"

    # Create an order to trigger notification for orders
    # For creating an order, we need a product. Create a test product first.
    product_payload = {
        "name": "Notification Test Product",
        "category": "Test Category",
        "price": 100,
        "stock": 50,
        "location": "Test Location",
        "description": "Test product for notifications"
    }
    product_response = requests.post(f"{BASE_URL}/products", headers=headers, json=product_payload, timeout=TIMEOUT)
    assert product_response.status_code == 201, f"Product creation failed with status {product_response.status_code}"
    product = product_response.json()
    product_id = product.get("id") or product.get("_id")
    assert product_id, "Product ID missing after creation"

    try:
        order_payload = {
            "productId": product_id,
            "quantity": 5,
            "address": "123 Test Address",
            "phone": "1234567890"
        }
        order_response = requests.post(f"{BASE_URL}/orders", headers=headers, json=order_payload, timeout=TIMEOUT)
        assert order_response.status_code == 201, f"Order creation failed with status {order_response.status_code}"
        order = order_response.json()
        order_id = order.get("id") or order.get("_id")
        assert order_id, "Order ID missing after creation"

        # Trigger a system update notification (simulate by creating a system notification)
        sys_notification_payload = {
            "title": "System Update Test",
            "message": "This is a test system update notification.",
            "type": "system"
        }
        sys_notif_response = requests.post(f"{BASE_URL}/notifications/system", headers=headers, json=sys_notification_payload, timeout=TIMEOUT)
        assert sys_notif_response.status_code in (200,201), f"System notification creation failed with status {sys_notif_response.status_code}"

        # Wait a short moment to let notifications be processed if async
        time.sleep(2)

        # Retrieve notifications for the user
        notifications_response = requests.get(f"{BASE_URL}/notifications", headers=headers, timeout=TIMEOUT)
        assert notifications_response.status_code == 200, f"Failed to fetch notifications with status {notifications_response.status_code}"
        notifications = notifications_response.json()
        assert isinstance(notifications, list), "Notifications response is not a list"

        # Check that notifications for product request, order, and system update exist
        has_product_request_notif = any(
            n.get("type") == "product_request" and str(product_request_id) in str(n.get("relatedId", ""))
            for n in notifications
        )
        has_order_notif = any(
            n.get("type") == "order" and str(order_id) in str(n.get("relatedId", ""))
            for n in notifications
        )
        has_system_notif = any(
            n.get("type") == "system" and sys_notification_payload["title"] in n.get("title", "") 
            for n in notifications
        )

        assert has_product_request_notif, "No notification found for product request"
        assert has_order_notif, "No notification found for order"
        assert has_system_notif, "No notification found for system update"

    finally:
        # Cleanup: Delete created resources
        try:
            requests.delete(f"{BASE_URL}/product-requests/{product_request_id}", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass
        try:
            if 'order_id' in locals():
                requests.delete(f"{BASE_URL}/orders/{order_id}", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass
        try:
            requests.delete(f"{BASE_URL}/products/{product_id}", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass

test_real_time_notifications_delivery()