from os import path, walk, listdir
from enums import *
import json

class Sourceviewer_handler():

    @staticmethod
    def search_string_in_directory(dir_path, query):
        results = []
        if path.isdir(dir_path) and len(query) > 2:
            for current_path, directories, files in walk(dir_path):
                for file_name in files:
                    file_path = path.join(current_path, file_name)
                    file_result = {"file_path": file_path, "results": []}
                    with open(file_path, "r") as read_obj:
                        line_num = 0
                        for line in read_obj:
                            line_num += 1
                            if query in line:
                                file_result['results'].append({"line_num": line_num, "code": line[:500]})
                    if len(file_result['results']) > 0:
                        results.append(file_result)
        return results

    @staticmethod
    def get_file_tree(dir_path):
        if path.isdir(dir_path):
            walker = walk(dir_path)
            return Sourceviewer_handler._file_tree_walker(dir_path, [0], [], walker)

    @staticmethod
    def _file_tree_walker(dir_path, keys, json_tree, walker):
        current_path, directories, files = next(walker)
        current_path = current_path.replace(dir_path, "")
        if len(directories) + len(files) > 0:
            keys.append(len(directories) + len(files))

        for directory in directories:
            keys[-1] -= 1
            json_tree.append(
                {
                    "title": directory.split("\\")[-1],
                    "key": "-".join((str(key) for key in keys)),
                    "children": Sourceviewer_handler._file_tree_walker(dir_path, keys, [], walker)
                }
            )

        for leaf in files:
            keys[-1] -= 1
            json_tree.append(
                {
                    "title": leaf,
                    "key": "-".join((str(key) for key in keys)),
                    "isLeaf": True,
                    "path": current_path
                }
            )

        if keys[-1] == 0:
            keys.pop()
        return json_tree

    @staticmethod
    def get_file_data(file_path):
        file_path = path.join(CONFIG.DOWNLOADED_PACKAGES_PATH.value, file_path)
        if (path.isfile(file_path)):
            if path.getsize(file_path) > CONFIG.FILE_SIZE_READ_LIMIT.value:
                return {"status": STATUS.ERROR.value, "data": f"File is bigger than - {CONFIG.FILE_SIZE_READ_LIMIT.value} bytes"}
            return {"status": STATUS.SUCCESS.value, "data": open(file_path, "r").read()}
        return {"status": STATUS.ERROR.value, "data": ""}

    #deprecated
    @staticmethod
    def get_downloaded_packages():
        results = {}
        for lang in listdir(CONFIG.DOWNLOADED_PACKAGES_PATH.value):
            results[lang] = []
            for package_path in listdir(path.join(CONFIG.DOWNLOADED_PACKAGES_PATH.value, lang)):
                full_package_path = path.join(CONFIG.DOWNLOADED_PACKAGES_PATH.value, lang, package_path)
                if path.isdir(full_package_path):
                    results[lang].append(package_path)
        return results

    @staticmethod
    def get_packages_result_statistics():
        statistics = {}
        for lang in listdir(CONFIG.DOWNLOADED_PACKAGES_PATH.value):
            statistics[lang] = {}
            lang_path = path.join(CONFIG.DOWNLOADED_PACKAGES_PATH.value, lang)
            for package in listdir(lang_path):
                current_path = path.join(lang_path, package)
                current_package = package
                if path.isdir(current_path):
                    license_path = path.join(current_path, CONFIG.LICENSE_FILE_NAME.value)
                    result_file_path = path.join(current_path, CONFIG.RESULT_FILE_NAME.value)
                    statistics[lang][current_package] = {}
                    if path.exists(license_path):
                        statistics[lang][current_package]["licenses"] = json.load(open(license_path, "r"))
                    statistics[lang][current_package]["package"] = current_package
                    try:
                        results = json.load(open(result_file_path,"r"))
                        for lead in results["results"]:
                            if lead['extra']['severity'] not in statistics[lang][current_package].keys():
                                statistics[lang][current_package][lead['extra']['severity']] = 1
                            else:
                                statistics[lang][current_package][lead['extra']['severity']] += 1
                    except:
                        statistics[lang][current_package]["status"] = STATUS.LOADING.value
            statistics[lang] = list(statistics[lang].values())

        return {"status":STATUS.SUCCESS.value,"results":statistics}
