from flask import Flask, Response, request
from npm_package_handler import NpmPackageHandler
from enums import *
import json
from semgrep_runner import SemgrepRunner
from flask_cors import CORS
from sourceviewer_handler import Sourceviewer_handler
from shutil import rmtree
from os import makedirs, path

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})


@app.route('/api/v1/npm')
def npm_scan_handler():
    package_name = request.args.get('package_name')
    version = request.args.get('version', default="latest")
    if package_name:
        result_path = NpmPackageHandler.check_if_results_exists(package_name.replace("/", "^"), version)
        if result_path["status"] == STATUS.ERROR.value:
            npm_package_result = NpmPackageHandler.download_npm_package(package_name, version)
            if npm_package_result["status"] == STATUS.SUCCESS.value:
                SemgrepRunner.run_semgrep(npm_package_result['path'])
            else:
                return Response(json.dumps(npm_package_result), mimetype=MIMETYPE.JSON.value)

        return Response(open(result_path["path"], "r").read(), mimetype=MIMETYPE.JSON.value)
    else:
        return Response(json.dumps({"status": STATUS.ERROR.value}), mimetype=MIMETYPE.JSON.value)


@app.route('/api/v1/sourceview')
def sourceview_handler():
    lang = request.args.get('lang')
    package_id = request.args.get('package_id')
    if package_id and lang:
        file_tree = Sourceviewer_handler.get_file_tree(fr"downloaded_packages/{lang}/{package_id}")
        return Response(json.dumps(file_tree), mimetype=MIMETYPE.JSON.value)
    else:
        return Response(json.dumps({"status": STATUS.ERROR.value}), mimetype=MIMETYPE.JSON.value)

@app.route('/api/v1/file')
def file_data_handler():
    file_path = request.args.get('path')
    if file_path:
        return Response(json.dumps(Sourceviewer_handler.get_file_data(file_path)), mimetype=MIMETYPE.JSON.value)
    else:
        return Response(json.dumps({"status": STATUS.ERROR.value}), mimetype=MIMETYPE.JSON.value)

@app.route('/api/v1/searchinfiles')
def search_in_file_handler():
    query = request.args.get('query')
    lang = request.args.get('lang')
    package_id = request.args.get('package_id')
    return Response(json.dumps(Sourceviewer_handler.search_string_in_directory(path.join(CONFIG.DOWNLOADED_PACKAGES_PATH.value, lang, package_id), query)), mimetype=MIMETYPE.JSON.value)


@app.route('/api/v1/packages')
def get_downloaded_packages_data():
    return Response(json.dumps(Sourceviewer_handler.get_packages_result_statistics()), mimetype=MIMETYPE.JSON.value)

@app.route('/api/v1/npmkeyword')
def get_npm_packages_by_keyword():
    keyword = request.args.get('keyword')
    page = request.args.get('page')
    packages_num = request.args.get('packages_num')
    return Response(json.dumps(NpmPackageHandler.get_packages_by_keyword(keyword, page, packages_num)), mimetype=MIMETYPE.JSON.value)

@app.route('/api/v1/delete')
def delete_downloaded_package():
    lang = request.args.get('lang')
    package_id = request.args.get('package_id')
    if package_id and lang:
        if ".." in lang or ".." in package_id:
            return Response(json.dumps({"status": STATUS.ERROR.value, "message": "path traversal attempt"}),
                            mimetype=MIMETYPE.JSON.value)
        package_path = path.join(CONFIG.DOWNLOADED_PACKAGES_PATH.value, lang, package_id)
        if path.exists(package_path):
            rmtree(package_path)
        return Response(json.dumps({"status": STATUS.SUCCESS.value}), mimetype=MIMETYPE.JSON.value)
    else:
        return Response(json.dumps({"status": STATUS.ERROR.value}), mimetype=MIMETYPE.JSON.value)


if __name__ == '__main__':
    if not path.exists(CONFIG.NPM_DOWNLOADED_PACKAGES_PATH.value):
        makedirs(CONFIG.NPM_DOWNLOADED_PACKAGES_PATH.value)
    app.run(debug=True, port=5000, host="0.0.0.0")

