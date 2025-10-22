import requests
import base64
import io
from PIL import Image
import tempfile

BASE_URL = "http://localhost:5001"
AUTH_USERNAME = "admin@test.com"
AUTH_PASSWORD = "123456"
TIMEOUT = 30

def get_basic_auth_header(username, password):
    token = base64.b64encode(f"{username}:{password}".encode('utf-8')).decode('utf-8')
    return {"Authorization": f"Basic {token}"}

def test_market_reports_publishing_and_access():
    headers = get_basic_auth_header(AUTH_USERNAME, AUTH_PASSWORD)
    report_id = None

    # Create a temporary image file for upload
    with tempfile.NamedTemporaryFile(suffix=".png") as tmp_img:
        # Create a simple red image for testing
        img = Image.new('RGB', (100, 100), color = (255, 0, 0))
        img.save(tmp_img, format='PNG')
        tmp_img.seek(0)

        files = {
            'image': ('report_image.png', tmp_img, 'image/png')
        }

        # The API schema is not explicitly given for this endpoint, 
        # assuming endpoint POST /marketReports to create a report with fields: title, description, city, market, published (bool), and image upload
        data = {
            'title': 'Test Market Report',
            'description': 'This is a test market price report.',
            'city': 'TestCity',
            'market': 'TestMarket',
            'published': 'true'
        }

        try:
            # Create (Publish) market report (admin)
            create_resp = requests.post(
                f"{BASE_URL}/marketReports",
                headers=headers,
                data=data,
                files=files,
                timeout=TIMEOUT
            )
            assert create_resp.status_code == 201, f"Failed to create market report: {create_resp.text}"
            create_resp_json = create_resp.json()
            assert 'id' in create_resp_json or '_id' in create_resp_json, "Response missing report id"
            report_id = create_resp_json.get('id') or create_resp_json.get('_id')

            # Verify published report is accessible by user (no auth)
            get_resp = requests.get(
                f"{BASE_URL}/marketReports/{report_id}",
                timeout=TIMEOUT
            )
            assert get_resp.status_code == 200, f"Failed to access created market report as user: {get_resp.text}"
            report_data = get_resp.json()
            # Validate some fields
            assert report_data.get('title') == data['title'], "Report title mismatch"
            assert report_data.get('description') == data['description'], "Report description mismatch"
            assert report_data.get('city') == data['city'], "Report city mismatch"
            assert report_data.get('market') == data['market'], "Report market mismatch"
            assert report_data.get('published') is True or str(report_data.get('published')).lower() == 'true', "Report not published"

            # Verify image key presence in report data (assuming image url or path is returned)
            assert 'image' in report_data or 'images' in report_data or 'imageUrl' in report_data, "Report image missing in response"

            # Additional check: list reports publicly and ensure the created report appears
            list_resp = requests.get(f"{BASE_URL}/marketReports?published=true", timeout=TIMEOUT)
            assert list_resp.status_code == 200, "Failed to get published market reports list"
            list_data = list_resp.json()
            ids = [r.get('id') or r.get('_id') for r in list_data]
            assert report_id in ids, "Created market report not found in published reports list"

        finally:
            # Cleanup: delete the created market report using admin auth
            if report_id:
                del_resp = requests.delete(
                    f"{BASE_URL}/marketReports/{report_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                assert del_resp.status_code in (200, 204), f"Failed to delete market report in cleanup: {del_resp.text}"

test_market_reports_publishing_and_access()