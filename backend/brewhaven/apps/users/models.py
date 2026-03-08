# Users stored directly in MongoDB via PyMongo. No Django ORM model.
# Collection: db.users
# Schema:
#   _id        : ObjectId
#   name       : str
#   email      : str (unique, lowercase)
#   password   : str (bcrypt hash)
#   role       : str  (customer | admin)
#   created_at : datetime
