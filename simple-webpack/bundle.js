// simple bundle implement
// using fs,babel-parser,babel-traverse for parser and collect files' code
// and dependencies
const fs = require('fs');
const parser = require('@babel/parser');
const path = require('path');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const getModuleInfo = (file)=>{
    //return a file's code,deps
    //turn file to ast
    const body = fs.readFileSync(file,'utf-8');
    const ast = parser.parse(body,{
        sourceType:'module'
    });
    const deps = {};
    //traverse import nodes for collecting dependencies
    traverse(ast,{
        ImportDeclaration({node}){
            const dirname = path.dirname(file);
            const abspath = './' + path.join(dirname,node.source.value);
            deps[node.source.value] = abspath;
        }
    })
    //use bable-core to generate code from ast
    const {code} = babel.transformFromAst(ast,null,{
        presets:["@babel/preset-env"]
    })
    const moduleInfo = {file,deps,code}
    return moduleInfo;
}
const parseModules = (file) =>{
    //traverse all module and push in a depsGraph
    const entry =  getModuleInfo(file)
    const temp = [entry]
    const depsGraph = {}
    for (let i = 0;i<temp.length;i++){
        const deps = temp[i].deps
        if (deps){
            for (const key in deps){
                if (deps.hasOwnProperty(key)){
                    temp.push(getModuleInfo(deps[key]))
                }
            }
        }
    }
    temp.forEach(moduleInfo=>{
        depsGraph[moduleInfo.file] = {
            deps:moduleInfo.deps,
            code:moduleInfo.code
        }
    })
    return depsGraph
}
const bundle = (file) =>{
    const depsGraph = JSON.stringify(parseModules(file));
    //return an iife string with implemented require function
    //require function will do another iife which eval code string and give deps from graph
    return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {}
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`
}

const content = bundle('./src/index.js')

console.log(content);
//write in dist after push
fs.mkdirSync('./dist');
fs.writeFileSync('./dist/bundle.js',content);