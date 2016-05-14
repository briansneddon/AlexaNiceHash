#!/bin/bash

npm install
zip -r AlexaNiceHash.zip *
aws --profile personal lambda update-function-code --zip-file fileb://AlexaNiceHash.zip --function-name AlexaNiceHash --publish --region us-east-1
rm AlexaNiceHash.zip

