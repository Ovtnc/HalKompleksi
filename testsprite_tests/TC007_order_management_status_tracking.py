import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5001"
AUTH = HTTPBasicAuth("admin@test.com", "123456")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_order_management_status_tracking():
    order_id = None
    try:
        # 1. Create an order
        order_payload = {
            "buyerId": "buyer123",
            "items": [
                {
                    "productId": "product123",
                    "quantity": 2,
                    "price": 100
                }
            ],
            "totalPrice": 200,
            "deliveryAddress": "123 Test St, Test City",
            "status": "created"
        }
        create_response = requests.post(
            f"{BASE_URL}/orders",
            json=order_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert create_response.status_code == 201, f"Order creation failed: {create_response.text}"
        created_order = create_response.json()
        assert "id" in created_order, "Created order response missing 'id'"
        order_id = created_order["id"]

        # 2. Update order status: 'processing'
        status_update_payload = {"status": "processing"}
        update_status_response = requests.put(
            f"{BASE_URL}/orders/{order_id}/status",
            json=status_update_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert update_status_response.status_code == 200, f"Status update to 'processing' failed: {update_status_response.text}"
        updated_order_status = update_status_response.json()
        assert updated_order_status.get("status") == "processing", "Order status not updated to 'processing'"

        # 3. Update order status: 'shipped'
        status_update_payload["status"] = "shipped"
        update_status_response = requests.put(
            f"{BASE_URL}/orders/{order_id}/status",
            json=status_update_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert update_status_response.status_code == 200, f"Status update to 'shipped' failed: {update_status_response.text}"
        updated_order_status = update_status_response.json()
        assert updated_order_status.get("status") == "shipped", "Order status not updated to 'shipped'"

        # 4. Add delivery info
        delivery_info_payload = {
            "deliveryDate": "2025-12-01T10:00:00Z",
            "courier": "FastDelivery",
            "trackingNumber": "TRACK123456789"
        }
        add_delivery_response = requests.put(
            f"{BASE_URL}/orders/{order_id}/delivery-info",
            json=delivery_info_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert add_delivery_response.status_code == 200, f"Adding delivery info failed: {add_delivery_response.text}"
        delivery_info = add_delivery_response.json()
        assert delivery_info.get("deliveryDate") == delivery_info_payload["deliveryDate"], "Delivery date mismatch"
        assert delivery_info.get("courier") == delivery_info_payload["courier"], "Courier info mismatch"
        assert delivery_info.get("trackingNumber") == delivery_info_payload["trackingNumber"], "Tracking number mismatch"

        # 5. Retrieve order to verify all updates
        get_order_response = requests.get(
            f"{BASE_URL}/orders/{order_id}",
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert get_order_response.status_code == 200, f"Failed to get order details: {get_order_response.text}"
        order_details = get_order_response.json()
        assert order_details.get("status") == "shipped", "Final order status mismatch"
        delivery = order_details.get("deliveryInfo") or order_details.get("delivery_info")
        assert delivery is not None, "Delivery info missing in order details"
        assert delivery.get("trackingNumber") == delivery_info_payload["trackingNumber"], "Tracking number mismatch in order details"

    finally:
        if order_id:
            # Clean up: Delete the created order
            try:
                delete_response = requests.delete(
                    f"{BASE_URL}/orders/{order_id}",
                    headers=HEADERS,
                    auth=AUTH,
                    timeout=TIMEOUT,
                )
                assert delete_response.status_code in [200, 204], f"Failed to delete order during cleanup: {delete_response.text}"
            except Exception as e:
                # Log or handle cleanup failure if necessary
                pass


test_order_management_status_tracking()