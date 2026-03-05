# Products are stored directly in MongoDB via PyMongo.
# No Django ORM model needed here.
# Collection: db.products
# Schema:
#   _id        : ObjectId (auto)
#   name       : str
#   category   : str  (espresso|cold|tea|frappe|pastry|snacks)
#   price      : float
#   description: str
#   emoji      : str
#   badge      : str|null  (bestseller|new|popular|seasonal|healthy)
#   available  : bool
#   featured   : bool
#   created_at : datetime
#   updated_at : datetime
