mkdir -p output
docker pull ubuntu:20.04
DOCKER_BUILDKIT=1 docker build --file Dockerfile --output output .

#pandoc -N -s --toc  -f markdown+smart  --pdf-engine=xelatex -V CJKmainfont='KaiTi'  -V geometry:margin=1in 00_preface.md 01_node_introduce.md 02_node_javascript.md 03_node_basic.md 04_node_npm.md 05_node_database.md 06_node_express_basic.md 07_node_express_advance.md 08_node_unit_test.md 09_node_production.md 10_node_addon.md 11_node_optimization.md 12_node_web_security.md a1_node_utils.md a2_bibliography.md a3_convention.md a4_node_http.md a5_node_multi_versions.md a6_node_native_addon_config.md -o output.pdf
