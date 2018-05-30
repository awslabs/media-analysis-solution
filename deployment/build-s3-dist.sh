#!/bin/bash

# This assumes all of the OS-level configuration has been completed and git repo has already been cloned

# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name
# source-bucket-base-name should be the base name for the S3 bucket location where the template will source the Lambda code from.
# The template will append '-[region_name]' to this bucket name.
# For example: ./build-s3-dist.sh solutions
# The template will then expect the source code to be located in the solutions-[region_name] bucket

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the base source bucket name and version where the lambda code will eventually reside."
    echo "For example: ./build-s3-dist.sh solutions v1.0.0"
    exit 1
fi

echo "------------------------------------------------------------------------------"
echo "Rebuild distribution"
echo "------------------------------------------------------------------------------"
# Setting up directories
echo "rm -rf ./dist"
rm -rf ./dist
# Create new dist directory
echo "mkdir -p ./dist"
mkdir -p ./dist


echo "------------------------------------------------------------------------------"
echo "CloudFormation Templates"
echo "------------------------------------------------------------------------------"
# Copy deploy template to dist directory and update bucket name
echo "cp media-analysis-deploy.yaml ./dist/media-analysis-deploy.template"
cp ./media-analysis-deploy.yaml ./dist/media-analysis-deploy.template
echo "Updating code source bucket in template with $1"
replace="s/%%BUCKET_NAME%%/$1/g"
echo "sed -i '' -e $replace dist/media-analysis-deploy.template"
sed -i '' -e $replace dist/media-analysis-deploy.template
replace="s/%%VERSION%%/$2/g"
echo "sed -i '' -e $replace dist/media-analysis-deploy.template"
sed -i '' -e $replace dist/media-analysis-deploy.template

# Copy api template to dist directory and update bucket name
echo "cp media-analysis-api-stack.yaml ./dist/media-analysis-api-stack.template"
cp ./media-analysis-api-stack.yaml ./dist/media-analysis-api-stack.template
echo "Updating code source bucket in template with $1"
replace="s/%%BUCKET_NAME%%/$1/g"
echo "sed -i '' -e $replace dist/media-analysis-api-stack.template"
sed -i '' -e $replace dist/media-analysis-api-stack.template
replace="s/%%VERSION%%/$2/g"
echo "sed -i '' -e $replace dist/media-analysis-api-stack.template"
sed -i '' -e $replace dist/media-analysis-api-stack.template

# Copy storage template to dist directory and update bucket name
echo "cp media-analysis-storage-stack.yaml ./dist/media-analysis-storage-stack.template"
cp ./media-analysis-storage-stack.yaml ./dist/media-analysis-storage-stack.template
echo "Updating code source bucket in template with $1"
replace="s/%%BUCKET_NAME%%/$1/g"
echo "sed -i '' -e $replace dist/media-analysis-storage-stack.template"
sed -i '' -e $replace dist/media-analysis-storage-stack.template

# Copy state machine template to dist directory
echo "cp media-analysis-state-machine-stack.yaml ./dist/media-analysis-state-machine-stack.template"
cp ./media-analysis-state-machine-stack.yaml ./dist/media-analysis-state-machine-stack.template

echo "------------------------------------------------------------------------------"
echo "Analysis Function"
echo "------------------------------------------------------------------------------"
echo "Building Analysis Lambda function"
cd ../source/analysis
npm install
npm run build
npm run zip
cp dist/media-analysis-function.zip ../../deployment/dist/media-analysis-function.zip

echo "------------------------------------------------------------------------------"
echo "API Function"
echo "------------------------------------------------------------------------------"
echo "Building API Lambda function"
cd ../api
npm install
npm run build
npm run zip
cp dist/media-analysis-api.zip ../../deployment/dist/media-analysis-api.zip


echo "------------------------------------------------------------------------------"
echo "Helper Function"
echo "------------------------------------------------------------------------------"
echo "Building Helper Lambda function"
cd ../helper
npm install
npm run build
npm run zip
cp dist/media-analysis-helper.zip ../../deployment/dist/media-analysis-helper.zip


echo "------------------------------------------------------------------------------"
echo "Website"
echo "------------------------------------------------------------------------------"
echo "Building Demo Website"
cd ../web_site
npm install
npm run build
cp -r ./build ../../deployment/dist/web_site

echo "------------------------------------------------------------------------------"
echo "Website Manifest"
echo "------------------------------------------------------------------------------"
echo "Generating web site manifest"
cd ../../deployment/manifest-generator
npm install
node app.js

echo "------------------------------------------------------------------------------"
echo "S3 Packaging Complete"
echo "------------------------------------------------------------------------------"
