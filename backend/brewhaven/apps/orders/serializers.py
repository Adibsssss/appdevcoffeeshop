from rest_framework import serializers


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.CharField()   # MongoDB ObjectId string
    quantity   = serializers.IntegerField(min_value=1, max_value=50)


class PlaceOrderSerializer(serializers.Serializer):
    items          = OrderItemInputSerializer(many=True, min_length=1)
    payment_method = serializers.ChoiceField(choices=["card","gcash","maya","cash"])
    notes          = serializers.CharField(required=False, allow_blank=True, default="")
