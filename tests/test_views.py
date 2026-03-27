import pytest
from datetime import date

from django.shortcuts import reverse
from rest_framework.test import APIClient

from map.models import CommunityArea, RestaurantPermit

@pytest.mark.django_db
def test_map_data_view():
    # Create some test community areas
    area1 = CommunityArea.objects.create(name="Beverly", area_id=1)
    area2 = CommunityArea.objects.create(name="Lincoln Park", area_id=2)

    # Test permits for Beverly
    RestaurantPermit.objects.create(
        community_area_id=str(area1.area_id), issue_date=date(2021, 1, 15)
    )
    RestaurantPermit.objects.create(
        community_area_id=str(area1.area_id), issue_date=date(2021, 2, 20)
    )

    # Test permits for Lincoln Park
    RestaurantPermit.objects.create(
        community_area_id=str(area2.area_id), issue_date=date(2021, 3, 10)
    )
    RestaurantPermit.objects.create(
        community_area_id=str(area2.area_id), issue_date=date(2021, 2, 14)
    )
    RestaurantPermit.objects.create(
        community_area_id=str(area2.area_id), issue_date=date(2021, 6, 22)
    )

    # Query the map data endpoint
    client = APIClient()
    response = client.get(f"{reverse('map_data')}?year=2021")

    assert response.status_code == 200

    data = response.json()

    # Convert list to dict keyed by name
    by_name = {item["name"]: item for item in data}

    # Assertions
    assert by_name["Beverly"]["num_permits"] == 2
    assert by_name["Lincoln Park"]["num_permits"] == 3