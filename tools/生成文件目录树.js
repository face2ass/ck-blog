const fs = require('fs')
const path = require('path')


// 重命名文件 _改为-

const targetPath = path.resolve('D:\\Workspace\\ypw-editor\\src') // 扫描的目录

console.log('------------------- start -------------------')

const tree = { children: [] }

fileDisplay(targetPath, tree, 0)

function fileDisplay(targetPath, tree, level) {
    try {
        const files = fs.readdirSync(targetPath)
        let filename, node
        for (let i = 0; i < files.length; i++) {
            filename = files[i]
            var currentPath = path.join(targetPath, filename)
            const stats = fs.statSync(currentPath)
            var isFile = stats.isFile()
            var isDir = stats.isDirectory()
            if (isFile) {
                node = {
                    level,
                    order: i,
                    name: filename,
                    path: currentPath,
                    parent: tree,
                }
                tree.children.push(node)
            }
            if (isDir) {
                node = {
                    level,
                    order: i,
                    name: filename,
                    path: currentPath,
                    parent: tree,
                }
                node.children = []
                tree.children.push(node)
                fileDisplay(currentPath, node, level + 1)
            }
        }
    } catch (e) {
        console.error(e)
    }
}

const treeStrArray = []
draw(tree.children)
function draw(tree) {
    for (const node of tree) {

        if (node.level === 0) {
            if (node.parent.children.length === 1) {
                treeStrArray.push('──── ' + node.name + '-' + node.level + '-' + node.order)
            }
            else{
                if (node.order === 0) {
                    treeStrArray.push('┌─── ' + node.name + '-' + node.level + '-' + node.order)
                }
                else if (node.parent.children.length === node.order + 1) {
                    treeStrArray.push('└─── ' + node.name + '-' + node.level + '-' + node.order)
                }
                else{
                    treeStrArray.push('├─── ' + node.name + '-' + node.level + '-' + node.order)
                }
            }
        }

        if (node.level === 1) {
            if (node.parent.children.length === node.order + 1) {
                treeStrArray.push(new Array(2).join('│    ') + '└─── ' + node.name + '-' + node.level + '-' + node.order)
            }
            else{
                treeStrArray.push(new Array(2).join('│    ') + '├─── ' + node.name + '-' + node.level + '-' + node.order)
            }
        }


        if (node.level === 2) {
            if (node.parent.children.length === node.order + 1) {
                treeStrArray.push(new Array(3).join('│    ') + '└─── ' + node.name + '-' + node.level + '-' + node.order)
            }
            else{
                treeStrArray.push(new Array(3).join('│    ') + '├─── ' + node.name + '-' + node.level + '-' + node.order)
            }
        }

        if (node.children) {
            draw(node.children)
        }
    }
}

fs.writeFileSync('.\\目录树.txt', treeStrArray.join('\n'), 'utf8');

// fs.writeFileSync('坦克大战网络版.rdf', availableFiles.join('\r\n'));
console.log('------------------- end -------------------')