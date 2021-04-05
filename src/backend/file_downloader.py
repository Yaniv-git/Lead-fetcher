import shutil
import requests
from enums import *
import json

class FileDownloader():


    def download_file(url, path):
        with requests.get(url, stream=True) as res:
            with open(path, 'wb') as f:
                shutil.copyfileobj(res.raw, f)

    def extract_file(file_path):
        extracted_path = ".".join(file_path.split(".")[:-1])
        shutil.unpack_archive(file_path, extracted_path)
        return extracted_path