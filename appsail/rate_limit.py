"""
rate_limit.py

Single shared SlowAPI limiter instance. It lives in its own module so both
app.py (which registers it on app.state and wires the 429 handler) and the
individual routers (which decorate their own endpoints) can import the SAME
limiter without a circular import.

This is the fix for the dead-code rate limiter: previously the limits were
declared on duplicate @app.post registrations that were shadowed by the
routers' own handlers (routers are included first, first match wins), so
they never fired. Now the limit decorates the real router endpoint, so it
is the one and only registration for that path.

(headers_enabled is left off: slowapi's X-RateLimit-* injection requires
every limited handler to take a `response: Response` param, which these
dict-returning endpoints don't; the burst test proves the limit fires by
exceeding it and asserting a 429 instead.)
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
