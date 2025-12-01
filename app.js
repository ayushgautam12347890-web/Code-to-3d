// Main application logic
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let threeApp;

class CodeTo3D {
    constructor() {
        this.init();
    }
    
    init() {
        console.log("Code to 3D Converter Initialized - 100% Free Version");
        threeApp = new ThreeApp('threeCanvas');
        
        // Setup event listeners
        document.getElementById('generateBtn').addEventListener('click', () => this.generate3D());
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadVideo());
    }
    
    async generate3D() {
        const code = document.getElementById('codeInput').value;
        const language = document.getElementById('language').value;
        
        if (!code.trim()) {
            alert('Please enter some code!');
            return;
        }
        
        // Show loading
        document.getElementById('loading').classList.remove('hidden');
        
        // Parse code and generate 3D structure
        const parsedStructure = this.parseCode(code, language);
        
        // Generate 3D visualization
        await threeApp.generateVisualization(parsedStructure);
        
        // Hide loading
        document.getElementById('loading').classList.add('hidden');
        
        // Enable recording button
        document.getElementById('recordBtn').disabled = false;
        
        // Show message
        this.showMessage('✅ 3D visualization ready! Click "Record Video" to capture.');
    }
    
    parseCode(code, language) {
        // Simple code parser that works entirely in browser
        const lines = code.split('\n');
        const functions = [];
        const classes = [];
        const variables = [];
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            
            // Detect functions based on language
            if (language === 'python') {
                if (trimmed.startsWith('def ')) {
                    functions.push({
                        name: trimmed.substring(4, trimmed.indexOf('(')),
                        line: index + 1,
                        type: 'function'
                    });
                } else if (trimmed.startsWith('class ')) {
                    classes.push({
                        name: trimmed.substring(6, trimmed.indexOf(':')),
                        line: index + 1,
                        type: 'class'
                    });
                }
            } else if (language === 'javascript') {
                if (trimmed.match(/function\s+\w+\(/) || trimmed.match(/const\s+\w+\s*=\s*\(.*\)\s*=>/)) {
                    const match = trimmed.match(/function\s+(\w+)/) || trimmed.match(/const\s+(\w+)/);
                    if (match) {
                        functions.push({
                            name: match[1],
                            line: index + 1,
                            type: 'function'
                        });
                    }
                }
            }
            
            // Detect variables
            if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('!=')) {
                const varMatch = trimmed.match(/(\w+)\s*=/);
                if (varMatch && !['if', 'for', 'while', 'def', 'class'].includes(varMatch[1])) {
                    variables.push({
                        name: varMatch[1],
                        line: index + 1,
                        type: 'variable'
                    });
                }
            }
        });
        
        return {
            language,
            totalLines: lines.length,
            functions,
            classes,
            variables,
            complexity: this.calculateComplexity(lines)
        };
    }
    
    calculateComplexity(lines) {
        let complexity = 0;
        lines.forEach(line => {
            if (line.includes('if ') || line.includes('else ') || line.includes('for ') || 
                line.includes('while ') || line.includes('switch ')) {
                complexity++;
            }
        });
        return Math.min(complexity, 10); // Cap at 10
    }
    
    async toggleRecording() {
        if (!isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }
    
    async startRecording() {
        try {
            const canvas = document.getElementById('threeCanvas');
            const stream = canvas.captureStream(30); // 30 FPS
            
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);
                const videoElement = document.getElementById('outputVideo');
                
                videoElement.src = videoUrl;
                videoElement.classList.remove('hidden');
                
                document.getElementById('downloadBtn').disabled = false;
                document.getElementById('recordBtn').innerHTML = '⏺️ Record Video';
                isRecording = false;
                
                this.showMessage('✅ Video recorded! Click "Download Video" to save.');
            };
            
            mediaRecorder.start();
            isRecording = true;
            document.getElementById('recordBtn').innerHTML = '⏹️ Stop Recording';
            document.getElementById('recordBtn').style.background = '#ff6b81';
            
            this.showMessage('● Recording... Click "Stop Recording" when done.');
            
        } catch (error) {
            console.error('Recording error:', error);
            alert('Recording failed. Please try again.');
        }
    }
    
    stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
        }
    }
    
    downloadVideo() {
        if (recordedChunks.length === 0) {
            alert('No video recorded yet!');
            return;
        }
        
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `code-3d-visualization-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('✅ Video downloaded!');
    }
    
    showMessage(text) {
        const infoDiv = document.getElementById('videoInfo');
        infoDiv.innerHTML = text;
        infoDiv.style.color = '#2ed573';
        infoDiv.style.fontWeight = 'bold';
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.codeTo3D = new CodeTo3D();
});

// Global functions for HTML onclick
function generate3D() {
    window.codeTo3D.generate3D();
}

function startRecording() {
    window.codeTo3D.toggleRecording();
}

function downloadVideo() {
    window.codeTo3D.downloadVideo();
}