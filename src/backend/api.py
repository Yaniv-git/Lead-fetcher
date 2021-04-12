from flask import Flask, Response, Request
from npm_package_handler import NpmPackageHandler
from enums import *
import json
from semgrep_runner import SemgrepRunner
from flask_cors import CORS
from sourceviewer_handler import Sourceviewer_handler
from shutil import rmtree

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})

@app.route('/api/v1/npm/<pacakge_name>/', defaults={'version': "latest"})
@app.route('/api/v1/npm/<pacakge_name>/<version>')
def npm_scan_handler(pacakge_name, version):
    result_path = NpmPackageHandler.check_if_results_exists(pacakge_name, version)
    if result_path["status"] == STATUS.ERROR.value:
        npm_package_result = NpmPackageHandler.download_npm_package(pacakge_name, version)
        if npm_package_result["status"] == STATUS.SUCCESS.value:
            SemgrepRunner.run_semgrep(npm_package_result['path'])
        else:
            return Response(json.dumps(npm_package_result), mimetype=MIMETYPE.JSON.value)

    return Response(open(result_path["path"],"r").read(), mimetype=MIMETYPE.JSON.value)

@app.route('/api/v1/dashboard/npm')
def npm_dashboard_handler():
    npm_scan_statistics = NpmPackageHandler.get_result_statistics()
    return Response(json.dumps(npm_scan_statistics), mimetype=MIMETYPE.JSON.value)

@app.route('/api/v1/sourceview/<lang>/<pacakge_id>')
def sourceview_handler(lang, pacakge_id):
    file_tree = Sourceviewer_handler.get_file_tree(fr"downloaded_packages/{lang}/{pacakge_id}")
    return Response(json.dumps(file_tree), mimetype=MIMETYPE.JSON.value)

@app.route('/api/v1/file/<path:file_path>')
def file_data_handler(file_path):
    return Response(json.dumps(Sourceviewer_handler.get_file_data(file_path)), mimetype=MIMETYPE.JSON.value)

'''@app.route('/api/v1/packages')
def get_downloaded_packages_list():
    return Response(json.dumps(Sourceviewer_handler.get_downloaded_packages()), mimetype=MIMETYPE.JSON.value)'''

@app.route('/api/v1/packages')
def get_downloaded_packages_data():
    return Response(json.dumps(Sourceviewer_handler.get_packages_result_statistics()), mimetype=MIMETYPE.JSON.value)

@app.route('/api/v1/delete/<lang>/<pacakge_id>')
def delete_downloaded_package(lang, pacakge_id):
    if ".." in lang or ".." in pacakge_id:
        return Response(json.dumps({"status": STATUS.ERROR.value, "message": "path traversal attempt"}), mimetype=MIMETYPE.JSON.value)
    package_path = path.join(CONFIG.DOWNLOADED_PACKAGES_PATH.value, lang, pacakge_id)
    if path.exists(package_path):
        rmtree(package_path)
    return Response(json.dumps({"status":STATUS.SUCCESS.value}), mimetype=MIMETYPE.JSON.value)


if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")

