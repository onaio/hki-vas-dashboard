import os
import sys

from fabric.api import cd, env, run

DEPLOYMENTS = {
    'prod': {
        'home': '/home/ubuntu/src/',
        'host_string': 'ubuntu@ona.io',
        'project': 'hki-vas-dashboard',
        'key_filename': [
            os.path.expanduser('~/.ssh/ona.pem'),
            os.path.expanduser('~/.ssh/id_rsa'),
        ],
    },
}


def check_key_filename(deployment_name):
    if 'key_filename' in DEPLOYMENTS[deployment_name]:
        at_least_one_path = False
        key_files = []
        for path in DEPLOYMENTS[deployment_name]['key_filename']:
            if os.path.exists(path):
                key_files.append(path)


        if not key_files.__len__():
            exit_with_error("Cannot find required permissions file: %s" %
                            DEPLOYMENTS[deployment_name]['key_filename'])
        else:
            return key_files


def exit_with_error(message):
    print(message)
    sys.exit(1)


def setup_env(deployment_name):
    deployment = DEPLOYMENTS.get(deployment_name)

    if deployment is None:
        exit_with_error('Deployment "%s" not found.' % deployment_name)

    env.update(deployment)

    key_files = check_key_filename(deployment_name)
    env.update({'key_filename': key_files})

    env.code_src = os.path.join(env.home, env.project)


def deploy(deployment_name, branch='master'):
    setup_env(deployment_name)
    with cd(env.code_src):
        run("git fetch origin")
        run("git checkout origin/%s" % branch)
