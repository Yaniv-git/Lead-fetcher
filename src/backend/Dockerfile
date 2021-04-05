FROM returntocorp/semgrep:latest

COPY . /home/backend
WORKDIR /home/backend


RUN pip install -r requirements.txt 


ENTRYPOINT python api.py