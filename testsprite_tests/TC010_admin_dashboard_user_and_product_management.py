import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5001"
AUTH = HTTPBasicAuth("admin@test.com", "123456")
TIMEOUT = 30

def test_admin_dashboard_user_and_product_management():
    headers = {"Accept": "application/json"}

    # 1. Get list of users (Admin user management)
    try:
        resp_users = requests.get(f"{BASE_URL}/admin/users", auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert resp_users.status_code == 200, f"Get users failed with status {resp_users.status_code}"
        users = resp_users.json()
        assert isinstance(users, list), "Users response is not a list"

    except Exception as e:
        assert False, f"Exception during get users: {e}"

    # 2. Create a test product for approval testing (simulate product pending approval)
    product_payload = {
        "name": "Test Product Admin Approve",
        "description": "Test Description",
        "price": 100,
        "category": "Test Category",
        "location": "Test Location",
        "media": []  # Assuming empty media list acceptable for create
    }
    product_id = None
    try:
        create_product_resp = requests.post(f"{BASE_URL}/products", auth=AUTH, json=product_payload, headers=headers, timeout=TIMEOUT)
        assert create_product_resp.status_code in (200, 201), f"Product creation failed: {create_product_resp.status_code}"
        created_product = create_product_resp.json()
        product_id = created_product.get("id") or created_product.get("_id")
        assert product_id, "Created product missing id"

        # 3. List pending products (Admin product approval)
        pending_resp = requests.get(f"{BASE_URL}/admin/products/pending", auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert pending_resp.status_code == 200, f"Pending products fetch failed: {pending_resp.status_code}"
        pending_products = pending_resp.json()
        assert isinstance(pending_products, list), "Pending products response not a list"
        assert any(p.get("id") == product_id or p.get("_id") == product_id for p in pending_products), "Created product not in pending list"

        # 4. Approve the created product
        approve_resp = requests.put(f"{BASE_URL}/admin/products/{product_id}/approve", auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert approve_resp.status_code == 200, f"Product approval failed with status {approve_resp.status_code}"
        approve_data = approve_resp.json()
        assert approve_data.get("approved") is True or approve_data.get("status") == "approved", "Product not marked as approved"

        # 5. Get system statistics (Admin dashboard monitoring)
        stats_resp = requests.get(f"{BASE_URL}/admin/statistics", auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert stats_resp.status_code == 200, f"Get statistics failed: {stats_resp.status_code}"
        statistics = stats_resp.json()
        assert isinstance(statistics, dict), "Statistics response is not a dict"
        # Check some expected fields might exist in statistics
        expected_keys = ["totalUsers", "totalProducts", "pendingApprovals", "systemHealth"]
        for key in expected_keys:
            assert key in statistics, f"Statistics missing expected key: {key}"

    finally:
        # Cleanup: delete the created product if created
        if product_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/products/{product_id}", auth=AUTH, headers=headers, timeout=TIMEOUT)
                assert del_resp.status_code in (200, 204), f"Product cleanup deletion failed: {del_resp.status_code}"
            except Exception:
                pass

test_admin_dashboard_user_and_product_management()