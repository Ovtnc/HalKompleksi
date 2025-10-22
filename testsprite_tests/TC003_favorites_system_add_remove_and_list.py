import requests

BASE_URL = "http://localhost:5001"
JWT_TOKEN = "dummy_jwt_token_for_testing_purposes"
HEADERS = {"Content-Type": "application/json", "Authorization": f"Bearer {JWT_TOKEN}"}
TIMEOUT = 30

def test_favorites_system_add_remove_and_list():
    product_id = None
    favorite_added = False

    # Helper to create a product to use
    def create_product():
        url = f"{BASE_URL}/products"
        payload = {
            "name": "Test Product for Favorites",
            "description": "Test product created for favorites test case",
            "price": 10.5,
            "category": "cat123",
            "location": "loc123",
            "stock": 100
        }
        r = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        return r.json().get("id") or r.json().get("_id")

    # Helper to delete the product created
    def delete_product(pid):
        url = f"{BASE_URL}/products/{pid}"
        r = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
        # Tolerate 404 or 204 as success on deletion
        if r.status_code not in (200, 204, 404):
            r.raise_for_status()

    # Helper to add product to favorites
    def add_to_favorites(pid):
        url = f"{BASE_URL}/favorites/{pid}"
        r = requests.post(url, headers=HEADERS, timeout=TIMEOUT)
        return r

    # Helper to remove product from favorites
    def remove_from_favorites(pid):
        url = f"{BASE_URL}/favorites/{pid}"
        r = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
        return r

    # Helper to get favorite products list
    def get_favorites():
        url = f"{BASE_URL}/favorites"
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        return r

    try:
        # Step 1: Create a product if none specified
        product_id = create_product()
        assert product_id is not None, "Failed to create product for favorites test"

        # Step 2: Add product to favorites
        resp = add_to_favorites(product_id)
        assert resp.status_code in (200, 201), f"Failed to add product {product_id} to favorites, status: {resp.status_code}"
        favorite_added = True

        # Step 3: Retrieve favorites list and verify product is present
        resp = get_favorites()
        assert resp.status_code == 200, f"Failed to get favorites list, status: {resp.status_code}"
        favorites_list = resp.json()
        assert isinstance(favorites_list, list), "Favorites response is not a list"
        assert any(str(fav.get("id") or fav.get("_id")) == str(product_id) for fav in favorites_list), "Added product not found in favorites list"

        # Step 4: Remove product from favorites
        resp = remove_from_favorites(product_id)
        assert resp.status_code in (200, 204), f"Failed to remove product {product_id} from favorites, status: {resp.status_code}"
        favorite_added = False

        # Step 5: Retrieve favorites list and verify product is NOT present
        resp = get_favorites()
        assert resp.status_code == 200, f"Failed to get favorites list after removal, status: {resp.status_code}"
        favorites_list = resp.json()
        assert not any(str(fav.get("id") or fav.get("_id")) == str(product_id) for fav in favorites_list), "Removed product still found in favorites list"

    finally:
        if product_id:
            if favorite_added:
                try:
                    remove_from_favorites(product_id)
                except Exception:
                    pass
            try:
                delete_product(product_id)
            except Exception:
                pass


test_favorites_system_add_remove_and_list()
