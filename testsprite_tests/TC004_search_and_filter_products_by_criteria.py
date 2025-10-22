import requests

BASE_URL = "http://localhost:5001"
JWT_TOKEN = "your_jwt_token_here"  # Replace with a valid JWT token for the test
TIMEOUT = 30

def test_search_and_filter_products_by_criteria():
    """
    Validate the product search and filtering API to ensure it returns correct results
    based on name, category, location, and price range.
    """
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {JWT_TOKEN}"
    }

    # Define search and filter criteria to test
    test_filters = {
        "name": "apple",
        "category": "fruits",
        "location": "Istanbul",
        "min_price": 5,
        "max_price": 50
    }

    # Construct query parameters for filtering
    params = {
        "name": test_filters["name"],
        "category": test_filters["category"],
        "location": test_filters["location"],
        "minPrice": test_filters["min_price"],
        "maxPrice": test_filters["max_price"]
    }

    try:
        response = requests.get(
            f"{BASE_URL}/products/search",
            headers=headers,
            params=params,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Response JSON should be a list of products"

        # Validate each returned product matches the filter criteria
        for product in data:
            # Check name contains search term case-insensitive
            assert test_filters["name"].lower() in product.get("name", "").lower(), \
                f"Product name '{product.get('name')}' does not contain '{test_filters['name']}'"
            # Check category matches filter (case-insensitive)
            assert product.get("category", "").lower() == test_filters["category"].lower(), \
                f"Product category '{product.get('category')}' does not match '{test_filters['category']}'"
            # Check location matches filter (case-insensitive)
            assert product.get("location", "").lower() == test_filters["location"].lower(), \
                f"Product location '{product.get('location')}' does not match '{test_filters['location']}'"
            # Check price within range
            price = product.get("price")
            assert price is not None, "Product price is missing"
            assert test_filters["min_price"] <= price <= test_filters["max_price"], \
                f"Product price {price} not within range {test_filters['min_price']} - {test_filters['max_price']}"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError:
        assert False, "Response content is not valid JSON"


test_search_and_filter_products_by_criteria()
