import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  color: #ffffff;
`;

const Header = styled.header`
  padding: 1rem 2rem;
  background-color: #252526;
  border-bottom: 1px solid #3c3c3c;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(45deg, #61dafb, #764abc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const EditorContainer = styled.div<{ layout: 'side-by-side' | 'full-preview' }>`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1px;
  background-color: #3c3c3c;
  flex-direction: ${props => props.layout === 'full-preview' ? 'column' : 'row'};
`;

const EditorPanel = styled.div<{ layout: 'side-by-side' | 'full-preview' }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  transition: all 0.3s ease;
  width: ${props => props.layout === 'full-preview' ? '100%' : '50%'};
  height: ${props => props.layout === 'full-preview' ? '50%' : '100%'};

  &:hover {
    box-shadow: inset 0 0 10px rgba(97, 218, 251, 0.1);
  }
`;

const PreviewPanel = styled.div<{ layout: 'side-by-side' | 'full-preview' }>`
  flex: 1;
  background-color: #ffffff;
  position: relative;
  transition: all 0.3s ease;
  width: ${props => props.layout === 'full-preview' ? '100%' : '50%'};
  height: ${props => props.layout === 'full-preview' ? '50%' : '100%'};

  &:hover {
    box-shadow: inset 0 0 10px rgba(97, 218, 251, 0.1);
  }
`;

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background-color: #ffffff;
`;

const TabContainer = styled.div`
  display: flex;
  background-color: #252526;
  border-bottom: 1px solid #3c3c3c;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? '#1e1e1e' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#888888'};
  border: none;
  border-right: 1px solid #3c3c3c;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.active ? '#1e1e1e' : '#2d2d2d'};
    color: #ffffff;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EditorWrapper = styled.div`
  position: relative;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    background-color: #252526;
  }

  &::before {
    content: attr(data-language);
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px 8px;
    background-color: #3c3c3c;
    color: #ffffff;
    font-size: 12px;
    z-index: 1;
    border-bottom-left-radius: 4px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0 2rem;
`;

const TemplateSelect = styled.select`
  padding: 0.5rem 1rem;
  background: #252526;
  color: white;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #61dafb;
  }

  option {
    background: #252526;
  }
