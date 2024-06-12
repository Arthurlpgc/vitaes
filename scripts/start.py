import os
from vitaes_parser import env

if env == 'production' or env == 'staging':
    print('Starting in %s environment...' % env)
    print()
    os.system('kubectl apply -f kubernetes/volumes.yaml')
    os.system('linkerd inject kubernetes/rabbit.yaml | kubectl apply -f -')
    os.system('linkerd inject kubernetes/redis.yaml | kubectl apply -f -')
    os.system('linkerd inject kubernetes/mysql.yaml | kubectl apply -f -')
    os.system('linkerd inject kubernetes/grafana.yaml | kubectl apply -f -')
    os.system('linkerd inject kubernetes/logger.yaml | kubectl apply -f -')
    os.system('linkerd inject kubernetes/gravitaesql.yaml | kubectl apply -f -')
    os.system('linkerd inject kubernetes/webapp.yaml | kubectl apply -f -')
    os.system('sleep 10')
    os.system('linkerd inject kubernetes/renderer.yaml | kubectl apply -f -')
    os.system('linkerd inject kubernetes/api.yaml | kubectl apply -f -')
    os.system('linkerd inject kubernetes/storage.yaml | kubectl apply -f -')
    os.system('kubectl apply -f kubernetes/ingress.yaml')
    os.system('kubectl apply -f kubernetes/renderer-autoscaler.yaml')
    print()
    print('Started in %s environment' % env)
else:
    print('Starting in development environment...')
    print()
    os.system('docker-compose up --build --detach')
    print()
    print('Started in development environment')