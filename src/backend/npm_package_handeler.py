import json
from enums import *
from file_downloader import FileDownloader
from os import path
import requests

class NpmPackageHandler():

    @staticmethod
    def convert_latest_to_version(pacakge_name):
        response = requests.get(f"https://registry.npmjs.org/{pacakge_name}/latest").json()
        if type(response) != dict or "version" not in response.keys():
            return {"status": STATUS.ERROR.value, "message": response}
        return response["version"]

    @staticmethod
    def check_if_results_exists(pacakge_name, version):
        if version == "latest":
            version = NpmPackageHandler.convert_latest_to_version(pacakge_name)
            if type(version) == dict:
                return version
        result_file_path = path.join(CONFIG.NPM_DOWNLOADED_PACKAGES_PATH.value, pacakge_name + "-" + version, CONFIG.RESULT_FILE_NAME.value)
        if path.isfile(result_file_path):
            return {"status": STATUS.SUCCESS.value, "path": result_file_path}
        return {"status": STATUS.ERROR.value, "path": result_file_path}


    @staticmethod
    def download_npm_package(pacakge_name, version):
        # pacakge_name = requests.utils.quote(pacakge_name)
        response = requests.get(f"https://registry.npmjs.org/{pacakge_name}/{version}").json()
        if type(response) != dict or "dist" not in response.keys():
            return {"status": STATUS.ERROR.value, "message": response}
        package_tar_url = response["dist"]["tarball"]
        file_name = package_tar_url.split("/")[-1]
        file_path = path.join(CONFIG.NPM_DOWNLOADED_PACKAGES_PATH.value, file_name)
        FileDownloader.download_file(package_tar_url, file_path)
        extracted_path = FileDownloader.extract_file(file_path)
        return {"status": STATUS.SUCCESS.value, "path": extracted_path}