`;

const ShareButton = styled.button`
  padding: 0.5rem 1rem;
  background: linear-gradient(45deg, #61dafb, #764abc);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(97, 218, 251, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LayoutButton = styled.button`
  padding: 0.5rem 1rem;
  background: linear-gradient(45deg, #61dafb, #764abc);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(97, 218, 251, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const RunButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: linear-gradient(45deg, #61dafb, #764abc);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(97, 218, 251, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatusMessage = styled.div`
  color: #61dafb;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ErrorContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 0, 0, 0.1);
  border-top: 1px solid #ff4444;
  padding: 1rem;
  color: #ff4444;
  font-family: monospace;
  max-height: 200px;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 0.3s ease;

  &.visible {
    transform: translateY(0);
  }
`;

const ErrorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ErrorType = styled.span<{ type: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: ${props => {
    switch (props.type) {
      case 'SyntaxError':
        return 'rgba(255, 165, 0, 0.2)';
      case 'TypeError':
        return 'rgba(255, 0, 0, 0.2)';
      case 'ReferenceError':
        return 'rgba(255, 0, 255, 0.2)';
      default:
        return 'rgba(255, 0, 0, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'SyntaxError':
        return '#ffa500';
      case 'TypeError':
        return '#ff0000';
      case 'ReferenceError':
        return '#ff00ff';
      default:
        return '#ff0000';
    }
  }};
`;

const ErrorMessage = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ErrorLine = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
  display: flex;
  gap: 1rem;
`;

const LineNumber = styled.span`
  color: #666;
  user-select: none;
`;

const ErrorHistory = styled.div`
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 0, 0, 0.2);
  padding-top: 1rem;
`;

const HistoryTitle = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #666;
`;

const HistoryItem = styled.div`
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: rgba(255, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 0, 0, 0.1);
  }
`;

const ClearErrorButton = styled.button`
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 0, 0, 0.2);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface ErrorInfo {
  message: string;
  stack?: string;
  type: string;
  timestamp: Date;
  lineNumber?: number;
}

type EditorType = 'html' | 'css' | 'javascript';

const defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>
</head>
<body>
  <h1>Hello World!</h1>
  <p>Welcome to the Online Code Editor</p>
  <div class="container">
    <button class="btn">Click me!</button>
  </div>
</body>
</html>`;

const defaultCss = `body {
  font-family: Arial, sans-serif;
  margin: 20px;
  background-color: #f5f5f5;
}

.container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  background-color: #61dafb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  background-color: #764abc;
  transform: scale(1.05);
}`;

const defaultJs = `document.querySelector('.btn').addEventListener('click', () => {
  alert('Button clicked!');
});`;

interface Template {
  name: string;
  html: string;
  css: string;
  js: string;
}

const templates: Template[] = [
  {
    name: 'Basic Template',
    html: defaultHtml,
    css: defaultCss,
    js: defaultJs
  },
  {
    name: 'Counter App',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Counter App</title>
</head>
<body>
  <div class="counter-container">
    <h1>Counter App</h1>
    <div class="counter">0</div>
    <div class="buttons">
      <button class="decrease">-</button>
      <button class="reset">Reset</button>
      <button class="increase">+</button>
    </div>
  </div>
</body>
</html>`,
    css: `body {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
}

.counter-container {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.counter {
  font-size: 4rem;
  font-weight: bold;
  margin: 1rem 0;
  color: #333;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.increase {
  background-color: #4CAF50;
  color: white;
}

.decrease {
  background-color: #f44336;
  color: white;
}

.reset {
  background-color: #2196F3;
  color: white;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}`,
    js: `let count = 0;
const counter = document.querySelector('.counter');
const increaseBtn = document.querySelector('.increase');
const decreaseBtn = document.querySelector('.decrease');
const resetBtn = document.querySelector('.reset');

function updateCounter() {
  counter.textContent = count;
}

increaseBtn.addEventListener('click', () => {
  count++;
  updateCounter();
});

decreaseBtn.addEventListener('click', () => {
  count--;
  updateCounter();
});

resetBtn.addEventListener('click', () => {
  count = 0;
  updateCounter();
});`
  },
  {
    name: 'Todo List',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Todo List</title>
</head>
<body>
  <div class="todo-container">
    <h1>Todo List</h1>
    <div class="input-container">
      <input type="text" placeholder="Add a new task...">
      <button class="add-btn">Add</button>
    </div>
    <ul class="todo-list"></ul>
  </div>
</body>
</html>`,
    css: `body {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
}

.todo-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.add-btn {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background-color: #45a049;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.todo-item.completed {
  background-color: #e9ecef;
  text-decoration: line-through;
  color: #6c757d;
}

.todo-item input[type="checkbox"] {
  margin-right: 0.75rem;
}

.delete-btn {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background-color: #c82333;
}`,
    js: `const input = document.querySelector('input');
const addBtn = document.querySelector('.add-btn');
const todoList = document.querySelector('.todo-list');

function createTodoItem(text) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  
  const span = document.createElement('span');
  span.textContent = text;
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  
  checkbox.addEventListener('change', () => {
    li.classList.toggle('completed');
  });
  
  deleteBtn.addEventListener('click', () => {
    li.remove();
  });
  
  return li;
}

addBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (text) {
    todoList.appendChild(createTodoItem(text));
    input.value = '';
  }
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addBtn.click();
  }
});`
  }
];

function App() {
  const [html, setHtml] = useState(defaultHtml);
  const [css, setCss] = useState(defaultCss);
  const [js, setJs] = useState(defaultJs);
  const [previewContent, setPreviewContent] = useState('');
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);
  const [errorHistory, setErrorHistory] = useState<ErrorInfo[]>([]);
  const [activeTab, setActiveTab] = useState<EditorType>('html');
  const [layout, setLayout] = useState<'side-by-side' | 'full-preview'>('side-by-side');
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  // Load code from URL parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedHtml = params.get('html');
    const sharedCss = params.get('css');
    const sharedJs = params.get('js');

    if (sharedHtml && sharedCss && sharedJs) {
      setHtml(decodeURIComponent(sharedHtml));
      setCss(decodeURIComponent(sharedCss));
      setJs(decodeURIComponent(sharedJs));
    }
  }, []);

  const handleTemplateChange = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setHtml(template.html);
      setCss(template.css);
      setJs(template.js);
    }
  };

  const handleShare = () => {
    const params = new URLSearchParams({
      html: encodeURIComponent(html),
      css: encodeURIComponent(css),
      js: encodeURIComponent(js)
    });
    
    // Use the deployed URL for sharing
    const deployedUrl = 'https://yourusername.github.io/online-code-editor/';
    const shareUrl = `${deployedUrl}?${params.toString()}`;
    
    // Create a temporary input element to copy the URL
    const tempInput = document.createElement('input');
    tempInput.value = shareUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // Show a more informative message
    alert('Share URL copied to clipboard! You can now share this URL with anyone, and they can open it on any device.');
  };

  const getPreviewContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (error) {
              window.parent.postMessage({
                type: 'error',
                error: {
                  message: error.message,
                  stack: error.stack,
                  type: error.name,
                  lineNumber: error.lineNumber
                }
              }, '*');
            }
          </script>
        </body>
      </html>
    `;
  };

  const handleRun = () => {
    setCurrentError(null);
    setPreviewContent(getPreviewContent());
    setLastRunTime(new Date());
  };

  const handlePreviewLoad = () => {
    if (previewFrameRef.current) {
      previewFrameRef.current.contentWindow?.addEventListener('error', (event) => {
        const errorInfo: ErrorInfo = {
          message: event.message,
          stack: event.error?.stack,
          type: event.error?.name || 'Error',
          timestamp: new Date(),
          lineNumber: event.error?.lineNumber
        };
        setCurrentError(errorInfo);
        setErrorHistory(prev => [errorInfo, ...prev].slice(0, 5));
      });

      window.addEventListener('message', (event) => {
        if (event.data.type === 'error') {
          const errorInfo: ErrorInfo = {
            ...event.data.error,
            timestamp: new Date()
          };
          setCurrentError(errorInfo);
          setErrorHistory(prev => [errorInfo, ...prev].slice(0, 5));
        }
      });
    }
  };

  const clearError = () => {
    setCurrentError(null);
  };

  const loadErrorFromHistory = (error: ErrorInfo) => {
    setCurrentError(error);
  };

  const getEditorContent = () => {
    switch (activeTab) {
      case 'html':
        return html;
      case 'css':
        return css;
      case 'javascript':
        return js;
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    switch (activeTab) {
      case 'html':
        setHtml(value || '');
        break;
      case 'css':
        setCss(value || '');
        break;
      case 'javascript':
        setJs(value || '');
        break;
    }
  };

  const getEditorLanguage = () => {
    switch (activeTab) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'javascript':
        return 'javascript';
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>Online Code Editor</Title>
        <ButtonContainer>
          <TemplateSelect onChange={(e) => handleTemplateChange(e.target.value)}>
            <option value="">Select Template</option>
            {templates.map((template) => (
              <option key={template.name} value={template.name}>
                {template.name}
              </option>
            ))}
          </TemplateSelect>
          <ShareButton onClick={handleShare}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </ShareButton>
          <LayoutButton onClick={() => setLayout(layout === 'side-by-side' ? 'full-preview' : 'side-by-side')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {layout === 'side-by-side' ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </>
              )}
            </svg>
            {layout === 'side-by-side' ? 'Full Preview' : 'Side by Side'}
          </LayoutButton>
          <StatusMessage>
            {lastRunTime && (
              <>
                <span>Last run: {lastRunTime.toLocaleTimeString()}</span>
              </>
            )}
          </StatusMessage>
          <RunButton onClick={handleRun}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
            Run Code
          </RunButton>
        </ButtonContainer>
      </Header>
      <EditorContainer layout={layout}>
        <EditorPanel layout={layout}>
          <TabContainer>
            <Tab 
              active={activeTab === 'html'} 
              onClick={() => setActiveTab('html')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4V4z" />
                <path d="M7 7h10M7 12h10M7 17h6" />
              </svg>
              HTML
            </Tab>
            <Tab 
              active={activeTab === 'css'} 
              onClick={() => setActiveTab('css')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4V4z" />
                <path d="M7 7h10M7 12h10M7 17h6" />
              </svg>
              CSS
            </Tab>
            <Tab 
              active={activeTab === 'javascript'} 
              onClick={() => setActiveTab('javascript')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4V4z" />
                <path d="M7 7h10M7 12h10M7 17h6" />
              </svg>
              JavaScript
            </Tab>
          </TabContainer>
          <EditorWrapper data-language={activeTab.toUpperCase()}>
            <Editor
              height="100%"
              language={getEditorLanguage()}
              value={getEditorContent()}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </EditorWrapper>
        </EditorPanel>
        <PreviewPanel layout={layout}>
          <PreviewFrame
            ref={previewFrameRef}
            srcDoc={previewContent}
            title="preview"
            sandbox="allow-scripts"
            onLoad={handlePreviewLoad}
          />
          <ErrorContainer className={currentError ? 'visible' : ''}>
            {currentError && (
              <>
                <ErrorHeader>
                  <ErrorTitle>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Error
                    <ErrorType type={currentError.type}>{currentError.type}</ErrorType>
                  </ErrorTitle>
                  <ClearErrorButton onClick={clearError}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </ClearErrorButton>
                </ErrorHeader>
                <ErrorMessage>{currentError.message}</ErrorMessage>
                {currentError.stack && (
                  <ErrorLine>
                    {currentError.lineNumber && (
                      <LineNumber>Line {currentError.lineNumber}:</LineNumber>
                    )}
                    <ErrorMessage>{currentError.stack}</ErrorMessage>
                  </ErrorLine>
                )}
                {errorHistory.length > 1 && (
                  <ErrorHistory>
                    <HistoryTitle>Error History</HistoryTitle>
                    {errorHistory.slice(1).map((error, index) => (
                      <HistoryItem key={index} onClick={() => loadErrorFromHistory(error)}>
                        <ErrorType type={error.type}>{error.type}</ErrorType>
                        <ErrorMessage>{error.message}</ErrorMessage>
                      </HistoryItem>
                    ))}
                  </ErrorHistory>
                )}
              </>
            )}
          </ErrorContainer>
        </PreviewPanel>
      </EditorContainer>
    </AppContainer>
  );
}

export default App; 