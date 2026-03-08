from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    name      = serializers.CharField(max_length=150)
    email     = serializers.EmailField()
    password  = serializers.CharField(min_length=6, write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.Serializer):
    id         = serializers.CharField()
    name       = serializers.CharField()
    email      = serializers.EmailField()
    role       = serializers.CharField()
    created_at = serializers.DateTimeField()
