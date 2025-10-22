import requests

BASE_URL = "http://localhost:5001"
AUTH_CREDENTIALS = {"email": "admin@test.com", "password": "123456"}
TIMEOUT = 30

def test_user_profile_view_and_edit():
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    # Step 0: Authenticate via JWT by calling /auth/login
    login_url = f"{BASE_URL}/auth/login"
    try:
        login_response = requests.post(login_url, headers=headers, json=AUTH_CREDENTIALS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"POST auth login request failed: {e}"

    assert login_response.status_code == 200, f"Expected 200 OK on login, got {login_response.status_code}"
    login_data = login_response.json()
    assert "token" in login_data, "Login response missing 'token'"
    token = login_data["token"]

    auth_headers = headers.copy()
    auth_headers["Authorization"] = f"Bearer {token}"

    # Step 1: View user profile
    profile_url = f"{BASE_URL}/users/profile"
    try:
        response = requests.get(profile_url, headers=auth_headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"GET user profile request failed: {e}"

    assert response.status_code == 200, f"Expected 200 OK on profile GET, got {response.status_code}"
    profile_data = response.json()
    assert "name" in profile_data, "Profile response missing 'name'"
    assert "email" in profile_data, "Profile response missing 'email'"
    assert "phone" in profile_data, "Profile response missing 'phone'"
    assert "profileImage" in profile_data, "Profile response missing 'profileImage'"

    original_profile = profile_data.copy()

    # Step 2: Update user profile (change name, phone, email and profile image URL)
    update_url = f"{BASE_URL}/users/profile"
    updated_profile_payload = {
        "name": "Updated Admin Name",
        "phone": "+901234567890",
        "email": "admin_updated@test.com",
        "profileImage": "http://example.com/images/profileadmin_updated.jpg"
    }
    try:
        update_response = requests.put(update_url, headers=auth_headers, json=updated_profile_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"PUT user profile request failed: {e}"

    assert update_response.status_code == 200, f"Expected 200 OK on profile PUT, got {update_response.status_code}"
    updated_data = update_response.json()
    # Check that returned updated data matches the sent data
    for key in updated_profile_payload:
        assert updated_data.get(key) == updated_profile_payload[key], f"Mismatch in updated {key}"

    # Step 3: Verify the profile is actually updated by GET again
    try:
        verify_response = requests.get(profile_url, headers=auth_headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"GET user profile (verify) request failed: {e}"

    assert verify_response.status_code == 200, f"Expected 200 OK on profile GET verify, got {verify_response.status_code}"
    verify_data = verify_response.json()
    for key in updated_profile_payload:
        assert verify_data.get(key) == updated_profile_payload[key], f"Verification failed, {key} is not updated"

    # Step 4: Revert profile changes to original to keep state consistent
    try:
        revert_response = requests.put(update_url, headers=auth_headers, json=original_profile, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"PUT user profile revert request failed: {e}"

    assert revert_response.status_code == 200, f"Expected 200 OK on profile revert PUT, got {revert_response.status_code}"
    reverted_data = revert_response.json()
    for key in original_profile:
        assert reverted_data.get(key) == original_profile[key], f"Mismatch in reverted {key}"

test_user_profile_view_and_edit()
