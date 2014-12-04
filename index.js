'use strict';

var tagNameRegex = /^([a-z]+)(?:\:([a-z]+))?/           // matches 'input' or 'input:text'
var propsRegex = /((?:#|\.)[\w-]+)|(\[\w+(?:=\w+)?\])/g // matches all further properties
var attrRegex = /\[(\w+)(?:=(\w+))?\]/                  // matches '[foo=bar]' or '[foo]'


// Convert a tag specification string into an object
// eg. 'input:checkbox#foo.bar[name=asdf]' produces the output:
// { tagName: 'input', type: 'checkbox', id: 'foo', className: 'bar', name: 'asdf' }
function parseTagSpec(specString) {
    // Parse tagName, and optional
    var tagMatch = specString.match(tagNameRegex)
    if (!tagMatch) return

    var spec = { tagName: tagMatch[1] }
    var classes = []
    if (tagMatch[2]) spec.type = tagMatch[2]

    var matches = (specString || '').match(propsRegex)
    matches && matches.forEach(function(str) {
        if (!str) return
        else if (str[0] === '#') spec.id = str.slice(1)
        else if (str[0] === '.') classes.push(str.slice(1))
        else if (str[0] === '[') {
            var match = str.match(attrRegex)
            if (match) spec[match[1]] = match[2] || true    // If no attr value given, use true
        }
    })
    if (classes.length) spec.className = classes.join(' ')
    return spec
}


// Simple Object.assign-like utility (with special cases)
function extend(obj1, obj2) {
    obj1 = obj1 || {}
    obj2 = obj2 || {}

    // className is a special case: we want to return the combination
    // of strings if both objects contain className
    var combinedClass = obj1.className && obj2.className &&
                        [obj1.className, obj2.className].join(' ')
    if (combinedClass) obj2.className = combinedClass

    for (var k in obj2) obj1[k] = obj2[k]
    return obj1
}


module.exports = function jsnox(React) {
    return function(componentType, props, children) {
        if (typeof componentType === 'string') {
            var spec = parseTagSpec(componentType)
            componentType = spec.tagName
            delete spec.tagName
            props = extend(spec, props)
        }

        return React.createElement(componentType, props, children)
    }
}
