# Orders stored directly in MongoDB via PyMongo.
# Collection: db.orders
# Schema:
#   _id            : ObjectId
#   reference      : str  (e.g. BH-A3F2C1)
#   customer_id    : int  (Django User.id)
#   customer_name  : str
#   customer_email : str
#   status         : str  (pending|preparing|ready|completed|cancelled)
#   payment_method : str  (card|gcash|maya|cash)
#   total_amount   : float
#   notes          : str
#   items          : list of {product_id, product_name, product_emoji, unit_price, quantity, subtotal}
#   created_at     : datetime
#   updated_at     : datetime
