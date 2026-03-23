from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize the rate limiter
# By default, uses IP address as the key
limiter = Limiter(key_func=get_remote_address)

# Default rate limit configuration
DEFAULT_RATE_LIMIT = "60/minute"
SCRAPING_RATE_LIMIT = "5/minute"
AUTH_RATE_LIMIT = "10/minute"
