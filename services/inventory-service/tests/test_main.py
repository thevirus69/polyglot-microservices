import unittest
import sys
import os

# Add src to path for direct test execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from fastapi.testclient import TestClient
from main import app

class TestInventoryService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "UP")
        self.assertEqual(data["service"], "inventory-service")
        self.assertIn("Python", data["runtime"])

    def test_get_existing_item(self):
        response = self.client.get("/inventory/ITEM-101")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["itemId"], "ITEM-101")
        self.assertEqual(data["name"], "Mechanical Keyboard")
        self.assertGreater(data["stock"], 0)

    def test_get_nonexistent_item(self):
        response = self.client.get("/inventory/DOES-NOT-EXIST")
        self.assertEqual(response.status_code, 404)

    def test_reserve_insufficient_stock(self):
        response = self.client.post(
            "/inventory/reserve",
            json={"item_id": "ITEM-101", "quantity": 9999}
        )
        self.assertEqual(response.status_code, 409)

if __name__ == "__main__":
    unittest.main()

