import os
from vitaes_parser import env

if env == 'production' or env == 'staging':
    print('Pushing images to %s environment...' % env)
    print()
    os.system('docker tag latexos vitaes/latexos')
    os.system('docker tag webapp vitaes/webapp')
    os.system('docker tag gravitaesql vitaes/gravitaesql')
    os.system('docker tag renderer vitaes/renderer')
    os.system('docker tag api vitaes/api')
    os.system('docker tag logger vitaes/logger')
    os.system('docker tag storage vitaes/storage')
    os.system('docker push vitaes/latexos')
    os.system('docker push vitaes/webapp')
    os.system('docker push vitaes/gravitaesql')
    os.system('docker push vitaes/renderer')
    os.system('docker push vitaes/api')
    os.system('docker push vitaes/logger')
    os.system('docker push vitaes/storage')
    print()
    print('Images pushed to %s environment' % env)
else:
    print("This can't be used in development env")