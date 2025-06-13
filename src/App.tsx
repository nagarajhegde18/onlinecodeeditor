import { useState, useRef } from 'react';
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