import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  // 1. Register Webview Panel Command (Open as Editor Panel)
  let disposable = vscode.commands.registerCommand('extension-clock.openClock', () => {
    ZenClockPanel.createOrShow(context.extensionUri);
  });
  context.subscriptions.push(disposable);

  // 2. Register Webview View Provider (Sidebar View)
  const provider = new ZenClockViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('zen-clock-sidebar', provider)
  );
}

export function deactivate() {}

class ZenClockPanel {
  public static currentPanel: ZenClockPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ZenClockPanel.currentPanel) {
      ZenClockPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'zenClock',
      'Zen Flip Clock',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'dist')
        ]
      }
    );

    ZenClockPanel.currentPanel = new ZenClockPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._setupMessageListener();
  }

  private _setupMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        handleWebviewMessage(message);
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    ZenClockPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.title = 'Zen Flip Clock';
    this._panel.webview.html = getWebviewContent(webview, this._extensionUri);
  }
}

class ZenClockViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'dist')
      ]
    };

    webviewView.webview.html = getWebviewContent(webviewView.webview, this._extensionUri);

    webviewView.webview.onDidReceiveMessage((message) => {
      handleWebviewMessage(message);
    });
  }
}

function handleWebviewMessage(message: any) {
  switch (message.type) {
    case 'SHOW_NOTIFICATION':
      if (message.level === 'info') {
        vscode.window.showInformationMessage(message.text);
      } else if (message.level === 'warning') {
        vscode.window.showWarningMessage(message.text);
      }
      break;
  }
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const distPath = vscode.Uri.joinPath(extensionUri, 'dist');
  const htmlPath = path.join(distPath.fsPath, 'index.html');

  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Replace all absolute paths /assets/... & /webview.js to vscode-webview:// URIs
    html = html.replace(/(href|src)="\/(.*?)"/g, (match, attr, relativePath) => {
      const resourceUri = webview.asWebviewUri(vscode.Uri.joinPath(distPath, relativePath));
      return `${attr}="${resourceUri}"`;
    });

    return html;
  }

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Zen Flip Clock</title>
  </head>
  <body>
    <h3>Zen Flip Clock</h3>
    <p>Please build the extension first by running <code>npm run build</code>.</p>
  </body>
  </html>`;
}
