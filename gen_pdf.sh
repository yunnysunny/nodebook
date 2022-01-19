#!/bin/bash


########################
# Print to STDERR
# Arguments:
#   Message to print
# Returns:
#   None
#########################
stderr_print() {
    # 'is_boolean_yes' is defined in libvalidations.sh, but depends on this file so we cannot source it
    local bool="${BITNAMI_QUIET:-false}"
    # comparison is performed without regard to the case of alphabetic characters
    shopt -s nocasematch
    if ! [[ "$bool" = 1 || "$bool" =~ ^(yes|true)$ ]]; then
        printf "%b\\n" "${*}" >&2
    fi
}

info_print() {
    echo -e "\033[32;1m$*\033[0m"
}

SAVE_NAME=all_images
CACHE_FILE="${CACHE_FROM_DIR}/${SAVE_NAME}.tar"
BUILD_TAG=yunnysunny/nodebook:latest
mkdir -p output

# load_cache ${SAVE_NAME}
docker pull ubuntu:20.04
docker build --target build-stage \
    --tag ${BUILD_TAG}  \
    --cache-from type=local,src=${CACHE_FILE} \
    --cache-to type=local,mode=max,dest=${CACHE_FILE} \
    --progress=plain .
docker images
docker build --output output .
mv output/book.pdf "output/${GITHUB_SHA}.pdf"

#pandoc -N -s --toc  -f markdown+smart  --pdf-engine=xelatex -V CJKmainfont='KaiTi'  -V geometry:margin=1in 00_preface.md 01_node_introduce.md 02_node_javascript.md 03_node_basic.md 04_node_npm.md 05_node_database.md 06_node_express_basic.md 07_node_express_advance.md 08_node_unit_test.md 09_node_production.md 10_node_addon.md 11_node_optimization.md 12_node_web_security.md a1_node_utils.md a2_bibliography.md a3_convention.md a4_node_http.md a5_node_multi_versions.md a6_node_native_addon_config.md -o output.pdf
