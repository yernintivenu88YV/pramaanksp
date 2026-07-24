import zcatalyst_sdk
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup():
    try:
        # Initialize without request context; assumes .catalystrc exists from CLI login
        app = zcatalyst_sdk.initialize()
        zcql = app.zcql()
        
        # Check if table exists
        logger.info("Checking if PoliceFaceDataset table exists...")
        try:
            zcql.execute_query("SELECT ROWID FROM PoliceFaceDataset LIMIT 1")
            logger.info("Table already exists.")
        except Exception:
            # Table doesn't exist, need to create it
            # ZCQL doesn't support CREATE TABLE dynamically from SDK in all versions,
            # but we can try. Wait, Catalyst Data Store requires tables to be created via Console.
            # Does the Python SDK support creating tables?
            # No, standard Zoho Catalyst Data Store does not allow DDL (CREATE TABLE) via SDK.
            # Wait, if DDL is not allowed, how do I create the table without console?
            # Actually, `catalyst setup` or `catalyst deploy` does not create tables.
            # I must tell the user to create the table in the console!
            logger.warning("Table might not exist. If you get errors, please create 'PoliceFaceDataset' in Catalyst Data Store.")
            pass
            
    except Exception as e:
        logger.error(f"Setup failed: {e}")

if __name__ == "__main__":
    setup()
