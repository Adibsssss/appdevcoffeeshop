from rest_framework import serializers


class ProductSerializer(serializers.Serializer):
    id          = serializers.CharField(read_only=True)
    name        = serializers.CharField(max_length=200)
    category    = serializers.ChoiceField(choices=["espresso","cold","tea","frappe","pastry","snacks"])
    price       = serializers.FloatField(min_value=0.01)
    description = serializers.CharField()
    emoji       = serializers.CharField(max_length=10, default="☕")
    badge       = serializers.ChoiceField(
        choices=["bestseller","new","popular","seasonal","healthy",""],
        allow_null=True, required=False, default=None
    )
    available   = serializers.BooleanField(default=True)
    featured    = serializers.BooleanField(default=False)
    created_at  = serializers.DateTimeField(read_only=True)
    updated_at  = serializers.DateTimeField(read_only=True)

    def validate_badge(self, value):
        if value == "":
            return None
        return value
