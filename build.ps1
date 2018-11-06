yarn install
yarn build
Get-ChildItem .\packages -Recurse -include "*.tgz" | remove-item
Get-ChildItem .\packages -Recurse -include "package.json" | % { 
    pushd $_.Directory; 
    $(Get-Content .\package.json).Replace("@profiscience/", "@ic/") | Set-Content .\package.json
    npm pack; 
    git checkout -- .\package.json
    popd 
}