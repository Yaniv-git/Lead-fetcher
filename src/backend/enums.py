from enum import Enum
from os import path


class STATUS(Enum):
    SUCCESS = "success"
    ERROR = "error"
    LOADING = "loading"

class CONFIG(Enum):
    RESULT_FILE_NAME = "result.json"
    DOWNLOADED_PACKAGES_PATH = "downloaded_packages"
    NPM_DOWNLOADED_PACKAGES_PATH = path.join(DOWNLOADED_PACKAGES_PATH, "npm")
    FILE_SIZE_READ_LIMIT = 150000 #bytes
    LICENSE_FILE_NAME = "licenses.md"

class MIMETYPE(Enum):
    JSON = 'application/json'
    HTML = 'text/html'
    RAW = 'text/plain'