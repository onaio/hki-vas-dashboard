import os
import sys

from fabric.api import cd, env, run

DEPLOYMENTS = {
    'prod': {
        'home': '/home/ubuntu/src/',
        'host_string': 'ubuntu@ona.io',
        'project': 'hki-vas-dashboard',
        'key_filename': os.path.expanduser('~/.ssh/ona.pem'),
    },
}

CONFIG_PATH_DEPRECATED = 'formhub/local_settings.py'


def check_key_filename(deployment_name):
    if 'key_filename' in DEPLOYMENTS[deployment_name] and \
       not os.path.exists(DEPLOYMENTS[deployment_name]['key_filename']):
        exit_with_error("Cannot find required permissions file: %s" %
                        DEPLOYMENTS[deployment_name]['key_filename'])


def exit_with_error(message):
    print(message)
    sys.exit(1)


def setup_env(deployment_name):
    deployment = DEPLOYMENTS.get(deployment_name)

    if deployment is None:
        exit_with_error('Deployment "%s" not found.' % deployment_name)

    env.update(deployment)

    check_key_filename(deployment_name)

    env.code_src = os.path.join(env.home, env.project)


def deploy(deployment_name, branch='master'):
    setup_env(deployment_name)
    with cd(env.code_src):
        run("git fetch origin")
        run("git checkout origin/%s" % branch)
