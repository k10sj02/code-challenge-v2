from rest_framework import serializers

from map.models import CommunityArea, RestaurantPermit


class CommunityAreaSerializer(serializers.ModelSerializer):
    num_permits = serializers.SerializerMethodField()

    class Meta:
        model = CommunityArea
        fields = ["name", "num_permits"]
    
    def get_num_permits(self, obj):
        # NOTE: RestaurantPermit does not use a ForeignKey to CommunityArea.
        # We manually match using community_area_id (string) and area_id (int).
        request = self.context.get("request")
        year = request.query_params.get("year") if request else None

        permits = RestaurantPermit.objects.filter(
            community_area_id=str(obj.area_id)
        )

        if year:
            permits = permits.filter(issue_date__year=int(year))

        return permits.count()