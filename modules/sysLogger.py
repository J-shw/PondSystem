import logging
from logging.handlers import RotatingFileHandler

# Configure a rotating file handler
handler = RotatingFileHandler(
    filename='static/data/crashLogs/log.txt',
    mode='a',
    maxBytes=31457280,  # Set the maximum size of each log file in bytes
    backupCount=5   # Number of backup log files to keep
)

# Configure the logging format and level for the handler
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(filename)s - %(funcName)s() - Line %(lineno)d - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
handler.setFormatter(formatter)

# Create a logger and add the handler
logger = logging.getLogger(__name__)
logger.addHandler(handler)
logger.setLevel(logging.ERROR)

# Logger level options:
# DEBUG
# INFO
# WARNING
# ERRRO
# CRITICAL

# Example uses:
# logger.debug("This is just a harmless debug message") 
# logger.info("This is just an information for you") 
# logger.warning("OOPS!!!Its a Warning") 
# logger.error("Have you tried to divide a number by zero") 
# logger.critical("The Internet is not working....")