#!/bin/bash
#
# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name trademarked-solution-name version-code
#
# Paramenters:
#  - source-bucket-base-name: Name for the S3 bucket location where the template will source the Lambda
#    code from. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh solutions my-solution v1.0.0
#    The template will then expect the source code to be located in the solutions-[region_name] bucket
#
#  - trademarked-solution-name: name of the solution for consistency
#
#  - version-code: version of the package

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Please provide the base source bucket name, trademark approved solution name and version where the lambda code will eventually reside."
    echo "For example: ./build-s3-dist.sh solutions trademarked-solution-name v1.0.0"
    exit 1
fi

# Get reference for all important folders
template_dir="$PWD"
template_dist_dir="$template_dir/global-s3-assets"
build_dist_dir="$template_dir/regional-s3-assets"
source_dir="$template_dir/../source"

echo "------------------------------------------------------------------------------"
echo "Rebuild distribution"
echo "------------------------------------------------------------------------------"
rm -rf $template_dist_dir
mkdir -p $template_dist_dir
rm -rf $build_dist_dir
mkdir -p $build_dist_dir

echo "------------------------------------------------------------------------------"
echo "CloudFormation Templates"
echo "------------------------------------------------------------------------------"
cp $template_dir/*.template $template_dist_dir/
cp $template_dir/*.yaml $template_dist_dir/

cd $template_dist_dir
# Rename all *.yaml to *.template
for f in *.yaml; do
    mv -- "$f" "${f%.yaml}.template"
done

cd ..
echo "Updating code source bucket in template with $1"
replace="s/%%BUCKET_NAME%%/$1/g"
echo "sed -i '' -e $replace $template_dist_dir/*.template"
sed -i '' -e $replace $template_dist_dir/*.template
replace="s/%%SOLUTION_NAME%%/$2/g"
echo "sed -i '' -e $replace $template_dist_dir/*.template"
sed -i '' -e $replace $template_dist_dir/*.template
replace="s/%%VERSION%%/$3/g"
echo "sed -i '' -e $replace $template_dist_dir/*.template"
sed -i '' -e $replace $template_dist_dir/*.template

cp $template_dist_dir/*.template $build_dist_dir/

echo "------------------------------------------------------------------------------"
echo "Analysis Function"
echo "------------------------------------------------------------------------------"
echo "Building Analysis Lambda function"
cd "$source_dir/analysis" || exit
npm install
npm run build
npm run zip
cp "./dist/media-analysis-function.zip" "$build_dist_dir/media-analysis-function.zip"

echo "------------------------------------------------------------------------------"
echo "API Function"
echo "------------------------------------------------------------------------------"
echo "Building API Lambda function"
cd "$source_dir/api" || exit
npm install
npm run build
npm run zip
cp "./dist/media-analysis-api.zip" "$build_dist_dir/media-analysis-api.zip"

echo "------------------------------------------------------------------------------"
echo "Helper Function"
echo "------------------------------------------------------------------------------"
echo "Building Helper Lambda function"
cd "$source_dir/helper" || exit
npm install
npm run build
npm run zip
cp "./dist/media-analysis-helper.zip" "$build_dist_dir/media-analysis-helper.zip"

echo "------------------------------------------------------------------------------"
echo "Website"
echo "------------------------------------------------------------------------------"
echo "Building Demo Website"
cd "$source_dir/web_site" || exit
npm install
npm run build
cp -r "./build" "$build_dist_dir/web_site"

echo "------------------------------------------------------------------------------"
echo "Website Manifest"
echo "------------------------------------------------------------------------------"
echo "Generating web site manifest"
cd "$template_dir/manifest-generator" || exit
npm install
node app.js --target "$build_dist_dir/web_site" --output "$build_dist_dir/site-manifest.json"

echo "------------------------------------------------------------------------------"
echo "S3 Packaging Complete"
echo "------------------------------------------------------------------------------"
