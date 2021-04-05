import os
import json
from enums import *
from os import path

os_command = "echo {0} > {1}"#"semgrep --config=semgrep_rules {} --json > {}"

class SemgrepRunner():

    @staticmethod
    def run_semgrep(code_path):
        output_path = path.join(code_path, CONFIG.RESULT_FILE_NAME.value)
        json.dump({"status": STATUS.LOADING.value}, open(output_path,"w"))
        os.popen(os_command.format(code_path , output_path))
