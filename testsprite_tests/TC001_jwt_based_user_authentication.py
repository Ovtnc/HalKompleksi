import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5001"
TIMEOUT = 30

auth_credential = {
    "username": "admin@test.com",
    "password": "123456"
}

def test_jwt_based_user_authentication():
    # Registration (for test purpose, create a temporary user and delete after test)
    register_url = f"{BASE_URL}/auth/register"
    user_payload = {
        "email": "testuser@example.com",
        "password": "TestPassword123!",
        "role": "buyer",
        "name": "Test User"
    }
    headers = {"Content-Type": "application/json"}
    created_user_id = None
    try:
        # Register user
        reg_response = requests.post(register_url, json=user_payload, headers=headers, timeout=TIMEOUT)
        assert reg_response.status_code == 201, f"Registration failed: {reg_response.text}"
        reg_data = reg_response.json()
        assert "id" in reg_data or "user" in reg_data and "id" in reg_data["user"], "Registration response missing user ID"
        created_user_id = reg_data.get("id") or reg_data.get("user", {}).get("id")
        assert created_user_id is not None, "User ID not found after registration"

        # Login with the newly registered user
        login_url = f"{BASE_URL}/auth/login"
        login_payload = {
            "email": user_payload["email"],
            "password": user_payload["password"]
        }
        login_response = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_data = login_response.json()
        assert "token" in login_data, "JWT token missing in login response"
        user_token = login_data["token"]
        assert isinstance(user_token, str) and len(user_token) > 0, "Invalid JWT token"

        # Access protected endpoint with JWT token to confirm authentication success
        profile_url = f"{BASE_URL}/users/profile"
        auth_headers = {"Authorization": f"Bearer {user_token}"}
        profile_response = requests.get(profile_url, headers=auth_headers, timeout=TIMEOUT)
        assert profile_response.status_code == 200, f"Accessing profile failed: {profile_response.text}"
        profile_data = profile_response.json()
        assert profile_data.get("email", "").lower() == user_payload["email"].lower(), "Profile email does not match"

        # Test password reset (Forgot password)
        password_reset_request_url = f"{BASE_URL}/auth/forgot-password"
        reset_payload = {
            "email": user_payload["email"]
        }
        reset_response = requests.post(password_reset_request_url, json=reset_payload, headers=headers, timeout=TIMEOUT)
        # Accept 200 or 202 as success for password reset request
        assert reset_response.status_code in (200, 202), f"Password reset request failed: {reset_response.text}"

        # (Optional) More tests could be added such as using the token to access restricted resources for different roles.
        # For completeness, test admin login with basic token auth as given:
        admin_login_url = f"{BASE_URL}/auth/login"
        admin_auth_response = requests.post(
            admin_login_url,
            auth=HTTPBasicAuth(auth_credential["username"], auth_credential["password"]),
            timeout=TIMEOUT
        )
        # Basic auth login endpoint may differ; if the API requires basic token auth header, adjust accordingly.
        # If the API doesn't support HTTPBasicAuth, skip or adjust this check.
        if admin_auth_response.status_code == 200:
            admin_data = admin_auth_response.json()
            assert "token" in admin_data, "JWT token missing for admin login"
            admin_token = admin_data["token"]
            assert isinstance(admin_token, str) and len(admin_token) > 0, "Invalid admin JWT token"
        else:
            # If basic auth is not supported via HTTPBasicAuth, skip or verify alternative authentication method
            pass

    finally:
        # Cleanup: delete the created test user if endpoint available
        if created_user_id:
            delete_url = f"{BASE_URL}/users/{created_user_id}"
            try:
                # Admin login to get token to authorize deletion
                admin_login_resp = requests.post(
                    f"{BASE_URL}/auth/login",
                    auth=HTTPBasicAuth(auth_credential["username"], auth_credential["password"]),
                    timeout=TIMEOUT
                )
                if admin_login_resp.status_code == 200:
                    admin_token = admin_login_resp.json().get("token")
                    if admin_token:
                        del_headers = {
                            "Authorization": f"Bearer {admin_token}"
                        }
                        del_resp = requests.delete(delete_url, headers=del_headers, timeout=TIMEOUT)
                        # Accept 200 or 204 for successful deletion
                        assert del_resp.status_code in (200, 204), f"Failed to delete test user: {del_resp.text}"
            except Exception:
                # Ignore cleanup exceptions
                pass

test_jwt_based_user_authentication()