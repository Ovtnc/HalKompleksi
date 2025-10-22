import requests

BASE_URL = "http://localhost:5001"
TIMEOUT = 30

# Provide a dummy JWT token for testing, must be a valid token for real test
auth_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_payload.dummy_signature"
HEADERS = {
    "Authorization": f"Bearer {auth_token}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def test_product_crud_operations_with_media_and_location_filtering():
    product_id = None
    try:
        # 1. Create a new product with multiple images and videos, including location info
        create_payload = {
            "name": "Test Product Media",
            "description": "A product with multiple images and videos for testing.",
            "price": 49.99,
            "categoryId": "TestCategoryId",
            "location": {
                "city": "TestCity",
                "market": "TestMarket"
            },
            "images": [
                "http://example.com/image1.jpg",
                "http://example.com/image2.jpg"
            ],
            "videos": [
                "http://example.com/video1.mp4"
            ],
            "stock": 10
        }
        create_resp = requests.post(
            f"{BASE_URL}/products",
            headers=HEADERS,
            json=create_payload,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Product creation failed: {create_resp.text}"
        created_product = create_resp.json()
        product_id = created_product.get("id") or created_product.get("_id")
        assert product_id is not None, "Created product response missing id"

        # 2. Read/Get the product by ID and validate the data including media and location
        get_resp = requests.get(
            f"{BASE_URL}/products/{product_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Get product failed: {get_resp.text}"
        product_data = get_resp.json()
        assert product_data["name"] == create_payload["name"], "Product name mismatch"
        assert product_data["description"] == create_payload["description"], "Product description mismatch"
        assert product_data["price"] == create_payload["price"], "Product price mismatch"
        assert product_data.get("location", {}) == create_payload["location"], "Product location mismatch"
        assert isinstance(product_data.get("images", []), list) and len(product_data["images"]) == 2, "Product images mismatch"
        assert isinstance(product_data.get("videos", []), list) and len(product_data["videos"]) == 1, "Product videos mismatch"

        # 3. Update the product: change description, add one more image and video, update location
        update_payload = {
            "description": "Updated description with additional media.",
            "images": product_data["images"] + ["http://example.com/image3.jpg"],
            "videos": product_data["videos"] + ["http://example.com/video2.mp4"],
            "location": {
                "city": "UpdatedCity",
                "market": "UpdatedMarket"
            },
            "stock": 15
        }
        update_resp = requests.put(
            f"{BASE_URL}/products/{product_id}",
            headers=HEADERS,
            json=update_payload,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Update product failed: {update_resp.text}"
        updated_product = update_resp.json()
        assert updated_product["description"] == update_payload["description"], "Product description not updated"
        assert len(updated_product.get("images", [])) == 3, "Product images not updated correctly"
        assert len(updated_product.get("videos", [])) == 2, "Product videos not updated correctly"
        assert updated_product.get("location", {}) == update_payload["location"], "Product location not updated"
        assert updated_product["stock"] == update_payload["stock"], "Product stock not updated"

        # 4. Filter products by location to find the updated product
        filter_params = {
            "city": update_payload["location"]["city"],
            "market": update_payload["location"]["market"]
        }
        filter_resp = requests.get(
            f"{BASE_URL}/products",
            headers=HEADERS,
            params=filter_params,
            timeout=TIMEOUT
        )
        assert filter_resp.status_code == 200, f"Filtering products by location failed: {filter_resp.text}"
        filtered_products = filter_resp.json()
        assert any(prod.get("id") == product_id or prod.get("_id") == product_id for prod in filtered_products), "Filtered product not found by location"

    finally:
        # 5. Cleanup/Delete the created product
        if product_id is not None:
            delete_resp = requests.delete(
                f"{BASE_URL}/products/{product_id}",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            assert delete_resp.status_code in [200, 204], f"Product delete failed: {delete_resp.text}"

test_product_crud_operations_with_media_and_location_filtering()
