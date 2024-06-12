import os
from vitaes_parser import env

if env == 'production' or env == 'staging':
    print('Building for %s environment...' % env)
    print()
    os.system('docker build --tag latexos latexos/')
    os.system('docker build --tag webapp webapp/')
    os.system('docker build --tag gravitaesql gravitaesql/')
    os.system('docker build --tag renderer renderer/')
    os.system('docker build --tag api api/')
    os.system('docker build --tag logger logger/')
    os.system('docker build --tag storage storage/')
    print()
    print('Built in %s environment' % env)
else:
    print('Building for development environment...')
    print()
    os.system('docker-compose build')
    print()
    print('Built in development environment')