import os
import json
from enums import *
from os import path
from time import sleep

CURRENT_DIR = os.getcwd()



class SemgrepRunner():
    @staticmethod
    def run_semgrep(code_path):
        output_path = path.join(code_path, CONFIG.RESULT_FILE_NAME.value)
        with open(output_path,"w") as f:
            f.write(json.dumps({"status": STATUS.LOADING.value}))
        os_command = f"semgrep --config={path.join(CURRENT_DIR, 'semgrep_rules')} {path.join(CURRENT_DIR, code_path)} --json > {output_path}"
        print(os_command)
        os.popen(os_command)
