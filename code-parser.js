// Simple code parser for browser
class CodeParser {
    static parse(code, language) {
        const lines = code.split('\n');
        const result = {
            language: language,
            lines: lines.length,
            functions: [],
            classes: [],
            variables: [],
            loops: 0,
            conditionals: 0
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            
            // Remove comments
            const cleanLine = trimmed.replace(/#.*$|\/\/.*$|\/\*[\s\S]*?\*\//, '').trim();
            
            if (!cleanLine) return;
            
            // Detect functions
            if (language === 'python') {
                if (cleanLine.startsWith('def ')) {
                    const funcName = cleanLine.substring(4, cleanLine.indexOf('(')).trim();
                    result.functions.push({
                        name: funcName,
                        line: index + 1,
                        type: 'function'
                    });
                } else if (cleanLine.startsWith('class ')) {
                    const className = cleanLine.substring(6, cleanLine.indexOf(':')).trim();
                    result.classes.push({
                        name: className,
                        line: index + 1,
                        type: 'class'
                    });
                }
            } else if (['javascript', 'java', 'cpp'].includes(language)) {
                if (cleanLine.match(/function\s+\w+\(/) || 
                    cleanLine.match(/const\s+\w+\s*=\s*\(.*\)\s*=>/) ||
                    cleanLine.match(/let\s+\w+\s*=\s*\(.*\)\s*=>/) ||
                    cleanLine.match(/var\s+\w+\s*=\s*\(.*\)\s*=>/)) {
                    
                    const funcMatch = cleanLine.match(/function\s+(\w+)/) || 
                                     cleanLine.match(/(?:const|let|var)\s+(\w+)/);
                    if (funcMatch) {
                        result.functions.push({
                            name: funcMatch[1],
                            line: index + 1,
                            type: 'function'
                        });
                    }
                }
                
                if (cleanLine.match(/class\s+\w+/)) {
                    const classMatch = cleanLine.match(/class\s+(\w+)/);
                    if (classMatch) {
                        result.classes.push({
                            name: classMatch[1],
                            line: index + 1,
                            type: 'class'
                        });
                    }
                }
            }
            
            // Detect variables
            if (cleanLine.match(/^\s*(?:const|let|var|int|float|double|String|bool)\s+\w+\s*=/) ||
                cleanLine.match(/^\s*\w+\s+[\w<>]+\s+\w+\s*=\s*.*;?$/) ||
                (language === 'python' && cleanLine.match(/^\s*\w+\s*=\s*.+$/))) {
                
                const varMatch = cleanLine.match(/(\w+)\s*[=:]/);
                if (varMatch && !['if', 'for', 'while', 'switch', 'def', 'class'].includes(varMatch[1])) {
                    result.variables.push({
                        name: varMatch[1],
                        line: index + 1,
                        type: 'variable'
                    });
                }
            }
            
            // Count control structures
            if (cleanLine.match(/\b(if|else if|elif|else|switch|case)\b/)) {
                result.conditionals++;
            }
            if (cleanLine.match(/\b(for|while|do)\b/)) {
                result.loops++;
            }
        });

        // Calculate complexity score
        result.complexity = Math.min(
            result.functions.length + 
            result.classes.length * 2 + 
            result.conditionals + 
            result.loops,
            10
        );

        return result;
    }

    static getLanguageFromExtension(filename) {
        const extMap = {
            '.py': 'python',
            '.js': 'javascript',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'cpp',
            '.html': 'html',
            '.css': 'css'
        };
        
        for (const [ext, lang] of Object.entries(extMap)) {
            if (filename.endsWith(ext)) {
                return lang;
            }
        }
        return 'text';
    }

    static highlightCode(code, language) {
        // Simple syntax highlighting
        const keywords = {
            python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'True', 'False', 'None'],
            javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'default', 'try', 'catch', 'finally', 'true', 'false', 'null'],
            java: ['public', 'private', 'protected', 'class', 'interface', 'void', 'int', 'String', 'boolean', 'if', 'else', 'for', 'while', 'return', 'new', 'static', 'final'],
            cpp: ['int', 'float', 'double', 'char', 'void', 'class', 'struct', 'if', 'else', 'for', 'while', 'return', 'new', 'delete', 'public', 'private', 'protected']
        };

        let highlighted = code;
        
        if (keywords[language]) {
            keywords[language].forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
            });
        }

        // Highlight strings
        highlighted = highlighted.replace(/('.*?'|".*?")/g, '<span class="string">$1</span>');
        
        // Highlight comments
        if (language === 'python') {
            highlighted = highlighted.replace(/#.*$/gm, '<span class="comment">$&</span>');
        } else {
            highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
            highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
        }

        // Highlight numbers
        highlighted = highlighted.replace(/\b\d+\b/g, '<span class="number">$&</span>');

        return highlighted;
    }
}

// Export for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeParser;
} else {
    window.CodeParser = CodeParser;
}